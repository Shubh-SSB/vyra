"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Check,
    Trash2,
    MessageSquare,
    UserPlus,
    Heart,
    Pin,
    Bell,
    BellOff,
} from "lucide-react";
import {
    useNotifications,
    useNotificationsMutations,
} from "@/tanstack/queries/notification.query";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

type NotificationsDrawerProps = {
    open: boolean;
    onClose: () => void;
};

export default function NotificationsDrawer({ open, onClose }: NotificationsDrawerProps) {
    const router = useRouter();
    const { data, isLoading } = useNotifications(1, 40);
    const { markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications } = useNotificationsMutations();

    const notifications = data?.notifications || [];

    const handleItemClick = (notification: any) => {
        // Since backend deletes on read, this will delete the notification from the DB
        markAsRead.mutate(notification.id);

        // Close drawer
        onClose();

        // Navigate based on type
        if (notification.type === "NEW_MESSAGE" && notification.data?.conversationId) {
            router.push(`/chat?id=${notification.data.conversationId}`);
        } else if (notification.type === "FRIEND_REQUEST") {
            router.push("/settings"); // or friends tab
        }
    };

    const getIcon = (type: string) => {
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
    };

    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "";
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffMins = Math.floor(diffMs / (60 * 1000));
        const diffHours = Math.floor(diffMs / (60 * 60 * 1000));

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40 bg-black/45 backdrop-blur-xs md:left-[60px]"
                        onClick={onClose}
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: -280, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -280, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                        className="fixed bottom-0 top-0 z-50 flex w-[320px] flex-col border-r border-white/10 rounded-2xl bg-[#0e0e11]/98 shadow-2xl backdrop-blur-xl left-0 md:left-[60px]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-white/10 px-4 py-4.5">
                            <div className="flex items-center gap-2">
                                <Bell className="h-4.5 w-4.5 text-foreground" />
                                <h3 className="font-semibold text-foreground text-sm">Notifications</h3>
                            </div>
                            <div className="flex items-center gap-1">
                                {notifications.length > 0 && (
                                    <button
                                        onClick={() => deleteAllNotifications.mutate()}
                                        title="Clear all notifications"
                                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/5 hover:text-red-400 transition-colors cursor-pointer"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                                {notifications.some((n) => !n.isRead) && (
                                    <button
                                        onClick={() => markAllAsRead.mutate()}
                                        title="Mark all as read"
                                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors cursor-pointer"
                                    >
                                        <Check className="h-4 w-4" />
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    title="Close panel"
                                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors cursor-pointer"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto px-2 py-3 flex flex-col gap-1.5">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-10 gap-3">
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                                    <p className="text-xs text-muted-foreground font-medium">Loading notifications...</p>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.03] text-muted-foreground/60 mb-3 border border-white/[0.04]">
                                        <BellOff className="h-5 w-5" />
                                    </div>
                                    <p className="text-xs font-semibold text-foreground">No notifications</p>
                                    <p className="text-[10px] text-muted-foreground mt-1 max-w-[200px]">
                                        We'll let you know when you get messages, friend requests, or reactions.
                                    </p>
                                </div>
                            ) : (
                                notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        onClick={() => handleItemClick(n)}
                                        className={cn(
                                            "group relative flex items-start gap-3 rounded-xl border p-3 transition-all duration-150 active:scale-[0.98] cursor-pointer",
                                            n.isRead
                                                ? "border-transparent bg-transparent hover:bg-white/[0.03]"
                                                : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] shadow-xs"
                                        )}
                                    >
                                        {/* Category Icon */}
                                        {getIcon(n.type)}

                                        {/* Text Info */}
                                        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5 justify-between">
                                                <p className="text-xs font-semibold text-foreground truncate pr-6">
                                                    {n.title}
                                                </p>
                                                <span className="text-[9px] font-medium text-muted-foreground/80 shrink-0">
                                                    {formatTime(n.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground leading-relaxed break-words">
                                                {n.body}
                                            </p>
                                        </div>

                                        {/* Action buttons (hover overlays) */}
                                        <div className="absolute right-2 top-2.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-[#121215] rounded-md border border-white/10 p-0.5 shadow-md">
                                            {!n.isRead && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        markAsRead.mutate(n.id);
                                                    }}
                                                    title="Mark as read"
                                                    className="rounded-sm p-1 text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors cursor-pointer"
                                                >
                                                    <Check className="h-3 w-3" />
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteNotification.mutate(n.id);
                                                }}
                                                title="Delete notification"
                                                className="rounded-sm p-1 text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>

                                        {/* Unread Indicator dot */}
                                        {!n.isRead && (
                                            <div className="absolute right-2 bottom-3.5 h-1.5 w-1.5 rounded-full bg-red-500 group-hover:hidden" />
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
