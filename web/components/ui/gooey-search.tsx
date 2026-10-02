"use client";

import { useState, useRef, useEffect, useMemo, useId } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Search, Info } from "lucide-react";

// ── Utilities ────────────────────────────────────────────────────────────────

function detectUnsupportedBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  const isSafari =
    ua.includes("safari") &&
    !ua.includes("chrome") &&
    !ua.includes("chromium") &&
    !ua.includes("android") &&
    !ua.includes("firefox");
  return isSafari || ua.includes("crios");
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// ── Animation variants ───────────────────────────────────────────────────────

const buttonMotionVariants = {
  step1: { x: 0, width: 80, height: 80 },
  step2: { x: -40, width: 260, height: 80 },
};

const iconMotionVariants = {
  hidden: { x: -50, opacity: 0 },
  visible: { x: 30, opacity: 1 },
};

const getResultVariants = (index: number, unsupported: boolean) => ({
  initial: { y: 0, scale: 0.3, filter: unsupported ? "none" : "blur(10px)" },
  animate: { y: (index + 1) * 56, scale: 1, filter: "blur(0px)" },
  exit: { y: unsupported ? 0 : -4, scale: 0.8 },
});

const getResultTransition = (index: number) => ({
  duration: 0.75,
  delay: index * 0.12,
  type: "spring" as const,
  bounce: 0.35,
  filter: { ease: "easeInOut" },
});

// ── Private sub-components ───────────────────────────────────────────────────

function SearchSvgIcon({ isUnsupported }: { isUnsupported: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x: -4, filter: isUnsupported ? "none" : "blur(5px)" }}
      animate={{ opacity: 1, scale: 1, x: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.8, x: -4, filter: isUnsupported ? "none" : "blur(5px)" }}
      transition={{ delay: 0.1, duration: 1, type: "spring", bounce: 0.15 }}
      className="flex items-center justify-center w-full h-full"
    >
      <Search className="h-[30px] w-[30px]" />
    </motion.div>
  );
}

function LoadingSvgIcon() {
  const lines: [number, number, number, number][] = [
    [128, 32, 128, 64],
    [195.88, 60.12, 173.25, 82.75],
    [224, 128, 192, 128],
    [195.88, 195.88, 173.25, 173.25],
    [128, 224, 128, 192],
    [60.12, 195.88, 82.75, 173.25],
    [32, 128, 64, 128],
    [60.12, 60.12, 82.75, 82.75],
  ];
  return (
    <svg
      className="gooey-search-loading"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      aria-label="Loading"
      role="status"
      style={{ width: 24, height: 24 }}
    >
      <rect width="256" height="256" fill="none" />
      {lines.map(([x1, y1, x2, y2], i) => (
        <line
          key={i}
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={16}
        />
      ))}
    </svg>
  );
}

function InfoSvgIcon({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ delay: index * 0.12 + 0.3 }}
      className="flex shrink-0 items-center justify-center"
      style={{ width: 24, height: 24 }}
    >
      <Info className="h-[18px] w-[18px]" />
    </motion.div>
  );
}

// ── Public types ─────────────────────────────────────────────────────────────

export interface GooeySearchProps {
  /** Strings to search locally. Ignored when `onSearch` is provided. */
  items?: string[];
  /** Async/sync custom search function for external data sources. */
  onSearch?: (query: string) => Promise<string[]> | string[];
  /** Input placeholder text. */
  placeholder?: string;
  /** Label shown on the collapsed button. */
  buttonLabel?: string;
  /** Called when the user clicks a result item. */
  onSelect?: (item: string) => void;
  /** Extra class names for the outermost wrapper. */
  className?: string;
  /** Input debounce delay in ms. Defaults to 500. */
  debounceMs?: number;
  /** Maximum number of results to render. Defaults to 5. */
  maxResults?: number;
}

const DEFAULT_ITEMS: string[] = [];

// ── Component ────────────────────────────────────────────────────────────────

