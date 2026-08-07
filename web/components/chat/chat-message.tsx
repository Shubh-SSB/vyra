import { useState, memo, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Message } from "@/types/message";
import {
    Check, CheckCheck, Plus, SmilePlus, CornerUpLeft,
    ChevronDown, Pencil, Trash2, EyeOff, Trash, AlertTriangle, Bookmark, Forward, MousePointerClick,
    Paperclip, Pin, PinOff
} from "lucide-react";
import { SaveToCollectionModal } from "./save-to-collection-modal";
import VoicePlayer from "./voice-player";
import MediaLightbox from "./media-lightbox";
import ConfirmModal, { ConfirmAction } from "./confirm-modal";
import PinDurationModal from "./pin-duration-modal";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
    try {
        return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
        return "";
    }
}

const REACTION_EMOJIS: Record<string, string> = {
    LIKE: "👍",
    LOVE: "❤️",
    LAUGH: "😂",
    WOW: "😮",
    SAD: "😢",
    ANGRY: "😡",
};

const CUSTOM_EMOJIS = ["🔥", "🎉", "👏", "🚀", "💡", "💯", "👀", "🌟", "🎈", "✨", "🙌", "🤝"];

// ─── Confirmation Modal Action Type ──────────────────────────────────────────

// (ConfirmModal and PinDurationModal have been moved to separate files)

// ─── Position-aware Portal Dropdown ──────────────────────────────────────────

type MenuPosition = { top: number; left: number };

function ContextMenu({
    open,
    anchorRef,
    onClose,
    isOwn,
    children,
}: {
    open: boolean;
    anchorRef: React.RefObject<HTMLButtonElement | null>;
    onClose: () => void;
    isOwn: boolean;
    children: React.ReactNode;
}) {
    const menuRef = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState<MenuPosition | null>(null);

    // Calculate position dynamically after render
    useEffect(() => {
        if (!open || !anchorRef.current) {
            setPos(null);
            return;
        }

        const updatePosition = () => {
            if (!anchorRef.current) return;
            const MENU_W = 192;
            const GAP = 6;
            const EDGE_PAD = 10;

            const rect = anchorRef.current.getBoundingClientRect();
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            // Get exact height of the menu element if mounted, or fallback to 280
            const actualHeight = menuRef.current ? menuRef.current.offsetHeight : 280;

            // Horizontal alignment: expand left for own messages, expand right for others
            let left = isOwn ? (rect.right - MENU_W) : rect.left;
            if (left < EDGE_PAD) left = EDGE_PAD;
            if (left + MENU_W > vw - EDGE_PAD) left = vw - MENU_W - EDGE_PAD;

            // Vertical alignment: flip above if it overflows the bottom
            let top = rect.bottom + GAP;
            if (top + actualHeight > vh - EDGE_PAD) {
                top = rect.top - actualHeight - GAP;
            }
            if (top < EDGE_PAD) top = EDGE_PAD;

            setPos({ top, left });
        };

        // Run update position in next animation frame to let DOM paint first
        const frameId = requestAnimationFrame(updatePosition);
        return () => cancelAnimationFrame(frameId);
    }, [open, anchorRef, isOwn, children]);

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open, onClose]);

    if (typeof window === "undefined") return null;

    return createPortal(
        <AnimatePresence>
            {open && (
                <>
                    {/* Invisible full-screen close trap */}
                    <div className="fixed inset-0 z-[998]" onClick={onClose} />

                    <motion.div
                        ref={menuRef}
                        key="ctx-menu"
                        initial={{ opacity: 0, scale: 0.9, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -4 }}
                        transition={{ duration: 0.13, ease: [0.23, 1, 0.32, 1] }}
                        style={{
                            top: pos ? pos.top : -9999,
                            left: pos ? pos.left : -9999,
                            width: 192,
                            visibility: pos ? "visible" : "hidden",
                        }}
                        className="fixed z-[999] rounded-xl border border-white/10 bg-[#1c1c1f]/95 shadow-2xl py-1 backdrop-blur-xl overflow-hidden"
                    >
                        {children}
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body,
    );
}

// ─── Menu Item ────────────────────────────────────────────────────────────────

function MenuItem({
    icon,
    label,
    onClick,
    variant = "default",
}: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    variant?: "default" | "danger" | "soft-danger";
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex w-full items-center gap-2.5 px-3 py-2 text-[13px] font-medium transition-colors duration-100 cursor-pointer",
                variant === "danger" && "text-red-400 hover:bg-red-500/10",
                variant === "soft-danger" && "text-red-400/70 hover:bg-red-500/8",
                variant === "default" && "text-muted-foreground hover:bg-white/5 hover:text-foreground",
            )}
        >
            <span className="shrink-0 opacity-80">{icon}</span>
            {label}
        </button>
    );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

function MenuDivider() {
    return <div className="my-1 h-px bg-white/[0.06] mx-2" />;
}

// ─── Rich Card Bubble ──────────────────────────────────────────────────────────

