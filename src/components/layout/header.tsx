"use client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { Bot } from "lucide-react";
import Link from "next/link";

function getTitleFromPath(path: string): string {
  const segment = path.split("/").pop() || "dashboard";
  if (segment === 'dashboard') return 'Dashboard';
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

export default function Header() {
  const pathname = usePathname();
  const title = getTitleFromPath(pathname);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex items-center gap-2">
        {/* Mobile: show toggle button */}
        <SidebarTrigger className="md:hidden" />
        {/* Desktop: show toggle button as well */}
        <SidebarTrigger className="hidden md:inline-flex" />
        <h1 className="font-headline text-xl font-semibold text-foreground">
          {title}
        </h1>
      </div>

      <div className="ml-auto flex items-center gap-4">
        {/* Placeholder for any future header items */}
      </div>
    </header>
  );
}
