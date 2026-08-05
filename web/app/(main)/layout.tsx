"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/token";
import Link from "next/link";
import { VyraIcon } from "@/components/vyra/logo";
import RailIcon from "@/components/ui/rail-icon";
import { Archive, EyeOff, Pin, Settings, Bookmark, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotificationListener } from "@/hooks/use-notification-listener";
import { useUnreadCount } from "@/tanstack/queries/notification.query";
import NotificationsDrawer from "@/components/notifications/notifications-drawer";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [showNotifications, setShowNotifications] = useState(false);

    // Initialize notification listeners (browser push, sound, socket, query invalidate)
    useNotificationListener();

    // Query unread count for the navigation badge
    const { data: unreadCount = 0 } = useUnreadCount();

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

                    {/* Notifications Button */}
                    <button
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
                        title="Notifications"
                        aria-label="Notifications"
                        className={cn(
                            "relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all duration-150 active:scale-95 hover:bg-surface hover:text-foreground cursor-pointer",
                            showNotifications && "bg-surface text-foreground"
                        )}
                    >
                        <Bell className="h-4 w-4" strokeWidth={1.5} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                        )}
                    </button>

                    <Link
                        href="/settings/hidden-messages"
                        title="Hidden Messages"
                        aria-label="Hidden Messages"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                    >
                        <EyeOff className="h-4 w-4" strokeWidth={1.5} />
                    </Link>
                    <Link
                        href="/settings/collections"
                        title="Saved Collections"
                        aria-label="Saved Collections"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                    >
                        <Bookmark className="h-4 w-4" strokeWidth={1.5} />
                    </Link>
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

            <NotificationsDrawer
                open={showNotifications}
                onClose={() => setShowNotifications(false)}
            />
        </div>
    );
}
