'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Layers, Sparkles, Smartphone } from 'lucide-react';

interface WelcomeModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export function WelcomeModal({ forceOpen, onClose }: WelcomeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    if (forceOpen !== undefined) {
      setIsOpen(forceOpen);
      return;
    }
    const hasSeen = localStorage.getItem('cardcraft_onboarded_v2');
    if (!hasSeen) {
      const timer = setTimeout(() => setIsOpen(true), 300);
      return () => clearTimeout(timer);
    }
  }, [forceOpen]);

  const handleDismiss = () => {
    localStorage.setItem('cardcraft_onboarded_v2', 'true');
    setIsOpen(false);
    if (onClose) onClose();
  };

  // 3 张演示卡面（使用已有资产）
  const showcaseCards = [
    {
      title: 'Class 66 重装内燃机车',
      img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
      badge: 'UnionPay'
    },
    {
      title: '歌舞伎町 · 新宿雨夜巡航',
      img: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1200&auto=format&fit=crop',
      badge: 'Apple'
    },
    {
      title: '寰宇漫游 · 木刻世界地图',
      img: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1200&auto=format&fit=crop',
      badge: 'Mastercard'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-hidden">
          {/* 超深邃 Apple 官网级暗化背板 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="absolute inset-0 bg-black/85 backdrop-blur-3xl"
          />

          {/* 主展示台容器 */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl max-h-[92vh] flex flex-col items-center justify-between rounded-[36px] border border-white/15 bg-gradient-to-b from-zinc-900/90 to-black/95 p-6 sm:p-10 shadow-[0_40px_100px_rgba(0,0,0,0.9)] backdrop-blur-2xl overflow-y-auto"
          >
            {/* 顶栏控制：品牌印记与关闭 */}
            <div className="w-full flex items-center justify-between">
              <span className="text-xs font-mono tracking-widest uppercase text-white/50 bg-white/[0.06] border border-white/10 px-3 py-1 rounded-full">
                Apple Wallet Pass Craft
              </span>
              <button
                onClick={handleDismiss}
                className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5"/>
              </button>
            </div>

            {/* 核心标语区（Apple 风格排版） */}
            <div className="text-center mt-4 sm:mt-2">
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-zinc-400">
                灵感，滑入钱包。
              </h2>
              <p className="mt-3 text-sm sm:text-base text-zinc-400 max-w-lg mx-auto">
                告别单调交通卡面。专为 iPhone 与 Apple Wallet 打造的无界视网膜卡面定制中心。
              </p>
            </div>

            {/* 动态舞台：3D 扇形堆叠卡片动效 */}
            <div className="relative w-full max-w-lg h-56 sm:h-72 my-6 flex items-center justify-center perspective-[1200px] select-none">
              {/* 卡片 1（左侧斜飞） */}
              <motion.div
                initial={{ rotateZ: 0, x: 0 }}
                animate={{ rotateZ: -12, x: -70, y: 10 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
                className="absolute w-64 sm:w-80 aspect-[1.586/1] rounded-2xl overflow-hidden shadow-2xl border border-white/15 opacity-80 hover:opacity-100 hover:scale-105 transition-all cursor-pointer"
              >
                <img src={showcaseCards[0].img} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-3 right-3 text-[10px] font-mono tracking-widest text-white/70 bg-black/40 px-2 py-0.5 rounded backdrop-blur-md">
                  1536×969 HD
                </div>
              </motion.div>

              {/* 卡片 2（右侧斜飞） */}
              <motion.div
                initial={{ rotateZ: 0, x: 0 }}
                animate={{ rotateZ: 14, x: 70, y: 15 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.25 }}
                className="absolute w-64 sm:w-80 aspect-[1.586/1] rounded-2xl overflow-hidden shadow-2xl border border-white/15 opacity-80 hover:opacity-100 hover:scale-105 transition-all cursor-pointer"
              >
                <img src={showcaseCards[2].img} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 text-xs font-semibold text-white">
                  {showcaseCards[2].title}
                </div>
              </motion.div>

              {/* 卡片 3（居中浮起，带流动微光） */}
              <motion.div
                initial={{ y: 30, scale: 0.9 }}
                animate={{ y: -5, scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.1 }}
                className="relative z-20 w-72 sm:w-96 aspect-[1.586/1] rounded-[22px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9)] border border-white/30 group"
              >
                <img src={showcaseCards[1].img} className="w-full h-full object-cover" />
                {/* 镜面扫光 */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                <div className="absolute top-4 left-4 flex items-center gap-1.5">
                  <div className="h-5 w-5 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <span className="text-[10px] text-white"></span>
                  </div>
                </div>
                <div className="absolute bottom-4 left-4">
                  <div className="text-sm font-bold text-white drop-shadow-md">
                    {showcaseCards[1].title}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    已就绪 · 双击侧边键即开刷
                  </div>
                </div>
              </motion.div>
            </div>

            {/* 底部 3 联极简特征微件（Apple Bento Feature Bar） */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full my-4">
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <Smartphone className="w-4 h-4"/>
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">1536×969 标准规范</div>
                  <div className="text-[11px] text-zinc-400">无拉伸适配 iOS 钱包</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Sparkles className="w-4 h-4"/>
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">官方矢量与高定工坊</div>
                  <div className="text-[11px] text-zinc-400">支持银联与 Apple 白标烫金</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Layers className="w-4 h-4"/>
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">纯净原画无损导出</div>
                  <div className="text-[11px] text-zinc-400">零多余文字，一键保存入包</div>
                </div>
              </div>
            </div>

            {/* 主操作行动按钮 */}
            <div className="w-full flex justify-center mt-2">
              <button
                onClick={handleDismiss}
                className="group flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-all shadow-[0_4px_24px_rgba(255,255,255,0.25)] active:scale-95"
              >
                <span>进入数字卡面库</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1"/>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
