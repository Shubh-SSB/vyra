export type SearchUser = {
    id: string;
    name: string;
    username: string;
    avatarUrl: string;
}

export type UserProfile = {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    bio?: string;
    profileVisibility?: string;
    messagePrivacy?: string;
}


export type AvatarProps = {
    compact?: boolean;
    user?: {
        displayName?: string;
        avatarUrl?: string | null;
    } | null;
};