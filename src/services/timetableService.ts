import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "@/firebase/client";
import type { TimetableMeta, TimetableStatus } from "@/types/timetable";

function mapTimetableDoc(id: string, data: Record<string, unknown>): TimetableMeta {
  return {
    id,
    name: (data.name as string) ?? "Untitled",
    departmentId: data.departmentId as string | undefined,
    semester: data.semester as number | undefined,
    academicYear: data.academicYear as string | undefined,
    status: (data.status as TimetableStatus) ?? "draft",
    version: (data.version as number) ?? 1,
    sections: (data.sections as string[]) ?? [],
    days: (data.days as TimetableMeta["days"]) ?? [],
    createdBy: (data.createdBy as string) ?? "",
    createdByName: data.createdByName as string | undefined,
    reviewedBy: data.reviewedBy as string | undefined,
    reviewedByName: data.reviewedByName as string | undefined,
    reviewedAt: data.reviewedAt,
    approvedBy: data.approvedBy as string | undefined,
    approvedByName: data.approvedByName as string | undefined,
    approvedAt: data.approvedAt,
    publishedBy: data.publishedBy as string | undefined,
    publishedByName: data.publishedByName as string | undefined,
    publishedAt: data.publishedAt,
    submittedAt: data.submittedAt,
    submittedBy: data.submittedBy as string | undefined,
    submittedByName: data.submittedByName as string | undefined,
    requestedBy: data.requestedBy as string | undefined,
    requestedByName: data.requestedByName as string | undefined,
    requestedAt: data.requestedAt,
    changeRequestReason: data.changeRequestReason as string | undefined,
    hasCriticalConflicts: data.hasCriticalConflicts as boolean | undefined,
    unresolvedConflictCount: data.unresolvedConflictCount as number | undefined,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function getTimetable(id: string): Promise<TimetableMeta | null> {
  const snap = await getDoc(doc(db, "timetables", id));
  if (!snap.exists()) return null;
  return mapTimetableDoc(snap.id, snap.data() as Record<string, unknown>);
}

export async function getTimetablesByStatus(
  status: TimetableStatus | TimetableStatus[]
): Promise<TimetableMeta[]> {
  const statuses = Array.isArray(status) ? status : [status];
  const constraints: QueryConstraint[] = [
    where("status", "in", statuses.slice(0, 10)),
    orderBy("updatedAt", "desc"),
  ];
  const q = query(collection(db, "timetables"), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapTimetableDoc(d.id, d.data() as Record<string, unknown>));
}

export async function getAllTimetables(): Promise<TimetableMeta[]> {
  const q = query(collection(db, "timetables"), orderBy("updatedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapTimetableDoc(d.id, d.data() as Record<string, unknown>));
}

export async function getTimetablesForHOD(departmentId?: string): Promise<TimetableMeta[]> {
  const all = await getAllTimetables();
  if (!departmentId) return all;
  return all.filter((t) => !t.departmentId || t.departmentId === departmentId);
}

export { mapTimetableDoc };