function RichCardBubble({ richObject, isOwn, socket, conversationId }: { richObject: any; isOwn: boolean; socket?: any; conversationId?: string }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isLoadingStream, setIsLoadingStream] = useState(false);

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!richObject.metadata?.preview) return;

        if (isPlaying) {
            audioRef.current?.pause();
            setIsPlaying(false);
        } else {
            if (audioRef.current) {
                audioRef.current.pause();
            }
            audioRef.current = new Audio(richObject.metadata.preview);
            audioRef.current.play().catch(err => console.warn("Audio preview autoplay blocked:", err));
            setIsPlaying(true);
            audioRef.current.onended = () => {
                setIsPlaying(false);
            };
        }
    };

    const handleListenTogether = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!socket || !conversationId) return;
        if (isLoadingStream) return;

        setIsLoadingStream(true);
        try {
            // Dynamically import to avoid circular deps
            const { ExploreService } = await import("@/services/explore.service");
            const streamUrl = await ExploreService.getFullStream(
                richObject.title || "",
                richObject.subtitle || ""
            );

            // Emit sync request to the other user
            socket.emit("musicSyncRequest", {
                conversationId,
                trackId: richObject.id || `${richObject.title}-${richObject.subtitle}`,
                title: richObject.title || "Unknown",
                artist: richObject.subtitle || "Unknown",
                coverUrl: richObject.image || "",
                streamUrl: streamUrl || richObject.metadata?.preview || "",
            });

            // Dispatch custom event so the chat page picks it up and opens our own player
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("vyra:listenTogether:host", {
                    detail: {
                        conversationId,
                        title: richObject.title || "Unknown",
                        artist: richObject.subtitle || "Unknown",
                        coverUrl: richObject.image || "",
                        streamUrl: streamUrl || richObject.metadata?.preview || "",
                    },
                }));
            }
        } catch (err) {
            console.warn("[RichCardBubble] Failed to start listen together:", err);
        } finally {
            setIsLoadingStream(false);
        }
    };

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, []);

    const typeConfigs: Record<string, { label: string; icon: string; badgeClass: string }> = {
        MUSIC: { label: "Music", icon: "🎵", badgeClass: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
        MOVIE: { label: "Movie", icon: "🎬", badgeClass: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
        TV: { label: "TV Show", icon: "📺", badgeClass: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
        BOOK: { label: "Book", icon: "📚", badgeClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
        GAME: { label: "Game", icon: "🎮", badgeClass: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
        GITHUB: { label: "GitHub Repo", icon: "💻", badgeClass: "text-pink-400 bg-pink-500/10 border-pink-500/20" },
        AI_MODEL: { label: "AI Model", icon: "🤖", badgeClass: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
        PHOTO: { label: "Photo / Image", icon: "📷", badgeClass: "text-teal-400 bg-teal-500/10 border-teal-500/20" },
    };

    const config = typeConfigs[richObject.type] || { label: "Explore Object", icon: "⚡", badgeClass: "text-muted-foreground bg-white/5 border-white/10" };

    return (
        <div className="w-full max-w-[280px] sm:max-w-[320px] rounded-2xl border border-white/10 bg-black/40 overflow-hidden shadow-lg backdrop-blur-md select-text text-left">
            {/* Backdrop Blur Poster Image */}
            {richObject.image && (
                <div className="relative h-44 w-full bg-black/40 overflow-hidden border-b border-white/[0.06] flex items-center justify-center">
                    <img 
                        src={richObject.image} 
                        alt={richObject.title} 
                        className="absolute inset-0 w-full h-full object-cover blur-md opacity-25 scale-110" 
                    />
                    <img 
                        src={richObject.image} 
                        alt={richObject.title} 
                        className="relative z-10 w-full h-full object-contain mx-auto" 
                    />
                </div>
            )}

            {/* Content Details */}
            <div className="p-4 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                    <span className={cn("px-2.5 py-0.5 text-[9px] font-bold rounded-full border uppercase tracking-wider", config.badgeClass)}>
                        {config.icon} {config.label}
                    </span>
                    
                    {richObject.metadata?.rating !== undefined && (
                        <span className="text-[10px] font-bold text-yellow-400">
                            ★ {richObject.metadata.rating.toFixed(1)}
                        </span>
                    )}
                    {richObject.metadata?.stars !== undefined && (
                        <span className="text-[10px] font-bold text-yellow-400">
                            ★ {richObject.metadata.stars} stars
                        </span>
                    )}
                    {richObject.metadata?.downloads !== undefined && (
                        <span className="text-[10px] font-medium text-cyan-400">
                            📥 {richObject.metadata.downloads.toLocaleString()}
                        </span>
                    )}
                </div>

                <div className="leading-tight">
                    <h4 className="text-sm font-bold text-foreground line-clamp-1">{richObject.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{richObject.subtitle}</p>
                </div>

                {richObject.metadata?.overview && (
                    <p className="text-[11px] text-muted-foreground/90 leading-normal line-clamp-3 bg-white/[0.02] border border-white/[0.04] p-2 rounded-xl">
                        {richObject.metadata.overview}
                    </p>
                )}
                {richObject.metadata?.description && (
                    <p className="text-[11px] text-muted-foreground/90 leading-normal line-clamp-3 bg-white/[0.02] border border-white/[0.04] p-2 rounded-xl">
                        {richObject.metadata.description}
                    </p>
                )}

                {(richObject.metadata?.album || richObject.metadata?.language || richObject.metadata?.platforms) && (
                    <div className="text-[10px] text-muted-foreground flex flex-wrap gap-x-2 gap-y-1 mt-1 opacity-70">
                        {richObject.metadata.album && <span>💿 {richObject.metadata.album}</span>}
                        {richObject.metadata.language && <span>🌐 {richObject.metadata.language}</span>}
                        {richObject.metadata.platforms && Array.isArray(richObject.metadata.platforms) && (
                            <span>🎮 {richObject.metadata.platforms.slice(0, 3).join(", ")}</span>
                        )}
                    </div>
                )}

                <div className="flex flex-col gap-2 mt-2 border-t border-white/[0.04] pt-3">
                    {richObject.type === "MUSIC" && richObject.metadata?.preview && (
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={togglePlay}
                                className={cn(
                                    "flex-1 h-8 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer",
                                    isPlaying 
                                        ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                                        : "bg-white/10 text-foreground hover:bg-white/15 border border-white/5"
                                )}
                            >
                                {isPlaying ? (
                                    <>
                                        <div className="flex items-end gap-0.5 h-2.5">
                                            <div className="w-0.5 bg-red-400 animate-[bounce_0.8s_infinite_100ms] h-full" />
                                            <div className="w-0.5 bg-red-400 animate-[bounce_0.8s_infinite_300ms] h-1/2" />
                                            <div className="w-0.5 bg-red-400 animate-[bounce_0.8s_infinite_200ms] h-3/4" />
                                        </div>
                                        Pause
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                        Preview
                                    </>
                                )}
                            </button>

                            {/* Listen Together button — only shown inside a chat with an active socket */}
                            {socket && conversationId && (
                                <button
                                    type="button"
                                    onClick={handleListenTogether}
                                    disabled={isLoadingStream}
                                    className={cn(
                                        "flex-1 h-8 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border",
                                        isLoadingStream
                                            ? "bg-emerald-500/5 text-emerald-400/50 border-emerald-500/10 cursor-wait"
                                            : "bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 text-emerald-400 border-emerald-500/20 hover:from-emerald-500/20 hover:to-cyan-500/20"
                                    )}
                                >
                                    {isLoadingStream ? (
                                        <div className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-emerald-400/30 border-t-emerald-400" />
                                    ) : (
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                            <circle cx="9" cy="7" r="4" />
                                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                        </svg>
                                    )}
                                    Listen Together
                                </button>
                            )}
                        </div>
                    )}

                    {richObject.actions?.open && (
                        <a
                            href={richObject.actions.open}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 h-8 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                        >
                            View Source
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
    message: Message;
    isOwn: boolean;
    grouped: boolean;
    isRead?: boolean;
    myUserId: string | null;
    sendReaction: (messageId: string, reaction: string) => void;
    onReply: (message: Message) => void;
    onEdit: (message: Message) => void;
    onDeleteForMe: (messageId: string) => void;
    onDeleteForEveryone: (messageId: string) => void;
    onHide: (messageId: string) => void;
    onForward: (message: Message) => void;
    selectionMode: boolean;
    isSelected: boolean;
    onToggleSelect: (messageId: string) => void;
    onEnterSelectMode: (messageId: string) => void;
    onPin?: (messageId: string, pinnedDuration?: string | null) => void;
    onUnpin?: (messageId: string) => void;
    socket?: any;
};

// ─── Main Component ───────────────────────────────────────────────────────────

function ChatMessage({
    message, isOwn, grouped, isRead, myUserId,
    sendReaction, onReply, onEdit,
    onDeleteForMe, onDeleteForEveryone, onHide, onForward,
    selectionMode, isSelected, onToggleSelect, onEnterSelectMode,
    onPin, onUnpin,
    socket,
}: Props) {
    // Swipe gestures
    const touchStart = useRef<{ x: number; y: number } | null>(null);
    const [swipeX, setSwipeX] = useState(0);
    const swipeTriggered = useRef(false);

    // Double tap tracking
    const lastTap = useRef<number>(0);
    const tapTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Long-press to enter selection mode
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handlePointerDown = () => {
        longPressTimer.current = setTimeout(() => {
            if (!selectionMode) onEnterSelectMode(message.id);
        }, 500);
    };

    const handlePointerUp = () => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };

    const [showPicker, setShowPicker] = useState(false);
    const [showCustomGrid, setShowCustomGrid] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showHideToast, setShowHideToast] = useState(false);
    const [showCollectionModal, setShowCollectionModal] = useState(false);
    const [showPinModal, setShowPinModal] = useState(false);

    // Confirmation modal state
    const [confirm, setConfirm] = useState<ConfirmAction | null>(null);

    const menuBtnRef = useRef<HTMLButtonElement>(null);

    // Lightbox states
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxSrc, setLightboxSrc] = useState("");
    const [lightboxType, setLightboxType] = useState<"IMAGE" | "VIDEO">("IMAGE");
    const [lightboxFileName, setLightboxFileName] = useState("");

    const canEdit = isOwn && !message.deletedAt && Date.now() <= new Date(message.createdAt).getTime() + 15 * 60 * 1000;
    const isDeleted = !!message.deletedAt;

    let richObject: any = null;
    let isRichCard = false;
    if (!isDeleted && message.content) {
        try {
            if (message.content.includes('"vyraObjectType":"RICH_CARD"')) {
                const parsed = JSON.parse(message.content);
                if (parsed.vyraObjectType === "RICH_CARD" && parsed.richObject) {
                    richObject = parsed.richObject;
                    isRichCard = true;
                }
            }
        } catch (e) {
            // not JSON
        }
    }

    // Group reactions
    const reactionsGrouped = message.reactions?.reduce((acc, curr) => {
        const key = curr.reaction === "CUSTOM" && curr.customEmoji ? curr.customEmoji : curr.reaction;
        if (!acc[key]) acc[key] = [];
        acc[key].push(curr);
        return acc;
    }, {} as Record<string, typeof message.reactions>) ?? {};

    const handleOpenPicker = () => {
        setShowCustomGrid(false);
        setShowPicker(!showPicker);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (selectionMode || isDeleted) return;
        const touch = e.touches[0];
        touchStart.current = { x: touch.clientX, y: touch.clientY };
        swipeTriggered.current = false;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!touchStart.current || swipeTriggered.current) return;
        const touch = e.touches[0];
        const dx = touch.clientX - touchStart.current.x;
        const dy = touch.clientY - touchStart.current.y;

        // Cancel long press timer if they moved their finger significantly (swiping or scrolling)
        if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
            if (longPressTimer.current) {
                clearTimeout(longPressTimer.current);
            }
        }

        if (Math.abs(dx) > Math.abs(dy)) {
            const val = dx * 0.45;
            setSwipeX(val);

            if (dx > 100) {
                swipeTriggered.current = true;
                setSwipeX(0);
                onReply(message);
                if (window.navigator?.vibrate) window.navigator.vibrate(15);
            } else if (dx < -100) {
                swipeTriggered.current = true;
                setSwipeX(0);
                confirmHide();
                if (window.navigator?.vibrate) window.navigator.vibrate(15);
            }
        }
    };

    const handleTouchEnd = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
        }
        touchStart.current = null;
        setSwipeX(0);
    };

    const handleBubbleTap = (e: React.MouseEvent) => {
        if (selectionMode || isDeleted) return;
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 280;

        if (now - lastTap.current < DOUBLE_TAP_DELAY) {
            if (tapTimeout.current) clearTimeout(tapTimeout.current);
            setShowMenu(true);
        } else {
            tapTimeout.current = setTimeout(() => {
                handleOpenPicker();
            }, DOUBLE_TAP_DELAY);
        }
        lastTap.current = now;
    };

    const closeMenu = useCallback(() => setShowMenu(false), []);

    // ─── Confirm helpers ────────────────────────────────────────────────────
    const confirmDeleteForMe = () => {
        closeMenu();
        setConfirm({
            label: "Delete for Me",
            description: "This will remove the message from your view only. Others will still see it.",
            icon: <Trash className="h-4 w-4" />,
            variant: "red",
            onConfirm: () => onDeleteForMe(message.id),
        });
    };

    const confirmDeleteForEveryone = () => {
        closeMenu();
        setConfirm({
            label: "Delete for Everyone",
            description: "This message will be permanently removed for all participants and cannot be undone.",
            icon: <Trash2 className="h-4 w-4" />,
            variant: "red",
            onConfirm: () => onDeleteForEveryone(message.id),
        });
    };

    const confirmHide = () => {
        closeMenu();
        setConfirm({
            label: "Hide Message",
            description: "This message will be hidden from your view. Others will still see it.",
            icon: <EyeOff className="h-4 w-4" />,
            variant: "muted",
            onConfirm: () => {
                onHide(message.id);
                // Show a brief alert toast pointing to settings
                setShowHideToast(true);
                setTimeout(() => setShowHideToast(false), 4500);
            },
        });
    };

    // Click bubble in selection mode toggles selection
    const handleBubbleSelectClick = (e: React.MouseEvent) => {
        if (selectionMode) { e.stopPropagation(); onToggleSelect(message.id); }
    };

    return (
        <>
            <ConfirmModal
                open={!!confirm}
                title={confirm?.label ?? ""}
                description={confirm?.description ?? ""}
                icon={confirm?.icon}
                confirmLabel={confirm?.label ?? "Confirm"}
                confirmVariant={confirm?.variant ?? "red"}
                onConfirm={confirm?.onConfirm ?? (() => { })}
                onCancel={() => setConfirm(null)}
            />

            {typeof window !== "undefined" && createPortal(
                <AnimatePresence>
                    {showHideToast && (
                        <motion.div
                            key="hide-toast"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 16 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 rounded-2xl border border-white/10 bg-[#1c1c1f]/95 px-4 py-3 shadow-2xl backdrop-blur-xl"
                        >
                            <EyeOff className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <p className="text-[13px] text-foreground">
                                Message hidden.{" "}
                                <Link
                                    href="/settings/hidden-messages"
                                    className="font-semibold text-foreground underline underline-offset-2 hover:opacity-70 transition"
                                >
                                    View in Settings
                                </Link>
                            </p>
                            <button
                                onClick={() => setShowHideToast(false)}
                                className="ml-1 text-muted-foreground hover:text-foreground transition text-[18px] leading-none cursor-pointer"
                            >
                                ×
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body,
            )}

            <SaveToCollectionModal
                open={showCollectionModal}
                messageId={message.id}
                conversationId={message.conversationId}
                onClose={() => setShowCollectionModal(false)}
            />

            <motion.div
                id={`msg-${message.id}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                onClick={handleBubbleSelectClick}
                className={cn(
                    "flex w-full items-end gap-2 group relative transition-colors duration-500 rounded-2xl",
                    isOwn ? "justify-end" : "justify-start",
                    grouped ? "mt-1" : "mt-5",
                    selectionMode && "cursor-pointer",
                    isSelected && "bg-white/[0.06]"
                )}
            >
                <AnimatePresence>
                    {selectionMode && (
                        <motion.div
                            key="select-check"
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 24, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className={cn("shrink-0 flex items-center justify-center mb-2", isOwn && "order-last ml-1")}
                        >
                            <div onClick={(e) => { e.stopPropagation(); onToggleSelect(message.id); }}
                                className={cn(
                                    "h-5 w-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all",
                                    isSelected ? "bg-emerald-500 border-emerald-500" : "border-white/30 bg-transparent"
                                )}
                            >
                                {isSelected && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                {showPicker && (
                    <div
                        className="fixed inset-0 z-20 cursor-default"
                        onClick={() => { setShowPicker(false); setShowCustomGrid(false); }}
                    />
                )}

                {isOwn && (
                    <div className={cn(
                        "opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0 mb-1 flex items-center gap-1",
                        showPicker && "opacity-100"
                    )}>
                        <button
                            onClick={() => onReply(message)}
                            title="Reply"
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-surface hover:bg-surface-elevated text-muted-foreground hover:text-foreground transition border border-white/[0.04] active:scale-90 cursor-pointer"
                        >
                            <CornerUpLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </button>
                        <button
                            onClick={handleOpenPicker}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-surface hover:bg-surface-elevated text-muted-foreground hover:text-foreground transition border border-white/[0.04] active:scale-90 cursor-pointer"
                        >
                            <SmilePlus className="h-4 w-4" strokeWidth={3} />
                        </button>
                    </div>
                )}

                <div className={cn(
                    "relative flex flex-col max-w-[68%]",
                    isOwn ? "items-end" : "items-start"
                )}>
                    {/* ── Context Menu Trigger ── */}
                    {!isDeleted && (
                        <>
                            {isOwn ? (
                                <button
                                    ref={menuBtnRef}
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setShowMenu((v) => !v); }}
                                    className="absolute top-0 right-0 z-20 hidden md:flex h-7 w-7 items-start justify-end
                                               rounded-tr-sm rounded-bl-2xl
                                               bg-transparent text-main hover:text-foreground hover:bg-main
                                               transition duration-150 ease-out
                                               md:opacity-0 md:group-hover:opacity-100 cursor-pointer"
                                >
                                    <ChevronDown className="h-5 w-5" strokeWidth={2.5} />
                                </button>
                            ) : (
                                <button
                                    ref={menuBtnRef}
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setShowMenu((v) => !v); }}
                                    className="absolute top-0 left-0 z-20 hidden md:flex h-7 w-7 items-center justify-center
                                            rounded-tl-sm rounded-br-2xl 
                                            text-foreground/60 hover:bg-white/10 hover:text-foreground
                                            transition duration-150 ease-out
                                            md:opacity-0 md:group-hover:opacity-100 cursor-pointer"
                                >
                                    <ChevronDown className="h-5 w-5" strokeWidth={2.5} />
                                </button>
                            )}

                            {showMenu && (
                                <ContextMenu
                                    open={showMenu}
                                    anchorRef={menuBtnRef}
                                    onClose={closeMenu}
                                    isOwn={isOwn}
                                >
                                    <MenuItem
                                        icon={<MousePointerClick className="h-3.5 w-3.5" />}
                                        label="Select"
                                        onClick={() => { onEnterSelectMode(message.id); closeMenu(); }}
                                    />

                                    <MenuItem
                                        icon={<Forward className="h-3.5 w-3.5" />}
                                        label="Forward"
                                        onClick={() => { onForward(message); closeMenu(); }}
                                    />

                                    {onPin && onUnpin && (
                                        <>
                                            <MenuDivider />
                                            {message.isPinned ? (
                                                <MenuItem
                                                    icon={<PinOff className="h-3.5 w-3.5" />}
                                                    label="Unpin Message"
                                                    onClick={() => { onUnpin(message.id); closeMenu(); }}
                                                />
                                            ) : (
                                                <MenuItem
                                                    icon={<Pin className="h-3.5 w-3.5" />}
                                                    label="Pin Message"
                                                    onClick={() => { setShowPinModal(true); closeMenu(); }}
                                                />
                                            )}
                                        </>
                                    )}

                                    <MenuDivider />

                                    {canEdit && (
                                        <>
                                            <MenuItem
                                                icon={<Pencil className="h-3.5 w-3.5" />}
                                                label="Edit Message"
                                                onClick={() => { onEdit(message); closeMenu(); }}
                                            />
                                            <MenuDivider />
                                        </>
                                    )}

                                    {isOwn && (
                                        <MenuItem
                                            icon={<Trash2 className="h-3.5 w-3.5" />}
                                            label="Delete for Everyone"
                                            onClick={confirmDeleteForEveryone}
                                            variant="danger"
                                        />
                                    )}

                                    <MenuItem
                                        icon={<Trash className="h-3.5 w-3.5" />}
                                        label="Delete for Me"
                                        onClick={confirmDeleteForMe}
                                        variant="soft-danger"
                                    />

                                    <MenuDivider />

                                    <MenuItem
                                        icon={<EyeOff className="h-3.5 w-3.5" />}
                                        label="Hide"
                                        onClick={confirmHide}
                                    />

                                    <MenuItem
                                        icon={<Bookmark className="h-3.5 w-3.5" />}
                                        label="Save to Collection"
                                        onClick={() => {
                                            setShowCollectionModal(true);
                                            closeMenu();
                                        }}
                                    />
                                </ContextMenu>
                            )}
                        </>
                    )}

                    {/* ── Reaction Picker ── */}
                    <AnimatePresence>
                        {showPicker && (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.85, y: 8 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.85, y: 8 }}
                                transition={{ duration: 0.12, ease: "easeOut" }}
                                className={cn(
                                    "absolute bottom-[calc(100%+6px)] z-30 flex flex-col bg-[#1c1c1f] border border-white/[0.08] shadow-2xl rounded-[20px] p-1.5 backdrop-blur-md min-w-[240px]",
                                    isOwn ? "right-0" : "left-0"
                                )}
                            >
                                <div className="flex items-center gap-1">
                                    {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => (
                                        <button
                                            key={type}
                                            onClick={() => { sendReaction(message.id, type); setShowPicker(false); }}
                                            className="text-lg hover:scale-130 active:scale-95 transition duration-150 ease-out p-1 hover:-translate-y-0.5 cursor-pointer text-center flex-1"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                    <div className="h-4 w-[1px] bg-white/[0.08] mx-1 shrink-0" />
                                    <button
                                        onClick={() => setShowCustomGrid(!showCustomGrid)}
                                        className={cn(
                                            "text-muted-foreground hover:text-foreground transition duration-150 p-1 rounded-full hover:bg-white/5 cursor-pointer flex items-center justify-center h-7 w-7 shrink-0",
                                            showCustomGrid && "text-white bg-white/10"
                                        )}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>

                                {showCustomGrid && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="grid grid-cols-6 gap-1 pt-1.5 mt-1.5 border-t border-white/[0.06] justify-items-center"
                                    >
                                        {CUSTOM_EMOJIS.map((emoji) => (
                                            <button
                                                key={emoji}
                                                onClick={() => { sendReaction(message.id, emoji); setShowPicker(false); setShowCustomGrid(false); }}
                                                className="text-lg hover:scale-130 active:scale-95 transition duration-150 ease-out p-1 hover:-translate-y-0.5 cursor-pointer"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Message Bubble ── */}
                    <div
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onClick={handleBubbleTap}
                        style={{
                            transform: `translateX(${swipeX}px)`,
                            transition: swipeX === 0 ? "transform 0.25s cubic-bezier(0.23, 1, 0.32, 1)" : "none"
                        }}
                        className={cn(
                            "break-words px-4 py-2.5 text-[14px] leading-[1.55] md:cursor-default cursor-pointer select-none flex flex-col gap-1.5 touch-pan-y",
                            isOwn
                                ? "rounded-2xl rounded-tr-sm bg-foreground text-background animate-message-fade-in"
                                : "rounded-2xl rounded-tl-sm bg-main/50 pt-4 px-6 backdrop-blur-xs text-foreground"
                        )}
                    >
                        {isDeleted ? (
                            <div className="flex flex-col gap-1">
                                <span className={cn(
                                    "italic opacity-60 flex items-center gap-1.5 select-none",
                                    isOwn ? "text-background" : "text-muted-foreground"
                                )}>
                                    <Trash className="h-3.5 w-3.5 shrink-0 opacity-80" />
                                    This message was deleted
                                </span>
                                <div className={cn(
                                    "mt-1 flex items-center justify-end text-[10px] tracking-wide",
                                    isOwn ? "text-background/50" : "text-muted-foreground"
                                )}>
                                    <span>{formatTime(message.createdAt)}</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                {message.replyTo && (
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const element = document.getElementById(`msg-${message.replyToId}`);
                                            if (element) {
                                                element.scrollIntoView({ behavior: "smooth", block: "center" });
                                                element.classList.add("bg-white/10");
                                                setTimeout(() => element.classList.remove("bg-white/10"), 1000);
                                            }
                                        }}
                                        className={cn(
                                            "flex flex-col gap-0.5 border-l-2 text-[12px] pl-2.5 py-0.5 rounded-r cursor-pointer transition select-none max-w-[280px] md:max-w-[400px] overflow-hidden",
                                            isOwn
                                                ? "border-background/30 bg-black/20 text-background/80 hover:bg-background/10"
                                                : "border-primary/50 bg-white/5 text-muted-foreground hover:bg-white/10"
                                        )}
                                    >
                                        <span className="font-semibold text-[11px]">
                                            {message.replyTo.senderId === myUserId ? "You" : (message.replyTo.sender?.displayName ?? "User")}
                                        </span>
                                        <span className="truncate text-xs opacity-90">
                                            {message.replyTo.content}
                                        </span>
                                    </div>
                                )}
                                {/* ── Forwarded Label ── */}
                                {message.isForwarded && (
                                    <span className={cn(
                                        "flex items-center gap-1 text-[10px] font-medium opacity-60 -mb-0.5",
                                        isOwn ? "text-background/70" : "text-muted-foreground"
                                    )}>
                                        <Forward className="h-2.5 w-2.5 shrink-0" />
                                        Forwarded
                                    </span>
                                )}
                                {isRichCard ? (
                                    <RichCardBubble richObject={richObject} isOwn={isOwn} socket={socket} conversationId={message.conversationId} />
                                ) : message.attachments && message.attachments.length > 0 ? (
                                    <div className="flex flex-col gap-2.5">
                                        {/* Render media files (Images & Videos) */}
                                        {message.attachments.some(att => att.type === "IMAGE" || att.type === "VIDEO") && (
                                            <div className={cn(
                                                "grid gap-1.5 rounded-lg overflow-hidden",
                                                message.attachments.filter(att => att.type === "IMAGE" || att.type === "VIDEO").length > 1 ? "grid-cols-2" : "grid-cols-1"
                                            )}>
                                                {message.attachments.map((att) => {
                                                    if (att.type === "IMAGE") {
                                                        return (
                                                            <div
                                                                key={att.id}
                                                                className="relative max-w-full overflow-hidden rounded-md border border-white/[0.04] bg-black/10 cursor-pointer hover:opacity-90 transition"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setLightboxSrc(att.fileUrl);
                                                                    setLightboxType("IMAGE");
                                                                    setLightboxFileName(att.storageKey.split("-").slice(1).join("-"));
                                                                    setLightboxOpen(true);
                                                                }}
                                                            >
                                                                <img
                                                                    src={att.fileUrl}
                                                                    alt="Attached image"
                                                                    className="max-h-[300px] w-full object-cover"
                                                                />
                                                            </div>
                                                        );
                                                    } else if (att.type === "VIDEO") {
                                                        return (
                                                            <div
                                                                key={att.id}
                                                                className="relative rounded-md overflow-hidden border border-white/[0.04] bg-black cursor-pointer group/video"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setLightboxSrc(att.fileUrl);
                                                                    setLightboxType("VIDEO");
                                                                    setLightboxFileName(att.storageKey.split("-").slice(1).join("-"));
                                                                    setLightboxOpen(true);
                                                                }}
                                                            >
                                                                <video
                                                                    src={att.fileUrl}
                                                                    className="max-h-[300px] w-full object-contain pointer-events-none"
                                                                    preload="metadata"
                                                                />
                                                                {/* Play overlay icon */}
                                                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-100 group-hover/video:bg-black/40 transition-colors">
                                                                    <div className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition active:scale-95">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white ml-0.5">
                                                                            <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                                                                        </svg>
                                                                    </div>
                                                                </div>
                                                             </div>
                                                        );
                                                    }
                                                    return null;
                                                })}
                                            </div>
                                        )}

                                        {/* Render Voice Notes */}
                                        {message.attachments.filter(att => att.type === "VOICE").map((att) => (
                                            <VoicePlayer
                                                key={att.id}
                                                src={att.fileUrl}
                                                duration={(att.metadata as any)?.duration || 0}
                                                isOwn={isOwn}
                                            />
                                        ))}

                                        {/* Render Documents / Other Files */}
                                        {message.attachments.filter(att => att.type === "DOCUMENT").map((att) => (
                                            <a
                                                key={att.id}
                                                href={att.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={cn(
                                                    "flex items-center gap-2.5 p-2 rounded-xl border text-xs transition duration-150 active:scale-98 select-text",
                                                    isOwn
                                                        ? "bg-black/10 border-black/10 text-background hover:bg-black/15"
                                                        : "bg-surface-elevated border-white/[0.04] text-foreground hover:bg-white/5"
                                                )}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Paperclip className="h-4 w-4 shrink-0 opacity-70" />
                                                <div className="flex flex-col min-w-0 flex-1">
                                                    <span className="font-semibold truncate">{att.storageKey.split("-").slice(1).join("-") || "document"}</span>
                                                    <span className="text-[10px] opacity-60">{(att.size / 1024 / 1024).toFixed(2)} MB</span>
                                                </div>
                                            </a>
                                        ))}

                                        {/* Render text caption underneath if present */}
                                        {message.content && (
                                            <span className="text-inherit select-text px-0.5">{message.content}</span>
                                        )}
                                    </div>
                                ) : (
                                    <span className="select-text">{message.content}</span>
                                )}
                                <div className={cn(
                                    "mt-1 flex items-center justify-end gap-1.5 text-[10px] tracking-wide",
                                    isOwn ? "text-background/50" : "text-muted-foreground"
                                )}>
                                    {message.isPinned && (
                                        <>
                                            <span className={cn(
                                                "flex items-center gap-0.5 font-bold uppercase tracking-wider text-[8px]",
                                                isOwn ? "text-background/70" : "text-emerald-400"
                                            )}>
                                                <Pin className="h-2.5 w-2.5 fill-current shrink-0 rotate-45" />
                                                <span>Pinned</span>
                                            </span>
                                            <span className="opacity-50">·</span>
                                        </>
                                    )}
                                    {message.savedIn && message.savedIn.length > 0 && (
                                        <>
                                            <span className={cn(
                                                "flex items-center gap-0.5 font-bold uppercase tracking-wider text-[8px]",
                                                isOwn ? "text-background/70" : "text-main"
                                            )}>
                                                <Bookmark className="h-2.5 w-2.5 fill-current shrink-0" />
                                                <span>Saved</span>
                                            </span>
                                            <span className="opacity-50">·</span>
                                        </>
                                    )}
                                    <span>{formatTime(message.createdAt)}</span>
                                    {message.editedAt && (
                                        <span className="italic text-main font-semibold">edited</span>
                                    )}
                                    {isOwn && (
                                        <span className="inline-flex">
                                            {isRead ? (
                                                <CheckCheck className="h-3 w-3 text-cyan-400 animate-pulse" style={{ animationDuration: "2s" }} />
                                            ) : (
                                                <Check className="h-3 w-3 text-background/30" />
                                            )}
                                        </span>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* ── Reactions Row ── */}
                    {!isDeleted && Object.keys(reactionsGrouped).length > 0 && (
                        <div className={cn(
                            "flex flex-wrap items-center gap-1 mt-1 z-10",
                            isOwn ? "justify-end" : "justify-start"
                        )}>
                            {Object.entries(reactionsGrouped).map(([reactionKey, list]) => {
                                if (!list || list.length === 0) return null;
                                const hasReacted = list.some((r) => r.userId === myUserId);
                                const emoji = list[0].reaction === "CUSTOM" && list[0].customEmoji
                                    ? list[0].customEmoji
                                    : (REACTION_EMOJIS[reactionKey] ?? "❓");
                                const names = list.map((r) => r.user.displayName).join(", ");
                                return (
                                    <div key={reactionKey} className="relative group/pill">
                                        <button
                                            onClick={() => sendReaction(message.id, reactionKey)}
                                            className={cn(
                                                "flex items-center gap-1 rounded-full p-1 backdrop-blur-sm text-base border transition duration-150 active:scale-95 -mt-4 cursor-pointer",
                                                hasReacted
                                                    ? "bg-white/10 border-white/20 text-white font-medium shadow-sm"
                                                    : "bg-surface-elevated border-white/[0.04] text-muted-foreground hover:bg-white/[0.08]"
                                            )}
                                        >
                                            <span>{emoji}</span>
                                            {list.length > 1 && <span>{list.length}</span>}
                                        </button>
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/pill:block bg-[#1c1c1f] border border-white/10 text-[9px] text-white px-2 py-1 rounded shadow-lg whitespace-nowrap z-40 pointer-events-none">
                                            {names}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ── Reaction / Reply triggers (right side for other messages) ── */}
                {!isOwn && (
                    <div className={cn(
                        "opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0 mb-1 flex items-center gap-1",
                        showPicker && "opacity-100"
                    )}>
                        <button
                            onClick={handleOpenPicker}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-surface hover:bg-surface-elevated text-muted-foreground hover:text-foreground transition border border-white/[0.04] active:scale-90 cursor-pointer"
                        >
                            <SmilePlus className="h-4 w-4" strokeWidth={3} />
                        </button>
                        <button
                            onClick={() => onReply(message)}
                            title="Reply"
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-surface hover:bg-surface-elevated text-muted-foreground hover:text-foreground transition border border-white/[0.04] active:scale-90 cursor-pointer"
                        >
                            <CornerUpLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </button>
                    </div>
                )}
            </motion.div>

            <MediaLightbox
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                src={lightboxSrc}
                type={lightboxType}
                fileName={lightboxFileName}
            />

            <PinDurationModal
                open={showPinModal}
                onConfirm={(durationMs) => {
                    if (onPin) {
                        const pinnedDuration = durationMs 
                            ? new Date(Date.now() + durationMs).toISOString()
                            : null;
                        onPin(message.id, pinnedDuration);
                    }
                }}
                onCancel={() => setShowPinModal(false)}
            />
        </>
    );
}

export default memo(ChatMessage, (prevProps, nextProps) => {
    return (
        prevProps.message === nextProps.message &&
        prevProps.message.deletedAt === nextProps.message.deletedAt &&
        prevProps.message.savedIn?.length === nextProps.message.savedIn?.length &&
        prevProps.message.isPinned === nextProps.message.isPinned &&
        prevProps.isOwn === nextProps.isOwn &&
        prevProps.grouped === nextProps.grouped &&
        prevProps.isRead === nextProps.isRead &&
        prevProps.myUserId === nextProps.myUserId &&
        prevProps.selectionMode === nextProps.selectionMode &&
        prevProps.isSelected === nextProps.isSelected
    );
});
