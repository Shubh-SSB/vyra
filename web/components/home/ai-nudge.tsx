"use client";

import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface AiNudgeProps {
    /** The contextual AI suggestion text */
    suggestion?: string;
}

export default function AiNudge({ suggestion }: AiNudgeProps) {
    // For now, show a static contextual nudge. In the future, this will be
    // driven by an AI endpoint that analyses cross-conversation patterns.
    const text = suggestion || "Vyra AI will surface insights here as your knowledge grows.";

    return (
        <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#151517]/90 via-[#151517]/70 to-[#1a1520]/80 p-5"
        >
            {/* Ambient glow */}
            <div className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-violet-500/[0.04] blur-3xl" />
            <div className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-blue-500/[0.03] blur-3xl" />

            <div className="relative flex items-start gap-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.06]">
                    <Sparkles className="h-4 w-4 text-violet-400/70" />
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-violet-400/50 mb-1.5">
                        Vyra
                    </p>
                    <p className="text-[13px] text-foreground/70 leading-relaxed">
                        {text}
                    </p>
                </div>
            </div>
        </motion.section>
    );
}
