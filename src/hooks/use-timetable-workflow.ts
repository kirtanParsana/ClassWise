"use client";

import { useCallback } from "react";
import { authenticatedFetch } from "@/lib/authenticated-fetch";
import type { ScheduleEntry } from "@/lib/types";

export function useTimetableWorkflow(timetableId: string) {
  const callAction = useCallback(
    async (action: string, body: Record<string, unknown> = {}) => {
      const res = await authenticatedFetch(`/api/timetables/${timetableId}/actions`, {
        method: "POST",
        body: JSON.stringify({ action, ...body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Action failed");
      return data;
    },
    [timetableId]
  );

  return {
    submit: () => callAction("submit"),
    requestChanges: (reason: string) => callAction("request-changes", { reason }),
    approve: (comment?: string) => callAction("approve", { comment }),
    publish: () => callAction("publish"),
    resubmit: () => callAction("resubmit"),
    save: (schedule: ScheduleEntry[], name?: string) =>
      callAction("save", { schedule, name }),
  };
}

export async function addSuggestion(
  timetableId: string,
  message: string,
  scheduleId?: string
) {
  const res = await authenticatedFetch(`/api/timetables/${timetableId}/suggestions`, {
    method: "POST",
    body: JSON.stringify({ message, scheduleId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to add suggestion");
  return data;
}
