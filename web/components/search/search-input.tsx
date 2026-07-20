import { useSearchUsers } from "@/tanstack/queries/user.query";
import { Search, X } from "lucide-react";
import { useState } from "react";
import SearchResults from "./search-results";
import { useDebounce } from "@/hooks/debounce";
import { SearchUser } from "@/tanstack/queries/user.types";
import UserCard from "./user-card";
import { UserProfile } from "@/types/user.type";
import FriendRequestBell from "./friend-request-bell";

export default function SearchInput({ onMessage }: { onMessage?: (user: UserProfile) => void }) {
    const [query, setQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);

    const debouncedQuery = useDebounce(query, 500);
    const { data } = useSearchUsers(debouncedQuery);

    if (selectedUser) {
        return (
            <UserCard
                username={selectedUser.username}
                onBack={() => setSelectedUser(null)}
                onMessage={onMessage}
            />
        );
    }

    return (
        <div className="flex flex-1 flex-col overflow-hidden">
            <div className="px-5 pt-4">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="font-display text-[20px] font-semibold tracking-tight">Find Connections</h1>
                    <FriendRequestBell />
                </div>
                <div className="relative">
                    <Search
                        className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                        strokeWidth={1.75}
                    />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by @username"
                        className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-8 text-[13px] font-medium text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            </div>
            <div className="mt-4 flex-1 overflow-y-auto px-5 pb-6">
                <SearchResults data={data} onSelect={setSelectedUser} />
            </div>
        </div>
    );
}
