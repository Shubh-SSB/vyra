"use client";

import { motion } from "framer-motion";
import { Lock, Server, Eye, ShieldCheck } from "lucide-react";
import { Globe } from "@/components/ui/globle";

const privacyPoints = [
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description:
      "All messages are encrypted client-side before transmission. Even Vyra servers cannot read your conversations.",
    color: "#3DDC84",
  },
  {
    icon: Server,
    title: "On-Device AI",
    description:
      "Vyra's intelligence runs locally on your device. Your data is never uploaded to train models or shared with third parties.",
    color: "#3DDC84",
  },
  {
    icon: Eye,
    title: "Zero-Knowledge Architecture",
    description:
      "We designed Vyra so we literally cannot access your data — even if compelled by law. What you write stays yours.",
    color: "#3DDC84",
  },
  {
    icon: ShieldCheck,
    title: "Open Audit Trail",
    description:
      "Every data access is logged and auditable by you. Know exactly when, where, and how your data is used.",
    color: "#3DDC84",
  },
];

export default function PrivacySection() {
  return (
    <section className="relative py-24 px-6 md:px-8 overflow-hidden">
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute left-0 right-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">

          {/* ── Left – text content ── */}
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex-1 flex flex-col gap-8"
          >
            <div>
              <p className="text-[#3DDC84] text-sm font-semibold uppercase tracking-widest mb-4">
                Privacy
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-5">
                Your data.{" "}
                <span className="text-[#3DDC84]">Always.</span>
              </h2>
              <p className="text-white/50 text-lg leading-relaxed max-w-sm">
                Privacy isn't a feature we add on top — it's the foundation
                Vyra is built on. Every architectural decision starts with one
                question: <em className="text-white/70 not-italic">"Can the user trust this?"</em>
              </p>
            </div>

            {/* Privacy points */}
            <div className="flex flex-col gap-4">
              {privacyPoints.map((point, i) => {
                const Icon = point.icon;
                return (
                  <motion.div
                    key={point.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: i * 0.09 }}
                    className="flex gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] hover:border-[#3DDC84]/15 transition-all duration-300 group"
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-[#3DDC84]/10 border border-[#3DDC84]/20 group-hover:bg-[#3DDC84]/15 transition-colors duration-300">
                      <Icon className="w-4 h-4 text-[#3DDC84]" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm mb-1">
                        {point.title}
                      </h3>
                      <p className="text-white/40 text-sm leading-relaxed">
                        {point.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Trust badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="flex items-center gap-3"
            >
              <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-[#3DDC84]/20 bg-[#3DDC84]/8">
                <div className="w-2 h-2 rounded-full bg-[#3DDC84] animate-pulse" />
                <span className="text-[#3DDC84] text-sm font-medium">SOC2 Type II Compliant</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-white/[0.08] bg-white/[0.04]">
                <span className="text-white/40 text-xs">GDPR Ready</span>
              </div>
            </motion.div>
          </motion.div>

          {/* ── Right – Shield Globe visual ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="flex-1 flex flex-col items-center gap-6"
          >
            <div className="relative">
              {/* Green aura behind globe */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 rounded-full blur-[90px] opacity-15 bg-[#3DDC84]" />
              </div>

              <Globe
                size={360}
                accentColor="#3DDC84"
                accentColor2="#7C8AF7"
                shieldMode={true}
              />
            </div>

            {/* Lock stat chips */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
              {[
                { label: "AES-256", sub: "Encryption standard" },
                { label: "0 bytes", sub: "Data sent externally" },
                { label: "100%", sub: "On-device processing" },
                { label: "∞", sub: "Audit history" },
              ].map((chip) => (
                <div
                  key={chip.label}
                  className="flex flex-col items-center text-center p-3 rounded-xl bg-[#3DDC84]/5 border border-[#3DDC84]/12"
                >
                  <span className="text-[#3DDC84] font-bold text-lg">{chip.label}</span>
                  <span className="text-white/35 text-[10px] mt-0.5 leading-tight">{chip.sub}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
