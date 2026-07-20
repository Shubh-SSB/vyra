"use client";

import { useEffect, useRef } from "react";
import { Message } from "@/types/message";
import ChatMessage from "./chat-message";

type Props = {
    messages: Message[];
    myUserId: string | null;
    isLoading?: boolean;
};

export default function ChatThread({ messages, myUserId, isLoading }: Props) {
    const bottomRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom whenever messages change
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    if (isLoading) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-foreground" />
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="mx-auto flex max-w-[820px] flex-col px-6 pb-8 pt-6">
                {/* Date divider */}
                <div className="mb-6 flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        Today
                    </span>
                    <div className="h-px flex-1 bg-border" />
                </div>

                {messages.length === 0 ? (
                    <div className="py-8 text-center text-[13px] text-muted-foreground">
                        No messages yet — say hello 👋
                    </div>
                ) : (
                    messages.map((msg, i) => {
                        const prev = messages[i - 1];
                        const isOwn = msg.senderId === myUserId;
                        const grouped = prev?.senderId === msg.senderId;
                        return (
                            <ChatMessage
                                key={msg.id}
                                message={msg}
                                isOwn={isOwn}
                                grouped={grouped}
                            />
                        );
                    })
                )}

                {/* Scroll anchor */}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}
