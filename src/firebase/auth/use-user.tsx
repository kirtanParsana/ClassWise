'use client';
import { useFirebase } from '@/firebase/provider';

export function useUser() {
  const { user, isUserLoading, userError } = useFirebase();
  return { user, isUserLoading, userError };
}
