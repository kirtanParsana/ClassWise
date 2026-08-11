"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus } from "lucide-react";
import { StatusBadge } from "@/components/timetable/status-badge";
import { getAllTimetables } from "@/services/timetableService";
import type { TimetableMeta, TimetableStatus } from "@/types/timetable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DRAFT_STATUSES: TimetableStatus[] = ["draft", "generated", "changes_requested"];

function formatDate(value: TimetableMeta["createdAt"]) {
  if (!value) return "—";
  if (value instanceof Date) return value.toLocaleDateString();
  const ts = value as { seconds?: number };
  if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleDateString();
  return "—";
}

export default function CoordinatorDraftsPage() {
  const [timetables, setTimetables] = useState<TimetableMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllTimetables()
      .then((all) => setTimetables(all.filter((t) => DRAFT_STATUSES.includes(t.status))))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-semibold tracking-tight">Drafts</h1>
          <p className="text-sm text-muted-foreground">
            Timetables in draft, generated, or awaiting coordinator changes.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/timetable">
            <Plus className="mr-2 h-4 w-4" />
            Generate / Edit
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Draft Timetables</CardTitle>
          <CardDescription>
            Open, edit, regenerate, or submit for HOD review.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : timetables.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
              <p className="text-sm font-medium text-muted-foreground">No drafts yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Generate a timetable to get started.
              </p>
              <Button asChild className="mt-4" variant="outline">
                <Link href="/dashboard/timetable">Go to Timetable</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Conflicts</TableHead>
                  <TableHead>Created</TableHead>
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
                    <TableCell>
                      {t.hasCriticalConflicts ? (
                        <Badge variant="destructive">{t.unresolvedConflictCount ?? 0} critical</Badge>
                      ) : (
                        <Badge variant="secondary">Clear</Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(t.createdAt)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/coordinator/timetable/${t.id}`}>Open</Link>
                      </Button>
                      {t.status === "changes_requested" && (
                        <Button asChild size="sm">
                          <Link href={`/coordinator/timetable/${t.id}/review-feedback`}>
                            Feedback
                          </Link>
                        </Button>
                      )}
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
