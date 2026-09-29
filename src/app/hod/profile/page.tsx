'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCircle2, Rocket } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";

export default function HODProfilePage() {
  const { profile } = useAuth();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-headline text-3xl font-semibold tracking-tight">
            My Profile
          </h1>
          <Badge variant="secondary" className="text-sm">
            HOD
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          View and manage your HOD profile information.
        </p>
      </div>

      <Card className="border-dashed">
        <CardHeader className="items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <Rocket className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="font-headline text-xl flex items-center gap-2">
            <UserCircle2 className="h-5 w-5 text-purple-500" />
            Coming Soon
          </CardTitle>
          <CardDescription className="max-w-md mx-auto mt-2">
            The HOD profile management page is under construction. You&apos;ll be able to update your personal details, department information, and preferences here.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {profile && (
            <div className="text-sm text-muted-foreground space-y-1 text-center">
              <p><span className="font-medium text-foreground">Name:</span> {profile.name}</p>
              <p><span className="font-medium text-foreground">Email:</span> {profile.email}</p>
              {profile.departmentId && (
                <p><span className="font-medium text-foreground">Department:</span> {profile.departmentId}</p>
              )}
            </div>
          )}
          <Link
            href="/hod"
            className="text-sm text-primary hover:underline"
          >
            ← Back to HOD Dashboard
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
