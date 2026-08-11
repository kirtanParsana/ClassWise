import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/firebase/admin";
import { requireRole, authErrorResponse } from "@/lib/server-auth";
import { generateTimetable } from "@/ai/flows/generate-timetable";
import {
  syncScheduleDocs,
  runConflictCheck,
  persistConflicts,
  fetchMasterDataForLookup,
} from "@/lib/server-timetable";
import { defaultTimetableName } from "@/lib/timetable-utils";
import { omitUndefined } from "@/lib/firestore-utils";

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(request.headers.get("authorization"), ["coordinator"]);

    let body: { name?: string; academicYear?: string; semester?: number; departmentId?: string } = {};
    try {
      body = await request.json();
    } catch {
      // empty body is fine
    }

    const coursesSnap = await adminDb.collection("courses").get();
    const facultySnap = await adminDb.collection("faculties").get();
    const roomsSnap = await adminDb.collection("rooms").get();
    const sectionsSnap = await adminDb.collection("sections").get();
    const timeslotsSnap = await adminDb.collection("timeslots").get();

    const courses = coursesSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as Array<{
      id: string;
      name: string;
      code: string;
      credits: number;
      facultyId: string;
      requiresLab: boolean;
    }>;

    const faculty = facultySnap.docs.map((d) => ({ id: d.id, ...d.data() })) as Array<{
      id: string;
      name: string;
      email: string;
      department: string;
      avatarUrl: string;
      avatarHint: string;
    }>;

    const rooms = roomsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as Array<{
      id: string;
      name: string;
      capacity: number;
      isLab: boolean;
    }>;

    const sections = sectionsSnap.docs.map((d) => d.data());
    const sectionNames = sections.map((s: { name?: string; id?: string }) => s.name || s.id).filter(Boolean) as string[];

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    const mappedTimeslots = timeslotsSnap.docs
      .map((doc) => {
        const t = doc.data();
        if (t.isBreak) return null;
        const timeSlotName = `${t.startTime || "9:00"}-${t.endTime || "10:00"}`;
        let order = t.order;
        if (order === undefined || order === null) {
          const startHour = parseInt(t.startTime?.split(":")[0] || "9", 10);
          const startMin = parseInt(t.startTime?.split(":")[1] || "0", 10);
          order = startHour * 60 + startMin;
        }
        return { id: doc.id, name: timeSlotName, day: t.day, order, startTime: t.startTime, endTime: t.endTime };
      })
      .filter((slot): slot is NonNullable<typeof slot> => slot !== null)
      .sort((a, b) => {
        const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
        const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
        if (dayDiff !== 0) return dayDiff;
        return a.order - b.order;
      });

    if (!courses.length || !faculty.length || !rooms.length || !sectionNames.length || !mappedTimeslots.length) {
      return NextResponse.json({ success: false, error: "Missing required data for generation" }, { status: 400 });
    }

    const result = await generateTimetable({
      courses,
      faculty,
      rooms,
      sections: sectionNames,
      days,
      timeslots: mappedTimeslots,
    });

    if (!result.schedule.length) {
      return NextResponse.json({ success: false, error: "No schedule entries generated" }, { status: 500 });
    }

    const academicYear = body.academicYear ?? new Date().getFullYear().toString();
    const semester = body.semester ?? user.profile.semester;
    const departmentId = body.departmentId ?? user.profile.departmentId;
    const name = body.name ?? defaultTimetableName(academicYear, semester);

    const timetableRef = adminDb.collection("timetables").doc();
    const timetableId = timetableRef.id;

    const lookup = await fetchMasterDataForLookup();
    const { conflicts, critical, warnings, total } = await (async () => {
      const { detectConflicts, countConflicts } = await import("@/lib/conflict-detection");
      const detected = detectConflicts(result.schedule, lookup.courses, lookup.rooms);
      return { conflicts: detected, ...countConflicts(detected), total: detected.length };
    })();

    await timetableRef.set(
      omitUndefined({
        name,
        academicYear,
        semester,
        departmentId,
        status: "generated",
        version: 1,
        sections: sectionNames,
        days,
        schedule: result.schedule,
        createdBy: user.uid,
        createdByName: user.profile.name,
        hasCriticalConflicts: critical > 0,
        unresolvedConflictCount: total,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })
    );

    await syncScheduleDocs(timetableId, result.schedule, "generated", lookup);
    await persistConflicts(timetableId, conflicts);

    return NextResponse.json({
      success: true,
      timetableId,
      schedule: result.schedule,
      conflicts: { total, critical, warnings },
    });
  } catch (error) {
    const authResp = authErrorResponse(error);
    if (authResp) return authResp;
    console.error("Timetable generation failed:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
