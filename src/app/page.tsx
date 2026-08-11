'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getRoleDashboardPath } from '@/lib/rbac';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { loading, isAuthenticated, role, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (error) {
      switch (error) {
        case 'not-configured':
        case 'account-disabled':
        case 'invalid-role':
          router.replace('/login');
          return;
        default:
          router.replace('/login');
          return;
      }
    }

    if (isAuthenticated && role) {
      router.replace(getRoleDashboardPath(role));
      return;
    }

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
  }, [loading, isAuthenticated, role, error, router]);

  return (
    <div className="min-h-screen bg-muted/20 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-md space-y-6 pt-20">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">
            Loading…
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
