import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Settings, Download, Loader2, ImagePlus } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { useStudio } from '@/components/StudioProvider';

export function AIGeneratorModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t, language } = useLanguage();
  const { openStudio } = useStudio();
  
  const [prompt, setPrompt] = useState('');
  const [stylePreset, setStylePreset] = useState('minimalist');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultUrl, setResultUrl] = useState('');
  const [error, setError] = useState('');
  
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const savedKey = localStorage.getItem('cardcraft_ai_key');
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleSaveKey = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setApiKey(val);
    localStorage.setItem('cardcraft_ai_key', val);
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setError('');
    setResultUrl('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, stylePreset, apiKey }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setResultUrl(data.imageUrl);
    } catch (err: any) {
      setError(err.message || t.ai.error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-xl"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-zinc-900/90 border border-white/10 rounded-3xl shadow-2xl flex flex-col md:flex-row"
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
          <X className="w-5 h-5" />
        </button>

        {/* Left Form Panel */}
        <div className="w-full md:w-1/2 p-8 flex flex-col border-b md:border-b-0 md:border-r border-white/10">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-400" />
              {t.ai.title}
            </h2>
            <button onClick={() => setShowSettings(!showSettings)} className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-indigo-500/20 text-indigo-400' : 'text-zinc-400 hover:bg-white/5'}`}>
              <Settings className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-zinc-400 mb-8">{t.ai.subtitle}</p>

          <AnimatePresence>
            {showSettings && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-6">
                <div className="p-4 bg-black/30 rounded-xl border border-white/5">
                  <label className="text-xs font-semibold text-zinc-300 mb-2 block">{t.ai.settings}</label>
                  <input type="password" value={apiKey} onChange={handleSaveKey} placeholder={t.ai.keyPlaceholder} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 mb-2" />
                  <p className="text-[10px] text-zinc-500 leading-tight">{t.ai.keyHelp}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mb-6">
            <label className="text-sm font-semibold text-zinc-300 mb-2 block">{t.ai.promptLabel}</label>
            <textarea 
              value={prompt} onChange={(e) => setPrompt(e.target.value)}
              placeholder={t.ai.promptPlaceholder}
              className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none transition-colors"
            />
            
            <div className="mt-3 flex flex-wrap gap-2 items-center">
              <span className="text-xs text-zinc-500">{t.ai.inspireTitle}</span>
              <button onClick={() => setPrompt(t.ai.tags.blackGold)} className="text-xs px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-300">{t.ai.tags.blackGold}</button>
              <button onClick={() => setPrompt(t.ai.tags.dolomites)} className="text-xs px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-300">{t.ai.tags.dolomites}</button>
              <button onClick={() => setPrompt(t.ai.tags.ukiyoe)} className="text-xs px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-300">{t.ai.tags.ukiyoe}</button>
            </div>
          </div>

          <div className="mb-8">
            <label className="text-sm font-semibold text-zinc-300 mb-3 block">{t.ai.styleLabel}</label>
            <div className="flex flex-wrap gap-2">
              {(['minimalist', 'luxury', 'cyberpunk', 'abstract', 'film'] as const).map(s => (
                <button key={s} onClick={() => setStylePreset(s)} className={`px-4 py-2 text-xs font-medium rounded-full border transition-all ${stylePreset === s ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50' : 'bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10'}`}>
                  {t.ai.styles[s]}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto">
            <button 
              onClick={handleGenerate} disabled={!prompt || isGenerating}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all"
            >
              {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" /> {t.ai.generating}</> : <><Sparkles className="w-5 h-5" /> {t.ai.generateBtn}</>}
            </button>
            {error && <p className="mt-3 text-xs text-red-400 text-center">{error}</p>}
          </div>
        </div>

        {/* Right Preview Panel */}
        <div className="w-full md:w-1/2 p-8 flex flex-col bg-black/20">
          <h3 className="text-sm font-semibold text-zinc-400 mb-4">{t.ai.resultTitle}</h3>
          
          <div className="flex-1 w-full aspect-[1.58] bg-black/40 rounded-2xl border border-white/10 overflow-hidden relative flex items-center justify-center shadow-2xl">
            {isGenerating ? (
              <div className="absolute inset-0 bg-zinc-800/50 animate-pulse flex flex-col items-center justify-center">
                <div className="w-20 h-20 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
                <div className="h-2 w-32 bg-indigo-500/20 rounded overflow-hidden">
                  <div className="h-full bg-indigo-500 animate-[shimmer_1.5s_infinite]" />
                </div>
              </div>
            ) : resultUrl ? (
              <motion.img initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={resultUrl} alt="AI Generated" className="w-full h-full object-cover" />
            ) : (
              <Sparkles className="w-12 h-12 text-zinc-700" />
            )}
          </div>

          {resultUrl && !isGenerating && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex gap-3">
              <button onClick={() => {
                const a = document.createElement('a');
                a.href = resultUrl;
                a.download = 'cardcraft-ai.png';
                a.click();
              }} className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium flex items-center justify-center gap-2 transition-colors">
                <Download className="w-4 h-4" /> {t.ai.download}
              </button>
              <button onClick={() => {
                onClose();
                openStudio({ id: 'ai-generated', title: language === 'en' ? 'AI Forge' : 'AI生成卡面', imageUrl: resultUrl } as any);
              }} className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all">
                <ImagePlus className="w-4 h-4" /> {t.ai.importStudio}
              </button>
            </motion.div>
          )}
        </div>

      </motion.div>
    </div>
  );
}
