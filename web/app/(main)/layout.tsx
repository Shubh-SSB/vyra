"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/token";
import Link from "next/link";
import { VyraIcon } from "@/components/vyra/logo";
import RailIcon from "@/components/ui/rail-icon";
import { Archive, EyeOff, Pin, Settings, Bookmark, Bell, MoreVertical, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotificationListener } from "@/hooks/use-notification-listener";
import { useUnreadCount } from "@/tanstack/queries/notification.query";
import NotificationsDrawer from "@/components/notifications/notifications-drawer";
import { AnimatePresence, motion } from "framer-motion";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

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
            {/* Mobile Header Bar */}
            <header className="fixed top-0 left-0 right-0 z-[45] flex h-14 items-center justify-between border-b border-white/5 bg-[#0e0e10]/95 px-4 backdrop-blur-md md:hidden">
                <div className="relative">
                    <button
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        title="Menu"
                        aria-label="Menu"
                        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface hover:text-foreground cursor-pointer"
                    >
                        <MoreVertical className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-[#0e0e10]">
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                        )}
                    </button>
                    
                    {/* Mobile Dropdown Menu */}
                    <AnimatePresence>
                        {showMobileMenu && (
                            <>
                                <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowMobileMenu(false)} />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                    className="absolute left-0 mt-2 z-50 w-52 origin-top-left rounded-xl border border-white/10 bg-[#0e0e11]/98 p-1.5 shadow-2xl backdrop-blur-xl flex flex-col gap-0.5"
                                >
                                    <Link
                                        href="/chat"
                                        onClick={() => setShowMobileMenu(false)}
                                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-semibold text-foreground hover:bg-white/5"
                                    >
                                        <MessageCircle className="h-4 w-4 text-primary" />
                                        <span>Chats</span>
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setShowMobileMenu(false);
                                            setShowNotifications(true);
                                        }}
                                        className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-xs font-semibold text-foreground hover:bg-white/5 cursor-pointer"
                                    >
                                        <span className="flex items-center gap-3">
                                            <Bell className="h-4 w-4 text-yellow-400" />
                                            <span>Notifications</span>
                                        </span>
                                        {unreadCount > 0 && (
                                            <span className="flex h-4 px-1.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>
                                    <Link
                                        href="/settings/hidden-messages"
                                        onClick={() => setShowMobileMenu(false)}
                                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-semibold text-foreground hover:bg-white/5"
                                    >
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        <span>Hidden Messages</span>
                                    </Link>
                                    <Link
                                        href="/settings/collections"
                                        onClick={() => setShowMobileMenu(false)}
                                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-semibold text-foreground hover:bg-white/5"
                                    >
                                        <Bookmark className="h-4 w-4 text-muted-foreground" />
                                        <span>Saved Collections</span>
                                    </Link>
                                    <Link
                                        href="/settings"
                                        onClick={() => setShowMobileMenu(false)}
                                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-semibold text-foreground hover:bg-white/5"
                                    >
                                        <Settings className="h-4 w-4 text-muted-foreground" />
                                        <span>Settings</span>
                                    </Link>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
                
                <Link href="/" className="flex items-center gap-2">
                    <VyraIcon />
                    <span className="text-sm font-bold text-foreground tracking-tight">Vyra</span>
                </Link>

                <div className="w-9 h-9" /> {/* Spacer to balance logo */}
            </header>

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
            <div className="min-w-0 pt-14 md:pt-0 md:pl-[60px]">
                {children}
            </div>

            <NotificationsDrawer
                open={showNotifications}
                onClose={() => setShowNotifications(false)}
            />
        </div>
    );
}
