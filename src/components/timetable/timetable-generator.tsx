"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { CalendarPlus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScheduleEntry } from "@/lib/types";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

interface TimetableGeneratorProps {
  onTimetableGenerated: (newSchedule: ScheduleEntry[], timetableId?: string) => void;
  variant?: "card" | "button";
}

export function TimetableGenerator({
  onTimetableGenerated,
  variant = "card",
}: TimetableGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsLoading(true);

    try {
      const res = await authenticatedFetch("/api/generate-timetable", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Backend error");
      }

      onTimetableGenerated(data.schedule ?? [], data.timetableId);

      const conflictMsg =
        data.conflicts?.critical > 0
          ? ` Generated with ${data.conflicts.critical} critical conflict(s).`
          : "";

      toast({
        title: "Timetable Generated",
        description: `Timetable saved successfully.${conflictMsg}`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: err instanceof Error ? err.message : "Backend could not generate timetable.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "button") {
    return (
      <Button
        type="button"
        size="sm"
        className="h-9 shrink-0 gap-2 shadow-sm"
        onClick={handleGenerate}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating…
          </>
        ) : (
          <>
            <CalendarPlus className="h-4 w-4" />
            Generate Timetable
          </>
        )}
      </Button>
    );
  }

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle>Generate New Timetable</CardTitle>
        <CardDescription>
          Timetable generation is executed on the backend.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground">
          Click the button below to generate a new timetable using the
          available courses, faculty, rooms, sections, and time slots.
        </p>
      </CardContent>

      <CardFooter>
        <Button onClick={handleGenerate} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <CalendarPlus className="mr-2 h-4 w-4" />
              Generate Timetable
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
