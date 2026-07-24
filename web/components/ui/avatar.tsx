import { cn } from "@/lib/utils";
import { AvatarProps } from "@/types/user.type";
import Image from "next/image";


export default function Avatar({ compact = false, user }: AvatarProps) {
    const initials = user?.displayName
        ? user.displayName.trim().split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
        : "?";

    const sizeClass = compact ? "h-9 w-9" : "h-11 w-11";
    const textClass = compact ? "text-[12px]" : "text-[15px]";

    return (
        <div className={cn("relative shrink-0 rounded-full bg-gradient-to-tr from-cyan-400 via-pink-500 to-indigo-500 p-[2px] shadow-inner", sizeClass)}>
            <div className={cn("relative flex h-full w-full items-center justify-center rounded-full bg-[#151517] font-display font-bold text-foreground overflow-hidden", textClass)}>
                {user?.avatarUrl ? (
                    <Image
                        src={user.avatarUrl}
                        alt="user profile"
                        fill
                        className="object-cover"
                    />
                ) : (
                    initials
                )}
            </div>
            {!compact && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border border-background bg-emerald-500" />}
        </div>
    );
}