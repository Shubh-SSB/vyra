import { cn } from "@/lib/utils";

export default function RailIcon({
    label,
    icon,
    active,
    hasDot,
    onClick,
    className,
}: {
    label: string;
    icon: React.ReactNode;
    active?: boolean;
    hasDot?: boolean;
    onClick?: () => void;
    className?: string;
}) {
    return (
        <button
            title={label}
            onClick={onClick}
            className={cn(
                "relative flex h-12 w-12 items-center justify-center rounded-full text-muted-foreground transition-all duration-200 hover:bg-white/8 hover:text-foreground active:scale-90 cursor-pointer outline-none",
                active && "bg-surface-elevated text-foreground shadow-sm hover:bg-surface-elevated hover:text-foreground",
                className
            )}
        >
            <div className="transition-transform duration-200">
                {icon}
            </div>
            {hasDot && (
                <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 border border-background" />
            )}
        </button>
    );
}