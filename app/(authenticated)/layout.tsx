'use client';

import { ProtectedLayout } from '@/lib/protected-layout';
import { useAuth } from '@/lib/use-auth';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
