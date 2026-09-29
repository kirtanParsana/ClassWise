import type {
  Course,
  Faculty,
  Room,
  Section,
  ScheduleEntry,
  Timeslot,
} from "@/lib/types";

export type ValidationSeverity = "error" | "warning";

export interface TimetableValidationIssue {
  code:
    | "INVALID_COURSE"
    | "INVALID_FACULTY"
    | "INVALID_ROOM"
    | "INVALID_SECTION"
    | "INVALID_DAY"
    | "INVALID_TIMESLOT"
    | "RESOURCE_MISMATCH"
    | "ROOM_CAPACITY"
    | "DUPLICATE_ENTRY"
    | "INCOMPLETE_COURSE"
    | "INVALID_CREDITS";

  severity: ValidationSeverity;
  message: string;
  entry?: ScheduleEntry;
  courseId?: string;
  section?: string;
}

export interface TimetableValidationResult {
  valid: boolean;
  errors: TimetableValidationIssue[];
  warnings: TimetableValidationIssue[];
  checkedEntries: number;
}

interface TimetableValidationInput {
  schedule: ScheduleEntry[];
  courses: Course[];
  faculty: Faculty[];
  rooms: Room[];
  sections: Section[];
  timeslots: Timeslot[];
  days: string[];
}

/**
 * Validates a generated timetable against hard resource
 * and completeness constraints.
 *
 * Collision detection such as faculty/room/section overlap
 * remains handled by detectConflicts().
 */
