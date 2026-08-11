import type { ScheduleEntry, Course, Faculty, Room } from "@/lib/types";
import type { TimetableStatus } from "@/types/timetable";

export function parseTimeslotName(name: string): { startTime: string; endTime: string } {
  const [startTime, endTime] = name.split("-");
  return { startTime: startTime ?? "", endTime: endTime ?? "" };
}

export function scheduleEntryToDoc(
  entry: ScheduleEntry,
  timetableId: string,
  timetableStatus: TimetableStatus,
  lookup: {
    courses: Course[];
    faculty: Faculty[];
    rooms: Room[];
    timeslots: Array<{
      id: string;
      day: string;
      name?: string;
      startTime?: string;
      endTime?: string;
      order?: number;
    }>;
  }
) {
  const course = lookup.courses.find((c) => c.id === entry.courseId);
  const fac = lookup.faculty.find((f) => f.id === entry.facultyId);
  const room = lookup.rooms.find((r) => r.id === entry.roomId);
  const slot = lookup.timeslots.find(
    (t) => t.day === entry.day && (t.name === entry.timeslot || `${t.startTime}-${t.endTime}` === entry.timeslot)
  );
  const { startTime, endTime } = slot?.startTime
    ? { startTime: slot.startTime, endTime: slot.endTime ?? "" }
    : parseTimeslotName(entry.timeslot);

  return {
    timetableId,
    timetableStatus,
    day: entry.day,
    startTime,
    endTime,
    timeslotName: entry.timeslot,
    timeslotOrder: slot?.order ?? 0,
    courseId: entry.courseId,
    courseName: course?.name ?? "",
    courseCode: course?.code,
    facultyId: entry.facultyId,
    facultyName: fac?.name,
    section: entry.section,
    sectionId: entry.section,
    roomId: entry.roomId,
    roomName: room?.name,
  };
}

export function scheduleDocToEntry(doc: {
  day: string;
  timeslotName?: string;
  courseId: string;
  facultyId: string;
  section?: string;
  sectionId?: string;
  roomId: string;
}): ScheduleEntry {
  return {
    day: doc.day as ScheduleEntry["day"],
    timeslot: doc.timeslotName ?? "",
    courseId: doc.courseId,
    facultyId: doc.facultyId,
    section: doc.section ?? doc.sectionId ?? "",
    roomId: doc.roomId,
  };
}

export function defaultTimetableName(academicYear?: string, semester?: number): string {
  const year = academicYear ?? new Date().getFullYear().toString();
  const sem = semester ? ` Sem ${semester}` : "";
  return `Timetable ${year}${sem}`;
}
