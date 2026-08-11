import type { Day } from "@/lib/types";
import type { Role } from "@/types/auth";

export type TimetableStatus =
  | "draft"
  | "generated"
  | "under_review"
  | "changes_requested"
  | "approved"
  | "published";

export const VALID_TIMETABLE_STATUSES: readonly TimetableStatus[] = [
  "draft",
  "generated",
  "under_review",
  "changes_requested",
  "approved",
  "published",
] as const;

export function isValidTimetableStatus(v: unknown): v is TimetableStatus {
  return typeof v === "string" && VALID_TIMETABLE_STATUSES.includes(v as TimetableStatus);
}

export const STATUS_TRANSITIONS: Record<TimetableStatus, readonly TimetableStatus[]> = {
  draft: ["generated", "under_review"],
  generated: ["under_review", "draft"],
  under_review: ["approved", "changes_requested"],
  changes_requested: ["generated", "draft", "under_review"],
  approved: ["published"],
  published: [],
};

export function canTransition(from: TimetableStatus, to: TimetableStatus): boolean {
  return STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

export interface TimetableMeta {
  id: string;
  name: string;
  departmentId?: string;
  semester?: number;
  academicYear?: string;
  status: TimetableStatus;
  version: number;
  sections: string[];
  days: Day[];
  createdBy: string;
  createdByName?: string;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: Date | unknown;
  approvedAt?: Date | unknown;
  publishedBy?: string;
  publishedByName?: string;
  publishedAt?: Date | unknown;
  submittedAt?: Date | unknown;
  submittedBy?: string;
  submittedByName?: string;
  approvedBy?: string;
  approvedByName?: string;
  requestedBy?: string;
  requestedByName?: string;
  requestedAt?: Date | unknown;
  changeRequestReason?: string;
  reviewComment?: string;
  hasCriticalConflicts?: boolean;
  unresolvedConflictCount?: number;
  createdAt: Date | unknown;
  updatedAt: Date | unknown;
}

export interface ScheduleDoc {
  id: string;
  timetableId: string;
  timetableStatus: TimetableStatus;
  day: Day;
  startTime: string;
  endTime: string;
  timeslotName: string;
  timeslotOrder: number;
  courseId: string;
  courseName: string;
  courseCode?: string;
  facultyId: string;
  facultyName?: string;
  /** Section name (used by generator) */
  section: string;
  /** Section identifier — matches user profile sectionId when applicable */
  sectionId?: string;
  roomId: string;
  roomName?: string;
  status?: "active" | "cancelled" | "rescheduled";
  createdAt: Date | unknown;
  updatedAt: Date | unknown;
}

export type SuggestionStatus = "open" | "resolved" | "rejected";

export interface Suggestion {
  id: string;
  timetableId: string;
  scheduleId?: string;
  createdBy: string;
  createdByName?: string;
  createdByRole: Role;
  message: string;
  status: SuggestionStatus;
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: Date | unknown;
  createdAt: Date | unknown;
  updatedAt: Date | unknown;
}

export type ApprovalAction = "approved" | "changes_requested";

export interface Approval {
  id: string;
  timetableId: string;
  action: ApprovalAction;
  performedBy: string;
  performedByName?: string;
  performedByRole: Role;
  comment?: string;
  createdAt: Date | unknown;
}

export type AuditAction =
  | "timetable.generated"
  | "timetable.edited"
  | "timetable.status_changed"
  | "timetable.submitted"
  | "timetable.approved"
  | "timetable.published"
  | "timetable.changes_requested"
  | "suggestion.created"
  | "suggestion.resolved"
  | "schedule.edited"
  | "conflict.resolved";

export interface AuditLog {
  id: string;
  action: AuditAction;
  timetableId?: string;
  scheduleId?: string;
  performedBy: string;
  performedByName?: string;
  performedByRole: Role;
  metadata?: Record<string, unknown>;
  createdAt: Date | unknown;
}

export type NotificationType =
  | "timetable.submitted"
  | "timetable.changes_requested"
  | "timetable.approved"
  | "timetable.published";

export interface Notification {
  id: string;
  uid: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  relatedTimetableId?: string;
  createdAt: Date | unknown;
}
