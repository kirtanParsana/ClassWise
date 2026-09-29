'use client';

import React, {
  // DependencyList,
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
  useMemo,
} from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import {
  Auth,
  User,
  onAuthStateChanged,
} from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

export interface FirebaseContextState {
  areServicesAvailable: boolean;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface FirebaseServicesAndUser {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface UserHookResult {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(
  undefined
);

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState<boolean>(true);
  const [userError, setUserError] = useState<Error | null>(null);

  useEffect(() => {
    const servicesAvailable = !!(firebaseApp && firestore && auth);
    if (!servicesAvailable) {
      setIsUserLoading(false);
      return;
    }

    setIsUserLoading(true);

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setUserError(null);
        setIsUserLoading(false);
      },
      (err: Error) => {
        setUser(null);
        setUserError(err);
        setIsUserLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firebaseApp, firestore, auth]);

  const contextValue = useMemo((): FirebaseContextState => {
    const servicesAvailable = !!(firebaseApp && firestore && auth);
    return {
      areServicesAvailable: servicesAvailable,
      firebaseApp: servicesAvailable ? firebaseApp : null,
      firestore: servicesAvailable ? firestore : null,
      auth: servicesAvailable ? auth : null,
      user,
      isUserLoading,
      userError,
    };
  }, [firebaseApp, firestore, auth, user, isUserLoading, userError]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = (): FirebaseServicesAndUser => {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }

  if (
    !context.areServicesAvailable ||
    !context.firebaseApp ||
    !context.firestore ||
    !context.auth
  ) {
    throw new Error(
      'Firebase core services not available. Check FirebaseProvider props.'
    );
  }

  return {
    firebaseApp: context.firebaseApp,
    firestore: context.firestore,
    auth: context.auth,
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
  };
};

export const useAuth = (): Auth => {
  const { auth } = useFirebase();
  return auth;
};

export const useFirestore = (): Firestore => {
  const { firestore } = useFirebase();
  return firestore;
};

export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};

// type MemoFirebase<T> = T & { __memo?: boolean };

// export function useMemoFirebase<T>(
//   factory: () => T,
//   deps: DependencyList
// ): T | MemoFirebase<T> {
//   const memoized = useMemo(() => factory(), deps);

//   if (typeof memoized !== 'object' || memoized === null) return memoized;
//   (memoized as MemoFirebase<T>).__memo = true;

//   return memoized;
// }

export const useUser = (): UserHookResult => {
  const { user, isUserLoading, userError } = useFirebase();
  return { user, isUserLoading, userError };
};
