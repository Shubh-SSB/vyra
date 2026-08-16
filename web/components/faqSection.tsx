"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Plus } from "lucide-react";

const faqs = [
  {
    q: "Is Vyra free to use?",
    a: "Vyra offers a generous free tier that includes unlimited messages and 30 days of knowledge storage. Premium plans unlock on-device AI, unlimited knowledge history, and team features.",
  },
  {
    q: "How does the local AI work?",
    a: "Vyra downloads a compact, quantized AI model directly to your device. All processing happens locally — no data is sent to external servers. This keeps your conversations completely private while enabling intelligent features.",
  },
  {
    q: "Can I import my existing conversations?",
    a: "Yes. Vyra supports importing from WhatsApp, Telegram, Slack, and plain text exports. Our AI will retroactively process your history and build a knowledge graph from your past conversations.",
  },
  {
    q: "What makes Vyra different from Telegram or WhatsApp?",
    a: "Vyra is built for knowledge retention, not just communication. While other apps let messages disappear into a scroll, Vyra transforms every conversation into searchable, actionable intelligence.",
  },
  {
    q: "Is my data truly private?",
    a: "Yes. Vyra uses zero-knowledge architecture — meaning we cannot access your messages even if we wanted to. All messages are encrypted client-side, and local AI processing ensures your data never leaves your device.",
  },
  {
    q: "Does Vyra work offline?",
    a: "Core messaging syncs when you reconnect, but the AI features — summaries, insights, local search — work fully offline thanks to on-device processing.",
  },
];

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="border-b border-white/[0.06] last:border-b-0"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left group"
      >
        <span className="text-white font-medium text-base group-hover:text-white/80 transition-colors duration-200 leading-snug">
          {question}
        </span>
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-white/[0.06] border border-white/[0.08] mt-0.5"
        >
          <Plus className="w-3.5 h-3.5 text-white/50" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="text-white/45 text-sm leading-relaxed pb-5 max-w-2xl">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  return (
    <section className="relative py-24 px-6 md:px-8 overflow-hidden">
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-main text-sm font-semibold uppercase tracking-widest mb-3">
            FAQ
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            Got questions?
          </h2>
          <p className="text-white/45 text-lg leading-relaxed">
            Here are the ones we hear most often.
          </p>
        </motion.div>

        {/* FAQ list */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] px-6 py-2">
          {faqs.map((faq, i) => (
            <FAQItem key={faq.q} question={faq.q} answer={faq.a} index={i} />
          ))}
        </div>

        {/* Still have questions */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center text-white/35 text-sm mt-8"
        >
          Still have questions?{" "}
          <a href="mailto:hello@vyra.app" className="text-main hover:text-main/80 transition-colors duration-200 underline underline-offset-2">
            Reach out to us
          </a>
        </motion.p>
      </div>
    </section>
  );
}
