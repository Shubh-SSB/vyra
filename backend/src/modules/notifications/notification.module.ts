import { forwardRef, Module } from "@nestjs/common";

import { PrismaModule } from "../../prisma/prisma.module";
import { UsersModule } from "../users/users.module";
import { SocketModule } from "../../socket/socket.module";

import { NotificationController } from "./controllers/notification.controller";
import { NotificationService } from "./services/notification.service";
import { NotificationEventListener } from "./listeners/notification.listener";

@Module({
    imports: [
        PrismaModule,
        forwardRef(() => UsersModule),
        forwardRef(() => SocketModule),
    ],

    controllers: [
        NotificationController,
    ],

    providers: [
        NotificationService,
        NotificationEventListener,
    ],

    exports: [
        NotificationService,
    ],
})
export class NotificationModule { }