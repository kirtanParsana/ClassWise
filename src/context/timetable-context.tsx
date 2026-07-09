'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { ScheduleEntry } from '@/lib/types';

interface TimetableContextType {
  schedule: ScheduleEntry[];
  setSchedule: (schedule: ScheduleEntry[]) => void;
}

const TimetableContext = createContext<TimetableContextType | undefined>(undefined);

export function TimetableProvider({ children }: { children: ReactNode }) {
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);

  return (
    <TimetableContext.Provider value={{ schedule, setSchedule }}>
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
