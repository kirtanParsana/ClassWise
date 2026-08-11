"use client";

import { useEffect, useState } from "react";
import {
  getSchedulesForFaculty,
  getSchedulesForSection,
} from "@/services/scheduleService";
import type { ScheduleDoc } from "@/types/timetable";

export function usePublishedSchedulesForFaculty(facultyId?: string) {
  const [schedules, setSchedules] = useState<ScheduleDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!facultyId) {
      setSchedules([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    getSchedulesForFaculty(facultyId)
      .then(setSchedules)
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load schedule");
        setSchedules([]);
      })
      .finally(() => setLoading(false));
  }, [facultyId]);

  return { schedules, loading, error };
}

export function usePublishedSchedulesForSection(sectionId?: string) {
  const [schedules, setSchedules] = useState<ScheduleDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sectionId) {
      setSchedules([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    getSchedulesForSection(sectionId)
      .then(setSchedules)
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load schedule");
        setSchedules([]);
      })
      .finally(() => setLoading(false));
  }, [sectionId]);

  return { schedules, loading, error };
}
