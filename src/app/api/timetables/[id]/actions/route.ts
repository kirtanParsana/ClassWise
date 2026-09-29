import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/firebase/admin";
import { requireRole, authErrorResponse } from "@/lib/server-auth";
import {
  getTimetableData,
  getScheduleEntriesForTimetable,
  authorizeTimetableAccess,
  transitionTimetableStatus,
  runConflictCheck,
  persistConflicts,
  createNotification,
  findHODUids,
  findCoordinatorUids,
  syncScheduleDocs,
  fetchMasterDataForLookup,
} from "@/lib/server-timetable";
import type { ScheduleEntry } from "@/lib/types";

type WorkflowAction =
  | "submit"
  | "request-changes"
  | "approve"
  | "publish"
  | "resubmit"
  | "save"
  | "regenerate-status";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: timetableId } = await params;
    const body = await request.json();
    const action = body.action as WorkflowAction;

    switch (action) {
      case "submit":
        return handleSubmit(request, timetableId);
      case "request-changes":
        return handleRequestChanges(request, timetableId, body);
      case "approve":
        return handleApprove(request, timetableId, body);
      case "publish":
        return handlePublish(request, timetableId);
      case "resubmit":
        return handleResubmit(request, timetableId);
      case "save":
        return handleSave(request, timetableId, body);
      default:
        return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    const authResp = authErrorResponse(error);
    if (authResp) return authResp;
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

async function handleSubmit(request: NextRequest, timetableId: string) {
  const user = await requireRole(request.headers.get("authorization"), ["coordinator"]);
  const timetable = await getTimetableData(timetableId);
  if (!timetable) return NextResponse.json({ success: false, error: "Timetable not found" }, { status: 404 });

  authorizeTimetableAccess(user, timetable, "submit");

  const schedule = await getScheduleEntriesForTimetable(timetableId);
  if (!schedule.length) {
    return NextResponse.json({ success: false, error: "Timetable has no schedule entries" }, { status: 400 });
  }

  const { critical } = await runConflictCheck(timetableId);
  if (critical > 0) {
    return NextResponse.json(
      { success: false, error: "Critical conflicts must be resolved before submission" },
      { status: 400 }
    );
  }

  await transitionTimetableStatus(timetableId, "under_review", user, {
    submittedBy: user.uid,
    submittedByName: user.profile.name,
    submittedAt: FieldValue.serverTimestamp(),
  });

  const hodUids = await findHODUids(timetable.departmentId as string | undefined);
  for (const uid of hodUids) {
    await createNotification(
      uid,
      "timetable.submitted",
      "Timetable submitted for review",
      `${user.profile.name} submitted "${timetable.name ?? "Timetable"}" for your review.`,
      timetableId
    );
  }

  return NextResponse.json({ success: true, status: "under_review" });
}

async function handleRequestChanges(
  request: NextRequest,
  timetableId: string,
  body: { reason?: string; message?: string }
) {
  const user = await requireRole(request.headers.get("authorization"), ["hod"]);
  const timetable = await getTimetableData(timetableId);
  if (!timetable) return NextResponse.json({ success: false, error: "Timetable not found" }, { status: 404 });

  authorizeTimetableAccess(user, timetable, "request-changes");

  const reason = body.reason ?? body.message;
  if (!reason?.trim()) {
    const openSuggestions = await adminDb
      .collection("suggestions")
      .where("timetableId", "==", timetableId)
      .where("status", "==", "open")
      .get();
    if (openSuggestions.empty) {
      return NextResponse.json(
        { success: false, error: "Provide a change request message or at least one open suggestion" },
        { status: 400 }
      );
    }
  }

  await transitionTimetableStatus(timetableId, "changes_requested", user, {
    requestedBy: user.uid,
    requestedByName: user.profile.name,
    requestedAt: FieldValue.serverTimestamp(),
    changeRequestReason: reason ?? "Changes requested by HOD",
    reviewedBy: user.uid,
    reviewedByName: user.profile.name,
    reviewedAt: FieldValue.serverTimestamp(),
  });

  await adminDb.collection("approvals").add({
    timetableId,
    action: "changes_requested",
    performedBy: user.uid,
    performedByName: user.profile.name,
    performedByRole: "hod",
    comment: reason,
    createdAt: FieldValue.serverTimestamp(),
  });

  const coordinatorUids = await findCoordinatorUids();
  for (const uid of coordinatorUids) {
    await createNotification(
      uid,
      "timetable.changes_requested",
      "Changes requested on timetable",
      `HOD requested changes on "${timetable.name ?? "Timetable"}": ${reason ?? "See suggestions"}`,
      timetableId
    );
  }

  return NextResponse.json({ success: true, status: "changes_requested" });
}

async function handleApprove(
  request: NextRequest,
  timetableId: string,
  body: { comment?: string }
) {
  const user = await requireRole(request.headers.get("authorization"), ["hod"]);
  const timetable = await getTimetableData(timetableId);
  if (!timetable) return NextResponse.json({ success: false, error: "Timetable not found" }, { status: 404 });

  authorizeTimetableAccess(user, timetable, "submit");

  if (timetable.status !== "under_review") {
    return NextResponse.json({ success: false, error: "Only timetables under review can be approved" }, { status: 400 });
  }

  const schedule = await getScheduleEntriesForTimetable(timetableId);
  if (!schedule.length) {
    return NextResponse.json({ success: false, error: "Timetable has no schedule entries" }, { status: 400 });
  }

  const { critical } = await runConflictCheck(timetableId);
  if (critical > 0) {
    return NextResponse.json({ success: false, error: "Critical conflicts must be resolved before approval" }, { status: 400 });
  }

  await transitionTimetableStatus(timetableId, "approved", user, {
    approvedBy: user.uid,
    approvedByName: user.profile.name,
    approvedAt: FieldValue.serverTimestamp(),
    reviewedBy: user.uid,
    reviewedByName: user.profile.name,
    reviewedAt: FieldValue.serverTimestamp(),
    reviewComment: body.comment,
  });

  await adminDb.collection("approvals").add({
    timetableId,
    action: "approved",
    performedBy: user.uid,
    performedByName: user.profile.name,
    performedByRole: "hod",
    comment: body.comment,
    createdAt: FieldValue.serverTimestamp(),
  });

  const coordinatorUids = await findCoordinatorUids();
  for (const uid of coordinatorUids) {
    await createNotification(
      uid,
      "timetable.approved",
      "Timetable approved",
      `"${timetable.name ?? "Timetable"}" has been approved by HOD.`,
      timetableId
    );
  }

  return NextResponse.json({ success: true, status: "approved" });
}

async function handlePublish(request: NextRequest, timetableId: string) {
  const user = await requireRole(request.headers.get("authorization"), ["hod"]);
  const timetable = await getTimetableData(timetableId);
  if (!timetable) return NextResponse.json({ success: false, error: "Timetable not found" }, { status: 404 });

  authorizeTimetableAccess(user, timetable, "publish");

  if (timetable.status !== "approved") {
    return NextResponse.json({ success: false, error: "Only approved timetables can be published" }, { status: 400 });
  }

  if (!timetable.approvedBy) {
    return NextResponse.json({ success: false, error: "Approval information missing" }, { status: 400 });
  }

  const schedule = await getScheduleEntriesForTimetable(timetableId);
  if (!schedule.length) {
    return NextResponse.json({ success: false, error: "Timetable has no schedule entries" }, { status: 400 });
  }

  const { critical } = await runConflictCheck(timetableId);
  if (critical > 0) {
    return NextResponse.json({ success: false, error: "Critical conflicts must be resolved before publishing" }, { status: 400 });
  }

  await transitionTimetableStatus(timetableId, "published", user, {
    publishedBy: user.uid,
    publishedByName: user.profile.name,
    publishedAt: FieldValue.serverTimestamp(),
  });

  const coordinatorUids = await findCoordinatorUids();
  for (const uid of coordinatorUids) {
    await createNotification(
      uid,
      "timetable.published",
      "Timetable published",
      `"${timetable.name ?? "Timetable"}" is now published and visible to faculty and students.`,
      timetableId
    );
  }

  return NextResponse.json({ success: true, status: "published" });
}

async function handleResubmit(request: NextRequest, timetableId: string) {
  const user = await requireRole(request.headers.get("authorization"), ["coordinator"]);
  const timetable = await getTimetableData(timetableId);
  if (!timetable) return NextResponse.json({ success: false, error: "Timetable not found" }, { status: 404 });

  const { critical } = await runConflictCheck(timetableId);
  if (critical > 0) {
    return NextResponse.json(
      { success: false, error: "Critical conflicts must be resolved before resubmission" },
      { status: 400 }
    );
  }

  const newVersion = ((timetable.version as number) ?? 1) + 1;

  await transitionTimetableStatus(timetableId, "under_review", user, {
    version: newVersion,
    submittedBy: user.uid,
    submittedByName: user.profile.name,
    submittedAt: FieldValue.serverTimestamp(),
  });

  const hodUids = await findHODUids(timetable.departmentId as string | undefined);
  for (const uid of hodUids) {
    await createNotification(
      uid,
      "timetable.submitted",
      "Timetable resubmitted for review",
      `${user.profile.name} resubmitted "${timetable.name ?? "Timetable"}" (v${newVersion}).`,
      timetableId
    );
  }

  return NextResponse.json({ success: true, status: "under_review", version: newVersion });
}

async function handleSave(
  request: NextRequest,
  timetableId: string,
  body: { schedule?: ScheduleEntry[]; name?: string }
) {
  const user = await requireRole(request.headers.get("authorization"), ["coordinator"]);
  const timetable = await getTimetableData(timetableId);
  if (!timetable) return NextResponse.json({ success: false, error: "Timetable not found" }, { status: 404 });

  authorizeTimetableAccess(user, timetable, "save");

  authorizeTimetableAccess(user, timetable, "resubmit");

  const status = timetable.status as string;
  if (status === "under_review" || status === "approved" || status === "published") {
    return NextResponse.json(
      { success: false, error: "Cannot edit timetable in current status. Wait for HOD feedback or create a new version." },
      { status: 400 }
    );
  }

  const schedule = body.schedule as ScheduleEntry[];
  if (!schedule?.length) {
    return NextResponse.json({ success: false, error: "Schedule is required" }, { status: 400 });
  }

  const lookup = await fetchMasterDataForLookup();
  const timetableStatus = status === "changes_requested" ? "generated" : status;

  await adminDb.collection("timetables").doc(timetableId).update({
    schedule,
    sections: [...new Set(schedule.map((s) => s.section))],
    name: body.name ?? timetable.name,
    status: timetableStatus,
    updatedAt: FieldValue.serverTimestamp(),
  });

  await syncScheduleDocs(
    timetableId,
    schedule,
    timetableStatus as "generated" | "draft",
    lookup
  );

  const { conflicts, total, critical } = await runConflictCheck(timetableId);
  await persistConflicts(timetableId, conflicts);

  await adminDb.collection("timetables").doc(timetableId).update({
    hasCriticalConflicts: critical > 0,
    unresolvedConflictCount: total,
  });

  return NextResponse.json({
    success: true,
    conflicts: { total, critical },
    savedBy: user.uid,
  });
}
