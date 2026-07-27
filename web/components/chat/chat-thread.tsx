"use client";

import React, { useEffect, useRef, useState } from "react";
import { Message } from "@/types/message";
import ChatMessage from "./chat-message";
import DateDivider, { getCalendarDateKey } from "./date-divider";
import Lenis from "lenis";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { EyeOff, Forward, Trash, Trash2, X } from "lucide-react";


type Props = {
    messages: Message[];
    myUserId: string | null;
    isLoading?: boolean;
    isTyping?: boolean;
    otherParticipantLastReadAt?: string | null;
    sendReaction: (messageId: string, reaction: string) => void;
    onReply: (message: Message) => void;
    fetchNextPage: () => Promise<any>;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    onEdit: (message: Message) => void;
    onDeleteForMe: (messageId: string) => void;
    onDeleteForEveryone: (messageId: string) => void;
    onHide: (messageId: string) => void;
    onForward: (message: Message) => void;
    // Selection mode
    selectionMode: boolean;
    selectedIds: Set<string>;
    onToggleSelect: (messageId: string) => void;
    onEnterSelectMode: (messageId: string) => void;
    onExitSelectMode: () => void;
    onBulkDeleteForMe: () => void;
    onBulkDeleteForEveryone: () => void;
    onBulkHide: () => void;
    onBulkForward: () => void;
};

