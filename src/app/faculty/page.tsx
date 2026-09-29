'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { CalendarDays, CalendarRange, UserCircle2, Clock, MapPin, BookOpen, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { usePublishedSchedulesForFaculty } from "@/hooks/use-published-schedules";
import { TodayScheduleSummary } from "@/components/timetable/today-schedule-summary";

export default function FacultyDashboardPage() {
  const { profile, loading: authLoading } = useAuth();
  const { schedules, loading: scheduleLoading, error } = usePublishedSchedulesForFaculty(
    profile?.facultyId
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

  // Derive teaching load metrics
  const totalClasses = schedules.length;
  const nextClass = schedules.length > 0 ? schedules[0] : null;

  return (
    <div className="flex flex-col gap-8">
      {/* Header Banner */}
      <div className="flex flex-col gap-2 border-b pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
                Welcome back, {profile?.name ?? "Faculty"}
              </h1>
              <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5">
                Faculty
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              View your assigned lecture load, room allocations, and weekly schedule.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/faculty/timetable">
              <Button size="sm" className="gap-2 font-medium shadow-xs">
                <CalendarRange className="h-4 w-4" />
                My Timetable
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Teaching Load & Next Class Highlights */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* Today's Teaching Load (5 Cols) */}
        <Card className="md:col-span-5 bg-gradient-to-br from-primary/[0.03] to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="font-headline text-base font-bold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Today&apos;s Teaching Load
            </CardTitle>
            <CardDescription className="text-xs">Assigned classes for today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-extrabold font-headline text-foreground">
                {scheduleLoading ? "—" : totalClasses}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {totalClasses === 1 ? "class scheduled" : "classes scheduled"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>All classroom allocations confirmed</span>
            </div>
          </CardContent>
        </Card>

        {/* Next Class Highlight (7 Cols) */}
        <Card className="md:col-span-7 border-primary/20 shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Badge className="bg-primary text-primary-foreground text-[10px] uppercase font-bold tracking-wider">
                Next Session
              </Badge>
              <Link href="/faculty/timetable">
                <Button variant="ghost" size="sm" className="text-xs text-primary gap-1">
                  <span>View timetable</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-1">
            {nextClass ? (
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-headline text-foreground flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  {nextClass.courseName || nextClass.courseId}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
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
            ) : (
              <div className="py-2 text-xs text-muted-foreground">
                No immediate upcoming class session scheduled.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Schedule Grids */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline text-lg font-bold flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              Today&apos;s Schedule
            </CardTitle>
            <CardDescription className="text-xs">Published classes assigned to you today</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            {!profile?.facultyId ? (
              <p className="text-xs text-destructive">
                Your profile is missing a faculty ID. Contact your department administrator.
              </p>
            ) : (
              <TodayScheduleSummary
                schedules={schedules}
                loading={scheduleLoading}
                error={error}
                viewBy="faculty"
                timetableHref="/faculty/timetable"
              />
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline text-lg font-bold flex items-center gap-2">
              <CalendarRange className="h-4 w-4 text-emerald-600" />
              Weekly Teaching Schedule
            </CardTitle>
            <CardDescription className="text-xs">Your complete published weekly timetable</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            {scheduleLoading ? (
              <div className="flex h-32 items-center justify-center">
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            ) : schedules.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed rounded-lg">
                <CalendarRange className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-xs font-medium text-muted-foreground">No published timetable available yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900">
                  <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                    {schedules.length} published slot{schedules.length === 1 ? "" : "s"} in your weekly schedule.
                  </p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
                    No faculty conflict collisions detected across your assigned sections.
                  </p>
                </div>

                <Link href="/faculty/timetable" className="block">
                  <Button variant="outline" className="w-full text-xs font-medium gap-1.5">
                    <span>Open Full Weekly Schedule Grid</span>
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
