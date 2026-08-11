import { db } from "@/firebase/client";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import type { UserProfile } from "@/types/auth";
import { isValidRole } from "@/lib/rbac";

const USERS_COLLECTION = "users";

export function userDocRef(uid: string) {
  return doc(db, USERS_COLLECTION, uid);
}

export async function fetchUserProfile(
  uid: string
): Promise<UserProfile | null> {
  if (!uid) return null;

  const snapshot = await getDoc(userDocRef(uid));
  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();
  if (!data) return null;

  const profile = {
    uid: snapshot.id,
    ...data,
  } as UserProfile;

  return profile;
}

export function validateUserProfile(
  profile: UserProfile | null
): {
  valid: boolean;
  reason: "missing" | "invalid-role" | "inactive" | null;
} {
  if (!profile) {
    return { valid: false, reason: "missing" };
  }

  if (!isValidRole(profile.role)) {
    return { valid: false, reason: "invalid-role" };
  }

  if (profile.isActive === false) {
    return { valid: false, reason: "inactive" };
  }

  return { valid: true, reason: null };
}

export async function createUserProfile(
  uid: string,
  data: Omit<UserProfile, "uid" | "createdAt" | "updatedAt"> & {
    createdAt?: never;
    updatedAt?: never;
  }
): Promise<UserProfile> {
  const now = serverTimestamp();
  const payload = {
    ...data,
    uid,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(userDocRef(uid), payload);
  return payload as unknown as UserProfile;
}

export async function updateUserProfile(
  uid: string,
  data: Partial<Omit<UserProfile, "uid" | "createdAt" | "role">>
): Promise<void> {
  await updateDoc(userDocRef(uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}
