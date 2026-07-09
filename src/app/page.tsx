'use client';

import { redirect } from 'next/navigation';

export default function HomePage() {
  // Always redirect to the dashboard since there is no authentication.
  redirect('/dashboard');
}
