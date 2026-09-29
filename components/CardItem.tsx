"use client";

import React, { useRef, useState, MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import { Download, Heart, Check, Github, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";
import { useDeviceMotion } from "@/hooks/useDeviceMotion";
import { useEffect } from "react";
import { CardData } from "@/lib/data";
import { downloadCardAsPng } from "@/lib/downloader";

interface CardItemProps {
  card: CardData;
  onClick?: () => void;
}

export default function CardItem({ card, onClick }: CardItemProps) {
  const { t, language } = useLanguage();
  const boundingRef = useRef<HTMLDivElement>(null);
  const cardDomRef = useRef<HTMLDivElement>(null);
  
  const [isHovered, setIsHovered] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const { xPct: deviceX, yPct: deviceY, requestPermission } = useDeviceMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  
  useEffect(() => {
    return deviceX.on("change", (val) => {
      if (val !== 0) setIsHovered(true);
      x.set(val);
    });
  }, [deviceX, x]);
  
  useEffect(() => {
    return deviceY.on("change", (val) => {
      if (val !== 0) setIsHovered(true);
      y.set(val);
    });
  }, [deviceY, y]);
  

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 40 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 40 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["4deg", "-4deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-4deg", "4deg"]);
  
  
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);
  const glareBackground = useMotionTemplate`radial-gradient(circle 280px at ${glareX} ${glareY}, rgba(255,255,255,0.18), transparent 80%)`;


  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!boundingRef.current) return;
    const rect = boundingRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDownloading) return;
    
    try {
      setIsDownloading(true);
      await downloadCardAsPng(card, []);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    } catch (err) {
      console.error("Failed to download image", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="group flex flex-col gap-5">
      <motion.div
        layoutId={`card-${card.id}`}
        ref={boundingRef}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          x.set(0);
          y.set(0);
        }}
        animate={{ 
          y: isHovered ? -8 : 0,
          scale: isHovered ? 1.02 : 1 
        }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
        whileTap={{ scale: 0.98 }}
        className="perspective-[1200px] cursor-pointer z-10 hover:z-20 relative w-full"
        style={{ perspective: "1200px" }}
      >
        <motion.div
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
            willChange: "transform",
            boxShadow: isHovered
              ? "0 6px 12px -2px rgba(0, 0, 0, 0.45), 0 24px 48px -8px rgba(0, 0, 0, 0.85), inset 0 1px 1px rgba(255, 255, 255, 0.5), inset 0 -1px 1px rgba(0, 0, 0, 0.4)"
              : "0 2px 4px rgba(0, 0, 0, 0.4), 0 12px 28px -6px rgba(0, 0, 0, 0.7), inset 0 1px 0.5px rgba(255, 255, 255, 0.35), inset 0 -1px 1px rgba(0, 0, 0, 0.5)"
          }}
          className="relative w-full aspect-[1.586/1] rounded-[20px] transition-all duration-500 ease-out border border-black/20 group-hover:border-white/20"
        >
          {/* This div is the actual target for html-to-image so we don't capture 3D transform skewness */}
          <div 
            ref={cardDomRef}
            className="absolute inset-0 rounded-[20px] overflow-hidden bg-[#0A0A0C]"
            style={{ transform: "translateZ(0px)" }}
          >
            {/* Shimmer Skeleton (shown until image loaded) */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-white/5 animate-pulse z-10 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />
              </div>
            )}
            
            {/* Real Image Background */}
            <img 
              src={card.imageUrl} 
              alt={language === 'en' ? (card.titleEn || card.title) : card.title} 
              crossOrigin="anonymous" 
              loading="lazy"
              decoding="async"
              onLoad={() => setImageLoaded(true)}
              className={cn(
                "absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
            />
            
            {/* Light Sheen Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-white/[0.05] to-transparent pointer-events-none" />

            {/* Hardware Mock Elements */}
            
            {/* On-Card Info Bar (baked into the downloaded image) */}
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent backdrop-blur-[2px]" style={{ transform: "translateZ(12px)" }}>
               <h3 className="text-white font-bold text-lg tracking-wide">{language === 'en' ? (card.titleEn || card.title) : card.title}</h3>
               <p className="text-white/70 text-sm mt-0.5">CardCraft Pass</p>
            </div>
          </div>

          {/* 1px Inner Highlight Stroke (Glass reflection) overlaying the 3D card */}
          <div className="absolute inset-0 z-30 pointer-events-none rounded-[20px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15),inset_0_1px_2px_rgba(255,255,255,0.2)]" />

          {/* Dynamic Spotlight Glare */}
          <motion.div
            className="absolute inset-0 z-40 pointer-events-none mix-blend-screen opacity-0 transition-opacity duration-300 rounded-[20px] overflow-hidden"
            style={{
              background: glareBackground,
              opacity: isHovered ? 1 : 0,
            }}
          />
        
        {/* Hover Quick Action Pill */}
        <div className="absolute inset-0 z-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ transform: "translateZ(24px)" }}>
          <button className="pointer-events-auto flex items-center gap-2 px-5 py-2.5 rounded-full apple-glass text-white font-medium text-sm shadow-[0_8px_32px_rgba(0,0,0,0.5)] transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:scale-105 active:scale-[0.98] overflow-hidden relative"
            onClick={(e) => {
              e.stopPropagation();
              if (onClick) onClick();
            }}
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            {t.gallery.hoverCustomBtn}
            <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] hover:animate-[shimmer_1.5s_infinite]" />
          </button>
        </div>
        </motion.div>
      </motion.div>


      {/* External Info Bar (Liquid Glass Panel) */}
      <div className="bg-black/45 backdrop-blur-md rounded-[20px] p-3 flex items-center justify-between mt-1 transition-colors duration-300 relative z-0">
        <div className="flex flex-col gap-1 overflow-hidden">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white/90 text-sm truncate">{language === 'en' ? (card.titleEn || card.title) : card.title}</h3>
            {card.source === "github" && card.sourceUrl && (
              <a 
                href={card.sourceUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="bg-white/10 hover:bg-white/20 p-1 rounded-md transition-colors"
                title="View on GitHub"
                onClick={(e) => e.stopPropagation()}
              >
                <Github className="w-3 h-3 text-zinc-300" />
              </a>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex-shrink-0 shadow-sm" />
            <p className="text-[11px] text-zinc-400 truncate">
              {t.card.by} <span className="text-zinc-300 hover:text-white transition-colors cursor-pointer">{card.author}</span>
            </p>
          </div>
          
          {/* AI Intelligence Match Badges */}
          {card.matchScore ? (
            <div className="flex flex-col gap-1 mt-1 overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold bg-amber-500 text-black shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                  {card.matchScore}% Match
                </span>
                {card.aiReason && (
                  <span className="text-[9px] text-zinc-400 truncate flex-1">
                    {card.aiReason}
                  </span>
                )}
              </div>
            </div>
          ) : (card.scene || card.atmosphere || card.palette) ? (
            <div className="flex items-center gap-1.5 mt-0.5 overflow-hidden">
              {card.scene && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 truncate max-w-[80px]">
                  {card.scene}
                </span>
              )}
              {card.atmosphere && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 truncate max-w-[80px]">
                  {card.atmosphere}
                </span>
              )}
              {card.palette && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 truncate max-w-[60px]">
                  {card.palette}
                </span>
              )}
            </div>
          ) : null}
        </div>
        
        <div className="flex items-center gap-3 pl-2">
          <div className="flex items-center gap-1 text-zinc-500 group-hover:text-zinc-300 transition-colors">
            <Heart className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{card.likes}</span>
          </div>
          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            title={t.card.download}
            className={cn(
              "p-2.5 rounded-full transition-all active:scale-90 border shadow-[0_0_10px_rgba(255,255,255,0)] hover:shadow-[0_0_15px_rgba(255,255,255,0.15)] disabled:opacity-50",
              downloaded 
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50" 
                : "bg-white/10 hover:bg-white/20 text-white border-white/10"
            )}
          >
            {downloaded ? (
              <Check className="w-[14px] h-[14px]" />
            ) : isDownloading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <div className="w-[14px] h-[14px] border-2 border-white/30 border-t-white rounded-full" />
              </motion.div>
            ) : (
              <Download className="w-[14px] h-[14px]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
