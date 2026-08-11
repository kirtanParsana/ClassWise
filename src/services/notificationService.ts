import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/firebase/client";
import type { Notification } from "@/types/timetable";

function mapNotification(id: string, data: Record<string, unknown>): Notification {
  return {
    id,
    uid: data.uid as string,
    title: data.title as string,
    message: data.message as string,
    type: data.type as Notification["type"],
    read: (data.read as boolean) ?? false,
    relatedTimetableId: data.relatedTimetableId as string | undefined,
    createdAt: data.createdAt,
  };
}

export async function getNotificationsForUser(
  uid: string,
  max = 20
): Promise<Notification[]> {
  const q = query(
    collection(db, "notifications"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc"),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapNotification(d.id, d.data() as Record<string, unknown>));
}

export async function getUnreadNotificationCount(uid: string): Promise<number> {
  const q = query(
    collection(db, "notifications"),
    where("uid", "==", uid),
    where("read", "==", false)
  );
  const snap = await getDocs(q);
  return snap.size;
}
