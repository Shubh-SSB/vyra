import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UserRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: Prisma.UserCreateInput): Promise<User> {
        return this.prisma.user.create({ data });
    }

    // ─── Public profile by ID (for profile pages / other users viewing) ───────
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

    // ─── Full user by username (for auth — returns passwordHash) ──────────────
    async findByUsername(username: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { username } });
    }

    // ─── Public profile by username (for profile pages — no passwordHash) ─────
    async findPublicByUsername(username: string) {
        return this.prisma.user.findUnique({
            where: { username },
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

    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { email } });
    }

    // ─── Update (type-safe, no `as any`) ─────────────────────────────────────
    async update(
        id: string,
        data: Prisma.UserUpdateInput,
    ): Promise<User> {
        const updateData: Prisma.UserUpdateInput = {
            ...(data.displayName !== undefined && {
                displayName: data.displayName,
            }),
            ...(data.email !== undefined && {
                email: data.email,
            }),
            ...(data.bio !== undefined && {
                bio: data.bio,
            }),
            ...(data.avatarUrl !== undefined && {
                avatarUrl: data.avatarUrl,
            }),
        };

        return this.prisma.user.update({
            where: { id },
            data: updateData,
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
}
