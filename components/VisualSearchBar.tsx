'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Camera, Sparkles, X, SlidersHorizontal, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface VisualSearchBarProps {
  onSearchChange: (query: string, visualFilter?: string) => void;
  onImageSearchMatch?: (fingerprint: any) => void;
  totalCards: number;
}

export function VisualSearchBar({
  onSearchChange,
  onImageSearchMatch,
  totalCards
}: VisualSearchBarProps) {
  const { language } = useLanguage();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [isScanningImage, setIsScanningImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Apple 级视觉色彩滤镜
  const colorPresets = [
    { id: 'dark', labelZh: '深空暗黑', labelEn: 'Space Dark', color: '#18181b', border: '#3f3f46' },
    { id: 'gold', labelZh: '暮光暖金', labelEn: 'Sunset Gold', color: '#b45309', border: '#f59e0b' },
    { id: 'blue', labelZh: '冷雨钴蓝', labelEn: 'Cobalt Blue', color: '#1d4ed8', border: '#60a5fa' },
    { id: 'emerald', labelZh: '松石墨绿', labelEn: 'Emerald Green', color: '#047857', border: '#34d399' },
    { id: 'white', labelZh: '极简银白', labelEn: 'Minimal Silver', color: '#e4e4e7', border: '#ffffff' },
  ];

  // 视觉意象探索标签
  const vibePresets = [
    { zh: '雨夜霓虹', en: 'Rainy Neon' },
    { zh: '日照金山', en: 'Alpenglow' },
    { zh: '中世纪古堡', en: 'Medieval Castle' },
    { zh: '重装机车', en: 'Locomotive' },
    { zh: '羊皮纸地图', en: 'Vintage Map' },
  ];

  const handleQueryChange = (val: string) => {
    setQuery(val);
    onSearchChange(val, activeColor || undefined);
  };

  const handleColorToggle = (id: string) => {
    const nextColor = activeColor === id ? null : id;
    setActiveColor(nextColor);
    onSearchChange(query, nextColor || undefined);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsScanningImage(true);
    const url = URL.createObjectURL(file);
    const { extractImageFingerprint } = await import('@/lib/visualSearch');
    const fp = await extractImageFingerprint(url);
    setIsScanningImage(false);
    if (onImageSearchMatch) onImageSearchMatch(fp);
    setActiveColor(fp.dominantHue);
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto z-40">
      {/* 隐藏的图片上传入口 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* 主搜索胶囊 */}
      <div
        className={`relative flex items-center h-14 w-full rounded-[24px] transition-all duration-300 ${isFocused ? "apple-glass shadow-[0_12px_40px_rgba(0,0,0,0.8)] scale-[1.01]" : "apple-glass apple-glass-hover shadow-lg"}`}
      >
        <Search className="w-5 h-5 ml-4 text-zinc-400 shrink-0"/>
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={
            language === 'zh'
              ? '探索卡面、画面主体、光影色系（支持中英双向与视觉意象）...'
              : 'Search cards by subject, lighting, mood or style...'
          }
          className="w-full bg-transparent px-3 text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none"
        />

        {query && (
          <button
            onClick={() => handleQueryChange('')}
            className="p-1 mr-2 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4"/>
          </button>
        )}

        {/* 视觉扫描透镜（以图搜图） */}
        <button
          onClick={() => fileInputRef.current?.click()}
          title={language === 'zh' ? '上传图片提取相似卡面' : 'Visual Search by Image'}
          className="flex items-center gap-1.5 px-3 py-1.5 mr-2 rounded-xl apple-glass text-xs text-zinc-300 transition-all hover:scale-105 active:scale-[0.98] shrink-0"
        >
          <Camera className={`w-3.5 h-3.5 ${isScanningImage ? 'animate-spin text-amber-400' : 'text-zinc-300'}`} />
          <span className="hidden sm:inline font-mono">
            {isScanningImage ? (language === 'zh' ? '扫描中...' : 'Scanning...') : (language === 'zh' ? '识图' : 'Visual')}
          </span>
        </button>
      </div>

      {/* 展开的 Apple 风格视觉探索底板 */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 top-16 p-4 rounded-[28px] apple-glass shadow-[0_20px_50px_rgba(0,0,0,0.9)]"
          >
            {/* 色彩谱系探索 */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-2 px-1">
                <span className="font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400"/>
                  {language === 'zh' ? '视觉色谱提取' : 'Palette Extraction'}
                </span>
                {activeColor && (
                  <button
                    onClick={() => handleColorToggle(activeColor)}
                    className="text-[11px] text-zinc-500 hover:text-zinc-300"
                  >
                    {language === 'zh' ? '重置色彩' : 'Reset'}
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {colorPresets.map((item) => {
                  const isSelected = activeColor === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleColorToggle(item.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-all ${
                        isSelected
                          ? 'bg-white text-black font-semibold shadow-md scale-105'
                          : 'bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 border border-white/10'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border"
                        style={{ backgroundColor: item.color, borderColor: item.border }}
                      />
                      <span>{language === 'zh' ? item.labelZh : item.labelEn}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 意象与氛围快速探索 */}
            <div>
              <div className="text-xs text-zinc-400 mb-2 px-1 font-medium">
                {language === 'zh' ? '视觉意象与光影' : 'Lighting & Ambience'}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {vibePresets.map((vibe, idx) => {
                  const label = language === 'zh' ? vibe.zh : vibe.en;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleQueryChange(label)}
                      className="px-2.5 py-1 rounded-lg text-xs bg-white/[0.04] hover:bg-white/[0.1] text-zinc-400 hover:text-white transition-colors border border-white/5"
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 点击外部自动关闭展开面板 */}
      {isFocused && (
        <div
          className="fixed inset-0 -z-10"
          onClick={() => setIsFocused(false)}
        />
      )}
    </div>
  );
}
