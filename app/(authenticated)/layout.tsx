"use client";

import Footer from "@/components/footer";
import NavbarDemo from "@/components/resizable-navbar-demo";
import { ProtectedLayout } from "@/lib/protected-layout";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedLayout>
      <div className="relative min-h-screen">
        <NavbarDemo />
        <main className="pt-20">{children}</main>
        <Footer />
      </div>
    </ProtectedLayout>
  );
}
