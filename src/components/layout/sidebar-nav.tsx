"use client";

import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  Book,
  Users,
  Building,
  CalendarDays,
  LayoutDashboard,
  AlertTriangle,
  Bot,
  LayoutGrid,
  Clock,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/timetable", label: "Timetable", icon: CalendarDays },
  { href: "/dashboard/courses", label: "Courses", icon: Book },
  { href: "/dashboard/faculty", label: "Faculty", icon: Users },
  { href: "/dashboard/rooms", label: "Rooms", icon: Building },
  { href: "/dashboard/sections", label: "Sections", icon: LayoutGrid },
  { href: "/dashboard/timeslots", label: "Time Slots", icon: Clock },
  { href: "/dashboard/conflicts", label: "Conflicts", icon: AlertTriangle },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/40 px-3 py-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-primary/90 text-sidebar-primary-foreground shadow-sm">
            <Bot className="h-5 w-5" />
          </div>
          <div className="flex flex-col leading-tight">
            <h2 className="font-headline text-base font-semibold tracking-tight text-sidebar-foreground">
              ClassWise
            </h2>
            <span className="text-xs text-sidebar-foreground/70">
              Smart timetable studio
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{
                  children: item.label,
                  className: "bg-primary text-primary-foreground",
                }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

    </>
  );
}
