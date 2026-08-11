"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import type { Role } from "@/types/auth";
import { hasAnyRole, getRoleDashboardPath } from "@/lib/rbac";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Loader2, LogOut } from "lucide-react";
import Link from "next/link";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: readonly Role[];
  requireAuth?: boolean;
}

const FALLBACK_LOGIN_PATH = "/login";
const FALLBACK_UNAUTHORIZED_PATH = "/unauthorized";

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-muted/20 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-md space-y-6 pt-20">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">
            Checking authentication…
          </p>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    </div>
  );
}

function AuthErrorScreen({
  title,
  description,
  showLogout,
  dashboardPath,
}: {
  title: string;
  description: string;
  showLogout?: boolean;
  dashboardPath?: string;
}) {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-muted/20 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-lg pt-20">
        <Alert variant="destructive" className="border-destructive/30">
          <ShieldAlert className="h-5 w-5" />
          <AlertTitle className="font-headline text-base">{title}</AlertTitle>
          <AlertDescription className="mt-2 space-y-4">
            <p className="text-sm leading-relaxed">{description}</p>
            <div className="flex flex-wrap gap-2 pt-2">
              {dashboardPath && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="border-border/60"
                >
                  <Link href={dashboardPath}>Go to Dashboard</Link>
                </Button>
              )}
              <Button variant="outline" size="sm" asChild>
                <Link href={FALLBACK_LOGIN_PATH}>Sign in</Link>
              </Button>
              {showLogout && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => logout()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

export function ProtectedRoute({
  children,
  allowedRoles,
  requireAuth = true,
}: ProtectedRouteProps) {
  const {
    loading,
    isAuthenticated,
    profile,
    role,
    error,
    errorMessage,
  } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (requireAuth && !isAuthenticated && !error) {
      const params = new URLSearchParams();
      if (pathname) params.set("next", pathname);
      const query = params.toString();
      const destination = query
        ? `${FALLBACK_LOGIN_PATH}?${query}`
        : FALLBACK_LOGIN_PATH;
      router.replace(destination);
      return;
    }
  }, [loading, isAuthenticated, requireAuth, error, pathname, router]);

  if (loading) {
    return <LoadingFallback />;
  }

  if (error) {
    switch (error) {
      case "not-configured":
      case "invalid-role":
      case "account-disabled":
      case "permission-denied":
        return (
          <AuthErrorScreen
            title={
              error === "account-disabled"
                ? "Account disabled"
                : error === "not-configured"
                ? "Account not configured"
                : error === "invalid-role"
                ? "Invalid account configuration"
                : "Access denied"
            }
            description={errorMessage ?? "Please contact the administrator."}
            showLogout
          />
        );
      case "network-error":
      case "session-error":
        return (
          <AuthErrorScreen
            title={error === "network-error" ? "Network error" : "Session error"}
            description={
              errorMessage ??
              "Something went wrong while loading your account. Please try again."
            }
            showLogout
            dashboardPath={FALLBACK_LOGIN_PATH}
          />
        );
      default:
        return (
          <AuthErrorScreen
            title="Authentication error"
            description={
              errorMessage ?? "Unable to verify access. Please try again."
            }
            showLogout
            dashboardPath={FALLBACK_LOGIN_PATH}
          />
        );
    }
  }

  if (!requireAuth) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return <LoadingFallback />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasAccess = hasAnyRole(profile, allowedRoles);
    if (!hasAccess) {
      const fallback = role ? getRoleDashboardPath(role) : undefined;
      return (
        <AuthErrorScreen
          title="Access denied"
          description="You do not have permission to access this page."
          dashboardPath={fallback}
          showLogout
        />
      );
    }
  }

  return <>{children}</>;
}
