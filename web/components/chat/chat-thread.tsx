"use client";

import React, { useEffect, useRef, useState } from "react";
import { Message } from "@/types/message";
import ChatMessage from "./chat-message";
import DateDivider, { getCalendarDateKey } from "./date-divider";
import Lenis from "lenis";

type Props = {
    messages: Message[];
    myUserId: string | null;
    isLoading?: boolean;
    isTyping?: boolean;
};

export default function ChatThread({ messages, myUserId, isLoading, isTyping }: Props) {
    const bottomRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isFirstLoad = useRef(true);
    const prevMessagesLength = useRef(messages.length);
    const [unreadMessage, setUnreadMessage] = useState<Message | null>(null);

    const [wrapper, setWrapper] = useState<HTMLDivElement | null>(null);
    const [content, setContent] = useState<HTMLDivElement | null>(null);
    const lenisRef = useRef<Lenis | null>(null);

    const setWrapperRef = (el: HTMLDivElement | null) => {
        containerRef.current = el;
        setWrapper(el);
    };

    // Initialize Lenis manually on the custom scroll container
    useEffect(() => {
        if (!wrapper || !content) return;

        const lenis = new Lenis({
            wrapper,
            content,
            lerp: 0.1,
            duration: 1.5,
        });

        lenisRef.current = lenis;

        let rafId: number;
        const raf = (time: number) => {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        };
        rafId = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
            lenisRef.current = null;
        };
    }, [wrapper, content]);

    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
        const lenis = lenisRef.current;
        if (lenis && bottomRef.current) {
            lenis.scrollTo(bottomRef.current, {
                immediate: behavior === "instant",
            });
        } else {
            bottomRef.current?.scrollIntoView({ behavior });
        }
        setUnreadMessage(null);
    };

    const handleScrollToBottom = () => {
        scrollToBottom("smooth");
    };

    // Scroll to bottom on initial load
    useEffect(() => {
        if (messages.length > 0 && isFirstLoad.current) {
            scrollToBottom("instant");
            isFirstLoad.current = false;
        }
    }, [messages.length]);

    // Handle new messages and show scroll-to-bottom alert if scrolled up
    useEffect(() => {
        if (messages.length > prevMessagesLength.current) {
            const lastMsg = messages.at(-1);
            if (lastMsg) {
                if (lastMsg.senderId === myUserId) {
                    scrollToBottom("smooth");
                } else {
                    const container = containerRef.current;
                    if (container) {
                        const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
                        if (isAtBottom) {
                            scrollToBottom("smooth");
                        } else {
                            setUnreadMessage(lastMsg);
                        }
                    }
                }
            }
        }
        prevMessagesLength.current = messages.length;
    }, [messages, myUserId]);

    // Monitor scroll events to dismiss the button if manually scrolled to bottom
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 100;
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
            <div className="flex-1 overflow-y-auto" ref={setWrapperRef} onScroll={handleScroll}>
                <div className="mx-auto flex max-w-[820px] flex-col px-6 pb-8 pt-6" ref={setContent}>
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

                            return (
                                <React.Fragment key={msg.id}>
                                    {showDateDivider && (
                                        <DateDivider date={msg.createdAt} />
                                    )}
                                    <ChatMessage
                                        message={msg}
                                        isOwn={isOwn}
                                        grouped={grouped}
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

            {unreadMessage && (
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
                            New message: <span className="text-muted-foreground font-normal italic">&ldquo;{unreadMessage.content.slice(0, 30)}{unreadMessage.content.length > 30 ? "..." : ""}&rdquo;</span>
                        </span>
                        <span className="text-[10px] text-muted-foreground ml-1">↓ Scroll</span>
                    </button>
                </div>
            )}
        </div>
    );
}

