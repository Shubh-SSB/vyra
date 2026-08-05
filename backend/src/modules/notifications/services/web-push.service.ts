import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const webpush = require("web-push") as typeof import("web-push");

@Injectable()
export class WebPushService implements OnModuleInit {
    constructor(private readonly prisma: PrismaService) {}

    onModuleInit() {
        webpush.setVapidDetails(
            "mailto:admin@vyra.app",
            "BBPtl8vPX__56VJ5wy9pCtb-VwuzawvweSh6Gu0m7C2MALy92yA1zaSWqzMB5PGADBAQWdIO655RB-l0NjcrBAE",
            "4-ukVAl5poC90Fggifpw3cqIJQi29kBlhDuCbxPOiLI",
        );
    }

    async saveSubscription(userId: string, subscription: any) {
        return this.prisma.pushSubscription.upsert({
            where: { endpoint: subscription.endpoint },
            update: {
                userId,
                keys: subscription.keys,
            },
            create: {
                userId,
                endpoint: subscription.endpoint,
                keys: subscription.keys,
            },
        });
    }

    async deleteSubscription(endpoint: string) {
        return this.prisma.pushSubscription.deleteMany({
            where: { endpoint },
        });
    }

    async sendPushNotification(userId: string, title: string, body: string, data?: any) {
        const subscriptions = await this.prisma.pushSubscription.findMany({
            where: { userId },
        });

        const payload = JSON.stringify({
            title,
            body,
            data,
        });

        const promises = subscriptions.map((sub) => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: sub.keys as any,
            };

            return webpush.sendNotification(pushSubscription, payload).catch((err) => {
                console.error("Failed to send web push notification", err);
                if (err.statusCode === 410 || err.statusCode === 404) {
                    return this.deleteSubscription(sub.endpoint);
                }
            });
        });

        await Promise.all(promises);
    }
}
