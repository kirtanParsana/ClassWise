import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/firebase/admin";
import { omitUndefined } from "@/lib/firestore-utils";
import { canTransition, type TimetableStatus } from "@/types/timetable";
import type {
  ScheduleEntry,
  Course,
  Faculty,
  Room,
  Section,
  Day,
} from "@/lib/types";import { detectConflicts, countConflicts } from "@/lib/conflict-detection";
import { scheduleEntryToDoc } from "@/lib/timetable-utils";
import type { AuthenticatedUser } from "@/lib/server-auth";

export async function getTimetableData(timetableId: string) {
  const snap = await adminDb.collection("timetables").doc(timetableId).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() } as Record<string, unknown> & { id: string };
}

export type TimetableAction =
  | "generate"
  | "save"
  | "submit"
  | "request-changes"
  | "approve"
  | "publish"
  | "resubmit"
  | "view"
  | "conflict-check"
  | "create-suggestion";

export function authorizeTimetableAccess(
  user: AuthenticatedUser,
  timetable: Record<string, unknown> & { id: string },
  action: TimetableAction
): void {
  const timetableDepartmentId = timetable.departmentId;

  if (typeof timetableDepartmentId !== "string" || !timetableDepartmentId) {
    throw new Error("Timetable has no valid department");
  }

  if (
    typeof user.profile.departmentId !== "string" ||
    !user.profile.departmentId
  ) {
    throw new Error("User has no authorized department");
  }

  if (user.profile.departmentId !== timetableDepartmentId) {
    throw new Error("You are not authorized to access this timetable");
  }

  const status = (timetable.status as TimetableStatus) ?? "draft";

  switch (action) {
    case "save":
    case "submit":
    case "resubmit":
      if (user.role !== "coordinator") {
        throw new Error("Only coordinators can perform this action");
      }

      if (
        !["draft", "generated", "changes_requested"].includes(status)
      ) {
        throw new Error(
          "This timetable cannot be modified in its current status"
        );
      }
      return;

    case "request-changes":
    case "approve":
      if (user.role !== "hod") {
        throw new Error("Only HODs can perform this action");
      }

      if (status !== "under_review") {
        throw new Error(
          "This action is only available while the timetable is under review"
        );
      }
      return;

    case "publish":
      if (user.role !== "hod") {
        throw new Error("Only HODs can publish timetables");
      }

      if (status !== "approved") {
        throw new Error(
          "Only approved timetables can be published"
        );
      }
      return;

    case "conflict-check":
      if (!["coordinator", "hod"].includes(user.role)) {
        throw new Error(
          "Only coordinators and HODs can check timetable conflicts"
        );
      }
      return;

    case "create-suggestion":
      if (user.role !== "hod") {
        throw new Error("Only HODs can create suggestions");
      }

      if (status !== "under_review") {
        throw new Error(
          "Suggestions can only be created for timetables under review"
        );
      }
      return;

    case "view":
      if (!["coordinator", "hod"].includes(user.role)) {
        throw new Error(
          "You are not authorized to view this timetable"
        );
      }
      return;

    case "generate":
      if (user.role !== "coordinator") {
        throw new Error("Only coordinators can generate timetables");
      }
      return;

    default:
      throw new Error("Unsupported timetable action");
  }
}

export async function getScheduleEntriesForTimetable(
  timetableId: string
): Promise<ScheduleEntry[]> {
  const snap = await adminDb
    .collection("schedules")
    .where("timetableId", "==", timetableId)
    .get();

  if (!snap.empty) {
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        day: data.day,
        timeslot: data.timeslotName ?? `${data.startTime}-${data.endTime}`,
        courseId: data.courseId,
        facultyId: data.facultyId,
        section: data.section ?? data.sectionId ?? "",
        roomId: data.roomId,
      } as ScheduleEntry;
    });
  }

  const timetable = await getTimetableData(timetableId);
  return (timetable?.schedule as ScheduleEntry[]) ?? [];
}

export async function syncScheduleDocs(
  timetableId: string,
  schedule: ScheduleEntry[],
  timetableStatus: TimetableStatus,
  lookup: {
    courses: Course[];
    faculty: Faculty[];
    rooms: Room[];
    timeslots: Array<{ id: string; day: string; name?: string; startTime?: string; endTime?: string; order?: number }>;
  }
) {
  const existing = await adminDb
    .collection("schedules")
    .where("timetableId", "==", timetableId)
    .get();

  const batch = adminDb.batch();
  existing.docs.forEach((d) => batch.delete(d.ref));

  for (const entry of schedule) {
    const ref = adminDb.collection("schedules").doc();
    const docData = scheduleEntryToDoc(entry, timetableId, timetableStatus, lookup);
    batch.set(ref, omitUndefined({
      ...docData,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }));
  }

  await batch.commit();
}

