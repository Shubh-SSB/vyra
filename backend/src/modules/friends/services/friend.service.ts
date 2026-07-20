import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from 'src/modules/users/repositories/user.repositories';
import { FriendRepository } from '../repositories/friend.repository';
import { FriendRequestStatus } from '@prisma/client/wasm';
import { RelationshipStatus } from '../enums/relationship-status.enum';


@Injectable()
export class FriendsService {
    constructor(
        private readonly friendRepository: FriendRepository,
        private readonly userRepository: UserRepository,
    ) { }

    async sendRequest(
        senderId: string,
        receiverId: string,
    ) {

        if (senderId === receiverId) {
            throw new BadRequestException(
                "You cannot send a friend request to yourself.",
            );
        }

        const receiver =
            await this.userRepository.findPublicById(receiverId);

        if (!receiver) {
            throw new NotFoundException(
                "User not found.",
            );
        }

        const relationship =
            await this.friendRepository.findRelationship(
                senderId,
                receiverId,
            );

        if (relationship) {

            switch (relationship.status) {

                case FriendRequestStatus.PENDING:
                    throw new ConflictException(
                        "Friend request already exists.",
                    );

                case FriendRequestStatus.ACCEPTED:
                    throw new ConflictException(
                        "You are already friends.",
                    );

                case FriendRequestStatus.REJECTED:
                    await this.friendRepository.delete(
                        relationship.id,
                    );
                    break;
            }
        }

        return this.friendRepository.sendRequest(
            senderId,
            receiverId,
        );
    }

    async acceptRequest(
        currentUserId: string,
        requestId: string,
    ) {

        const request =
            await this.friendRepository.findById(requestId);

        if (!request) {
            throw new NotFoundException(
                "Friend request not found.",
            );
        }

        if (request.receiverId !== currentUserId) {
            throw new ForbiddenException();
        }

        if (request.status !== FriendRequestStatus.PENDING) {
            throw new BadRequestException(
                "Request is no longer pending.",
            );
        }

        return this.friendRepository.acceptRequest(
            requestId,
        );
    }

    async rejectRequest(
        currentUserId: string,
        requestId: string,
    ) {

        const request =
            await this.friendRepository.findById(requestId);

        if (!request) {
            throw new NotFoundException(
                "Friend request not found.",
            );
        }

        if (request.receiverId !== currentUserId) {
            throw new ForbiddenException();
        }

        if (request.status !== FriendRequestStatus.PENDING) {
            throw new BadRequestException(
                "Request is no longer pending.",
            );
        }
        return this.friendRepository.rejectRequest(requestId);
    }

    async cancelRequest(
        currentUserId: string,
        requestId: string,
    ) {
        const request =
            await this.friendRepository.findById(requestId);

        if (!request) {
            throw new NotFoundException(
                "Friend request not found.",
            );
        }

        if (request.senderId !== currentUserId) {
            throw new ForbiddenException();
        }

        if (request.status !== FriendRequestStatus.PENDING) {
            throw new BadRequestException(
                "Request is no longer pending.",
            );
        }

        return this.friendRepository.cancelRequest(requestId);
    }

    async getFriends(userId: string) {
        return this.friendRepository.getFriends(userId);
    }

    async getIncomingRequests(userId: string) {
        return this.friendRepository.findIncomingRequests(
            userId,
        );
    }

    async getOutgoingRequests(userId: string) {
        return this.friendRepository.findOutgoingRequests(
            userId,
        );
    }

    async getRelationship(
        currentUserId: string,
        otherUserId: string,
    ) {
        if (currentUserId === otherUserId) {
            throw new BadRequestException(
                "You cannot check relationship with yourself.",
            );
        }

        const user = await this.userRepository.findPublicById(otherUserId);

        if (!user) {
            throw new NotFoundException("User not found.")
        }

        const relationship = await this.friendRepository.findRelationship(
            currentUserId,
            otherUserId,
        );

        if (!relationship) {
            return {
                relationship: RelationshipStatus.NONE,
            }
        }

        if (relationship.status === "ACCEPTED") {
        return {
            relationship: RelationshipStatus.FRIENDS,
        };
    }

    if (relationship.status === "PENDING") {

        if (relationship.senderId === currentUserId) {
            return {
                relationship:
                    RelationshipStatus.PENDING_SENT,
            };
        }

        return {
            relationship:
                RelationshipStatus.PENDING_RECEIVED,
        };
    }

        return {relationship: RelationshipStatus.NONE,
        };
    }
}
