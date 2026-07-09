"use client";

import { useState } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase/client";
import { useCollection } from "@/firebase/firestore/use-collection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const DEFAULT_SLOTS = [
  ["09:30", "10:30"],
  ["10:30", "11:30"],
  ["11:30", "12:30"],
  ["12:30", "13:30"],
  ["13:30", "14:30"],
  ["14:30", "15:30"],
];

const parse12To24 = (time: string): string | null => {
  const match = time
    .trim()
    .match(/^([1-9]|1[0-2]):([0-5][0-9])\s*([AaPp][Mm])$/);
  if (!match) return null;

  const [, hh, mm, meridiem] = match;
  let hour = Number(hh);
  if (meridiem.toUpperCase() === "AM") {
    if (hour === 12) hour = 0;
  } else if (hour !== 12) {
    hour += 12;
  }
  return `${String(hour).padStart(2, "0")}:${mm}`;
};

const format24To12 = (time: string): string => {
  const [hh, mm] = time.split(":");
  const hour24 = Number(hh);
  if (Number.isNaN(hour24) || !mm) return time;
  const meridiem = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${mm} ${meridiem}`;
};

export default function TimeslotsPage() {
  const { data: timeslots, loading } = useCollection(
    collection(db, "timeslots")
  );

  const [day, setDay] = useState("Monday");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isBreak, setIsBreak] = useState(false);
  const [editingSlot, setEditingSlot] = useState<any | null>(null);
  const [editDay, setEditDay] = useState("Monday");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [editIsBreak, setEditIsBreak] = useState(false);

  const parseNewSlotInput = () => {
    if (!startTime || !endTime) return null;
    const parsedStart = parse12To24(startTime);
    const parsedEnd = parse12To24(endTime);

    if (!parsedStart || !parsedEnd) {
      alert("Use 12-hour format like 9:30 AM");
      return null;
    }

    if (parsedStart >= parsedEnd) {
      alert("End time must be after start time");
      return null;
    }

    return { parsedStart, parsedEnd };
  };

  const addTimeslot = async () => {
    const parsed = parseNewSlotInput();
    if (!parsed) return;
    const { parsedStart, parsedEnd } = parsed;

    await addDoc(collection(db, "timeslots"), {
      day,
      startTime: parsedStart,
      endTime: parsedEnd,
      isBreak,
    });

    setStartTime("");
    setEndTime("");
    setIsBreak(false);
  };

  const addTimeslotForAllDays = async () => {
    const parsed = parseNewSlotInput();
    if (!parsed) return;
    const { parsedStart, parsedEnd } = parsed;

    const existing = (timeslots || []) as any[];
    const docsToCreate = DAYS.filter((d) => {
      return !existing.some(
        (t) =>
          t.day === d &&
          t.startTime === parsedStart &&
          t.endTime === parsedEnd
      );
    });

    if (!docsToCreate.length) {
      alert("This slot already exists for all days.");
      return;
    }

    await Promise.all(
      docsToCreate.map((d) =>
        addDoc(collection(db, "timeslots"), {
          day: d,
          startTime: parsedStart,
          endTime: parsedEnd,
          isBreak,
        })
      )
    );

    setStartTime("");
    setEndTime("");
    setIsBreak(false);
  };

  const removeTimeslot = async (id: string) => {
    await deleteDoc(doc(db, "timeslots", id));
  };

  const toggleBreakTimeslot = async (id: string, current: boolean) => {
    await updateDoc(doc(db, "timeslots", id), {
      isBreak: !current,
    });
  };

  const openEdit = (slot: any) => {
    setEditingSlot(slot);
    setEditDay(slot.day);
    setEditStartTime(format24To12(slot.startTime));
    setEditEndTime(format24To12(slot.endTime));
    setEditIsBreak(!!slot.isBreak);
  };

  const saveEdit = async () => {
    if (!editingSlot) return;
    const parsedStart = parse12To24(editStartTime);
    const parsedEnd = parse12To24(editEndTime);

    if (!parsedStart || !parsedEnd) {
      alert("Use 12-hour format like 9:30 AM");
      return;
    }
    if (parsedStart >= parsedEnd) {
      alert("End time must be after start time");
      return;
    }

    await updateDoc(doc(db, "timeslots", editingSlot.id), {
      day: editDay,
      startTime: parsedStart,
      endTime: parsedEnd,
      isBreak: editIsBreak,
    });

    setEditingSlot(null);
  };

  // ✅ SAFE SEED FUNCTION (NO DUPLICATES)
  const seedTimeslots = async () => {
    const existing = await getDocs(collection(db, "timeslots"));

    if (!existing.empty) {
      alert("Timeslots already exist. Delete them first if you want to reseed.");
      return;
    }

    for (const d of DAYS) {
      for (const [startTime, endTime] of DEFAULT_SLOTS) {
        await addDoc(collection(db, "timeslots"), {
          day: d,
          startTime,
          endTime,
          isBreak: false,
        });
      }
    }

    alert("Default timeslots (Mon–Fri, 6 slots/day) created.");
  };

  const clearAllTimeslots = async () => {
    const ok = window.confirm("Delete all timeslots?");
    if (!ok) return;
    const snap = await getDocs(collection(db, "timeslots"));
    await Promise.all(snap.docs.map((d) => deleteDoc(doc(db, "timeslots", d.id))));
  };

  if (loading) return <div>Loading timeslots...</div>;

  const groupedTimeslots = DAYS.map((day) => ({
  day,
  slots: (timeslots || [])
    .filter((t: any) => t.day === day)
    .sort((a: any, b: any) =>
      a.startTime.localeCompare(b.startTime)
    ),
}));


  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Time Slots</h1>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={seedTimeslots}>
          Seed Default Timeslots (Mon–Fri, 9:30–3:30)
        </Button>
        <Button variant="destructive" onClick={clearAllTimeslots}>
          Clear All TimeSlots
        </Button>
      </div>

      {/* 🔹 Manual Add */}
      <div className="flex gap-3 items-end">
        <Select value={day} onValueChange={setDay}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Day" />
          </SelectTrigger>
          <SelectContent>
            {DAYS.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="space-y-1">
          <Label>From</Label>
          <Input
            value={startTime}
            placeholder="e.g. 9:30 AM"
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label>To</Label>
          <Input
            value={endTime}
            placeholder="e.g. 10:30 AM"
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 pb-2">
          <Checkbox
            id="isBreak"
            checked={isBreak}
            onCheckedChange={(checked) => setIsBreak(Boolean(checked))}
          />
          <Label htmlFor="isBreak">Break time</Label>
        </div>

        <Button onClick={addTimeslot}>Add</Button>
        <Button variant="outline" onClick={addTimeslotForAllDays}>
          Add for all days
        </Button>
      </div>

      {/* 🔹 List */}
      {/* <div className="border rounded-md">
        {timeslots?.length === 0 && (
          <div className="p-4 text-muted-foreground">
            No timeslots added.
          </div>
        )} */}

      <div className="border rounded-md">
         {groupedTimeslots.map(({ day, slots }) => (
          <div key={day} className="border-b last:border-b-0">
             <div className="bg-muted px-4 py-2 font-semibold">
               {day}
             </div>

             {slots.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted-foreground">
                No slots
              </div>
             ) : (
               slots.map((t: any) => (
                <div
                  key={t.id}
                   className="flex justify-between items-center border-t px-4 py-3"
                >
                  <div className="text-sm">
                    {format24To12(t.startTime)} – {format24To12(t.endTime)}
                    {t.isBreak ? (
                      <Badge variant="secondary" className="ml-2">
                        Break
                      </Badge>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleBreakTimeslot(t.id, !!t.isBreak)}
                    >
                      {t.isBreak ? "Unmark break" : "Mark break"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(t)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeTimeslot(t.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        ))}
      </div>
      <Dialog open={!!editingSlot} onOpenChange={(open) => !open && setEditingSlot(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit TimeSlot</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={editDay} onValueChange={setEditDay}>
              <SelectTrigger>
                <SelectValue placeholder="Day" />
              </SelectTrigger>
              <SelectContent>
                {DAYS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>From</Label>
                <Input
                  value={editStartTime}
                  placeholder="e.g. 1:30 PM"
                  onChange={(e) => setEditStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>To</Label>
                <Input
                  value={editEndTime}
                  placeholder="e.g. 2:30 PM"
                  onChange={(e) => setEditEndTime(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="editIsBreak"
                checked={editIsBreak}
                onCheckedChange={(checked) => setEditIsBreak(Boolean(checked))}
              />
              <Label htmlFor="editIsBreak">Break time</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSlot(null)}>
              Cancel
            </Button>
            <Button onClick={saveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

        {/* {timeslots?.map((t: any) => (
          <div
            key={t.id}
            className="flex justify-between items-center border-b p-3"
          >
            <div>
              <div className="font-medium">{t.day}</div>
              <div className="text-sm text-muted-foreground">
                {t.startTime} – {t.endTime}
              </div>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => removeTimeslot(t.id)}
            >
              Delete
            </Button>
          </div>
        ))} */}
      </div>
    // </div>
  );
}
