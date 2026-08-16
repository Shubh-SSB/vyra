"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { SolarSystem, type OrbitConfig } from "@/components/ui/solarsystem";

// ── Minimal decorative orbits for CTA background ──────────────────────────────

const CTA_ORBITS: OrbitConfig[] = [
  {
    id: "inner",
    name: "Inner",
    radiusClass: "var(--radius-inner)",
    radiusPx: 175,
    speed: 28,
    items: [
      {
        id: "msg",
        label: "Message",
        color: "#c97955",
        svg: (
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
          </svg>
        ),
      },
      {
        id: "brain",
        label: "AI",
        color: "#7C8AF7",
        svg: (
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
          </svg>
        ),
      },
      {
        id: "lock",
        label: "Private",
        color: "#3DDC84",
        svg: (
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        ),
      },
    ],
  },
  {
    id: "outer",
    name: "Outer",
    radiusClass: "var(--radius-mid)",
    radiusPx: 285,
    speed: 45,
    items: [
      {
        id: "search",
        label: "Search",
        color: "#FFB547",
        svg: (
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        ),
      },
      {
        id: "sync",
        label: "Sync",
        color: "#c97955",
        svg: (
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        ),
      },
    ],
  },
];

export default function CTASection() {
  return (
    <section className="relative py-24 px-6 md:px-8 overflow-hidden">
      {/* Main glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[700px] h-[400px] rounded-full blur-[160px] opacity-15 bg-main" />
      </div>

      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl border border-white/[0.08] bg-white/[0.025] backdrop-blur-xl overflow-hidden"
        >
          {/* Corner dots */}
          <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-white/10" />
          <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-white/10" />
          <div className="absolute bottom-4 left-4 w-2 h-2 rounded-full bg-white/10" />
          <div className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-white/10" />

          {/* Inner glow ring */}
          <div className="absolute inset-0 rounded-3xl border border-main/8 scale-[0.97] pointer-events-none" />

          {/* ── Solar System background decoration ── */}
          <div className="absolute inset-0 flex items-center justify-center opacity-25 pointer-events-none overflow-hidden">
            <SolarSystem
              orbits={CTA_ORBITS}
              isPaused={false}
              speedMultiplier={0.6}
              centerLogo={
                <div className="w-full h-full flex items-center justify-center">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg"
                    style={{ background: "linear-gradient(135deg, #c97955 0%, #7C8AF7 100%)" }}
                  >
                    V
                  </div>
                </div>
              }
              className="scale-90"
            />
          </div>

          {/* ── Foreground content ── */}
          <div className="relative z-10 flex flex-col items-center text-center px-8 py-16 md:px-16 md:py-20">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-main text-sm font-semibold uppercase tracking-widest mb-5"
            >
              Get Started Today
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-5 max-w-3xl"
            >
              Conversations are temporary.{" "}
              <span className="text-main">Knowledge is permanent.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="text-white/45 text-lg leading-relaxed max-w-xl mx-auto mb-10"
            >
              Join thousands of people who are turning their daily conversations
              into a permanent, searchable knowledge base with Vyra.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-main text-white font-bold text-base hover:bg-main/90 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-main/25"
              >
                Start for free
                <span className="text-lg leading-none">→</span>
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-white/[0.12] text-white/70 font-semibold text-base hover:border-white/20 hover:text-white transition-all duration-200"
              >
                Download the app
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-white/20 text-xs mt-8"
            >
              No credit card required · Free tier includes all core features · Cancel anytime
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
