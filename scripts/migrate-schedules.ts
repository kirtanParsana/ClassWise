#!/usr/bin/env npx tsx
/**
 * Safe migration utility: copies nested schedule[] from timetables docs
 * into individual /schedules documents. Does NOT delete legacy data.
 *
 * Usage:
 *   npx tsx scripts/migrate-schedules.ts
 *
 * Requires FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

async function migrate() {
  const snap = await db.collection("timetables").get();
  let migrated = 0;
  let skipped = 0;

  for (const doc of snap.docs) {
    const data = doc.data();
    const schedule = data.schedule as Array<{
      day: string;
      timeslot: string;
      courseId: string;
      facultyId: string;
      section: string;
      roomId: string;
    }> | undefined;

    if (!schedule?.length) {
      skipped++;
      continue;
    }

    const existing = await db
      .collection("schedules")
      .where("timetableId", "==", doc.id)
      .limit(1)
      .get();

    if (!existing.empty) {
      console.log(`Skip ${doc.id} — schedules already exist`);
      skipped++;
      continue;
    }

    const status = data.status ?? "generated";
    const batch = db.batch();

    for (const entry of schedule) {
      const ref = db.collection("schedules").doc();
      const [startTime, endTime] = (entry.timeslot ?? "").split("-");
      batch.set(ref, {
        timetableId: doc.id,
        timetableStatus: status,
        day: entry.day,
        startTime: startTime ?? "",
        endTime: endTime ?? "",
        timeslotName: entry.timeslot,
        timeslotOrder: 0,
        courseId: entry.courseId,
        courseName: "",
        facultyId: entry.facultyId,
        section: entry.section,
        sectionId: entry.section,
        roomId: entry.roomId,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    const updates: Record<string, unknown> = {};
    if (!data.status) updates.status = "generated";
    if (!data.version) updates.version = 1;
    if (Object.keys(updates).length) {
      batch.update(doc.ref, updates);
    }

    await batch.commit();
    migrated++;
    console.log(`Migrated ${doc.id} (${schedule.length} entries)`);
  }

  console.log(`Done. Migrated: ${migrated}, Skipped: ${skipped}`);
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
