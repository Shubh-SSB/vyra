self.addEventListener("push", (event) => {
    if (!event.data) return;

    try {
        const payload = event.data.json();
        const { title, body, data } = payload;

        const iconEmojiMap = {
            NEW_MESSAGE: "💬",
            FRIEND_REQUEST: "👥",
            MESSAGE_REACTION: "❤️",
            MESSAGE_PIN: "📌",
        };
        const emoji = iconEmojiMap[data?.type] || "🔔";

        const options = {
            body: body,
            icon: "/favicon.jpg",
            badge: "/favicon.jpg",
            tag: data?.groupId || data?.id || "vyra-notification",
            renotify: true,
            data: {
                url: data?.conversationId ? `/chat?convId=${data.conversationId}` : "/chat",
            },
        };

        event.waitUntil(
            self.registration.showNotification(`${emoji} ${title}`, options)
        );
    } catch (err) {
        console.error("[SW] Failed to parse push payload", err);
    }
});

self.addEventListener("notificationclick", (event) => {
    const notification = event.notification;
    const url = notification.data?.url || "/";

    notification.close();

    event.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
            // Find if there is an active tab open for our app and focus it
            for (const client of clientList) {
                const isMatchingOrigin = client.url.startsWith(self.location.origin);
                if (isMatchingOrigin && "focus" in client) {
                    return client.focus().then((focusedClient) => {
                        return focusedClient.navigate(url);
                    });
                }
            }

            // Otherwise, open a new browser window
            if (self.clients.openWindow) {
                return self.clients.openWindow(url);
            }
        })
    );
});
