import { forwardRef, Module } from "@nestjs/common";

import { PrismaModule } from "src/prisma/prisma.module";
import { UsersModule } from "../users/users.module";

import { FriendsController } from "./controllers/friends.controller";
import { FriendsService } from "./services/friend.service";
import { FriendRepository } from "./repositories/friend.repository";

@Module({
    imports: [
        PrismaModule,
        forwardRef(() => UsersModule),
    ],

    controllers: [
        FriendsController,
    ],

    providers: [
        FriendsService,
        FriendRepository,
    ],

    exports: [
        FriendsService,
        FriendRepository,
    ],
})
export class FriendsModule {}