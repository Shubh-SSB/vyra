export interface CreateSessionData {
    id: string;
    userId: string;
    refreshToken: string;
    deviceName?: string;
    platform?: string;
    ipAddress?: string;
    userAgent?: string;
}

export interface CreateSessionRepositoryData {
  id: string;
  userId: string;
  refreshTokenHash: string;

  deviceName?: string;
  platform?: string;
  ipAddress?: string;
  userAgent?: string;

  expiresAt: Date;
}