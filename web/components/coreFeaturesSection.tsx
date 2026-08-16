"use client";

import { motion } from "framer-motion";
import { Brain, MessageSquare, Search, Shield, Zap, Lock } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description:
      "Every conversation is automatically distilled into searchable knowledge. Never lose an important idea again.",
    accent: "#c97955",
  },
  {
    icon: MessageSquare,
    title: "Real-Time Messaging",
    description:
      "Fluid, low-latency chat that feels native. Send messages, files, and media in one seamless flow.",
    accent: "#7C8AF7",
  },
  {
    icon: Search,
    title: "Universal Search",
    description:
      "Search across every conversation, file, and insight. Find anything in seconds with semantic search.",
    accent: "#3DDC84",
  },
  {
    icon: Shield,
    title: "Local AI Processing",
    description:
      "Your data never leaves your device. Vyra's on-device AI keeps your conversations completely private.",
    accent: "#FFB547",
  },
  {
    icon: Zap,
    title: "Instant Summaries",
    description:
      "Long threads condensed into concise summaries. Catch up on any conversation in under 10 seconds.",
    accent: "#c97955",
  },
  {
    icon: Lock,
    title: "End-to-End Encrypted",
    description:
      "Military-grade encryption for every message. Your conversations are readable only by you.",
    accent: "#7C8AF7",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function CoreFeaturesSection() {
  return (
    <section className="relative py-24 px-6 md:px-8 overflow-hidden">
      {/* Background noise texture */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>')]" />

      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="text-main text-sm font-semibold uppercase tracking-widest mb-3">
            Core Features
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight max-w-2xl">
            Everything you need.{" "}
            <span className="text-white/40">Nothing you don't.</span>
          </h2>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                variants={cardVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative flex flex-col gap-4 rounded-2xl p-6 bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm hover:border-white/10 hover:bg-white/[0.06] transition-all duration-300 cursor-default overflow-hidden"
              >
                {/* Glow orb */}
                <div
                  className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                  style={{ backgroundColor: feat.accent }}
                />

                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${feat.accent}18`, border: `1px solid ${feat.accent}30` }}
                >
                  <Icon className="w-5 h-5" style={{ color: feat.accent }} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <h3 className="text-white font-semibold text-base leading-snug">
                    {feat.title}
                  </h3>
                  <p className="text-white/45 text-sm leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
