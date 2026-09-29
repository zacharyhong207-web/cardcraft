'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown, Sparkles, Layers, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export function AppleHeroStage() {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);

  // 监听整个 Hero 容器的滚动进度 (0 -> 1)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // 标语淡出与上移
  const titleOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const titleY = useTransform(scrollYProgress, [0, 0.35], [0, -60]);

  // 左侧卡片：向左旋转散开并放大
  const leftCardX = useTransform(scrollYProgress, [0, 0.7], [0, -220]);
  const leftCardRotateZ = useTransform(scrollYProgress, [0, 0.7], [0, -14]);
  const leftCardRotateY = useTransform(scrollYProgress, [0, 0.7], [0, 18]);
  const leftCardScale = useTransform(scrollYProgress, [0, 0.7], [0.95, 1.05]);

  // 右侧卡片：向右旋转散开并放大
  const rightCardX = useTransform(scrollYProgress, [0, 0.7], [0, 220]);
  const rightCardRotateZ = useTransform(scrollYProgress, [0, 0.7], [0, 14]);
  const rightCardRotateY = useTransform(scrollYProgress, [0, 0.7], [0, -18]);
  const rightCardScale = useTransform(scrollYProgress, [0, 0.7], [0.95, 1.05]);

  // 中间主卡片：向前浮起突出，随后逐渐融入下方
  const centerCardScale = useTransform(scrollYProgress, [0, 0.5, 0.85], [1, 1.15, 0.95]);
  const centerCardY = useTransform(scrollYProgress, [0, 0.7], [0, 30]);

  // 底部引导提示淡出
  const hintOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  // 滚动时浮现的 3 联特性标签
  const badgesOpacity = useTransform(scrollYProgress, [0.35, 0.65], [0, 1]);
  const badgesY = useTransform(scrollYProgress, [0.35, 0.65], [30, 0]);

  return (
    <div ref={containerRef} className="relative w-full h-[220vh] bg-black">
      {/* 保持固定在屏幕上的全屏视觉展台 */}
      <div className="sticky top-0 min-h-[100dvh] h-full w-full flex flex-col items-center justify-between overflow-x-hidden overflow-y-visible px-4 pt-28 pb-20 select-none perspective-[1400px]">
        
        {/* 背景液态氛围光 */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-blue-600/20 via-purple-600/15 to-transparent rounded-full blur-[140px] pointer-events-none" />

        {/* 顶部标语区（Apple 官网标志性巨幅标题） */}
        <motion.div
          style={{ opacity: titleOpacity, y: titleY }}
          className="relative z-10 text-center max-w-4xl mt-6 sm:mt-12"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-zinc-300 text-xs font-medium tracking-wide mb-4 backdrop-blur-xl">
            <span className="text-white"></span>
            <span>{t.hero.badge}</span>
          </div>
          <h1 className="text-4xl sm:text-7xl font-extrabold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-b from-white via-white/95 to-white/40">
            {t.hero.title}
          </h1>
          <p className="mt-4 text-sm sm:text-lg text-zinc-400 max-w-xl mx-auto font-normal">
            {t.hero.subtitle}
          </p>
        </motion.div>

        {/* 核心 3D 卡片悬浮与扇形散开舞台 */}
        <div className="relative w-full max-w-xl h-64 sm:h-80 flex items-center justify-center my-auto">
          
          {/* 左翼卡片（如：木刻世界地图） */}
          <motion.div
            style={{
              x: leftCardX,
              rotateZ: leftCardRotateZ,
              rotateY: leftCardRotateY,
              scale: leftCardScale,
              transformStyle: 'preserve-3d',
            }}
            className="absolute w-72 sm:w-[400px] aspect-[1.586/1] rounded-[24px] overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.85)] border border-white/15 cursor-pointer will-change-transform"
          >
            <img
              src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1200&auto=format&fit=crop"
              className="w-full h-full object-cover"
              alt="World Map Card"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
            <div className="absolute top-4 left-4 text-xs font-semibold text-white drop-shadow-md">
              {t.hero.card1Title}
            </div>
            <div className="absolute bottom-4 left-4 h-4 w-auto">
              <img src="/logos/visa.svg" className="h-full w-auto drop-shadow-lg brightness-0 invert opacity-90" alt="Visa" />
            </div>
          </motion.div>

          {/* 右翼卡片（如：新宿雨夜） */}
          <motion.div
            style={{
              x: rightCardX,
              rotateZ: rightCardRotateZ,
              rotateY: rightCardRotateY,
              scale: rightCardScale,
              transformStyle: 'preserve-3d',
            }}
            className="absolute w-72 sm:w-[400px] aspect-[1.586/1] rounded-[24px] overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.85)] border border-white/15 cursor-pointer will-change-transform"
          >
            <img
              src="https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1200&auto=format&fit=crop"
              className="w-full h-full object-cover"
              alt="Tokyo Night Card"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
            <div className="absolute top-4 left-4 text-xs font-semibold text-white drop-shadow-md">
              {t.hero.card2Title}
            </div>
            <div className="absolute bottom-4 right-4 h-5 w-auto">
              <img src="/logos/mastercard.svg" className="h-full w-auto drop-shadow-lg" alt="Mastercard" />
            </div>
          </motion.div>

          {/* 中间主卡（带银联官方矢量与光效） */}
          <motion.div
            style={{
              scale: centerCardScale,
              y: centerCardY,
              transformStyle: 'preserve-3d',
            }}
            className="relative z-20 w-80 sm:w-[440px] aspect-[1.586/1] rounded-[26px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.95)] border border-white/30 group will-change-transform"
          >
            <img
              src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop"
              className="w-full h-full object-cover"
              alt="Featured Card"
            />
            {/* 细腻环境漫反射光泽 */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/15 via-transparent to-black/40 pointer-events-none" />
            
            {/* 右下角官方银联标 */}
            <div className="absolute bottom-5 right-5 h-7 w-auto">
              <img src="/logos/unionpay.svg" className="h-full w-auto drop-shadow-lg" alt="UnionPay" />
            </div>

            {/* 卡面状态 */}
            <div className="absolute bottom-5 left-5 pointer-events-none">
              <div className="text-sm font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {t.hero.card3Title}
              </div>
              <div className="text-[11px] text-zinc-300 mt-0.5 tracking-wide drop-shadow">
                {t.hero.card3Subtitle}
              </div>
            </div>
          </motion.div>
        </div>

        {/* 随滚动浮现的核心特性浮动卡片（Apple Bento 标签） */}
        <motion.div
          style={{ opacity: badgesOpacity, y: badgesY }}
          className="relative z-20 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl mt-12 mb-12 sm:mb-8"
        >
          <div className="flex items-center gap-4 px-5 py-4 rounded-[20px] bg-white/[0.05] border border-white/10 backdrop-blur-2xl apple-glass shadow-lg">
            <Layers className="w-5 h-5 text-blue-400 shrink-0"/>
            <div className="text-left flex flex-col justify-center">
              <div className="text-xs sm:text-sm font-semibold text-white/90 leading-tight mb-1">{t.hero.feature1Title}</div>
              <div className="text-[11px] sm:text-xs text-zinc-400 leading-snug">{t.hero.feature1Desc}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 px-5 py-4 rounded-[20px] bg-white/[0.05] border border-white/10 backdrop-blur-2xl apple-glass shadow-lg">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0"/>
            <div className="text-left flex flex-col justify-center">
              <div className="text-xs sm:text-sm font-semibold text-white/90 leading-tight mb-1">{t.hero.feature2Title}</div>
              <div className="text-[11px] sm:text-xs text-zinc-400 leading-snug">{t.hero.feature2Desc}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 px-5 py-4 rounded-[20px] bg-white/[0.05] border border-white/10 backdrop-blur-2xl apple-glass shadow-lg">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0"/>
            <div className="text-left flex flex-col justify-center">
              <div className="text-xs sm:text-sm font-semibold text-white/90 leading-tight mb-1">{t.hero.feature3Title}</div>
              <div className="text-[11px] sm:text-xs text-zinc-400 leading-snug">{t.hero.feature3Desc}</div>
            </div>
          </div>
        </motion.div>

        {/* 底部下滑引导胶囊（向下滑动即可进入底库） */}
        <motion.div
          style={{ opacity: hintOpacity }}
          className="relative z-10 flex flex-col items-center gap-2 text-zinc-500"
        >
          <span className="text-xs tracking-widest uppercase font-mono text-zinc-400">
            {t.hero.scrollPrompt}
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-4 h-4 text-zinc-400"/>
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}
