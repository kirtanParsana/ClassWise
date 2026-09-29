"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, ShieldCheck, Cpu } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/context/auth-context";
import { getRoleDashboardPath } from "@/lib/rbac";

const features = [
  {
    icon: Cpu,
    title: "1. Intelligent Scheduling",
    description: "Generate conflict-free academic timetables with automated constraints.",
  },
  {
    icon: ShieldCheck,
    title: "2. Role-Based Access",
    description: "Tailored workspaces for Time Coordinators, HODs, Faculty, and Students.",
  },
  {
    icon: CalendarDays,
    title: "3. Resource Optimization",
    description: "Maximize room utilization, faculty availability, and section balance.",
  },
];

function LoginLoadingSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-sm space-y-6 p-8">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 text-center">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loading, isAuthenticated, role } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (isAuthenticated && role) {
      const next = searchParams.get("next");
      if (next && next.startsWith("/")) {
        router.replace(next);
        return;
      }
      router.replace(getRoleDashboardPath(role));
    }
  }, [loading, isAuthenticated, role, router, searchParams]);

  if (loading) {
    return <LoginLoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="min-h-screen grid lg:grid-cols-2">
        {/* Left Side Branding Column */}
        <div className="hidden lg:flex flex-col justify-between bg-slate-900 text-slate-100 p-12 relative overflow-hidden border-r border-slate-800">
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
                <CalendarDays className="h-6 w-6" />
              </div>
              <div className="flex flex-col leading-tight">
                <h1 className="text-2xl font-headline font-bold tracking-tight text-white">
                  ClassWise
                </h1>
                <p className="text-xs text-slate-400 font-medium tracking-wide">
                  Smart timetable studio
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 space-y-8 my-auto">
            <div className="space-y-3">
              <h2 className="text-3xl font-headline font-bold leading-tight tracking-tight text-white sm:text-4xl">
                Intelligent timetable planning, simplified.
              </h2>
              <p className="text-base text-slate-300 max-w-md leading-relaxed">
                Generate conflict-free academic schedules, optimize resources, and give every role a focused view of what matters.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 max-w-md">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 shadow-sm"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-sm text-slate-100 leading-none">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative z-10 text-xs text-slate-500 font-medium">
            © {new Date().getFullYear()} ClassWise Academic Scheduling. Institutional SaaS Platform.
          </div>
        </div>

        {/* Right Side Form Column */}
        <div className="flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-muted/20">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex flex-col items-center mb-8 space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
                <CalendarDays className="h-6 w-6" />
              </div>
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-headline font-bold tracking-tight">
                  ClassWise
                </h1>
                <p className="text-xs text-muted-foreground font-medium">
                  Smart timetable studio
                </p>
              </div>
            </div>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoadingSkeleton />}>
      <LoginPageContent />
    </Suspense>
  );
}
