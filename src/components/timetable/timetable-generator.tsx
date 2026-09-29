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
import { Badge } from "@/components/ui/badge";
import { CalendarPlus, Loader2, CheckCircle2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScheduleEntry } from "@/lib/types";
import { authenticatedFetch } from "@/lib/authenticated-fetch";

interface TimetableGeneratorProps {
  onTimetableGenerated: (newSchedule: ScheduleEntry[], timetableId?: string) => void;
  variant?: "card" | "button";
}

const WORKFLOW_STEPS = [
  { id: "01", label: "Data" },
  { id: "02", label: "Constraints" },
  { id: "03", label: "Generate" },
  { id: "04", label: "Review" },
  { id: "05", label: "Publish" },
];

export function TimetableGenerator({
  onTimetableGenerated,
  variant = "card",
}: TimetableGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(2); // Step 03 default
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsLoading(true);
    setActiveStepIndex(2); // 03 Generate

    try {
      const res = await authenticatedFetch("/api/generate-timetable", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Backend error");
      }

      setActiveStepIndex(3); // 04 Review
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
        className="h-9 shrink-0 gap-2 shadow-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4"
        onClick={handleGenerate}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating Schedule…
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate Timetable
          </>
        )}
      </Button>
    );
  }

  return (
    <Card className="border-border shadow-xs">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <div className="flex items-center justify-between">
          <CardTitle className="font-headline text-lg font-bold flex items-center gap-2">
            <CalendarPlus className="h-5 w-5 text-primary" />
            Smart Timetable Studio Generator
          </CardTitle>
          <Badge variant="outline" className="text-xs font-semibold">
            Automated Engine
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Executes multi-objective constraint optimization across faculty, rooms, and sections.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Step-Based Progress Bar */}
        <div className="rounded-lg border p-3 bg-card">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Workflow Pipeline Step
          </p>
          <div className="grid grid-cols-5 gap-1 text-center">
            {WORKFLOW_STEPS.map((step, idx) => {
              const isCompleted = idx < activeStepIndex;
              const isCurrent = idx === activeStepIndex;
              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center p-1.5 rounded-md transition-colors ${
                    isCurrent
                      ? "bg-primary text-primary-foreground font-bold shadow-xs"
                      : isCompleted
                      ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold"
                      : "bg-muted/40 text-muted-foreground"
                  }`}
                >
                  <span className="text-[10px] opacity-80">{step.id}</span>
                  <span className="text-xs">{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2 border-t">
        <Button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full font-semibold gap-2 shadow-xs"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating Timetable…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Run Auto-Scheduler Engine
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
