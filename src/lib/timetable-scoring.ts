import type {
  Course,
  Faculty,
  Room,
  ScheduleEntry,
  Section,
  Timeslot,
} from "@/lib/types";

export interface TimetableScoreBreakdown {
  facultyWorkload: number;
  sectionBalance: number;
  roomUtilization: number;
  gapPenalty: number;
  distribution: number;
}

export interface TimetableScoreResult {
  score: number;
  quality: TimetableQuality;
  breakdown: TimetableScoreBreakdown;
  suggestions: string[];
}

export interface TimetableScoringInput {
  schedule: ScheduleEntry[];
  courses: Course[];
  faculty: Faculty[];
  rooms: Room[];
  sections: Section[];
  timeslots: Timeslot[];
}

export type TimetableQuality =
| "Excellent"
| "Good"
| "Fair"
| "Poor";

export function scoreTimetable({
  schedule,
  courses,
  faculty,
  rooms,
  sections,
  timeslots,
}: TimetableScoringInput): TimetableScoreResult {
  const facultyLoad = new Map<string, number>();

  for (const entry of schedule) {
    facultyLoad.set(
    entry.facultyId,
    (facultyLoad.get(entry.facultyId) ?? 0) + 1
    );
  }

  const loads = faculty.map(
  (member) => facultyLoad.get(member.id) ?? 0
  );

  const maxLoad = loads.length > 0 ? Math.max(...loads) : 0;
  const minLoad = loads.length > 0 ? Math.min(...loads) : 0;

  let facultyWorkload = 100;

  if (loads.length > 0 && maxLoad > 0) {
    const spread = maxLoad - minLoad;

    // Smaller workload difference = better score.
    facultyWorkload = Math.max(
    0,
    Math.round(100 - (spread / maxLoad) * 100)
    );
  }
  /*
  * ---------------------------------------------------------
  * SECTION BALANCE
  * ---------------------------------------------------------
  * Measures how evenly each section's classes are distributed
  * across the working days.
  *
  * A section with 12 periods across 5 days should ideally have
  * a reasonably balanced distribution rather than something like:
  *
  * Monday    = 6
  * Tuesday   = 1
  * Wednesday = 1
  * Thursday  = 2
  * Friday    = 2
  */

  const sectionDayLoad = new Map<string, Map<string, number>>();

  for (const section of sections) {
    sectionDayLoad.set(section.name, new Map());
  }

  for (const entry of schedule) {
    const dayLoad = sectionDayLoad.get(entry.section);

    if (!dayLoad) {
      continue;
    }

    dayLoad.set(
    entry.day,
    (dayLoad.get(entry.day) ?? 0) + 1
    );
  }

  const sectionScores: number[] = [];

  for (const section of sections) {
    const dayLoad = sectionDayLoad.get(section.name);

    if (!dayLoad) {
      continue;
    }

    const loads = timeslots.length > 0
    ? Array.from(
    new Set(timeslots.map((timeslot) => timeslot.day))
    ).map((day) => dayLoad.get(day) ?? 0)
    : [];

    if (loads.length === 0) {
      continue;
    }

    const total = loads.reduce((sum, value) => sum + value, 0);

    if (total === 0) {
      continue;
    }

    const average = total / loads.length;

    const deviation = loads.reduce(
    (sum, value) => sum + Math.abs(value - average),
    0
    ) / loads.length;

    const sectionScore = Math.max(
    0,
    Math.round(100 - (deviation / Math.max(average, 1)) * 100)
    );

    sectionScores.push(sectionScore);
  }

  const sectionBalance =
  sectionScores.length > 0
  ? Math.round(
  sectionScores.reduce((sum, score) => sum + score, 0) /
  sectionScores.length
  )
  : 100;

  /*
  * ---------------------------------------------------------
  * ROOM UTILIZATION
  * ---------------------------------------------------------
  * Measures how effectively available rooms are being used.
  *
  * We calculate:
  *   used room-time slots
  *   --------------------
  *   available room-time slots
  *
  * A room is counted only when it actually appears in the
  * generated timetable.
  */

  const usedRoomSlots = new Set<string>();

  for (const entry of schedule) {
    usedRoomSlots.add(
    `${entry.roomId}|${entry.day}|${entry.timeslot}`
    );
  }

  const totalAvailableRoomSlots =
  rooms.length * timeslots.length;

  const roomUtilization =
  totalAvailableRoomSlots > 0
  ? Math.min(
  100,
  Math.round(
  (usedRoomSlots.size / totalAvailableRoomSlots) * 100
  )
  )
  : 100;

  /*
  * ---------------------------------------------------------
  * GAP ANALYSIS
  * ---------------------------------------------------------
  * Measures unnecessary free periods between classes for each
  * section on each day.
  *
  * Example:
  *
  * Slot 1 = Class
  * Slot 2 = Free
  * Slot 3 = Class
  *
  * This creates one internal gap.
  */

  const timeslotOrder = new Map<string, number>();

  for (const timeslot of timeslots) {
    timeslotOrder.set(
    `${timeslot.day}|${timeslot.name}`,
    timeslot.order
    );
  }

  const sectionDaySlots = new Map<string, number[]>();

  for (const entry of schedule) {
    const order = timeslotOrder.get(
    `${entry.day}|${entry.timeslot}`
    );

    if (order === undefined) {
      continue;
    }

    const key = `${entry.section}|${entry.day}`;

    const scheduledOrders = sectionDaySlots.get(key) ?? [];

    scheduledOrders.push(order);

    sectionDaySlots.set(key, scheduledOrders);
  }

  let totalInternalGaps = 0;
  let totalPossiblePeriods = 0;

  for (const scheduledOrders of sectionDaySlots.values()) {
    const uniqueOrders = [...new Set(scheduledOrders)].sort(
    (a, b) => a - b
    );

    if (uniqueOrders.length < 2) {
      continue;
    }

    const firstOrder = uniqueOrders[0];
    const lastOrder = uniqueOrders[uniqueOrders.length - 1];

    const occupiedPeriods = uniqueOrders.length;

    const periodsBetween =
    lastOrder - firstOrder + 1;

    const internalGaps =
    periodsBetween - occupiedPeriods;

    totalInternalGaps += Math.max(0, internalGaps);
    totalPossiblePeriods += Math.max(
    1,
    periodsBetween - occupiedPeriods + occupiedPeriods
    );
  }

  const gapPenalty =
  totalPossiblePeriods > 0
  ? Math.max(
  0,
  Math.round(
  100 -
  (totalInternalGaps / totalPossiblePeriods) *
  100
  )
  )
  : 100;

  /*
  * ---------------------------------------------------------
  * COURSE DISTRIBUTION
  * ---------------------------------------------------------
  * Measures whether repeated sessions of the same course are
  * distributed across multiple days instead of clustered into
  * a single day.
  */

  const courseSectionDays = new Map<string, Set<string>>();

  for (const entry of schedule) {
    const key = `${entry.courseId}|${entry.section}`;

    const scheduledDays =
    courseSectionDays.get(key) ?? new Set<string>();

    scheduledDays.add(entry.day);

    courseSectionDays.set(key, scheduledDays);
  }

  const distributionScores: number[] = [];

  for (const course of courses) {
    for (const section of sections) {
      const key = `${course.id}|${section.name}`;

      const scheduledDays =
      courseSectionDays.get(key) ?? new Set<string>();

      const uniqueDays = scheduledDays.size;

      /*
      * Classroom courses:
      * Ideally spread sessions across as many days as possible.
      *
      * Lab courses:
      * A multi-slot lab block on one day is intentional, so
      * the number of credits represents the desired number of
      * separate lab days.
      */
      const idealDays = Math.min(
      course.credits,
      new Set(timeslots.map((timeslot) => timeslot.day)).size
      );

      if (idealDays <= 1) {
        distributionScores.push(100);
        continue;
      }

      const distributionScore = Math.min(
      100,
      Math.round(
      (uniqueDays / idealDays) * 100
      )
      );

      distributionScores.push(distributionScore);
    }
  }

  const distribution =
  distributionScores.length > 0
  ? Math.round(
  distributionScores.reduce(
  (sum, value) => sum + value,
  0
  ) / distributionScores.length
  )
  : 100;

  const breakdown: TimetableScoreBreakdown = {
    facultyWorkload,
    sectionBalance,
    roomUtilization,
    gapPenalty,
    distribution,
  };

  const score = Math.max(
  0,
  Math.min(
  100,
  Math.round(
  facultyWorkload * 0.25 +
  sectionBalance * 0.20 +
  roomUtilization * 0.15 +
  gapPenalty * 0.20 +
  distribution * 0.20
  )
  )
  );

  let quality: TimetableQuality;

  if (score >= 85) {
    quality = "Excellent";
  } else if (score >= 70) {
    quality = "Good";
  } else if (score >= 50) {
    quality = "Fair";
  } else {
    quality = "Poor";
  }

  const suggestions: string[] = [];

  if (sectionBalance < 70) {
    suggestions.push(
    "Section schedules are unevenly distributed across the week."
    );
  }

  if (roomUtilization < 30) {
    suggestions.push(
    "Room utilization is low. Consider consolidating room assignments."
    );
  }

  if (facultyWorkload < 70) {
    suggestions.push(
    "Faculty workload is uneven. Consider redistributing teaching periods."
    );
  }

  if (gapPenalty < 70) {
    suggestions.push(
    "Some sections have unnecessary gaps between classes. Consider clustering classes more efficiently."
    );
  }

  if (distribution < 70) {
    suggestions.push(
    "Some courses are clustered on too few days. Consider spreading sessions more evenly across the week."
    );
  }

  return {
    score,
    quality,
    breakdown,
    suggestions,
  };
}
