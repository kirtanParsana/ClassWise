"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/timetable/status-badge";
import { getTimetablesByStatus } from "@/services/timetableService";
import type { TimetableMeta } from "@/types/timetable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatDate(value: TimetableMeta["publishedAt"]) {
  if (!value) return "—";
  const ts = value as { seconds?: number };
  if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleString();
  return "—";
}

export default function CoordinatorPublishedPage() {
  const [timetables, setTimetables] = useState<TimetableMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTimetablesByStatus("published").then(setTimetables).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-semibold tracking-tight">Published</h1>
        <p className="text-sm text-muted-foreground">
          Timetables currently visible to faculty and students.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Published Timetables</CardTitle>
          <CardDescription>Read-only view of live timetables.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : timetables.length === 0 ? (
            <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
              No published timetables yet. Submit and get HOD approval to publish.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Published By</TableHead>
                  <TableHead>Published At</TableHead>
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
                    <TableCell>{t.publishedByName ?? t.publishedBy ?? "—"}</TableCell>
                    <TableCell>{formatDate(t.publishedAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/coordinator/timetable/${t.id}`}>View</Link>
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
