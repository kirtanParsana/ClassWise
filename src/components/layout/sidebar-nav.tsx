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
import { Bot } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { getNavItemsForRole, type NavItem } from "@/lib/navigation";

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
  const { role } = useAuth();
  const navItems = getNavItemsForRole(role);
  const { ungrouped, groups, groupOrder } = groupNavItems(navItems);

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
        {navItems.length > 0 && (
          <>
            {ungrouped.length > 0 && (
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {ungrouped.map((item) => (
                      <SidebarMenuItem key={item.href + item.label}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.href}
                          tooltip={{
                            children: item.label,
                            className:
                              "bg-primary text-primary-foreground",
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
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {groupOrder.map((groupName) => (
              <SidebarGroup key={groupName}>
                <SidebarGroupLabel>{groupName}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {groups[groupName].map((item) => (
                      <SidebarMenuItem key={item.href + item.label}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.href}
                          tooltip={{
                            children: item.label,
                            className:
                              "bg-primary text-primary-foreground",
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
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </>
        )}
      </SidebarContent>
    </>
  );
}
