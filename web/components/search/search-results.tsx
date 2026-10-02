"use client";

import { useState } from "react";
import type { SearchUser } from "@/tanstack/queries/user.types";
import Image from "next/image";
import ShowProfileModal from "../modal/show-profile.modal";

export default function SearchResults({
    data,
    onSelect,
}: {
    data: SearchUser[] | undefined;
    onSelect: (user: SearchUser) => void;
}) {
    const [enlargedUser, setEnlargedUser] = useState<SearchUser | null>(null);

    if (!data || data.length === 0) return null;

    return (
        <div className="flex flex-col gap-1 mt-2">
            {data.map((user) => {
                const initials = user.displayName
                    ? user.displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                    : user.username.slice(0, 2).toUpperCase();

                return (
                    <div
                        key={user.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => onSelect(user)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                onSelect(user);
                            }
                        }}
                        className="group flex items-center gap-3 w-full p-2.5 hover:bg-surface cursor-pointer rounded-xl text-left transition-colors border border-transparent focus:outline-none select-none"
                    >
                        <div
                            className="relative shrink-0 cursor-pointer transition-transform hover:scale-110 active:scale-95"
                            title="Click avatar to enlarge profile"
                            onClick={(e) => {
                                e.stopPropagation();
                                setEnlargedUser(user);
                            }}
                        >
                            {user.avatarUrl ? (
                                <Image
                                    src={user.avatarUrl}
                                    alt={user.username}
                                    width={38}
                                    height={38}
                                    className="rounded-full object-cover ring-1 ring-border shadow-sm"
                                />
                            ) : (
                                <div className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold bg-surface-elevated text-foreground ring-1 ring-border">
                                    {initials}
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-medium text-foreground group-hover:text-primary transition-colors">{user.displayName}</p>
                            <p className="truncate text-[11px] text-muted-foreground">@{user.username}</p>
                        </div>
                    </div>
                );
            })}

            {enlargedUser && (
                <ShowProfileModal
                    open={!!enlargedUser}
                    onClose={() => setEnlargedUser(null)}
                    displayName={enlargedUser.displayName}
                    username={enlargedUser.username}
                    avatarUrl={enlargedUser.avatarUrl}
                    bannerUrl={enlargedUser.bannerUrl}
                    bio={enlargedUser.bio}
                />
            )}
        </div>
    );
}