'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { ScheduleEntry } from '@/lib/types';

interface TimetableContextType {
  schedule: ScheduleEntry[];
  setSchedule: React.Dispatch<React.SetStateAction<ScheduleEntry[]>>;
  activeTimetableId: string | null;
  setActiveTimetableId: React.Dispatch<React.SetStateAction<string | null>>;
}

const TimetableContext = createContext<TimetableContextType | undefined>(undefined);

export function TimetableProvider({ children }: { children: ReactNode }) {
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [activeTimetableId, setActiveTimetableId] = useState<string | null>(null);

  return (
    <TimetableContext.Provider
      value={{ schedule, setSchedule, activeTimetableId, setActiveTimetableId }}
    >
      {children}
    </TimetableContext.Provider>
  );
}

export function useTimetable() {
  const context = useContext(TimetableContext);
  if (context === undefined) {
    throw new Error('useTimetable must be used within a TimetableProvider');
  }
  return context;
}
