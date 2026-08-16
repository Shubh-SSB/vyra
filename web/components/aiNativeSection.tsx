"use client";

import { motion } from "framer-motion";
import { SolarSystem, type OrbitConfig } from "@/components/ui/solarsystem";
import { useState } from "react";

// ── Vyra-themed AI capability icons ──────────────────────────────────────────

const VyraIcons = {
  brain: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  ),
  chat: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
    </svg>
  ),
  memory: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 2.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
    </svg>
  ),
  lightning: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
    </svg>
  ),
  eye: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  ),
  network: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  ),
};

// ── Custom Vyra AI orbit config ───────────────────────────────────────────────

const VYRA_AI_ORBITS: OrbitConfig[] = [
  {
    id: "inner",
    name: "Core Intelligence",
    radiusClass: "var(--radius-inner)",
    radiusPx: 175,
    speed: 22,
    items: [
      {
        id: "local-ai",
        label: "Local AI",
        type: "On-Device Model",
        badge: "Privacy-First",
        desc: "Runs entirely on your device — no data leaves.",
        color: "#c97955",
        svg: <span style={{ color: "#c97955" }}>{VyraIcons.brain}</span>,
      },
      {
        id: "memory",
        label: "Memory",
        type: "Knowledge Graph",
        badge: "Persistent",
        desc: "Builds a living graph from every conversation.",
        color: "#7C8AF7",
        svg: <span style={{ color: "#7C8AF7" }}>{VyraIcons.memory}</span>,
      },
      {
        id: "privacy",
        label: "Zero-Knowledge",
        type: "Encryption Layer",
        badge: "E2E",
        desc: "AES-256 encryption. Even we can't read your data.",
        color: "#3DDC84",
        svg: <span style={{ color: "#3DDC84" }}>{VyraIcons.shield}</span>,
      },
    ],
  },
  {
    id: "mid",
    name: "AI Capabilities",
    radiusClass: "var(--radius-mid)",
    radiusPx: 285,
    speed: 36,
    items: [
      {
        id: "search",
        label: "Semantic Search",
        type: "NLP Engine",
        badge: "Instant",
        desc: "Find anything across all conversations semantically.",
        color: "#FFB547",
        svg: <span style={{ color: "#FFB547" }}>{VyraIcons.search}</span>,
      },
      {
        id: "insights",
        label: "AI Insights",
        type: "Summarization",
        badge: "Auto",
        desc: "Auto-summarizes threads, decisions, action items.",
        color: "#c97955",
        svg: <span style={{ color: "#c97955" }}>{VyraIcons.lightning}</span>,
      },
      {
        id: "context",
        label: "Context Aware",
        type: "Inference Engine",
        badge: "Smart",
        desc: "Understands conversation history and context deeply.",
        color: "#7C8AF7",
        svg: <span style={{ color: "#7C8AF7" }}>{VyraIcons.eye}</span>,
      },
    ],
  },
  {
    id: "outer",
    name: "Integration Layer",
    radiusClass: "var(--radius-outer)",
    radiusPx: 395,
    speed: 52,
    items: [
      {
        id: "realtime",
        label: "Real-Time",
        type: "Sync Engine",
        badge: "Live",
        desc: "Sub-100ms latency across all your devices.",
        color: "#3DDC84",
        svg: <span style={{ color: "#3DDC84" }}>{VyraIcons.chat}</span>,
      },
      {
        id: "network",
        label: "Cross-Platform",
        type: "Universal API",
        badge: "Every Device",
        desc: "iOS, Android, macOS, Windows, Web — all in sync.",
        color: "#FFB547",
        svg: <span style={{ color: "#FFB547" }}>{VyraIcons.network}</span>,
      },
    ],
  },
];

// ── Center core logo ──────────────────────────────────────────────────────────

const VyraCoreNode = () => (
  <div className="flex flex-col items-center justify-center w-full h-full gap-1">
    <div
      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg"
      style={{ background: "linear-gradient(135deg, #c97955 0%, #7C8AF7 100%)" }}
    >
      V
    </div>
    <span className="text-[10px] font-semibold text-white/60 tracking-widest uppercase">
      Vyra AI
    </span>
  </div>
);

// ── Stat chips ────────────────────────────────────────────────────────────────

const stats = [
  { value: "< 100ms", label: "Response latency" },
  { value: "100%", label: "On-device processing" },
  { value: "0 bytes", label: "Data sent to servers" },
  { value: "∞", label: "Knowledge retention" },
];

// ── Section ───────────────────────────────────────────────────────────────────

