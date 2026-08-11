import { Badge } from "@/components/ui/badge";
import type { TimetableStatus } from "@/types/timetable";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<
  TimetableStatus,
  { label: string; className: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  draft: {
    label: "Draft",
    className: "bg-slate-100 text-slate-700 border-slate-200",
    variant: "secondary",
  },
  generated: {
    label: "Generated",
    className: "bg-blue-100 text-blue-800 border-blue-200",
    variant: "secondary",
  },
  under_review: {
    label: "Under Review",
    className: "bg-amber-100 text-amber-800 border-amber-200",
    variant: "secondary",
  },
  changes_requested: {
    label: "Changes Requested",
    className: "bg-orange-100 text-orange-800 border-orange-200",
    variant: "secondary",
  },
  approved: {
    label: "Approved",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
    variant: "secondary",
  },
  published: {
    label: "Published",
    className: "bg-green-100 text-green-800 border-green-200",
    variant: "default",
  },
};

interface StatusBadgeProps {
  status: TimetableStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}

export function getStatusLabel(status: TimetableStatus): string {
  return STATUS_CONFIG[status]?.label ?? status;
}
