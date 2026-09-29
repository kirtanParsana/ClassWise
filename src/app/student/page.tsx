'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { CalendarDays, CalendarRange, UserCircle2, GraduationCap, LayoutGrid, Hash, ArrowRight, Clock, MapPin, BookOpen } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { usePublishedSchedulesForSection } from "@/hooks/use-published-schedules";
import { TodayScheduleSummary } from "@/components/timetable/today-schedule-summary";

export default function StudentDashboardPage() {
  const { profile, loading: authLoading } = useAuth();
  const { schedules, loading: scheduleLoading, error } = usePublishedSchedulesForSection(
    profile?.sectionId
  );

  if (authLoading) {
    return (
      <div className="flex flex-col gap-8">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  // Derive next class from today's schedule if available
  const nextClass = schedules.length > 0 ? schedules[0] : null;

  return (
    <div className="flex flex-col gap-8">
      {/* Header Banner */}
      <div className="flex flex-col gap-2 border-b pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
                Welcome back, {profile?.name ?? "Student"}
              </h1>
              <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5">
                Student
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Track your upcoming classes, weekly section schedule, and room assignments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/student/timetable">
              <Button size="sm" className="gap-2 font-medium shadow-xs">
                <CalendarRange className="h-4 w-4" />
                View Full Timetable
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Next Class Featured Highlight Card */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/[0.04] to-transparent shadow-xs">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Badge className="bg-primary text-primary-foreground text-[10px] uppercase font-bold tracking-wider">
              Next Class
            </Badge>
            <Link href="/student/timetable">
              <Button variant="ghost" size="sm" className="text-xs text-primary gap-1">
                <span>View full timetable</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {nextClass ? (
            <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold font-headline text-foreground flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  {nextClass.courseName || nextClass.courseId}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    {nextClass.startTime} – {nextClass.endTime}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    Room {nextClass.roomName || nextClass.roomId}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
                    Section {nextClass.section}
                  </span>
                </div>
              </div>

              <Badge variant="secondary" className="px-3 py-1.5 text-xs font-semibold">
                Upcoming Today
              </Badge>
            </div>
          ) : (
            <div className="py-2 text-sm text-muted-foreground">
              No immediate upcoming class scheduled for today. Check your full weekly timetable for details.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Academic Information Summary Row */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-headline text-base font-bold flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" />
            Academic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="p-3.5 rounded-lg border bg-muted/30">
            <p className="text-xs font-medium text-muted-foreground mb-1">Student ID</p>
            <p className="text-lg font-bold font-headline text-foreground">{profile?.studentId ?? "—"}</p>
          </div>
          <div className="p-3.5 rounded-lg border bg-muted/30">
            <p className="text-xs font-medium text-muted-foreground mb-1">Assigned Section</p>
            <p className="text-lg font-bold font-headline text-foreground">{profile?.sectionId ?? "—"}</p>
          </div>
          <div className="p-3.5 rounded-lg border bg-muted/30">
            <p className="text-xs font-medium text-muted-foreground mb-1">Current Semester</p>
            <p className="text-lg font-bold font-headline text-foreground">{profile?.semester ? `Semester ${profile.semester}` : "—"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Detail Grids */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline text-lg font-bold flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              Today&apos;s Classes
            </CardTitle>
            <CardDescription className="text-xs">Published classes for your section today</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            {!profile?.sectionId ? (
              <p className="text-xs text-destructive">
                Your profile is missing a section ID. Please contact your coordinator.
              </p>
            ) : (
              <TodayScheduleSummary
                schedules={schedules}
                loading={scheduleLoading}
                error={error}
                viewBy="section"
                timetableHref="/student/timetable"
                emptyMessage="No classes scheduled for today."
              />
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline text-lg font-bold flex items-center gap-2">
              <CalendarRange className="h-4 w-4 text-emerald-600" />
              Weekly Overview
            </CardTitle>
            <CardDescription className="text-xs">Your section&apos;s complete published weekly schedule</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            {scheduleLoading ? (
              <div className="flex h-32 items-center justify-center">
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            ) : schedules.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed rounded-lg">
                <CalendarRange className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-xs font-medium text-muted-foreground">
                  No timetable has been published for your section yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900">
                  <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                    {schedules.length} scheduled class{schedules.length === 1 ? "" : "es"} this week.
                  </p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
                    Your timetable is up to date with the latest section room allocations.
                  </p>
                </div>

                <Link href="/student/timetable" className="block">
                  <Button variant="outline" className="w-full text-xs font-medium gap-1.5">
                    <span>Open Interactive Weekly Grid</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
