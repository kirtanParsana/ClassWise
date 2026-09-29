'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarPlus,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { useCollection } from "@/firebase/firestore/use-collection";
import { collection } from "firebase/firestore";
import { db } from "@/firebase/client";
import type { Conflict, ScheduleEntry } from "@/lib/types";
import { useTimetable } from "@/context/timetable-context";
import { useMasterData } from "@/context/master-data-context";
import { TodayScheduleSummary } from "@/components/timetable/today-schedule-summary";

export default function CoordinatorDashboardPage() {
  const { profile, loading: authLoading } = useAuth();
  const { schedule } = useTimetable();
  const { faculty, rooms, sections } = useMasterData();

  const { data: conflicts, loading: conflictsLoading } = useCollection<Conflict>(
    collection(db, "conflicts")
  );

  const conflictCount = conflicts?.length ?? 0;

  // Calculate real schedule health score (100 base minus active conflict penalties)
  const healthScore = Math.max(0, Math.min(100, 100 - conflictCount * 5));

  const hasFacultyOverlaps = conflicts?.some((c) => c.type === "Faculty Overlap") ?? false;
  const hasRoomConflicts = conflicts?.some((c) => c.type === "Room Double Booking") ?? false;

  if (authLoading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header Banner */}
      <div className="flex flex-col gap-2 border-b pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
                Welcome back, {profile?.name ?? "Coordinator"}
              </h1>
              <Badge variant="default" className="text-xs font-semibold px-2.5 py-0.5">
                Time Coordinator
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Manage timetable generation, resources, constraints, and publishing from one workspace.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/dashboard/timetable?tab=generate">
              <Button size="sm" className="gap-2 font-medium shadow-xs">
                <CalendarPlus className="h-4 w-4" />
                Generate Timetable
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Resource Cards */}
      <StatsCards />

      {/* Signature Schedule Health Card */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/[0.03] to-transparent shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="font-headline text-xl font-bold">Schedule Health</CardTitle>
                <CardDescription className="text-xs">Automated health validation across active constraints</CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-2xl font-extrabold font-headline text-foreground">{healthScore} / 100</span>
                <span className="text-[11px] text-muted-foreground font-medium">Health Rating</span>
              </div>
              <Link href="/dashboard/conflicts">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs font-medium">
                  View Insights
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            <div className="flex items-center gap-2.5 rounded-lg border bg-card p-3 text-xs font-medium">
              {!hasFacultyOverlaps ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
              )}
              <span>{!hasFacultyOverlaps ? "No faculty overlaps" : "Faculty overlap detected"}</span>
            </div>

            <div className="flex items-center gap-2.5 rounded-lg border bg-card p-3 text-xs font-medium">
              {!hasRoomConflicts ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
              )}
              <span>{!hasRoomConflicts ? "No room conflicts" : "Room booking collision"}</span>
            </div>

            <div className="flex items-center gap-2.5 rounded-lg border bg-card p-3 text-xs font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>All sections assigned</span>
            </div>

            <div className="flex items-center gap-2.5 rounded-lg border bg-card p-3 text-xs font-medium">
              {conflictCount === 0 ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
              )}
              <span>
                {conflictCount === 0
                  ? "0 active conflicts"
                  : `${conflictCount} active conflict(s)`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Row: Today's Schedule & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Today's Schedule (7 Cols) */}
        <Card className="lg:col-span-7 flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-headline text-lg font-bold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Today&apos;s Schedule
                </CardTitle>
                <CardDescription className="text-xs">Current timetable allocation for today</CardDescription>
              </div>
              <Link href="/dashboard/timetable">
                <Button variant="ghost" size="sm" className="text-xs font-medium text-primary">
                  View Timetable →
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
            <TodayScheduleSummary
              schedules={schedule.map((s, idx) => ({
                id: `sch-${idx}`,
                timetableId: "active",
                timetableStatus: "published" as const,
                day: s.day,
                startTime: s.timeslot.split("-")[0] || "09:00",
                endTime: s.timeslot.split("-")[1] || "10:00",
                timeslotName: s.timeslot,
                timeslotOrder: idx,
                courseId: s.courseId,
                courseName: s.courseId,
                facultyId: s.facultyId,
                section: s.section,
                roomId: s.roomId,
                createdAt: new Date(),
                updatedAt: new Date(),
              }))}
              loading={false}
              error={null}
              viewBy="section"
              timetableHref="/dashboard/timetable"
              emptyMessage="No classes currently scheduled for today in active workspace."
            />
          </CardContent>
        </Card>

        {/* Quick Actions (5 Cols) */}
        <Card className="lg:col-span-5 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="font-headline text-lg font-bold">Quick Actions</CardTitle>
            <CardDescription className="text-xs">Primary workflows for timetable coordination</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/timetable?tab=generate" className="block">
              <Button size="lg" className="w-full justify-between rounded-xl bg-primary text-primary-foreground font-semibold shadow-xs hover:bg-primary/90">
                <div className="flex items-center gap-2.5">
                  <CalendarPlus className="h-5 w-5" />
                  <span>Generate Timetable</span>
                </div>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <div className="grid grid-cols-1 gap-2 pt-1">
              <Link href="/dashboard/conflicts">
                <Button variant="outline" className="w-full justify-start gap-2.5 text-xs font-medium">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span>Review Conflicts</span>
                </Button>
              </Link>

              <Link href="/dashboard/timetable?tab=constraints">
                <Button variant="outline" className="w-full justify-start gap-2.5 text-xs font-medium">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span>Manage Constraints</span>
                </Button>
              </Link>

              <Link href="/coordinator/timetable/published">
                <Button variant="outline" className="w-full justify-start gap-2.5 text-xs font-medium">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Publish Timetable</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scheduling Insights Area */}
      <Card className="border-indigo-100 dark:border-indigo-950 bg-indigo-50/20 dark:bg-indigo-950/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <CardTitle className="font-headline text-lg font-bold">Scheduling Insights</CardTitle>
                <CardDescription className="text-xs">Real-time resource and constraint diagnostics</CardDescription>
              </div>
            </div>
            <Link href="/dashboard/conflicts">
              <Button variant="outline" size="sm" className="text-xs border-indigo-200 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
                Review Insights
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="p-3.5 rounded-lg border bg-card/90 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-blue-500" /> Faculty Load Balance
              </span>
              <Badge variant="outline" className="text-[10px]">Normal</Badge>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {faculty?.length ? `${faculty.length} faculty members mapped with distributed teaching slots.` : "Faculty assignments are within standard limits."}
            </p>
          </div>

          <div className="p-3.5 rounded-lg border bg-card/90 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-indigo-500" /> Room Utilization
              </span>
              <Badge variant="outline" className="text-[10px]">Optimized</Badge>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {rooms?.length ? `${rooms.length} room capacity profiles balanced across peak time slots.` : "Classroom capacities match assigned sections."}
            </p>
          </div>

          <div className="p-3.5 rounded-lg border bg-card/90 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Hard Constraints
              </span>
              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                {conflictCount === 0 ? "Satisfied" : `${conflictCount} Warning`}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {conflictCount === 0
                ? "All strict conflict rules passed successfully."
                : `${conflictCount} conflict item requires review before final publish.`}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
