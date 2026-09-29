"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth } from "@/firebase/client";
import { fetchUserProfile, validateUserProfile } from "@/services/userService";
import type {
  UserProfile,
  Role,
  AuthState,
  AuthStatus,
  AuthErrorType,
} from "@/types/auth";
import { isValidRole } from "@/lib/rbac";
import { signOut as authSignOut } from "@/lib/auth";

interface AuthContextValue extends AuthState {
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const initialState: AuthContextValue = {
  user: null,
  profile: null,
  role: null,
  loading: true,
  isAuthenticated: false,
  status: "loading",
  error: null,
  errorMessage: null,
  logout: async () => {},
  refreshProfile: async () => {},
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [error, setError] = useState<AuthErrorType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const initializedRef = useRef(false);

  const role: Role | null = useMemo(() => {
    if (profile && isValidRole(profile.role)) {
      return profile.role;
    }
    return null;
  }, [profile]);

  const loading = status === "loading";
  const isAuthenticated = status === "authenticated" && !!profile && !!user;

  const setErrorState = (
    errorType: AuthErrorType,
    message: string,
    firebaseUser: FirebaseUser | null
  ) => {
    setError(errorType);
    setErrorMessage(message);
    setProfile(null);
    setStatus("error");
    setUser(firebaseUser);
  };

  const clearErrorState = () => {
    setError(null);
    setErrorMessage(null);
  };

  const resolveProfile = useCallback(async (firebaseUser: FirebaseUser | null) => {
    if (!firebaseUser) {
      setUser(null);
      setProfile(null);
      clearErrorState();
      setStatus("unauthenticated");
      return;
    }

    setUser(firebaseUser);

    try {
      const fetchedProfile = await fetchUserProfile(firebaseUser.uid);
      const validation = validateUserProfile(fetchedProfile);

      if (!validation.valid) {
        switch (validation.reason) {
          case "missing":
            setErrorState(
              "not-configured",
              "Your account is not configured. Please contact the administrator.",
              firebaseUser
            );
            break;
          case "invalid-role":
            setErrorState(
              "invalid-role",
              "Your account has an invalid role. Please contact the administrator.",
              firebaseUser
            );
            break;
          case "inactive":
            setErrorState(
              "account-disabled",
              "Your account has been disabled. Please contact the administrator.",
              firebaseUser
            );
            break;
        }
        return;
      }

      setProfile(fetchedProfile);
      clearErrorState();
      setStatus("authenticated");
    } catch (err) {
      const firestoreError = err as { code?: string; message?: string };
      if (
        firestoreError.code === "permission-denied" ||
        firestoreError.code === "PERMISSION_DENIED"
      ) {
        setErrorState(
          "permission-denied",
          "Access denied. You do not have permission to access this application.",
          firebaseUser
        );
      } else if (
        firestoreError.code === "unavailable" ||
        firestoreError.code === "network-request-failed"
      ) {
        setErrorState(
          "network-error",
          "Network error. Please check your connection and try again.",
          firebaseUser
        );
      } else {
        setErrorState(
          "session-error",
          "Could not load your profile. Please try again later.",
          firebaseUser
        );
      }
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    setStatus("loading");
    await resolveProfile(user);
  }, [user, resolveProfile]);

  const logout = useCallback(async () => {
    setStatus("loading");
    try {
      await authSignOut();
      setUser(null);
      setProfile(null);
      clearErrorState();
      setStatus("unauthenticated");
    } catch {
      setUser(null);
      setProfile(null);
      clearErrorState();
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    setStatus("loading");

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      await resolveProfile(firebaseUser);
    });

    return () => unsubscribe();
  }, [resolveProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      role,
      loading,
      isAuthenticated,
      status,
      error,
      errorMessage,
      logout,
      refreshProfile,
    }),
    [
      user,
      profile,
      role,
      loading,
      isAuthenticated,
      status,
      error,
      errorMessage,
      logout,
      refreshProfile,
    ]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}
