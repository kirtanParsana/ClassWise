"use client";

import Link from "next/link";
import { ArrowRight, Pencil, Save, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/timetable/status-badge";
import type { TimetableMeta } from "@/types/timetable";

interface TimetableWorkflowBannerProps {
  timetable: Pick<TimetableMeta, "id" | "name" | "status" | "version">;
  mode: "edit" | "workflow";
}

export function TimetableWorkflowBanner({ timetable, mode }: TimetableWorkflowBannerProps) {
  const editHref = `/dashboard/timetable?id=${timetable.id}`;
  const workflowHref = `/coordinator/timetable/${timetable.id}`;

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={timetable.status} />
        <span className="font-medium">{timetable.name}</span>
        <span className="text-sm text-muted-foreground">v{timetable.version}</span>
      </div>

      {mode === "edit" ? (
        <>
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Step 1 — Edit:</strong> Click cells to change faculty or room.
            When finished, return to the workflow page to save and submit for HOD review.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href={workflowHref}>
                <Save className="mr-2 h-4 w-4" />
                Save &amp; Submit (workflow)
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/coordinator/timetable/drafts">All drafts</Link>
            </Button>
          </div>
        </>
      ) : (
        <>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>
              <Link href={editHref} className="text-primary underline-offset-2 hover:underline">
                Edit slots
              </Link>{" "}
              on the timetable grid
            </li>
            <li>Save changes on this page</li>
            <li>Run conflict check (automatic on save)</li>
            <li>Submit for HOD review when conflicts are clear</li>
          </ol>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={editHref}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Timetable
              </Link>
            </Button>
            {timetable.status === "changes_requested" && (
              <Button asChild size="sm" variant="outline">
                <Link href={`${workflowHref}/review-feedback`}>View HOD Feedback</Link>
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Send className="h-3 w-3" />
            Submit for review is available here after saving with no critical conflicts.
          </p>
        </>
      )}
    </div>
  );
}
