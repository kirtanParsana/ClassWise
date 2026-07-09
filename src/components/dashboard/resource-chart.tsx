"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useCollection } from "@/firebase";
import { collection, getFirestore } from "firebase/firestore";
import type { Course, Faculty, Room } from "@/lib/types";

const chartConfig = {
  total: {
    label: "Total",
    color: "hsl(var(--chart-1))",
  },
};

export function ResourceChart() {
  const firestore = getFirestore();

  const coursesRef = useMemo(() => collection(firestore, 'courses'), [firestore]);
  const facultyRef = useMemo(() => collection(firestore, 'faculties'), [firestore]);
  const roomsRef = useMemo(() => collection(firestore, 'rooms'), [firestore]);

  const { data: courses } = useCollection<Course>(coursesRef);
  const { data: faculty } = useCollection<Faculty>(facultyRef);
  const { data: rooms } = useCollection<Room>(roomsRef);

  const chartData = [
    { name: "Courses", total: courses?.length ?? 0 },
    { name: "Faculty", total: faculty?.length ?? 0 },
    { name: "Rooms", total: rooms?.length ?? 0 },
    { name: "Labs", total: rooms?.filter(r => r.isLab).length ?? 0 },
    { name: "Classrooms", total: rooms?.filter(r => !r.isLab).length ?? 0 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Resource Overview</CardTitle>
        <CardDescription>
          Total count of available campus resources.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer config={chartConfig} className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--accent) / 0.2)' }}
                  content={<ChartTooltipContent />}
                />
                <Bar dataKey="total" fill="var(--color-total)" name="Total" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
