// import { NextResponse } from "next/server";
// import { adminDb } from "@/firebase/admin";
// import { generateTimetable } from "@/ai/flows/generate-timetable";

// export async function POST() {
//   try {
//     console.log("🚀 Fetching data for timetable generation");

//     // 1️⃣ Fetch data from Firestore
//     const coursesSnap = await adminDb.collection("courses").get();
//     const roomsSnap = await adminDb.collection("rooms").get();
//     const facultySnap = await adminDb.collection("faculties").get();
//     const timeslotsSnap = await adminDb.collection("timeslots").get();

//     const courses = coursesSnap.docs.map(d => ({ id: d.id, name: d.data().name, code: d.data().code, credits: d.data().credits, facultyId: d.data().facultyId, requiresLab: d.data().requiresLab, ...d.data() }));
//     const rooms = roomsSnap.docs.map(d => ({ id: d.id, name: d.data().name, capacity: d.data().capacity, isLab: d.data().isLab, ...d.data() }));
//     const faculty = facultySnap.docs.map(d => ({ id: d.id, name: d.data().name, email: d.data().email, department: d.data().department, avatarUrl: d.data().avatarUrl, avatarHint: d.data().avatarHint, ...d.data() }));
//     const timeslots = timeslotsSnap.docs.map(d => ({ id: d.id, name: d.data().name, day: d.data().day, order: d.data().order, ...d.data() }));

//     // 2️⃣ Defensive checks
//     if (!courses.length) throw new Error("No courses found");
//     if (!rooms.length) throw new Error("No rooms found");
//     if (!faculty.length) throw new Error("No faculty found");
//     if (!timeslots.length) throw new Error("No timeslots found");

//     const mappedTimeslots = timeslots.map((t, index) => ({
//       id: t.id,
//       name: `${t.day} ${t.startTime}-${t.endTime}`,
//       day: t.day,
//       order: index,
//     }));


//     // 3️⃣ Call AI logic CORRECTLY
//     await generateTimetable({
//       courses,
//       faculty,
//       rooms,
//       sections: sectionNames,
//       days,
//       timeslots: mappedTimeslots,
//     });

//     console.log("✅ Timetable generated");

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("❌ Timetable generation failed:", error);
//     return NextResponse.json(
//       { success: false, error: String(error) },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/client";
import { generateTimetable } from "@/ai/flows/generate-timetable";

export async function POST() {
  try {
    console.log("🚀 Fetching data for timetable generation");

    const coursesSnap = await getDocs(collection(db, "courses"));
    const facultySnap = await getDocs(collection(db, "faculties"));
    const roomsSnap = await getDocs(collection(db, "rooms"));
    const sectionsSnap = await getDocs(collection(db, "sections"));
    const timeslotsSnap = await getDocs(collection(db, "timeslots"));

    
    const courses = coursesSnap.docs.map(d => ({ id: d.id, name: d.data().name, code: d.data().code, credits: d.data().credits, facultyId: d.data().facultyId, requiresLab: d.data().requiresLab, ...d.data() }));
    const faculty = facultySnap.docs.map(d => ({ id: d.id, name: d.data().name, email: d.data().email, department: d.data().department, avatarUrl: d.data().avatarUrl, avatarHint: d.data().avatarHint, ...d.data() }));
    const rooms = roomsSnap.docs.map(d => ({ id: d.id, name: d.data().name, capacity: d.data().capacity, isLab: d.data().isLab, ...d.data() }));   
    const sectionNames = sectionsSnap.docs.map(d => d.data().name);

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    const formatTimeSlotName = (startTime: string, endTime: string): string => {
      // Keep minutes so distinct timeslots don't collapse into one label.
      return `${startTime}-${endTime}`;
    };

    const mappedTimeslots = timeslotsSnap.docs
      .map((doc) => {
        const t = doc.data();
        if (t.isBreak) {
          return null;
        }
        const timeSlotName = formatTimeSlotName(t.startTime || '9:00', t.endTime || '10:00');
        
        // Calculate order based on start time if not provided
        let order = t.order;
        if (order === undefined || order === null) {
          const startHour = parseInt(t.startTime?.split(':')[0] || '9', 10);
          const startMin = parseInt(t.startTime?.split(':')[1] || '0', 10);
          order = startHour * 60 + startMin; // Convert to minutes for sorting
        }
        
        return {
          id: doc.id,
          name: timeSlotName,
          day: t.day,
          order: order,
        };
      })
      .filter((slot): slot is { id: string; name: string; day: string; order: number } => slot !== null)
      .sort((a, b) => {
        // Sort by day first, then by order
        const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
        if (dayDiff !== 0) return dayDiff;
        return a.order - b.order;
      });

    console.log("📅 Mapped timeslots:", mappedTimeslots.length);
    console.log("📅 Sample timeslots:", mappedTimeslots.slice(0, 5).map(t => `${t.day} ${t.name} (order: ${t.order})`));

    if (
      !courses.length ||
      !faculty.length ||
      !rooms.length ||
      !sectionNames.length ||
      !mappedTimeslots.length
    ) {
      throw new Error("Missing required data");
    }

    const result = await generateTimetable({
      courses,
      faculty,
      rooms,
      sections: sectionNames,
      days,
      timeslots: mappedTimeslots,
    });

    console.log("✅ Timetable generated", { scheduleCount: result.schedule.length });
    
    // Log sample schedule entries for debugging
    if (result.schedule.length > 0) {
      console.log("📋 Sample schedule entries:", result.schedule.slice(0, 3).map(e => ({
        day: e.day,
        timeslot: e.timeslot,
        section: e.section,
        courseId: e.courseId.substring(0, 8) + '...',
      })));
    } else {
      console.warn("⚠️ No schedule entries generated!");
    }

    // Persist generated timetable so it can be viewed/edited later.
    // Run this in the background so the client doesn't wait for Firestore.
    addDoc(collection(db, "timetables"), {
      createdAt: serverTimestamp(),
      sections: sectionNames,
      days,
      schedule: result.schedule,
    })
      .then(() => {
        console.log("💾 Saved generated timetable to Firestore");
      })
      .catch((saveError) => {
        console.error("⚠️ Failed to save timetable history", saveError);
      });

    return NextResponse.json({
      success: true,
      schedule: result.schedule,
    });
  } catch (error) {
    console.error("❌ Timetable generation failed:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
