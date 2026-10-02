"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { getAccessToken } from "@/lib/token";
import { useNotificationListener } from "@/hooks/use-notification-listener";
import SideRail from "@/components/navigation/side-Rail";



export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();

    // Initialize notification listeners (browser push, sound, socket, query invalidate)
    useNotificationListener();

    useEffect(() => {
        const token = getAccessToken();
        if (!token) {
            router.replace("/login");
        }
    }, [router]);

    return (
        <div className="min-h-screen w-full bg-background">
            <Suspense fallback={<div className="hidden w-[76px] md:block" />}>
                <SideRail />
            </Suspense>
            <div className="min-w-0 md:pl-[76px]">
                {children}
            </div>
        </div>
    );
}
