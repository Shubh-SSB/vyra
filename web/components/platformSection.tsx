"use client";

import { motion } from "framer-motion";
import { Smartphone, Monitor, Watch } from "lucide-react";
import { Globe } from "@/components/ui/globle";

const platforms = [
  {
    icon: Monitor,
    name: "macOS & Windows",
    label: "Desktop",
    status: "Available",
    statusColor: "#3DDC84",
    description: "Full-featured desktop app with native performance.",
  },
  {
    icon: Smartphone,
    name: "iOS & Android",
    label: "Mobile",
    status: "Available",
    statusColor: "#3DDC84",
    description: "Take your knowledge graph anywhere with native mobile apps.",
  },
  {
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    name: "Chrome & Firefox",
    label: "Browser",
    status: "Beta",
    statusColor: "#FFB547",
    description: "Clip insights from any webpage directly into Vyra.",
  },
  {
    icon: Watch,
    name: "Apple Watch",
    label: "Wearable",
    status: "Coming Soon",
    statusColor: "#7C8AF7",
    description: "Quick glances, voice notes, and AI summaries on the wrist.",
  },
];

const globalStats = [
  { value: "40+", label: "Countries" },
  { value: "180k+", label: "Active users" },
  { value: "99.9%", label: "Uptime" },
];

export default function PlatformSection() {
  return (
    <section className="relative py-24 px-6 md:px-8 overflow-hidden">
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-6xl mx-auto">
        {/* ── Two-column layout ── */}
        <div className="flex flex-col lg:flex-row gap-12 items-center">

          {/* Left – Globe visual */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1 flex flex-col items-center gap-8"
          >
            {/* Globe */}
            <div className="relative">
              {/* Radial glow behind globe */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-72 h-72 rounded-full blur-[80px] opacity-20 bg-main" />
              </div>
              <Globe size={380} accentColor="#c97955" accentColor2="#7C8AF7" />
            </div>

            {/* Global stats row */}
            <div className="flex gap-6 w-full max-w-xs mx-auto">
              {globalStats.map((s) => (
                <div key={s.label} className="flex-1 text-center">
                  <p className="text-2xl font-extrabold text-white">{s.value}</p>
                  <p className="text-white/35 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right – text + platform cards */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="flex-1 flex flex-col gap-8"
          >
            {/* Header */}
            <div>
              <p className="text-main text-sm font-semibold uppercase tracking-widest mb-3">
                Platform
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
                Vyra lives wherever{" "}
                <span className="text-white/40">you do.</span>
              </h2>
              <p className="text-white/45 text-base leading-relaxed max-w-md">
                A single knowledge graph, perfectly in sync across every device
                and every corner of the world — in real time.
              </p>
            </div>

            {/* Platform cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {platforms.map((platform, i) => {
                const Icon = platform.icon;
                return (
                  <motion.div
                    key={platform.name}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    className="group flex gap-3 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:border-white/10 hover:bg-white/[0.06] transition-all duration-300"
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-white/[0.06] border border-white/[0.06]">
                      <Icon className="w-4 h-4 text-white/50 group-hover:text-white/70 transition-colors" />
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-semibold text-sm truncate">{platform.name}</span>
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0"
                          style={{
                            backgroundColor: `${platform.statusColor}15`,
                            color: platform.statusColor,
                            border: `1px solid ${platform.statusColor}25`,
                          }}
                        >
                          {platform.status}
                        </span>
                      </div>
                      <p className="text-white/35 text-xs leading-relaxed">{platform.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Sync callout */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-main/8 to-[#7C8AF7]/8 border border-white/[0.06]"
            >
              <div className="w-2 h-2 rounded-full bg-[#3DDC84] animate-pulse shrink-0" />
              <p className="text-white/50 text-sm">
                <span className="text-white font-medium">Real-time sync</span> — your knowledge stays in sync
                across every device, instantly.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
