"use client";

import { useProfile } from "@/tanstack/queries/user.query";
import {
    useRelationship,
    useSendFriendRequest,
    useCancelFriendRequest,
} from "@/tanstack/queries/friend.query";
import { ChevronLeft, Globe, Lock, MapPin, Send, UserCheck, UserMinus, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { UserProfile } from "@/types/user.type";

const ACCENT = "oklch(0.65 0.18 280)";

const tags = ["AI", "Space", "Technology", "Startups"];

export default function UserCard({
    username,
    onBack,
    onMessage,
}: {
    username: string;
    onBack: () => void;
    onMessage?: (user: UserProfile) => void;
}) {
    const { data: profile, isLoading, error } = useProfile(username);

    // Relationship + mutations (only active once profile.id is available)
    const { data: relationship, isLoading: relLoading } = useRelationship(profile?.id);

    const sendRequest = useSendFriendRequest(profile?.id ?? "");
    const cancelRequest = useCancelFriendRequest(
        relationship === "PENDING_SENT"
            ? undefined // we'd need the requestId; see note below
            : undefined
    );

    if (isLoading) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center p-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-foreground" />
                <p className="mt-2 text-xs text-muted-foreground">Loading profile...</p>
            </div>
        );
    }

    if (error || !profile) {
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

    const initials = profile.displayName
        ? profile.displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
        : profile.username.slice(0, 2).toUpperCase();

    const isPublic =
        profile.profileVisibility === "PUBLIC" ||
        profile.profileVisibility === "FRIENDS_ONLY";

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
                    action: () => { }, // cancel needs requestId from outgoing list
                };
            case "PENDING_RECEIVED":
                return {
                    label: "Accept",
                    icon: <UserPlus className="h-4 w-4" strokeWidth={1.75} />,
                    style: "bg-emerald-500 text-white hover:bg-emerald-400",
                    action: () => { }, // accept needs requestId from incoming list
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
            key={profile.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex flex-1 flex-col overflow-hidden"
        >
            {/* Back button */}
            <div className="flex items-center gap-2 px-4 pt-4 pb-2">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
                    Back to Search
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pb-8">
                {/* Cover + avatar */}
                <div
                    className="relative mx-5 mt-2 flex h-28 items-end rounded-2xl p-4"
                    style={{
                        background: `linear-gradient(135deg, ${ACCENT}55 0%, oklch(0.14 0.04 240) 100%)`,
                        border: "1px solid oklch(0.25 0.04 240)",
                    }}
                >
                    <div
                        className="flex h-16 w-16 items-center justify-center rounded-full text-[22px] font-semibold text-white bg-white/5 backdrop-blur-sm border border-white/20"
                    >
                        {initials}
                    </div>
                    {!isPublic && (
                        <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                            <Lock className="h-3 w-3" strokeWidth={1.75} />
                            Private
                        </span>
                    )}
                </div>

                {/* Name + username */}
                <div className="px-5 pt-4">
                    <h2 className="font-display text-[19px] font-semibold tracking-tight">
                        {profile.displayName}
                    </h2>
                    <p className="text-[13px] text-muted-foreground">@{profile.username}</p>
                </div>

                {isPublic ? (
                    <>
                        {/* Bio */}
                        {profile.bio && (
                            <p className="mx-5 mt-3 text-[13px] leading-relaxed text-foreground/80">
                                {profile.bio}
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
                            "flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-[13px] font-medium transition-colors disabled:opacity-60",
                            connectBtn.style
                        )}
                    >
                        {connectBtn.icon}
                        {sendRequest.isPending ? "Sending..." : connectBtn.label}
                    </button>
                    <button
                        onClick={() => onMessage?.(profile)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border bg-surface py-2.5 text-[13px] font-medium text-foreground transition-colors hover:bg-surface-elevated"
                    >
                        <Send className="h-4 w-4" strokeWidth={1.75} />
                        Message
                    </button>
                </div>
            </div>
        </motion.div>
    );
}