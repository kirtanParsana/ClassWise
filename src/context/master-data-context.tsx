'use client';

import React, { createContext, useContext, type ReactNode } from 'react';
import type { Course, Faculty, Room, Section, Timeslot } from '@/lib/types';
import { collection } from 'firebase/firestore';
import { db } from '@/firebase/client';
import { useCollection } from '@/firebase/firestore/use-collection';

interface MasterDataContextType {
  courses: Course[] | undefined;
  faculty: Faculty[] | undefined;
  rooms: Room[] | undefined;
  sections: Section[] | undefined;
  timeslots: Timeslot[] | undefined;
  loading: boolean;
}

const MasterDataContext = createContext<MasterDataContextType | undefined>(
  undefined
);

export function MasterDataProvider({ children }: { children: ReactNode }) {
  const { data: courses, loading: loadingCourses } =
    useCollection<Course>(collection(db, 'courses'));

  const { data: faculty, loading: loadingFaculty } =
    useCollection<Faculty>(collection(db, 'faculties'));

  const { data: rooms, loading: loadingRooms } =
    useCollection<Room>(collection(db, 'rooms'));

  const { data: sections, loading: loadingSections } =
    useCollection<Section>(collection(db, 'sections'));

  const { data: timeslots, loading: loadingTimeslots } =
    useCollection<Timeslot>(collection(db, 'timeslots'));

  const loading =
    loadingCourses ||
    loadingFaculty ||
    loadingRooms ||
    loadingSections ||
    loadingTimeslots;

  return (
    <MasterDataContext.Provider
      value={{ courses, faculty, rooms, sections, timeslots, loading }}
    >
      {children}
    </MasterDataContext.Provider>
  );
}

export function useMasterData() {
  const ctx = useContext(MasterDataContext);
  if (!ctx) {
    throw new Error('useMasterData must be used within a MasterDataProvider');
  }
  return ctx;
}

