"use client";

import { useMe } from "@/tanstack/queries/auth.query";
import GreetingHeader from "@/components/home/greeting-header";
import ContinueRow from "@/components/home/continue-row";
import { AiWeeklyDigest, CurationQueue, ActionItems } from "@/components/home/ai-insights-workspace";
import { motion } from "framer-motion";
import GooeySearch from "@/components/ui/gooey-search";

export default function HomePage() {
    const { data: meResponse } = useMe();
    const displayName = meResponse?.data?.displayName || meResponse?.data?.username || "there";

    return (
        <main className="relative min-h-svh bg-[#0A0A0B] text-[#e5e2e3] font-geist overflow-hidden">
            {/* ── Ambient Background Orbs ── */}
            <div className="pointer-events-none fixed inset-0 z-0">
                <div className="absolute -top-[100px] -right-[100px] w-[400px] h-[400px] rounded-full bg-violet-600/[0.15] blur-[120px] animate-[float_20s_infinite_ease-in-out_alternate]" />
                <div className="absolute -bottom-[200px] -left-[100px] w-[500px] h-[500px] rounded-full bg-emerald-500/[0.08] blur-[120px] animate-[float_20s_infinite_ease-in-out_alternate_-5s]" />
                <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] rounded-full bg-blue-600/[0.06] blur-[100px] animate-[float_25s_infinite_ease-in-out_alternate_-10s]" />
            </div>

            <div className="relative z-10 mx-auto max-w-[860px] w-full px-5 sm:px-8 lg:px-10 py-8 sm:py-12">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="space-y-12"
                >
                    {/* ─── Greeting ─── */}
                    <GreetingHeader displayName={displayName} />

                    <ContinueRow />

                    {/* ─── Curation Queue ─── */}

                    {/* ─── AI Weekly Sync ─── */}
                    <AiWeeklyDigest />

                    <CurationQueue />
                    {/* ─── Action Items ─── */}
                    <ActionItems />
                </motion.div>
            </div>
        </main>
    );
}