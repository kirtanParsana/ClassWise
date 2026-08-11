"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/timetable/status-badge";
import { getTimetablesForHOD } from "@/services/timetableService";
import { useAuth } from "@/context/auth-context";
import type { TimetableMeta } from "@/types/timetable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatDate(value: TimetableMeta["submittedAt"]) {
  if (!value) return "—";
  const ts = value as { seconds?: number };
  if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleString();
  return "—";
}

export default function HODReviewListPage() {
  const { profile } = useAuth();
  const [timetables, setTimetables] = useState<TimetableMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTimetablesForHOD(profile?.departmentId)
      .then((all) => setTimetables(all.filter((t) => t.status === "under_review")))
      .finally(() => setLoading(false));
  }, [profile?.departmentId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-semibold tracking-tight">Timetable Review</h1>
        <p className="text-sm text-muted-foreground">
          Review timetables submitted by the coordinator.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Pending Review</CardTitle>
          <CardDescription>Timetables awaiting your decision.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : timetables.length === 0 ? (
            <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
              No timetables pending review.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Conflicts</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timetables.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell>
                      <StatusBadge status={t.status} /> v{t.version}
                    </TableCell>
                    <TableCell>{t.submittedByName ?? t.submittedBy ?? "—"}</TableCell>
                    <TableCell>{formatDate(t.submittedAt)}</TableCell>
                    <TableCell>
                      {t.hasCriticalConflicts ? (
                        <Badge variant="destructive">Critical</Badge>
                      ) : (
                        <Badge variant="secondary">Clear</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm">
                        <Link href={`/hod/review/${t.id}`}>Review</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
