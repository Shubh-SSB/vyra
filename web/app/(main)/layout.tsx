"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { getAccessToken } from "@/lib/token";
import Link from "next/link";
import RailIcon from "@/components/ui/rail-icon";
import { EyeOff, Settings, Bookmark, Bell, Home, Compass, Users, Plus } from "lucide-react";
import { useNotificationListener } from "@/hooks/use-notification-listener";
import { useUnreadCount } from "@/tanstack/queries/notification.query";
import NotificationsDrawer from "@/components/notifications/notifications-drawer";

function SideRail() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const tab = searchParams.get("tab");
    const [showNotifications, setShowNotifications] = useState(false);
    const { data: unreadCount = 0 } = useUnreadCount();

    // Check active states
    const isChatsActive = pathname === "/chat" && (tab === null || tab === "chats");
    const isExploreActive = pathname === "/chat" && tab === "explore";
    const isConnectionsActive = pathname === "/chat" && tab === "connections";
    const isSavedActive = pathname === "/settings/collections";
    const isHiddenActive = pathname === "/settings/hidden-messages";
    const isSettingsActive = pathname.startsWith("/settings") && !isSavedActive && !isHiddenActive;

    return (
        <aside className="hidden fixed left-0 top-0 bottom-0 w-[76px] shrink-0 flex-col items-center justify-between border-r border-border/40 bg-[#0A0A0B] py-5 md:flex z-40">
            {/* Top group */}
            <div className="flex flex-col items-center gap-5 w-full">
                {/* Logo: Minimal brand V-mark */}
                <Link
                    href="/chat"
                    className="mb-3 flex h-12 w-12 items-center justify-center rounded-full text-foreground hover:bg-white/8 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer outline-none"
                    title="Vyra"
                >
                    <svg width="20" height="20" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path
                            d="M1 1L7 13L13 1"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </Link>

                {/* Chats / Home */}
                <Link href="/chat">
                    <RailIcon
                        label="Chats"
                        active={isChatsActive}
                        icon={<Home className="h-5.5 w-5.5" strokeWidth={2.2} fill={isChatsActive ? "currentColor" : "none"} />}
                    />
                </Link>

                {/* Explore */}
                <Link href="/chat?tab=explore">
                    <RailIcon
                        label="Explore"
                        active={isExploreActive}
                        icon={<Compass className="h-5.5 w-5.5" strokeWidth={2.2} fill={isExploreActive ? "currentColor" : "none"} />}
                    />
                </Link>

                {/* Connections */}
                <Link href="/chat?tab=connections">
                    <RailIcon
                        label="Connections"
                        active={isConnectionsActive}
                        icon={<Users className="h-5.5 w-5.5" strokeWidth={2.2} fill={isConnectionsActive ? "currentColor" : "none"} />}
                    />
                </Link>

                {/* New Chat Action */}
                <Link href="/chat?newChat=true">
                    <RailIcon
                        label="New Chat"
                        icon={<Plus className="h-5.5 w-5.5" strokeWidth={2.2} />}
                    />
                </Link>

                {/* Separator line */}
                <div className="w-8 h-[1px] bg-border/40 my-1" />

                {/* Notifications button */}
                <RailIcon
                    label="Notifications"
                    onClick={() => {
                        setShowNotifications(!showNotifications);
                        if (
                            typeof window !== "undefined" &&
                            "Notification" in window &&
                            Notification.permission === "default"
                        ) {
                            Notification.requestPermission().catch((err) => {
                                console.warn("Notification permission request failed:", err);
                            });
                        }
                    }}
                    active={showNotifications}
                    hasDot={unreadCount > 0}
                    icon={<Bell className="h-5.5 w-5.5" strokeWidth={2.2} fill={showNotifications ? "currentColor" : "none"} />}
                />

                {/* Saved Collections */}
                <Link href="/settings/collections">
                    <RailIcon
                        label="Saved Collections"
                        active={isSavedActive}
                        icon={<Bookmark className="h-5.5 w-5.5" strokeWidth={2.2} fill={isSavedActive ? "currentColor" : "none"} />}
                    />
                </Link>

                {/* Hidden Messages */}
                <Link href="/settings/hidden-messages">
                    <RailIcon
                        label="Hidden Messages"
                        active={isHiddenActive}
                        icon={<EyeOff className="h-5.5 w-5.5" strokeWidth={2.2} fill={isHiddenActive ? "currentColor" : "none"} />}
                    />
                </Link>
            </div>

            {/* Bottom group */}
            <div className="flex flex-col items-center w-full">
                {/* Settings */}
                <Link href="/settings">
                    <RailIcon
                        label="Settings"
                        active={isSettingsActive}
                        icon={<Settings className="h-5.5 w-5.5" strokeWidth={2.2} fill={isSettingsActive ? "currentColor" : "none"} />}
                    />
                </Link>
            </div>

            <NotificationsDrawer
                open={showNotifications}
                onClose={() => setShowNotifications(false)}
            />
        </aside>
    );
}

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
