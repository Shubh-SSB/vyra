"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
} from "lucide-react";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative mx-8 text-foreground pt-20 pb-24 md:pt-24 md:pb-32">
      <div className="container relative rounded-3xl bg-red-500 mx-auto px-6 py-24 sm:px-12 md:py-32 lg:px-16">

        <div className="absolute inset-0 z-0 w-full h-screen rounded-3xl">
          <Image
            src="/hero.png"
            alt="Dashboard preview"
            fill
            className="object-cover rounded-3xl"
            priority
          />
          <div className="absolute inset-0 bg-black/40 mix-blend-multiply" />
        </div>

        <div className="relative z-10 max-w-2xl text-white">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl leading-tight">
            Embrace the <br className="hidden sm:inline" />
            <span className="text-amber-500">Productivity</span>
          </h1>
          <p className="mt-6 text-lg text-slate-100 md:text-xl font-medium leading-relaxed max-w-xl">
            Bonko is your Productivity booster app that helps you stay organized, productive, and focused on what matters most.
          </p>
          <Link
            href="/register"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-main/5 backdrop-blur-sm border border-gray-200/30 hover:bg-main/10 text-gray-300 font-bold transition-all"
          >
            Get Started
          </Link>
          <Link
            href="/register"
            className="mt-6 inline-flex items-center gap-2 ml-6 px-6 py-3 rounded-full bg-main/5 backdrop-blur-sm border border-gray-200/30 hover:bg-main/10 text-gray-300 font-bold transition-all"
          >
            Download
          </Link>
        </div>
      </div>
    </section>


  );
}
