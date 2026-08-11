'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { getRoleDashboardPath } from '@/lib/rbac';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

function DashboardRedirect() {
  const { loading, isAuthenticated, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (role === 'coordinator') {
      router.replace('/coordinator');
      return;
    }

    if (role) {
      router.replace(getRoleDashboardPath(role));
      return;
    }
  }, [loading, isAuthenticated, role, router]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['coordinator', 'hod', 'faculty', 'student']}>
      <DashboardRedirect />
    </ProtectedRoute>
  );
}
