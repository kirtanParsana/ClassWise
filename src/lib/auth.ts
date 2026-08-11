import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  type AuthError,
} from "firebase/auth";
import { auth } from "@/firebase/client";

export interface FriendlyAuthError {
  code: string;
  message: string;
}

function mapFirebaseAuthError(error: AuthError): FriendlyAuthError {
  const code = error.code;

  switch (code) {
    case "auth/invalid-email":
      return {
        code,
        message: "Please enter a valid email address.",
      };
    case "auth/user-disabled":
      return {
        code,
        message:
          "Your account has been disabled. Please contact the administrator.",
      };
    case "auth/user-not-found":
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return {
        code,
        message: "Invalid email or password. Please try again.",
      };
    case "auth/too-many-requests":
      return {
        code,
        message:
          "Too many failed login attempts. Please try again later or reset your password.",
      };
    case "auth/operation-not-allowed":
      return {
        code,
        message: "Sign-in is not available at this time.",
      };
    case "auth/network-request-failed":
      return {
        code,
        message:
          "Network error. Please check your connection and try again.",
      };
    case "auth/requires-recent-login":
      return {
        code,
        message: "Please sign in again to continue.",
      };
    default:
      return {
        code,
        message: "Sign-in failed. Please try again.",
      };
  }
}

export async function loginWithEmailAndPassword(
  email: string,
  password: string
) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return {
      success: true,
      user: userCredential.user,
      error: null,
    };
  } catch (error) {
    const authError = error as AuthError;
    const friendly = mapFirebaseAuthError(authError);
    return {
      success: false,
      user: null,
      error: friendly,
    };
  }
}

export async function signOut() {
  try {
    await firebaseSignOut(auth);
    return { success: true, error: null };
  } catch (error) {
    const authError = error as AuthError;
    return {
      success: false,
      error: mapFirebaseAuthError(authError),
    };
  }
}

export async function sendResetPasswordEmail(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, error: null };
  } catch (error) {
    const authError = error as AuthError;
    const friendly = mapFirebaseAuthError(authError);
    return {
      success: false,
      error: friendly,
    };
  }
}
