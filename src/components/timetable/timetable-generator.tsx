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

interface TimetableGeneratorProps {
  onTimetableGenerated: (newSchedule: ScheduleEntry[]) => void;
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
      const res = await fetch("/api/generate-timetable", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Backend error");
      }

      const data = await res.json();
      onTimetableGenerated(data.schedule ?? []);

      toast({
        title: "Timetable Generated",
        description: "Timetable successfully generated.",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Backend could not generate timetable.",
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
