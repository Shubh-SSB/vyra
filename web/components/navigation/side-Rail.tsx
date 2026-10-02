import Link from "next/link";
import NotificationsDrawer from "../notifications/notifications-drawer";
import RailIcon from "../ui/rail-icon";
import { Bell, Bookmark, Compass, EyeOff, Home, MessageCircle, Settings, UserRoundPlus } from "lucide-react";
import { useUnreadCount } from "@/tanstack/queries/notification.query";
import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function SideRail() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const tab = searchParams.get("tab");
    const [showNotifications, setShowNotifications] = useState(false);
    const { data: unreadCount = 0 } = useUnreadCount();

    // ── Active states for the four pillars ──
    const isHomeActive = pathname === "/home";
    const isChatsActive = pathname === "/chat" && tab !== "explore" && tab !== "connections";
    const isConnectionActive = pathname === "/chat" && tab === "connections";
    const isExploreActive = pathname === "/chat" && tab === "explore";
    const isCollectionsActive = pathname.startsWith("/settings/collections");
    const isHiddenActive = pathname === "/settings/hidden-messages";
    const isSettingsActive = pathname.startsWith("/settings") && !isCollectionsActive && !isHiddenActive;

    return (
        <aside className="hidden fixed left-0 top-0 bottom-0 w-[76px] shrink-0 flex-col items-center justify-between border-r border-border/40 bg-black/50 py-5 md:flex z-40">
            {/* Top group */}
            <div className="flex flex-col items-center gap-5 w-full">
                {/* Logo → Home */}
                <Link
                    href="/home"
                    className="mb-3 flex h-12 w-12 items-center justify-center rounded-full text-foreground hover:bg-white/8 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer outline-none"
                    title="Bunko — Home"
                >
                    <svg width="20" height="20" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path d="M3 1H8.5C10.5 1 11.5 2 11.5 3.5C11.5 4.8 10.5 5.5 8.5 5.5H3V1Z M3 5.5H9C11 5.5 12 6.5 12 8.25C12 10 11 13 9 13H3V5.5Z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>

                </Link>

                {/* ─── Pillar 1: Home ─── */}
                <Link href="/home">
                    <RailIcon
                        label="Home"
                        active={isHomeActive}
                        icon={<Home className="h-5.5 w-5.5" strokeWidth={2.2} fill={isHomeActive ? "currentColor" : "none"} />}
                    />
                </Link>

                {/* ─── Pillar 2: Chat ─── */}
                <Link href="/chat">
                    <RailIcon
                        label="Chat"
                        active={isChatsActive}
                        icon={<MessageCircle className="h-5.5 w-5.5" strokeWidth={2.2} fill={isChatsActive ? "currentColor" : "none"} />}
                    />
                </Link>

                {/* Connection requests */}
                <Link href="/chat?tab=connections">
                    <RailIcon label="Connection Requests"
                        active={isConnectionActive}
                        icon={<UserRoundPlus className="h-5.5 w-5.5" strokeWidth={2.2} fill={isConnectionActive ? "currentColor" : "none"} />}
                    />
                </Link>

                {/* ─── Pillar 3: Explore ─── */}
                <Link href="/chat?tab=explore">
                    <RailIcon
                        label="Explore"
                        active={isExploreActive}
                        icon={<Compass className="h-5.5 w-5.5" strokeWidth={2.2} fill={isExploreActive ? "currentColor" : "none"} />}
                    />
                </Link>

                {/* ─── Pillar 4: Collections ─── */}
                <Link href="/settings/collections">
                    <RailIcon
                        label="Collections"
                        active={isCollectionsActive}
                        icon={<Bookmark className="h-5.5 w-5.5" strokeWidth={2.2} fill={isCollectionsActive ? "currentColor" : "none"} />}
                    />
                </Link>

                {/* Separator line */}
                <div className="w-8 h-[1px] bg-border/40 my-1" />

                {/* Notifications */}
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
