"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Loader2 } from "lucide-react";
import { ConflictResolver } from "@/components/conflicts/conflict-resolver";

import { collection } from "firebase/firestore";
import { db } from "@/firebase/client";
import { useCollection } from "@/firebase/firestore/use-collection";

import type { Conflict } from "@/lib/types";

export default function ConflictsPage() {
  const { data: conflicts, loading } =
    useCollection<Conflict>(collection(db, "conflicts"));

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "Faculty Overlap":
        return "destructive";
      case "Room Double Booking":
        return "secondary";
      case "Resource Mismatch":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">
            Conflict Detection
          </CardTitle>
          <CardDescription>
            Review and resolve automatically detected scheduling conflicts.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !conflicts || conflicts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted p-12 text-center">
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/50">
                <AlertTriangle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold font-headline">
                No Conflicts Found
              </h3>
              <p className="text-muted-foreground">
                The current schedule is conflict-free.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {conflicts.map((conflict) => (
                <Card key={conflict.id} className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        <h3 className="font-semibold font-headline">
                          {conflict.type}
                        </h3>
                        <Badge variant={getBadgeVariant(conflict.type)}>
                          {conflict.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground pl-8">
                        {conflict.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0 self-end sm:self-center">
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
