"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import {
  User,
  LogOut,
  ChevronDown,
  Bell,
  Sliders,
  HelpCircle,
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
  AlertTriangle,
  Settings,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { getRoleLabel, getRoleDashboardPath } from "@/lib/rbac";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

function getPageMetaFromPath(path: string): { title: string; icon: any } {
  const segment = path.split("/").pop() || "dashboard";
  switch (segment) {
    case "coordinator":
    case "hod":
    case "faculty":
    case "student":
    case "dashboard":
      return { title: "Dashboard", icon: LayoutDashboard };
    case "timetable":
      return { title: "Timetable Studio", icon: CalendarDays };
    case "generate":
      return { title: "Timetable Generator", icon: Sparkles };
    case "drafts":
      return { title: "Timetable Drafts", icon: FileText };
    case "published":
      return { title: "Published Schedules", icon: CheckCircle2 };
    case "versions":
      return { title: "Version History", icon: FileX2 };
    case "courses":
      return { title: "Course Catalog", icon: Book };
    case "faculty":
      return { title: "Faculty Directory", icon: Users };
    case "sections":
      return { title: "Class Sections", icon: LayoutGrid };
    case "rooms":
      return { title: "Room Allocations", icon: Building };
    case "timeslots":
      return { title: "Time Slots", icon: Clock };
    case "conflicts":
      return { title: "Conflict Resolution", icon: AlertTriangle };
    case "profile":
      return { title: "User Profile & Preferences", icon: User };
    case "review":
      return { title: "Department Review", icon: CheckCircle2 };
    default:
      return {
        title: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
        icon: Settings,
      };
  }
}

function getInitials(name: string): string {
  if (!name) return "CW";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { title, icon: PageIcon } = getPageMetaFromPath(pathname);
  const { profile, role, loading, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();

  const [hasUnread, setHasUnread] = useState(true);

  const showProfileMenu = !loading && isAuthenticated && profile;

  const handleSignOut = async () => {
    await logout();
    router.push("/login");
  };

  const handlePreferenceClick = () => {
    toast({
      title: "Preferences",
      description: "User preferences panel is aligned with current role settings.",
    });
  };

  const handleHelpClick = () => {
    toast({
      title: "ClassWise Help & Documentation",
      description: "Refer to system guidelines or contact institutional admin.",
    });
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="md:hidden" />
        <SidebarTrigger className="hidden md:inline-flex" />
        <div className="h-4 w-px bg-border hidden sm:block" />
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <PageIcon className="h-4 w-4" />
          </div>
          <h1 className="font-headline text-lg font-bold tracking-tight text-foreground">
            {title}
          </h1>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* Notification Bell */}
        {showProfileMenu && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                aria-label="Notifications"
                onClick={() => setHasUnread(false)}
              >
                <Bell className="h-4 w-4" />
                {hasUnread && (
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background animate-pulse" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <span className="font-headline text-sm font-semibold">Notifications</span>
                <Badge variant="secondary" className="text-[10px]">3 New</Badge>
              </div>
              <div className="divide-y text-xs">
                <div className="p-3 hover:bg-muted/40 transition-colors cursor-pointer">
                  <p className="font-medium text-foreground">Timetable Draft Saved</p>
                  <p className="text-muted-foreground mt-0.5">Fall 2026 Semester schedule updated 10 mins ago.</p>
                </div>
                <div className="p-3 hover:bg-muted/40 transition-colors cursor-pointer">
                  <p className="font-medium text-foreground">Conflict Alert Cleared</p>
                  <p className="text-muted-foreground mt-0.5">Faculty overlap in Room 307 was resolved.</p>
                </div>
                <div className="p-3 hover:bg-muted/40 transition-colors cursor-pointer">
                  <p className="font-medium text-foreground">Department Review Request</p>
                  <p className="text-muted-foreground mt-0.5">HOD submitted feedback for Section 6A1.</p>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* User Profile Trigger & Menu */}
        {showProfileMenu && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2.5 h-10 px-2.5 rounded-lg hover:bg-muted transition-colors"
              >
                <Avatar className="h-8 w-8 border border-border/80 shadow-xs">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start leading-none text-left">
                  <span className="text-xs font-bold text-foreground">
                    {getInitials(profile.name)}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-medium mt-0.5">
                    {getRoleLabel(role)}
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel className="p-3">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold leading-none">{profile.name}</p>
                  <p className="text-xs leading-none text-muted-foreground truncate">{profile.email}</p>
                  <div className="mt-1.5">
                    <Badge variant="outline" className="text-[10px] font-semibold">
                      {getRoleLabel(role)}
                    </Badge>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={getRoleDashboardPath(role)} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePreferenceClick} className="cursor-pointer">
                <Sliders className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Preferences</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleHelpClick} className="cursor-pointer">
                <HelpCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Help</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
