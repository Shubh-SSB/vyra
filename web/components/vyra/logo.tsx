import { cn } from "@/lib/utils";

export function VyraMark({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background",
                className,
            )}
        >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                    d="M1 1L7 13L13 1"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    );
}

export function VyraWordmark({ className }: { className?: string }) {
    return (
        <div className={cn("flex items-center gap-2.5", className)}>
            <VyraMark />
            <span className="font-display text-[19px] font-semibold tracking-tight text-foreground">
                Vyra
            </span>
        </div>
    );
}
