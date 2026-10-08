'use server';
/**
 * @fileOverview This file defines a rule-based algorithm for generating a complete academic timetable.
 * It takes into account courses, faculty, rooms, sections, and time constraints to produce a
 * conflict-free schedule using constraint satisfaction and greedy allocation.
 */

import { z } from 'zod';

const CourseSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  credits: z.number(),
  facultyId: z.string(),
  requiresLab: z.boolean(),
});

const FacultySchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  department: z.string(),
  avatarUrl: z.string(),
  avatarHint: z.string(),
});

const RoomSchema = z.object({
  id: z.string(),
  name: z.string(),
  capacity: z.number(),
  isLab: z.boolean(),
});

const TimeslotSchema = z.object({
  id: z.string(),
  name: z.string(),
  day: z.string(),
  order: z.number(),
});

const GenerateTimetableInputSchema = z.object({
  courses: z.array(CourseSchema).describe('List of all available courses.'),
  faculty: z.array(FacultySchema).describe('List of all available faculty members.'),
  rooms: z.array(RoomSchema).describe('List of all available rooms and labs.'),
  sections: z.array(z.string()).describe('List of sections to generate timetable for (e.g., ["A", "B"]).'),
  timeslots: z.array(TimeslotSchema).describe('List of available time slots, each with a day and order.'),
  days: z.array(z.string()).describe('List of working days (e.g., ["Monday", "Friday"]).'),
});

const DayEnum = z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);

const ScheduleEntrySchema = z.object({
  courseId: z.string(),
  roomId: z.string(),
  facultyId: z.string(),
  day: DayEnum,
  timeslot: z.string(),
  section: z.string(),
});

const GenerateTimetableOutputSchema = z.object({
  schedule: z.array(ScheduleEntrySchema).describe('The generated timetable as an array of schedule entries.'),
});

export type GenerateTimetableInput = z.infer<typeof GenerateTimetableInputSchema>;
export type GenerateTimetableOutput = z.infer<typeof GenerateTimetableOutputSchema>;

type Day = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";

interface Timeslot {
  id: string;
  name: string;
  day: Day;
  order: number;
}

interface Course {
  id: string;
  name: string;
  code: string;
  credits: number;
  facultyId: string;
  requiresLab: boolean;
}

interface Room {
  id: string;
  name: string;
  capacity: number;
  isLab: boolean;
}

interface ScheduleEntry {
  courseId: string;
  roomId: string;
  facultyId: string;
  day: Day;
  timeslot: string;
  section: string;
}

/**
 * Rule-based timetable generator using constraint satisfaction
 */
