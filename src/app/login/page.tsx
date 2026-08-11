"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bot, CalendarDays, Users, Building2, BookOpen } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/context/auth-context";
import { getRoleDashboardPath } from "@/lib/rbac";

const features = [
  {
    icon: CalendarDays,
    title: "Smart Timetabling",
    description: "AI-powered timetable generation with conflict-free scheduling",
  },
  {
    icon: Users,
    title: "Role-Based Access",
    description: "Dedicated dashboards for coordinators, HODs, faculty & students",
  },
  {
    icon: Building2,
    title: "Resource Management",
    description: "Track rooms, faculty, sections and time slots in one place",
  },
  {
    icon: BookOpen,
    title: "Course Organization",
    description: "Structured course planning with semester-wise organization",
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
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary via-primary-900 to-primary-800 text-primary-foreground p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px_32px]" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-foreground/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-foreground/20 backdrop-blur-sm shadow-lg">
                <Bot className="h-7 w-7" />
              </div>
              <div className="flex flex-col leading-tight">
                <h1 className="text-2xl font-headline font-bold tracking-tight">
                  ClassWise
                </h1>
                <p className="text-sm text-primary-foreground/70">
                  Smart timetable studio
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 space-y-10">
            <div className="space-y-3">
              <h2 className="text-4xl font-headline font-bold leading-tight tracking-tight">
                Intelligent timetable
                <br />
                planning, simplified.
              </h2>
              <p className="text-lg text-primary-foreground/80 max-w-md leading-relaxed">
                Streamline class scheduling, resolve conflicts automatically, and
                give every role a tailored view of what matters.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 max-w-md">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="flex items-start gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-base leading-none">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-primary-foreground/70 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative z-10 text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} ClassWise. Built for academic excellence.
          </div>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-8 lg:p-12">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex flex-col items-center mb-8 space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                <Bot className="h-7 w-7" />
              </div>
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-headline font-bold tracking-tight">
                  ClassWise
                </h1>
                <p className="text-sm text-muted-foreground">
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
