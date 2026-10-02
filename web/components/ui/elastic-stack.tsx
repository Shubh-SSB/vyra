"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export interface ElasticStackItem {
  id: string | number;
  image?: string;
  name?: string;
  href?: string;
}

export interface ElasticStackProps extends React.HTMLAttributes<HTMLDivElement> {
  items: (ElasticStackItem | string)[];
  itemSize?: number;
  overlap?: number;
  pushForce?: number;
  scaleOnHover?: number;
  showTooltip?: boolean;
  tooltipClassName?: string;
  itemClassName?: string;
  onItemClick?: (item: ElasticStackItem) => void;
}

export function ElasticStack({
  items,
  itemSize = 70,
  overlap = 30,
  pushForce = 15,
  scaleOnHover = 1.25,
  showTooltip = true,
  tooltipClassName,
  itemClassName,
  onItemClick,
  className,
  ...props
}: ElasticStackProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const normalizedItems: ElasticStackItem[] = (items || []).map((item, idx) => {
    if (typeof item === "string") {
      const isUrl = item.startsWith("http") || item.startsWith("/") || item.startsWith("data:");
      return {
        id: `elastic-item-${idx}`,
        image: isUrl ? item : undefined,
        name: isUrl ? `Friend ${idx + 1}` : item,
      };
    }
    return item;
  });

  const total = normalizedItems.length;
  // Custom spring-like easing from the original CSS
  const springEasing = "linear(0, 0.79 14.4%, 1.026 22.4%, 1.164 31.2%, 1.207 38.2%, 1.208 46.2%, 1.033 80%, 1)";

  return (
    <div
      className={cn("flex items-center justify-center py-4", className)}
      onMouseLeave={() => setHoveredIndex(null)}
      {...props}
    >
      {normalizedItems.map((item, i) => {
        let translateX = 0;
        let scale = 1;
        let zIndex = i; // Base stacking order
        let isHovered = hoveredIndex === i;

        if (hoveredIndex !== null) {
          if (i > hoveredIndex) {
            translateX = Math.min(pushForce * (total - i - 1), overlap);
          } else if (i < hoveredIndex) {
            translateX = -Math.min(pushForce * i, overlap);
          } else {
            scale = scaleOnHover;
            zIndex = 100;
          }
        }

        const ItemComponent = item.href ? Link : "div";

        return (
          // @ts-ignore
          <ItemComponent
            key={item.id}
            href={item.href || ""}
            onMouseEnter={() => setHoveredIndex(i)}
            onClick={() => onItemClick?.(item)}
            className={cn(
              "relative flex items-center justify-center rounded-full isolate transition-all duration-700 bg-neutral-100 dark:bg-neutral-900",
              "border-2 border-white/55",
              isHovered ? "shadow-xl" : "shadow-sm",
              (onItemClick || item.href) && "cursor-pointer",
              itemClassName
            )}
            style={{
              width: itemSize,
              height: itemSize,
              marginLeft: i === 0 ? 0 : -overlap,
              transform: `translateX(${translateX}px) scale(${scale})`,
              transformOrigin: "center center",
              transitionTimingFunction: springEasing,
              zIndex,
            }}
          >
            {/* Tooltip to show name on hover */}
            <AnimatePresence>
              {showTooltip && isHovered && item.name && (
                <motion.div
                  initial={{ opacity: 0, y: 6, x: "-50%" }}
                  animate={{ opacity: 1, y: 0, x: "-50%" }}
                  exit={{ opacity: 0, y: 4, x: "-50%" }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className={cn(
                    "absolute -top-7 left-1/2 px-2.5 py-1 text-sm font-bold text-white backdrop-blur-md border-main border-2 rounded-xl pointer-events-none whitespace-nowrap z-50",
                    tooltipClassName
                  )}
                >
                  {item.name}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-main" />
                </motion.div>
              )}
            </AnimatePresence>

            {item.image ? (
              <img
                src={item.image}
                alt={item.name || `Avatar ${i}`}
                className="w-full h-full object-cover rounded-full pointer-events-none"
              />
            ) : (
              <div className="w-full h-full rounded-full flex items-center justify-center font-semibold text-neutral-500 dark:text-neutral-400">
                {item.name ? item.name.charAt(0) : i + 1}
              </div>
            )}
          </ItemComponent>
        );
      })}
    </div>
  );
}

export default ElasticStack;
