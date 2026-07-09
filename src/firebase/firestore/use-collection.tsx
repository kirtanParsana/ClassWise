// 'use client';

// import { useState, useEffect } from 'react';
// import {
//   Query,
//   onSnapshot,
//   DocumentData,
//   FirestoreError,
//   QuerySnapshot,
//   CollectionReference,
// } from 'firebase/firestore';
// // import { useAuth } from '@/firebase';
// import { errorEmitter } from '@/firebase/error-emitter';
// import { FirestorePermissionError } from '@/firebase/errors';

// export type WithId<T> = T & { id: string };

// export interface UseCollectionResult<T> {
//   data: WithId<T>[] | null;
//   isLoading: boolean;
//   error: FirestoreError | Error | null;
// }

// export interface InternalQuery extends Query<DocumentData> {
//   _query: {
//     path: {
//       canonicalString(): string;
//     };
//   };
// }

// export function useCollection<T = any>(
//   memoizedTargetRefOrQuery:
//     | ((CollectionReference<DocumentData> | Query<DocumentData>) & { __memo?: boolean })
//     | null
//     | undefined
// ): UseCollectionResult<T> {
//   const [data, setData] = useState<WithId<T>[] | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<FirestoreError | Error | null>(null);
//   // const auth = useAuth(); // Correctly get auth instance via hook

//   useEffect(() => {
//     // Wait until auth is initialized
//     if (!auth) {
//         setIsLoading(false);
//         return;
//     }

//     if (!memoizedTargetRefOrQuery) {
//       setIsLoading(false);
//       return;
//     }

//     setIsLoading(true);
//     setError(null);

//     const unsubscribe = onSnapshot(
//       memoizedTargetRefOrQuery,
//       (snapshot: QuerySnapshot<DocumentData>) => {
//         const results = snapshot.docs.map((doc) => ({
//           ...(doc.data() as T),
//           id: doc.id,
//         }));
//         setData(results);
//         setIsLoading(false);
//       },
//       () => {
//         const path =
//           memoizedTargetRefOrQuery.type === 'collection'
//             ? (memoizedTargetRefOrQuery as CollectionReference).path
//             : (memoizedTargetRefOrQuery as unknown as InternalQuery)._query.path.canonicalString();

//         const contextualError = new FirestorePermissionError({
//           operation: 'list',
//           path,
//         });

//         setError(contextualError);
//         setData(null);
//         setIsLoading(false);
//         errorEmitter.emit('permission-error', contextualError);
//       }
//     );

//     return () => unsubscribe();
//   }, [auth, memoizedTargetRefOrQuery]);

//   if (memoizedTargetRefOrQuery && !memoizedTargetRefOrQuery.__memo) {
//     throw new Error('useCollection target was not memoized');
//   }

//   return { data, isLoading, error };
// }

"use client";

import { useEffect, useState } from "react";
import { onSnapshot, Query, CollectionReference } from "firebase/firestore";

export function useCollection<T>(
  ref?: CollectionReference | Query
) {
  const [data, setData] = useState<T[] | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ref) {
      setData([]);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        setData(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as T[]
        );
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [ref]);

  return { data, loading, error };
}
