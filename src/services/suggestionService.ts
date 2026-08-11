import {
  collection,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebase/client";
import type { Suggestion, SuggestionStatus } from "@/types/timetable";

function mapSuggestion(id: string, data: Record<string, unknown>): Suggestion {
  return {
    id,
    timetableId: data.timetableId as string,
    scheduleId: data.scheduleId as string | undefined,
    createdBy: data.createdBy as string,
    createdByName: data.createdByName as string | undefined,
    createdByRole: data.createdByRole as Suggestion["createdByRole"],
    message: data.message as string,
    status: data.status as SuggestionStatus,
    resolution: data.resolution as string | undefined,
    resolvedBy: data.resolvedBy as string | undefined,
    resolvedAt: data.resolvedAt,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function getTimetableSuggestions(timetableId: string): Promise<Suggestion[]> {
  const q = query(
    collection(db, "suggestions"),
    where("timetableId", "==", timetableId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapSuggestion(d.id, d.data() as Record<string, unknown>));
}

export async function resolveSuggestion(
  suggestionId: string,
  resolution: string,
  resolvedBy: string
): Promise<void> {
  await updateDoc(doc(db, "suggestions", suggestionId), {
    status: "resolved" as SuggestionStatus,
    resolution,
    resolvedBy,
    resolvedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export { mapSuggestion };
