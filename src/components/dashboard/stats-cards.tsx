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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, Building, Users, LayoutGrid, Clock, AlertTriangle } from "lucide-react";
import { collection } from "firebase/firestore";
import { db } from "@/firebase/client";
import { useCollection } from "@/firebase/firestore/use-collection";
import type { Course, Faculty, Room, Section, Timeslot, Conflict } from "@/lib/types";
import Link from "next/link";

export function StatsCards() {
  const { data: courses } = useCollection<Course>(collection(db, "courses"));
  const { data: faculty } = useCollection<Faculty>(collection(db, "faculties"));
  const { data: rooms } = useCollection<Room>(collection(db, "rooms"));
  const { data: sections } = useCollection<Section>(collection(db, "sections"));
  const { data: timeslots } = useCollection<Timeslot>(collection(db, "timeslots"));
  const { data: conflicts } = useCollection<Conflict>(collection(db, "conflicts"));

  const stats = [
    {
      title: "Courses",
      value: courses?.length ?? 0,
      subtext: "Active catalog",
      icon: Book,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40",
      href: "/dashboard/courses",
    },
    {
      title: "Faculty",
      value: faculty?.length ?? 0,
      subtext: "Assigned staff",
      icon: Users,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40",
      href: "/dashboard/faculty",
    },
    {
      title: "Rooms",
      value: rooms?.length ?? 0,
      subtext: "Capacity mapped",
      icon: Building,
      color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40",
      href: "/dashboard/rooms",
    },
    {
      title: "Sections",
      value: sections?.length ?? 0,
      subtext: "Student cohorts",
      icon: LayoutGrid,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40",
      href: "/dashboard/sections",
    },
    {
      title: "Time Slots",
      value: timeslots?.length ?? 0,
      subtext: "Daily grid slots",
      icon: Clock,
      color: "text-sky-600 bg-sky-50 dark:bg-sky-950/40",
      href: "/dashboard/timeslots",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Link href={stat.href} key={stat.title}>
            <Card className="transition-all hover:border-primary/40 hover:shadow-md h-full cursor-pointer group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.color} transition-transform group-hover:scale-105`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                <div className="text-2xl font-bold font-headline text-foreground">
                  {stat.value}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {stat.subtext}
                </p>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

