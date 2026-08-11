import { getAuth } from "firebase-admin/auth";
import { adminDb } from "@/firebase/admin";
import type { Role, UserProfile } from "@/types/auth";
import { isValidRole } from "@/lib/rbac";

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  profile: UserProfile;
  role: Role;
}

export class AuthError extends Error {
  constructor(
    message: string,
    public status: 401 | 403
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export async function verifyAuthToken(
  authorizationHeader: string | null
): Promise<AuthenticatedUser> {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    throw new AuthError("Missing or invalid authorization header", 401);
  }

  const token = authorizationHeader.slice(7);
  if (!token) {
    throw new AuthError("Missing authentication token", 401);
  }

  let decoded;
  try {
    decoded = await getAuth().verifyIdToken(token);
  } catch {
    throw new AuthError("Invalid or expired authentication token", 401);
  }

  const profileSnap = await adminDb.collection("users").doc(decoded.uid).get();
  if (!profileSnap.exists) {
    throw new AuthError("User profile not found", 403);
  }

  const data = profileSnap.data()!;
  const role = data.role;

  if (!isValidRole(role)) {
    throw new AuthError("Invalid user role", 403);
  }

  if (data.isActive !== true) {
    throw new AuthError("Account is disabled", 403);
  }

  const profile: UserProfile = {
    uid: decoded.uid,
    name: data.name ?? "",
    email: data.email ?? decoded.email ?? "",
    role,
    departmentId: data.departmentId,
    facultyId: data.facultyId,
    studentId: data.studentId,
    sectionId: data.sectionId,
    semester: data.semester,
    isActive: true,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };

  return { uid: decoded.uid, email: decoded.email, profile, role };
}

export async function requireRole(
  authorizationHeader: string | null,
  allowedRoles: Role[]
): Promise<AuthenticatedUser> {
  const user = await verifyAuthToken(authorizationHeader);
  if (!allowedRoles.includes(user.role)) {
    throw new AuthError("Insufficient permissions", 403);
  }
  return user;
}

export function authErrorResponse(error: unknown) {
  if (error instanceof AuthError) {
    return Response.json({ success: false, error: error.message }, { status: error.status });
  }
  return null;
}
