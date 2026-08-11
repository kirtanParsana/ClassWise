import type { Role, Permission, UserProfile } from "@/types/auth";
import { VALID_ROLES, ROLE_PERMISSIONS } from "@/types/auth";

export function isValidRole(value: unknown): value is Role {
  return typeof value === "string" && VALID_ROLES.has(value as Role);
}

export function hasRole(profile: UserProfile | null, role: Role): boolean {
  if (!profile) return false;
  return profile.role === role;
}

export function hasAnyRole(
  profile: UserProfile | null,
  roles: readonly Role[]
): boolean {
  if (!profile) return false;
  return roles.some((role) => hasRole(profile, role));
}

export function can(
  profile: UserProfile | null,
  permission: Permission
): boolean {
  if (!profile || !isValidRole(profile.role)) return false;
  const permissions = ROLE_PERMISSIONS[profile.role] ?? [];
  return permissions.includes(permission);
}

export function isCoordinator(profile: UserProfile | null): boolean {
  return hasRole(profile, "coordinator");
}

export function isHOD(profile: UserProfile | null): boolean {
  return hasRole(profile, "hod");
}

export function isFaculty(profile: UserProfile | null): boolean {
  return hasRole(profile, "faculty");
}

export function isStudent(profile: UserProfile | null): boolean {
  return hasRole(profile, "student");
}

export function isActiveUser(profile: UserProfile | null): boolean {
  if (!profile) return false;
  return profile.isActive === true;
}

export function getRoleDashboardPath(role: Role | null | undefined): string {
  switch (role) {
    case "coordinator":
      return "/coordinator";
    case "hod":
      return "/hod";
    case "faculty":
      return "/faculty";
    case "student":
      return "/student";
    default:
      return "/login";
  }
}

export function getRoleLabel(role: Role | null | undefined): string {
  switch (role) {
    case "coordinator":
      return "Time Coordinator";
    case "hod":
      return "HOD";
    case "faculty":
      return "Faculty";
    case "student":
      return "Student";
    default:
      return "Unknown";
  }
}

export function getRoleBadgeVariant(
  role: Role | null | undefined
): "default" | "secondary" | "destructive" | "outline" {
  switch (role) {
    case "coordinator":
      return "default";
    case "hod":
      return "secondary";
    case "faculty":
      return "outline";
    case "student":
      return "outline";
    default:
      return "outline";
  }
}
