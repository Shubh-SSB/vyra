"use client";

import { useState, useRef } from "react";
import { ArrowLeft, Info, MoreHorizontal, Sparkles, X, Forward, Trash, Trash2, EyeOff, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import IconButton from "@/components/ui/icon-button";
import Image from "next/image";
import { useDeleteConversation, useClearConversation } from "@/tanstack/queries/conversation.query";
import ConfirmActionModal from "@/components/modal/confirm-action.modal";

export type ChatHeaderUser = {
    displayName: string;
    username?: string;
    avatarUrl?: string;
    isOnline?: boolean;
    lastSeen?: string | null;
};

type Props = {
    conversationId: string | null;
    user: ChatHeaderUser | null;
    onBack: () => void;
    onToggleContext: () => void;
    isFriend?: boolean;
    isTyping?: boolean;
    myShowLastSeen?: boolean;
    selectionMode?: boolean;
    selectedCount?: number;
    onExitSelectMode?: () => void;
    onBulkDeleteForMe?: () => void;
    onBulkDeleteForEveryone?: () => void;
    onBulkHide?: () => void;
    onBulkForward?: () => void;
    selectedOwnCount?: number;
};

function formatLastSeen(iso: string) {
    try {
        const date = new Date(iso);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        if (diffDays === 0 && date.getDate() === now.getDate()) {
            return `Last seen today at ${timeStr}`;
        } else if (diffDays === 1 || (diffDays === 0 && date.getDate() !== now.getDate())) {
            return `Last seen yesterday at ${timeStr}`;
        } else if (diffDays < 7) {
            const weekday = date.toLocaleDateString([], { weekday: "long" });
            return `Last seen ${weekday} at ${timeStr}`;
        } else {
            return `Last seen on ${date.toLocaleDateString([], { month: "short", day: "numeric" })} at ${timeStr}`;
        }
    } catch {
        return "Offline";
    }
}

function Avatar({ user, size }: { user: ChatHeaderUser | null; size: "sm" | "md" }) {
    const initials = user?.displayName
        ? user.displayName.trim().split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
        : "?";

    const dim = size === "sm" ? "h-7 w-7 text-[10px]" : "h-9 w-9 text-[13px]";

    return (
        <div className="relative shrink-0">
            {user?.avatarUrl ? (
                <Image
                    src={user.avatarUrl}
                    alt={user.displayName}
                    width={size === "sm" ? 28 : 36}
                    height={size === "sm" ? 28 : 36}
                    className={cn("rounded-full object-cover", dim)}
                />
            ) : (
                <div className={cn(
                    "flex items-center justify-center rounded-full bg-surface-elevated font-semibold text-foreground ring-1 ring-border",
                    dim
                )}>
                    {initials}
                </div>
            )}
            {user?.isOnline && (
                <span className={cn(
                    "absolute rounded-full bg-emerald-500 ring-2 ring-background",
                    size === "sm" ? "-bottom-0.5 -right-0.5 h-2 w-2" : "-bottom-0.5 -right-0.5 h-2.5 w-2.5"
                )} />
            )}
        </div>
    );
}

export default function ChatHeader({
    conversationId,
    user,
    onBack,
    onToggleContext,
    isFriend = true,
    isTyping,
    myShowLastSeen,
    selectionMode,
    selectedCount = 0,
    onExitSelectMode,
    onBulkDeleteForMe,
    onBulkDeleteForEveryone,
    onBulkHide,
    onBulkForward,
    selectedOwnCount = 0,
}: Props) {
    const [showSelectMenu, setShowSelectMenu] = useState(false);
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [confirmClear, setConfirmClear] = useState(false);

    const deleteChat = useDeleteConversation();
    const clearChat = useClearConversation();

    if (selectionMode) {
        return (
            <header className="relative z-20 flex h-16 shrink-0 items-center justify-between border-b border-border bg-[#18181b]/95 px-6 backdrop-blur-xl transition-all duration-300">
                {/* Left: Exit and Selection Count */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onExitSelectMode}
                        className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer p-1"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    <span className="text-[15px] font-semibold text-foreground select-none">
                        {selectedCount} selected
                    </span>
                </div>

                {/* Right: Selection Actions */}
                <div className="relative flex items-center gap-1.5">
                    {/* Bulk Forward */}
                    <button
                        onClick={onBulkForward}
                        disabled={selectedCount === 0}
                        title="Forward"
                        className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full transition cursor-pointer active:scale-95",
                            selectedCount > 0
                                ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                                : "opacity-30 cursor-not-allowed bg-white/[0.04] text-muted-foreground"
                        )}
                    >
                        <Forward className="h-4 w-4" />
                    </button>

                    {/* Three Dots More Actions */}
                    <button
                        onClick={() => setShowSelectMenu((v) => !v)}
                        disabled={selectedCount === 0}
                        className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.07] hover:bg-white/[0.12] text-muted-foreground hover:text-foreground transition cursor-pointer active:scale-95",
                            selectedCount === 0 && "opacity-30 cursor-not-allowed"
                        )}
                    >
                        <MoreVertical className="h-4 w-4" />
                    </button>

                    {showSelectMenu && (
                        <>
                            {/* Backdrop close trap */}
                            <div
                                className="fixed inset-0 z-40"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setTimeout(() => setShowSelectMenu(false), 50);
                                }}
                            />
                            <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 top-10 z-50 w-48 rounded-xl border border-white/10 bg-[#1c1c1f]/25 py-1 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-1 duration-100"
                            >
                                {selectedOwnCount > 0 && onBulkDeleteForEveryone && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            onBulkDeleteForEveryone();
                                            setTimeout(() => setShowSelectMenu(false), 50);
                                        }}
                                        className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-[13px] font-medium text-red-400 hover:bg-white/[0.06] transition"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Delete for Everyone
                                    </button>
                                )}
                                {onBulkDeleteForMe && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            onBulkDeleteForMe();
                                            setTimeout(() => setShowSelectMenu(false), 50);
                                        }}
                                        className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-[13px] font-medium text-red-400 hover:bg-white/[0.06] transition"
                                    >
                                        <Trash className="h-3.5 w-3.5" />
                                        Delete for Me
                                    </button>
                                )}
                                {onBulkHide && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            onBulkHide();
                                            setTimeout(() => setShowSelectMenu(false), 50);
                                        }}
                                        className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition border-t border-white/[0.06]"
                                    >
                                        <EyeOff className="h-3.5 w-3.5" />
                                        Hide Messages
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </header>
        );
    }

    return (
        <header className="relative z-20 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-6">
            {/* Mobile */}
            <div className="flex items-center gap-3 md:hidden">
                <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
                </button>
                <div
                    onClick={onToggleContext}
                    className="flex items-center gap-2 select-none cursor-pointer hover:opacity-80 transition"
                >
                    <Avatar user={user} size="sm" />
                    <div>
                        <p className="text-[14px] font-semibold leading-tight">{user?.displayName ?? "…"}</p>
                        {isTyping ? (
                            <p className="text-[11px] text-emerald-500 font-medium animate-pulse leading-none mt-0.5">typing...</p>
                        ) : user?.isOnline ? (
                            <p className="text-[11px] text-emerald-500 font-medium leading-none mt-0.5">Online</p>
                        ) : (user?.lastSeen && myShowLastSeen !== false) ? (
                            <p className="text-[11px] text-muted-foreground leading-none mt-0.5">{formatLastSeen(user.lastSeen)}</p>
                        ) : user?.username ? (
                            <p className="text-[11px] text-muted-foreground leading-none mt-0.5">@{user.username}</p>
                        ) : null}
                    </div>
                </div>
            </div>

            {/* Desktop */}
            <div
                onClick={onToggleContext}
                className="hidden items-center gap-3 md:flex select-none cursor-pointer hover:opacity-80 transition"
            >
                <Avatar user={user} size="md" />
                <div>
                    <p className="font-display text-[15px] font-semibold tracking-tight leading-tight">
                        {user?.displayName ?? "…"}
                    </p>
                    {isTyping ? (
                        <p className="text-[12px] text-emerald-500 font-medium animate-pulse leading-none mt-1">typing...</p>
                    ) : user?.isOnline ? (
                        <p className="text-[12px] text-emerald-500 font-medium leading-none mt-1">Online</p>
                    ) : (user?.lastSeen && myShowLastSeen !== false) ? (
                        <p className="text-[12px] text-muted-foreground leading-none mt-1">{formatLastSeen(user.lastSeen)}</p>
                    ) : user?.username ? (
                        <p className="text-[12px] text-muted-foreground leading-none mt-1">@{user.username}</p>
                    ) : null}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
                <IconButton>
                    <Sparkles className="h-4 w-4" strokeWidth={1.5} />
                </IconButton>
                <IconButton onClick={onToggleContext}>
                    <Info className="h-4 w-4" strokeWidth={1.5} />
                </IconButton>
                <div className="relative">
                    <IconButton onClick={(e: any) => { e.stopPropagation(); setShowActionsMenu((v) => !v); }}>
                        <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
                    </IconButton>
                    {showActionsMenu && conversationId && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setTimeout(() => setShowActionsMenu(false), 50);
                                }}
                            />
                            <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 top-10 z-50 w-48 rounded-xl border border-white/10 bg-[#1c1c1f] py-1.5 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-1 duration-100 flex flex-col gap-0.5"
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setConfirmClear(true);
                                        setShowActionsMenu(false);
                                    }}
                                    className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] font-semibold text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition cursor-pointer"
                                >
                                    <Trash className="h-3.5 w-3.5" />
                                    Clear Chat History
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setConfirmDelete(true);
                                        setShowActionsMenu(false);
                                    }}
                                    className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] font-semibold text-red-400 hover:bg-white/[0.06] transition border-t border-white/[0.06] cursor-pointer"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Delete Chat
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {conversationId && (
                <>
                    <ConfirmActionModal
                        open={confirmClear}
                        title="Clear Chat History"
                        description="Are you sure you want to clear all messages in this chat? This action cannot be undone."
                        confirmLabel="Clear History"
                        confirmVariant="red"
                        onConfirm={async () => {
                            await clearChat.mutateAsync(conversationId);
                        }}
                        onCancel={() => setConfirmClear(false)}
                    />

                    <ConfirmActionModal
                        open={confirmDelete}
                        title="Delete Chat"
                        description="Are you sure you want to delete this chat? All messages and attachments will be deleted permanently."
                        confirmLabel="Delete Chat"
                        confirmVariant="red"
                        onConfirm={async () => {
                            await deleteChat.mutateAsync(conversationId);
                            onBack();
                        }}
                        onCancel={() => setConfirmDelete(false)}
                    />
                </>
            )}
        </header>
    );
}
