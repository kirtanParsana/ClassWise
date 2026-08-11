'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2, FileCheck, Building2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { getTimetablesForHOD } from "@/services/timetableService";
import type { TimetableMeta } from "@/types/timetable";

export default function HODDashboardPage() {
  const { profile, loading: authLoading } = useAuth();
  const [timetables, setTimetables] = useState<TimetableMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    getTimetablesForHOD(profile.departmentId)
      .then(setTimetables)
      .finally(() => setLoading(false));
  }, [profile]);

  const pending = timetables.filter((t) => t.status === "under_review");
  const changesRequested = timetables.filter((t) => t.status === "changes_requested");
  const approved = timetables.filter((t) => t.status === "approved");
  const published = timetables.filter((t) => t.status === "published");

  if (authLoading || loading) {
    return (
      <div className="flex flex-col gap-8">
        <Skeleton className="h-10 w-72" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-headline text-3xl font-semibold tracking-tight">
            Welcome, {profile?.name ?? "HOD"}
          </h1>
          <Badge variant="secondary" className="text-sm">HOD</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Review, approve, and publish timetables for your department.
        </p>
        {profile?.departmentId && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span>Department ID: {profile.departmentId}</span>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-amber-500" />
                  Pending Reviews
                </CardTitle>
                <CardDescription>Timetables awaiting your approval.</CardDescription>
              </div>
              <Badge variant="secondary">{pending.length} items</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {pending.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-lg">
                <Clock className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No pending reviews</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {pending.slice(0, 5).map((t) => (
                  <li key={t.id} className="flex items-center justify-between rounded border p-3 text-sm">
                    <span>{t.name}</span>
                    <Button asChild size="sm">
                      <Link href={`/hod/review/${t.id}`}>Review</Link>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Approved & Published
                </CardTitle>
                <CardDescription>Recently approved and live timetables.</CardDescription>
              </div>
              <Badge variant="default">{approved.length + published.length} items</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {[...approved, ...published].length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-lg">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No approved timetables yet</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {[...approved, ...published].slice(0, 5).map((t) => (
                  <li key={t.id} className="flex items-center justify-between rounded border p-3 text-sm">
                    <span>{t.name}</span>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/hod/review/${t.id}`}>View</Link>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-lg">Department Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-xs font-medium text-muted-foreground mb-1">Pending Reviews</p>
            <p className="text-2xl font-bold font-headline">{pending.length}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-xs font-medium text-muted-foreground mb-1">Changes Requested</p>
            <p className="text-2xl font-bold font-headline">{changesRequested.length}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-xs font-medium text-muted-foreground mb-1">Approved</p>
            <p className="text-2xl font-bold font-headline">{approved.length}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-xs font-medium text-muted-foreground mb-1">Published</p>
            <p className="text-2xl font-bold font-headline">{published.length}</p>
          </div>
        </CardContent>
      </Card>

      <Button asChild>
        <Link href="/hod/review">Go to Timetable Review</Link>
      </Button>
    </div>
  );
}
