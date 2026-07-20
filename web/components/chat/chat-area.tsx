"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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

type Props = {
    conversationId: string | null;
    mobileView: string;
    goBackToList: () => void;
};

export default function ChatArea({ conversationId, mobileView, goBackToList }: Props) {
    const myUserId = getMyUserId();
    const queryClient = useQueryClient();
    const [socketError, setSocketError] = useState<string | null>(null);
    const { data: historyMessages, isLoading: historyLoading } = useMessages(conversationId);
    const { data: conversations } = useConversations();

    const conversation = conversations?.find((item) => item.id === conversationId);
    const otherParticipant = conversation?.participants.find((participant) => participant.userId !== myUserId);
    const otherUser = otherParticipant
        ? {
              displayName: otherParticipant.user.displayName,
              username: otherParticipant.user.username,
              avatarUrl: otherParticipant.user.avatarUrl,
              isOnline: otherParticipant.user.isOnline,
          }
        : null;

    const { connectionStatus, sendMessage: socketSend } = useChatSocket({
        conversationId,
        onNewMessage: (message) => {
            if (!conversationId) return;

            queryClient.setQueryData<Message[]>(["messages", conversationId], (current = []) => {
                if (current.some((existing) => existing.id === message.id)) return current;
                return [...current, message];
            });

            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        },
        onError: setSocketError,
    });

    const handleSend = (content: string) => {
        setSocketError(null);

        if (!socketSend(content)) {
            setSocketError("Chat is still connecting. Please try again in a moment.");
        }
    };

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

    return (
        <main className={cn(
            "min-w-0 flex-1 flex-col bg-background",
            "md:flex",
            mobileView === "chat" ? "flex" : "hidden",
        )}>
            <ChatHeader
                user={otherUser}
                onBack={goBackToList}
                onToggleContext={() => {}}
            />

            <ChatThread
                messages={historyMessages ?? []}
                myUserId={myUserId}
                isLoading={historyLoading}
            />

            {(connectionStatus !== "joined" || socketError) && (
                <p className="px-6 pb-2 text-center text-[11px] text-muted-foreground">
                    {socketError ?? "Connecting to chat…"}
                </p>
            )}

            <ChatComposer
                onSend={handleSend}
                disabled={connectionStatus !== "joined"}
            />
        </main>
    );
}
