"use client";

import { useAuth } from "@/lib/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const dynamic = "force-dynamic";

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      } else {
        router.push("/auth/sign-in");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex flex-1 items-center justify-center">
      <video autoPlay muted loop>
        <source src="/intro2.webm" type="video/webm" />
      </video>
    </div>
  );
}
