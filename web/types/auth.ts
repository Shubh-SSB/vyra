// types/auth.ts

export interface LoginPayload {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email?: string;
  password: string;
  displayName: string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    email: string;
  };
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface MeResponse {
  id: string;
  username: string;
  displayName: string;
  email?: string;
  avatarUrl?: string | null;
  bio?: string;
  profileVisibility?: string;
  messagePrivacy?: string;
  presenceVisibility?: string;
  showLastSeen?: boolean;
  showReadReceipts?: boolean;
}