import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/firebase/admin";
import { requireRole, authErrorResponse } from "@/lib/server-auth";
import {
  getTimetableData,
  authorizeTimetableAccess,
} from "@/lib/server-timetable";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(
      request.headers.get("authorization"),
      ["hod"]
    );

    const { id: timetableId } = await params;

    const timetable = await getTimetableData(timetableId);

    if (!timetable) {
      return NextResponse.json(
        { success: false, error: "Timetable not found" },
        { status: 404 }
      );
    }

    authorizeTimetableAccess(user, timetable, "create-suggestion");

    const body = await request.json();

    if (!body.message?.trim()) {
      return NextResponse.json({ success: false, error: "Suggestion message is required" }, { status: 400 });
    }

    const ref = adminDb.collection("suggestions").doc();
    await ref.set({
      timetableId,
      scheduleId: body.scheduleId ?? null,
      createdBy: user.uid,
      createdByName: user.profile.name,
      createdByRole: "hod",
      message: body.message.trim(),
      status: "open",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, suggestionId: ref.id });
  } catch (error) {
    const authResp = authErrorResponse(error);
    if (authResp) return authResp;
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(
      request.headers.get("authorization"),
      ["coordinator", "hod"]
    );

    const { id: timetableId } = await params;

    const timetable = await getTimetableData(timetableId);

    if (!timetable) {
      return NextResponse.json(
        { success: false, error: "Timetable not found" },
        { status: 404 }
      );
    }

    authorizeTimetableAccess(user, timetable, "view");
    
    const snap = await adminDb
      .collection("suggestions")
      .where("timetableId", "==", timetableId)
      .orderBy("createdAt", "desc")
      .get();

    const suggestions = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ success: true, suggestions });
  } catch (error) {
    const authResp = authErrorResponse(error);
    if (authResp) return authResp;
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
