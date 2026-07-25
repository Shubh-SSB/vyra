import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Message } from "@/types/message";
import { Check, CheckCheck, Smile, Plus, SmilePlus } from "lucide-react";

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

type Props = {
    message: Message;
    isOwn: boolean;
    /** True when the previous message was from the same sender — reduces top margin */
    grouped: boolean;
    isRead?: boolean;
    myUserId: string | null;
    sendReaction: (messageId: string, reaction: string) => void;
};

export default function ChatMessage({ message, isOwn, grouped, isRead, myUserId, sendReaction }: Props) {
    const [showPicker, setShowPicker] = useState(false);
    const [showCustomGrid, setShowCustomGrid] = useState(false);

    // Group reactions by custom emoji string or standard reaction type
    const reactionsGrouped = message.reactions?.reduce((acc, curr) => {
        const key = curr.reaction === "CUSTOM" && curr.customEmoji ? curr.customEmoji : curr.reaction;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(curr);
        return acc;
    }, {} as Record<string, typeof message.reactions>) ?? {};

    const handleOpenPicker = () => {
        setShowCustomGrid(false);
        setShowPicker(!showPicker);
    };

    const handleBubbleClick = () => {
        if (typeof window !== "undefined" && window.innerWidth < 768) {
            handleOpenPicker();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className={cn(
                "flex w-full items-end gap-2 group relative",
                isOwn ? "justify-end" : "justify-start",
                grouped ? "mt-1" : "mt-5"
            )}
        >
            {showPicker && (
                <div
                    className="fixed inset-0 z-20 cursor-default"
                    onClick={() => {
                        setShowPicker(false);
                        setShowCustomGrid(false);
                    }}
                />
            )}

            {/* React Smiley Action Trigger (on the left for own messages) */}
            {isOwn && (
                <div className={cn(
                    "opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0 mb-1",
                    showPicker && "opacity-100"
                )}>
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
                {/* Reaction Picker Popover */}
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
                                        onClick={() => {
                                            sendReaction(message.id, type);
                                            setShowPicker(false);
                                        }}
                                        className="text-lg hover:scale-130 active:scale-95 transition duration-150 ease-out p-1 hover:-translate-y-0.5 cursor-pointer text-center flex-1"
                                    >
                                        {emoji}
                                    </button>
                                ))}

                                {/* Divider */}
                                <div className="h-4 w-[1px] bg-white/[0.08] mx-1 shrink-0" />

                                {/* Plus / Custom Emojis Trigger */}
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

                            {/* Custom Emojis Grid */}
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
                                            onClick={() => {
                                                sendReaction(message.id, emoji);
                                                setShowPicker(false);
                                                setShowCustomGrid(false);
                                            }}
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

                {/* Message Bubble */}
                <div
                    onClick={handleBubbleClick}
                    className={cn(
                        "break-words px-4 py-2.5 text-[14px] leading-[1.55] md:cursor-default cursor-pointer select-none",
                        isOwn
                            ? "rounded-2xl rounded-tr-sm bg-foreground text-background"
                            : "rounded-2xl rounded-tl-sm bg-main/50 backdrop-blur-xs text-foreground"
                    )}
                >
                    {message.content}
                    <div className={cn(
                        "mt-1 flex items-center justify-end gap-1.5 text-[10px] tracking-wide",
                        isOwn ? "text-background/50" : "text-muted-foreground"
                    )}>
                        <span>{formatTime(message.createdAt)}</span>
                        {isOwn && (
                            <span className="inline-flex">
                                {isRead ? (
                                    <CheckCheck className="h-3 w-3 text-cyan-400 animate-pulse" style={{ animationDuration: '2s' }} />
                                ) : (
                                    <Check className="h-3 w-3 text-background/30" />
                                )}
                            </span>
                        )}
                    </div>
                </div>

                {/* Reactions Row */}
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
                                <div
                                    key={reactionKey}
                                    className="relative group/pill"
                                >
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

            {/* React Smiley Action Trigger (on the right for other messages) */}
            {!isOwn && (
                <div className={cn(
                    "opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0 mb-1",
                    showPicker && "opacity-100"
                )}>
                    <button
                        onClick={handleOpenPicker}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-surface hover:bg-surface-elevated text-muted-foreground hover:text-foreground transition border border-white/[0.04] active:scale-90 cursor-pointer"
                    >
                        <SmilePlus className="h-4 w-4" strokeWidth={3} />
                    </button>
                </div>
            )}
        </motion.div>
    );
}
