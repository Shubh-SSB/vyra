"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/token";
import Link from "next/link";
import { VyraIcon } from "@/components/vyra/logo";
import RailIcon from "@/components/ui/rail-icon";
import { Archive, Pin, Settings } from "lucide-react";



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

    return (
        <div className="min-h-screen w-full">
            <aside className="hidden fixed left-0 top-0 bottom-0 w-[60px] shrink-0 flex-col items-center justify-between border-r border-border bg-[#0e0e10] py-3 md:flex">
                <div className="flex flex-col items-center gap-6">
                    <Link href="/">
                        {/* <VyraMark /> */}
                        <VyraIcon />
                    </Link>
                    <RailIcon label="Chats" active />
                    <RailIcon label="Pinned" icon={<Pin className="h-4 w-4" strokeWidth={1.5} />} />
                    <RailIcon label="Archive" icon={<Archive className="h-4 w-4" strokeWidth={1.5} />} />
                    <Link
                        href="/settings"
                        title="Settings"
                        aria-label="Settings"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                    >
                        <Settings className="h-4 w-4" strokeWidth={1.5} />
                    </Link>
                </div>
            </aside>
            <div className="min-w-0 md:pl-[60px]">
                {children}
            </div>
        </div>
    );
}
