"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Loader2, CalendarDays } from "lucide-react";
import { useMasterData } from "@/context/master-data-context";
import { schedulesToEntries } from "@/services/scheduleService";
import { getTodayName } from "@/components/timetable/published-timetable-view";
import type { ScheduleDoc } from "@/types/timetable";

interface TodayScheduleSummaryProps {
  schedules: ScheduleDoc[];
  loading?: boolean;
  error?: string | null;
  viewBy: "faculty" | "section";
  timetableHref: string;
  emptyMessage?: string;
}

export function TodayScheduleSummary({
  schedules,
  loading,
  error,
  viewBy,
  timetableHref,
  emptyMessage = "No classes scheduled for today.",
}: TodayScheduleSummaryProps) {
  const { courses = [], faculty = [], rooms = [] } = useMasterData();
  const today = getTodayName();

  const todayEntries = useMemo(() => {
    const entries = schedulesToEntries(schedules);
    return entries
      .filter((e) => e.day === today)
      .sort((a, b) => a.timeslot.localeCompare(b.timeslot));
  }, [schedules, today]);

  const nextClass = todayEntries[0];

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-destructive py-4">{error}</p>
    );
  }

  if (!schedules.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed rounded-lg">
        <CalendarDays className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-sm font-medium text-muted-foreground">
          No published timetable yet
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1 max-w-xs">
          Your schedule will appear here once the HOD publishes the timetable.
        </p>
        <Link href={timetableHref} className="mt-4 text-xs text-primary hover:underline">
          View timetable page →
        </Link>
      </div>
    );
  }

  if (todayEntries.length === 0) {
    return (
      <div className="py-8 text-center border border-dashed rounded-lg">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          {today} · 0 classes today
        </p>
        <Link href={timetableHref} className="mt-3 inline-block text-xs text-primary hover:underline">
          View weekly timetable →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{todayEntries.length} class{todayEntries.length === 1 ? "" : "es"} today</span>
        {nextClass && (
          <span>
            Next: {courses.find((c) => c.id === nextClass.courseId)?.code ?? "—"} at{" "}
            {nextClass.timeslot}
          </span>
        )}
      </div>
      <ul className="space-y-2">
        {todayEntries.map((entry, i) => {
          const course = courses.find((c) => c.id === entry.courseId);
          return (
            <li key={`${entry.day}-${entry.timeslot}-${i}`} className="rounded-lg border p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{course?.name ?? entry.courseId}</span>
                <Badge variant="outline">{entry.timeslot}</Badge>
              </div>
              <p className="mt-1 text-muted-foreground">
                {viewBy === "section"
                  ? faculty.find((f) => f.id === entry.facultyId)?.name
                  : `Section ${entry.section}`}
                {" · "}
                {rooms.find((r) => r.id === entry.roomId)?.name ?? entry.roomId}
              </p>
            </li>
          );
        })}
      </ul>
      <Link href={timetableHref} className="text-xs text-primary hover:underline">
        View full weekly timetable →
      </Link>
    </div>
  );
}
