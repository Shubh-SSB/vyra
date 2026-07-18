import { Injectable } from '@nestjs/common';
import { Prisma, Session } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateSessionRepositoryData } from '../interface/create-session.interface';

@Injectable()
export class SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateSessionRepositoryData){
    return this.prisma.session.create({
      data,
    })
  }

  async findById(id: string): Promise<Session | null> {
    return this.prisma.session.findUnique({
      where: { id },
    });
  }

  async findByUserId(userId: string): Promise<Session[]> {
    return this.prisma.session.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      }
    });
  }

  async findValidSession(sessionId: string): Promise<Session | null> {
    return this.prisma.session.findFirst({
      where: {
        id: sessionId,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }

  async updateRefreshToken(
    sessionId: string,
    refreshTokenHash: string,
    expiresAt: Date
  ): Promise<Session> {
    return this.prisma.session.update({
      where: { id: sessionId },
      data: {
        refreshTokenHash,
        expiresAt,
      },
    });
  }

  async delete(sessionId: string): Promise<Session> {
    return this.prisma.session.delete({
      where: { id: sessionId },
    });
  }

  async deleteAllByUserId(userId: string) {
    return this.prisma.session.deleteMany({
      where: {
        userId,
      },
    });
  }
}