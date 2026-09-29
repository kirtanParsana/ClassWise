"use client";

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { getNavItemsForRole, type NavItem } from "@/lib/navigation";
import { getRoleLabel } from "@/lib/rbac";

type GroupedItems = {
  ungrouped: NavItem[];
  groups: Record<string, NavItem[]>;
  groupOrder: string[];
};

function groupNavItems(items: NavItem[]): GroupedItems {
  const ungrouped: NavItem[] = [];
  const groups: Record<string, NavItem[]> = {};
  const groupOrder: string[] = [];

  for (const item of items) {
    if (item.group) {
      if (!groups[item.group]) {
        groups[item.group] = [];
        groupOrder.push(item.group);
      }
      groups[item.group].push(item);
    } else {
      ungrouped.push(item);
    }
  }

  return { ungrouped, groups, groupOrder };
}

export default function SidebarNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { role } = useAuth();
  const navItems = getNavItemsForRole(role);
  const { ungrouped, groups, groupOrder } = groupNavItems(navItems);

  // Compute exact active item ID to ensure ONLY ONE nav item is highlighted
  const fullPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

  let activeItemId: string | null = null;
  // First attempt exact full URL match (including query params)
  const exactMatch = navItems.find((item) => item.href === fullPath);
  if (exactMatch) {
    activeItemId = exactMatch.id;
  } else {
    // Fall back to exact pathname match
    const pathMatch = navItems.filter((item) => item.href.split("?")[0] === pathname);
    if (pathMatch.length > 0) {
      activeItemId = pathMatch[0].id;
    }
  }

  return (
    <>
      <SidebarHeader>
        <div className="flex flex-col gap-2 rounded-xl bg-sidebar-accent/50 p-3 border border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div className="flex flex-col leading-tight">
              <h2 className="font-headline text-base font-bold tracking-tight text-sidebar-foreground">
                ClassWise
              </h2>
              <span className="text-[11px] text-sidebar-foreground/70 font-medium">
                Smart timetable studio
              </span>
            </div>
          </div>
          {role && (
            <div className="mt-1 pt-2 border-t border-sidebar-border/60 flex items-center justify-between">
              <span className="text-[11px] font-medium text-sidebar-foreground/60">Current Role</span>
              <Badge variant="outline" className="text-[10px] font-semibold py-0 px-2 border-sidebar-border text-sidebar-foreground bg-sidebar-accent/70">
                {getRoleLabel(role)}
              </Badge>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-1 py-2">
        {navItems.length > 0 && (
          <>
            {ungrouped.length > 0 && (
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {ungrouped.map((item) => {
                      const isActive = activeItemId === item.id;
                      return (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            tooltip={{
                              children: item.label,
                              className: "bg-primary text-primary-foreground font-medium",
                            }}
                            className={`relative transition-all duration-150 rounded-lg px-3 py-2 ${
                              isActive
                                ? "bg-sidebar-accent text-sidebar-foreground font-semibold border-l-4 border-sidebar-primary shadow-sm"
                                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
                            }`}
                          >
                            <Link href={item.href} className="flex items-center gap-3">
                              <item.icon className={`h-4 w-4 ${isActive ? "text-sidebar-primary" : "text-sidebar-foreground/70"}`} />
                              <span className="text-sm">{item.label}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {groupOrder.map((groupName) => (
              <SidebarGroup key={groupName} className="pt-3">
                <SidebarGroupLabel className="text-[11px] font-bold uppercase tracking-wider text-sidebar-foreground/50 px-3">
                  {groupName}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {groups[groupName].map((item) => {
                      const isActive = activeItemId === item.id;
                      return (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            tooltip={{
                              children: item.label,
                              className: "bg-primary text-primary-foreground font-medium",
                            }}
                            className={`relative transition-all duration-150 rounded-lg px-3 py-2 ${
                              isActive
                                ? "bg-sidebar-accent text-sidebar-foreground font-semibold border-l-4 border-sidebar-primary shadow-sm"
                                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
                            }`}
                          >
                            <Link href={item.href} className="flex items-center gap-3">
                              <item.icon className={`h-4 w-4 ${isActive ? "text-sidebar-primary" : "text-sidebar-foreground/70"}`} />
                              <span className="text-sm">{item.label}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </>
        )}
      </SidebarContent>
    </>
  );
}
