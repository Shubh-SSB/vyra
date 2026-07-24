"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/token";
import { useAuthStore } from "@/store/auth.store";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isInitializing } = useAuthStore();

  useEffect(() => {
    // Check localStorage directly as the source of truth for persistence
    const token = getAccessToken();

    if (token) {
      // Already logged in — no reason to show login/register
      router.replace("/chat");
    }
  }, [router]);

  // While initializing (store hydrating), don't flash the auth page
  if (isInitializing && isAuthenticated) return null;

  return <>

    {children}
  </>;
}
