"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { X, CheckCircle2, Pin, PinOff, Image as ImageIcon, Sparkles, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    useRelationship,
    useIncomingRequests,
    useOutgoingRequests,
    useSendFriendRequest,
    useCancelFriendRequest,
    useAcceptFriendRequest,
} from "@/tanstack/queries/friend.query";
import ShowProfileModal from "../modal/show-profile.modal";
import ShareProfileButton from "./share-profile";
import ConnectionActionButton from "./connection-action-button";
import { useConversations, useTogglePinConversation } from "@/tanstack/queries/conversation.query";
import { useInfiniteMessages } from "@/tanstack/queries/message.query";
import { ConversationService } from "@/services/conversation.service";
import { isConversationPinned, getMyUserId } from "./chat-list";
import ElasticStack, { ElasticStackItem } from "../ui/elastic-stack";


type UserProfileProps = {
    user: {
        id: string;
        displayName: string;
        username: string;
        avatarUrl?: string;
        bannerUrl?: string;
        isOnline?: boolean;
        bio?: string;
    } | null;
    conversationId?: string | null;
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

const TYPE_CONFIGS: Record<string, { label: string; badgeClass: string }> = {
    MUSIC: { label: "Music", badgeClass: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    MOVIE: { label: "Movie", badgeClass: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    TV: { label: "TV Show", badgeClass: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
    BOOK: { label: "Book", badgeClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    GAME: { label: "Game", badgeClass: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
    GITHUB: { label: "GitHub", badgeClass: "text-pink-400 bg-pink-500/10 border-pink-500/20" },
    AI_MODEL: { label: "AI Model", badgeClass: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
    PHOTO: { label: "Photo", badgeClass: "text-teal-400 bg-teal-500/10 border-teal-500/20" },
};

const STACK_FRIENDS = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=80&auto=format&fit=crop"
];

const DUMMY_FRIENDS_STACK: ElasticStackItem[] = [
    {
        id: "friend-1",
        name: "Elena Rostova",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop",
    },
    {
        id: "friend-2",
        name: "Marcus Vance",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop",
    },
    {
        id: "friend-3",
        name: "Aria Chen",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=120&auto=format&fit=crop",
    },
    {
        id: "friend-4",
        name: "Lucas Grey",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=120&auto=format&fit=crop",
    },
];

const STACK_GROUPS = [
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=80&auto=format&fit=crop"
];

export default function UserProfile({ user, conversationId, onClose, onMessageClick }: UserProfileProps) {
    const [isBioExpanded, setIsBioExpanded] = useState(false);
    const [openProfile, setOpenProfile] = useState(false);
    const [galleryTab, setGalleryTab] = useState<"media" | "context">("media");

    const { data: conversations } = useConversations();
    const togglePin = useTogglePinConversation();
    const myId = getMyUserId();
    const directConv = conversations?.find((c) => c.participants.some((p) => p.userId === user?.id));
    const targetConvId = conversationId || directConv?.id;
    const { data: messagesData } = useInfiniteMessages(targetConvId ?? null);

    const contextItems = useMemo(() => {
        const list: {
            id: string;
            title: string;
            subtitle: string;
            image?: string;
            type: string;
            badge: string;
            badgeClass: string;
            url?: string;
            metadata?: Record<string, any>;
        }[] = [];
        const seen = new Set<string>();

        const allMsgs: any[] = [];
        if (messagesData?.pages) {
            for (const page of messagesData.pages) {
                if (Array.isArray(page)) {
                    allMsgs.push(...page);
                }
            }
        }
        if (directConv?.messages) {
            allMsgs.push(...directConv.messages);
        }

        for (const msg of allMsgs) {
            if (!msg?.content || msg.deletedAt) continue;

            let richObj: any = null;
            try {
                if (typeof msg.content === "string" && msg.content.includes('"vyraObjectType":"RICH_CARD"')) {
                    const parsed = JSON.parse(msg.content);
                    if (parsed?.vyraObjectType === "RICH_CARD" && parsed?.richObject) {
                        richObj = parsed.richObject;
                    }
                } else if (typeof msg.content === "object" && msg.content?.vyraObjectType === "RICH_CARD") {
                    richObj = msg.content.richObject;
                }
            } catch {
                // Ignore non-JSON messages
            }

            if (richObj) {
                const dedupeKey = richObj.id || `${richObj.type}-${richObj.title}-${richObj.subtitle}`;
                if (!seen.has(dedupeKey)) {
                    seen.add(dedupeKey);
                    const config = TYPE_CONFIGS[richObj.type] || {
                        label: richObj.type ? richObj.type.replace(/_/g, " ") : "Context",
                        badgeClass: "text-amber-400 bg-amber-500/10 border-amber-500/20",
                    };
                    const image = richObj.image || richObj.imageUrl || richObj.metadata?.poster || richObj.metadata?.coverUrl || richObj.metadata?.artwork;
                    const url = richObj.metadata?.url || richObj.metadata?.link || richObj.metadata?.html_url || richObj.metadata?.preview || richObj.actions?.open_url || richObj.actions?.url;

                    list.push({
                        id: richObj.id || msg.id,
                        title: richObj.title || "Untitled",
                        subtitle: richObj.subtitle || "",
                        image,
                        type: richObj.type || "CONTEXT",
                        badge: config.label,
                        badgeClass: config.badgeClass,
                        url,
                        metadata: richObj.metadata,
                    });
                }
            }
        }

        return list;
    }, [messagesData, directConv?.messages]);

    const isDirectPinned = Boolean(
        directConv && isConversationPinned(directConv, myId)
    );


    // ── Relationship ─────────────────────────────────────────────────────────
    // Use the centralized hooks so all components share the same cache shape
    const { data: relationship } = useRelationship(user?.id);
    const rel = relationship ?? "NONE";

    const { data: incomingRequests } = useIncomingRequests();
    const { data: outgoingRequests } = useOutgoingRequests();

    // Find the relevant request id for the current user
    const incomingReq = incomingRequests?.find((r) => r.sender.id === user?.id);
    const outgoingReq = outgoingRequests?.find((r) => r.receiver.id === user?.id);

    const sendRequest = useSendFriendRequest(user?.id ?? "");
    const cancelRequest = useCancelFriendRequest(outgoingReq?.id);
    const acceptRequest = useAcceptFriendRequest();

    const isMutating = sendRequest.isPending || cancelRequest.isPending || acceptRequest.isPending;

    if (!user) return null;

    const initials = user.displayName
        ? user.displayName.trim().split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
        : user.username.slice(0, 2).toUpperCase();

    const defaultBio = user.bio || "No bio yet.";
    const hasLongBio = defaultBio.length > 75;
    const displayBio = isBioExpanded || !hasLongBio ? defaultBio : defaultBio.slice(0, 75) + "...";

    return (
        <div className="h-full w-full overflow-hidden bg-background">
            <div className="flex h-full w-full flex-col bg-background font-geist overflow-y-auto">
                {/* Top Navigation Overlay */}
                <ShowProfileModal open={openProfile} onClose={() => setOpenProfile(false)}
                    displayName={user.displayName}
                    username={user.username}
                    avatarUrl={user.avatarUrl}
                    bannerUrl={user.bannerUrl}
                    bio={user.bio}
                />
                <div className="sticky top-0 z-30 flex items-center justify-between px-6 pt-3 pb-3 bg-gradient-to-b from-background via-background/80 to-transparent">
                    <span className="text-lg font-semibold text-foreground">User Profile</span>
                    <button
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-surface-elevated/75 backdrop-blur transition hover:bg-surface hover:border-white/20 active:scale-95 cursor-pointer"
                        aria-label="Close Profile"
                    >
                        <X className="h-4 w-4 text-foreground" />
                    </button>
                </div>

                <div className="relative px-1 -mt-14">
                    <div className="">
                        <div 
                            onClick={() => setOpenProfile(true)}
                            className="relative aspect-video overflow-hidden rounded-2xl border border-white/5 shadow-lg cursor-pointer group"
                            title="Click to view enlarged profile banner"
                        >
                            <Image
                                src={user.bannerUrl || "/bg1.jpeg"}
                                alt="banner"
                                fill
                                className="object-cover transition duration-500 group-hover:scale-105"
                            />
                        </div>
                    </div>


                    <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/3 z-25 flex flex-col items-center">
                        <div className="relative flex h-[180px] w-[180px] items-center justify-center rounded-full bg-gradient-to-tr from-cyan-400 via-pink-500 to-indigo-500 p-[2px] shadow-elevation-3">
                            <div 
                                onClick={() => setOpenProfile(true)}
                                className="relative h-full w-full overflow-hidden rounded-full border-2 border-[#0A0A0A] bg-surface-elevated cursor-pointer group/avatar"
                                title="Click to view enlarged avatar"
                            >
                                {user.avatarUrl ? (
                                    <Image
                                        src={user.avatarUrl}
                                        alt={user.displayName}
                                        fill
                                        className="object-cover transition duration-300 group-hover/avatar:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-xl font-bold text-foreground">
                                        {initials}
                                    </div>
                                )}
                            </div>

                            {/* Floating Golden Push-Pin on Avatar when Pinned (Click to Unpin) */}
                            {isDirectPinned && (
                                <button
                                    type="button"
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        if (directConv?.id) {
                                            await togglePin.mutateAsync(directConv.id);
                                        }
                                    }}
                                    className="group/pin absolute top-1.5 right-1.5 z-30 flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] border-amber-300 hover:border-red-400 shadow-[0_4px_16px_rgba(245,158,11,0.55),inset_0_1px_2px_rgba(255,255,255,0.5)] hover:shadow-[0_4px_16px_rgba(239,68,68,0.55)] transition-all duration-200 animate-in zoom-in-50 hover:scale-115 active:scale-95 cursor-pointer"
                                    style={{
                                        background: "radial-gradient(circle at 35% 35%, #fbbf24 0%, #b45309 100%)",
                                    }}
                                    title="Pinned Chat (Click to unpin)"
                                >
                                    <Pin size={15} className="fill-white text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] -rotate-45 group-hover/pin:hidden transition-transform" />
                                    <PinOff size={15} className="hidden group-hover/pin:block text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] transition-transform" />
                                </button>
                            )}
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

                    {/* Interactive Pinned Pill with Unpin Option */}
                    {/* {isDirectPinned && (
                        <button
                            type="button"
                            onClick={async () => {
                                if (directConv?.id) {
                                    await togglePin.mutateAsync(directConv.id);
                                }
                            }}
                            className="group/pill inline-flex items-center gap-1.5 px-3 py-1 mt-2.5 rounded-full border border-amber-500/40 hover:border-red-400/50 text-amber-300 hover:text-red-300 text-[11px] font-semibold tracking-wide shadow-[0_0_16px_rgba(245,158,11,0.25),inset_0_1px_1.5px_rgba(255,255,255,0.25)] hover:shadow-[0_0_16px_rgba(239,68,68,0.3)] transition-all duration-200 cursor-pointer animate-in fade-in zoom-in-75"
                            style={{
                                background: "radial-gradient(circle at 35% 35%, rgba(245, 158, 11, 0.25) 0%, rgba(18, 14, 8, 0.95) 100%)",
                            }}
                            title="Click to unpin conversation"
                        >
                            <Pin size={11} className="fill-amber-400 text-amber-400 -rotate-45 group-hover/pill:hidden" />
                            <PinOff size={11} className="hidden group-hover/pill:inline text-red-400" />
                            <span className="group-hover/pill:hidden">Pinned Conversation</span>
                            <span className="hidden group-hover/pill:inline">Unpin Conversation</span>
                        </button>
                    )} */}

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
                        {hasLongBio && (
                            <button
                                onClick={() => setIsBioExpanded(!isBioExpanded)}
                                className="text-[#c97955] font-semibold hover:underline focus:outline-none animate-fade-in"
                            >
                                {isBioExpanded ? "Less" : "More"}
                            </button>
                        )}
                    </p>
                </div>

                {/* Action Buttons Row */}
                <div className="flex items-center justify-center gap-4 px-6 mt-7">
                    <ShareProfileButton
                        username={user?.username}
                        displayName={user?.displayName}
                        isPinned={isDirectPinned}
                        onShare={async (platform) => {
                            if (platform === "pin") {
                                let targetConvId = directConv?.id;
                                if (!targetConvId && user?.id) {
                                    try {
                                        const res = await ConversationService.createDirectConversation(user.id);
                                        targetConvId = res.data?.id;
                                    } catch (err) {
                                        console.error("Failed to create direct conversation for pin", err);
                                    }
                                }
                                if (targetConvId) {
                                    await togglePin.mutateAsync(targetConvId);
                                }
                            }
                        }}
                    />

                    <button
                        onClick={onMessageClick}
                        className="flex h-[46px] px-8 items-center justify-center rounded-full font-semibold text-sm transition-all duration-200 text-white bg-[#c97955] hover:brightness-105 hover:scale-[1.02] active:scale-98 cursor-pointer border border-white/20 shadow-[0_4px_16px_rgba(201,121,85,0.35),inset_0_1px_1.5px_rgba(255,255,255,0.3)] outline-none"
                    >
                        Message
                    </button>

                    <ConnectionActionButton
                        status={rel}
                        isMutating={isMutating}
                        onCancel={() => cancelRequest.mutate()}
                        onAccept={() => incomingReq && acceptRequest.mutate(incomingReq.id)}
                        onSend={() => sendRequest.mutate()}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 px-2 mt-8">
                    {/* Friends Flow */}
                    <div className="flex flex-col gap-2 rounded-2xl border border-white/5 bg-surface-elevated/40 p-4 overflow-visible">

                        <div className="flex items-center justify-center overflow-visible pt-1 pb-0.5">
                            <ElasticStack
                                items={DUMMY_FRIENDS_STACK}
                                itemSize={44}
                                overlap={12}
                                pushForce={7}
                                scaleOnHover={1.1}
                                className="py-0 justify-center"
                                tooltipClassName="text-[10px] px-2 py-0.5 -top-6 bg-black/90 border-white/20"
                                itemClassName="border-[1.5px] border-black/80 shadow-md ring-1 ring-white/15"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-muted-foreground">Connections</span>
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

                {/* Gallery Tabs (Media Gallery vs Context Gallery) */}
                <div className="px-6 py-6 mt-2">
                    <div className="flex rounded-xl bg-surface-elevated/60 p-1 border border-white/5 mb-4">
                        <button
                            type="button"
                            onClick={() => setGalleryTab("media")}
                            className={cn(
                                "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold tracking-wide transition-all cursor-pointer",
                                galleryTab === "media"
                                    ? "bg-surface-elevated text-foreground shadow-sm border border-white/10"
                                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                            )}
                        >
                            <ImageIcon className="h-3.5 w-3.5" />
                            <span>Media Gallery</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setGalleryTab("context")}
                            className={cn(
                                "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold tracking-wide transition-all cursor-pointer",
                                galleryTab === "context"
                                    ? "bg-surface-elevated text-foreground shadow-sm border border-white/10"
                                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                            )}
                        >
                            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                            <span>Context Gallery</span>
                            {contextItems.length > 0 && (
                                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                                    {contextItems.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {galleryTab === "media" ? (
                        <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-200">
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
                    ) : contextItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                            <p className="text-xs text-muted-foreground/40 font-medium">No context shared yet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-200">
                            {contextItems.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => {
                                        if (item.url && typeof window !== "undefined") {
                                            window.open(item.url, "_blank", "noopener,noreferrer");
                                        }
                                    }}
                                    className={cn(
                                        "group relative flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-surface-elevated/40 p-2.5 transition duration-300 hover:border-white/15 hover:bg-surface-elevated/70",
                                        item.url ? "cursor-pointer" : "cursor-default"
                                    )}
                                >
                                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-surface-elevated/60">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                                onError={(e) => {
                                                    (e.currentTarget as HTMLElement).style.display = "none";
                                                }}
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-muted-foreground/30">
                                                <Sparkles className="h-6 w-6" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                                        <span className={cn(
                                            "absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[9px] font-semibold border backdrop-blur-md",
                                            item.badgeClass
                                        )}>
                                            {item.badge}
                                        </span>
                                        {item.url && (
                                            <span className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white/70 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ExternalLink className="h-2.5 w-2.5" />
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-2 min-w-0">
                                        <p className="truncate text-xs font-bold text-foreground">
                                            {item.title}
                                        </p>
                                        {item.subtitle && (
                                            <p className="truncate text-[10px] text-muted-foreground mt-0.5">
                                                {item.subtitle}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
