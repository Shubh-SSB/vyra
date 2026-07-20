"use client";

import { useRef, useState } from "react";
import { Paperclip, Send, Sparkles } from "lucide-react";

type Props = {
    onSend: (content: string) => void;
    disabled?: boolean;
};

export default function ChatComposer({ onSend, disabled }: Props) {
    const [value, setValue] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const submit = () => {
        const trimmed = value.trim();
        if (!trimmed || disabled) return;
        onSend(trimmed);
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

    // Auto-grow textarea
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(e.target.value);
        e.target.style.height = "auto";
        e.target.style.height = `${e.target.scrollHeight}px`;
    };

    return (
        <div className="shrink-0 border-t border-border bg-background px-6 py-4">
            <div className="mx-auto flex max-w-[820px] items-end gap-2 rounded-2xl border border-border bg-surface px-3 py-2.5 transition-colors focus-within:border-ring">
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
                    placeholder="Message…"
                    disabled={disabled}
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
                    disabled={!value.trim() || disabled}
                    onClick={submit}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-foreground text-background transition-opacity disabled:opacity-30"
                >
                    <Send className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
            </div>

            <p className="mx-auto mt-2 max-w-[820px] px-1 text-[11px] text-muted-foreground">
                ⏎ to send · ⇧⏎ new line
            </p>
        </div>
    );
}
