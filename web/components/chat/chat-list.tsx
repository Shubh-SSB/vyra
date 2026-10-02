"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { MessageSquare, Mic, Paperclip, Pin, PinOff } from "lucide-react";
import { useConversations, useTogglePinConversation } from "@/tanstack/queries/conversation.query";
import { ConversationPreview } from "@/types/conversation";
import ShowProfileModal from "../modal/show-profile.modal";
import { cn } from "@/lib/utils";
import { getAccessToken } from "@/lib/token";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Decode JWT payload without a library. */
export function getMyUserId(): string | null {
    try {
        const token = getAccessToken();
        if (!token) return null;
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.sub ?? payload.id ?? payload.userId ?? null;
    } catch {
        return null;
    }
}

/** Check if conversation is pinned either on root or within current user participant. */
export function isConversationPinned(conv: ConversationPreview, myId?: string | null): boolean {
    if (conv.isPinned) return true;
    if (myId && conv.participants?.some((p) => p.userId === myId && p.isPinned)) return true;
    return false;
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
    onTogglePin,
}: {
    conv: ConversationPreview;
    myId: string | null;
    active?: boolean;
    onClick?: () => void;
    isTyping?: boolean;
    onTogglePin?: (id: string) => void;
}) {
    const otherUser = getOtherUser(conv, myId);
    const [openProfile, setOpenProfile] = useState(false);
    if (!otherUser) return null;

    const isPinned = isConversationPinned(conv, myId);

    const initials = otherUser.displayName
        ? otherUser.displayName.trim().split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
        : otherUser.username.slice(0, 2).toUpperCase();

    // Use last message in the array (newest)
    const lastMsg = conv.messages?.at(-1);
    const lastTime = formatTime(lastMsg?.createdAt ?? conv.lastMessageAt);

    let preview: React.ReactNode = null;
    if (lastMsg) {
        if (lastMsg.content) {
            preview = lastMsg.content;
        } else if (lastMsg.type === "VOICE") {
            preview = <span className="flex items-center gap-1"><Mic className="h-3 w-3 shrink-0" /><span>Voice message</span></span>;
        } else if (lastMsg.attachments && lastMsg.attachments.length > 0) {
            const firstAttachment = lastMsg.attachments[0];
            let label = "Attachment";
            if (firstAttachment.type === "IMAGE") label = "Photo";
            else if (firstAttachment.type === "VIDEO") label = "Video";
            else if (firstAttachment.type === "DOCUMENT") label = "Document";
            else if (firstAttachment.type === "VOICE") label = "Voice message";

            preview = (
                <span className="flex items-center gap-1 text-muted-foreground font-medium">
                    <Paperclip className="h-3 w-3 shrink-0" />
                    <span>{label}</span>
                </span>
            );
        } else if (lastMsg.type === "MEDIA") {
            preview = <span className="flex items-center gap-1"><Paperclip className="h-3 w-3 shrink-0" /><span>Attachment</span></span>;
        } else {
            preview = "New message";
        }
    }

    const unread = conv.unreadCount ?? 0;

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onClick?.();
                }
            }}
            className={cn(
                "group relative flex w-full items-center gap-3 overflow-hidden rounded-xl px-4 py-3 text-left transition-all duration-150 my-0.5 select-none focus:outline-none",
                active
                    ? "border border-main/20 shadow-md bg-white/15 cursor-pointer"
                    : isPinned
                        ? "bg-white/[0.04] hover:bg-white/15 hover:border hover:border-main/20 cursor-pointer"
                        : "hover:bg-white/15 hover:border hover:border-main/20 cursor-pointer"
            )}
        >
            {/* Avatar */}
            <div className="relative shrink-0">
                {otherUser.avatarUrl ? (
                    <Image
                        src={otherUser.avatarUrl}
                        alt={otherUser.displayName}
                        width={40}
                        height={40}
                        className="rounded-full object-cover cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpenProfile(true);
                        }}
                    />
                ) : (
                    <div
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated text-[13px] font-semibold text-foreground ring-1 ring-border cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpenProfile(true);
                        }}
                    >
                        {initials}
                    </div>
                )}
                {otherUser.isOnline && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
                )}
            </div>

            <ShowProfileModal open={openProfile} onClose={() => setOpenProfile(false)}
                displayName={otherUser.displayName}
                username={otherUser.username}
                avatarUrl={otherUser.avatarUrl}
                bannerUrl={otherUser.bannerUrl}
                bio={otherUser.bio}
            />

            {/* Content */}
            <div className="min-w-0 flex-1 z-10">
                <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-[13px] font-semibold text-foreground">
                        {otherUser.displayName.trim()}
                    </p>
                    <div className="flex items-center gap-1.5 shrink-0">
                        {isPinned ? (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onTogglePin?.(conv.id);
                                }}
                                className="group/pinbtn flex h-5 w-5 items-center justify-center rounded text-amber-500 hover:text-red-400 hover:bg-white/10 transition-all cursor-pointer"
                                title="Pinned conversation (Click to unpin)"
                            >
                                <Pin className="h-3.5 w-3.5 fill-amber-500 text-amber-500 -rotate-45 drop-shadow-[0_0_6px_rgba(245,158,11,0.45)] group-hover/pinbtn:hidden" />
                                <PinOff className="hidden h-3.5 w-3.5 text-red-400 group-hover/pinbtn:block" />
                            </button>
                        ) : onTogglePin ? (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onTogglePin(conv.id);
                                }}
                                className="flex h-5 w-5 items-center justify-center rounded opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all cursor-pointer"
                                title="Pin chat to top"
                            >
                                <Pin className="h-3.5 w-3.5 -rotate-45" />
                            </button>
                        ) : null}
                        {lastTime && (
                            <span className="shrink-0 text-[11px] text-muted-foreground">{lastTime}</span>
                        )}
                    </div>
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
        </div>
    );
}

