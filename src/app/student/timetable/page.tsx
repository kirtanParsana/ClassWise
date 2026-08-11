"use client";

import { Badge } from "@/components/ui/badge";
import { PublishedTimetableView } from "@/components/timetable/published-timetable-view";
import { useAuth } from "@/context/auth-context";
import { usePublishedSchedulesForSection } from "@/hooks/use-published-schedules";

export default function StudentTimetablePage() {
  const { profile } = useAuth();
  const { schedules, loading, error } = usePublishedSchedulesForSection(profile?.sectionId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-headline text-3xl font-semibold tracking-tight">My Timetable</h1>
        <Badge variant="outline">Student</Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        Your section&apos;s published schedule only. Draft and under-review timetables are hidden.
      </p>

      {!profile?.sectionId ? (
        <p className="text-sm text-destructive">
          Your profile is missing a section ID. Contact the administrator.
        </p>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        <PublishedTimetableView
          schedules={schedules}
          viewBy="section"
          filterId={profile.sectionId}
          loading={loading}
        />
      )}
    </div>
  );
}
