"use client";

import { ArrowLeft, Info, MoreHorizontal, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import IconButton from "@/components/ui/icon-button";
import Image from "next/image";

export type ChatHeaderUser = {
    displayName: string;
    username?: string;
    avatarUrl?: string;
    isOnline?: boolean;
};

type Props = {
    user: ChatHeaderUser | null;
    onBack: () => void;
    onToggleContext: () => void;
    isTyping?: boolean;
};

function Avatar({ user, size }: { user: ChatHeaderUser | null; size: "sm" | "md" }) {
    const initials = user?.displayName
        ? user.displayName.trim().split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
        : "?";

    const dim = size === "sm" ? "h-7 w-7 text-[10px]" : "h-9 w-9 text-[13px]";

    return (
        <div className="relative shrink-0">
            {user?.avatarUrl ? (
                <Image
                    src={user.avatarUrl}
                    alt={user.displayName}
                    width={size === "sm" ? 28 : 36}
                    height={size === "sm" ? 28 : 36}
                    className={cn("rounded-full object-cover", dim)}
                />
            ) : (
                <div className={cn(
                    "flex items-center justify-center rounded-full bg-surface-elevated font-semibold text-foreground ring-1 ring-border",
                    dim
                )}>
                    {initials}
                </div>
            )}
            {user?.isOnline && (
                <span className={cn(
                    "absolute rounded-full bg-emerald-500 ring-2 ring-background",
                    size === "sm" ? "-bottom-0.5 -right-0.5 h-2 w-2" : "-bottom-0.5 -right-0.5 h-2.5 w-2.5"
                )} />
            )}
        </div>
    );
}

export default function ChatHeader({ user, onBack, onToggleContext, isTyping }: Props) {
    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-6">
            {/* Mobile */}
            <div className="flex items-center gap-3 md:hidden">
                <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
                </button>
                <div 
                    onClick={onToggleContext}
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition select-none"
                >
                    <Avatar user={user} size="sm" />
                    <div>
                        <p className="text-[14px] font-semibold leading-tight">{user?.displayName ?? "…"}</p>
                        {isTyping ? (
                            <p className="text-[11px] text-emerald-500 font-medium animate-pulse">typing...</p>
                        ) : user?.username && (
                            <p className="text-[11px] text-muted-foreground">@{user.username}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Desktop */}
            <div 
                onClick={onToggleContext}
                className="hidden items-center gap-3 md:flex cursor-pointer hover:opacity-80 transition select-none"
            >
                <Avatar user={user} size="md" />
                <div>
                    <p className="font-display text-[15px] font-semibold tracking-tight leading-tight">
                        {user?.displayName ?? "…"}
                    </p>
                    {isTyping ? (
                        <p className="text-[12px] text-emerald-500 font-medium animate-pulse">typing...</p>
                    ) : user?.username && (
                        <p className="text-[12px] text-muted-foreground">@{user.username}</p>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
                <IconButton>
                    <Sparkles className="h-4 w-4" strokeWidth={1.5} />
                </IconButton>
                <IconButton onClick={onToggleContext}>
                    <Info className="h-4 w-4" strokeWidth={1.5} />
                </IconButton>
                <IconButton>
                    <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
                </IconButton>
            </div>
        </header>
    );
}