export async function generateTimetable(input: GenerateTimetableInput): Promise<GenerateTimetableOutput> {
  const { courses, faculty, rooms, sections, timeslots, days } = input;

  const shuffle = <T,>(items: T[]): T[] => {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  console.log("📊 Timetable generation started", {
    courses: courses.length,
    faculty: faculty.length,
    rooms: rooms.length,
    sections: sections.length,
    timeslots: timeslots.length,
    days: days.length,
  });

  // Validate input
  if (!courses.length || !faculty.length || !rooms.length || !sections.length || !timeslots.length) {
    throw new Error("Missing required data for timetable generation");
  }

  // Normalize day names for matching (case-insensitive)
  const normalizeDay = (day: string): Day => {
    const normalized = day.trim();
    const dayMap: Record<string, Day> = {
      'monday': 'Monday',
      'tuesday': 'Tuesday',
      'wednesday': 'Wednesday',
      'thursday': 'Thursday',
      'friday': 'Friday',
    };
    return dayMap[normalized.toLowerCase()] || normalized as Day;
  };

  /**
   * Ensure that for a given subject (course code) and section,
   * we always use the same faculty member – even if multiple
   * courses exist with the same code but different facultyIds.
   */
  const facultyForSubjectSection = new Map<string, string>();

  const getFacultyForCourseSection = (course: Course, section: string): string => {
    const key = `${course.code}|${section}`;
    const existing = facultyForSubjectSection.get(key);
    if (existing) return existing;

    const chosen = course.facultyId;
    facultyForSubjectSection.set(key, chosen);
    return chosen;
  };

  // Filter rooms by type
  const labRooms = rooms.filter(r => r.isLab);
  const classroomRooms = rooms.filter(r => !r.isLab);

  console.log("🏫 Room distribution", {
    labRooms: labRooms.length,
    classroomRooms: classroomRooms.length,
  });

  if (labRooms.length === 0 && courses.some(c => c.requiresLab)) {
    throw new Error("No lab rooms available for lab courses");
  }
  if (classroomRooms.length === 0 && courses.some(c => !c.requiresLab)) {
    throw new Error("No classroom rooms available for classroom courses");
  }

  const schedule: ScheduleEntry[] = [];
  
  // Track usage: key = "day|timeslot", value = Set of used resources
  const usage = new Map<string, {
    faculty: Set<string>;
    rooms: Set<string>;
    sections: Set<string>;
  }>();

  // Normalize and initialize usage tracking
  const normalizedTimeslots = timeslots.map(ts => ({
    ...ts,
    day: normalizeDay(ts.day),
  }));

  // Validate timeslots have required fields
  const invalidTimeslots = normalizedTimeslots.filter(ts => !ts.day || !ts.name);
  if (invalidTimeslots.length > 0) {
    console.warn("⚠️ Found invalid timeslots:", invalidTimeslots.length);
  }

  normalizedTimeslots.forEach(ts => {
    const key = `${ts.day}|${ts.name}`;
    if (!usage.has(key)) {
      usage.set(key, {
        faculty: new Set(),
        rooms: new Set(),
        sections: new Set(),
      });
    }
  });

  // console.log("⏰ Initialized usage tracking for", usage.size, "unique timeslots");

  // Group timeslots by day and sort by order
  const timeslotsByDay = new Map<Day, Timeslot[]>();
  const normalizedDays = days.map(d => normalizeDay(d)) as Day[];
  
  normalizedDays.forEach(day => {
    const daySlots = normalizedTimeslots
      .filter(ts => ts.day === day)
      .sort((a, b) => a.order - b.order);
    timeslotsByDay.set(day, daySlots);
    // console.log(`📅 ${day}: ${daySlots.length} timeslots`, daySlots.length > 0 ? `(e.g., ${daySlots[0]?.name})` : '');
  });

  // Check if we have timeslots for any day
  const totalDaySlots = Array.from(timeslotsByDay.values()).reduce((sum, slots) => sum + slots.length, 0);
  if (totalDaySlots === 0) {
    throw new Error(`No timeslots found for any day. Timeslots provided: ${timeslots.length}, Days: ${days.join(', ')}`);
  }

  // Generate schedule entries for each course-section combination
  for (const course of [...courses].sort((a, b) => {
    if (a.requiresLab !== b.requiresLab) {
      return a.requiresLab ? -1 : 1;
    }
    return b.credits - a.credits;
  })) {
    // Note: faculty may be shared across multiple course rows with the same code.
    // We will resolve the effective faculty per (course.code, section) below.

    // Get appropriate rooms
    const availableRooms = course.requiresLab ? labRooms : classroomRooms;
    if (availableRooms.length === 0) {
      console.warn(`⚠️ No available rooms for course ${course.code}, skipping`);
      continue;
    }

    // console.log(`📚 Processing course: ${course.code} (${course.name}) - ${course.requiresLab ? 'Lab' : 'Classroom'}, Credits: ${course.credits}`);

    for (const section of [...sections].sort((a, b) => a.localeCompare(b))) {
      // console.log(`  📖 Section: ${section}`);
      // Resolve the single faculty that will teach this subject in this section
      const effectiveFacultyId = getFacultyForCourseSection(course, section);
      const courseFaculty = faculty.find(f => f.id === effectiveFacultyId);
      if (!courseFaculty) {
        console.warn(
          `⚠️ Faculty not found for course ${course.code} in section ${section} (facultyId: ${effectiveFacultyId}), skipping`
        );
        continue;
      }

      if (course.requiresLab) {
        // Lab courses: schedule credits number of 2-hour blocks.
        // 1 lab credit = exactly one 2-slot consecutive block on the same day.
        let labBlocksScheduled = 0;
        
        const normalizedDays = shuffle(days.map(d => normalizeDay(d)) as Day[]);
        for (const day of normalizedDays) {
          if (labBlocksScheduled >= course.credits) break;
          
          // Keep chronological order for lab pairing so "consecutive" is real.
          const daySlots = [...(timeslotsByDay.get(day) || [])].sort(
            (a, b) => a.order - b.order
          );
          
          // Try to find consecutive timeslots for a 2-hour lab block
          for (let i = 0; i < daySlots.length - 1; i++) {
            if (labBlocksScheduled >= course.credits) break;
            
            const slot1 = daySlots[i];
            const slot2 = daySlots[i + 1];

            // Ensure slots are truly consecutive in the daily sequence.
            if (slot2.order <= slot1.order) {
              continue;
            }
            
            // Check if both slots are available for this faculty, section, and a room
            const key1 = `${day}|${slot1.name}`;
            const key2 = `${day}|${slot2.name}`;
            
            let usage1 = usage.get(key1);
            let usage2 = usage.get(key2);
            
            // Initialize if not exists
            if (!usage1) {
              usage1 = { faculty: new Set(), rooms: new Set(), sections: new Set() };
              usage.set(key1, usage1);
            }
            if (!usage2) {
              usage2 = { faculty: new Set(), rooms: new Set(), sections: new Set() };
              usage.set(key2, usage2);
            }
            
            // Check constraints
            if (
              usage1.faculty.has(effectiveFacultyId) ||
              usage2.faculty.has(effectiveFacultyId) ||
              usage1.sections.has(section) ||
              usage2.sections.has(section)
            ) {
              continue; // Conflict, try next pair
            }
            
            // Find an available room for both slots
            let assignedRoom: Room | null = null;
            for (const room of shuffle(availableRooms)) {
              if (!usage1.rooms.has(room.id) && !usage2.rooms.has(room.id)) {
                assignedRoom = room;
                break;
              }
            }
            
            if (assignedRoom) {
              // Schedule both timeslots
              schedule.push({
                courseId: course.id,
                roomId: assignedRoom.id,
                facultyId: effectiveFacultyId,
                day: day,
                timeslot: slot1.name,
                section: section,
              });
              
              schedule.push({
                courseId: course.id,
                roomId: assignedRoom.id,
                facultyId: effectiveFacultyId,
                day: day,
                timeslot: slot2.name,
                section: section,
              });
              
              // Update usage tracking
              usage1.faculty.add(effectiveFacultyId);
              usage1.rooms.add(assignedRoom.id);
              usage1.sections.add(section);
              
              usage2.faculty.add(effectiveFacultyId);
              usage2.rooms.add(assignedRoom.id);
              usage2.sections.add(section);
              
              labBlocksScheduled++;
            }
          }
        }
        
        // If we couldn't schedule all lab blocks, try scheduling remaining as single slots
        // (fallback to ensure we schedule something)
        if (labBlocksScheduled < course.credits) {
          console.warn(`⚠️ Could not schedule all ${course.credits} lab blocks for ${course.code} section ${section}, scheduled ${labBlocksScheduled}`);
        } else {
          // console.log(`  ✅ Scheduled ${labBlocksScheduled} lab blocks for ${course.code} section ${section}`);
        }
      } else {
        // Classroom courses: schedule credits number of 1-hour lectures
        let lecturesScheduled = 0;
        
        // Try all days and timeslots to find available slots
        const normalizedDays = shuffle(days.map(d => normalizeDay(d)) as Day[]);
        let attempts = 0;
        const maxAttempts = normalizedDays.length * normalizedTimeslots.length * 2;
        
        // Iterate through all days in a round-robin fashion
        for (let dayRound = 0; dayRound < normalizedDays.length * 2 && lecturesScheduled < course.credits; dayRound++) {
          const day = normalizedDays[dayRound % normalizedDays.length];
          const daySlots = shuffle(timeslotsByDay.get(day) || []);
          
          if (daySlots.length === 0) {
            console.warn(`  ⚠️ No timeslots found for day ${day}`);
            continue;
          }
          
          // Try each slot in this day
          for (const slot of daySlots) {
            if (lecturesScheduled >= course.credits) break;
            attempts++;
            
            if (attempts > maxAttempts) {
              console.warn(`  ⚠️ Max attempts reached for ${course.code} section ${section}`);
              break;
            }
            
            const key = `${day}|${slot.name}`;
            let slotUsage = usage.get(key);
            
            // Initialize if not exists (shouldn't happen, but safety check)
            if (!slotUsage) {
              slotUsage = {
                faculty: new Set(),
                rooms: new Set(),
                sections: new Set(),
              };
              usage.set(key, slotUsage);
            }
            
            // Check constraints
            if (
              slotUsage.faculty.has(effectiveFacultyId) ||
              slotUsage.sections.has(section)
            ) {
              continue; // Conflict, try next slot
            }
            
            // Find an available room
            let assignedRoom: Room | null = null;
            for (const room of shuffle(availableRooms)) {
              if (!slotUsage.rooms.has(room.id)) {
                assignedRoom = room;
                break;
              }
            }
            
            if (assignedRoom) {
              schedule.push({
                courseId: course.id,
                roomId: assignedRoom.id,
                facultyId: effectiveFacultyId,
                day: day,
                timeslot: slot.name,
                section: section,
              });
              
              // Update usage tracking
              slotUsage.faculty.add(effectiveFacultyId);
              slotUsage.rooms.add(assignedRoom.id);
              slotUsage.sections.add(section);
              
              lecturesScheduled++;
              // Continue to next slot (don't break, allow multiple lectures per day if needed)
            }
          }
        }
        
        if (lecturesScheduled > 0) {
          // console.log(`  ✅ Scheduled ${lecturesScheduled}/${course.credits} lectures for ${course.code} section ${section}`);
        } else {
          console.warn(`  ⚠️ Could not schedule any lectures for ${course.code} section ${section}`);
        }
      }
    }
  }

  console.log("📋 Schedule generation complete", { totalEntries: schedule.length });

  if (schedule.length === 0) {
    const errorMsg = "Failed to generate any schedule entries. Please check your constraints and available resources.";
    console.error("❌", errorMsg);
    console.error("Debug info:", {
      coursesCount: courses.length,
      timeslotsCount: timeslots.length,
      timeslotsByDayCount: Array.from(timeslotsByDay.entries()).map(([day, slots]) => `${day}: ${slots.length}`),
      roomsCount: rooms.length,
      sectionsCount: sections.length,
    });
    throw new Error(errorMsg);
  }

  return { schedule };
}
