import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import Toggle from "./toggle";

export default function SettingsToggle({ icon, title, description, checked, onChange }: { icon: ReactNode; title: string; description?: string; checked: boolean; onChange: (checked: boolean) => void }) {
    return (
        <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-4 min-w-0 flex-1">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/50 text-muted-foreground border border-white/[0.06]">
                    {icon}
                </span>
                <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-[#eeece4] truncate">{title}</p>
                    {description && (
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{description}</p>
                    )}
                </div>
            </div>
            <Toggle checked={checked} onChange={onChange} />
        </div>
    );
}