export async function updateScheduleTimetableStatus(
  timetableId: string,
  timetableStatus: TimetableStatus
) {
  const snap = await adminDb
    .collection("schedules")
    .where("timetableId", "==", timetableId)
    .get();

  if (snap.empty) return;

  const batch = adminDb.batch();
  snap.docs.forEach((d) => {
    batch.update(d.ref, {
      timetableStatus,
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
  await batch.commit();
}

export async function runConflictCheck(timetableId: string) {
  const schedule = await getScheduleEntriesForTimetable(timetableId);
  const [coursesSnap, roomsSnap] = await Promise.all([
    adminDb.collection("courses").get(),
    adminDb.collection("rooms").get(),
  ]);
  const courses = coursesSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as Course[];
  const rooms = roomsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as Room[];
  const conflicts = detectConflicts(schedule, courses, rooms);
  const counts = countConflicts(conflicts);
  return { conflicts, ...counts, schedule };
}

export async function persistConflicts(timetableId: string, conflicts: ReturnType<typeof detectConflicts>) {
  const existing = await adminDb
    .collection("conflicts")
    .where("timetableId", "==", timetableId)
    .get();

  const batch = adminDb.batch();
  existing.docs.forEach((d) => batch.delete(d.ref));

  for (const conflict of conflicts) {
    const ref = adminDb.collection("conflicts").doc();
    batch.set(ref, {
      timetableId,
      type: conflict.type,
      severity: conflict.severity,
      description: conflict.description,
      involved: conflict.involved,
      entries: conflict.entries,
      createdAt: FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();
}

export async function createNotification(
  uid: string,
  type: string,
  title: string,
  message: string,
  relatedTimetableId?: string
) {
  await adminDb.collection("notifications").add(
    omitUndefined({
      uid,
      type,
      title,
      message,
      relatedTimetableId,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    })
  );
}

export async function findHODUids(departmentId?: string): Promise<string[]> {
  let q = adminDb.collection("users").where("role", "==", "hod").where("isActive", "==", true);
  const snap = await q.get();
  return snap.docs
    .filter((d) => {
      if (!departmentId) return true;
      const dept = d.data().departmentId;
      return !dept || dept === departmentId;
    })
    .map((d) => d.id);
}

export async function findCoordinatorUids(): Promise<string[]> {
  const snap = await adminDb
    .collection("users")
    .where("role", "==", "coordinator")
    .where("isActive", "==", true)
    .get();
  return snap.docs.map((d) => d.id);
}

export async function transitionTimetableStatus(
  timetableId: string,
  toStatus: TimetableStatus,
  user: AuthenticatedUser,
  extra: Record<string, unknown> = {}
) {
  const timetable = await getTimetableData(timetableId);
  if (!timetable) {
    throw new Error("Timetable not found");
  }

  const fromStatus = (timetable.status as TimetableStatus) ?? "draft";
  if (!canTransition(fromStatus, toStatus)) {
    throw new Error(`Invalid status transition: ${fromStatus} → ${toStatus}`);
  }

  await adminDb.collection("timetables").doc(timetableId).update(
    omitUndefined({
      status: toStatus,
      updatedAt: FieldValue.serverTimestamp(),
      ...extra,
    })
  );

  await updateScheduleTimetableStatus(timetableId, toStatus);

  return { fromStatus, toStatus };
}

export async function fetchMasterDataForLookup() {
  const [
    coursesSnap,
    facultySnap,
    roomsSnap,
    sectionsSnap,
    timeslotsSnap,
  ] = await Promise.all([
    adminDb.collection("courses").get(),
    adminDb.collection("faculties").get(),
    adminDb.collection("rooms").get(),
    adminDb.collection("sections").get(),
    adminDb.collection("timeslots").get(),
  ]);

    return {
    courses: coursesSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Course[],

    faculty: facultySnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Faculty[],

    rooms: roomsSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Room[],

    sections: sectionsSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Section[],

    timeslots: timeslotsSnap.docs.map((d) => {
      const t = d.data();

      const name =
        t.name ??
        (t.startTime && t.endTime
          ? `${t.startTime}-${t.endTime}`
          : "");

      const order =
        typeof t.order === "number"
          ? t.order
          : t.startTime
            ? Number(t.startTime.split(":")[0]) * 60 +
              Number(t.startTime.split(":")[1] ?? 0)
            : 0;

      return {
        id: d.id,
        day: t.day as Day,
        name,
        startTime: t.startTime as string | undefined,
        endTime: t.endTime as string | undefined,
        order,
      };
    }),
  };
}
