"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getAccessToken } from "@/lib/token";
import { BASE_URL } from "@/constants/constant";
import { Message } from "@/types/message";

type NewMessagePayload = {
    conversationId: string;
    message: Message;
};

type UseChatSocketOptions = {
    conversationId: string | null;
    onNewMessage: (message: Message) => void;
    onError?: (message: string) => void;
};

type ConnectionStatus = "connecting" | "joined" | "disconnected";

export function useChatSocket({ conversationId, onNewMessage, onError }: UseChatSocketOptions) {
    const socketRef = useRef<Socket | null>(null);
    const onNewMessageRef = useRef(onNewMessage);
    const onErrorRef = useRef(onError);
    const joinedConversationRef = useRef<string | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting");

    onNewMessageRef.current = onNewMessage;
    onErrorRef.current = onError;

    useEffect(() => {
        if (!conversationId) {
            setConnectionStatus("disconnected");
            return;
        }

        const token = getAccessToken();
        if (!token) {
            setConnectionStatus("disconnected");
            onErrorRef.current?.("Your session has expired. Please log in again.");
            return;
        }

        const socket = io(BASE_URL, {
            // The Nest gateway reads this value from client.handshake.query.token.
            query: { token },
            transports: ["websocket"],
            autoConnect: true,
        });

        socketRef.current = socket;
        joinedConversationRef.current = null;
        setConnectionStatus("connecting");

        const joinConversation = () => {
            socket.emit("joinConversation", { conversationId });
        };

        const handleJoinedConversation = (payload: { conversationId?: string }) => {
            if (payload.conversationId !== conversationId) return;

            joinedConversationRef.current = conversationId;
            setConnectionStatus("joined");
        };

        const handleNewMessage = (payload: NewMessagePayload) => {
            if (payload.conversationId !== conversationId || !payload.message) return;

            onNewMessageRef.current(payload.message);
        };

        const handleSocketError = (error: unknown) => {
            const message =
                typeof error === "string"
                    ? error
                    : error instanceof Error
                        ? error.message
                        : "Unable to send the message.";

            onErrorRef.current?.(message);
        };

        const handleConnectError = () => {
            setConnectionStatus("disconnected");
            onErrorRef.current?.("Unable to connect to chat. Please try again.");
        };

        const handleDisconnect = () => {
            joinedConversationRef.current = null;
            setConnectionStatus("disconnected");
        };

        socket.on("connect", joinConversation);
        socket.on("joinedConversation", handleJoinedConversation);
        socket.on("newMessage", handleNewMessage);
        socket.on("error", handleSocketError);
        socket.on("connect_error", handleConnectError);
        socket.on("disconnect", handleDisconnect);

        return () => {
            joinedConversationRef.current = null;
            socket.off("connect", joinConversation);
            socket.off("joinedConversation", handleJoinedConversation);
            socket.off("newMessage", handleNewMessage);
            socket.off("error", handleSocketError);
            socket.off("connect_error", handleConnectError);
            socket.off("disconnect", handleDisconnect);
            socket.disconnect();
            socketRef.current = null;
        };
    }, [conversationId]);

    const sendMessage = (content: string): boolean => {
        if (
            !socketRef.current?.connected ||
            !conversationId ||
            joinedConversationRef.current !== conversationId
        ) {
            return false;
        }

        socketRef.current.emit("sendMessage", { conversationId, content });
        return true;
    };

    return { connectionStatus, sendMessage };
}
