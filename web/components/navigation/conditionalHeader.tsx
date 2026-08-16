"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth.store";
import { VyraIcon } from "../vyra/logo";
import { useEffect, useState } from "react";

export function ConditionalHeader() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Sets to true if user scrolls down more than 10 pixels
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 flex items-center justify-between mx-auto px-8 py-5 md:px-44 transition-all duration-300 bg-black
        ${isScrolled
          ? 'border-b border-main/55  shadow-sm'
          : 'border-b border-transparent '
        }`}
    >
      <Link href="/" className="text-2xl font-semibold flex items-center gap-2 text-text-primary">
        <VyraIcon className="h-10 w-10" />
        Bunko
      </Link>

      <nav aria-label="Primary navigation" className="flex items-center gap-6">
        {isAuthenticated ? (
          <Link href="/chat" className={buttonVariants({ variant: "outline", size: "xl" })}>
            Open app
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className={buttonVariants({ variant: "ghost", size: "xl" })}
            >
              Log in
            </Link>
            <Link href="/register" className={buttonVariants({ variant: "outline", size: "xl" })}>
              Sign up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
