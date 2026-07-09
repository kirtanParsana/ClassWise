import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";
import { cert } from "firebase-admin/app";

const apps = getApps();
const app = apps.length === 0 ? initializeApp({
  credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}")),
}) : apps[0];

const db = getFirestore(app);

/**
 * GET /api/conflicts
 * Detects scheduling conflicts in the generated timetable.
 *
 * Conflict Types:
 * 1. Same faculty assigned to multiple classes at same day & timeslot
 * 2. Same room assigned to multiple classes at same day & timeslot
 */
export async function GET() {
  try {
    // 1️⃣ Fetch timetable data from Firestore
    const snapshot = await db.collection("timetable").get();

    const timetable = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Array<{ id: string; facultyId: string; day: string; timeslot: string; roomId: string; [key: string]: any }>;

    // 2️⃣ Prepare conflict detection
    const conflicts: any[] = [];

    const facultyMap = new Map<string, any>();
    const roomMap = new Map<string, any>();

    // 3️⃣ Detect conflicts
    for (const entry of timetable) {
      const facultyKey = `${entry.facultyId}-${entry.day}-${entry.timeslot}`;
      const roomKey = `${entry.roomId}-${entry.day}-${entry.timeslot}`;

      // Faculty conflict
      if (facultyMap.has(facultyKey)) {
        conflicts.push({
          type: "FACULTY_CONFLICT",
          message: "Faculty assigned to multiple classes at the same time",
          entries: [facultyMap.get(facultyKey), entry],
        });
      } else {
        facultyMap.set(facultyKey, entry);
      }

      // Room conflict
      if (roomMap.has(roomKey)) {
        conflicts.push({
          type: "ROOM_CONFLICT",
          message: "Room booked for multiple classes at the same time",
          entries: [roomMap.get(roomKey), entry],
        });
      } else {
        roomMap.set(roomKey, entry);
      }
    }

    // 4️⃣ Return result
    return NextResponse.json({
      success: true,
      totalConflicts: conflicts.length,
      conflicts,
    });
  } catch (error) {
    console.error("Conflict detection failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to detect timetable conflicts",
      },
      { status: 500 }
    );
  }
}
