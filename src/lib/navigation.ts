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
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  group?: string;
}

const coordinatorNavItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/coordinator", icon: LayoutDashboard },
  { id: "timetable", label: "Timetable", href: "/dashboard/timetable", icon: CalendarDays },
  { id: "generate", label: "Generate", href: "/dashboard/timetable?tab=generate", icon: Sparkles },
  { id: "drafts", label: "Drafts", href: "/coordinator/timetable/drafts", icon: FileText },
  { id: "published", label: "Published", href: "/coordinator/timetable/published", icon: CheckCircle2 },
  { id: "versions", label: "Versions", href: "/coordinator/timetable/versions", icon: FileX2 },
  { id: "constraints", label: "Constraints", href: "/dashboard/timetable?tab=constraints", icon: FileQuestion },
  { id: "conflicts", label: "Conflicts", href: "/dashboard/conflicts", icon: AlertTriangle },
  { id: "settings", label: "Settings", href: "/coordinator/profile", icon: Settings },
  { id: "courses", label: "Courses", href: "/dashboard/courses", icon: Book, group: "Resources" },
  { id: "faculty", label: "Faculty", href: "/dashboard/faculty", icon: Users, group: "Resources" },
  { id: "students", label: "Students", href: "/dashboard/sections?view=students", icon: GraduationCap, group: "Resources" },
  { id: "sections", label: "Sections", href: "/dashboard/sections", icon: LayoutGrid, group: "Resources" },
  { id: "rooms", label: "Rooms", href: "/dashboard/rooms", icon: Building, group: "Resources" },
  { id: "timeslots", label: "Time Slots", href: "/dashboard/timeslots", icon: Clock, group: "Resources" },
];

const hodNavItems: NavItem[] = [
  { id: "hod-dashboard", label: "Dashboard", href: "/hod", icon: LayoutDashboard },
  { id: "dept-timetable", label: "Department Timetable", href: "/hod/review", icon: Eye },
  { id: "faculty-workload", label: "Faculty Workload", href: "/hod/review?tab=workload", icon: Users },
  { id: "hod-conflicts", label: "Conflicts", href: "/dashboard/conflicts", icon: AlertTriangle },
  { id: "approvals", label: "Approvals", href: "/hod/approved", icon: CheckSquare },
  { id: "hod-published", label: "Published Timetable", href: "/hod/published", icon: CheckCircle2 },
  { id: "hod-faculty", label: "Faculty", href: "/dashboard/faculty", icon: Users, group: "Resources" },
  { id: "hod-courses", label: "Courses", href: "/dashboard/courses", icon: Book, group: "Resources" },
  { id: "hod-sections", label: "Sections", href: "/dashboard/sections", icon: LayoutGrid, group: "Resources" },
  { id: "hod-rooms", label: "Rooms", href: "/dashboard/rooms", icon: Building, group: "Resources" },
];

const facultyNavItems: NavItem[] = [
  { id: "faculty-dashboard", label: "Dashboard", href: "/faculty", icon: LayoutDashboard },
  { id: "my-timetable", label: "My Timetable", href: "/faculty/timetable", icon: CalendarRange },
  { id: "my-courses", label: "My Courses", href: "/faculty/timetable?view=courses", icon: Book },
  { id: "availability", label: "Availability", href: "/faculty/profile", icon: User },
  { id: "faculty-conflicts", label: "Conflicts", href: "/dashboard/conflicts", icon: AlertTriangle },
  { id: "notifications", label: "Notifications", href: "/faculty/profile?tab=notifications", icon: Bell },
];

const studentNavItems: NavItem[] = [
  { id: "student-dashboard", label: "Dashboard", href: "/student", icon: LayoutDashboard },
  { id: "student-timetable", label: "My Timetable", href: "/student/timetable", icon: CalendarRange },
  { id: "today-schedule", label: "Today", href: "/student?view=today", icon: Clock3 },
  { id: "this-week", label: "This Week", href: "/student/timetable", icon: CalendarDays },
  { id: "student-courses", label: "Courses", href: "/student/timetable?view=courses", icon: Book },
  { id: "exams", label: "Exams", href: "/student/timetable?view=exams", icon: FileText },
  { id: "student-notifications", label: "Notifications", href: "/student/profile?tab=notifications", icon: Bell },
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
