"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import TimetableView from "@/components/timetable/timetable-view";
import { TimetableGenerator } from "@/components/timetable/timetable-generator";

import type { ScheduleEntry } from "@/lib/types";
import { Download, Loader2 } from "lucide-react";

import { jsPDF } from "jspdf";

import { collection, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/client";
import { useCollection } from "@/firebase/firestore/use-collection";
import { setDocumentNonBlocking } from "@/firebase";
import { deleteDocumentNonBlocking } from "@/firebase";
import { useToast } from "@/hooks/use-toast";

import { useTimetable } from "@/context/timetable-context";
import { useMasterData } from "@/context/master-data-context";
import { getTimetable } from "@/services/timetableService";
import { getSchedulesForTimetable, schedulesToEntries } from "@/services/scheduleService";
import { TimetableWorkflowBanner } from "@/components/timetable/timetable-workflow-banner";
import type { TimetableMeta } from "@/types/timetable";
import { getDoc } from "firebase/firestore";

const EMPTY_ARRAY: never[] = [];

export default function TimetablePageContent() {
  const searchParams = useSearchParams();
  const workflowTimetableId = searchParams.get("id");

  const { schedule, setSchedule, activeTimetableId, setActiveTimetableId } = useTimetable();
  const { toast } = useToast();

  const [workflowTimetable, setWorkflowTimetable] = useState<TimetableMeta | null>(null);

  const timetableRef = useRef<HTMLDivElement | null>(null);

  const [viewBy, setViewBy] = useState<"section" | "faculty" | "room">(
    schedule.length > 0 ? "section" : "section"
  );

  /* ---------- FETCH MASTER DATA (from shared context) ---------- */

  const { courses: coursesData, faculty: facultyData, rooms: roomsData, sections: sectionsData, timeslots: timeslotsData, loading: masterLoading } =
    useMasterData();

  const { data: timetableHistory } = useCollection<any>(
    collection(db, "timetables")
  );

  /* ---------- DERIVED DATA ---------- */

  const generatedSections = [...new Set(schedule.map((s) => s.section))].sort();

  const courses = coursesData ?? [];
  const faculty = facultyData ?? EMPTY_ARRAY;
  const rooms = roomsData ?? EMPTY_ARRAY;
  const sections = sectionsData ?? [];
  const timeslots = timeslotsData ?? [];

  /* ---------- FILTER STATE ---------- */

  const [selectedSection, setSelectedSection] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedHistoryId, setSelectedHistoryId] = useState("");
  const [editingEntry, setEditingEntry] = useState<ScheduleEntry | null>(null);
  const [editingFacultyId, setEditingFacultyId] = useState("");
  const [editingRoomId, setEditingRoomId] = useState("");
  const [isSavingTimetable, setIsSavingTimetable] = useState(false);
  const [isDeletingTimetable, setIsDeletingTimetable] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [pdfMode, setPdfMode] = useState<"compact" | "detailed">("detailed");

  useEffect(() => {
    if (!workflowTimetableId) {
      setWorkflowTimetable(null);
      return;
    }

    const id = workflowTimetableId;
    setActiveTimetableId(id);
    setSelectedHistoryId(id);

    async function loadWorkflowTimetable() {
      const meta = await getTimetable(id);
      if (!meta) return;
      setWorkflowTimetable(meta);

      if (schedule.length > 0 && activeTimetableId === id) {
        return;
      }

      let entries = await getSchedulesForTimetable(id).then(schedulesToEntries);
      if (!entries.length) {
        const snap = await getDoc(doc(db, "timetables", id));
        entries = (snap.data()?.schedule as ScheduleEntry[]) ?? [];
      }
      if (entries.length) {
        setSchedule(entries);
        const sections = [...new Set(entries.map((s) => s.section))].sort();
        if (sections[0]) setSelectedSection(sections[0]);
      }
    }

    void loadWorkflowTimetable();
  }, [workflowTimetableId, setActiveTimetableId, setSchedule, activeTimetableId, schedule.length]);

  /* ---------- EFFECT: AUTO-SELECT DEFAULTS ---------- */

  useEffect(() => {
    if (generatedSections.length > 0 && !selectedSection) {
      setSelectedSection(generatedSections[0]);
    }

    if (faculty.length > 0 && !selectedFaculty) {
      setSelectedFaculty(faculty[0].id);
    }

    if (rooms.length > 0 && !selectedRoom) {
      setSelectedRoom(rooms[0].id);
    }
  }, [
    schedule,
    generatedSections,
    faculty,
    rooms,
    selectedSection,
    selectedFaculty,
    selectedRoom,
  ]);

  /* ---------- CALLBACK FROM GENERATOR ---------- */

  const handleTimetableGenerated = (newSchedule: ScheduleEntry[], timetableId?: string) => {
    setSchedule(newSchedule);

    if (timetableId) {
      setSelectedHistoryId(timetableId);
      setActiveTimetableId(timetableId);
    }

    const newSections = [...new Set(newSchedule.map((s) => s.section))].sort();

    if (newSections.length > 0) {
      setViewBy("section");
      setSelectedSection(newSections[0]);
    } else {
      setSelectedSection("");
    }
  };

  const dataIsLoading = masterLoading;

  const sortedHistory = (timetableHistory ?? []).slice().sort(
    (a: any, b: any) => {
      const ta = a.createdAt?.seconds ?? 0;
      const tb = b.createdAt?.seconds ?? 0;
      return tb - ta;
    }
  );

  const handleHistorySelect = (id: string) => {
    setSelectedHistoryId(id);
    const selected = sortedHistory.find((t: any) => t.id === id);
    if (selected?.schedule) {
      setSchedule(selected.schedule as ScheduleEntry[]);
    }
  };

  const handleEntryClick = (entry: ScheduleEntry) => {
    setEditingEntry(entry);
    setEditingFacultyId(entry.facultyId);
    setEditingRoomId(entry.roomId);
  };

  const handleApplyEdit = () => {
    if (!editingEntry) return;

    setSchedule((prev) =>
      prev.map((e) => {
        // Keep one faculty per subject (course) per section
        if (e.courseId === editingEntry.courseId && e.section === editingEntry.section) {
          return {
            ...e,
            facultyId: editingFacultyId || e.facultyId,
            ...(e.day === editingEntry.day && e.timeslot === editingEntry.timeslot
              ? { roomId: editingRoomId || e.roomId }
              : {}),
          };
        }
        return e;
      })
    );

    setEditingEntry(null);
  };

  const handleSaveTimetable = async () => {
    if (!schedule.length) {
      toast({
        title: "Nothing to save",
        description: "Generate or load a timetable first.",
      });
      return;
    }

    setIsSavingTimetable(true);
    try {
      const base = {
        schedule,
        sections: generatedSections,
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        updatedAt: serverTimestamp(),
      };

      if (selectedHistoryId) {
        await setDocumentNonBlocking(
          doc(db, "timetables", selectedHistoryId),
          base,
          { merge: true }
        );
      } else {
        const newDocRef = doc(collection(db, "timetables"));
        await setDocumentNonBlocking(
          newDocRef,
          { ...base, createdAt: serverTimestamp() },
          {}
        );
        setSelectedHistoryId(newDocRef.id);
      }

      toast({
        title: "Timetable saved",
        description: "Your current timetable has been stored for later editing.",
      });
    } catch (error) {
      console.error("Failed to save timetable", error);
      toast({
        title: "Save failed",
        description: "Could not save the timetable.",
        variant: "destructive",
      });
    } finally {
      setIsSavingTimetable(false);
    }
  };

  const handleDeleteSavedTimetable = async () => {
    if (!selectedHistoryId) {
      toast({
        title: "Select a timetable",
        description: "Choose a saved timetable to delete.",
      });
      return;
    }

    setIsDeletingTimetable(true);
    try {
      await deleteDocumentNonBlocking(doc(db, "timetables", selectedHistoryId));

      // If currently loaded view came from the deleted timetable, clear it.
      setSchedule([]);
      setSelectedHistoryId("");
      setSelectedSection("");

      toast({
        title: "Timetable deleted",
        description: "Saved timetable version has been deleted.",
      });
    } catch (error) {
      console.error("Failed to delete timetable", error);
      toast({
        title: "Delete failed",
        description: "Could not delete the selected timetable.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingTimetable(false);
    }
  };

  const getFacultyLabel = (id: string) =>
    faculty.find((f) => f.id === id)?.name || id;

  const getRoomLabel = (id: string) =>
    rooms.find((r) => r.id === id)?.name || id;

  const buildPdfFilename = () => {
    let base = "Timetable";

    if (viewBy === "section" && selectedSection) {
      base = `${selectedSection} Updated TT`;
    } else if (viewBy === "faculty" && selectedFaculty) {
      base = `${getFacultyLabel(selectedFaculty)} Timetable`;
    } else if (viewBy === "room" && selectedRoom) {
      base = `${getRoomLabel(selectedRoom)} Timetable`;
    }

    // Remove characters that are invalid in filenames on Windows.
    base = base.replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim();

    return `${base || "Timetable"} (${pdfMode}).pdf`;
  };

  const handleDownloadPdf = async () => {
    if (!schedule.length) {
      toast({
        title: "Nothing to export",
        description: "Generate or load a timetable first.",
      });
      return;
    }

    const activeFilterId =
      viewBy === "section"
        ? selectedSection
        : viewBy === "faculty"
        ? selectedFaculty
        : selectedRoom;

    if (!activeFilterId) {
      toast({
        title: "Select a view",
        description: "Choose a section, faculty, or room before exporting.",
      });
      return;
    }

    if (!timetableRef.current) {
      toast({
        title: "Timetable not ready",
        description: "Please wait for the timetable to finish loading.",
      });
      return;
    }

    try {
      const isDetailed = pdfMode === "detailed";
      const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
      const formatRangeTo12Hour = (range: string): string => {
        const [start, end] = range.split("-");
        if (!start || !end || !start.includes(":") || !end.includes(":")) {
          return range;
        }
        const to12 = (v: string) => {
          const [hh, mm] = v.split(":");
          const h = Number(hh);
          if (Number.isNaN(h) || !mm) return v;
          const ampm = h >= 12 ? "PM" : "AM";
          const h12 = h % 12 === 0 ? 12 : h % 12;
          return `${h12}:${mm} ${ampm}`;
        };
        return `${to12(start)} - ${to12(end)}`;
      };

      const normalizedTimeslots = (timeslots as Array<
        { id: string; day: string; name?: string; startTime?: string; endTime?: string; order?: number; isBreak?: boolean }
      >)
        .map((slot) => {
          const name =
            slot.name ||
            (slot.startTime && slot.endTime
              ? `${slot.startTime}-${slot.endTime}`
              : "");
          const order =
            typeof slot.order === "number"
              ? slot.order
              : slot.startTime
              ? (() => {
                  const [hh, mm] = slot.startTime!.split(":");
                  return Number(hh) * 60 + Number(mm);
                })()
              : 0;
          return { ...slot, name, order, isBreak: !!slot.isBreak };
        })
        .filter((slot) => slot.name && slot.day);

      const uniqueTimeslotNames = [...new Set(normalizedTimeslots.map((s) => s.name))]
        .sort((a, b) => {
          const oa = normalizedTimeslots.find((t) => t.name === a)?.order ?? 0;
          const ob = normalizedTimeslots.find((t) => t.name === b)?.order ?? 0;
          return oa - ob;
        });

      const filteredSchedule = schedule.filter((entry) => {
        return (
          (viewBy === "section" && entry.section === activeFilterId) ||
          (viewBy === "faculty" && entry.facultyId === activeFilterId) ||
          (viewBy === "room" && entry.roomId === activeFilterId)
        );
      });

      const entryByDaySlot = new Map<string, ScheduleEntry>();
      for (const entry of filteredSchedule) {
        entryByDaySlot.set(`${entry.day}|${entry.timeslot}`, entry);
      }

      const isBreakSlot = (day: string, slotName: string) =>
        normalizedTimeslots.some(
          (t) => t.day === day && t.name === slotName && t.isBreak
        );

      const getCourseCode = (id: string) =>
        courses.find((c) => c.id === id)?.code || "N/A";

      const getCellLines = (day: string, slotName: string): string[] => {
        if (isBreakSlot(day, slotName)) return ["BREAK"];
        const entry = entryByDaySlot.get(`${day}|${slotName}`);
        if (!entry) return [];
        const courseCode = getCourseCode(entry.courseId);
        const line2 =
          viewBy === "section"
            ? getFacultyLabel(entry.facultyId)
            : `Sec ${entry.section}`;
        const line3 =
          viewBy === "room"
            ? getFacultyLabel(entry.facultyId)
            : getRoomLabel(entry.roomId);

        if (!isDetailed) {
          return [courseCode, line2];
        }
        if (viewBy === "section") {
          return [courseCode, getFacultyLabel(entry.facultyId), getRoomLabel(entry.roomId)];
        }
        if (viewBy === "faculty") {
          return [courseCode, `Sec ${entry.section}`, getRoomLabel(entry.roomId)];
        }
        return [courseCode, `Sec ${entry.section}`, line3];
      };

      const pdf = new jsPDF("landscape", "mm", "a3");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const marginX = 10;
      const marginY = 10;
      const uniY = 10;
      const headerY = 17;
      const subHeaderY = 24;
      const tableTop = 30;
      const rowHeight = isDetailed ? 22 : 16;
      const tableWidth = pageWidth - marginX * 2;
      const timeColWidth = isDetailed ? 40 : 36;
      const dayColWidth = (tableWidth - timeColWidth) / allDays.length;

      const title =
        viewBy === "section"
          ? `Section ${activeFilterId} Timetable`
          : viewBy === "faculty"
          ? `${getFacultyLabel(activeFilterId)} Timetable`
          : `${getRoomLabel(activeFilterId)} Timetable`;

      const drawPageHeader = () => {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(17);
        pdf.text("Parul University", pageWidth / 2, uniY, { align: "center" });
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(15);
        pdf.text(title, pageWidth / 2, headerY, { align: "center" });
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.text(`Generated from ClassWise (${isDetailed ? "Detailed" : "Compact"} mode)`, pageWidth / 2, subHeaderY, {
          align: "center",
        });

        let x = marginX;
        pdf.setFillColor(232, 237, 244);
        pdf.rect(x, tableTop, timeColWidth, rowHeight, "F");
        pdf.rect(x, tableTop, timeColWidth, rowHeight);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(isDetailed ? 11 : 10);
        pdf.text("TIME", x + 4, tableTop + rowHeight / 2 + 1);
        x += timeColWidth;

        for (const day of allDays) {
          pdf.setFillColor(232, 237, 244);
          pdf.rect(x, tableTop, dayColWidth, rowHeight, "F");
          pdf.rect(x, tableTop, dayColWidth, rowHeight);
          pdf.text(day, x + dayColWidth / 2, tableTop + rowHeight / 2 + 1, { align: "center" });
          x += dayColWidth;
        }
      };

      drawPageHeader();
      let y = tableTop + rowHeight;

      for (const slotName of uniqueTimeslotNames) {
        if (y + rowHeight > pageHeight - marginY) {
          pdf.addPage("a3", "landscape");
          drawPageHeader();
          y = tableTop + rowHeight;
        }

        let x = marginX;
        pdf.setFillColor(246, 248, 252);
        pdf.rect(x, y, timeColWidth, rowHeight, "F");
        pdf.rect(x, y, timeColWidth, rowHeight);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(isDetailed ? 10.5 : 9.5);
        const timeLines = pdf.splitTextToSize(formatRangeTo12Hour(slotName), timeColWidth - 4);
        pdf.text(timeLines, x + 2, y + 6);
        x += timeColWidth;

        for (const day of allDays) {
          const lines = getCellLines(day, slotName);
          const breakCell = lines.length === 1 && lines[0] === "BREAK";

          if (breakCell) {
            pdf.setFillColor(251, 236, 186);
            pdf.rect(x, y, dayColWidth, rowHeight, "F");
          }
          pdf.rect(x, y, dayColWidth, rowHeight);

          if (lines.length > 0) {
            if (breakCell) {
              pdf.setFont("helvetica", "bold");
              pdf.setFontSize(isDetailed ? 11 : 10);
              pdf.text("BREAK", x + dayColWidth / 2, y + rowHeight / 2 + 1, { align: "center" });
            } else {
              pdf.setFont("helvetica", "normal");
              pdf.setFontSize(isDetailed ? 10 : 9);
              const wrapped = pdf.splitTextToSize(lines.join("\n"), dayColWidth - 4);
              const limited = wrapped.slice(0, isDetailed ? 6 : 3);
              pdf.text(limited, x + 2, y + 5.5);
            }
          }
          x += dayColWidth;
        }

        y += rowHeight;
      }

      pdf.save(buildPdfFilename());
    } catch (error) {
      console.error("Failed to export timetable as PDF", error);
      toast({
        title: "Export failed",
        description: "Could not generate the PDF timetable.",
        variant: "destructive",
      });
    }
  };

  /* ---------- RENDER ---------- */

  return (
    <div className="space-y-6">
      {workflowTimetable && (
        <TimetableWorkflowBanner timetable={workflowTimetable} mode="edit" />
      )}
      <Card className="overflow-hidden border-border/60 shadow-sm">
        <CardHeader className="gap-4 border-b bg-muted/20 pb-6 pt-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <CardTitle className="font-headline text-2xl tracking-tight">
              Timetables
            </CardTitle>
            <CardDescription className="max-w-xl text-sm leading-relaxed">
              Switch by section, faculty, or room. Click a cell to edit a slot.
            </CardDescription>
          </div>
          <TimetableGenerator
            variant="button"
            onTimetableGenerated={handleTimetableGenerated}
          />
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <div className="space-y-5">
            <Tabs
              value={viewBy}
              onValueChange={(v) =>
                setViewBy(v as "section" | "faculty" | "room")
              }
            >
              <TabsList className="grid h-10 w-full max-w-xl grid-cols-3 rounded-lg bg-muted/60 p-1">
                <TabsTrigger className="text-sm" value="section">
                  By Section
                </TabsTrigger>
                <TabsTrigger className="text-sm" value="faculty">
                  By Faculty
                </TabsTrigger>
                <TabsTrigger className="text-sm" value="room">
                  By Room
                </TabsTrigger>
              </TabsList>
            </Tabs>

              <div className="rounded-xl border border-border/80 bg-card p-4 shadow-xs space-y-4">
                {/* Top Control Bar: Context & Week Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    <span className="text-muted-foreground">Viewing:</span>
                    <Badge variant="outline" className="font-bold text-xs py-0.5">
                      {viewBy === "section"
                        ? `Section ${selectedSection || "All"}`
                        : viewBy === "faculty"
                        ? `Faculty ${faculty.find(f => f.id === selectedFaculty)?.name || selectedFaculty}`
                        : `Room ${rooms.find(r => r.id === selectedRoom)?.name || selectedRoom}`}
                    </Badge>
                    <span className="text-muted-foreground ml-2">Week:</span>
                    <span className="font-medium">Aug 10 – Aug 14, 2026</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="sm" className="h-8 text-xs font-medium px-2.5">
                      &lt; Previous Week
                    </Button>
                    <Button variant="secondary" size="sm" className="h-8 text-xs font-semibold px-3">
                      Today
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 text-xs font-medium px-2.5">
                      Next Week &gt;
                    </Button>
                  </div>
                </div>

                {/* Versions & Actions Bar */}
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-foreground whitespace-nowrap">
                      Version Management:
                    </span>
                    {sortedHistory.length > 0 ? (
                      <Select
                        value={selectedHistoryId}
                        onValueChange={handleHistorySelect}
                      >
                        <SelectTrigger className="h-9 w-full sm:w-[220px]">
                          <SelectValue placeholder="Select version..." />
                        </SelectTrigger>
                        <SelectContent>
                          {sortedHistory.map((t: any, idx: number) => {
                            const date = t.createdAt
                              ? new Date(t.createdAt.seconds * 1000)
                              : null;
                            const label = `Version ${sortedHistory.length - idx} (${t.status || "Draft"})`;
                            return (
                              <SelectItem key={t.id} value={t.id}>
                                <div className="flex items-center gap-2">
                                  <span>{label}</span>
                                  <span className="text-[10px] text-muted-foreground">
                                    {date ? date.toLocaleDateString() : ""}
                                  </span>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="outline" className="text-xs">Version 1 (Draft)</Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      value={pdfMode}
                      onValueChange={(v) => setPdfMode(v as "compact" | "detailed")}
                    >
                      <SelectTrigger className="h-9 w-[130px] text-xs">
                        <SelectValue placeholder="PDF mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">Compact PDF</SelectItem>
                        <SelectItem value="detailed">Detailed PDF</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-9 text-xs font-medium"
                      onClick={handleSaveTimetable}
                      disabled={isSavingTimetable}
                    >
                      {isSavingTimetable ? (
                        <>
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          Saving…
                        </>
                      ) : (
                        "Save"
                      )}
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="h-9 text-xs font-medium gap-1.5"
                      onClick={handleDownloadPdf}
                      disabled={!schedule.length}
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download PDF
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      className="h-9 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => setShowPublishConfirm(true)}
                      disabled={!schedule.length}
                    >
                      Publish
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="h-9 text-xs font-medium"
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={!selectedHistoryId || isDeletingTimetable}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>

              {dataIsLoading ? (
                <div className="flex h-64 items-center justify-center rounded-xl border border-dashed">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {viewBy === "section" && (
                    <div className="space-y-4" ref={timetableRef}>
                      <Select
                        value={selectedSection}
                        onValueChange={setSelectedSection}
                      >
                        <SelectTrigger className="h-9 w-full max-w-md sm:w-[280px]">
                          <SelectValue placeholder="Select section" />
                        </SelectTrigger>
                        <SelectContent>
                          {generatedSections.map((s) => (
                            <SelectItem key={s} value={s}>
                              Section {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <TimetableView
                        viewBy="section"
                        filterId={selectedSection}
                        schedule={schedule}
                        courses={courses}
                        faculty={faculty}
                        rooms={rooms}
                        timeslots={timeslots}
                        onEntryClick={handleEntryClick}
                      />
                    </div>
                  )}

                  {viewBy === "faculty" && (
                    <div className="space-y-4" ref={timetableRef}>
                      <Select
                        value={selectedFaculty}
                        onValueChange={setSelectedFaculty}
                      >
                        <SelectTrigger className="h-9 w-full max-w-md sm:w-[280px]">
                          <SelectValue placeholder="Select faculty" />
                        </SelectTrigger>
                        <SelectContent>
                          {faculty.map((f) => (
                            <SelectItem key={f.id} value={f.id}>
                              {f.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <TimetableView
                        viewBy="faculty"
                        filterId={selectedFaculty}
                        schedule={schedule}
                        courses={courses}
                        faculty={faculty}
                        rooms={rooms}
                        timeslots={timeslots}
                        onEntryClick={handleEntryClick}
                      />
                    </div>
                  )}

                  {viewBy === "room" && (
                    <div className="space-y-4" ref={timetableRef}>
                      <Select
                        value={selectedRoom}
                        onValueChange={setSelectedRoom}
                      >
                        <SelectTrigger className="h-9 w-full max-w-md sm:w-[280px]">
                          <SelectValue placeholder="Select room" />
                        </SelectTrigger>
                        <SelectContent>
                          {rooms.map((r) => (
                            <SelectItem key={r.id} value={r.id}>
                              {r.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <TimetableView
                        viewBy="room"
                        filterId={selectedRoom}
                        schedule={schedule}
                        courses={courses}
                        faculty={faculty}
                        rooms={rooms}
                        timeslots={timeslots}
                        onEntryClick={handleEntryClick}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
        </CardContent>
      </Card>

      {/* Confirmation Modal for Delete */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Saved Timetable?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The selected timetable version will be permanently deleted from the workspace.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                setShowDeleteConfirm(false);
                await handleDeleteSavedTimetable();
              }}
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal for Publish */}
      <Dialog open={showPublishConfirm} onOpenChange={setShowPublishConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish Timetable?</DialogTitle>
            <DialogDescription>
              Publishing this timetable makes it active and visible to all assigned HODs, Faculty, and Students.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPublishConfirm(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={async () => {
                setShowPublishConfirm(false);
                await handleSaveTimetable();
                toast({
                  title: "Timetable Published",
                  description: "The timetable has been successfully published to all roles.",
                });
              }}
            >
              Confirm &amp; Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingEntry} onOpenChange={(open) => !open && setEditingEntry(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit slot</DialogTitle>
            <DialogDescription>
              Change the faculty (for all lectures of this subject in this section) or the room for this specific slot.
            </DialogDescription>
          </DialogHeader>

          {editingEntry && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>
                  <span className="font-medium">Section:</span> {editingEntry.section}
                </p>
                <p>
                  <span className="font-medium">Day &amp; time:</span> {editingEntry.day},{" "}
                  {editingEntry.timeslot}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Faculty for this subject &amp; section</Label>
                <Select
                  value={editingFacultyId}
                  onValueChange={setEditingFacultyId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculty.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Room for this slot</Label>
                <Select
                  value={editingRoomId}
                  onValueChange={setEditingRoomId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingEntry(null)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleApplyEdit}>
              Apply changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
