'use client';

import { useAuth } from '@/lib/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const dynamic = 'force-dynamic';

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/auth/sign-in');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="text-gray-600 dark:text-gray-300">Loading...</div>
    </div>
  );
}
