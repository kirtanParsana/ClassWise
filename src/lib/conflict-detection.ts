import type { ScheduleEntry, Course, Room } from "@/lib/types";

export type ConflictSeverity = "critical" | "warning";

export interface DetectedConflict {
  id: string;
  type: "Faculty Overlap" | "Room Double Booking" | "Section Overlap" | "Resource Mismatch";
  severity: ConflictSeverity;
  description: string;
  involved: string[];
  entries: ScheduleEntry[];
}

export function detectConflicts(
  schedule: ScheduleEntry[],
  courses: Course[] = [],
  rooms: Room[] = []
): DetectedConflict[] {
  const conflicts: DetectedConflict[] = [];
  const courseById = new Map(courses.map((c) => [c.id, c]));
  const roomById = new Map(rooms.map((r) => [r.id, r]));

  const facultyMap = new Map<string, ScheduleEntry>();
  const roomMap = new Map<string, ScheduleEntry>();
  const sectionMap = new Map<string, ScheduleEntry>();

  for (const entry of schedule) {
    const slotKey = `${entry.day}|${entry.timeslot}`;

    const facultyKey = `${entry.facultyId}|${slotKey}`;
    if (facultyMap.has(facultyKey)) {
      const existing = facultyMap.get(facultyKey)!;
      conflicts.push({
        id: `faculty-${facultyKey}-${entry.section}`,
        type: "Faculty Overlap",
        severity: "critical",
        description: `Faculty assigned to multiple classes on ${entry.day} at ${entry.timeslot}`,
        involved: [entry.facultyId, entry.section, existing.section],
        entries: [existing, entry],
      });
    } else {
      facultyMap.set(facultyKey, entry);
    }

    const roomKey = `${entry.roomId}|${slotKey}`;
    if (roomMap.has(roomKey)) {
      const existing = roomMap.get(roomKey)!;
      conflicts.push({
        id: `room-${roomKey}`,
        type: "Room Double Booking",
        severity: "critical",
        description: `Room double-booked on ${entry.day} at ${entry.timeslot}`,
        involved: [entry.roomId, entry.section, existing.section],
        entries: [existing, entry],
      });
    } else {
      roomMap.set(roomKey, entry);
    }

    const sectionKey = `${entry.section}|${slotKey}`;
    if (sectionMap.has(sectionKey)) {
      const existing = sectionMap.get(sectionKey)!;
      conflicts.push({
        id: `section-${sectionKey}`,
        type: "Section Overlap",
        severity: "critical",
        description: `Section ${entry.section} has overlapping classes on ${entry.day} at ${entry.timeslot}`,
        involved: [entry.section, entry.courseId, existing.courseId],
        entries: [existing, entry],
      });
    } else {
      sectionMap.set(sectionKey, entry);
    }

    const course = courseById.get(entry.courseId);
    const room = roomById.get(entry.roomId);
    if (course?.requiresLab && room && !room.isLab) {
      conflicts.push({
        id: `lab-${entry.courseId}-${entry.day}-${entry.timeslot}`,
        type: "Resource Mismatch",
        severity: "warning",
        description: `Lab course ${course.code} scheduled in non-lab room on ${entry.day} at ${entry.timeslot}`,
        involved: [course.code, room.name ?? entry.roomId],
        entries: [entry],
      });
    }
  }

  return conflicts;
}

export function countConflicts(conflicts: DetectedConflict[]) {
  const critical = conflicts.filter((c) => c.severity === "critical").length;
  const warnings = conflicts.filter((c) => c.severity === "warning").length;
  return { total: conflicts.length, critical, warnings };
}
