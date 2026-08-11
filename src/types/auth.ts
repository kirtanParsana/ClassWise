export type Role = "coordinator" | "hod" | "faculty" | "student";

export const ALL_ROLES: Role[] = ["coordinator", "hod", "faculty", "student"];

export const VALID_ROLES: ReadonlySet<Role> = new Set<Role>(ALL_ROLES);

export type Permission =
  | "dashboard:view"
  | "timetable:manage"
  | "timetable:generate"
  | "resources:manage"
  | "timetable:review"
  | "timetable:approve"
  | "timetable:publish"
  | "timetable:view_own"
  | "timetable:view_section";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  coordinator: [
    "dashboard:view",
    "timetable:manage",
    "resources:manage",
    "timetable:generate",
  ],
  hod: [
    "dashboard:view",
    "timetable:review",
    "timetable:approve",
    "timetable:publish",
  ],
  faculty: ["dashboard:view", "timetable:view_own"],
  student: ["dashboard:view", "timetable:view_section"],
};

export type AuthErrorType =
  | "not-configured"
  | "invalid-role"
  | "account-disabled"
  | "unauthorized"
  | "permission-denied"
  | "network-error"
  | "session-error";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: Role;
  departmentId?: string;
  facultyId?: string;
  studentId?: string;
  sectionId?: string;
  semester?: number;
  isActive: boolean;
  createdAt: { seconds: number; nanoseconds?: number } | Date;
  updatedAt: { seconds: number; nanoseconds?: number } | Date;
}

export type AuthStatus =
  | "idle"
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "error";

export interface AuthState {
  user: import("firebase/auth").User | null;
  profile: UserProfile | null;
  role: Role | null;
  loading: boolean;
  isAuthenticated: boolean;
  status: AuthStatus;
  error: AuthErrorType | null;
  errorMessage: string | null;
}
