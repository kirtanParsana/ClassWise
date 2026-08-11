"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { Loader2, ArrowLeft, CheckCircle, XCircle, Globe } from "lucide-react";
import TimetableView from "@/components/timetable/timetable-view";
import { StatusBadge } from "@/components/timetable/status-badge";
import { getTimetable } from "@/services/timetableService";
import { getSchedulesForTimetable, schedulesToEntries } from "@/services/scheduleService";
import { getTimetableSuggestions } from "@/services/suggestionService";
import { checkConflicts } from "@/services/conflictService";
import { useMasterData } from "@/context/master-data-context";
import { useTimetableWorkflow, addSuggestion } from "@/hooks/use-timetable-workflow";
import { useToast } from "@/hooks/use-toast";
import type { TimetableMeta, Suggestion } from "@/types/timetable";
import type { ScheduleEntry } from "@/lib/types";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function HODReviewDetailPage() {
  const params = useParams();
  const timetableId = params.timetableId as string;
  const { toast } = useToast();
  const workflow = useTimetableWorkflow(timetableId);
  const { courses, faculty, rooms, timeslots, loading: masterLoading } = useMasterData();

  const [timetable, setTimetable] = useState<TimetableMeta | null>(null);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [conflicts, setConflicts] = useState<{ total: number; critical: number }>({ total: 0, critical: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState("");
  const [newSuggestion, setNewSuggestion] = useState("");
  const [changeReason, setChangeReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const meta = await getTimetable(timetableId);
      setTimetable(meta);

      let entries = await getSchedulesForTimetable(timetableId).then(schedulesToEntries);
      if (!entries.length) {
        const snap = await getDoc(doc(db, "timetables", timetableId));
        entries = (snap.data()?.schedule as ScheduleEntry[]) ?? [];
      }
      setSchedule(entries);
      if (entries.length) {
        setSelectedSection([...new Set(entries.map((e) => e.section))].sort()[0] ?? "");
      }

      setSuggestions(await getTimetableSuggestions(timetableId));

      try {
        const result = await checkConflicts(timetableId);
        setConflicts({ total: result.totalConflicts, critical: result.critical });
      } catch {
        setConflicts({
          total: meta?.unresolvedConflictCount ?? 0,
          critical: meta?.hasCriticalConflicts ? 1 : 0,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [timetableId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const runAction = async (fn: () => Promise<unknown>, success: string) => {
    setActionLoading(true);
    try {
      await fn();
      toast({ title: success });
      await loadData();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Action failed",
        description: err instanceof Error ? err.message : "Could not complete action",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddSuggestion = () =>
    runAction(async () => {
      await addSuggestion(timetableId, newSuggestion);
      setNewSuggestion("");
      setSuggestions(await getTimetableSuggestions(timetableId));
    }, "Suggestion added");

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
          <Link href="/hod/review">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-headline text-2xl font-semibold">{timetable.name}</h1>
            <StatusBadge status={timetable.status} />
            <span className="text-sm text-muted-foreground">v{timetable.version}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Submitted by {timetable.submittedByName ?? timetable.submittedBy ?? "coordinator"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {timetable.status === "under_review" && (
            <>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" disabled={actionLoading}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Request Changes
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Request changes?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Provide a reason or ensure at least one open suggestion exists.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <Textarea
                    placeholder="Describe required changes..."
                    value={changeReason}
                    onChange={(e) => setChangeReason(e.target.value)}
                  />
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() =>
                        runAction(
                          () => workflow.requestChanges(changeReason),
                          "Changes requested"
                        )
                      }
                    >
                      Request Changes
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button disabled={actionLoading || conflicts.critical > 0}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Approve this timetable?</AlertDialogTitle>
                    <AlertDialogDescription>
                      The coordinator will be notified. You can publish after approval.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => runAction(() => workflow.approve(), "Timetable approved")}
                    >
                      Approve
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
          {timetable.status === "approved" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={actionLoading}>
                  <Globe className="mr-2 h-4 w-4" />
                  Publish
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Publish this timetable?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Faculty and students will be able to see it immediately.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => runAction(() => workflow.publish(), "Timetable published")}
                  >
                    Publish
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Conflicts</p>
            <p className="text-2xl font-bold">{conflicts.total}</p>
            {conflicts.critical > 0 && (
              <Badge variant="destructive" className="mt-2">
                {conflicts.critical} critical
              </Badge>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Sections</p>
            <p className="text-2xl font-bold">{sections.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Open Suggestions</p>
            <p className="text-2xl font-bold">
              {suggestions.filter((s) => s.status === "open").length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Add Suggestion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="suggestion">Message</Label>
          <Textarea
            id="suggestion"
            placeholder="e.g. Move DBMS from Monday 10:00 AM..."
            value={newSuggestion}
            onChange={(e) => setNewSuggestion(e.target.value)}
          />
          <Button onClick={handleAddSuggestion} disabled={!newSuggestion.trim() || actionLoading}>
            Add Suggestion
          </Button>
        </CardContent>
      </Card>

      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Suggestions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {suggestions.map((s) => (
              <div key={s.id} className="rounded border p-3 text-sm">
                {s.message}
                <Badge variant="outline" className="ml-2">
                  {s.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Timetable</CardTitle>
          <CardDescription>Full schedule for review (read-only).</CardDescription>
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
