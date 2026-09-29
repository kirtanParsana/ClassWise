'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2, FileCheck, Building2, Eye, ArrowRight, AlertTriangle, Users } from "lucide-react";
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
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header Banner */}
      <div className="flex flex-col gap-2 border-b pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
                Welcome back, {profile?.name ?? "HOD"}
              </h1>
              <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-0.5">
                Head of Department
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Review, approve, and publish department schedules while monitoring faculty workload.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/hod/review">
              <Button size="sm" className="gap-2 font-medium shadow-xs">
                <Eye className="h-4 w-4" />
                Review Department Timetables
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Department Overview Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center justify-between">
              <span>Pending Reviews</span>
              <FileCheck className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold font-headline text-amber-950 dark:text-amber-100">
              {pending.length}
            </div>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-0.5">Awaiting HOD approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Changes Requested</span>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold font-headline text-foreground">
              {changesRequested.length}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Returned for revision</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Approved</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold font-headline text-foreground">
              {approved.length}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Ready to publish</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
              <span>Published Live</span>
              <CheckCircle2 className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold font-headline text-emerald-950 dark:text-emerald-100">
              {published.length}
            </div>
            <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">Active semester schedules</p>
          </CardContent>
        </Card>
      </div>

      {/* Review Action Columns */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-headline text-lg font-bold flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-amber-500" />
                  Pending Reviews
                </CardTitle>
                <CardDescription className="text-xs">Timetables awaiting your approval</CardDescription>
              </div>
              <Badge variant="outline" className="text-xs font-semibold">{pending.length} items</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
            {pending.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed rounded-lg">
                <Clock className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-xs font-medium text-muted-foreground">No pending timetables awaiting review.</p>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {pending.slice(0, 5).map((t) => (
                  <li key={t.id} className="flex items-center justify-between rounded-lg border p-3 text-xs bg-card hover:bg-muted/30 transition-colors">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-foreground">{t.name}</p>
                      <p className="text-[11px] text-muted-foreground">Semester {t.semester ?? "—"}</p>
                    </div>
                    <Button asChild size="sm" className="h-8 text-xs font-medium gap-1">
                      <Link href={`/hod/review/${t.id}`}>
                        <span>Review</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-headline text-lg font-bold flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  Approved & Published
                </CardTitle>
                <CardDescription className="text-xs">Active and verified department timetables</CardDescription>
              </div>
              <Badge variant="outline" className="text-xs font-semibold">{approved.length + published.length} items</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
            {[...approved, ...published].length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed rounded-lg">
                <CheckCircle2 className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-xs font-medium text-muted-foreground">No approved or published timetables yet.</p>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {[...approved, ...published].slice(0, 5).map((t) => (
                  <li key={t.id} className="flex items-center justify-between rounded-lg border p-3 text-xs bg-card">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-foreground">{t.name}</p>
                      <Badge variant={t.status === "published" ? "default" : "secondary"} className="text-[10px]">
                        {t.status === "published" ? "Published" : "Approved"}
                      </Badge>
                    </div>
                    <Button asChild size="sm" variant="outline" className="h-8 text-xs font-medium">
                      <Link href={`/hod/review/${t.id}`}>View Details</Link>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
