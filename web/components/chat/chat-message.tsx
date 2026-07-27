import { useState, memo, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Message } from "@/types/message";
import {
    Check, CheckCheck, Plus, SmilePlus, CornerUpLeft,
    ChevronDown, Pencil, Trash2, EyeOff, Trash, AlertTriangle, Bookmark, Forward, MousePointerClick
} from "lucide-react";
import { SaveToCollectionModal } from "./save-to-collection-modal";
import VoicePlayer from "./voice-player";

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

// ─── Confirmation Modal ───────────────────────────────────────────────────────

type ConfirmAction = {
    label: string;
    description: string;
    icon: React.ReactNode;
    variant: "red" | "muted";
    onConfirm: () => void;
};

function ConfirmModal({
    open,
    title,
    description,
    icon,
    confirmLabel,
    confirmVariant,
    onConfirm,
    onCancel,
}: {
    open: boolean;
    title: string;
    description: string;
    icon: React.ReactNode;
    confirmLabel: string;
    confirmVariant: "red" | "muted";
    onConfirm: () => void;
    onCancel: () => void;
}) {
    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open, onCancel]);

    if (typeof window === "undefined") return null;

    return createPortal(
        <AnimatePresence>
            {open && (
                <motion.div
                    key="confirm-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    onClick={onCancel}
                >
                    {/* Blurred backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    {/* Modal card */}
                    <motion.div
                        key="confirm-card"
                        initial={{ opacity: 0, scale: 0.92, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 12 }}
                        transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative z-10 w-full max-w-[340px] rounded-2xl border border-white/10 bg-[#18181b] shadow-2xl overflow-hidden"
                    >
                        {/* Top accent line */}
                        <div className={cn(
                            "h-[2px] w-full",
                            confirmVariant === "red" ? "bg-gradient-to-r from-red-500/60 via-red-400/40 to-transparent" : "bg-gradient-to-r from-white/20 via-white/10 to-transparent"
                        )} />

                        <div className="px-5 py-5 flex flex-col gap-4">
                            {/* Icon + Title */}
                            <div className="flex items-start gap-3">
                                <div className={cn(
                                    "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                                    confirmVariant === "red" ? "bg-red-500/15 text-red-400" : "bg-white/10 text-muted-foreground"
                                )}>
                                    {icon}
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <p className="text-sm font-semibold text-foreground leading-snug">{title}</p>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 justify-end">
                                <button
                                    onClick={onCancel}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground border border-white/[0.08] hover:bg-white/5 hover:text-foreground transition-all duration-150 active:scale-95 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => { onConfirm(); onCancel(); }}
                                    className={cn(
                                        "rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 active:scale-95 cursor-pointer",
                                        confirmVariant === "red"
                                            ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 hover:text-red-300"
                                            : "bg-white/10 text-foreground border border-white/10 hover:bg-white/15"
                                    )}
                                >
                                    {confirmLabel}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body,
    );
}

// ─── Position-aware Portal Dropdown ──────────────────────────────────────────

type MenuPosition = { top: number; left: number };

function ContextMenu({
    open,
    anchorRef,
    onClose,
    children,
}: {
    open: boolean;
    anchorRef: React.RefObject<HTMLButtonElement | null>;
    onClose: () => void;
    children: React.ReactNode;
}) {
    const menuRef = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState<MenuPosition | null>(null);

    // Calculate position whenever menu opens
    useEffect(() => {
        if (!open || !anchorRef.current) return;

        const MENU_W = 192;
        const MENU_H = 200; // approximate max height
        const GAP = 6;
        const EDGE_PAD = 10;

        const rect = anchorRef.current.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        // Horizontal: prefer right-aligned to anchor, flip left if overflows
        let left = rect.right - MENU_W;
        if (left < EDGE_PAD) left = rect.left;
        if (left + MENU_W > vw - EDGE_PAD) left = vw - MENU_W - EDGE_PAD;

        // Vertical: prefer below anchor, flip above if overflows
        let top = rect.bottom + GAP;
        if (top + MENU_H > vh - EDGE_PAD) top = rect.top - MENU_H - GAP;
        if (top < EDGE_PAD) top = EDGE_PAD;

        setPos({ top, left });
    }, [open, anchorRef]);

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
            {open && pos && (
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
                        style={{ top: pos.top, left: pos.left, width: 192 }}
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
};

// ─── Main Component ───────────────────────────────────────────────────────────

function ChatMessage({
    message, isOwn, grouped, isRead, myUserId,
    sendReaction, onReply, onEdit,
    onDeleteForMe, onDeleteForEveryone, onHide, onForward,
    selectionMode, isSelected, onToggleSelect, onEnterSelectMode,
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

    // Confirmation modal state
    const [confirm, setConfirm] = useState<ConfirmAction | null>(null);

    const menuBtnRef = useRef<HTMLButtonElement>(null);

    const canEdit = isOwn && !message.deletedAt && Date.now() <= new Date(message.createdAt).getTime() + 15 * 60 * 1000;
    const isDeleted = !!message.deletedAt;

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

                    {/* ── Deleted placeholder ── */}
                    {isDeleted && (
                        <span className="italic text-muted-foreground text-xs opacity-60 px-1">
                            This message was deleted
                        </span>
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
                        {message.attachments && message.attachments.length > 0 && message.attachments[0].type === "VOICE" ? (
                            <VoicePlayer
                                src={message.attachments[0].fileUrl}
                                duration={(message.attachments[0].metadata as any)?.duration || 0}
                                isOwn={isOwn}
                            />
                        ) : (
                            <span>{message.content}</span>
                        )}
                        <div className={cn(
                            "mt-1 flex items-center justify-end gap-1.5 text-[10px] tracking-wide",
                            isOwn ? "text-background/50" : "text-muted-foreground"
                        )}>
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
                    </div>

                    {/* ── Reactions Row ── */}
                    {Object.keys(reactionsGrouped).length > 0 && (
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
        </>
    );
}

export default memo(ChatMessage, (prevProps, nextProps) => {
    return (
        prevProps.message === nextProps.message &&
        prevProps.message.deletedAt === nextProps.message.deletedAt &&
        prevProps.message.savedIn?.length === nextProps.message.savedIn?.length &&
        prevProps.isOwn === nextProps.isOwn &&
        prevProps.grouped === nextProps.grouped &&
        prevProps.isRead === nextProps.isRead &&
        prevProps.myUserId === nextProps.myUserId &&
        prevProps.selectionMode === nextProps.selectionMode &&
        prevProps.isSelected === nextProps.isSelected
    );
});
