"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function HODApprovedPage() {
  const [timetables, setTimetables] = useState<TimetableMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTimetablesByStatus("approved").then(setTimetables).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-semibold">Approved Timetables</h1>
      <Card>
        <CardHeader>
          <CardTitle>Ready to Publish</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          ) : timetables.length === 0 ? (
            <p className="text-sm text-muted-foreground">No approved timetables.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timetables.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.name}</TableCell>
                    <TableCell>
                      <StatusBadge status={t.status} /> v{t.version}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm">
                        <Link href={`/hod/review/${t.id}`}>Publish</Link>
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
