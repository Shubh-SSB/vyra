import { cn } from "@/lib/utils";

export default function RailIcon({
    label,
    icon,
    active,
}: {
    label: string;
    icon?: React.ReactNode;
    active?: boolean;
}) {
    return (
        <button
            title={label}
            className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface hover:text-foreground",
                active && "bg-surface text-foreground",
            )}
        >
            {icon ?? <div className="h-1.5 w-1.5 rounded-full bg-current" />}
        </button>
    );
}