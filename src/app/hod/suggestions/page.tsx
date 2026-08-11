"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { getAllTimetables } from "@/services/timetableService";
import { getTimetableSuggestions } from "@/services/suggestionService";
import type { Suggestion } from "@/types/timetable";
import { Badge } from "@/components/ui/badge";

export default function HODSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<(Suggestion & { timetableName?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const timetables = await getAllTimetables();
      const all: (Suggestion & { timetableName?: string })[] = [];
      for (const t of timetables) {
        const list = await getTimetableSuggestions(t.id);
        all.push(...list.map((s) => ({ ...s, timetableName: t.name })));
      }
      setSuggestions(all.sort((a, b) => {
        const ta = (a.createdAt as { seconds?: number })?.seconds ?? 0;
        const tb = (b.createdAt as { seconds?: number })?.seconds ?? 0;
        return tb - ta;
      }));
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-semibold">Suggestions</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Suggestions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          ) : suggestions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No suggestions yet.</p>
          ) : (
            suggestions.map((s) => (
              <div key={s.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{s.timetableName ?? s.timetableId}</p>
                  <Badge variant={s.status === "open" ? "destructive" : "secondary"}>
                    {s.status}
                  </Badge>
                </div>
                <p className="mt-2 text-sm">{s.message}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
