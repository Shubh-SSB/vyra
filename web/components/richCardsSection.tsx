"use client";

import { motion } from "framer-motion";
import { FileText, Image as ImageIcon, Link2, MapPin, Calendar, Music } from "lucide-react";

const richCards = [
  {
    icon: FileText,
    type: "Document",
    preview: "Q3 Strategy Overview",
    meta: "Shared by Alex · 2h ago",
    color: "#7C8AF7",
    tags: ["Strategy", "Finance"],
  },
  {
    icon: ImageIcon,
    type: "Photo",
    preview: "Design System Assets",
    meta: "Shared by Maya · Yesterday",
    color: "#c97955",
    tags: ["Design", "Assets"],
  },
  {
    icon: Link2,
    type: "Link",
    preview: "The future of AI chat interfaces",
    meta: "verge.com · Trending",
    color: "#3DDC84",
    tags: ["AI", "Tech"],
  },
  {
    icon: MapPin,
    type: "Location",
    preview: "Team offsite — Bengaluru",
    meta: "Pinned by Jordan · Oct 14",
    color: "#FFB547",
    tags: ["Event", "Team"],
  },
  {
    icon: Calendar,
    type: "Event",
    preview: "Product Review — Fri 3 PM",
    meta: "15 attendees · Recurring",
    color: "#c97955",
    tags: ["Meeting", "Product"],
  },
  {
    icon: Music,
    type: "Audio",
    preview: "Brainstorm recording — 24min",
    meta: "Transcribed by Vyra AI",
    color: "#7C8AF7",
    tags: ["Meeting", "Audio"],
  },
];

export default function RichCardsSection() {
  return (
    <section className="relative py-24 px-6 md:px-8 overflow-hidden">
      {/* Subtle center glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[120px] opacity-10 pointer-events-none bg-main" />

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
            Rich Cards
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            More than just text.
          </h2>
          <p className="text-white/45 text-lg max-w-xl mx-auto leading-relaxed">
            Vyra renders every attachment — documents, images, links, audio —
            as a beautiful, interactive card directly in the thread.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {richCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.preview}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative flex flex-col gap-4 p-5 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:border-white/10 hover:bg-white/[0.06] transition-all duration-300 overflow-hidden cursor-default"
              >
                {/* Subtle glow */}
                <div
                  className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-3xl opacity-0 group-hover:opacity-15 transition-opacity duration-500"
                  style={{ backgroundColor: card.color }}
                />

                {/* Type badge */}
                <div className="flex items-center justify-between">
                  <div
                    className="flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${card.color}18`,
                      border: `1px solid ${card.color}25`,
                      color: card.color,
                    }}
                  >
                    <Icon className="w-3 h-3" />
                    {card.type}
                  </div>
                </div>

                {/* Thumbnail placeholder */}
                <div
                  className="w-full h-24 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${card.color}08`, border: `1px solid ${card.color}12` }}
                >
                  <Icon className="w-8 h-8 opacity-20" style={{ color: card.color }} />
                </div>

                {/* Content */}
                <div className="flex flex-col gap-1">
                  <p className="text-white font-semibold text-sm leading-snug">
                    {card.preview}
                  </p>
                  <p className="text-white/40 text-xs">{card.meta}</p>
                </div>

                {/* Tags */}
                <div className="flex gap-2 flex-wrap">
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-md bg-white/[0.05] text-white/40 border border-white/[0.05]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
