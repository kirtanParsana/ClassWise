'use client';

import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Home, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-muted/20 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-lg pt-20">
        <div className="flex flex-col items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>

          <div className="text-center">
            <h1 className="font-headline text-2xl font-semibold tracking-tight">
              Access Denied
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              You do not have permission to access this page.
            </p>
          </div>

          <Alert variant="destructive" className="border-destructive/30">
            <ShieldAlert className="h-5 w-5" />
            <AlertTitle className="font-headline text-base">
              Access Denied
            </AlertTitle>
            <AlertDescription className="mt-2">
              <p className="text-sm leading-relaxed">
                You do not have permission to access this page.
              </p>
            </AlertDescription>
          </Alert>

          <div className="flex w-full flex-wrap justify-center gap-3 pt-2">
            <Button
              variant="outline"
              asChild
              className="border-border/60"
            >
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Link>
            </Button>
            <Button variant="default" asChild>
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Sign in
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
