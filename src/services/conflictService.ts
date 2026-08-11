import { authenticatedFetch } from "@/lib/authenticated-fetch";
import type { DetectedConflict } from "@/lib/conflict-detection";

export interface ConflictCheckResult {
  success: boolean;
  totalConflicts: number;
  critical: number;
  warnings: number;
  conflicts: DetectedConflict[];
}

export async function checkConflicts(timetableId?: string): Promise<ConflictCheckResult> {
  const url = timetableId
    ? `/api/conflicts?timetableId=${encodeURIComponent(timetableId)}`
    : "/api/conflicts";
  const res = await authenticatedFetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Conflict check failed");
  }
  return res.json();
}
