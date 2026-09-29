"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useLanguage } from "@/lib/i18n";
import CardItem from "@/components/CardItem";
import { cn } from "@/lib/utils";
import { Shuffle, RefreshCw, Github, Search, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Fuse from "fuse.js";

import { AppleHeroStage } from "@/components/AppleHeroStage";
import { IntroStage } from "@/components/IntroStage";
import { QuickImport } from "@/components/QuickImport";
import { extractImageFingerprint, VisualFingerprint } from "@/lib/visualSearch";
import { searchCardsBilingual } from "@/lib/bilingualSearch";
import { VisualSearchBar } from "@/components/VisualSearchBar";
import { MyCollectionSection } from "@/components/MyCollectionSection";
import { Camera, ScanSearch, Sparkles, Plus } from "lucide-react";
import { CardData } from "@/lib/data";
import { BILINGUAL_MAP, ZH_TO_EN_MAP } from "@/lib/bilingualDictionary";
import { useStudio } from "@/components/StudioProvider";
import { downloadCardAsPng } from "@/lib/downloader";

const INITIAL_BATCH_SIZE = 12;

export default function GalleryPage() {
  const { t, language } = useLanguage();
  
  // Data state
  const [masterPool, setMasterPool] = useState<CardData[]>([]);
  const [customCards, setCustomCards] = useState<CardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [visualHue, setVisualHue] = useState<VisualFingerprint['dominantHue'] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // View state
  const { activeCard, setActiveCard, isStudioOpen, openStudio, closeStudio, openAiModal } = useStudio();
  const [showDock, setShowDock] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setShowDock(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const [displayedCount, setDisplayedCount] = useState(INITIAL_BATCH_SIZE);

  const [serverSearchResults, setServerSearchResults] = useState<CardData[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced API Search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setServerSearchResults(null);
      return;
    }
    
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery })
        });
        const data = await res.json();
        if (data.results) {
          setServerSearchResults(data.results);
        }
      } catch (err) {
        console.error('Search API error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const [isFetchingGithub, setIsFetchingGithub] = useState(false);

  // Initial Load from JSON
  useEffect(() => {
    fetch('/data/cards.json')
      .then(res => res.json())
      .then(data => {
        setMasterPool(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to load master pool:", err);
        setIsLoading(false);
      });
  }, []);

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape' && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen]);

  // Combined pool (Custom + Master)
  const allCards = useMemo(() => {
    return [...customCards, ...masterPool];
  }, [customCards, masterPool]);

  // Extract unique tags for the drawer
  const allUniqueTags = useMemo(() => {
    const tagSet = new Set<string>();
    allCards.forEach(card => card.tags?.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet);
  }, [allCards]);

const SYNONYM_MAP: Record<string, string[]> = {
  '香港': ['八达通', '油尖旺', 'mtr', 'hk'],
  '日本': ['suica', '西瓜卡', 'jr', '东京', '新干线'],
  '二次元': ['eva', 'nerv', '动漫', '高达', '宝可梦', '街机'],
  '动漫': ['eva', 'nerv', '二次元', '高达', 'rx-78'],
  '苹果': ['apple', '钛合金', 'cupertino'],
  '西瓜卡': ['suica', '企鹅', 'jr'],
  '交通': ['八达通', 'suica', '交通联合', '地铁', '公交', '路线图'],
};

  // 1. 初始化 Fuse 实例
  const fuse = useMemo(() => {
    return new Fuse(allCards, {
      keys: [
        { name: 'title', weight: 0.6 },
        { name: 'titleEn', weight: 0.5 },
        { name: 'scene', weight: 0.4 },
        { name: 'atmosphere', weight: 0.35 },
        { name: 'palette', weight: 0.3 },
        { name: 'keywords', weight: 0.3 },
        { name: 'tags', weight: 0.3 },
        { name: 'category', weight: 0.15 },
        { name: 'author', weight: 0.05 },
      ],
      threshold: 0.38,
      ignoreLocation: true,
      minMatchCharLength: 1,
    });
  }, [allCards]);

  // 2. 联动计算筛选列表（含同义词智能路由与中英双向映射）
  const activeFilteredCards = useMemo(() => {
    let basePool = allCards;
    
    // 如果有服务器返回的智能搜索结果，优先使用
    if (serverSearchResults !== null) {
      basePool = serverSearchResults;
    } 
    // 如果输入框有值但还没拿到服务器数据，就先临时用 Fuse 兜底
    else if (searchQuery.trim() !== '') {
      // 利用我们最先进的客户端双语同义词引爆引擎
      basePool = searchCardsBilingual(allCards, searchQuery);
    }

    // 叠加抽屉的多条件过滤
    return basePool.filter(card => {
      const matchesTags = selectedTags.length === 0 || 
        (card.tags && selectedTags.some(selected => card.tags.includes(selected)));

      const matchesChips = selectedChips.length === 0 ||
        (card.chipStyle && selectedChips.includes(card.chipStyle));

      return matchesTags && matchesChips;
    });
  }, [allCards, fuse, searchQuery, selectedTags, selectedChips, serverSearchResults]);

  // Reset displayed count when filters change
  useEffect(() => {
    setDisplayedCount(INITIAL_BATCH_SIZE);
  }, [activeFilteredCards]);

  const displayedCards = useMemo(() => {
    return activeFilteredCards.slice(0, displayedCount);
  }, [activeFilteredCards, displayedCount]);

  // Dynamic GitHub Fetcher (Client-Side)
  const cleanArtworkTitle = (rawName: string): string => {
    return rawName
      .replace(/\.[^/.]+$/, '') // 移除文件扩展名
      .replace(/^(a_painting_of_|a_drawing_of_|a_photo_of_|a_)/i, '') // 移除 AI 标注前缀
      .replace(/_/g, ' ') // 下划线转空格
      .trim()
      .replace(/\b\w/g, char => char.toUpperCase()); // 单词首字母大写
  };

  const extractBilingualKeywords = (rawText: string): string[] => {
    const words = rawText.toLowerCase().split(/[\s_-]+/);
    const matchedKeywords = new Set<string>();

    words.forEach(word => {
      if (BILINGUAL_MAP[word]) {
        BILINGUAL_MAP[word].forEach(zh => matchedKeywords.add(zh));
      }
    });

    return Array.from(matchedKeywords);
  };

  
  const handleImageSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const fingerprint = await extractImageFingerprint(url);
    setVisualHue(fingerprint.dominantHue);
    
    // Map dominant hue to a search term to leverage Fuse.js weighted search across palette/atmosphere
    const hueToTerm: Record<string, string> = {
      dark: '暗黑',
      gold: '暖金',
      blue: '冷蓝',
      emerald: '青绿',
      warm: '暖色',
      white: '纯白'
    };
    setSearchQuery(hueToTerm[fingerprint.dominantHue] || '');
  };

  const syncFromGitHub = async () => {
    if (isFetchingGithub) return;
    setIsFetchingGithub(true);
    try {
      const res = await fetch('/api/sync-cards', { method: 'POST' });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to sync');
      
      if (data.addedCount === 0) {
        alert(data.message || '没有检测到新卡面');
      } else {
        alert(`同步成功！新增 ${data.addedCount} 张卡面。`);
        // Refresh local cards
        const refresh = await fetch('/data/cards.json');
        const all = await refresh.json();
        setMasterPool(all);
      }
    } catch (err: any) {
      alert('同步失败: ' + err.message);
    } finally {
      setIsFetchingGithub(false);
    }
  };

  const handleImport = (url: string) => {
    const newCard: CardData = {
      id: `custom-${Date.now()}`,
      title: "My Custom Pass",
      author: "You",
      tags: ["自定义"],
      imageUrl: url,
      likes: 0,
      downloads: 0,
      chipStyle: "silver",
    };
    setCustomCards([newCard, ...customCards]);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleChip = (chip: string) => {
    setSelectedChips(prev => 
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    );
  };

  const activeFiltersCount = selectedTags.length + selectedChips.length;

  return (
    <main className="w-full bg-black">
      <div id="intro"><IntroStage /></div>
      <div id="gallery">
      <AppleHeroStage />
      <div className="max-w-7xl mx-auto px-6 py-12 overflow-hidden relative z-20 scroll-mt-24 bg-black/80 rounded-t-[40px] mt-[-100vh] sm:mt-[-50vh] backdrop-blur-3xl shadow-[0_-20px_50px_rgba(0,0,0,0.8)] border-t border-white/10" style={{ marginTop: 0 }}>
        {/* GitHub Sync Button moved to top of Gallery */}
        <div className="flex justify-center mb-10 pt-4">
          <button 
            onClick={syncFromGitHub}
            disabled={isFetchingGithub}
            className="flex items-center gap-2 bg-black/40 hover:bg-black/60 border border-white/10 rounded-full px-5 py-2 text-sm text-zinc-300 transition-colors"
          >
            {isFetchingGithub ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Github className="w-4 h-4" />}
            {t.gallery.syncGithub}
          </button>
        </div>

      {/* Quick Import */}
      <QuickImport onImport={handleImport} />

      {/* Search & Action Bar */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-10 w-full px-4 relative z-20">
        <div className="flex-1 max-w-2xl w-full flex items-center gap-3">
          <VisualSearchBar
            totalCards={allCards.length}
            onSearchChange={(q, hue) => {
              setSearchQuery(q);
              // Map hue to search term internally or handle it in Fuse filtering.
              // For now, since VisualSearchBar passes hue ID, we can do:
              const hueToTerm: Record<string, string> = {
                dark: '暗黑', gold: '暖金', blue: '冷蓝', emerald: '青绿', white: '纯白'
              };
              if (hue && !q) {
                setSearchQuery(hueToTerm[hue] || hue);
              }
            }}
            onImageSearchMatch={(fp) => {
              const hueToTerm: Record<string, string> = {
                dark: '暗黑', gold: '暖金', blue: '冷蓝', emerald: '青绿', white: '纯白', warm: '暖色'
              };
              setSearchQuery(hueToTerm[fp.dominantHue] || '');
            }}
          />

          
          {/* Upload Button */}
          <button 
            onClick={() => { openStudio() }}
            className="apple-glass apple-glass-hover rounded-full h-[52px] px-6 flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg flex-shrink-0"
          >
            <Plus className="w-5 h-5 text-white" />
            <span className="text-white font-medium text-sm hidden sm:block">{t.gallery.uploadBtn}</span>
          </button>

          {/* Filter Trigger Button */}
          <button 
            onClick={() => setIsDrawerOpen(true)}

            className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 hover:bg-white/[0.1] hover:border-white/30 rounded-full h-[52px] px-5 flex items-center justify-center gap-2 transition-all relative flex-shrink-0"
          >
            <SlidersHorizontal className="w-5 h-5 text-zinc-300" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-[20px] px-1 bg-indigo-500 text-white text-[10px] font-bold rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)] border border-white/20">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Indicator (Next to Search) */}
        <div className="flex items-center md:pl-4 md:border-l border-white/10 shrink-0">
          <div className="text-sm text-zinc-400 bg-white/5 border border-white/10 px-4 py-3 rounded-full flex items-center gap-2 h-[52px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
            {t.gallery.collectedCount.split('{count}')[0]}<span className="text-white font-medium">{allCards.length}</span>{t.gallery.collectedCount.split('{count}')[1]}
          </div>
        </div>
      </div>

      <MyCollectionSection />

      {/* Card Grid with AnimatePresence */}
      {isLoading ? (
        <div className="flex justify-center items-center py-32">
          <RefreshCw className="w-8 h-8 text-white/30 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12 min-h-[800px]">
            <AnimatePresence mode="popLayout">
              
              {/* Special Upload Card */}
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="group flex flex-col gap-2 apple-glass apple-glass-hover rounded-[24px] p-2 hover:scale-[1.015] transition-all duration-300 cursor-pointer"
                onClick={() => {
                  openStudio()
                }}
              >
                <div className="perspective-[1200px] relative w-full aspect-[1.586/1] rounded-[24px] border-2 border-dashed border-white/20 hover:border-white/40 apple-glass hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-all duration-300 flex flex-col items-center justify-center overflow-hidden">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform relative z-10">
                  <div className="absolute inset-0 bg-white/[0.03] pointer-events-none group-hover:bg-white/[0.05] transition-colors rounded-full" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.15)_0%,transparent_60%)] transition-opacity duration-500 pointer-events-none rounded-full" />
                    <Plus className="w-6 h-6 text-indigo-400" />
                  </div>
                  <span className="text-white font-semibold mb-1">{t.gallery.customCardTitle}</span>
                  <span className="text-xs text-zinc-500">{t.gallery.customCardDesc}</span>
                </div>
              </motion.div>

              {/* Special AI Forge Card */}
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="group flex flex-col gap-2 apple-glass apple-glass-hover rounded-[24px] p-2 hover:scale-[1.015] transition-all duration-300 cursor-pointer relative overflow-hidden"
                onClick={() => {
                  openAiModal();
                }}
              >
                {/* Subtle Breathing Iridescent Glow Base */}
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-purple-500/5 to-pink-500/10 opacity-30 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.15)_0%,transparent_70%)] opacity-50 group-hover:animate-[pulse_3s_ease-in-out_infinite] pointer-events-none" />
                
                <div className="perspective-[1200px] relative w-full aspect-[1.586/1] rounded-[24px] border border-white/10 hover:border-purple-400/30 apple-glass hover:shadow-[0_0_50px_rgba(168,85,247,0.15)] transition-all duration-300 flex flex-col items-center justify-center overflow-hidden z-10 bg-black/20">
                  
                  {/* Inner Hover Glare */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_60%)] transition-opacity duration-500 pointer-events-none" />
                  
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform relative z-10 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.2)] group-hover:shadow-[0_0_25px_rgba(168,85,247,0.4)]">
                    <Sparkles className="w-6 h-6 text-purple-300" />
                  </div>
                  <span className="text-white font-semibold mb-1 tracking-wide">{t.gallery.aiCardTitle}</span>
                  <span className="text-[11px] text-zinc-400 max-w-[80%] text-center leading-snug">{t.gallery.aiCardDesc}</span>
                </div>
              </motion.div>

              {displayedCards.map((card, i) => (
              <motion.div
                key={card.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20, filter: "blur(10px)" }}
                transition={{ 
                  duration: 0.4, 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 30,
                  delay: i * 0.05
                }}
              >
                <CardItem card={card} onClick={() => openStudio(card)} />
              </motion.div>
            ))}
            </AnimatePresence>
          </div>
          
          {/* Load More Action */}
          {displayedCount < activeFilteredCards.length && (
            <div className="flex justify-center pb-20">
              <button 
                onClick={() => setDisplayedCount(prev => prev + INITIAL_BATCH_SIZE)}
                className="liquid-panel-luminous px-8 py-4 rounded-full font-medium text-sm text-zinc-300 hover:text-white transition-all active:scale-95 shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/10 hover:bg-white/10"
              >
                {t.gallery.loadMore.replace('{displayed}', String(displayedCount)).replace('{total}', String(activeFilteredCards.length))}
              </button>
            </div>
          )}
        </>
      )}
      
      {!isLoading && displayedCards.length === 0 && (
        <div className="text-center py-32 text-zinc-500 font-light liquid-panel-luminous rounded-3xl mx-auto max-w-xl">
          {t.gallery.noMatch}
        </div>
      )}

      {/* Liquid Filter Drawer / Sheet */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            
            {/* Drawer Panel */}
            <motion.div 
              initial={{ x: '100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.5 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-full md:w-[420px] bg-[#0c0d12]/85 backdrop-blur-3xl border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50 flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-white tracking-wide">{t.gallery.advancedFilter}</h2>
                  <span className="bg-white/10 text-zinc-300 text-xs px-2 py-0.5 rounded-full font-mono">
                    {allCards.length} Cards
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {activeFiltersCount > 0 && (
                    <button 
                      onClick={() => { setSelectedTags([]); setSelectedChips([]); }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      重置全部
                    </button>
                  )}
                  <button 
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-1.5 bg-white/5 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-zinc-400" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 custom-scrollbar">
                
                {/* Chip Types */}
                <div>
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
                    {t.gallery.chipCraft}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'gold', label: t.gallery.chipGold },
                      { id: 'silver', label: t.gallery.chipSilver },
                      { id: 'none', label: t.gallery.chipNone }
                    ].map(chip => {
                      const isActive = selectedChips.includes(chip.id);
                      return (
                        <button
                          key={chip.id}
                          onClick={() => toggleChip(chip.id)}
                          className={cn(
                            "px-4 py-2 rounded-xl text-sm transition-all active:scale-95 border",
                            isActive 
                              ? "bg-white/20 text-white border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
                              : "bg-white/5 text-zinc-400 border-transparent hover:bg-white/10 hover:text-zinc-200"
                          )}
                        >
                          {chip.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Hot Tags */}
                <div>
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 flex justify-between">
                    <span>{t.gallery.hotTags}</span>
                    <span>{allUniqueTags.length}</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {allUniqueTags.map(tag => {
                      const isActive = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-sm transition-all active:scale-95 border",
                            isActive 
                              ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.2)]" 
                              : "bg-white/5 text-zinc-400 border-transparent hover:bg-white/10 hover:text-zinc-200"
                          )}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Bottom Sticky Action */}
              <div className="p-6 border-t border-white/10 bg-black/20 shrink-0">
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full bg-white text-black font-semibold rounded-2xl py-4 flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors active:scale-[0.98] shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                >
                  {t.gallery.viewCards.replace('{count}', String(activeFilteredCards.length))}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      </div>
      
              </div>
    
      {/* Floating Studio Quick Dock */}
      <AnimatePresence>
        {showDock && !isStudioOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed bottom-8 right-8 z-40"
          >
            <button 
              onClick={() => {
                if (activeCard && activeCard.id !== 'custom-upload') {
                  openStudio(activeCard);
                } else {
                  openStudio();
                }
              }}
              className="flex items-center gap-3 p-2 pr-5 rounded-full apple-glass shadow-[0_10px_40px_rgba(0,0,0,0.5)] active:scale-[0.98] transition-all group"
            >
              {activeCard && activeCard.id !== 'custom-upload' ? (
                <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 shrink-0">
                  <img src={activeCard.imageUrl} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                </div>
              )}
              
              <div className="flex flex-col items-start">
                <span className="text-xs font-semibold text-white/90">
                  {activeCard && activeCard.id !== 'custom-upload' ? t.gallery.dockCustomOpen : t.gallery.dockCustomEnter}
                </span>
                {activeCard && activeCard.id !== 'custom-upload' && (
                  <span className="text-[10px] text-zinc-400 max-w-[100px] truncate">
                    {activeCard.title}
                  </span>
                )}
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}
