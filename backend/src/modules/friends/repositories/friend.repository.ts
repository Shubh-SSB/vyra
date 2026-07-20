import { Injectable } from "@nestjs/common";
import {
    FriendRequest,
    FriendRequestStatus,
} from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class FriendRepository {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async sendRequest(
        senderId: string,
        receiverId: string,
    ): Promise<FriendRequest> {
        return this.prisma.friendRequest.create({
            data: {
                senderId,
                receiverId,
            },
        });
    }

    async findRelationship(
        senderId: string,
        receiverId: string,
    ) {
        return this.prisma.friendRequest.findFirst({
            where: {
                OR: [
                    {
                        senderId,
                        receiverId,
                    },
                    {
                        senderId: receiverId,
                        receiverId: senderId,
                    },
                ],
            },
            orderBy: {
                    updatedAt: "desc",
                }
        });
    }

    async findIncomingRequests(
        userId: string,
    ) {
        return this.prisma.friendRequest.findMany({
            where: {
                receiverId: userId,
                status: FriendRequestStatus.PENDING,
            },

            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        avatarUrl: true,
                    },
                },
            },

            orderBy: {
                createdAt: "desc",
            },
        });
    }

    async findOutgoingRequests(
        userId: string,
    ) {
        return this.prisma.friendRequest.findMany({
            where: {
                senderId: userId,
                status: FriendRequestStatus.PENDING,
            },

            include: {
                receiver: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        avatarUrl: true,
                    },
                },
            },

            orderBy: {
                createdAt: "desc",
            },
        });
    }

    async acceptRequest(
        id: string,
    ) {
        return this.prisma.friendRequest.update({
            where: {
                id,
            },
            data: {
                status: FriendRequestStatus.ACCEPTED,
            },
        });
    }

    async rejectRequest(
        id: string,
    ) {
        return this.prisma.friendRequest.update({
            where: {
                id,
            },
            data: {
                status: FriendRequestStatus.REJECTED,
            },
        });
    }

    async cancelRequest(
        id: string,
    ) {
        return this.prisma.friendRequest.update({
            where: {
                id,
            },
            data: {
                status: FriendRequestStatus.REJECTED,
            },
        });
    }

    async getFriends(
        userId: string,
    ) {
        return this.prisma.friendRequest.findMany({
            where: {
                status: FriendRequestStatus.ACCEPTED,

                OR: [
                    {
                        senderId: userId,
                    },
                    {
                        receiverId: userId,
                    },
                ],
            },

            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        avatarUrl: true,
                    },
                },

                receiver: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        avatarUrl: true,
                    },
                },
            },
        });
    }

    async delete(
        id: string,
    ) {
        return this.prisma.friendRequest.delete({
            where: {
                id,
            },
        });
    }

    async areFriends(
        userId: string,
        otherUserId: string,
    ): Promise<boolean> {

        const friendship =
            await this.prisma.friendRequest.findFirst({
                where: {
                    status: FriendRequestStatus.ACCEPTED,

                    OR: [
                        {
                            senderId: userId,
                            receiverId: otherUserId,
                        },
                        {
                            senderId: otherUserId,
                            receiverId: userId,
                        },
                    ],
                },
            });

        return !!friendship;
    }
    
    async findById(id: string) {
        return this.prisma.friendRequest.findUnique({
            where: {
                id,
            },
        });
    }
}