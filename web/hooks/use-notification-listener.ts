"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";
import { getAccessToken } from "@/lib/token";
import { BASE_URL } from "@/constants/constant";
import { playSound } from "@/lib/sounds";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { NotificationService } from "@/services/notification.service";

function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function useNotificationListener() {
    const queryClient = useQueryClient();
    const router = useRouter();

    // 1. Register Service Worker and subscribe to Web Push
    useEffect(() => {
        const registerPush = async () => {
            if (typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window) {
                try {
                    const registration = await navigator.serviceWorker.register("/sw.js");

                    // Always unsubscribe any stale/old subscription first
                    // (fixes Vercel deployments where VAPID key or endpoint may have changed)
                    const existing = await registration.pushManager.getSubscription();
                    if (existing) {
                        await existing.unsubscribe();
                    }

                    const VAPID_PUBLIC_KEY = "BBPtl8vPX__56VJ5wy9pCtb-VwuzawvweSh6Gu0m7C2MALy92yA1zaSWqzMB5PGADBAQWdIO655RB-l0NjcrBAE";
                    const convertedKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

                    const subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: convertedKey,
                    });

                    const subscriptionJson = subscription.toJSON();
                    const subscriptionPayload = {
                        endpoint: subscriptionJson.endpoint,
                        keys: {
                            p256dh: subscriptionJson.keys?.p256dh,
                            auth: subscriptionJson.keys?.auth,
                        },
                    };

                    await NotificationService.registerWebPush(subscriptionPayload);
                    console.log("[Vyra] Web Push subscription registered ✅");
                } catch (err) {
                    console.warn("[Vyra] Web Push registration failed:", err);
                }
            }
        };

        if (typeof window !== "undefined" && "Notification" in window) {
            if (Notification.permission === "default") {
                Notification.requestPermission().then((perm) => {
                    if (perm === "granted") {
                        registerPush();
                    }
                });
            } else if (Notification.permission === "granted") {
                registerPush();
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
            queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });

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
