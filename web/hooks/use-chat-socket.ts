"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getAccessToken } from "@/lib/token";
import { BASE_URL } from "@/constants/constant";
import { NewMessagePayload, TypingPayload, UseChatSocketOptions } from "@/types/socket.types";

type ConnectionStatus = "connecting" | "joined" | "disconnected";

export function useChatSocket({
    conversationId,
    conversationIds,
    onNewMessage,
    onTypingStart,
    onTypingStop,
    onError,
}: UseChatSocketOptions) {
    const socketRef = useRef<Socket | null>(null);
    const onNewMessageRef = useRef(onNewMessage);
    const onTypingStartRef = useRef(onTypingStart);
    const onTypingStopRef = useRef(onTypingStop);
    const onErrorRef = useRef(onError);
    const joinedConversationsRef = useRef<string[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting");

    onNewMessageRef.current = onNewMessage;
    onTypingStartRef.current = onTypingStart;
    onTypingStopRef.current = onTypingStop;
    onErrorRef.current = onError;

    const conversationIdsJson = JSON.stringify(conversationIds);

    useEffect(() => {
        const hasConversations = conversationId || (conversationIds && conversationIds.length > 0);
        if (!hasConversations) {
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
            query: { token },
            transports: ["websocket"],
            autoConnect: true,
        });

        socketRef.current = socket;
        joinedConversationsRef.current = [];
        setConnectionStatus("connecting");

        const joinConversations = () => {
            if (conversationId) {
                socket.emit("joinConversation", { conversationId });
            }
            if (conversationIds) {
                conversationIds.forEach((id) => {
                    socket.emit("joinConversation", { conversationId: id });
                });
            }
        };

        const handleJoinedConversation = (payload: { conversationId?: string }) => {
            if (!payload.conversationId) return;
            if (!joinedConversationsRef.current.includes(payload.conversationId)) {
                joinedConversationsRef.current.push(payload.conversationId);
            }
            setConnectionStatus("joined");
        };

        const handleNewMessage = (payload: NewMessagePayload) => {
            if (!payload.message) return;
            onNewMessageRef.current(payload.message, payload.conversationId);
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

        const handleConnectError = (err: any) => {
            setConnectionStatus("disconnected");
            onErrorRef.current?.("Unable to connect to chat. Please try again.");
        };

        const handleDisconnect = () => {
            joinedConversationsRef.current = [];
            setConnectionStatus("disconnected");
        };

        const handleTypingStart = (payload: TypingPayload) => {
            onTypingStartRef.current?.(payload);
        };

        const handleTypingStop = (payload: TypingPayload) => {
            onTypingStopRef.current?.(payload);
        };

        if (socket.connected) {
            joinConversations();
        }
        socket.on("connect", joinConversations);
        socket.on("joinedConversation", handleJoinedConversation);
        socket.on("newMessage", handleNewMessage);
        socket.on("error", handleSocketError);
        socket.on("connect_error", handleConnectError);
        socket.on("disconnect", handleDisconnect);
        socket.on("userTyping", handleTypingStart);
        socket.on("userStoppedTyping", handleTypingStop);

        return () => {
            joinedConversationsRef.current = [];
            socket.off("connect", joinConversations);
            socket.off("joinedConversation", handleJoinedConversation);
            socket.off("newMessage", handleNewMessage);
            socket.off("error", handleSocketError);
            socket.off("connect_error", handleConnectError);
            socket.off("disconnect", handleDisconnect);
            socket.off("userTyping", handleTypingStart);
            socket.off("userStoppedTyping", handleTypingStop);
            socket.disconnect();
            socketRef.current = null;
        };
    }, [conversationId, conversationIdsJson]);

    const sendMessage = (content: string, convId?: string | null): boolean => {
        const id = convId ?? conversationId;
        if (!socketRef.current?.connected || !id) {
            return false;
        }

        socketRef.current.emit("sendMessage", { conversationId: id, content });
        return true;
    };

    const sendTypingStart = (convId?: string | null) => {
        const id = convId ?? conversationId;
        if (!socketRef.current?.connected || !id) return;
        socketRef.current.emit("typingStart", { conversationId: id });
    };

    const sendTypingStop = (convId?: string | null) => {
        const id = convId ?? conversationId;
        if (!socketRef.current?.connected || !id) return;
        socketRef.current.emit("typingStop", { conversationId: id });
    };

    return {
        connectionStatus,
        sendMessage,
        sendTypingStart,
        sendTypingStop,
    };
}
