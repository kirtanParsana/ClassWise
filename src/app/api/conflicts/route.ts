import { NextRequest, NextResponse } from "next/server";
import { requireRole, authErrorResponse } from "@/lib/server-auth";
import {
  getTimetableData,
  getScheduleEntriesForTimetable,
  authorizeTimetableAccess,
  runConflictCheck,
  persistConflicts,
} from "@/lib/server-timetable";
import { detectConflicts, countConflicts } from "@/lib/conflict-detection";
import { adminDb } from "@/firebase/admin";
import type { Course, Room } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(
      request.headers.get("authorization"),
      ["coordinator", "hod"]
    );

    const timetableId = request.nextUrl.searchParams.get("timetableId");

    if (timetableId) {
      const timetable = await getTimetableData(timetableId);

      if (!timetable) {
        return NextResponse.json(
          { success: false, error: "Timetable not found" },
          { status: 404 }
        );
      }

      authorizeTimetableAccess(user, timetable, "conflict-check");

    }

    if (timetableId) {
      const { conflicts, total, critical, warnings } = await runConflictCheck(timetableId);
      await persistConflicts(timetableId, conflicts);

      await adminDb.collection("timetables").doc(timetableId).update({
        hasCriticalConflicts: critical > 0,
        unresolvedConflictCount: total,
      });

      return NextResponse.json({ success: true, totalConflicts: total, critical, warnings, conflicts });
    }

    const departmentId = user.profile.departmentId;

    if (!departmentId) {
      return NextResponse.json(
        {
          success: false,
          error: "Your account is not assigned to a department",
        },
        { status: 403 }
      );
    }

    const timetablesSnap = await adminDb
      .collection("timetables")
      .where("departmentId", "==", departmentId)
      .orderBy("updatedAt", "desc")
      .limit(1)
      .get();

    if (timetablesSnap.empty) {
      return NextResponse.json({ success: true, totalConflicts: 0, critical: 0, warnings: 0, conflicts: [] });
    }

    const latest = timetablesSnap.docs[0];
    const schedule = await getScheduleEntriesForTimetable(latest.id);

    const [coursesSnap, roomsSnap] = await Promise.all([
      adminDb.collection("courses").get(),
      adminDb.collection("rooms").get(),
    ]);
    const courses = coursesSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as Course[];
    const rooms = roomsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as Room[];

    const conflicts = detectConflicts(schedule, courses, rooms);
    const { total, critical, warnings } = countConflicts(conflicts);

    return NextResponse.json({
      success: true,
      totalConflicts: total,
      critical,
      warnings,
      conflicts,
      timetableId: latest.id,
    });
  } catch (error) {
    const authResp = authErrorResponse(error);
    if (authResp) return authResp;
    console.error("Conflict detection failed:", error);
    return NextResponse.json({ success: false, error: "Failed to detect timetable conflicts" }, { status: 500 });
  }
}
