'use client';

import type { ReactNode } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import {
  Sidebar,
  SidebarProvider,
  SidebarInset,
  SidebarRail,
} from "@/components/ui/sidebar";
import Header from "@/components/layout/header";
import SidebarNav from "@/components/layout/sidebar-nav";
import { MasterDataProvider } from "@/context/master-data-context";

export default function FacultyLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['faculty']}>
      <MasterDataProvider>
        <SidebarProvider>
          <Sidebar>
            <SidebarRail />
            <SidebarNav />
          </Sidebar>
          <SidebarInset>
            <Header />
            <main className="min-h-[calc(100vh-4rem)] bg-muted/20 p-4 transition-[margin] md:p-6 lg:p-8">
              <div className="mx-auto max-w-6xl space-y-6">
                {children}
              </div>
            </main>
          </SidebarInset>
        </SidebarProvider>
      </MasterDataProvider>
    </ProtectedRoute>
  );
}
