"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Users,
  LayoutDashboard,
  FileText,
  BarChart3,
  Folders,
  Plus,
  Moon,
  Sparkles,
  ChevronLeft,
} from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] w-full overflow-hidden bg-[#09090b] text-foreground pt-12 pb-24 md:pt-20 md:pb-32">
      {/* Background radial glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[1000px] rounded-full bg-gradient-to-b from-white/[0.07] to-transparent blur-3xl" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-center">

          {/* Left Column: Text & CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 xl:col-span-5 flex flex-col space-y-6 pt-4"
          >
            <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl leading-[1.1]">
              Agents that do the work
              <span className="block text-white/95 mt-1">
                Approvals that keep you safe.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-neutral-400 leading-relaxed max-w-xl">
              Deploy AI agents that plan, act through your tools, and report
              outcomes—without changing how your teams work.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-neutral-950 shadow-lg shadow-white/10 transition-all hover:bg-neutral-200 active:scale-[0.98]"
              >
                Start your free trial
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-neutral-300 transition-colors hover:text-white px-4 py-3.5 group"
              >
                <span>View role based demos</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>

          {/* Right Column: 3D Perspective Dashboard Graphic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 xl:col-span-7 relative flex justify-center lg:justify-end"
          >
            {/* Perspective Container */}
            <div className="relative w-full max-w-[720px] [perspective:1400px]">

              {/* 3D Rotated Card */}
              <div className="relative rounded-2xl border border-white/10 bg-[#0e0f12] p-5 shadow-2xl transition-transform duration-700 ease-out [transform-style:preserve-3d] [transform:rotateX(14deg)_rotateY(-12deg)_rotateZ(4deg)] hover:[transform:rotateX(8deg)_rotateY(-6deg)_rotateZ(2deg)]">

                {/* Dashboard Inner Container */}
                <div className="rounded-xl border border-neutral-800/60 bg-[#121318] p-4 text-white text-xs shadow-inner">

                  {/* Dashboard Layout Header & Sidebar Grid */}
                  <div className="grid grid-cols-12 gap-4">

                    {/* Sidebar */}
                    <div className="col-span-4 sm:col-span-3 space-y-4 border-r border-neutral-800/60 pr-3">
                      <div className="flex items-center gap-2 font-semibold text-white text-sm pb-1">
                        <div className="h-4 w-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                          ▲
                        </div>
                        <span>Acme Inc.</span>
                      </div>

                      <button className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-neutral-800 py-1.5 px-2 text-[11px] font-medium text-white transition-colors hover:bg-neutral-700">
                        <Plus className="h-3 w-3" />
                        <span>Quick Create</span>
                      </button>

                      <div className="space-y-1 pt-1 text-neutral-400">
                        <div className="flex items-center gap-2 rounded-md bg-neutral-800/80 px-2 py-1.5 text-white font-medium">
                          <LayoutDashboard className="h-3.5 w-3.5 text-white" />
                          <span>Dashboard</span>
                        </div>
                        <div className="flex items-center gap-2 px-2 py-1.5 hover:text-white transition-colors">
                          <FileText className="h-3.5 w-3.5" />
                          <span>Lifecycle</span>
                        </div>
                        <div className="flex items-center gap-2 px-2 py-1.5 hover:text-white transition-colors">
                          <BarChart3 className="h-3.5 w-3.5" />
                          <span>Analytics</span>
                        </div>
                        <div className="flex items-center gap-2 px-2 py-1.5 hover:text-white transition-colors">
                          <Folders className="h-3.5 w-3.5" />
                          <span>Projects</span>
                        </div>
                      </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="col-span-8 sm:col-span-9 space-y-4">

                      {/* Top Bar / Documents Tab */}
                      <div className="flex items-center justify-between border-b border-neutral-800/60 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">Documents</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-neutral-400">
                          <div className="h-2 w-2 rounded-full bg-emerald-500" />
                          <span className="text-[10px]">Live</span>
                        </div>
                      </div>

                      {/* Stat Cards Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">

                        {/* Card 1: Total Revenue */}
                        <div className="rounded-lg border border-neutral-800/80 bg-neutral-900/60 p-2.5">
                          <div className="flex items-center justify-between text-[10px] text-neutral-400">
                            <span>Total Revenue</span>
                            <span className="flex items-center gap-0.5 text-emerald-400 font-medium">
                              <TrendingUp className="h-2.5 w-2.5" /> +12.5%
                            </span>
                          </div>
                          <div className="text-base font-bold text-white mt-1">
                            $1,250.00
                          </div>
                          <div className="text-[9px] text-neutral-500 mt-0.5 truncate">
                            Trending up this month
                          </div>
                        </div>

                        {/* Card 2: New Customers */}
                        <div className="rounded-lg border border-neutral-800/80 bg-neutral-900/60 p-2.5">
                          <div className="flex items-center justify-between text-[10px] text-neutral-400">
                            <span>New Customers</span>
                            <span className="flex items-center gap-0.5 text-rose-400 font-medium">
                              <TrendingDown className="h-2.5 w-2.5" /> -20%
                            </span>
                          </div>
                          <div className="text-base font-bold text-white mt-1">
                            1,234
                          </div>
                          <div className="text-[9px] text-neutral-500 mt-0.5 truncate">
                            Down 20% this period
                          </div>
                        </div>

                        {/* Card 3: Active Accounts */}
                        <div className="rounded-lg border border-neutral-800/80 bg-neutral-900/60 p-2.5">
                          <div className="flex items-center justify-between text-[10px] text-neutral-400">
                            <span>Active Accounts</span>
                            <span className="flex items-center gap-0.5 text-emerald-400 font-medium">
                              <TrendingUp className="h-2.5 w-2.5" /> +12.5%
                            </span>
                          </div>
                          <div className="text-base font-bold text-white mt-1">
                            45,678
                          </div>
                          <div className="text-[9px] text-neutral-500 mt-0.5 truncate">
                            Strong user retention
                          </div>
                        </div>

                        {/* Card 4: Growth Rate */}
                        <div className="rounded-lg border border-neutral-800/80 bg-neutral-900/60 p-2.5">
                          <div className="flex items-center justify-between text-[10px] text-neutral-400">
                            <span>Growth Rate</span>
                            <span className="text-emerald-400 text-[10px]">↗ +4.5%</span>
                          </div>
                          <div className="text-base font-bold text-white mt-1">
                            4.5%
                          </div>
                          <div className="text-[9px] text-neutral-500 mt-0.5 truncate">
                            Steady performance
                          </div>
                        </div>

                      </div>

                      {/* Interactive Graph Box */}
                      <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-3">
                        <div className="flex items-center justify-between pb-2 text-[10px] text-neutral-400">
                          <div className="flex items-center gap-3">
                            <span className="hover:text-white cursor-pointer">Last 3 months</span>
                            <span className="text-white font-medium border-b border-white pb-0.5">Last 30 days</span>
                            <span className="hover:text-white cursor-pointer">Last 7 days</span>
                          </div>
                        </div>

                        {/* SVG Graph Wave */}
                        <div className="relative h-28 w-full pt-2">
                          <svg className="h-full w-full overflow-visible" viewBox="0 0 400 100" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
                                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>
                            {/* Grid lines */}
                            <line x1="0" y1="25" x2="400" y2="25" stroke="#ffffff10" strokeDasharray="3 3" />
                            <line x1="0" y1="50" x2="400" y2="50" stroke="#ffffff10" strokeDasharray="3 3" />
                            <line x1="0" y1="75" x2="400" y2="75" stroke="#ffffff10" strokeDasharray="3 3" />

                            {/* Area fill */}
                            <path
                              d="M0,90 Q40,40 80,75 T160,30 T240,65 T320,20 T400,55 L400,100 L0,100 Z"
                              fill="url(#gradient)"
                            />
                            {/* Stroke line */}
                            <path
                              d="M0,90 Q40,40 80,75 T160,30 T240,65 T320,20 T400,55"
                              fill="none"
                              stroke="#ffffff"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>

                          {/* Timeline X-axis Labels */}
                          <div className="flex justify-between pt-2 text-[9px] text-neutral-500">
                            <span>Jan 5</span>
                            <span>Jan 12</span>
                            <span>Jan 19</span>
                            <span>Jan 26</span>
                            <span>Feb 2</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>

                {/* Smooth Dark Vignette Overlay on the bottom right corner */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-[#09090b]/40 to-[#09090b]/90" />
              </div>

              {/* Floating Toolbar Badge at Bottom */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border border-neutral-700/80 bg-[#16171d]/90 px-4 py-2 text-xs text-white shadow-2xl backdrop-blur-md z-20">
                <button className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors">
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Blocks</span>
                </button>
                <div className="h-3 w-px bg-neutral-700" />
                <span className="font-mono text-[11px] text-neutral-300 max-w-[160px] truncate">
                  minimal-hero-section-with...
                </span>
                <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-300">
                  Pro
                </span>
                <div className="h-3 w-px bg-neutral-700" />
                <button className="text-neutral-400 hover:text-white transition-colors">
                  <Moon className="h-3.5 w-3.5" />
                </button>
                <button className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-neutral-950 transition-colors hover:bg-neutral-200">
                  <Sparkles className="h-3 w-3" />
                  <span>All Access</span>
                </button>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
