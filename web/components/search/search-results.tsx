import type { SearchUser } from "@/tanstack/queries/user.types";
import Image from "next/image";

export default function SearchResults({
    data,
    onSelect,
}: {
    data: SearchUser[] | undefined;
    onSelect: (user: SearchUser) => void;
}) {
    if (!data) return null;
    if (data.length === 0) return null;
    return (
        <div className="flex flex-col gap-1 mt-2">
            {data.map((user) => {
                const initials = user.displayName
                    ? user.displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                    : user.username.slice(0, 2).toUpperCase();

                return (
                    <button
                        key={user.id}
                        onClick={() => onSelect(user)}
                        className="flex items-center gap-3 w-full p-2.5 hover:bg-surface cursor-pointer rounded-xl text-left transition-colors border border-transparent focus:outline-none"
                    >
                        <div className="relative shrink-0">
                            {user.avatarUrl ? (
                                <Image
                                    src={user.avatarUrl}
                                    alt={user.username}
                                    width={36}
                                    height={36}
                                    className="rounded-full object-cover ring-1 ring-border"
                                />
                            ) : (
                                <div className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold bg-surface-elevated text-foreground ring-1 ring-border">
                                    {initials}
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-medium text-foreground">{user.displayName}</p>
                            <p className="truncate text-[11px] text-muted-foreground">@{user.username}</p>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}