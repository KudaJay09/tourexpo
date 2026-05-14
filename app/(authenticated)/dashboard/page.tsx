'use client';

import { useAuth } from '@/lib/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to search page
    router.push('/dashboard/search');
  }, [router]);

  return null;
}
