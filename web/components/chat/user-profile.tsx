"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, Share2, UserPlus, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";


type UserProfileProps = {
    user: {
        displayName: string;
        username: string;
        avatarUrl?: string | null;
        isOnline?: boolean;
        bio?: string;
    } | null;
    onClose: () => void;
    onMessageClick?: () => void;
};


const GALLERY = [
    "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=400&auto=format&fit=crop"
];

const STACK_FRIENDS = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=80&auto=format&fit=crop"
];

const STACK_GROUPS = [
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=80&auto=format&fit=crop"
];

export default function UserProfile({ user, onClose, onMessageClick }: UserProfileProps) {
    const [isBioExpanded, setIsBioExpanded] = useState(false);

    if (!user) return null;

    const initials = user.displayName
        ? user.displayName.trim().split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
        : user.username.slice(0, 2).toUpperCase();

    const defaultBio = user.bio || "I'm a generous and helpful girl, hope my enthusiasm adds more color to your life. Welcome to my space!";
    const displayBio = isBioExpanded ? defaultBio : defaultBio.slice(0, 75) + "...";

    return (
        <div className="h-full w-full bg-background">
            <div className="flex h-full w-full flex-col bg-background font-geist overflow-y-auto border-border lg:border-l">
                {/* Top Navigation Overlay */}
                <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-background via-background/80 to-transparent">
                    <button
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-surface-elevated/75 backdrop-blur transition hover:bg-surface hover:border-white/20 active:scale-95"
                        aria-label="Close Profile"
                    >
                        <X className="h-4 w-4 text-foreground" />
                    </button>
                    <span className="text-sm font-semibold text-foreground">User Profile</span>
                    <div className="w-9" /> {/* spacer */}
                </div>

                {/* Highlights Collage Section */}
                <div className="relative px-6 pt-2">
                    <div className="">
                        <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/5 shadow-lg">
                            <Image
                                src="/bg1.jpeg"
                                alt="banner"
                                fill
                                className="object-cover transition duration-500 group-hover:scale-105"
                            />
                        </div>
                    </div>

                    {/* Overlapping Floating Avatar in Neon Ring */}
                    <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 z-25 flex flex-col items-center">
                        <div className="relative flex h-[104px] w-[104px] items-center justify-center rounded-full bg-gradient-to-tr from-cyan-400 via-pink-500 to-indigo-500 p-[3px] shadow-elevation-3">
                            <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-[#0A0A0A] bg-surface-elevated">
                                {user.avatarUrl ? (
                                    <Image
                                        src={user.avatarUrl}
                                        alt={user.displayName}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-xl font-bold text-foreground">
                                        {initials}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* User Details & Metadata (Offset for avatar height) */}
                <div className="flex flex-col items-center px-6 pt-16 text-center">
                    <div className="flex items-center gap-1.5 justify-center">
                        <h2 className="text-xl font-bold text-foreground leading-snug">
                            {user.displayName}
                        </h2>
                        <CheckCircle2 className="h-4 w-4 fill-blue-500 text-[#0a0a0a]" />
                    </div>

                    {/* Online Status */}
                    <div className="mt-1.5 flex items-center gap-1.5 justify-center">
                        <span className={cn(
                            "h-2 w-2 rounded-full",
                            user.isOnline ? "bg-emerald-500 animate-pulse" : "bg-neutral-500"
                        )} />
                        <span className="text-xs font-semibold text-muted-foreground">
                            {user.isOnline ? "Online" : "Offline"}
                        </span>
                    </div>

                    {/* Expandable Bio */}
                    <p className="mt-4 text-xs font-medium text-[#d1cec2] leading-relaxed max-w-xs">
                        {displayBio}{" "}
                        <button
                            onClick={() => setIsBioExpanded(!isBioExpanded)}
                            className="text-[#c97955] font-semibold hover:underline focus:outline-none"
                        >
                            {isBioExpanded ? "Less" : "More"}
                        </button>
                    </p>
                </div>

                {/* Action Buttons Row */}
                <div className="flex items-center justify-center gap-3 px-6 mt-6">
                    <button
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-surface-elevated hover:bg-surface hover:border-white/20 active:scale-95 transition-all text-foreground"
                        title="Share Profile"
                    >
                        <Share2 className="h-4 w-4" />
                    </button>

                    <button
                        onClick={onMessageClick}
                        className="flex h-11 px-8 items-center justify-center rounded-full font-semibold text-sm hover:opacity-90 active:scale-98 transition shadow-lg text-white bg-[#c97955] cursor-pointer"
                    >
                        Message
                    </button>

                    <button
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-surface-elevated hover:bg-surface hover:border-white/20 active:scale-95 transition-all text-foreground"
                        title="Add Connection"
                    >
                        <UserPlus className="h-4 w-4" />
                    </button>
                </div>

                {/* Friends and Groups Info Stack */}
                <div className="grid grid-cols-2 gap-4 px-6 mt-7">
                    {/* Friends Flow */}
                    <div className="flex flex-col gap-2 rounded-2xl border border-white/5 bg-surface-elevated/40 p-4">
                        <span className="text-[11px] font-semibold text-muted-foreground">Friends Flow</span>
                        <div className="flex items-center gap-1.5">
                            <div className="flex -space-x-2.5 overflow-hidden">
                                {STACK_FRIENDS.map((src, i) => (
                                    <div key={i} className="relative h-6 w-6 rounded-full border border-[#0a0a0a] overflow-hidden">
                                        <Image src={src} fill alt="friend avatar" className="object-cover" />
                                    </div>
                                ))}
                            </div>
                            <span className="text-xs font-bold text-foreground bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                                +123
                            </span>
                        </div>
                    </div>

                    {/* Mutual Groups */}
                    <div className="flex flex-col gap-2 rounded-2xl border border-white/5 bg-surface-elevated/40 p-4">
                        <span className="text-[11px] font-semibold text-muted-foreground">Mutual Groups</span>
                        <div className="flex items-center gap-1.5">
                            <div className="flex -space-x-2.5 overflow-hidden">
                                {STACK_GROUPS.map((src, i) => (
                                    <div key={i} className="relative h-6 w-6 rounded-full border border-[#0a0a0a] overflow-hidden">
                                        <Image src={src} fill alt="group avatar" className="object-cover" />
                                    </div>
                                ))}
                            </div>
                            <span className="text-xs font-bold text-foreground bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                                +12
                            </span>
                        </div>
                    </div>
                </div>

                {/* Media Gallery Masonry Grid */}
                <div className="px-6 py-6 mt-2">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Media Gallery</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {/* Left Column */}
                        <div className="flex flex-col gap-3">
                            <div className="group relative aspect-[3/4.2] overflow-hidden rounded-2xl border border-white/5">
                                <Image
                                    src={GALLERY[0]}
                                    fill
                                    alt="Gallery 1"
                                    className="object-cover transition duration-300 group-hover:scale-105"
                                />
                            </div>
                            <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/5">
                                <Image
                                    src={GALLERY[1]}
                                    fill
                                    alt="Gallery 2"
                                    className="object-cover transition duration-300 group-hover:scale-105"
                                />
                            </div>
                            <div className="group relative aspect-square overflow-hidden rounded-2xl border border-white/5">
                                <Image
                                    src={GALLERY[4]}
                                    fill
                                    alt="Gallery 5"
                                    className="object-cover transition duration-300 group-hover:scale-105"
                                />
                            </div>
                        </div>
                        {/* Right Column */}
                        <div className="flex flex-col gap-3">
                            <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/5">
                                <Image
                                    src={GALLERY[2]}
                                    fill
                                    alt="Gallery 3"
                                    className="object-cover transition duration-300 group-hover:scale-105"
                                />
                            </div>
                            <div className="group relative aspect-[3/4.2] overflow-hidden rounded-2xl border border-white/5">
                                <Image
                                    src={GALLERY[3]}
                                    fill
                                    alt="Gallery 4"
                                    className="object-cover transition duration-300 group-hover:scale-105"
                                />
                            </div>
                            <div className="group relative aspect-[3/4.5] overflow-hidden rounded-2xl border border-white/5">
                                <Image
                                    src={GALLERY[5]}
                                    fill
                                    alt="Gallery 6"
                                    className="object-cover transition duration-300 group-hover:scale-105"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