export default function AiNativeSection() {
  const [paused, setPaused] = useState(false);

  return (
    <section className="relative py-24 px-6 md:px-8 overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[180px] opacity-[0.08] pointer-events-none bg-main" />
      <div className="absolute top-1/3 right-0 w-[350px] h-[350px] rounded-full blur-[140px] opacity-[0.06] pointer-events-none bg-[#7C8AF7]" />

      <div className="max-w-7xl mx-auto">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-4"
        >
          <p className="text-main text-sm font-semibold uppercase tracking-widest mb-3">
            AI Native
          </p>
          <h2 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4">
            Intelligence built{" "}
            <span className="text-main">into the core.</span>
          </h2>
          <p className="text-white/45 text-lg max-w-2xl mx-auto leading-relaxed">
            Vyra isn't just AI-powered — it's AI-native. Every layer of the
            platform, from encryption to memory, is designed around local,
            private intelligence that gets smarter with every conversation.
          </p>
        </motion.div>

        {/* ── Solar System Visual ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="flex justify-center items-center my-4 relative"
          onClick={() => setPaused((p) => !p)}
        >
          <SolarSystem
            orbits={VYRA_AI_ORBITS}
            centerLogo={<VyraCoreNode />}
            centerLogoAlt="Vyra AI Core"
            isPaused={paused}
            speedMultiplier={0.85}
            className="cursor-pointer"
          />

          {/* Click hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-white/20 text-xs"
          >
            <span className="w-1 h-1 rounded-full bg-white/30" />
            Click to {paused ? "resume" : "pause"} orbits
            <span className="w-1 h-1 rounded-full bg-white/30" />
          </motion.div>
        </motion.div>

        {/* ── Stats row ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
              className="flex flex-col items-center text-center gap-1 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
            >
              <span className="text-2xl font-extrabold text-white">{stat.value}</span>
              <span className="text-white/35 text-xs font-medium leading-snug">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Feature highlights ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {/* Card 1 */}
          <div className="group flex flex-col gap-4 p-6 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:border-main/30 hover:bg-white/[0.06] transition-all duration-300 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-main" />
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-main/15 border border-main/25 text-main">
              {VyraIcons.brain}
            </div>
            <div>
              <h3 className="text-white font-bold text-base mb-1.5">Your AI. Your Device.</h3>
              <p className="text-white/45 text-sm leading-relaxed">
                Vyra's AI model runs entirely on your device using quantized,
                optimized inference. No cloud calls. No API keys. Just
                instant, private intelligence that belongs to you.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap mt-auto">
              {["On-Device", "Quantized LLM", "No Internet Required"].map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-main/10 text-main border border-main/15">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Card 2 */}
          <div className="group flex flex-col gap-4 p-6 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:border-[#7C8AF7]/30 hover:bg-white/[0.06] transition-all duration-300 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-[#7C8AF7]" />
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#7C8AF7]/15 border border-[#7C8AF7]/25 text-[#7C8AF7]">
              {VyraIcons.memory}
            </div>
            <div>
              <h3 className="text-white font-bold text-base mb-1.5">A Memory That Grows.</h3>
              <p className="text-white/45 text-sm leading-relaxed">
                Every message, every decision, every insight is captured and
                organized into a personal knowledge graph. Ask anything from
                your history — Vyra remembers so you don't have to.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap mt-auto">
              {["Knowledge Graph", "Semantic Index", "Infinite Retention"].map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-[#7C8AF7]/10 text-[#7C8AF7] border border-[#7C8AF7]/15">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Card 3 */}
          <div className="group flex flex-col gap-4 p-6 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:border-[#3DDC84]/30 hover:bg-white/[0.06] transition-all duration-300 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-[#3DDC84]" />
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#3DDC84]/15 border border-[#3DDC84]/25 text-[#3DDC84]">
              {VyraIcons.shield}
            </div>
            <div>
              <h3 className="text-white font-bold text-base mb-1.5">Privacy by Design.</h3>
              <p className="text-white/45 text-sm leading-relaxed">
                Zero-knowledge architecture means we can't access your data
                even if we tried. End-to-end encrypted, on-device processed,
                and open to audit — privacy isn't a feature. It's the default.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap mt-auto">
              {["Zero-Knowledge", "E2E Encrypted", "Open to Audit"].map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-[#3DDC84]/10 text-[#3DDC84] border border-[#3DDC84]/15">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Terminal-style quote ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-5 p-5 rounded-2xl bg-[#0a0a0a] border border-white/[0.08] font-mono text-sm"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FFB547]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#3DDC84]" />
            <span className="text-white/20 text-xs ml-2">vyra-ai — local model</span>
          </div>
          <div className="flex flex-col gap-1.5 text-xs leading-relaxed">
            <p><span className="text-main">$</span> <span className="text-white/60">vyra ask</span> <span className="text-white/40">"What did we decide about pricing last month?"</span></p>
            <p className="text-white/25">▸ Scanning local knowledge graph…</p>
            <p className="text-white/25">▸ Found 3 relevant threads (Oct 8–14)</p>
            <p><span className="text-[#3DDC84]">✓</span> <span className="text-white/70">Decision: Freeze pricing at $9/mo until Q1 2025.</span></p>
            <p className="text-white/30">  Referenced in: #product-roadmap, #team-sync, #finance-review</p>
            <p><span className="text-white/20 animate-pulse">█</span></p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}