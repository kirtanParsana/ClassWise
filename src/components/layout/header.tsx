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
import { User, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { getRoleLabel, getRoleBadgeVariant, getRoleDashboardPath } from "@/lib/rbac";
import Link from "next/link";

function getTitleFromPath(path: string): string {
  const segment = path.split("/").pop() || "dashboard";
  if (segment === "dashboard") return "Dashboard";
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const title = getTitleFromPath(pathname);
  const { profile, role, loading, isAuthenticated, logout } = useAuth();

  const showProfileMenu = !loading && isAuthenticated && profile;

  const handleSignOut = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <SidebarTrigger className="hidden md:inline-flex" />
        <h1 className="font-headline text-xl font-semibold text-foreground">
          {title}
        </h1>
      </div>

      <div className="ml-auto flex items-center gap-4">
        {showProfileMenu && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 h-auto py-1.5 px-2 hover:bg-accent"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs font-medium">
                    {profile.name ? getInitials(profile.name) : <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="flex flex-col gap-1 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-sm truncate">
                      {profile.name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {profile.email}
                    </span>
                  </div>
                </div>
                <div className="mt-1">
                  <Badge variant={getRoleBadgeVariant(role)}>
                    {getRoleLabel(role)}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="p-0 focus:bg-transparent">
                <Link
                  href={getRoleDashboardPath(role)}
                  className="w-full"
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-2 font-normal"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Button>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="p-0 focus:bg-transparent">
                <div className="w-full">
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-2 font-normal"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </Button>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