export default function ChatThread({
    messages,
    myUserId,
    isLoading,
    isTyping,
    otherParticipantLastReadAt,
    sendReaction,
    onReply,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    onEdit,
    onDeleteForMe,
    onDeleteForEveryone,
    onHide,
    onForward,
    selectionMode,
    selectedIds,
    onToggleSelect,
    onEnterSelectMode,
    onExitSelectMode,
    onBulkDeleteForMe,
    onBulkDeleteForEveryone,
    onBulkHide,
    onBulkForward,
}: Props) {
    const bottomRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const isFirstLoad = useRef(true);
    const prevMessagesLength = useRef(messages.length);
    const prevLastMessageId = useRef<string | null>(null);
    const isNearBottomRef = useRef(true);
    const [unreadMessage, setUnreadMessage] = useState<Message | null>(null);
    const unreadMessageContent = unreadMessage?.content || (unreadMessage?.type === "VOICE" ? "Voice message" : "New message");

    const lenisRef = useRef<Lenis | null>(null);

    // Derived: are any selected messages by the current user
    const selectedOwnCount = Array.from(selectedIds).filter((id) => {
        const msg = messages.find((m) => m.id === id);
        return msg?.senderId === myUserId;
    }).length;

    // Initialize Lenis manually on the custom scroll container
    useEffect(() => {
        const wrapper = containerRef.current;
        const content = contentRef.current;
        if (!wrapper || !content) return;

        const lenis = new Lenis({
            wrapper,
            content,
            lerp: 0.1,
            duration: 1.2,
            autoRaf: true,
        });

        lenisRef.current = lenis;

        return () => {
            lenis.destroy();
            lenisRef.current = null;
        };
    }, []);

    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
        setTimeout(() => {
            const lenis = lenisRef.current;
            if (lenis) {
                lenis.resize();
                lenis.scrollTo("bottom", {
                    immediate: behavior === "instant",
                });
            } else {
                bottomRef.current?.scrollIntoView({ behavior });
            }
        }, 50);
        setUnreadMessage(null);
        isNearBottomRef.current = true;
    };

    const handleScrollToBottom = () => {
        scrollToBottom("smooth");
    };

    // Scroll to bottom on initial load
    useEffect(() => {
        if (messages.length > 0 && isFirstLoad.current) {
            // Check if jumping to a specific message
            const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
            const msgId = params?.get("msgId");
            if (msgId) {
                setTimeout(() => {
                    const el = document.getElementById(`msg-${msgId}`);
                    if (el) {
                        el.scrollIntoView({ behavior: "smooth", block: "center" });
                        el.classList.add("bg-accent/10");
                        setTimeout(() => {
                            el.classList.remove("bg-accent/10");
                        }, 2000);
                    }
                }, 300);
            } else {
                scrollToBottom("instant");
            }
            isFirstLoad.current = false;
            prevLastMessageId.current = messages.at(-1)?.id ?? null;
        }
    }, [messages.length]);

    // Handle new messages and show scroll-to-bottom alert if scrolled up
    useEffect(() => {
        if (messages.length > 0) {
            const lastMsg = messages.at(-1);
            if (lastMsg && lastMsg.id !== prevLastMessageId.current) {
                if (!isFirstLoad.current) {
                    if (lastMsg.senderId === myUserId) {
                        scrollToBottom("smooth");
                    } else {
                        if (isNearBottomRef.current) {
                            scrollToBottom("smooth");
                        } else {
                            setUnreadMessage(lastMsg);
                        }
                    }
                }
                prevLastMessageId.current = lastMsg.id;
            }
        }
        prevMessagesLength.current = messages.length;
    }, [messages, myUserId]);

    // Monitor scroll events to dismiss the button if manually scrolled to bottom and handle pagination
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;

        // If scrolled near the top and there is another page, load it
        if (target.scrollTop <= 80 && hasNextPage && !isFetchingNextPage) {
            const oldScrollHeight = target.scrollHeight;
            const oldScrollTop = target.scrollTop;

            fetchNextPage().then(() => {
                requestAnimationFrame(() => {
                    if (containerRef.current) {
                        const newScrollHeight = containerRef.current.scrollHeight;
                        const heightDifference = newScrollHeight - oldScrollHeight;

                        if (lenisRef.current) {
                            lenisRef.current.resize();
                            lenisRef.current.scrollTo(oldScrollTop + heightDifference, {
                                immediate: true,
                            });
                        } else {
                            containerRef.current.scrollTop = oldScrollTop + heightDifference;
                        }
                    }
                });
            });
        }

        const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 150;
        isNearBottomRef.current = isAtBottom;
        if (isAtBottom) {
            setUnreadMessage(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-foreground" />
            </div>
        );
    }

    return (
        <div className="relative flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto overflow-x-hidden transform translate-z-0" ref={containerRef} onScroll={handleScroll}>
                <div className="mx-auto flex max-w-[820px] flex-col px-6 pb-8 pt-6" ref={contentRef}>
                    {isFetchingNextPage && (
                        <div className="flex items-center justify-center py-2 shrink-0 animate-fade-in">
                            <div className="h-4 w-4 animate-spin rounded-full border-[1.5px] border-white/10 border-t-muted-foreground" />
                        </div>
                    )}
                    {messages.length === 0 ? (
                        <div className="py-8 text-center text-[13px] text-muted-foreground">
                            No messages yet — say hello 👋
                        </div>
                    ) : (
                        messages.map((msg, i) => {
                            const prev = messages[i - 1];
                            const currentDateKey = getCalendarDateKey(msg.createdAt);
                            const prevDateKey = prev ? getCalendarDateKey(prev.createdAt) : null;

                            const showDateDivider = !prevDateKey || currentDateKey !== prevDateKey;
                            const isOwn = msg.senderId === myUserId;
                            const grouped = !showDateDivider && prev?.senderId === msg.senderId;

                            let isRead = false;
                            if (isOwn && otherParticipantLastReadAt) {
                                const msgDate = new Date(msg.createdAt).getTime();
                                const readDate = new Date(otherParticipantLastReadAt).getTime();
                                isRead = msgDate <= readDate;
                            }

                            return (
                                <React.Fragment key={msg.id}>
                                    {showDateDivider && (
                                        <DateDivider date={msg.createdAt} />
                                    )}
                                    <ChatMessage
                                        message={msg}
                                        isOwn={isOwn}
                                        grouped={grouped}
                                        isRead={isRead}
                                        myUserId={myUserId}
                                        sendReaction={sendReaction}
                                        onReply={onReply}
                                        onEdit={onEdit}
                                        onDeleteForMe={onDeleteForMe}
                                        onDeleteForEveryone={onDeleteForEveryone}
                                        onHide={onHide}
                                        onForward={onForward}
                                        selectionMode={selectionMode}
                                        isSelected={selectedIds.has(msg.id)}
                                        onToggleSelect={onToggleSelect}
                                        onEnterSelectMode={onEnterSelectMode}
                                    />
                                </React.Fragment>
                            );
                        })
                    )}

                    {isTyping && (
                        <div className="flex items-center gap-2 text-muted-foreground text-xs py-2 px-2 py-2.5 bg-white/20 backdrop-blur-sm rounded-full w-fit mt-2">
                            <span className="flex gap-1 items-center">
                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '0ms' }} />
                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '150ms' }} />
                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '300ms' }} />
                            </span>
                            <span className="">typing...</span>
                        </div>
                    )}

                    {/* Scroll anchor */}
                    <div ref={bottomRef} />
                </div>
            </div>

            {unreadMessage && !selectionMode && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 animate-fade-in">
                    <button
                        onClick={handleScrollToBottom}
                        className="flex items-center gap-2 rounded-full border border-border bg-surface-elevated/95 backdrop-blur px-4 py-2.5 text-xs font-semibold text-foreground shadow-elevation-2 transition hover:bg-surface border-white/10 hover:border-white/20 active:scale-95"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span>
                            New message: <span className="text-muted-foreground font-normal italic">&ldquo;{unreadMessageContent.slice(0, 30)}{unreadMessageContent.length > 30 ? "..." : ""}&rdquo;</span>
                        </span>
                        <span className="text-[10px] text-muted-foreground ml-1">↓ Scroll</span>
                    </button>
                </div>
            )}

            {/* ── Floating Bulk Action Bar ── */}
            <AnimatePresence>
                {selectionMode && (
                    <motion.div
                        key="bulk-bar"
                        initial={{ y: 80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 80, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                        className="absolute bottom-0 inset-x-0 z-30 hidden md:flex items-center gap-2 px-4 py-3 bg-[#18181b]/95 backdrop-blur-xl border-t border-white/[0.08] shadow-2xl"
                    >
                        {/* Cancel */}
                        <button
                            onClick={onExitSelectMode}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.07] hover:bg-white/[0.12] text-muted-foreground hover:text-foreground transition cursor-pointer"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        {/* Count */}
                        <span className="text-[13px] font-semibold text-foreground mr-auto">
                            {selectedIds.size} selected
                        </span>

                        {/* Forward */}
                        <button
                            onClick={onBulkForward}
                            disabled={selectedIds.size === 0}
                            title="Forward"
                            className={cn(
                                "flex h-9 w-9 items-center justify-center rounded-full transition cursor-pointer",
                                selectedIds.size > 0
                                    ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                                    : "opacity-30 cursor-not-allowed bg-white/[0.04] text-muted-foreground"
                            )}
                        >
                            <Forward className="h-4 w-4" />
                        </button>

                        {/* Hide */}
                        <button
                            onClick={onBulkHide}
                            disabled={selectedIds.size === 0}
                            title="Hide"
                            className={cn(
                                "flex h-9 w-9 items-center justify-center rounded-full transition cursor-pointer",
                                selectedIds.size > 0
                                    ? "bg-white/[0.07] text-muted-foreground hover:bg-white/[0.12] hover:text-foreground"
                                    : "opacity-30 cursor-not-allowed bg-white/[0.04] text-muted-foreground"
                            )}
                        >
                            <EyeOff className="h-4 w-4" />
                        </button>

                        {/* Delete for Everyone (own messages only) */}
                        {selectedOwnCount > 0 && (
                            <button
                                onClick={onBulkDeleteForEveryone}
                                title="Delete for Everyone"
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500/15 text-red-400 hover:bg-red-500/25 transition cursor-pointer"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        )}

                        {/* Delete for Me */}
                        <button
                            onClick={onBulkDeleteForMe}
                            disabled={selectedIds.size === 0}
                            title="Delete for Me"
                            className={cn(
                                "flex h-9 w-9 items-center justify-center rounded-full transition cursor-pointer",
                                selectedIds.size > 0
                                    ? "bg-red-500/10 text-red-400/70 hover:bg-red-500/20 hover:text-red-400"
                                    : "opacity-30 cursor-not-allowed bg-white/[0.04] text-muted-foreground"
                            )}
                        >
                            <Trash className="h-4 w-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
