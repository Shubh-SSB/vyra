"use client";

import { useEffect, useRef, useState } from "react";
import { Paperclip, Send, Sparkles, X } from "lucide-react";
import { Message } from "@/types/message";

type Props = {
    onSend: (content: string) => void;
    disabled?: boolean;
    onTypingStart?: () => void;
    onTypingStop?: () => void;
    replyingTo?: Message | null;
    onCancelReply?: () => void;
    editingMessage?: Message | null;
    onSaveEdit?: (content: string) => Promise<boolean>;
    onCancelEdit?: () => void;
};

export default function ChatComposer({
    onSend,
    disabled,
    onTypingStart,
    onTypingStop,
    replyingTo,
    onCancelReply,
    editingMessage,
    onSaveEdit,
    onCancelEdit,
}: Props) {
    const [value, setValue] = useState("");
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isTypingRef = useRef(false);

    // Prefill and focus the input when editing a message.
    useEffect(() => {
        if (!editingMessage || !textareaRef.current) return;

        setValue(editingMessage.content);

        requestAnimationFrame(() => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            textarea.focus();
            textarea.style.height = "auto";
            textarea.style.height = `${textarea.scrollHeight}px`;
            textarea.setSelectionRange(textarea.value.length, textarea.value.length);
        });
    }, [editingMessage]);

    // Auto-focus input when replying to a message.
    useEffect(() => {
        if (replyingTo && !editingMessage && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [editingMessage, replyingTo]);

    // Clean up timeout on unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    const submit = async () => {
        const trimmed = value.trim();
        if (!trimmed || disabled || isSavingEdit) return;

        // Immediately stop typing state
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
        if (isTypingRef.current) {
            isTypingRef.current = false;
            onTypingStop?.();
        }

        if (editingMessage) {
            if (!onSaveEdit) return;

            setIsSavingEdit(true);
            try {
                const saved = await onSaveEdit(trimmed);
                if (!saved) return;
            } finally {
                setIsSavingEdit(false);
            }
        } else {
            onSend(trimmed);
        }

        setValue("");
        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
        textareaRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
        }
    };

    const handleCancelEdit = () => {
        setValue("");
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
        onCancelEdit?.();
    };

    // Auto-grow textarea & handle typing state
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(e.target.value);
        e.target.style.height = "auto";
        e.target.style.height = `${e.target.scrollHeight}px`;

        if (!editingMessage && !isTypingRef.current && e.target.value.trim().length > 0) {
            isTypingRef.current = true;
            onTypingStart?.();
        }

        if (!editingMessage && typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        if (!editingMessage) {
            typingTimeoutRef.current = setTimeout(() => {
                isTypingRef.current = false;
                onTypingStop?.();
            }, 2000);
        }
    };

    return (
        <div className="shrink-0 border-t border-border bg-background px-6 py-4">
            <div className="mx-auto flex max-w-[820px] flex-col gap-2 rounded-2xl border border-border bg-surface px-3 py-2.5 transition-colors focus-within:border-ring">
                {editingMessage ? (
                    <div className="flex items-start justify-between w-full rounded-lg bg-surface-elevated/60 border border-white/[0.04] p-3 text-[13px] animate-fade-in mb-1">
                        <div className="flex flex-col gap-0.5 border-l-2 border-primary/50 pl-3 overflow-hidden">
                            <span className="font-semibold text-xs text-primary/90">
                                Editing message
                            </span>
                            <span className="text-muted-foreground truncate max-w-[650px] leading-relaxed">
                                {editingMessage.content}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-full p-1 transition cursor-pointer shrink-0 ml-2"
                            aria-label="Cancel editing"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : replyingTo && (
                    <div className="flex items-start justify-between w-full rounded-lg bg-surface-elevated/60 border border-white/[0.04] p-3 text-[13px] animate-fade-in mb-1">
                        <div className="flex flex-col gap-0.5 border-l-2 border-primary/50 pl-3 overflow-hidden">
                            <span className="font-semibold text-xs text-primary/90">
                                Replying to {replyingTo.sender?.displayName ?? "User"}
                            </span>
                            <span className="text-muted-foreground truncate max-w-[650px] leading-relaxed">
                                {replyingTo.content}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={onCancelReply}
                            className="text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-full p-1 transition cursor-pointer shrink-0 ml-2"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}
                
                <div className="flex w-full items-end gap-2">
                    <button
                    type="button"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
                >
                    <Paperclip className="h-4 w-4" strokeWidth={1.5} />
                </button>

                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    placeholder={editingMessage ? "Edit message…" : "Message…"}
                    disabled={disabled || isSavingEdit}
                    className="max-h-40 min-h-[32px] flex-1 resize-none bg-transparent px-1 py-1.5 text-[14px] leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-40"
                />

                <button
                    type="button"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
                >
                    <Sparkles className="h-4 w-4" strokeWidth={1.5} />
                </button>

                <button
                    type="button"
                    disabled={!value.trim() || disabled || isSavingEdit}
                    onClick={submit}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-foreground text-background transition-opacity disabled:opacity-30"
                >
                    <Send className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
            </div>
            </div>

            <p className="mx-auto mt-2 max-w-[820px] px-1 text-[11px] text-muted-foreground">
                ⏎ to send · ⇧⏎ new line
            </p>
        </div>
    );
}
