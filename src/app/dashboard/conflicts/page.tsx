"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, Loader2, ShieldCheck, ArrowRight, RefreshCw } from "lucide-react";
import { ConflictResolver } from "@/components/conflicts/conflict-resolver";

import { collection } from "firebase/firestore";
import { db } from "@/firebase/client";
import { useCollection } from "@/firebase/firestore/use-collection";
import { useState, useEffect } from "react";

import type { Conflict } from "@/lib/types";
import Link from "next/link";

export default function ConflictsPage() {
  const { data: conflicts, loading } = useCollection<Conflict>(collection(db, "conflicts"));
  const [analyzingStep, setAnalyzingStep] = useState(1);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setAnalyzingStep((prev) => (prev < 4 ? prev + 1 : 4));
    }, 600);
    return () => clearInterval(interval);
  }, [loading]);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="flex flex-col gap-2 border-b pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
                Conflict Resolution &amp; Diagnostics
              </h1>
              <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5">
                Constraint Checker
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Automatically detect faculty collisions, room double bookings, and capacity mismatches.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/dashboard/timetable">
              <Button variant="outline" size="sm" className="gap-2 font-medium">
                Open Timetable Grid
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Card className="shadow-xs">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="font-headline text-lg font-bold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Automated Schedule Diagnostics
          </CardTitle>
          <CardDescription className="text-xs">
            Hard constraints validation status across active semester schedules.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          {loading ? (
            /* Interactive Step Loading State */
            <div className="flex flex-col items-center justify-center p-8 space-y-6 max-w-md mx-auto text-center border rounded-xl bg-card">
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="font-headline font-bold text-base text-foreground">Analyzing schedule...</span>
              </div>

              <div className="w-full space-y-2 text-left text-xs font-medium border-t pt-4">
                <div className={`flex items-center justify-between p-2.5 rounded-lg ${analyzingStep >= 1 ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-muted text-muted-foreground"}`}>
                  <span>Checking faculty overlaps</span>
                  {analyzingStep >= 1 ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                </div>

                <div className={`flex items-center justify-between p-2.5 rounded-lg ${analyzingStep >= 2 ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-muted text-muted-foreground"}`}>
                  <span>Checking room double bookings</span>
                  {analyzingStep >= 2 ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <span className="text-xs">◌</span>}
                </div>

                <div className={`flex items-center justify-between p-2.5 rounded-lg ${analyzingStep >= 3 ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-muted text-muted-foreground"}`}>
                  <span>Checking section timetable continuity</span>
                  {analyzingStep >= 3 ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <span className="text-xs">◌</span>}
                </div>

                <div className={`flex items-center justify-between p-2.5 rounded-lg ${analyzingStep >= 4 ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-muted text-muted-foreground"}`}>
                  <span>Checking capacity constraints</span>
                  {analyzingStep >= 4 ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <span className="text-xs">◌</span>}
                </div>
              </div>
            </div>
          ) : !conflicts || conflicts.length === 0 ? (
            /* Clean Empty State */
            <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10 p-12 text-center max-w-xl mx-auto my-4">
              <div className="rounded-full bg-emerald-100 p-4 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold font-headline text-foreground">
                  ✓ No conflicts detected
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                  Your current timetable satisfies all active hard constraints. Faculty, room, and section allocations are clear.
                </p>
              </div>
              <Link href="/dashboard/timetable">
                <Button size="sm" className="mt-2 text-xs gap-1.5 font-semibold">
                  <span>Return to Timetable Studio</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          ) : (
            /* Conflict List State */
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground pb-2">
                <span>Displaying {conflicts.length} active conflict warning(s)</span>
                <Badge variant="destructive" className="font-bold text-[10px]">Action Required</Badge>
              </div>

              {conflicts.map((conflict) => (
                <Card key={conflict.id} className="p-5 border-destructive/40 bg-destructive/[0.02]">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="space-y-2 flex-grow">
                      <div className="flex items-center gap-2.5">
                        <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                        <h3 className="font-bold font-headline text-base text-foreground">
                          {conflict.type}
                        </h3>
                        <Badge variant="destructive" className="text-[10px] uppercase font-bold tracking-wider">
                          {conflict.type}
                        </Badge>
                      </div>

                      <p className="text-xs text-foreground/90 pl-7 leading-relaxed font-medium">
                        {conflict.description}
                      </p>

                      <div className="pl-7 pt-1 space-y-1 text-xs text-muted-foreground">
                        <p><span className="font-semibold text-foreground">Conflict reason:</span> Faculty or room double-booked in overlapping timeslot.</p>
                        <p><span className="font-semibold text-foreground">Suggested action:</span> Reassign to an open slot or alternative classroom.</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0">
                      <ConflictResolver conflict={conflict} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