// ── ChatList ──────────────────────────────────────────────────────────────────

export default function ChatList({
    activeId,
    onSelect,
    typingConversations,
    query = "",
}: {
    activeId?: string;
    onSelect?: (conv: ConversationPreview) => void;
    typingConversations?: Record<string, boolean>;
    query?: string;
}) {
    const { data, isLoading } = useConversations();
    const togglePin = useTogglePinConversation();
    const myId = getMyUserId();

    const filteredData = useMemo(() => {
        if (!data) return [];
        const q = query.toLowerCase().trim();
        const list = q
            ? data.filter((conv) => {
                const otherUser = getOtherUser(conv, myId);
                if (!otherUser) return false;
                const displayName = (otherUser.displayName ?? "").toLowerCase();
                const username = (otherUser.username ?? "").toLowerCase();
                return displayName.includes(q) || username.includes(q);
            })
            : data;

        return [...list].sort((a, b) => {
            const aPinned = isConversationPinned(a, myId);
            const bPinned = isConversationPinned(b, myId);
            if (aPinned && !bPinned) return -1;
            if (!aPinned && bPinned) return 1;
            if (aPinned && bPinned) {
                const aPin = a.pinnedAt ? new Date(a.pinnedAt).getTime() : 0;
                const bPin = b.pinnedAt ? new Date(b.pinnedAt).getTime() : 0;
                return bPin - aPin;
            }
            const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
            const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
            return bTime - aTime;
        });
    }, [data, query, myId]);

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

    if (!filteredData || filteredData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-elevated">
                    <MessageSquare className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <div>
                    <p className="text-[13px] font-medium text-foreground">
                        {query ? "No matches found" : "No conversations yet"}
                    </p>
                    <p className="text-[12px] text-muted-foreground mt-0.5">
                        {query ? "Try checking spelling or search username" : "Search for people and start chatting"}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-1">
            {filteredData.map((conv) => (
                <ConversationRow
                    key={conv.id}
                    conv={conv}
                    myId={myId}
                    active={conv.id === activeId}
                    onClick={() => onSelect?.(conv)}
                    isTyping={typingConversations?.[conv.id] ?? false}
                    onTogglePin={(id) => togglePin.mutate(id)}
                />
            ))}
        </div>
    );
}