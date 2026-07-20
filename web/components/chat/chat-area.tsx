"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAccessToken } from "@/lib/token";
import { Message } from "@/types/message";
import { useMessages } from "@/tanstack/queries/message.query";
import { useConversations } from "@/tanstack/queries/conversation.query";
import { useChatSocket } from "@/hooks/use-chat-socket";
import ChatHeader from "./chat-header";
import ChatThread from "./chat-thread";
import ChatComposer from "./chat-composer";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Decode JWT payload to get the logged-in user's ID. */
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

// ── Props ─────────────────────────────────────────────────────────────────────

type Props = {
    conversationId: string | null;
    mobileView: string;
    goBackToList: () => void;
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function ChatArea({ conversationId, mobileView, goBackToList }: Props) {
    const myUserId = getMyUserId();

    // Local state for messages received via socket (appended to REST history)
    const [socketMessages, setSocketMessages] = useState<Message[]>([]);

    // 1. Fetch message history via REST
    const { data: historyMessages, isLoading: historyLoading } = useMessages(conversationId);

    // 2. Find the other participant's info from the conversations list (for header)
    const { data: conversations } = useConversations();
    const conversation = conversations?.find((c) => c.id === conversationId);
    const otherParticipant = conversation?.participants.find((p) => p.userId !== myUserId);
    const otherUser = otherParticipant
        ? {
              displayName: otherParticipant.user.displayName,
              username: otherParticipant.user.username,
              avatarUrl: otherParticipant.user.avatarUrl,
              isOnline: otherParticipant.user.isOnline,
          }
        : null;

    // 3. Socket: join room, listen for messages from OTHER participants only
    const { sendMessage: socketSend } = useChatSocket({
        conversationId,
        onNewMessage: (msg) => {
            // Skip our own messages — we add them optimistically on send
            if (msg.senderId === myUserId) return;
            setSocketMessages((prev) => {
                if (prev.some((m) => m.id === msg.id)) return prev;
                if (historyMessages?.some((h) => h.id === msg.id)) return prev;
                return [...prev, msg];
            });
        },
    });

    // Optimistic send: add message to local state immediately, then emit via socket
    const handleSend = (content: string) => {
        if (!conversationId) return;

        // Append optimistically so the sender sees it right away
        const optimistic: Message = {
            id: `local-${Date.now()}`,
            conversationId,
            senderId: myUserId ?? "me",
            content,
            type: "TEXT",
            createdAt: new Date().toISOString(),
        };
        setSocketMessages((prev) => [...prev, optimistic]);

        // Emit to server — server saves and broadcasts to others
        socketSend(content);
    };

    // 4. Merge: history first, then realtime additions
    const allMessages: Message[] = [
        ...(historyMessages ?? []),
        ...socketMessages,
    ];

    // ── Empty state ───────────────────────────────────────────────────────────

    if (!conversationId) {
        return (
            <main className={cn(
                "min-w-0 flex-1 flex-col items-center justify-center bg-background",
                "md:flex",
                mobileView === "chat" ? "flex" : "hidden",
            )}>
                <div className="flex flex-col items-center gap-3 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-elevated">
                        <MessageSquare className="h-7 w-7 text-muted-foreground" strokeWidth={1.25} />
                    </div>
                    <p className="text-[14px] font-medium">Select a conversation</p>
                    <p className="text-[12px] text-muted-foreground">
                        Choose from your chats to start messaging
                    </p>
                </div>
            </main>
        );
    }

    // ── Active conversation ───────────────────────────────────────────────────

    return (
        <main className={cn(
            "min-w-0 flex-1 flex-col bg-background",
            "md:flex",
            mobileView === "chat" ? "flex" : "hidden",
        )}>
            {/* Header */}
            <ChatHeader
                user={otherUser}
                onBack={goBackToList}
                onToggleContext={() => {}}
            />

            {/* Message thread — history + realtime */}
            <ChatThread
                messages={allMessages}
                myUserId={myUserId}
                isLoading={historyLoading}
            />

            {/* Composer */}
            <ChatComposer onSend={handleSend} />
        </main>
    );
}