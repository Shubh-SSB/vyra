"use client";

import { useEffect } from "react";
import { getAccessToken } from "@/lib/token";
import { useAuthStore } from "@/store/auth.store";

/**
 * Hydrates the Zustand auth store from localStorage on mount.
 * Must be placed inside the root layout so it runs on every page load.
 */
export function AuthInitializer({ children }: { children: React.ReactNode }) {
    const setAccessToken = useAuthStore((s) => s.setAccessToken);
    const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
    const setInitializing = useAuthStore((s) => s.setInitializing);

    useEffect(() => {
        const token = getAccessToken();

        if (token) {
            setAccessToken(token);
            setAuthenticated(true);
        }

        // Mark initialization complete regardless
        setInitializing(false);
    }, [setAccessToken, setAuthenticated, setInitializing]);

    return <>{children}</>;
}
