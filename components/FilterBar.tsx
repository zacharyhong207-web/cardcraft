"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface Category {
  id: string;
  label: string;
}

interface FilterBarProps {
  categories: Category[];
  activeCategory: string;
  onSelect: (categoryId: string) => void;
}

export function FilterBar({ categories, activeCategory, onSelect }: FilterBarProps) {
  const [prevIndex, setPrevIndex] = useState(0);
  const [isWobbling, setIsWobbling] = useState(false);

  const activeIndex = categories.findIndex((c) => c.id === activeCategory);

  const handleSelect = (categoryId: string, index: number) => {
    if (index === activeIndex) return;
    setPrevIndex(activeIndex);
    setIsWobbling(true);
    onSelect(categoryId);
  };

  return (
    <div className="flex overflow-x-auto hide-scrollbar snap-x max-w-full relative apple-glass p-1.5 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
      {categories.map((category, index) => {
        const isActive = activeCategory === category.id;
        const delta = index - prevIndex;
        const moveRight = delta > 0;
        
        // Calculate stretch based on distance
        const stretchAmount = 1.2 + Math.min(Math.abs(delta) * 0.05, 0.2);

        return (
          <button
            key={category.id}
            onClick={() => handleSelect(category.id, index)}
            className="relative px-5 py-2 text-sm font-medium transition-colors z-10 select-none snap-center flex-shrink-0"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            {isActive && (
              <motion.div
                layoutId="liquidWaterPill"
                className="absolute inset-0 rounded-full liquid-lens"
                initial={false}
                animate={
                  isWobbling
                    ? {
                        scaleX: [1, moveRight ? stretchAmount : stretchAmount, 0.88, 1.05, 0.98, 1],
                        scaleY: [1, 0.82, 1.12, 0.96, 1.02, 1],
                      }
                    : { scaleX: 1, scaleY: 1 }
                }
                onAnimationComplete={() => setIsWobbling(false)}
                transition={{
                  layout: { type: "spring", stiffness: 420, damping: 22, mass: 0.9 },
                  scaleX: { duration: 0.55, ease: [0.34, 1.56, 0.64, 1] },
                  scaleY: { duration: 0.55, ease: [0.34, 1.56, 0.64, 1] },
                }}
              />
            )}
            <span
              className={cn(
                "relative z-20 transition-colors duration-200",
                isActive
                  ? "text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.45)] font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              {category.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
