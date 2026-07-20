import { $crud } from "@/factory/crudFactory";
import { SearchUser } from "@/tanstack/queries/user.types";
import { UserProfile } from "@/types/user.type";

export const UserService = {
    search(query: string) {
        return $crud.get<SearchUser[]>("users/search", { params: { query } });
    },

    getProfile(username: string) {
        return $crud.get<UserProfile>(`users/${username}`);
    },
};