export function GooeySearch({
  items = DEFAULT_ITEMS,
  onSearch,
  placeholder = "Type to search...",
  onSelect,
  className,
  debounceMs = 500,
  maxResults = 5,
}: GooeySearchProps) {
  const uid = useId().replace(/:/g, "_");
  const filterId = `gooey-search-${uid}`;

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const isUnsupported = useMemo(() => detectUnsupportedBrowser(), []);
  const debouncedQuery = useDebounce(searchText, debounceMs);

  // Close search when clicking outside the component container
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setStep(1);
        setSearchText("");
        setResults([]);
      }
    }
    if (step === 2) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [step]);

  // Step only ever advances 1 -> 2, so the effect's sole job is to focus the
  // freshly-mounted input. Nothing to reset here.
  useEffect(() => {
    if (step === 2) inputRef.current?.focus();
  }, [step]);

  useEffect(() => {
    let cancelled = false;

    // All state writes live inside the async closure so none run synchronously
    // in the effect body (keeps React from cascading renders).
    const run = async () => {
      if (!debouncedQuery) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        let data: string[];
        if (onSearch) {
          data = await onSearch(debouncedQuery);
        } else {
          await new Promise<void>((r) => setTimeout(r, 300));
          data = items.filter((item) =>
            item.toLowerCase().includes(debouncedQuery.trim().toLowerCase())
          );
        }
        if (!cancelled) setResults(data.slice(0, maxResults));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [debouncedQuery, items, onSearch, maxResults]);

  const btnPadding = isUnsupported ? "7px 14px" : "12px 24px";
  const resultPadding = isUnsupported ? "9px 14px" : "14px 24px";

  return (
    <div ref={containerRef} className={cn("relative inline-flex items-center justify-center", className)}>
      {/* Keyframe injection for loading spinner */}
      <style>{`
        .gooey-search-loading {
          animation: gooeySearchSpin 0.5s linear infinite;
          transform-origin: center center;
        }
        @keyframes gooeySearchSpin { to { transform: rotate(180deg); } }
        .gooey-search-input::placeholder { color: #ffffff; opacity: 0.8; }
      `}</style>

      {/* SVG gooey filter — zero size, no layout impact */}
      <svg aria-hidden="true" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
        <defs>
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -15"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Gooey container — this is where the morphing magic happens */}
      <div
        style={{
          filter: isUnsupported ? "none" : `url(#${filterId})`,
          cursor: "pointer",
          maxWidth: "max-content",
          position: "relative",
        }}
      >
        {/* Results — z-index -1 so they live "behind" the button until animated out */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key="results-wrapper"
            role="listbox"
            aria-label="Search results"
            style={{ position: "relative", zIndex: -1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ delay: isUnsupported ? 0.5 : 1.25, duration: 0.5 }}
          >
            <AnimatePresence mode="popLayout">
              {results.map((item, index) => (
                <motion.div
                  key={item}
                  role="option"
                  tabIndex={0}
                  onClick={() => onSelect?.(item)}
                  onKeyDown={(e) => e.key === "Enter" && onSelect?.(item)}
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                  variants={getResultVariants(index, isUnsupported)}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={getResultTransition(index)}
                  style={{
                    backgroundColor: "rgba(28, 28, 30, 0.98)",
                    backdropFilter: "blur(4px)",
                    WebkitBackdropFilter: "blur(4px)",
                    border: "2px solid rgba(255, 255, 255, 0.24)",
                    borderRadius: 40,
                    padding: resultPadding,
                    width: "100%",
                    color: "#ffffff",
                    position: "absolute",
                    left: isUnsupported ? 0 : -40,
                    fontSize: 15,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <InfoSvgIcon index={index} />
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.12 + 0.3 }}
                      style={{ position: "relative", top: -0.35 }}
                    >
                      {item}
                    </motion.span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* Morphing search button */}
        <motion.div
          variants={buttonMotionVariants}
          initial="step1"
          animate={step === 1 ? "step1" : "step2"}
          transition={{ duration: 0.75, type: "spring", bounce: 0.15 }}
          onClick={() => step === 1 && setStep(2)}
          whileHover={{ scale: step === 2 ? 1 : 1.05 }}
          whileTap={{ scale: 0.95 }}
          role={step === 1 ? "button" : undefined}
          aria-label={step === 1 ? "Open search" : undefined}
          className="rounded-full"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(28, 28, 30, 0.98)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            border: "1px solid rgba(255, 255, 255, 0.63)",
            color: "#ffffff",
            cursor: "pointer",
            letterSpacing: -0.5,
            outline: "none",
            padding: step === 1 ? 0 : btnPadding,
            height: 80,
          }}
        >
          {step === 1 ? (
            <span
              style={{
                pointerEvents: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
                color: "#ffffff",
              }}
            >
              <SearchSvgIcon isUnsupported={isUnsupported} />
            </span>
          ) : (
            <input
              ref={inputRef}
              type="text"
              className="gooey-search-input"
              placeholder={placeholder}
              aria-label="Search input"
              onChange={(e) => setSearchText(e.target.value)}
              style={{
                width: "100%",
                backgroundColor: "transparent",
                outline: "none",
                border: "none",
                color: "#ffffff",
                fontSize: 15,
              }}
            />
          )}
        </motion.div>

        {/* Floating icon bubble */}
        <AnimatePresence mode="wait">
          {step === 2 && (
            <motion.div
              key="icon-bubble"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={iconMotionVariants}
              transition={{ delay: 0.1, duration: 0.85, type: "spring", bounce: 0.15 }}
              style={{
                position: "absolute",
                backgroundColor: "rgba(28, 28, 30, 0.98)",
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                width: isUnsupported ? 60 : 80,
                height: isUnsupported ? 60 : 80,
                right: -5,
                top: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 9999,
                color: "#ffffff",
              }}
            >
              {isLoading ? <LoadingSvgIcon /> : <SearchSvgIcon isUnsupported={isUnsupported} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default GooeySearch;
