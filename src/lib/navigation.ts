import type { Role } from "@/types/auth";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  CalendarDays,
  Sparkles,
  FileText,
  CheckCircle2,
  FileX2,
  Book,
  Users,
  GraduationCap,
  LayoutGrid,
  Building,
  Clock,
  FileQuestion,
  AlertTriangle,
  Settings,
  Eye,
  MessageSquare,
  CheckSquare,
  User,
  CalendarRange,
  Clock3,
  Bell,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  group?: string;
}

const coordinatorNavItems: NavItem[] = [
  { label: "Dashboard", href: "/coordinator", icon: LayoutDashboard },
  { label: "Timetable", href: "/dashboard/timetable", icon: CalendarDays },
  { label: "Generate", href: "/dashboard/timetable", icon: Sparkles },
  { label: "Drafts", href: "/coordinator/timetable/drafts", icon: FileText },
  { label: "Published", href: "/coordinator/timetable/published", icon: CheckCircle2 },
  { label: "Versions", href: "/coordinator/timetable/versions", icon: FileX2 },
  { label: "Courses", href: "/dashboard/courses", icon: Book, group: "Resources" },
  { label: "Faculty", href: "/dashboard/faculty", icon: Users, group: "Resources" },
  { label: "Students", href: "/dashboard/sections", icon: GraduationCap, group: "Resources" },
  { label: "Sections", href: "/dashboard/sections", icon: LayoutGrid, group: "Resources" },
  { label: "Rooms", href: "/dashboard/rooms", icon: Building, group: "Resources" },
  { label: "Time Slots", href: "/dashboard/timeslots", icon: Clock, group: "Resources" },
  { label: "Constraints", href: "/dashboard/timetable", icon: FileQuestion },
  { label: "Conflicts", href: "/dashboard/conflicts", icon: AlertTriangle },
  { label: "Settings", href: "/coordinator", icon: Settings },
];

const hodNavItems: NavItem[] = [
  { label: "Dashboard", href: "/hod", icon: LayoutDashboard },
  { label: "Timetable Review", href: "/hod/review", icon: Eye },
  { label: "Suggestions", href: "/hod/suggestions", icon: MessageSquare },
  { label: "Approved", href: "/hod/approved", icon: CheckSquare },
  { label: "Published", href: "/hod/published", icon: CheckCircle2 },
  { label: "Profile", href: "/hod/profile", icon: User },
];

const facultyNavItems: NavItem[] = [
  { label: "Dashboard", href: "/faculty", icon: LayoutDashboard },
  { label: "My Timetable", href: "/faculty/timetable", icon: CalendarRange },
  { label: "Today's Schedule", href: "/faculty", icon: Clock3 },
  { label: "Weekly Schedule", href: "/faculty/timetable", icon: CalendarDays },
  { label: "Notifications", href: "/faculty", icon: Bell },
  { label: "Profile", href: "/faculty/profile", icon: User },
];

const studentNavItems: NavItem[] = [
  { label: "Dashboard", href: "/student", icon: LayoutDashboard },
  { label: "My Timetable", href: "/student/timetable", icon: CalendarRange },
  { label: "Today's Schedule", href: "/student", icon: Clock3 },
  { label: "Weekly Timetable", href: "/student/timetable", icon: CalendarDays },
  { label: "Announcements", href: "/student", icon: Bell },
  { label: "Profile", href: "/student/profile", icon: User },
];

const NAV_ITEMS_BY_ROLE: Record<Role, NavItem[]> = {
  coordinator: coordinatorNavItems,
  hod: hodNavItems,
  faculty: facultyNavItems,
  student: studentNavItems,
};

export function getNavItemsForRole(role: Role | null | undefined): NavItem[] {
  if (!role) return [];
  return NAV_ITEMS_BY_ROLE[role] ?? [];
}
