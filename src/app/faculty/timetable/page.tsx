"use client";

import { Badge } from "@/components/ui/badge";
import { PublishedTimetableView } from "@/components/timetable/published-timetable-view";
import { useAuth } from "@/context/auth-context";
import { usePublishedSchedulesForFaculty } from "@/hooks/use-published-schedules";

export default function FacultyTimetablePage() {
  const { profile } = useAuth();
  const { schedules, loading, error } = usePublishedSchedulesForFaculty(profile?.facultyId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-headline text-3xl font-semibold tracking-tight">My Timetable</h1>
        <Badge variant="outline">Faculty</Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        Your published teaching schedule only. Unpublished timetables are not visible.
      </p>

      {!profile?.facultyId ? (
        <p className="text-sm text-destructive">
          Your profile is missing a faculty ID. Contact the administrator.
        </p>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        <PublishedTimetableView
          schedules={schedules}
          viewBy="faculty"
          filterId={profile.facultyId}
          loading={loading}
        />
      )}
    </div>
  );
}
