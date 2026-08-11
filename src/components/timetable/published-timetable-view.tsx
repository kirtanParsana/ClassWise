"use client";

import { useEffect, useState, useMemo } from "react";
import TimetableView from "@/components/timetable/timetable-view";
import { useMasterData } from "@/context/master-data-context";
import { schedulesToEntries } from "@/services/scheduleService";
import type { ScheduleDoc } from "@/types/timetable";
import type { ScheduleEntry, Day } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PublishedTimetableViewProps {
  schedules: ScheduleDoc[];
  viewBy: "faculty" | "section";
  filterId: string;
  loading?: boolean;
}

function getTodayName(): Day {
  const dayIndex = new Date().getDay();
  const map: Record<number, Day> = {
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
  };
  return map[dayIndex] ?? "Monday";
}

export function PublishedTimetableView({
  schedules,
  viewBy,
  filterId,
  loading,
}: PublishedTimetableViewProps) {
  const { courses = [], faculty = [], rooms = [], timeslots = [], loading: masterLoading } = useMasterData();
  const schedule = useMemo(() => schedulesToEntries(schedules), [schedules]);
  const today = getTodayName();

  const todayEntries = useMemo(
    () =>
      schedule
        .filter((e) => e.day === today)
        .sort((a, b) => a.timeslot.localeCompare(b.timeslot)),
    [schedule, today]
  );

  const nextClass = todayEntries[0];

  if (loading || masterLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!schedules.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Clock className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="font-medium text-muted-foreground">No published timetable available</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Your schedule will appear here once the HOD publishes the timetable.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-headline">Today&apos;s Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            {todayEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No classes scheduled for {today}.</p>
            ) : (
              <ul className="space-y-2">
                {todayEntries.map((entry, i) => {
                  const course = courses.find((c) => c.id === entry.courseId);
                  return (
                    <li key={`${entry.day}-${entry.timeslot}-${i}`} className="rounded border p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{course?.name ?? entry.courseId}</span>
                        <Badge variant="outline">{entry.timeslot}</Badge>
                      </div>
                      <p className="mt-1 text-muted-foreground">
                        {viewBy === "section"
                          ? faculty.find((f) => f.id === entry.facultyId)?.name
                          : `Section ${entry.section}`}{" "}
                        · {rooms.find((r) => r.id === entry.roomId)?.name}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-headline">Next Class</CardTitle>
          </CardHeader>
          <CardContent>
            {!nextClass ? (
              <p className="text-sm text-muted-foreground">No upcoming class today.</p>
            ) : (
              <div className="rounded-lg bg-primary/5 p-4">
                <p className="font-semibold">
                  {courses.find((c) => c.id === nextClass.courseId)?.name}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{nextClass.timeslot}</p>
                <p className="text-sm">
                  {rooms.find((r) => r.id === nextClass.roomId)?.name}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Weekly Timetable</CardTitle>
        </CardHeader>
        <CardContent>
          <TimetableView
            viewBy={viewBy}
            filterId={filterId}
            schedule={schedule}
            courses={courses}
            faculty={faculty}
            rooms={rooms}
            timeslots={timeslots}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export { getTodayName };
