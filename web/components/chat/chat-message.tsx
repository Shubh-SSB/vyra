import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Message } from "@/types/message";

function formatTime(iso: string) {
    try {
        return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
        return "";
    }
}

type Props = {
    message: Message;
    isOwn: boolean;
    /** True when the previous message was from the same sender — reduces top margin */
    grouped: boolean;
};

export default function ChatMessage({ message, isOwn, grouped }: Props) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className={cn(
                "flex w-full",
                isOwn ? "justify-end" : "justify-start",
                grouped ? "mt-1" : "mt-5"
            )}
        >
            <div className={cn(
                "max-w-[68%] break-words px-4 py-2.5 text-[14px] leading-[1.55]",
                isOwn
                    ? "rounded-2xl rounded-tr-sm bg-foreground text-background"
                    : "rounded-2xl rounded-tl-sm bg-surface text-foreground"
            )}>
                {message.content}
                <div className={cn(
                    "mt-1 text-right text-[10px] tracking-wide",
                    isOwn ? "text-background/50" : "text-muted-foreground"
                )}>
                    {formatTime(message.createdAt)}
                </div>
            </div>
        </motion.div>
    );
}
