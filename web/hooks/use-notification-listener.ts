"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";
import { getAccessToken } from "@/lib/token";
import { BASE_URL } from "@/constants/constant";
import { playSound } from "@/lib/sounds";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { NotificationService } from "@/services/notification.service";

export function useNotificationListener() {
    const queryClient = useQueryClient();
    const router = useRouter();

    // 1. Request Browser Desktop Notification permission
    useEffect(() => {
        if (typeof window !== "undefined" && "Notification" in window) {
            if (Notification.permission === "default") {
                Notification.requestPermission();
            }
        }
    }, []);

    // 2. Setup Socket Listener
    useEffect(() => {
        const token = getAccessToken();
        if (!token) return;

        const socket = io(BASE_URL, {
            query: { token },
            transports: ["websocket"],
            autoConnect: true,
        });

        socket.on("newNotification", (notification: any) => {
            // Read active conversation ID from sessionStorage
            let activeConvId = null;
            if (typeof window !== "undefined") {
                activeConvId = sessionStorage.getItem("activeConversationId");
            }

            const conversationId = notification.groupId || notification.data?.conversationId;

            // If the user has this conversation currently open, suppress notifications!
            if (activeConvId && conversationId === activeConvId) {
                // Instantly delete this notification from the DB so it doesn't clutter counts/drawer
                NotificationService.deleteNotification(notification.id).catch(() => {});
                return;
            }

            // Play notification chirp sound
            playSound("received");

            // Invalidate TanStack query cache for notifications list and unread count
            queryClient.invalidateQueries({ queryKey: ["notifications"] });

            // Display HTML5 browser desktop notification
            if (
                typeof window !== "undefined" &&
                "Notification" in window &&
                Notification.permission === "granted"
            ) {
                const iconEmojiMap: Record<string, string> = {
                    NEW_MESSAGE: "💬",
                    FRIEND_REQUEST: "👥",
                    MESSAGE_REACTION: "❤️",
                    MESSAGE_PIN: "📌",
                };
                const emoji = iconEmojiMap[notification.type] || "🔔";

                const n = new Notification(`${emoji} ${notification.title}`, {
                    body: notification.body,
                    tag: notification.groupId || notification.id,
                });

                n.onclick = (e) => {
                    e.preventDefault();
                    window.focus();
                    if (notification.type === "NEW_MESSAGE" && notification.data?.conversationId) {
                        router.push(`/chat?id=${notification.data.conversationId}`);
                    } else if (notification.type === "FRIEND_REQUEST") {
                        router.push("/settings");
                    }
                };
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [queryClient, router]);
}
