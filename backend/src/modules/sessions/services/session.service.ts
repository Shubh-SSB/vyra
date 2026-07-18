import { Injectable } from '@nestjs/common';
import { Session } from '@prisma/client';

import { PasswordService } from '../../../common/services/password.service';
import { SessionRepository } from '../repositories/session.repository';
import { CreateSessionData } from '../interface/create-session.interface';

@Injectable()
export class SessionService {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly passwordService: PasswordService,
  ) {}

 async createSession(data: CreateSessionData): Promise<Session> {
  const refreshTokenHash = await this.passwordService.hash(
    data.refreshToken
  );

  const expiresAt = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000,
  );

  return this.sessionRepository.create({
    id: data.id,
    userId: data.userId,
    refreshTokenHash,
    deviceName: data.deviceName,
    platform: data.platform,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    expiresAt,
  });
}

  async findSessionById(sessionId: string) {
    return this.sessionRepository.findById(sessionId);
  }

  async findValidSession(sessionId: string) {
    return this.sessionRepository.findValidSession(sessionId);
  }

  async rotateRefreshToken(
    sessionId: string,
    refreshToken: string,
  ): Promise<Session> {
    const refreshTokenHash = await this.passwordService.hash(
      refreshToken,
    );

    const expiresAt = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000,
  );

    return this.sessionRepository.updateRefreshToken(
      sessionId,
      refreshTokenHash,
      expiresAt,
    );
  }

  async revokeSession(sessionId: string) {
    return this.sessionRepository.delete(sessionId);
  }

  async revokeAllSessions(userId: string) {
    return this.sessionRepository.deleteAllByUserId(userId);
  }
}
