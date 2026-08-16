"use client";

import { motion } from "framer-motion";

const steps = [
  {
    step: "01",
    title: "Start a Conversation",
    description:
      "Open Vyra and begin chatting naturally. With anyone — colleagues, friends, AI assistants, or your own knowledge base.",
    visual: (
      <div className="flex flex-col gap-2 p-4">
        <div className="self-end max-w-[70%] px-4 py-2 rounded-2xl rounded-br-sm bg-main/20 border border-main/20 text-sm text-white/80">
          Hey, can you summarize the meeting notes?
        </div>
        <div className="self-start max-w-[70%] px-4 py-2 rounded-2xl rounded-bl-sm bg-white/[0.06] border border-white/[0.06] text-sm text-white/60">
          <span className="inline-block w-2 h-2 rounded-full bg-white/40 animate-pulse mr-1.5" />
          Vyra AI is thinking…
        </div>
      </div>
    ),
  },
  {
    step: "02",
    title: "AI Extracts Knowledge",
    description:
      "Vyra's local AI silently processes every thread, pulling out key decisions, action items, and insights — automatically.",
    visual: (
      <div className="p-4 flex flex-col gap-2">
        {["Key Decision: Ship v2.1 by Friday", "Action: Alex to update roadmap", "Insight: 3 blockers identified"].map(
          (item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.12 }}
              className="flex items-center gap-2 text-xs text-white/60 bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-main shrink-0" />
              {item}
            </motion.div>
          )
        )}
      </div>
    ),
  },
  {
    step: "03",
    title: "Build Your Knowledge Base",
    description:
      "Over time, Vyra assembles a living knowledge graph from all your conversations — searchable, linkable, always growing.",
    visual: (
      <div className="relative h-full flex items-center justify-center p-4">
        <svg viewBox="0 0 160 100" className="w-full max-w-xs opacity-60">
          <circle cx="80" cy="50" r="8" fill="#c97955" />
          {[
            [30, 20], [130, 20], [30, 80], [130, 80], [80, 15],
          ].map(([x, y], i) => (
            <g key={i}>
              <line x1="80" y1="50" x2={x} y2={y} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
              <circle cx={x} cy={y} r="5" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            </g>
          ))}
        </svg>
      </div>
    ),
  },
  {
    step: "04",
    title: "Search & Act",
    description:
      "Retrieve any insight instantly with semantic search. Ask questions in natural language and get answers from your own history.",
    visual: (
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm text-white/50">
          <span className="text-white/30">⌘</span>
          What did we decide about pricing last month?
        </div>
        <div className="px-3 py-2 rounded-xl bg-main/10 border border-main/20 text-xs text-main leading-relaxed">
          On Oct 12, the team agreed to freeze pricing at $9/mo until Q1. (3 references found)
        </div>
      </div>
    ),
  },
];

export default function HowItWorksSection() {
  return (
    <section className="relative py-24 px-6 md:px-8 overflow-hidden">
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-main text-sm font-semibold uppercase tracking-widest mb-3">
            How It Works
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            From conversation to knowledge.
          </h2>
          <p className="text-white/45 text-lg max-w-lg mx-auto leading-relaxed">
            Vyra runs in the background, turning your daily chats into a
            permanent, searchable intelligence layer.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col rounded-2xl bg-white/[0.04] border border-white/[0.06] overflow-hidden hover:border-white/10 hover:bg-white/[0.05] transition-all duration-300"
            >
              {/* Visual area */}
              <div className="min-h-[140px] border-b border-white/[0.05] bg-white/[0.02]">
                {step.visual}
              </div>

              {/* Text */}
              <div className="p-6 flex flex-col gap-2">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-main text-xs font-bold tracking-widest">
                    {step.step}
                  </span>
                  <div className="flex-1 h-px bg-white/[0.06]" />
                </div>
                <h3 className="text-white font-bold text-lg">{step.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
