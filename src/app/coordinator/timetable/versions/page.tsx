"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/timetable/status-badge";
import { getAllTimetables } from "@/services/timetableService";
import type { TimetableMeta } from "@/types/timetable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatDate(value: TimetableMeta["createdAt"]) {
  if (!value) return "—";
  const ts = value as { seconds?: number };
  if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleString();
  return "—";
}

export default function CoordinatorVersionsPage() {
  const [timetables, setTimetables] = useState<TimetableMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllTimetables().then(setTimetables).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-semibold tracking-tight">Versions</h1>
        <p className="text-sm text-muted-foreground">
          Historical timetable versions and workflow audit trail.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">All Timetable Versions</CardTitle>
          <CardDescription>Every saved timetable with status and version history.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Approved</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timetables.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell>
                      <StatusBadge status={t.status} />
                    </TableCell>
                    <TableCell>v{t.version}</TableCell>
                    <TableCell>{t.createdByName ?? t.createdBy}</TableCell>
                    <TableCell>{formatDate(t.submittedAt)}</TableCell>
                    <TableCell>{formatDate(t.approvedAt)}</TableCell>
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