export function validateTimetable({
  schedule,
  courses,
  faculty,
  rooms,
  sections,
  timeslots,
  days,
}: TimetableValidationInput): TimetableValidationResult {
  const errors: TimetableValidationIssue[] = [];
  const warnings: TimetableValidationIssue[] = [];

  const courseById = new Map(courses.map((course) => [course.id, course]));
  const facultyById = new Map(faculty.map((member) => [member.id, member]));
  const roomById = new Map(rooms.map((room) => [room.id, room]));
  const sectionByName = new Map(
    sections.map((section) => [section.name, section])
  );

  const validDays = new Set(days);

  const validTimeslots = new Set(
    timeslots.map(
      (timeslot) => `${timeslot.day}|${timeslot.name}`
    )
  );

  /**
   * Used to detect the exact same assignment being inserted twice.
   */
  const entryKeys = new Set<string>();

  /**
   * Count scheduled periods for every course-section combination.
   *
   * Classroom:
   *   1 credit = 1 timetable slot
   *
   * Lab:
   *   1 credit = 2 timetable slots
   */
  const scheduledPeriods = new Map<string, number>();

  for (const entry of schedule) {
    const course = courseById.get(entry.courseId);
    const facultyMember = facultyById.get(entry.facultyId);
    const room = roomById.get(entry.roomId);
    const section = sectionByName.get(entry.section);

    /*
     * ---------------------------------------------------------
     * 1. Validate references
     * ---------------------------------------------------------
     */

    if (!course) {
      errors.push({
        code: "INVALID_COURSE",
        severity: "error",
        message: `Schedule references unknown course "${entry.courseId}".`,
        entry,
        courseId: entry.courseId,
        section: entry.section,
      });
    }

    if (!facultyMember) {
      errors.push({
        code: "INVALID_FACULTY",
        severity: "error",
        message: `Schedule references unknown faculty "${entry.facultyId}".`,
        entry,
        courseId: entry.courseId,
        section: entry.section,
      });
    }

    if (!room) {
      errors.push({
        code: "INVALID_ROOM",
        severity: "error",
        message: `Schedule references unknown room "${entry.roomId}".`,
        entry,
        courseId: entry.courseId,
        section: entry.section,
      });
    }

    if (!section) {
      errors.push({
        code: "INVALID_SECTION",
        severity: "error",
        message: `Schedule references unknown section "${entry.section}".`,
        entry,
        courseId: entry.courseId,
        section: entry.section,
      });
    }

    /*
     * ---------------------------------------------------------
     * 2. Validate day
     * ---------------------------------------------------------
     */

    if (!validDays.has(entry.day)) {
      errors.push({
        code: "INVALID_DAY",
        severity: "error",
        message: `Invalid working day "${entry.day}".`,
        entry,
        courseId: entry.courseId,
        section: entry.section,
      });
    }

    /*
     * ---------------------------------------------------------
     * 3. Validate timeslot
     * ---------------------------------------------------------
     */

    const timeslotKey = `${entry.day}|${entry.timeslot}`;

    if (!validTimeslots.has(timeslotKey)) {
      errors.push({
        code: "INVALID_TIMESLOT",
        severity: "error",
        message: `Invalid timeslot "${entry.timeslot}" on ${entry.day}.`,
        entry,
        courseId: entry.courseId,
        section: entry.section,
      });
    }

    /*
     * ---------------------------------------------------------
     * 4. Detect exact duplicate entries
     * ---------------------------------------------------------
     */

    const entryKey = [
      entry.courseId,
      entry.facultyId,
      entry.roomId,
      entry.section,
      entry.day,
      entry.timeslot,
    ].join("|");

    if (entryKeys.has(entryKey)) {
      errors.push({
        code: "DUPLICATE_ENTRY",
        severity: "error",
        message:
          `Duplicate schedule entry for course "${entry.courseId}", ` +
          `section "${entry.section}", ${entry.day} ${entry.timeslot}.`,
        entry,
        courseId: entry.courseId,
        section: entry.section,
      });
    } else {
      entryKeys.add(entryKey);
    }

    /*
     * ---------------------------------------------------------
     * The remaining checks require valid master data.
     * ---------------------------------------------------------
     */

    if (!course || !room || !section) {
      continue;
    }

    /*
     * ---------------------------------------------------------
     * 5. Validate room type
     * ---------------------------------------------------------
     */

    if (course.requiresLab && !room.isLab) {
      errors.push({
        code: "RESOURCE_MISMATCH",
        severity: "error",
        message:
          `Lab course "${course.code}" is assigned to non-lab room "${room.name}".`,
        entry,
        courseId: course.id,
        section: section.name,
      });
    }

    if (!course.requiresLab && room.isLab) {
      warnings.push({
        code: "RESOURCE_MISMATCH",
        severity: "warning",
        message:
          `Classroom course "${course.code}" is using lab room "${room.name}".`,
        entry,
        courseId: course.id,
        section: section.name,
      });
    }

    /*
     * ---------------------------------------------------------
     * 6. Validate room capacity
     * ---------------------------------------------------------
     */

    if (section.strength > room.capacity) {
      errors.push({
        code: "ROOM_CAPACITY",
        severity: "error",
        message:
          `Room "${room.name}" has capacity ${room.capacity}, ` +
          `but section "${section.name}" has ${section.strength} students.`,
        entry,
        courseId: course.id,
        section: section.name,
      });
    }

    /*
     * ---------------------------------------------------------
     * 7. Count scheduled periods
     * ---------------------------------------------------------
     */

    const courseSectionKey = `${course.id}|${section.name}`;

    scheduledPeriods.set(
      courseSectionKey,
      (scheduledPeriods.get(courseSectionKey) ?? 0) + 1
    );
  }

  /*
   * ---------------------------------------------------------
   * 8. Validate course credit values
   * ---------------------------------------------------------
   */

  for (const course of courses) {
    if (!Number.isInteger(course.credits) || course.credits <= 0) {
      errors.push({
        code: "INVALID_CREDITS",
        severity: "error",
        message:
          `Course "${course.code}" has invalid credits: ${course.credits}.`,
        courseId: course.id,
      });
    }
  }

  /*
   * ---------------------------------------------------------
   * 9. Validate required periods for every course-section
   * ---------------------------------------------------------
   */

  for (const course of courses) {
    if (!Number.isInteger(course.credits) || course.credits <= 0) {
      continue;
    }

    for (const section of sections) {
      const key = `${course.id}|${section.name}`;

      const actualPeriods = scheduledPeriods.get(key) ?? 0;

      /**
       * Classroom:
       *   credits × 1 slot
       *
       * Lab:
       *   credits × 2 slots
       */
      const requiredPeriods = course.requiresLab
        ? course.credits * 2
        : course.credits;

      if (actualPeriods < requiredPeriods) {
        errors.push({
          code: "INCOMPLETE_COURSE",
          severity: "error",
          message:
            `Course "${course.code}" for section "${section.name}" ` +
            `requires ${requiredPeriods} timetable slots but only ` +
            `${actualPeriods} were scheduled.`,
          courseId: course.id,
          section: section.name,
        });
      } else if (actualPeriods > requiredPeriods) {
        warnings.push({
          code: "INCOMPLETE_COURSE",
          severity: "warning",
          message:
            `Course "${course.code}" for section "${section.name}" ` +
            `requires ${requiredPeriods} timetable slots but ` +
            `${actualPeriods} were scheduled.`,
          courseId: course.id,
          section: section.name,
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    checkedEntries: schedule.length,
  };
}