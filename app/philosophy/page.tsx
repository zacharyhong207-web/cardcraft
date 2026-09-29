'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Layers, ShieldCheck, Globe2, Palette, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { useStudio } from '@/components/StudioProvider';

export default function PhilosophyPage() {
  const { t } = useLanguage();
  const { openStudio } = useStudio();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white selection:bg-indigo-500/30 overflow-hidden relative pb-32">
      {/* Background ambient light */}
      <div className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative min-h-[110vh] flex flex-col items-center justify-center pt-36 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center z-20 mb-16 pb-12"
        >
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-6">
            {t.philosophy.title}
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 font-light tracking-wide max-w-xl mx-auto text-balance leading-relaxed">
            {t.philosophy.subtitle}
          </p>
        </motion.div>

        {/* 3D Exploded Layer View */}
        <div className="relative w-full max-w-3xl aspect-[1.586/1] min-h-[520px] perspective-[3000px] group cursor-crosshair z-10 mx-auto mt-12">
          <motion.div 
            className="w-full h-full relative"
            style={{ transformStyle: 'preserve-3d' }}
            initial={{ rotateX: 20, rotateY: -15 }}
            whileHover={{ rotateX: 35, rotateY: -35 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          >
            {/* Layer 1: 底板 */}
            <div className="absolute inset-0 rounded-[24px] bg-zinc-800 border border-white/10 shadow-2xl transition-transform duration-700 ease-out group-hover:[transform:translateZ(-80px)]">
              <div className="absolute inset-0 rounded-[24px] overflow-hidden"><img src="https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=1536&auto=format&fit=crop" className="w-full h-full object-cover opacity-60 mix-blend-luminosity" /></div>
              <div className="absolute top-8 -left-32 delay-100 opacity-0 group-hover:opacity-100 transition-opacity duration-700 whitespace-nowrap text-[11px] bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-white font-medium flex items-center gap-2">
                <span className="w-8 h-[1px] bg-zinc-600" />
                62+ Official Base Cards
              </div>
            </div>

            {/* Layer 2: 芯片 */}
            <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:[transform:translateZ(40px)] pointer-events-none">
               <div className="absolute top-10 left-10 w-16 h-12 bg-gradient-to-br from-yellow-200 to-yellow-600 rounded-lg shadow-lg border border-yellow-300/50" />
               <div className="absolute top-8 -left-32 delay-200 opacity-0 group-hover:opacity-100 transition-opacity duration-700 whitespace-nowrap text-[11px] bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-white font-medium flex items-center gap-2">
                <span className="w-16 h-[1px] bg-zinc-600" />
                High-Precision IC Chip
              </div>
            </div>

            {/* Layer 3: 徽标 */}
            <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:[transform:translateZ(120px)] pointer-events-none">
               <div className="absolute bottom-10 right-10 text-white font-bold text-4xl tracking-tighter drop-shadow-xl italic">
                 VISA
               </div>
               <div className="absolute bottom-4 -right-36 delay-300 opacity-0 group-hover:opacity-100 transition-opacity duration-700 whitespace-nowrap text-[11px] bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-white font-medium flex items-center gap-2 flex-row-reverse">
                <span className="w-12 h-[1px] bg-zinc-600" />
                Vector Network Logos
              </div>
            </div>

            {/* Layer 4: 文字 (凸字) */}
            <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:[transform:translateZ(200px)] pointer-events-none">
               <div className="absolute bottom-10 left-10 text-white font-mono font-bold text-xl uppercase tracking-widest" 
                    style={{ textShadow: '0 -1px 2px rgba(0,0,0,0.8), 0 1px 1.5px rgba(255,255,255,0.6)' }}>
                 ZACHARY HONG
               </div>
               <div className="absolute bottom-4 -left-40 delay-400 opacity-0 group-hover:opacity-100 transition-opacity duration-700 whitespace-nowrap text-[11px] bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-white font-medium flex items-center gap-2">
                <span className="w-8 h-[1px] bg-zinc-600" />
                Physical Embossed Typography
              </div>
            </div>

            {/* Layer 5: 镭射 */}
            <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:[transform:translateZ(280px)] pointer-events-none rounded-[24px]">
               <div className="absolute inset-0 rounded-[24px] overflow-hidden">
               <div className="w-[200%] h-[200%] absolute -top-1/2 -left-1/2 bg-[conic-gradient(from_0deg,transparent,rgba(255,255,255,0.1),transparent)] opacity-0 group-hover:opacity-100 group-hover:animate-[spin_4s_linear_infinite]" />
               </div>
               <div className="absolute top-1/2 -right-36 delay-500 opacity-0 group-hover:opacity-100 transition-opacity duration-700 whitespace-nowrap text-[11px] bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-white font-medium flex items-center gap-2 flex-row-reverse">
                <span className="w-16 h-[1px] bg-zinc-600" />
                Holographic Overlay
              </div>
            </div>

          </motion.div>
        </div>
      </section>

      {/* Bento Grid Section */}
      <section className="max-w-6xl mx-auto px-6 py-32 z-20 relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Module A */}
          <div className="md:col-span-2 bg-zinc-900/40 border border-white/5 rounded-[32px] p-10 flex flex-col justify-between backdrop-blur-md overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full group-hover:bg-indigo-500/20 transition-colors duration-700" />
            <Layers className="w-10 h-10 text-indigo-400 mb-8" />
            <div className="relative z-10">
              <h3 className="text-2xl font-semibold mb-3">{t.philosophy.modATitle}</h3>
              <p className="text-zinc-400 leading-relaxed max-w-lg">
                {t.philosophy.modADesc}
              </p>
            </div>
          </div>

          {/* Module B */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-[32px] p-10 flex flex-col justify-between backdrop-blur-md">
            <ShieldCheck className="w-10 h-10 text-emerald-400 mb-8" />
            <div>
              <h3 className="text-2xl font-semibold mb-3">{t.philosophy.modBTitle}</h3>
              <p className="text-zinc-400 leading-relaxed text-sm">
                {t.philosophy.modBDesc}
              </p>
            </div>
          </div>

          {/* Module C */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-[32px] p-10 flex flex-col justify-between backdrop-blur-md">
            <Globe2 className="w-10 h-10 text-blue-400 mb-8" />
            <div>
              <h3 className="text-2xl font-semibold mb-3">{t.philosophy.modCTitle}</h3>
              <p className="text-zinc-400 leading-relaxed text-sm">
                {t.philosophy.modCDesc}
              </p>
            </div>
          </div>

          {/* Module D */}
          <div className="md:col-span-2 bg-zinc-900/40 border border-white/5 rounded-[32px] p-10 flex flex-col justify-between backdrop-blur-md relative overflow-hidden group">
             <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-500/10 blur-[100px] rounded-full group-hover:bg-amber-500/20 transition-colors duration-700" />
            <Palette className="w-10 h-10 text-amber-400 mb-8" />
            <div className="relative z-10">
              <h3 className="text-2xl font-semibold mb-3">{t.philosophy.modDTitle}</h3>
              <p className="text-zinc-400 leading-relaxed max-w-lg">
                {t.philosophy.modDDesc}
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Footer CTA */}
      <div className="mt-24 mb-10 flex justify-center w-full z-50 relative">
        <motion.button onClick={() => openStudio()} 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-semibold shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-105 hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] transition-all"
          >
            {t.philosophy.cta}
            <ArrowRight className="w-5 h-5" />
          </motion.button>
      </div>

    </div>
  );
}
