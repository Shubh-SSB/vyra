"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { authService } from "@/services/auth.service";
import { getAccessToken } from "@/lib/token";
import { useAuthStore } from "@/store/auth.store";

export default function Splash() {
  const router = useRouter();

  const {
    setAccessToken,
    setAuthenticated,
    setInitializing,
    logout,
  } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      try {
        const accessToken = getAccessToken();

        if (!accessToken) {
          logout();
          router.replace("/");
          return;
        }

        // If the access token is expired, the factory will
        // automatically refresh it and retry this call.
        await authService.me();

        setAccessToken(accessToken);
        setAuthenticated(true);
      } catch {
        // Refresh also failed — factory already cleared tokens
        logout();
      } finally {
        setInitializing(false);
        router.replace("/");
      }
    };

    init();
  }, [router, logout, setAccessToken, setAuthenticated, setInitializing]);

  return (
    <div className="flex h-screen items-center justify-center bg-black">
      <Image
        src="/logo.gif"
        alt="Vyra"
        width={220}
        height={220}
        className="rounded-full"
      />
      <h1 className="text-xl font-semibold">VYRA</h1>
    </div>
  );
}