import {
  collection,
  doc,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebase/client";
import type { ScheduleDoc } from "@/types/timetable";
import { scheduleDocToEntry } from "@/lib/timetable-utils";
import type { ScheduleEntry } from "@/lib/types";

function mapScheduleDoc(id: string, data: Record<string, unknown>): ScheduleDoc {
  return {
    id,
    timetableId: data.timetableId as string,
    timetableStatus: data.timetableStatus as ScheduleDoc["timetableStatus"],
    day: data.day as ScheduleDoc["day"],
    startTime: data.startTime as string,
    endTime: data.endTime as string,
    timeslotName: data.timeslotName as string,
    timeslotOrder: (data.timeslotOrder as number) ?? 0,
    courseId: data.courseId as string,
    courseName: data.courseName as string,
    courseCode: data.courseCode as string | undefined,
    facultyId: data.facultyId as string,
    facultyName: data.facultyName as string | undefined,
    section: (data.section as string) ?? (data.sectionId as string) ?? "",
    sectionId: data.sectionId as string | undefined,
    roomId: data.roomId as string,
    roomName: data.roomName as string | undefined,
    status: data.status as ScheduleDoc["status"],
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function getSchedulesForTimetable(timetableId: string): Promise<ScheduleDoc[]> {
  const q = query(
    collection(db, "schedules"),
    where("timetableId", "==", timetableId),
    orderBy("timeslotOrder")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapScheduleDoc(d.id, d.data() as Record<string, unknown>));
}

export async function getSchedulesForFaculty(facultyId: string): Promise<ScheduleDoc[]> {
  const q = query(
    collection(db, "schedules"),
    where("facultyId", "==", facultyId),
    where("timetableStatus", "==", "published")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapScheduleDoc(d.id, d.data() as Record<string, unknown>));
}

export async function getSchedulesForSection(sectionId: string): Promise<ScheduleDoc[]> {
  const q = query(
    collection(db, "schedules"),
    where("section", "==", sectionId),
    where("timetableStatus", "==", "published")
  );
  const snap = await getDocs(q);
  const docs = snap.docs.map((d) => mapScheduleDoc(d.id, d.data() as Record<string, unknown>));
  if (docs.length > 0) return docs;

  const q2 = query(
    collection(db, "schedules"),
    where("sectionId", "==", sectionId),
    where("timetableStatus", "==", "published")
  );
  const snap2 = await getDocs(q2);
  return snap2.docs.map((d) => mapScheduleDoc(d.id, d.data() as Record<string, unknown>));
}

export function schedulesToEntries(schedules: ScheduleDoc[]): ScheduleEntry[] {
  return schedules.map(scheduleDocToEntry);
}

export { mapScheduleDoc };
