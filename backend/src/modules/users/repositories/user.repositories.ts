import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';

@Injectable() 
export class UserRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: Prisma.UserCreateInput): Promise<User> {
        return this.prisma.user.create({ data });
    }

    async findById(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { id } });
    }

    async findByUsername(username: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { username } });
    }

    async findByEmail(email:string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { email } });
    }

    // async update(
    //     id: string,
    //     data: Prisma.UserUpdateInput,
    // ): Promise<User> {
    //     return this.prisma.user.update({
    //         where: { id },
    //         data,
    //     });
    // }

    async update(
        id: string,
        data: Prisma.UserUpdateInput,
        ): Promise<User> {

        const updateData: Prisma.UserUpdateInput = {};

        if (data.displayName !== undefined)
            updateData.displayName = data.displayName;

        if (data.email !== undefined)
            updateData.email = data.email;

        // Future
        if ("bio" in data)
            (updateData as any).bio = (data as any).bio;

        if ("avatarUrl" in data)
            (updateData as any).avatarUrl = (data as any).avatarUrl;

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

    async search(query: string): Promise<User[]> {
        return this.prisma.user.findMany({
            where: {
                OR: [
                    { username: { contains: query, mode: 'insensitive' } },
                    { displayName: { contains: query, mode: 'insensitive' } },
                ],
            },
            take: 10,
        });
    }
}