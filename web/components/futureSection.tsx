"use client";

import { motion } from "framer-motion";
import { Rocket, Bot, Users2, BarChart3 } from "lucide-react";

const roadmapItems = [
  {
    quarter: "Q1 2025",
    icon: Bot,
    title: "Autonomous Agents",
    description:
      "Deploy AI agents that proactively surface relevant knowledge, schedule follow-ups, and draft responses — all within the chat thread.",
    status: "In Development",
    color: "#c97955",
  },
  {
    quarter: "Q2 2025",
    icon: Users2,
    title: "Team Workspaces",
    description:
      "Shared knowledge graphs for teams. Everyone's conversations feed a collective intelligence that's searchable by the whole org.",
    status: "Planned",
    color: "#7C8AF7",
  },
  {
    quarter: "Q3 2025",
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Deep insights into your communication patterns: response times, topic trends, collaboration health, and productivity metrics.",
    status: "Planned",
    color: "#3DDC84",
  },
  {
    quarter: "Q4 2025",
    icon: Rocket,
    title: "Developer API",
    description:
      "Build on top of Vyra. Embed our intelligence layer into your own apps and workflows with a simple, powerful REST API.",
    status: "Planned",
    color: "#FFB547",
  },
];

export default function FutureSection() {
  return (
    <section className="relative py-24 px-6 md:px-8 overflow-hidden">
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Left glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full blur-[140px] opacity-10 pointer-events-none bg-main" />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="text-main text-sm font-semibold uppercase tracking-widest mb-3">
            Future
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight max-w-2xl">
            We're just getting started.
          </h2>
          <p className="text-white/45 text-lg mt-4 max-w-xl leading-relaxed">
            Our roadmap is driven by one question: how do we make your conversations
            10x more valuable over time?
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative flex flex-col gap-4">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-6 bottom-6 w-px bg-gradient-to-b from-white/20 via-white/[0.08] to-transparent hidden md:block" />

          {roadmapItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative flex gap-6 p-6 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:border-white/10 hover:bg-white/[0.05] transition-all duration-300 group md:ml-10"
              >
                {/* Timeline dot – visible only on md+ */}
                <div
                  className="absolute -left-[49px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 items-center justify-center hidden md:flex"
                  style={{ borderColor: item.color, backgroundColor: `${item.color}20` }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                </div>

                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${item.color}15`, border: `1px solid ${item.color}25` }}
                >
                  <Icon className="w-5 h-5" style={{ color: item.color }} />
                </div>

                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <h3 className="text-white font-bold text-base">{item.title}</h3>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs px-2.5 py-0.5 rounded-full font-medium shrink-0"
                        style={{
                          backgroundColor: `${item.color}15`,
                          color: item.color,
                          border: `1px solid ${item.color}25`,
                        }}
                      >
                        {item.status}
                      </span>
                      <span className="text-white/25 text-xs font-medium">{item.quarter}</span>
                    </div>
                  </div>
                  <p className="text-white/45 text-sm leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
