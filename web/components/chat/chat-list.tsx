"use client";

import { useConversations } from "@/tanstack/queries/conversation.query";
import { ConversationPreview } from "@/types/conversation";
import Image from "next/image";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAccessToken } from "@/lib/token";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Decode JWT payload without a library. */
function getMyUserId(): string | null {
    try {
        const token = getAccessToken();
        if (!token) return null;
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.sub ?? payload.id ?? payload.userId ?? null;
    } catch {
        return null;
    }
}

/** For DIRECT conversations, return the participant who is NOT the logged-in user. */
function getOtherUser(conv: ConversationPreview, myId: string | null) {
    if (!myId) return conv.participants[0]?.user ?? null;
    const other = conv.participants.find((p) => p.userId !== myId);
    return other?.user ?? conv.participants[0]?.user ?? null;
}

function formatTime(iso: string | undefined) {
    if (!iso) return "";
    try {
        const diff = Date.now() - new Date(iso).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "now";
        if (mins < 60) return `${mins}m`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h`;
        const days = Math.floor(hrs / 24);
        if (days < 7) return `${days}d`;
        return `${Math.floor(days / 7)}w`;
    } catch {
        return "";
    }
}

// ── Row ───────────────────────────────────────────────────────────────────────

function ConversationRow({
    conv,
    myId,
    active,
    onClick,
    isTyping,
}: {
    conv: ConversationPreview;
    myId: string | null;
    active?: boolean;
    onClick?: () => void;
    isTyping?: boolean;
}) {
    const otherUser = getOtherUser(conv, myId);
    if (!otherUser) return null;

    const initials = otherUser.displayName
        ? otherUser.displayName.trim().split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
        : otherUser.username.slice(0, 2).toUpperCase();

    // Use last message in the array (newest)
    const lastMsg = conv.messages?.at(-1);
    const lastTime = formatTime(lastMsg?.createdAt ?? conv.lastMessageAt);
    const preview = lastMsg?.content ?? "";
    const unread = conv.unreadCount ?? 0;

    return (
        <button
            onClick={onClick}
            className={cn(
                "group relative flex w-full items-center gap-3 overflow-hidden rounded-xl px-4 py-3 text-left transition-all duration-200 my-0.5",
                active
                    ? "ring-1 ring-border shadow-md"
                    : "hover:bg-surface/50"
            )}
        >
            {/* Background Image & Overlay */}
            <div className="absolute inset-0 pointer-events-none">
                <Image
                    src="/bg1.jpeg"
                    alt="Tile background"
                    fill
                    className={cn(
                        "object-cover transition-transform duration-300 group-hover:scale-105",
                        active ? "opacity-75" : "opacity-50 group-hover:opacity-70"
                    )}
                />
                <div
                    className={cn(
                        "absolute inset-0 bg-gradient-to-r from-background/85 via-background/50 to-transparent",
                        active ? "from-background/75 via-background/40 to-transparent" : ""
                    )}
                />
            </div>

            {/* Avatar */}
            <div className="relative shrink-0">
                {otherUser.avatarUrl ? (
                    <Image
                        src={otherUser.avatarUrl}
                        alt={otherUser.displayName}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                    />
                ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated text-[13px] font-semibold text-foreground ring-1 ring-border">
                        {initials}
                    </div>
                )}
                {otherUser.isOnline && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
                )}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1 z-10">
                <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-[13px] font-semibold text-foreground">
                        {otherUser.displayName.trim()}
                    </p>
                    {lastTime && (
                        <span className="shrink-0 text-[11px] text-muted-foreground">{lastTime}</span>
                    )}
                </div>
                <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[12px] text-muted-foreground flex-1">
                        {isTyping ? (
                            <span className="text-emerald-500 font-medium animate-pulse">typing...</span>
                        ) : (
                            preview || <span className="italic">No messages yet</span>
                        )}
                    </p>
                    {unread > 0 && (
                        <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-bold text-background leading-none shrink-0">
                            {unread > 9 ? "9+" : unread}
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function ChatList({
    activeId,
    onSelect,
    typingConversations,
}: {
    activeId?: string;
    onSelect?: (conv: ConversationPreview) => void;
    typingConversations?: Record<string, boolean>;
}) {
    const { data, isLoading } = useConversations();
    const myId = getMyUserId();

    if (isLoading) {
        return (
            <div className="flex flex-col gap-0.5 p-2">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-2 py-2.5 animate-pulse">
                        <div className="h-10 w-10 rounded-full bg-surface-elevated shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="h-3 w-24 rounded bg-surface-elevated" />
                            <div className="h-2.5 w-36 rounded bg-surface-elevated" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-elevated">
                    <MessageSquare className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <div>
                    <p className="text-[13px] font-medium text-foreground">No conversations yet</p>
                    <p className="text-[12px] text-muted-foreground mt-0.5">
                        Search for people and start chatting
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-1">
            {data.map((conv) => (
                <ConversationRow
                    key={conv.id}
                    conv={conv}
                    myId={myId}
                    active={conv.id === activeId}
                    onClick={() => onSelect?.(conv)}
                    isTyping={typingConversations?.[conv.id] ?? false}
                />
            ))}
        </div>
    );
}