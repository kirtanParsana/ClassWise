"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
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
} from "@/lib/types";

interface TimetableViewProps {
  viewBy: "section" | "faculty" | "room";
  filterId: string;
  schedule: ScheduleEntry[];
  courses: Course[];
  faculty: Faculty[];
  rooms: Room[];
  timeslots: Timeslot[];
  onEntryClick?: (entry: ScheduleEntry) => void;
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
}: TimetableViewProps) {
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

  // Fast lookup maps (avoid repeated .find() calls while rendering the grid)
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
    courseById.get(id)?.name || "Unknown Course";

  const getCourseCode = (id: string) =>
    courseById.get(id)?.code || "...";

  const getFacultyName = (id: string) =>
    facultyNameById.get(id) || "...";

  const getRoomName = (id: string) => roomNameById.get(id) || "...";

  // Filter + index once per tab/filter change (O(n)), then render is O(1) per cell.
  const entryByDayTimeslot = useMemo(() => {
    const m = new Map<string, ScheduleEntry>();
    for (const entry of schedule) {
      const matches =
        (viewBy === "section" && entry.section === filterId) ||
        (viewBy === "faculty" && entry.facultyId === filterId) ||
        (viewBy === "room" && entry.roomId === filterId);

      if (!matches) continue;
      // key = "Monday|9-10"
      m.set(`${entry.day}|${entry.timeslot}`, entry);
    }
    return m;
  }, [schedule, viewBy, filterId]);

  const getCellContent = (day: string, timeslot: string) => {
    const entry = entryByDayTimeslot.get(`${day}|${timeslot}`);

    if (!entry) return null;

    return (
      <Card
        className="w-full cursor-pointer border border-primary/25 bg-primary/[0.07] p-2.5 text-left shadow-sm transition hover:border-primary/40 hover:bg-primary/[0.11]"
        onClick={() => onEntryClick?.(entry)}
      >
        <p className="font-semibold leading-snug text-primary text-[13px]">
          <span className="line-clamp-2">
            {getCourseName(entry.courseId)} (
            {getCourseCode(entry.courseId)})
          </span>
        </p>
        <p className="mt-1 text-[12px] leading-snug text-foreground/85 line-clamp-1">
          {viewBy !== "faculty"
            ? getFacultyName(entry.facultyId)
            : `Sec ${entry.section}`}
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-1">
          {viewBy !== "room"
            ? getRoomName(entry.roomId)
            : `Sec ${entry.section}`}
        </p>
      </Card>
    );
  };

  // All unique timeslot names sorted by order
  const allTimeslotNames = useMemo(() => {
    const unique = [...new Set(timeslotsData.map(t => t.name))];
    unique.sort((a, b) => {
      const aOrder = timeslotsData.find(t => t.name === a)?.order ?? 0;
      const bOrder = timeslotsData.find(t => t.name === b)?.order ?? 0;
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

  // Keep break rows visible even if they have no class entries.
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
  }, [allTimeslotNames, entryByDayTimeslot]);

  if (!filterId) {
    return (
      <div className="flex items-center justify-center h-48 border rounded-md">
        <p className="text-muted-foreground">
          Please select a filter to view the timetable.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border/80 bg-card shadow-sm">
      <Table className="min-w-max">
        <TableHeader>
          <TableRow className="border-b bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-[88px] min-w-[88px] border-r font-headline text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Time
            </TableHead>
            {AllDays.map((day) => (
              <TableHead
                key={day}
                className="min-w-[140px] text-center font-headline text-sm font-semibold"
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
                  ? "bg-amber-50/70"
                  : ""
              }`}
            >
              <TableCell className="border-r bg-muted/25 py-2 align-middle text-xs font-medium tabular-nums text-muted-foreground">
                {timeslotDisplayNameByName.get(timeslotName) ?? timeslotName}
              </TableCell>

              {AllDays.map((day) => {
                const daySlot = timeslotsData.find(
                  (t) => t.day === day && t.name === timeslotName
                );

                return (
                  <TableCell
                    key={day}
                    className="p-1.5 align-top min-h-[4rem] max-w-[200px]"
                  >
                    {daySlot ? (
                      daySlot.isBreak ? (
                        <div className="flex min-h-[2rem] items-center justify-center rounded-md border border-amber-200 bg-amber-100 text-xs font-semibold text-amber-900">
                          Break
                        </div>
                      ) : (
                        getCellContent(day, timeslotName)
                      )
                    ) : (
                      <div className="min-h-[2rem] w-full rounded-md bg-muted/25" />
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
