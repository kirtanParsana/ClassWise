"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft, Send } from "lucide-react";
import TimetableView from "@/components/timetable/timetable-view";
import { StatusBadge } from "@/components/timetable/status-badge";
import { getTimetable } from "@/services/timetableService";
import { getSchedulesForTimetable, schedulesToEntries } from "@/services/scheduleService";
import { checkConflicts } from "@/services/conflictService";
import { useMasterData } from "@/context/master-data-context";
import { useTimetableWorkflow } from "@/hooks/use-timetable-workflow";
import { useToast } from "@/hooks/use-toast";
import type { TimetableMeta } from "@/types/timetable";
import type { ScheduleEntry } from "@/lib/types";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/client";
import { TimetableWorkflowBanner } from "@/components/timetable/timetable-workflow-banner";
import { useTimetable } from "@/context/timetable-context";

export default function CoordinatorTimetableDetailPage() {
  const params = useParams();
  const router = useRouter();
  const timetableId = params.id as string;
  const { toast } = useToast();
  const workflow = useTimetableWorkflow(timetableId);
  const { schedule: contextSchedule, activeTimetableId, setActiveTimetableId, setSchedule: setContextSchedule } =
    useTimetable();
  const { courses, faculty, rooms, timeslots, loading: masterLoading } = useMasterData();

  const [timetable, setTimetable] = useState<TimetableMeta | null>(null);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedSection, setSelectedSection] = useState("");
  const [conflictCount, setConflictCount] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const meta = await getTimetable(timetableId);
      if (!meta) {
        toast({ variant: "destructive", title: "Timetable not found" });
        router.push("/coordinator/timetable/drafts");
        return;
      }
      setTimetable(meta);

      let entries = await getSchedulesForTimetable(timetableId).then(schedulesToEntries);
      if (!entries.length) {
        const snap = await getDoc(doc(db, "timetables", timetableId));
        entries = (snap.data()?.schedule as ScheduleEntry[]) ?? [];
      }

      if (
        activeTimetableId === timetableId &&
        contextSchedule.length > 0 &&
        ["draft", "generated", "changes_requested"].includes(meta.status)
      ) {
        entries = contextSchedule;
      }

      setSchedule(entries);
      setActiveTimetableId(timetableId);
      setContextSchedule(entries);
      if (entries.length) {
        setSelectedSection([...new Set(entries.map((e) => e.section))].sort()[0] ?? "");
      }

      try {
        const conflicts = await checkConflicts(timetableId);
        setConflictCount(conflicts.critical);
      } catch {
        setConflictCount(meta.hasCriticalConflicts ? (meta.unresolvedConflictCount ?? 1) : 0);
      }
    } finally {
      setLoading(false);
    }
  }, [timetableId, router, toast, activeTimetableId, contextSchedule, setActiveTimetableId, setContextSchedule]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const canEdit = timetable && ["draft", "generated", "changes_requested"].includes(timetable.status);
  const canSubmit = timetable && ["generated", "draft"].includes(timetable.status) && conflictCount === 0;

  const handleSave = async () => {
    setSaving(true);
    try {
      await workflow.save(schedule, timetable?.name);
      toast({ title: "Saved", description: "Timetable and schedule entries updated." });
      await loadData();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Save failed",
        description: err instanceof Error ? err.message : "Could not save",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (canEdit) await workflow.save(schedule, timetable?.name);
      await workflow.submit();
      toast({ title: "Submitted", description: "Timetable sent for HOD review." });
      await loadData();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Submit failed",
        description: err instanceof Error ? err.message : "Could not submit",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const sections = [...new Set(schedule.map((s) => s.section))].sort();

  if (loading || masterLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!timetable) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/coordinator/timetable/drafts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Drafts
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-headline text-2xl font-semibold">{timetable.name}</h1>
            <StatusBadge status={timetable.status} />
            <span className="text-sm text-muted-foreground">v{timetable.version}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {canEdit && (
            <Button onClick={handleSave} disabled={saving} variant="outline">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save
            </Button>
          )}
          {canSubmit && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={submitting}>
                  <Send className="mr-2 h-4 w-4" />
                  Submit for Review
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Submit for HOD review?</AlertDialogTitle>
                  <AlertDialogDescription>
                    After submission you will not be able to edit until the HOD requests changes.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSubmit}>Submit</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {timetable.status === "changes_requested" && (
            <Button asChild>
              <Link href={`/coordinator/timetable/${timetableId}/review-feedback`}>
                View HOD Feedback
              </Link>
            </Button>
          )}
        </div>
      </div>

      {conflictCount > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="py-4 text-sm text-destructive">
            {conflictCount} critical conflict(s) detected. Resolve before submitting.
          </CardContent>
        </Card>
      )}

      <TimetableWorkflowBanner timetable={timetable} mode="workflow" />

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Timetable Grid</CardTitle>
          <CardDescription>
            {canEdit
              ? "Review the schedule below. Use Edit Timetable above to change slots, then Save here."
              : "Read-only view."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedSection} onValueChange={setSelectedSection}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent>
              {sections.map((s) => (
                <SelectItem key={s} value={s}>
                  Section {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <TimetableView
            viewBy="section"
            filterId={selectedSection}
            schedule={schedule}
            courses={courses ?? []}
            faculty={faculty ?? []}
            rooms={rooms ?? []}
            timeslots={timeslots ?? []}
          />
        </CardContent>
      </Card>
    </div>
  );
}
