"use client";

import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Formats an ISO date string into a WhatsApp-style intelligent label:
 * - "Today"
 * - "Yesterday"
 * - "Tomorrow" (for clock skewed/future dates)
 * - "Monday", "Tuesday", etc. (within the last 6 days)
 * - "14 March" (within current year)
 * - "14 March 2024" (earlier years)
 */
export function formatChatDateLabel(isoDateStr: string): string {
    if (!isoDateStr) return "";

    try {
        const date = new Date(isoDateStr);
        if (isNaN(date.getTime())) return "";

        const now = new Date();

        // Reset hours, minutes, seconds, ms for pure calendar date comparison
        const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const diffMs = startOfNow.getTime() - startOfDate.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return "Today";
        }
        if (diffDays === 1) {
            return "Yesterday";
        }
        if (diffDays === -1) {
            return "Tomorrow";
        }
        if (diffDays > 1 && diffDays < 7) {
            return date.toLocaleDateString(undefined, { weekday: "long" });
        }
        if (date.getFullYear() === now.getFullYear()) {
            return date.toLocaleDateString(undefined, { day: "numeric", month: "long" });
        }
        return date.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
    } catch {
        return "";
    }
}

/**
 * Returns a unique calendar date key "YYYY-MM-DD" for grouping messages by date
 */
export function getCalendarDateKey(isoDateStr: string): string {
    if (!isoDateStr) return "";
    try {
        const date = new Date(isoDateStr);
        if (isNaN(date.getTime())) return "";
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    } catch {
        return "";
    }
}

type DateDividerProps = {
    date: string;
    className?: string;
};

export default function DateDivider({ date, className }: DateDividerProps) {
    const label = formatChatDateLabel(date);

    if (!label) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
                "my-5 flex items-center justify-center gap-3 px-2 select-none",
                className
            )}
        >
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-border/40" />

            <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-surface-elevated/80 px-3.5 py-1 text-[11px] font-medium tracking-wide text-muted-foreground shadow-sm backdrop-blur-md transition-all hover:border-border hover:bg-surface-elevated hover:text-foreground">
                <span>{label}</span>
            </div>

            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-border/40" />
        </motion.div>
    );
}
