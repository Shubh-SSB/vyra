"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/token";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();

    useEffect(() => {
        const token = getAccessToken();
        if (!token) {
            router.replace("/login");
        }
    }, [router]);

    return <>{children}</>;
}
