'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, CalendarRange, UserCircle2, GraduationCap, LayoutGrid, Hash } from "lucide-react";
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
            Welcome, {profile?.name ?? "Student"}
          </h1>
          <Badge variant="outline" className="text-sm">
            Student
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          View your class schedule, weekly timetable, and manage your profile.
        </p>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {profile?.studentId && (
            <div className="flex items-center gap-2">
              <UserCircle2 className="h-4 w-4" />
              <span>Student ID: {profile.studentId}</span>
            </div>
          )}
          {profile?.sectionId && (
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              <span>Section: {profile.sectionId}</span>
            </div>
          )}
          {profile?.semester && (
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              <span>Semester: {profile.semester}</span>
            </div>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-lg flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-purple-500" />
            Academic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-xs font-medium text-muted-foreground mb-1">Student ID</p>
            <p className="text-lg font-semibold font-headline">{profile?.studentId ?? "—"}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-xs font-medium text-muted-foreground mb-1">Section</p>
            <p className="text-lg font-semibold font-headline">{profile?.sectionId ?? "—"}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-xs font-medium text-muted-foreground mb-1">Semester</p>
            <p className="text-lg font-semibold font-headline">{profile?.semester ?? "—"}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-lg flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-blue-500" />
              Today&apos;s Schedule
            </CardTitle>
            <CardDescription>Published classes for your section today.</CardDescription>
          </CardHeader>
          <CardContent>
            {!profile?.sectionId ? (
              <p className="text-sm text-destructive">
                Your profile is missing a section ID. Contact the administrator.
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

        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-lg flex items-center gap-2">
              <CalendarRange className="h-5 w-5 text-green-500" />
              Weekly Timetable
            </CardTitle>
            <CardDescription>Your section&apos;s published weekly schedule.</CardDescription>
          </CardHeader>
          <CardContent>
            {scheduleLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            ) : schedules.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed rounded-lg">
                <CalendarRange className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  No timetable has been published for your section yet.
                </p>
                <Link href="/student/timetable" className="mt-3 text-xs text-primary hover:underline">
                  Go to timetable page →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {schedules.length} published class{schedules.length === 1 ? "" : "es"} this week.
                </p>
                <Link href="/student/timetable" className="inline-flex text-sm text-primary hover:underline">
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
            href="/student/timetable"
            className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-transparent hover:border-border"
          >
            <p className="text-sm font-medium flex items-center gap-2">
              <CalendarRange className="h-4 w-4" />
              My Timetable
            </p>
          </Link>
          <Link
            href="/student/profile"
            className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-transparent hover:border-border"
          >
            <p className="text-sm font-medium flex items-center gap-2">
              <UserCircle2 className="h-4 w-4" />
              My Profile
            </p>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
