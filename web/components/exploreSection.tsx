"use client";

import { motion } from "framer-motion";
import { Compass, BookOpen, Users, Star, TrendingUp, Globe } from "lucide-react";

const exploreCategories = [
  { icon: Compass, label: "Discover", count: "2.4k spaces", color: "#c97955" },
  { icon: BookOpen, label: "Learn", count: "800+ guides", color: "#7C8AF7" },
  { icon: Users, label: "Collaborate", count: "350+ teams", color: "#3DDC84" },
  { icon: Star, label: "Trending", count: "Top picks", color: "#FFB547" },
  { icon: TrendingUp, label: "Growing", count: "Fast rising", color: "#c97955" },
  { icon: Globe, label: "Global", count: "40+ countries", color: "#7C8AF7" },
];

export default function ExploreSection() {
  return (
    <section className="relative py-24 px-6 md:px-8 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* Left – text */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex-1"
          >
            <p className="text-main text-sm font-semibold uppercase tracking-widest mb-4">
              Explore
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
              A universe of{" "}
              <span className="text-main">conversations</span> waiting for you.
            </h2>
            <p className="text-white/50 text-lg leading-relaxed mb-8 max-w-md">
              Browse public knowledge spaces, join focused communities, and
              surface ideas from millions of conversations — all curated by AI
              so you only see what matters.
            </p>
            <motion.a
              href="/register"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-main/10 border border-main/30 text-main font-semibold text-sm hover:bg-main/20 transition-all duration-200"
            >
              Start Exploring
              <span className="text-lg leading-none">→</span>
            </motion.a>
          </motion.div>

          {/* Right – category grid */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3"
          >
            {exploreCategories.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <motion.div
                  key={cat.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="flex flex-col gap-3 p-5 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:border-white/10 hover:bg-white/[0.07] transition-all duration-300 cursor-pointer"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${cat.color}18`, border: `1px solid ${cat.color}25` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: cat.color }} />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{cat.label}</p>
                    <p className="text-white/40 text-xs mt-0.5">{cat.count}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
