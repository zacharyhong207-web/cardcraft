"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Wallet, Sparkles, Image as ImageIcon, LayoutDashboard, Plus, Info, BookOpen, ImagePlus } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useStudio } from "@/components/StudioProvider";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const { openStudio, openAiModal, isAiModalOpen, isStudioOpen } = useStudio();

  const navItems = [
    { href: "/#intro", label: t.nav.intro, icon: BookOpen },
    { href: "/#gallery", label: t.nav.gallery, icon: LayoutDashboard },
    { href: "/studio", label: t.nav.studio, icon: ImagePlus },
    { href: "/ai", label: t.nav.aiGenerator, icon: Sparkles },
    { href: "/philosophy", label: t.nav.philosophy, icon: Info },
  ];

  const [prevNavIndex, setPrevNavIndex] = useState(() => Math.max(0, navItems.findIndex(item => pathname === item.href)));
  const [isNavWobbling, setIsNavWobbling] = useState(false);

  const [prevLangIndex, setPrevLangIndex] = useState(language === "zh" ? 0 : 1);
  const [isLangWobbling, setIsLangWobbling] = useState(false);
  
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, index: number, href: string) => {
    if (href === '/ai') {
      e.preventDefault();
      openAiModal();
      return;
    }
    if (href === '/studio') {
      e.preventDefault();
      openStudio();
      return;
    }
    if (href.startsWith('/#') && pathname === '/') {
      e.preventDefault();
      const el = document.querySelector(href.substring(1));
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }

    

    e.preventDefault();
    const currentIndex = Math.max(0, navItems.findIndex(item => (item.href === '/ai' && isAiModalOpen) || (item.href === '/studio' && isStudioOpen) || (!isAiModalOpen && !isStudioOpen && pathname === item.href)));
    if (index === currentIndex) return;
    setPrevNavIndex(currentIndex);
    setIsNavWobbling(true);
    router.push(href);
  };

  const handleLangSelect = (lang: "zh" | "en", index: number) => {
    const currentIndex = language === "zh" ? 0 : 1;
    if (index === currentIndex) return;
    setPrevLangIndex(currentIndex);
    setIsLangWobbling(true);
    setLanguage(lang);
  };

  const currentNavIndex = Math.max(0, navItems.findIndex(item => (item.href === '/ai' && isAiModalOpen) || (item.href === '/studio' && isStudioOpen) || (!isAiModalOpen && !isStudioOpen && pathname === item.href)));
  const navDelta = currentNavIndex - prevNavIndex;
  const navMoveRight = navDelta > 0;
  const navStretch = 1.2 + Math.min(Math.abs(navDelta) * 0.05, 0.2);

  const currentLangIndex = language === "zh" ? 0 : 1;
  const langDelta = currentLangIndex - prevLangIndex;
  const langMoveRight = langDelta > 0;
  const langStretch = 1.25;

  return (
    <nav className="sticky top-4 z-50 max-w-5xl mx-auto liquid-panel-luminous rounded-[24px] px-4 py-2.5 flex items-center justify-between">
      
      {/* Logo */}
      <Link href="/" onClick={(e) => { if (pathname === '/') { e.preventDefault(); const intro = document.getElementById("intro"); if(intro) intro.scrollIntoView({ behavior: "smooth" });; } }} className="flex items-center gap-2 group ml-1">
        <div className="relative flex items-center justify-center w-8 h-8 rounded-[10px] bg-gradient-to-tr from-zinc-700/80 to-zinc-500/80 border border-white/20 shadow-sm overflow-hidden group-hover:scale-105 transition-transform duration-300">
          <div className="absolute inset-0 bg-white/20 mix-blend-overlay"></div>
          <Wallet className="w-4 h-4 text-white relative z-10 drop-shadow-md" />
        </div>
        <span className="text-lg font-bold tracking-tight text-white/90 hidden sm:block ml-1">
          CardCraft
        </span>
      </Link>

      {/* Center Nav */}
      <div className="hidden md:flex items-center p-1 bg-zinc-900/50 backdrop-blur-xl border border-white/[0.06] rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
        {navItems.map((item, index) => {
          const isActive = (item.href === '/ai' && isAiModalOpen) || (item.href === '/studio' && isStudioOpen) || (!isAiModalOpen && !isStudioOpen && pathname === item.href);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => handleNavClick(e, index, item.href)}
              className="relative px-5 py-1.5 text-sm transition-colors rounded-full flex items-center gap-2 group select-none"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              {isActive && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute inset-0 rounded-full liquid-lens"
                  initial={false}
                  animate={
                    isNavWobbling
                      ? {
                          scaleX: [1, navMoveRight ? navStretch : navStretch, 0.88, 1.05, 0.98, 1],
                          scaleY: [1, 0.82, 1.12, 0.96, 1.02, 1],
                        }
                      : { scaleX: 1, scaleY: 1 }
                  }
                  onAnimationComplete={() => setIsNavWobbling(false)}
                  transition={{
                    layout: { type: "spring", stiffness: 420, damping: 22, mass: 0.9 },
                    scaleX: { duration: 0.55, ease: [0.34, 1.56, 0.64, 1] },
                    scaleY: { duration: 0.55, ease: [0.34, 1.56, 0.64, 1] },
                  }}
                />
              )}
              <span className={cn("relative z-10 flex items-center gap-1.5 transition-colors duration-200", isActive ? "text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.45)] font-semibold" : "text-zinc-400 group-hover:text-zinc-200 font-medium")}>
                <Icon className="w-[15px] h-[15px]" />
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Language Toggle */}
        <div className="flex items-center p-0.5 bg-zinc-900/50 backdrop-blur-md rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] border border-white/[0.06]">
          {(["zh", "en"] as const).map((lang, index) => {
            const isActive = language === lang;
            return (
              <button
                key={lang}
                onClick={() => handleLangSelect(lang, index)}
                className="relative px-3 py-1 text-[11px] tracking-wider uppercase rounded-full transition-colors select-none"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                {isActive && (
                  <motion.div
                    layoutId="lang-indicator"
                    className="absolute inset-0 rounded-full liquid-lens"
                    initial={false}
                    animate={
                      isLangWobbling
                        ? {
                            scaleX: [1, langMoveRight ? langStretch : langStretch, 0.88, 1.05, 0.98, 1],
                            scaleY: [1, 0.82, 1.12, 0.96, 1.02, 1],
                          }
                        : { scaleX: 1, scaleY: 1 }
                    }
                    onAnimationComplete={() => setIsLangWobbling(false)}
                    transition={{
                      layout: { type: "spring", stiffness: 420, damping: 22, mass: 0.9 },
                      scaleX: { duration: 0.55, ease: [0.34, 1.56, 0.64, 1] },
                      scaleY: { duration: 0.55, ease: [0.34, 1.56, 0.64, 1] },
                    }}
                  />
                )}
                <span className={cn("relative z-10 transition-colors duration-200", isActive ? "text-white font-bold drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]" : "text-zinc-500 hover:text-zinc-300 font-medium")}>{lang}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Action */}
        <button
          onClick={() => openStudio()}
          className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-white text-zinc-950 hover:bg-zinc-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          title={t.nav.newCard}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

          </nav>
  );
}
