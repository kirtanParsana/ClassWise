import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

const globalRef = globalThis as typeof globalThis & {
  __classwiseAdminDb?: Firestore;
};

function getOrInitAdminDb(): Firestore {
  if (globalRef.__classwiseAdminDb) {
    return globalRef.__classwiseAdminDb;
  }

  const app =
    getApps()[0] ??
    initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });

  globalRef.__classwiseAdminDb = getFirestore(app);
  return globalRef.__classwiseAdminDb;
}

export const adminDb = getOrInitAdminDb();
