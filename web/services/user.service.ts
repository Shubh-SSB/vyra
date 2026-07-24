import { $crud } from "@/factory/crudFactory";
import { SearchUser } from "@/tanstack/queries/user.types";
import { UserProfile } from "@/types/user.type";

export const UserService = {
    search(query: string) {
        return $crud.get<SearchUser[]>("users/search", { params: { query } });
    },

    getProfile(username: string) {
        return $crud.get<UserProfile>(`users/profile/${username}`);
    },

    updateProfile(data: { displayName?: string; bio?: string; avatarUrl?: string; email?: string }) {
        return $crud.patch<UserProfile>("users/profile", data);
    },

    updateUsername(data: { username: string }) {
        return $crud.patch<UserProfile>("users/username", data);
    },

    updatePrivacy(data: {
        profileVisibility?: string;
        messagePrivacy?: string;
        presenceVisibility?: string;
        showLastSeen?: boolean;
        showReadReceipts?: boolean;
    }) {
        return $crud.patch<UserProfile>("users/privacy", data);
    },
};
