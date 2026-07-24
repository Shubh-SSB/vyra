import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UserRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: Prisma.UserCreateInput): Promise<User> {
        return this.prisma.user.create({ data });
    }

    async findPublicById(id: string) {
        return this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                bio: true,
                profileVisibility: true,
                messagePrivacy: true,
            },
        });
    }

    async findById(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }

    async findByUsername(
        username: string,
    ): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: {
                username,
            },
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { email } });
    }

    async update(
        id: string,
        data: Prisma.UserUpdateInput,
    ): Promise<User> {
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<User> {
        return this.prisma.user.delete({
            where: { id },
        });
    }

    async search(currentUserId: string, query: string) {
        return this.prisma.user.findMany({
            where: {
                NOT: {
                    id: currentUserId,
                },
                profileVisibility: {
                    not: 'PRIVATE',
                },
                OR: [
                    {
                        username: {
                            contains: query,
                            mode: 'insensitive',
                        },
                    },
                    {
                        displayName: {
                            contains: query,
                            mode: 'insensitive',
                        },
                    },
                ],
            },
            orderBy: {
                username: 'asc',
            },
            take: 10,
            select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                profileVisibility: true,
            },
        });
    }


    async findByIdOrThrow(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException("User not found");
        }

        return this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                bio: true,
                profileVisibility: true,
                messagePrivacy: true,
            },
        });
        }
}
