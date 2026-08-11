'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, CalendarRange, UserCircle2 } from "lucide-react";
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
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-headline text-3xl font-semibold tracking-tight">
            Welcome, {profile?.name ?? "Faculty"}
          </h1>
          <Badge variant="outline" className="text-sm">
            Faculty
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          View your timetable, check today&apos;s schedule, and manage your profile.
        </p>
        {profile?.facultyId && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserCircle2 className="h-4 w-4" />
            <span>Faculty ID: {profile.facultyId}</span>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-lg flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-blue-500" />
              Today&apos;s Schedule
            </CardTitle>
            <CardDescription>
              Published classes scheduled for today.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!profile?.facultyId ? (
              <p className="text-sm text-destructive">
                Your profile is missing a faculty ID. Contact the administrator.
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

        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-lg flex items-center gap-2">
              <CalendarRange className="h-5 w-5 text-green-500" />
              Weekly Timetable
            </CardTitle>
            <CardDescription>
              Your complete published weekly schedule.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {scheduleLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            ) : schedules.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed rounded-lg">
                <CalendarRange className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No published timetable yet</p>
                <Link href="/faculty/timetable" className="mt-3 text-xs text-primary hover:underline">
                  Go to timetable page →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {schedules.length} published slot{schedules.length === 1 ? "" : "s"} in your weekly timetable.
                </p>
                <Link
                  href="/faculty/timetable"
                  className="inline-flex items-center text-sm text-primary hover:underline"
                >
                  Open full weekly timetable →
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-lg">Quick Links</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/faculty/timetable"
            className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-transparent hover:border-border"
          >
            <p className="text-sm font-medium flex items-center gap-2">
              <CalendarRange className="h-4 w-4" />
              My Timetable
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              View your complete weekly schedule
            </p>
          </Link>
          <Link
            href="/faculty/profile"
            className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-transparent hover:border-border"
          >
            <p className="text-sm font-medium flex items-center gap-2">
              <UserCircle2 className="h-4 w-4" />
              My Profile
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              View and update your profile details
            </p>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
