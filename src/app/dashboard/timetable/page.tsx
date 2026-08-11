"use client";

import { Suspense } from "react";
import TimetablePageContent from "./timetable-page-content";

function TimetablePageFallback() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

export default function TimetablePage() {
  return (
    <Suspense fallback={<TimetablePageFallback />}>
      <TimetablePageContent />
    </Suspense>
  );
}
