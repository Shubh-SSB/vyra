"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth.store";

export function ConditionalHeader() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <header className="flex items-center justify-between border-b border-border bg-background px-4 py-3 sm:px-6">
      <Link href="/" className="text-lg font-semibold text-text-primary">
        Vyra
      </Link>

      <nav aria-label="Primary navigation" className="flex items-center gap-2">
        {isAuthenticated ? (
          <Link href="/chat" className={buttonVariants({ size: "sm" })}>
            Open app
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Log in
            </Link>
            <Link href="/register" className={buttonVariants({ size: "sm" })}>
              Sign up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
