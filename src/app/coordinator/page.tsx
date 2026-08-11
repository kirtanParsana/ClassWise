'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, CalendarPlus, Book, Users, Building, LayoutGrid, Clock } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useMasterData } from "@/context/master-data-context";
import { StatsCards } from "@/components/dashboard/stats-cards";

export default function CoordinatorDashboardPage() {
  const { profile, loading: authLoading } = useAuth();
  const { courses, faculty, rooms, sections, timeslots, loading: dataLoading } = useMasterData();

  if (authLoading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const resourceStats = [
    {
      title: "Total Courses",
      value: courses?.length ?? 0,
      icon: Book,
      color: "text-blue-500",
    },
    {
      title: "Total Faculty",
      value: faculty?.length ?? 0,
      icon: Users,
      color: "text-green-500",
    },
    {
      title: "Total Rooms",
      value: rooms?.length ?? 0,
      icon: Building,
      color: "text-purple-500",
    },
    {
      title: "Total Sections",
      value: sections?.length ?? 0,
      icon: LayoutGrid,
      color: "text-orange-500",
    },
    {
      title: "Total Timeslots",
      value: timeslots?.length ?? 0,
      icon: Clock,
      color: "text-pink-500",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-headline text-3xl font-semibold tracking-tight">
            Welcome, {profile?.name ?? "Coordinator"}
          </h1>
          <Badge variant="default" className="text-sm">
            Time Coordinator
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Manage timetable generation, resources, and resolve conflicts from your central workspace.
        </p>
      </div>

      <StatsCards />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {resourceStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-headline text-foreground">
                {dataLoading ? (
                  <Skeleton className="h-7 w-12" />
                ) : (
                  stat.value
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="flex flex-col border-dashed bg-card/80">
          <CardHeader>
            <CardTitle className="font-headline text-lg">
              Quick actions
            </CardTitle>
            <CardDescription>
              Jump directly into the most common flows.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-grow flex-col justify-center gap-3">
            <Link href="/dashboard/timetable" passHref>
              <Button
                size="lg"
                className="w-full justify-between rounded-xl bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                <div className="flex items-center gap-2">
                  <CalendarPlus className="h-5 w-5" />
                  <span>Generate Timetable</span>
                </div>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-lg">
              Resource Overview
            </CardTitle>
            <CardDescription>
              Current counts of all scheduled resources.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {resourceStats.slice(0, 3).map((stat) => (
              <div key={stat.title} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className={`rounded-full p-2 bg-muted ${stat.color}`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {stat.title}
                  </span>
                </div>
                <span className="text-lg font-semibold font-headline">
                  {dataLoading ? (
                    <Skeleton className="h-5 w-10" />
                  ) : (
                    stat.value
                  )}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
