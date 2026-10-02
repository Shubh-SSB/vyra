export interface SearchUser {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    bannerUrl?: string;
    bio?: string;
    profileVisibility?: 'PUBLIC' | 'PRIVATE' | 'FRIENDS_ONLY';
}