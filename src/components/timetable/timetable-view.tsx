"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AllDays,
  ScheduleEntry,
  Course,
  Faculty,
  Room,
  Timeslot,
  Day,
} from "@/lib/types";
import { AlertTriangle, Clock, MapPin, User as UserIcon } from "lucide-react";

interface TimetableViewProps {
  viewBy: "section" | "faculty" | "room";
  filterId: string;
  schedule: ScheduleEntry[];
  courses: Course[];
  faculty: Faculty[];
  rooms: Room[];
  timeslots: Timeslot[];
  onEntryClick?: (entry: ScheduleEntry) => void;
  conflicts?: Array<{ day?: string; timeslot?: string; description?: string }>;
}

export default function TimetableView({
  viewBy,
  filterId,
  schedule,
  courses,
  faculty,
  rooms,
  timeslots,
  onEntryClick,
  conflicts = [],
}: TimetableViewProps) {
  const [selectedMobileDay, setSelectedMobileDay] = useState<Day>("Monday");

  const formatRangeTo12Hour = (range: string): string => {
    const [start, end] = range.split("-");
    if (!start || !end || !start.includes(":") || !end.includes(":")) {
      return range;
    }

    const formatSingle = (value: string) => {
      const [hh, mm] = value.split(":");
      const hour24 = Number(hh);
      if (Number.isNaN(hour24) || !mm) return value;
      const meridiem = hour24 >= 12 ? "PM" : "AM";
      const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
      return `${hour12}:${mm} ${meridiem}`;
    };

    return `${formatSingle(start)} - ${formatSingle(end)}`;
  };

  const timeslotsData = useMemo(() => {
    return (
      timeslots as Array<
        Timeslot & { startTime?: string; endTime?: string; isBreak?: boolean }
      >
    )
      .map((slot) => {
        const fallbackName =
          slot.startTime && slot.endTime
            ? `${slot.startTime}-${slot.endTime}`
            : "";
        const normalizedName = slot.name || fallbackName;
        const normalizedOrder =
          typeof slot.order === "number"
            ? slot.order
            : slot.startTime
            ? (() => {
                const [h, m] = slot.startTime.split(":");
                return Number(h) * 60 + Number(m);
              })()
            : 0;

        return {
          ...slot,
          name: normalizedName,
          order: normalizedOrder,
          isBreak: !!slot.isBreak,
        };
      })
      .filter((slot) => slot.day && slot.name);
  }, [timeslots]);

  // Fast lookup maps
  const courseById = useMemo(() => {
    const m = new Map<string, Course>();
    for (const c of courses) m.set(c.id, c);
    return m;
  }, [courses]);

  const facultyNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const f of faculty) m.set(f.id, f.name);
    return m;
  }, [faculty]);

  const roomNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const r of rooms) m.set(r.id, r.name);
    return m;
  }, [rooms]);

  const getCourseName = (id: string) =>
    courseById.get(id)?.name || "Course " + id;

  const getCourseCode = (id: string) =>
    courseById.get(id)?.code || id;

  const getFacultyName = (id: string) =>
    facultyNameById.get(id) || id;

  const getRoomName = (id: string) => roomNameById.get(id) || id;

  const entryByDayTimeslot = useMemo(() => {
    const m = new Map<string, ScheduleEntry>();
    for (const entry of schedule) {
      const matches =
        (viewBy === "section" && entry.section === filterId) ||
        (viewBy === "faculty" && entry.facultyId === filterId) ||
        (viewBy === "room" && entry.roomId === filterId);

      if (!matches) continue;
      m.set(`${entry.day}|${entry.timeslot}`, entry);
    }
    return m;
  }, [schedule, viewBy, filterId]);

  const conflictByDayTimeslot = useMemo(() => {
    const m = new Map<string, boolean>();
    for (const c of conflicts) {
      if (c.day && c.timeslot) {
        m.set(`${c.day}|${c.timeslot}`, true);
      }
    }
    return m;
  }, [conflicts]);

  const renderClassCard = (entry: ScheduleEntry, day: string, timeslot: string) => {
    const isConflict = conflictByDayTimeslot.has(`${day}|${timeslot}`);
    const isLab = entry.courseId.toLowerCase().includes("lab") || entry.courseId.includes("LAB");

    return (
      <Card
        className={`w-full cursor-pointer p-3 text-left shadow-xs transition-all duration-150 rounded-xl ${
          isConflict
            ? "border-destructive/60 bg-destructive/10 hover:bg-destructive/15"
            : "border-border bg-card hover:border-primary/50 hover:shadow-md"
        }`}
        onClick={() => onEntryClick?.(entry)}
      >
        <div className="flex items-start justify-between gap-1.5 mb-1.5">
          <Badge
            variant="outline"
            className={`text-[10px] font-bold py-0.5 px-2 tracking-wide uppercase ${
              isConflict
                ? "border-destructive text-destructive bg-destructive/10"
                : isLab
                ? "border-indigo-300 text-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-300"
                : "border-blue-300 text-blue-700 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-300"
            }`}
          >
            {isConflict ? "⚠ Conflict" : isLab ? `LAB · ${entry.section}` : `LEC · ${entry.section}`}
          </Badge>
          <span className="text-[10px] font-mono text-muted-foreground font-semibold">
            {getCourseCode(entry.courseId)}
          </span>
        </div>

        {/* Hierarchy 1: Course Name */}
        <p className="font-headline text-xs font-bold text-foreground leading-snug line-clamp-2">
          {getCourseName(entry.courseId)}
        </p>

        {/* Hierarchy 2: Faculty */}
        <p className="mt-1.5 text-[11px] font-medium text-foreground/80 flex items-center gap-1 line-clamp-1">
          <UserIcon className="h-3 w-3 text-muted-foreground shrink-0" />
          <span>
            {viewBy !== "faculty"
              ? getFacultyName(entry.facultyId)
              : `Section ${entry.section}`}
          </span>
        </p>

        {/* Hierarchy 3: Room */}
        <p className="mt-0.5 text-[11px] text-muted-foreground flex items-center gap-1 line-clamp-1">
          <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
          <span>
            {viewBy !== "room"
              ? getRoomName(entry.roomId)
              : `Section ${entry.section}`}
          </span>
        </p>
      </Card>
    );
  };

  const allTimeslotNames = useMemo(() => {
    const unique = [...new Set(timeslotsData.map((t) => t.name))];
    unique.sort((a, b) => {
      const aOrder = timeslotsData.find((t) => t.name === a)?.order ?? 0;
      const bOrder = timeslotsData.find((t) => t.name === b)?.order ?? 0;
      return aOrder - bOrder;
    });
    return unique;
  }, [timeslotsData]);

  const timeslotDisplayNameByName = useMemo(() => {
    const map = new Map<string, string>();
    for (const slot of timeslotsData) {
      if (!map.has(slot.name)) {
        map.set(slot.name, formatRangeTo12Hour(slot.name));
      }
    }
    return map;
  }, [timeslotsData]);

  const visibleTimeslotNames = useMemo(() => {
    const used = new Set<string>();
    for (const key of entryByDayTimeslot.keys()) {
      const i = key.indexOf("|");
      if (i === -1) continue;
      used.add(key.slice(i + 1));
    }
    const breakSlots = new Set(
      timeslotsData.filter((t) => t.isBreak).map((t) => t.name)
    );
    if (used.size === 0) return allTimeslotNames;
    return allTimeslotNames.filter((t) => used.has(t) || breakSlots.has(t));
  }, [allTimeslotNames, entryByDayTimeslot, timeslotsData]);

  if (!filterId) {
    return (
      <div className="flex flex-col items-center justify-center h-48 border border-dashed rounded-xl p-8 text-center bg-card">
        <Clock className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm font-semibold text-foreground">Select a filter to view schedule</p>
        <p className="text-xs text-muted-foreground mt-1">Choose a section, faculty member, or room allocation.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile Responsive Selector (Visible on small screens) */}
      <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {AllDays.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedMobileDay(day)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedMobileDay === day
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Mobile Day Timeline View */}
      <div className="md:hidden space-y-3">
        {visibleTimeslotNames.map((timeslotName) => {
          const entry = entryByDayTimeslot.get(`${selectedMobileDay}|${timeslotName}`);
          const daySlot = timeslotsData.find(
            (t) => t.day === selectedMobileDay && t.name === timeslotName
          );

          return (
            <div key={timeslotName} className="space-y-1.5">
              <span className="text-[11px] font-bold text-muted-foreground tracking-wide uppercase">
                {timeslotDisplayNameByName.get(timeslotName) ?? timeslotName}
              </span>
              {daySlot?.isBreak ? (
                <div className="flex py-2.5 px-3 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/40 text-xs font-bold text-amber-800 dark:text-amber-300">
                  BREAK
                </div>
              ) : entry ? (
                renderClassCard(entry, selectedMobileDay, timeslotName)
              ) : (
                <div className="flex p-3 items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 text-xs font-medium text-muted-foreground">
                  FREE · No class scheduled
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop Weekly Grid View */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border/80 bg-card shadow-xs">
        <Table className="min-w-max">
          <TableHeader>
            <TableRow className="border-b bg-muted/40 hover:bg-muted/40">
              <TableHead className="sticky left-0 z-10 w-[110px] min-w-[110px] border-r bg-muted/90 backdrop-blur-xs font-headline text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Time
              </TableHead>
              {AllDays.map((day) => (
                <TableHead
                  key={day}
                  className="min-w-[170px] max-w-[220px] text-center font-headline text-sm font-bold text-foreground py-3"
                >
                  {day}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {visibleTimeslotNames.map((timeslotName) => (
              <TableRow
                key={timeslotName}
                className={`border-b last:border-0 hover:bg-muted/20 ${
                  timeslotsData.some((t) => t.name === timeslotName && t.isBreak)
                    ? "bg-amber-50/50 dark:bg-amber-950/20"
                    : ""
                }`}
              >
                <TableCell className="sticky left-0 z-10 border-r bg-muted/90 backdrop-blur-xs py-3 px-3 align-middle text-xs font-semibold tabular-nums text-muted-foreground">
                  {timeslotDisplayNameByName.get(timeslotName) ?? timeslotName}
                </TableCell>

                {AllDays.map((day) => {
                  const daySlot = timeslotsData.find(
                    (t) => t.day === day && t.name === timeslotName
                  );
                  const entry = entryByDayTimeslot.get(`${day}|${timeslotName}`);

                  return (
                    <TableCell
                      key={day}
                      className="p-1.5 align-top min-h-[5rem] max-w-[220px]"
                    >
                      {daySlot?.isBreak ? (
                        <div className="flex min-h-[4rem] items-center justify-center rounded-lg border border-amber-200 bg-amber-100/70 dark:bg-amber-950/40 text-xs font-extrabold tracking-wider text-amber-900 dark:text-amber-200">
                          BREAK
                        </div>
                      ) : entry ? (
                        renderClassCard(entry, day, timeslotName)
                      ) : (
                        <div className="flex min-h-[4.5rem] w-full flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/15 p-2 text-center">
                          <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">FREE</span>
                        </div>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
