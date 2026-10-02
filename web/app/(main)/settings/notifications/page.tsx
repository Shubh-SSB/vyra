"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
    ArrowLeft,
    Bell,
    BellOff,
    Check,
    Trash2,
    Loader2,
    MessageSquare,
    UserPlus,
    Heart,
    Pin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    useNotifications,
    useNotificationsMutations,
} from "@/tanstack/queries/notification.query";
import SettingSidebar from "@/components/ui/settings-sidebar";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
    try {
        return new Date(iso).toLocaleDateString([], {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    } catch { return ""; }
}

function formatTime(iso: string) {
    try {
        const d = new Date(iso);
        if (isNaN(d.getTime())) return "";
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffMins = Math.floor(diffMs / (60 * 1000));
        const diffHours = Math.floor(diffMs / (60 * 60 * 1000));

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch { return ""; }
}

function getTypeIcon(type: string) {
    switch (type) {
        case "NEW_MESSAGE":
            return (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                    <MessageSquare className="h-4 w-4" />
                </div>
            );
        case "FRIEND_REQUEST":
            return (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                    <UserPlus className="h-4 w-4" />
                </div>
            );
        case "MESSAGE_REACTION":
            return (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
                    <Heart className="h-4 w-4" />
                </div>
            );
        case "MESSAGE_PIN":
            return (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
                    <Pin className="h-4 w-4" />
                </div>
            );
        default:
            return (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-muted-foreground">
                    <Bell className="h-4 w-4" />
                </div>
            );
    }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
    const router = useRouter();
    const { data, isLoading, isError } = useNotifications(1, 50);
    const { markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications } = useNotificationsMutations();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const notifications = data?.notifications || [];

    const handleItemClick = (notification: any) => {
        markAsRead.mutate(notification.id);
        if (notification.type === "NEW_MESSAGE" && notification.data?.conversationId) {
            router.push(`/chat?convId=${notification.data.conversationId}`);
        } else if (notification.type === "FRIEND_REQUEST") {
            router.push("/chat?tab=connections");
        }
    };

    return (
        <main className="min-h-svh overflow-x-hidden text-foreground font-geist">
            <div className="relative z-10 mx-auto flex w-full">
                <SettingSidebar
                    name="Notifications"
                    navigateTo="Back To Settings"
                    path="/settings"
                    tagline="Messages, reactions, and friend requests"
                />

                <section className="min-w-0 flex-1 px-4 pb-28 pt-7 sm:px-7 sm:pt-10 lg:px-12 lg:pb-12 xl:px-16">
                    <div className="mx-auto max-w-[640px] w-full">

                        {/* Mobile header */}
                        <div className="flex items-center gap-3 mb-8 lg:hidden">
                            <Link
                                href="/settings"
                                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span className="text-sm font-medium">Settings</span>
                            </Link>
                            <span className="text-muted-foreground/40">/</span>
                            <span className="text-sm font-semibold">Notifications</span>
                        </div>

                        {/* Header info banner */}
                        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-[#151517]/85 px-4 py-3.5">
                            <Bell className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                            <p className="text-[12px] text-muted-foreground leading-relaxed">
                                Your recent notifications. Click on a notification to navigate to the relevant conversation or action.
                            </p>
                        </div>

                        {/* Actions bar */}
                        {notifications.length > 0 && (
                            <div className="mb-4 flex items-center justify-end gap-2">
                                {notifications.some((n) => !n.isRead) && (
                                    <button
                                        onClick={() => markAllAsRead.mutate()}
                                        className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:border-white/20 hover:text-foreground hover:bg-white/5 transition-all active:scale-95 cursor-pointer"
                                    >
                                        <Check className="h-3 w-3" />
                                        Mark all read
                                    </button>
                                )}
                                <button
                                    onClick={() => deleteAllNotifications.mutate()}
                                    className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:border-red-500/30 hover:text-red-400 hover:bg-red-500/5 transition-all active:scale-95 cursor-pointer"
                                >
                                    <Trash2 className="h-3 w-3" />
                                    Clear all
                                </button>
                            </div>
                        )}

                        {/* Content */}
                        {isLoading && (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        )}

                        {isError && (
                            <div className="flex flex-col items-center gap-2 py-16 text-center">
                                <p className="text-sm font-medium text-foreground">Failed to load notifications</p>
                                <p className="text-xs text-muted-foreground">Please try again later.</p>
                            </div>
                        )}

                        {!isLoading && !isError && notifications.length === 0 && (
                            <div className="flex flex-col items-center gap-3 py-20 text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-elevated border border-white/[0.06]">
                                    <BellOff className="h-7 w-7 text-muted-foreground" strokeWidth={1.25} />
                                </div>
                                <p className="text-[14px] font-medium text-foreground">No notifications</p>
                                <p className="text-[12px] text-muted-foreground max-w-[240px]">
                                    We&apos;ll let you know when you get messages, friend requests, or reactions.
                                </p>
                            </div>
                        )}

                        {!isLoading && notifications.length > 0 && (
                            <div className="overflow-hidden rounded-3xl border border-white/[0.06] bg-[#151517]/85 shadow-lg divide-y divide-white/[0.04]">
                                <AnimatePresence initial={false}>
                                    {notifications.map((n) => (
                                        <motion.div
                                            key={n.id}
                                            layout
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2, ease: "easeInOut" }}
                                            className="overflow-hidden"
                                        >
                                            <div
                                                onClick={() => handleItemClick(n)}
                                                className={cn(
                                                    "group flex items-start justify-between gap-4 px-5 py-4 transition-colors cursor-pointer",
                                                    !n.isRead && "bg-white/[0.015]"
                                                )}
                                            >
                                                {/* Notification info */}
                                                <div className="flex items-start gap-3 min-w-0 flex-1">
                                                    {getTypeIcon(n.type)}
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-1.5 mb-0.5">
                                                            <span className="text-[13px] font-semibold text-[#eeece4] truncate">
                                                                {n.title}
                                                            </span>
                                                            {!n.isRead && (
                                                                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                                                            )}
                                                        </div>
                                                        <p className="text-[13px] text-main leading-relaxed line-clamp-2">
                                                            {n.body}
                                                        </p>
                                                        <p className="mt-1 text-[10px] text-muted-foreground/40">
                                                            {formatTime(n.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Action buttons */}
                                                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {!n.isRead && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                markAsRead.mutate(n.id);
                                                            }}
                                                            title="Mark as read"
                                                            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground hover:border-white/20 hover:text-foreground hover:bg-white/5 transition-all active:scale-95 cursor-pointer"
                                                        >
                                                            <Check className="h-3 w-3" />
                                                            Read
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setDeletingId(n.id);
                                                            deleteNotification.mutate(n.id, {
                                                                onSettled: () => setDeletingId(null),
                                                            });
                                                        }}
                                                        disabled={deletingId === n.id}
                                                        title="Delete notification"
                                                        className={cn(
                                                            "flex shrink-0 items-center gap-1.5 rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground hover:border-red-500/30 hover:text-red-400 hover:bg-red-500/5 transition-all active:scale-95 cursor-pointer",
                                                            deletingId === n.id && "opacity-50 cursor-not-allowed"
                                                        )}
                                                    >
                                                        {deletingId === n.id ? (
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-3 w-3" />
                                                        )}
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}
