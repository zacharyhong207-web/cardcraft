'use client';

import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Fingerprint, Code2, Database } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';

export function IntroStage() {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  
  // Parallax Card state
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Max rotation 15 degrees
    const rX = ((y / rect.height) - 0.5) * -30;
    const rY = ((x / rect.width) - 0.5) * 30;
    
    setRotateX(rX);
    setRotateY(rY);
    setGlare({ x: (x / rect.width) * 100, y: (y / rect.height) * 100, opacity: 1 });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlare(prev => ({ ...prev, opacity: 0 }));
  };

  const sections = [
    {
      num: "01",
      title: t.intro.sec1Title,
      desc: t.intro.sec1Desc,
      icon: Fingerprint
    },
    {
      num: "02",
      title: t.intro.sec2Title,
      desc: t.intro.sec2Desc,
      icon: Code2
    },
    {
      num: "03",
      title: t.intro.sec3Title,
      desc: t.intro.sec3Desc,
      icon: Database
    }
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white selection:bg-indigo-500/30 overflow-hidden relative">
      
      {/* Ambient Mesh Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[140px] mix-blend-screen" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-36 pb-32">
        
        {/* Cinematic Typography Opening */}
        <section className="flex flex-col items-center justify-center min-h-[50vh] text-center mb-32">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-5xl md:text-7xl font-extralight tracking-tight mb-8">
              {t.intro.titleLine1}
              <br className="md:hidden" />
              {" "}
              <span className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 via-zinc-400 to-zinc-100 animate-shimmer bg-[length:200%_auto]">
                {t.intro.titleLine2}
              </span>
            </h1>
            <p className="text-xl text-zinc-400 font-light tracking-wide max-w-2xl mx-auto leading-relaxed text-balance">
              {t.intro.subtitle}
            </p>
          </motion.div>
        </section>

        {/* Parallax Card Display */}
        <section className="flex justify-center mb-40 perspective-[2000px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-2xl aspect-[1.586/1] relative cursor-crosshair rounded-[24px]"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ transformStyle: 'preserve-3d', rotateX, rotateY }}
            animate={{ rotateX, rotateY }}
          >
            {/* Base Card Layer */}
            <div className="absolute inset-0 rounded-[24px] overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] border border-white/20 bg-zinc-900">
              <img src="https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=1536&auto=format&fit=crop" className="w-full h-full object-cover opacity-80 mix-blend-luminosity" />
              
              {/* Highlight Sweep */}
              <div 
                className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                style={{
                  opacity: glare.opacity,
                  background: `radial-gradient(circle 400px at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.25) 0%, transparent 60%)`
                }}
              />
            </div>

            {/* Floating Elements in 3D */}
            <div className="absolute top-10 left-10 pointer-events-none" style={{ transform: 'translateZ(40px)' }}>
              <div className="w-16 h-12 bg-gradient-to-br from-zinc-300 to-zinc-500 rounded-lg shadow-lg border border-zinc-200/50" />
            </div>
            
            <div className="absolute left-4 bottom-4 right-4 md:left-8 md:bottom-8 md:right-8 flex items-end justify-between gap-3 pointer-events-none" style={{ transform: 'translateZ(70px)' }}>
              <div className="text-white font-mono font-bold text-xs md:text-2xl uppercase tracking-[0.1em] md:tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] max-w-[55%] md:max-w-[60%] truncate">
                ZACHARY HONG
              </div>
              <div className="text-white font-bold text-xl md:text-4xl italic drop-shadow-xl opacity-90 shrink-0">
                VISA
              </div>
            </div>
          </motion.div>
        </section>

        {/* Narrative Sections */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 px-2 md:px-0 mb-32">
          {sections.map((sec, idx) => (
            <motion.div
              key={sec.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: idx * 0.2, ease: "easeOut" }}
              className="flex flex-col gap-6"
            >
              <div className="flex items-center gap-4">
                <span className="text-5xl font-extralight text-zinc-700">{sec.num}</span>
                <div className="w-12 h-[1px] bg-zinc-700" />
              </div>
              <div>
                <sec.icon className="w-8 h-8 text-indigo-400 mb-6" />
                <h3 className="text-xl font-semibold mb-3 tracking-wide">{sec.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed font-light">{sec.desc}</p>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Footer CTA */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="flex justify-center"
        >
          <a href="#gallery">
            <button className="relative group overflow-hidden rounded-full bg-white text-black px-6 py-4 md:px-10 md:py-5 text-sm md:text-base font-medium shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-transform hover:scale-105 active:scale-95">
              <span className="relative z-10 flex items-center gap-3">
                <Sparkles className="w-5 h-5" />
                {t.intro.cta}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-200 via-white to-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </button>
          </a>
        </motion.div>

      </div>
    </div>
  );
}
