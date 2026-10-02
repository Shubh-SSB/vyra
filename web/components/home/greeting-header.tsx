"use client";

import { Search } from "lucide-react";

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
}

interface GreetingHeaderProps {
    displayName: string;
}

export default function GreetingHeader({ displayName }: GreetingHeaderProps) {
    const firstName = displayName?.split(" ")[0] ?? "there";

    return (
        <section className="space-y-5">
            <div className="space-y-1">
                <h1 className="text-[28px] sm:text-[32px] font-bold tracking-tight text-foreground font-display">
                    {getGreeting()}, {firstName}
                </h1>
                <p className="text-sm text-muted-foreground/70 font-medium">
                    What matters right now?
                </p>
            </div>

            {/* Universal search */}
            {/* <div className="relative w-full max-w-lg">
                <Search
                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50"
                    strokeWidth={2}
                />
                <input
                    type="text"
                    placeholder="Search anything..."
                    className="h-11 w-full rounded-2xl border border-white/[0.06] bg-[#151517]/80 pl-11 pr-4 text-[13px] font-medium text-foreground placeholder:text-muted-foreground/40 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10 transition-all backdrop-blur-sm"
                    readOnly
                />
            </div> */}
        </section>
    );
}
