import { Module, forwardRef } from "@nestjs/common";
import { NotificationService } from "./services/notification.service";
import { NotificationController } from "./controllers/notification.controller";
import { NotificationEventListener } from "./listeners/notification.listener";
import { WebPushService } from "./services/web-push.service";
import { PrismaModule } from "../../prisma/prisma.module";
import { SocketModule } from "../../socket/socket.module";

@Module({
    imports: [
        PrismaModule,
        forwardRef(() => SocketModule),
    ],
    controllers: [NotificationController],
    providers: [NotificationService, NotificationEventListener, WebPushService],
    exports: [NotificationService, WebPushService],
})
export class NotificationsModule {}
