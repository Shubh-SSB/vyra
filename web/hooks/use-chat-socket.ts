"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { getAccessToken } from "@/lib/token";
import { BASE_URL } from "@/constants/constant";
import { Message } from "@/types/message";

type UseChatSocketOptions = {
    conversationId: string | null;
    /** Called whenever the server emits a `newMessage` event */
    onNewMessage: (msg: Message) => void;
};

export function useChatSocket({ conversationId, onNewMessage }: UseChatSocketOptions) {
    const socketRef = useRef<Socket | null>(null);
    // Keep the callback stable without needing it in the dep array
    const onNewMessageRef = useRef(onNewMessage);
    onNewMessageRef.current = onNewMessage;

    useEffect(() => {
        if (!conversationId) return;

        const token = getAccessToken();
        if (!token) return;

        const socket = io(BASE_URL, {
            auth: { token },
            transports: ["websocket"],
            autoConnect: true,
        });

        socketRef.current = socket;

        // 1. Join the room after connection is established
        socket.on("connect", () => {
            socket.emit("joinConversation", { conversationId });
        });

        // 2. Listen for realtime messages
        socket.on("newMessage", (msg: Message) => {
            onNewMessageRef.current(msg);
        });

        // 3. Cleanup: leave room + disconnect when conversation changes or component unmounts
        return () => {
            if (socket.connected) {
                socket.emit("leaveConversation", { conversationId });
            }
            socket.off("newMessage");
            socket.disconnect();
            socketRef.current = null;
        };
    }, [conversationId]); // Re-runs only when conversation changes

    /** Emit `sendMessage` via socket — no REST call needed */
    const sendMessage = (content: string) => {
        if (!socketRef.current?.connected || !conversationId) return;
        socketRef.current.emit("sendMessage", { conversationId, content });
    };

    return { sendMessage };
}
