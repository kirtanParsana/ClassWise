// 'use client';
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Book, Building, Users, AlertTriangle } from "lucide-react";
// import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
// import { collection } from "firebase/firestore";
// import type { Course, Faculty, Room, Conflict } from "@/lib/types";
// import Link from "next/link";

// export function StatsCards() {
//     const firestore = useFirestore();

//     const coursesQuery = useMemoFirebase(() => collection(firestore, 'courses'), [firestore]);
//     const { data: courses } = useCollection<Course>(coursesQuery);

//     const facultyQuery = useMemoFirebase(() => collection(firestore, 'faculties'), [firestore]);
//     const { data: faculty } = useCollection<Faculty>(facultyQuery);

//     const roomsQuery = useMemoFirebase(() => collection(firestore, 'rooms'), [firestore]);
//     const { data: rooms } = useCollection<Room>(roomsQuery);

//     const conflictsQuery = useMemoFirebase(() => collection(firestore, 'conflicts'), [firestore]);
//     const { data: conflicts } = useCollection<Conflict>(conflictsQuery);

//     const stats = [
//       {
//         title: "Total Courses",
//         value: courses?.length ?? 0,
//         icon: Book,
//         color: "text-blue-500",
//         href: "/dashboard/courses",
//       },
//       {
//         title: "Total Faculty",
//         value: faculty?.length ?? 0,
//         icon: Users,
//         color: "text-green-500",
//         href: "/dashboard/faculty",
//       },
//       {
//         title: "Total Rooms",
//         value: rooms?.length ?? 0,
//         icon: Building,
//         color: "text-purple-500",
//         href: "/dashboard/rooms",
//       },
//       {
//         title: "Active Conflicts",
//         value: conflicts?.length ?? 0,
//         icon: AlertTriangle,
//         color: "text-red-500",
//         href: "/dashboard/conflicts",
//       },
//     ];

//   return (
//     <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//       {stats.map((stat) => (
//         <Link href={stat.href} key={stat.title}>
//             <Card className="transition-all hover:shadow-md hover:-translate-y-1 h-full">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium text-muted-foreground">
//                 {stat.title}
//                 </CardTitle>
//                 <stat.icon className={`h-5 w-5 ${stat.color}`} />
//             </CardHeader>
//             <CardContent>
//                 <div className="text-2xl font-bold font-headline text-foreground">
//                 {stat.value}
//                 </div>
//             </CardContent>
//             </Card>
//         </Link>
//       ))}
//     </div>
//   );
// }

"use client";

import { collection } from "firebase/firestore";
import { db } from "@/firebase/client";
import { useCollection } from "@/firebase/firestore/use-collection";
import type { Course, Faculty, Room } from "@/lib/types";

export function StatsCards() {
  const { data: courses } = useCollection<Course>(
    collection(db, "courses")
  );
  const { data: faculty } = useCollection<Faculty>(
    collection(db, "faculties")
  );
  const { data: rooms } = useCollection<Room>(
    collection(db, "rooms")
  );

  return (
    <div className="grid grid-cols-3 gap-4">
      <div>Courses: {courses?.length ?? 0}</div>
      <div>Faculty: {faculty?.length ?? 0}</div>
      <div>Rooms: {rooms?.length ?? 0}</div>
    </div>
  );
}

