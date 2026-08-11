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
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Send } from "lucide-react";
import TimetableView from "@/components/timetable/timetable-view";
import { StatusBadge } from "@/components/timetable/status-badge";
import { getTimetable } from "@/services/timetableService";
import { getSchedulesForTimetable, schedulesToEntries } from "@/services/scheduleService";
import { getTimetableSuggestions, resolveSuggestion } from "@/services/suggestionService";
import { useMasterData } from "@/context/master-data-context";
import { useTimetableWorkflow } from "@/hooks/use-timetable-workflow";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import type { TimetableMeta, Suggestion } from "@/types/timetable";
import type { ScheduleEntry } from "@/lib/types";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ReviewFeedbackPage() {
  const params = useParams();
  const timetableId = params.id as string;
  const { toast } = useToast();
  const { profile } = useAuth();
  const workflow = useTimetableWorkflow(timetableId);
  const { courses, faculty, rooms, timeslots, loading: masterLoading } = useMasterData();

  const [timetable, setTimetable] = useState<TimetableMeta | null>(null);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [resubmitting, setResubmitting] = useState(false);
  const [selectedSection, setSelectedSection] = useState("");

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
    } finally {
      setLoading(false);
    }
  }, [timetableId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleResolve = async (suggestionId: string) => {
    if (!profile) return;
    await resolveSuggestion(suggestionId, "Addressed by coordinator", profile.uid);
    toast({ title: "Suggestion resolved" });
    setSuggestions(await getTimetableSuggestions(timetableId));
  };

  const handleResubmit = async () => {
    setResubmitting(true);
    try {
      await workflow.save(schedule, timetable?.name);
      await workflow.resubmit();
      toast({ title: "Resubmitted", description: "Timetable sent back to HOD for review." });
      await loadData();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Resubmit failed",
        description: err instanceof Error ? err.message : "Could not resubmit",
      });
    } finally {
      setResubmitting(false);
    }
  };

  const sections = [...new Set(schedule.map((s) => s.section))].sort();
  const openSuggestions = suggestions.filter((s) => s.status === "open");

  if (loading || masterLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/coordinator/timetable/${timetableId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="font-headline text-2xl font-semibold">HOD Feedback</h1>
          {timetable && <StatusBadge status={timetable.status} className="mt-2" />}
        </div>
        {timetable?.status === "changes_requested" && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button disabled={resubmitting}>
                <Send className="mr-2 h-4 w-4" />
                Resubmit for Review
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Resubmit for HOD review?</AlertDialogTitle>
                <AlertDialogDescription>
                  Ensure you have addressed the feedback and resolved conflicts.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleResubmit}>Resubmit</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {timetable?.changeRequestReason && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="text-base">Change Request</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">{timetable.changeRequestReason}</CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Suggestions</CardTitle>
          <CardDescription>
            {openSuggestions.length} open suggestion(s) from HOD.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {suggestions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No suggestions recorded.</p>
          ) : (
            suggestions.map((s) => (
              <div key={s.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm">{s.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {s.createdByName ?? s.createdBy} · {s.status}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={s.status === "open" ? "destructive" : "secondary"}>
                      {s.status}
                    </Badge>
                    {s.status === "open" && (
                      <Button size="sm" variant="outline" onClick={() => handleResolve(s.id)}>
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Current Timetable</CardTitle>
          <CardDescription>
            Edit on{" "}
            <Link href="/dashboard/timetable" className="text-primary underline">
              main timetable page
            </Link>{" "}
            then save from the timetable detail page.
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
