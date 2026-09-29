import React from "react";

import { ChipStyle } from "@/lib/data";

export function EMVChip({ style }: { style: ChipStyle }) {
  if (style === "none") return null;
  
  const isSilver = style === "silver";
  const bgGradient = isSilver 
    ? "from-[#e0e0e0] via-[#c0c0c0] to-[#a0a0a0]" 
    : "from-[#ffd700] via-[#d4af37] to-[#aa8323]";
  const borderColor = isSilver ? "border-gray-300/50" : "border-yellow-200/50";
  const linesColor = isSilver ? "bg-gray-800/30" : "bg-yellow-900/30";
  const linesBorder = isSilver ? "border-gray-800/30" : "border-yellow-900/30";

  return (
    <div className={`absolute top-6 left-6 z-20 w-12 h-9 rounded-[8px] bg-gradient-to-br ${bgGradient} shadow-[0_2px_10px_rgba(0,0,0,0.5)] overflow-hidden border ${borderColor}`}>
      {/* Metal brushing texture */}
      <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,#fff_2px,#fff_4px)]" />
      {/* Chip contact lines */}
      <div className={`absolute inset-[3px] border-[1.5px] ${linesBorder} rounded-[4px]`} />
      <div className={`absolute top-[3px] bottom-[3px] left-1/2 -translate-x-1/2 w-[1.5px] ${linesColor}`} />
      <div className={`absolute left-[3px] right-[3px] top-1/2 -translate-y-1/2 h-[1.5px] ${linesColor}`} />
    </div>
  );
}
