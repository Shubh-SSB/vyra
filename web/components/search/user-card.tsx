"use client";

import { useState } from "react";
import Image from "next/image";
import { useProfile } from "@/tanstack/queries/user.query";
import {
    useRelationship,
    useSendFriendRequest,
    useCancelFriendRequest,
} from "@/tanstack/queries/friend.query";
import { ChevronLeft, Globe, Lock, MapPin, Maximize2, Send, UserCheck, UserMinus, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { UserProfile } from "@/types/user.type";
import { SearchUser } from "@/tanstack/queries/user.types";
import ShowProfileModal from "../modal/show-profile.modal";

const ACCENT = "oklch(0.65 0.18 280)";

const tags = ["AI", "Space", "Technology", "Startups"];

export default function UserCard({
    username,
    initialUser,
    onBack,
    onMessage,
}: {
    username: string;
    initialUser?: SearchUser | null;
    onBack: () => void;
    onMessage?: (user: UserProfile) => void;
}) {
    const { data: profile, isLoading, error } = useProfile(username);
    const [showEnlarged, setShowEnlarged] = useState(false);

    // Merge profile query data with initial user data from search results
    const displayUser = profile || initialUser;

    // Target user ID for relationship queries
    const targetUserId = displayUser?.id ?? "";

    // Relationship + mutations (only active once targetUserId is available)
    const { data: relationship, isLoading: relLoading } = useRelationship(targetUserId);

    const sendRequest = useSendFriendRequest(targetUserId);
    const cancelRequest = useCancelFriendRequest(
        relationship === "PENDING_SENT"
            ? undefined
            : undefined
    );

    if (isLoading && !displayUser) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center p-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-foreground" />
                <p className="mt-2 text-xs text-muted-foreground">Loading profile...</p>
            </div>
        );
    }

    if ((error || !displayUser) && !initialUser) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <p className="text-sm text-destructive font-medium">Failed to load profile</p>
                <button
                    onClick={onBack}
                    className="mt-4 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                    Back to Search
                </button>
            </div>
        );
    }

    if (!displayUser) return null;

    const initials = displayUser.displayName
        ? displayUser.displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
        : displayUser.username.slice(0, 2).toUpperCase();

    const isPublic =
        displayUser.profileVisibility === "PUBLIC" ||
        (displayUser.profileVisibility === "FRIENDS_ONLY" && relationship === "FRIENDS") ||
        displayUser.profileVisibility === undefined;

    // ── Connect button state ──────────────────────────────────────────────────
    type BtnConfig = { label: string; icon: React.ReactNode; style: string; action: () => void };

    const connectBtn: BtnConfig = (() => {
        if (relLoading)
            return {
                label: "...",
                icon: null,
                style: "border border-border bg-surface text-muted-foreground opacity-60 cursor-not-allowed",
                action: () => { },
            };

        switch (relationship) {
            case "FRIENDS":
                return {
                    label: "Friends",
                    icon: <UserCheck className="h-4 w-4" strokeWidth={1.75} />,
                    style: "border border-border bg-surface text-muted-foreground hover:bg-surface-elevated",
                    action: () => { },
                };
            case "PENDING_SENT":
                return {
                    label: "Requested",
                    icon: <UserMinus className="h-4 w-4" strokeWidth={1.75} />,
                    style: "border border-border bg-surface text-muted-foreground hover:bg-surface-elevated",
                    action: () => { },
                };
            case "PENDING_RECEIVED":
                return {
                    label: "Accept",
                    icon: <UserPlus className="h-4 w-4" strokeWidth={1.75} />,
                    style: "bg-emerald-500 text-white hover:bg-emerald-400",
                    action: () => { },
                };
            default:
                return {
                    label: "Connect",
                    icon: <UserPlus className="h-4 w-4" strokeWidth={1.75} />,
                    style: "bg-foreground text-background hover:opacity-80",
                    action: () => sendRequest.mutate(),
                };
        }
    })();

    return (
        <motion.div
            key={displayUser.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex flex-1 flex-col overflow-hidden"
        >
            {/* Back button */}
            <div className="flex items-center gap-2 px-4 pt-4 pb-2">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                >
                    <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
                    Back to Search
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pb-8">
                {/* Cover Banner + Avatar */}
                <div className="relative mx-5 mt-2">
                    {/* Banner */}
                    <div
                        onClick={() => setShowEnlarged(true)}
                        className="group relative h-32 sm:h-36 w-full overflow-hidden rounded-2xl border border-white/10 cursor-pointer shadow-md transition-all hover:border-white/20"
                        title="Click to view enlarged profile banner and avatar"
                    >
                        {displayUser.bannerUrl ? (
                            <Image
                                src={displayUser.bannerUrl}
                                alt="banner"
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                priority
                            />
                        ) : (
                            <div
                                className="h-full w-full"
                                style={{
                                    background: `linear-gradient(135deg, ${ACCENT}55 0%, oklch(0.14 0.04 240) 100%)`,
                                }}
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                        {/* Enlarge Hint on Hover */}
                        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-medium text-white/90 opacity-0 group-hover:opacity-100 backdrop-blur-md border border-white/10 transition-opacity">
                            <Maximize2 className="h-3 w-3" />
                            <span>Enlarge</span>
                        </div>

                        {!isPublic && (
                            <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-medium text-white/90 backdrop-blur-md border border-white/10">
                                <Lock className="h-3 w-3" strokeWidth={1.75} />
                                Private
                            </span>
                        )}
                    </div>

                    {/* Avatar overlapping banner */}
                    <div className="relative -mt-10 ml-5 flex items-end justify-between">
                        <div
                            onClick={() => setShowEnlarged(true)}
                            className="group relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-main/90 via-main/20 to-main/90 p-[2.5px] shadow-xl cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                            title="Click to view enlarged avatar"
                        >
                            <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-background bg-surface-elevated flex items-center justify-center text-xl font-bold text-foreground">
                                {displayUser.avatarUrl ? (
                                    <Image
                                        src={displayUser.avatarUrl}
                                        alt={displayUser.displayName || displayUser.username}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    initials
                                )}
                            </div>
                            <div className="absolute inset-0 rounded-full bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Maximize2 className="h-4 w-4 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Name + username */}
                <div className="px-5 pt-3">
                    <h2 className="font-display text-[19px] font-semibold tracking-tight">
                        {displayUser.displayName}
                    </h2>
                    <p className="text-[13px] text-muted-foreground">@{displayUser.username}</p>
                </div>

                {isPublic ? (
                    <>
                        {/* Bio */}
                        {displayUser.bio && (
                            <p className="mx-5 mt-3 text-[13px] leading-relaxed text-foreground/80">
                                {displayUser.bio}
                            </p>
                        )}

                        {/* Meta */}
                        <div className="mx-5 mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                            <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                                <MapPin className="h-3 w-3" strokeWidth={1.75} />
                                Worldwide
                            </span>
                            <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                                <Globe className="h-3 w-3" strokeWidth={1.75} />
                                vyra.space
                            </span>
                        </div>

                        {/* Tags */}
                        {tags.length > 0 && (
                            <div className="mx-5 mt-4">
                                <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                                    Interests
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-medium text-foreground/80"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="mx-5 mt-6 flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface py-8 text-center">
                        <Lock className="h-8 w-8 text-muted-foreground" strokeWidth={1.25} />
                        <p className="text-[14px] font-medium">This profile is private</p>
                        <p className="text-[12px] text-muted-foreground">
                            Connect to see their details
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="mx-5 mt-5 flex gap-2">
                    <button
                        onClick={connectBtn.action}
                        disabled={sendRequest.isPending || relLoading}
                        className={cn(
                            "flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-[13px] font-medium transition-colors disabled:opacity-60 cursor-pointer",
                            connectBtn.style
                        )}
                    >
                        {connectBtn.icon}
                        {sendRequest.isPending ? "Sending..." : connectBtn.label}
                    </button>
                    <button
                        onClick={() => onMessage?.(displayUser as UserProfile)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border bg-surface py-2.5 text-[13px] font-medium text-foreground transition-colors hover:bg-surface-elevated cursor-pointer"
                    >
                        <Send className="h-4 w-4" strokeWidth={1.75} />
                        Message
                    </button>
                </div>
            </div>

            {/* Enlarged Modal View */}
            {showEnlarged && (
                <ShowProfileModal
                    open={showEnlarged}
                    onClose={() => setShowEnlarged(false)}
                    displayName={displayUser.displayName}
                    username={displayUser.username}
                    avatarUrl={displayUser.avatarUrl}
                    bannerUrl={displayUser.bannerUrl}
                    bio={displayUser.bio}
                />
            )}
        </motion.div>
    );
}