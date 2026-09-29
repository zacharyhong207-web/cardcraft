'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion';
import { X, Download, Share2, Smartphone, CreditCard, Sparkles, Check, Layers, Image as ImageIcon, Type, Plus } from 'lucide-react';
import { CardData } from '@/lib/data';
import { CardLayerState } from '@/types/studio';
import { downloadCardAsPng, generateCardDataURL } from '@/lib/downloader';
import { saveCard } from '@/lib/db';
import { useStudio } from '@/components/StudioProvider';
import { Bookmark } from 'lucide-react';
import { getNetworkSvg, getIssuerSvg } from '@/lib/svgRenderer';
import { useDeviceMotion } from "@/hooks/useDeviceMotion";
import { DraggableLayer } from './DraggableLayer';
import * as Logos from './diy/CardLogos';
import { useLanguage } from '@/lib/i18n';

interface CardPreviewModalProps {
  card: CardData | null;
  onClose: () => void;
}

export function CardPreviewModal({ card, onClose }: CardPreviewModalProps) {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<'card' | 'wallet'>('card');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSaveToVault = async () => {
    try {
      const srcUrl = customBg || card?.imageUrl || '';
      const previewImage = await generateCardDataURL({ title: 'preview', imageUrl: srcUrl } as any, layers, null, bgTransform, true);
      
      await saveCard({
        id: savedCardState?.id || Date.now().toString(),
        createdAt: savedCardState?.createdAt || Date.now(),
        updatedAt: Date.now(),
        title: card?.title || 'My Card',
        previewImage,
        bgImage: customBg,
        bgTransform,
        layers,
        mode: isUploadMode ? 'custom' : 'preset',
        presetCardId: isUploadMode ? undefined : card?.id
      });
      
      setToastMessage(t.gallery?.savedToVault || 'Saved to Local Vault');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Layer State
  const [layers, setLayers] = useState<CardLayerState[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [customBg, setCustomBg] = useState<string | null>(null);
  const { savedCardState } = useStudio();
  const isUploadMode = card?.id === 'custom-upload' || savedCardState?.mode === 'custom';
  
  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setCustomBg(ev.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  
  const [bgTransform, setBgTransform] = useState({ xPct: 0, yPct: 0, scale: 1 });

  const { xPct: deviceX, yPct: deviceY, requestPermission } = useDeviceMotion();
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springConfig = { stiffness: 400, damping: 30, mass: 0.5 };
  
  useEffect(() => {
    return deviceX.on("change", (val) => {
      if (val !== 0) mouseX.set(0.5 + val);
    });
  }, [deviceX, mouseX]);
  
  useEffect(() => {
    return deviceY.on("change", (val) => {
      if (val !== 0) mouseY.set(0.5 + val);
    });
  }, [deviceY, mouseY]);
  
  const mouseXSpring = useSpring(mouseX, springConfig);
  const mouseYSpring = useSpring(mouseY, springConfig);

  const rotateX = useTransform(mouseYSpring, [0, 1], [4, -4]);
  const rotateY = useTransform(mouseXSpring, [0, 1], [-4, 4]);
  
  const glareX = useTransform(mouseXSpring, v => `${v * 100}%`);
  const glareY = useTransform(mouseYSpring, v => `${v * 100}%`);
  
  useEffect(() => {
    const updateFoil = () => {
       const xVal = mouseXSpring.get();
       const yVal = mouseYSpring.get();
       const angle = 135 + ((xVal - 0.5) + (yVal - 0.5)) * 180;
       if (cardRef.current) {
         cardRef.current.style.setProperty('--foil-angle', `${angle}deg`);
       }
    };
    const unsubX = mouseXSpring.on("change", updateFoil);
    const unsubY = mouseYSpring.on("change", updateFoil);
    return () => { unsubX(); unsubY(); };
  }, [mouseXSpring, mouseYSpring]);

  const glareBackground = useMotionTemplate`radial-gradient(circle 280px at ${glareX} ${glareY}, rgba(255,255,255,0.18), transparent 80%)`;

  const isDraggingBg = React.useRef(false);
  const lastBgPos = React.useRef({ x: 0, y: 0 });

  
  const handleBgPointerDown = (e: React.PointerEvent) => {
    if (selectedLayerId) return;
    isDraggingBg.current = true;
    lastBgPos.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  
  const handleBgPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingBg.current) return;
    const dx = e.clientX - lastBgPos.current.x;
    const dy = e.clientY - lastBgPos.current.y;
    lastBgPos.current = { x: e.clientX, y: e.clientY };

    setBgTransform(prev => {
      const container = cardRef.current?.getBoundingClientRect();
      const cw = container?.width || 500;
      const ch = container?.height || 315;
      
      const dxPct = (dx / cw) * 100;
      const dyPct = (dy / ch) * 100;

      const boundXPct = (prev.scale - 1) * 50;
      const boundYPct = (prev.scale - 1) * 50;

      let newX = prev.xPct + dxPct;
      let newY = prev.yPct + dyPct;

      if (newX > boundXPct) newX = boundXPct;
      if (newX < -boundXPct) newX = -boundXPct;
      if (newY > boundYPct) newY = boundYPct;
      if (newY < -boundYPct) newY = -boundYPct;

      return { ...prev, xPct: newX, yPct: newY };
    });
  };

  const handleBgPointerUp = (e: React.PointerEvent) => {
    isDraggingBg.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  
  const handleBgWheel = (e: React.WheelEvent) => {
    if (selectedLayerId) return;
    e.preventDefault();
    setBgTransform(prev => {
      let newScale = prev.scale - e.deltaY * 0.005;
      if (newScale < 1) newScale = 1;
      if (newScale > 3) newScale = 3;

      const boundXPct = (newScale - 1) * 50;
      const boundYPct = (newScale - 1) * 50;

      let newX = prev.xPct;
      let newY = prev.yPct;
      if (newX > boundXPct) newX = boundXPct;
      if (newX < -boundXPct) newX = -boundXPct;
      if (newY > boundYPct) newY = boundYPct;
      if (newY < -boundYPct) newY = -boundYPct;

      return { xPct: newX, yPct: newY, scale: newScale };
    });
  };

  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || viewMode !== 'card') return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    mouseX.set(x / rect.width);
    mouseY.set(y / rect.height);
  };
  
  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedLayerId) {
          setSelectedLayerId(null);
        } else {
          console.log('[CardCraft] 响应 ESC 键退出工坊');
          if (typeof onClose === 'function') onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLayerId, onClose]);

  const updateLayer = (updated: CardLayerState) => {
    setLayers(layers.map(l => l.id === updated.id ? updated : l));
  };

  const addLayer = (type: CardLayerState['type']) => {
    const newLayer: CardLayerState = {
      id: `${type}-${Date.now()}`,
      type,
      content: type === 'text' ? 'ZACHARY HONG' : type === 'logo' ? 'visa' : 'classic',
      // Default positions: Text at bottom left, Logo at bottom right
      xPct: type === 'text' ? 20 : 85,
      yPct: type === 'text' ? 85 : 85,
      scale: 1.0, // Default 1.0 means 15cqw for logo, 4.5cqw for text, which is already correctly sized
      rotation: 0,
      zIndex: layers.length + 10,
      finish: type === 'text' ? 'embossed' : 'white',
      fontFamily: 'sans'
    };
    setLayers([...layers, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setCustomBg(ev.target.result as string);
        setBgTransform({ xPct: 0, yPct: 0, scale: 1 }); // reset pan/zoom on new image
      }
    };
    reader.readAsDataURL(file);
  };

  const renderContent = (layer: CardLayerState) => {
    if (layer.type === 'text') {
      let textStyle: React.CSSProperties = {
        fontSize: `${4.5 * layer.scale}cqw`,
      };
      
      let className = `font-bold uppercase whitespace-nowrap ${layer.fontFamily === 'serif' ? 'font-serif' : 'font-sans'}`;

      if (layer.finish === 'embossed') {
        textStyle.color = 'rgba(255,255,255,0.85)';
        textStyle.textShadow = '0 -1px 2px rgba(0,0,0,0.8), 0 1px 1.5px rgba(255,255,255,0.6)';
      } else if (layer.finish === 'gold_foil') {
        
        textStyle.backgroundImage = 'linear-gradient(var(--foil-angle, 135deg), #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c)';

        textStyle.WebkitBackgroundClip = 'text';
        textStyle.WebkitTextFillColor = 'transparent';
        textStyle.filter = 'drop-shadow(0 2px 4px rgba(170,119,28,0.4))';
      } else if (layer.finish === 'hologram') {
        textStyle.backgroundImage = 'linear-gradient(var(--foil-angle, 135deg), #ff7b9c, #7b9cff, #9cff7b, #ff7b9c)';
        textStyle.backgroundSize = '200% 200%';
        textStyle.WebkitBackgroundClip = 'text';
        textStyle.WebkitTextFillColor = 'transparent';
        textStyle.filter = 'drop-shadow(0 2px 4px rgba(255,255,255,0.2)) hue-rotate(calc(var(--foil-angle, 135deg) * 1.5))';
      } else if (layer.finish === 'laser_etched') {
        textStyle.color = '#e0e0e0';
        textStyle.textShadow = '0 1px 1px rgba(255,255,255,0.8), 0 -1px 1px rgba(0,0,0,0.8)';
      } else if (layer.finish === 'matte_black') {
        textStyle.color = '#18181b';
        textStyle.textShadow = '0 0.5px 0 rgba(255,255,255,0.2)';
      } else if (layer.finish === 'classic_white' || layer.finish === 'white') {
        textStyle.color = 'white';
        textStyle.textShadow = '0 2px 4px rgba(0,0,0,0.6)';
      } else if (layer.finish === 'gold') {
        textStyle.color = '#D4AF37';
        textStyle.textShadow = '0 2px 4px rgba(0,0,0,0.8)';
      } else if (layer.finish === 'silver') {
        textStyle.color = '#C0C0C0';
        textStyle.textShadow = '0 2px 4px rgba(0,0,0,0.8)';
      }

      return (
        <span className={className} style={textStyle}>
          {layer.content}
        </span>
      );
    }
    
     

    // SVG logos / chips
    const props = { variant: layer.finish, className: "w-full h-full drop-shadow-lg" };
    
    const isNetwork = ['visa', 'mastercard', 'unionpay', 'amex', 'jcb'].includes(layer.content);
    const isIssuer = ['apple', 'hsbc', 'chase', 'citi'].includes(layer.content);
    const isImage = layer.content.startsWith('data:image');

    if (isNetwork || isIssuer || isImage) {
      let srcUrl = layer.content;
      if (isNetwork) {
        const rawSvg = getNetworkSvg(layer.content as any, 'white');
        srcUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(rawSvg)}`;
      } else if (isIssuer) {
        const rawSvg = getIssuerSvg(layer.content as any, 'white');
        srcUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(rawSvg)}`;
      }

      const isMetallic = layer.finish === 'gold' || layer.finish === 'silver' || layer.finish === 'hologram';
      
      let metallicBg = '';
      if (layer.finish === 'gold') {
        metallicBg = 'linear-gradient(135deg, #FFE082 0%, #FFB300 25%, #FFF8E1 50%, #FFA000 75%, #FFE082 100%)';
      } else if (layer.finish === 'silver') {
        metallicBg = 'linear-gradient(135deg, #F5F5F5 0%, #BDBDBD 30%, #FFFFFF 50%, #9E9E9E 70%, #EEEEEE 100%)';
      } else if (layer.finish === 'hologram') {
        metallicBg = 'linear-gradient(var(--foil-angle, 135deg), #ff7b9c, #7b9cff, #9cff7b, #ff7b9c)';
      }

      const containerStyle: React.CSSProperties = {
        width: `${15 * layer.scale}cqw`,
        height: `${15 * layer.scale * 0.6}cqw`, // approximate aspect ratio to bound the div
      };

      if (isMetallic) {
        return (
          <div 
            className="pointer-events-none drop-shadow-lg"
            style={{
              ...containerStyle,
              background: metallicBg,
              backgroundSize: layer.finish === 'hologram' ? '200% 200%' : 'auto',
              WebkitMask: `url("${srcUrl}") no-repeat center / contain`,
              mask: `url("${srcUrl}") no-repeat center / contain`,
              filter: layer.finish === 'hologram' ? 'drop-shadow(0 2px 4px rgba(255,255,255,0.4)) hue-rotate(calc(var(--foil-angle, 135deg) * 1.5))' : 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))'
            }}
          />
        );
      } else {
        // color or white
        if (isNetwork && layer.finish === 'color') {
          const rawSvg = getNetworkSvg(layer.content as any, 'color');
          srcUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(rawSvg)}`;
        } else if (isIssuer && layer.finish === 'color') {
          const rawSvg = getIssuerSvg(layer.content as any, 'color');
          srcUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(rawSvg)}`;
        }
        
        return (
          <img 
            src={srcUrl} 
            className="pointer-events-none drop-shadow-lg" 
            style={{
              ...containerStyle,
              objectFit: 'contain',
              filter: layer.finish === 'white' ? 'brightness(0) invert(1) drop-shadow(0 2px 4px rgba(0,0,0,0.5))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
            }} 
            alt="logo" 
          />
        );
      }
    }

    return <div className="w-16 h-16 bg-white/20 rounded border border-white/50" />;

  };

  const selectedLayer = layers.find(l => l.id === selectedLayerId);

  if (!card) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8" onClick={() => setSelectedLayerId(null)} onTouchStart={() => requestPermission()}>

        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute top-10 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-2 px-5 py-2.5 rounded-full apple-glass shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/20"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-white font-medium">{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <Logos.LogoDefs />
        
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('[CardCraft] 背景蒙层被物理点击');
          if (typeof onClose === 'function') onClose();
        }} className="absolute inset-0 bg-black/80 backdrop-blur-3xl pointer-events-auto" />
        <button onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('[CardCraft] 叉号按钮被物理点击');
          if (typeof onClose === 'function') onClose();
        }} className="absolute top-6 right-6 z-[999] p-2.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-zinc-300 hover:text-white transition-all backdrop-blur-xl pointer-events-auto cursor-pointer">
          <X className="w-5 h-5"/>
        </button>

        <div className="relative z-10 w-full max-w-[1400px] flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12" onClick={e => e.stopPropagation()}>
          
          {/* 左侧：卡片展示舞台 */}
          <div className="flex-1 w-full flex flex-col items-center pt-8 lg:pt-4" onClick={() => setSelectedLayerId(null)}>
            
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-xl mb-6 shadow-xl" onClick={e => e.stopPropagation()}>
              <button onClick={() => setViewMode('card')} className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${viewMode === 'card' ? 'bg-white/20 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}>
                <CreditCard className="w-3.5 h-3.5"/> Direct Canvas
              </button>
            </div>

            <div className="w-full perspective-[1200px] flex justify-center py-4" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
              <motion.div
                layoutId={`card-${card.id}`}
                ref={cardRef}
                style={{
                  transformStyle: 'preserve-3d',
                  perspective: 1000,
                  rotateX: viewMode === 'card' ? rotateX : 0,
                  rotateY: viewMode === 'card' ? rotateY : 0,
                  willChange: "transform",
                  boxShadow: viewMode === 'card'
                    ? "0 6px 12px -2px rgba(0, 0, 0, 0.45), 0 24px 48px -8px rgba(0, 0, 0, 0.85), inset 0 1px 1px rgba(255, 255, 255, 0.5), inset 0 -1px 1px rgba(0, 0, 0, 0.4)"
                    : "0 2px 4px rgba(0, 0, 0, 0.4), 0 12px 28px -6px rgba(0, 0, 0, 0.7), inset 0 1px 0.5px rgba(255, 255, 255, 0.35), inset 0 -1px 1px rgba(0, 0, 0, 0.5)"
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="relative w-full max-w-xl aspect-[1.586/1] rounded-[24px] select-none group @container"
                onClick={() => setSelectedLayerId(null)}
              >
                {/* 3D Scene Background (Moved overflow-hidden here) */}
                <div className="absolute inset-0 rounded-[24px] overflow-hidden border border-white/20" style={{ transform: "translateZ(0px)" }}>
                
                <div 
                  className="absolute inset-0 touch-none"
                  style={{ cursor: selectedLayerId ? 'default' : isDraggingBg.current ? 'grabbing' : 'grab' }}
                  onPointerDown={handleBgPointerDown}
                  onPointerMove={handleBgPointerMove}
                  onPointerUp={handleBgPointerUp}
                  onPointerCancel={handleBgPointerUp}
                  onWheel={handleBgWheel}
                >
                  <img 
                    src={customBg || card.imageUrl || ''} 
                    alt={card.title} 
                    className="w-full h-full object-cover select-none pointer-events-none origin-center" 
                    style={{ transform: `translate(${bgTransform.xPct}%, ${bgTransform.yPct}%) scale(${bgTransform.scale})` }}
                  />
                </div>

                {!(customBg || card.imageUrl) && (
                  <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors border-2 border-dashed border-white/20 rounded-[24px]">
                    <ImageIcon className="w-12 h-12 text-zinc-500 mb-4" />
                    <span className="text-zinc-400 font-medium">{t.studio.dropzoneTitle}</span>
                    <span className="text-zinc-600 text-sm mt-2">{t.studio.dropzoneDesc}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleUploadImage} />
                  </label>
                )}

                <motion.div className="absolute inset-0 pointer-events-none rounded-[24px] z-50 mix-blend-screen opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: glareBackground, transform: "translateZ(1px)" }} />
                
                {/* 交互图层渲染区 */}
                </div>
                {layers.map(layer => (
                  <DraggableLayer
                    key={layer.id}
                    layer={layer}
                    isSelected={selectedLayerId === layer.id}
                    onSelect={() => setSelectedLayerId(layer.id)}
                    onChange={updateLayer}
                    renderContent={renderContent}
                    containerRef={cardRef}
                  />
                ))}

              </motion.div>
            </div>

            {/* 底部悬浮控制台 */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-3 mt-6 p-2 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-2">
                <button onClick={handleSaveToVault} className="flex items-center gap-2 px-4 py-2.5 rounded-xl apple-glass text-white font-medium text-sm hover:scale-105 active:scale-95 transition-all shadow-lg">
                  <Bookmark className="w-4 h-4"/> {t.gallery?.saveToVault || 'Save to Vault'}
                </button>
                <button onClick={() => downloadCardAsPng({ ...card, imageUrl: customBg || card?.imageUrl || "" } as CardData, layers, undefined, bgTransform)} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-all shadow-[0_4px_16px_rgba(255,255,255,0.2)]">
                  <Download className="w-4 h-4"/> {t.studio.exportBtn}
                </button>
              </div>
            </motion.div>
          </div>

          {/* 右侧：Inspector 属性检查器 */}
          <div className="w-full lg:w-[340px] shrink-0 bg-zinc-900/90 border border-white/10 rounded-3xl p-6 pb-10 backdrop-blur-3xl shadow-2xl flex flex-col gap-6 max-h-[85vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><Layers className="w-5 h-5 text-indigo-400" /> {isUploadMode ? t.studio.titleUpload : t.studio.titleTune}</h2>
              <p className="text-xs text-zinc-400 mt-1">{isUploadMode ? t.studio.subtitleUpload : t.studio.subtitleTune}</p>
            </div>

            <div className="flex gap-2">
              <button onClick={() => addLayer('text')} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white"><Type className="w-3.5 h-3.5"/> 加文字</button>
              <button onClick={() => addLayer('logo')} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white"><Plus className="w-3.5 h-3.5"/> 加徽标</button>
              <label className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white cursor-pointer"><ImageIcon className="w-3.5 h-3.5"/> 传图
                <input type="file" accept="image/*" className="hidden" onChange={handleUploadImage} />
              </label>
            </div>

            {selectedLayer ? (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                
                {/* 内容修改 */}
                {selectedLayer.type === 'logo' && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400">{t.studio.selectLogo}</label>
                    <select value={selectedLayer.content} onChange={e => updateLayer({...selectedLayer, content: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none">
                      <option value="visa">VISA</option><option value="mastercard">Mastercard</option>
                      <option value="unionpay">UnionPay</option><option value="amex">Amex</option><option value="jcb">JCB</option>
                      <option value="apple">Apple</option><option value="hsbc">HSBC</option>
                    </select>
                  </div>
                )}
                
                {selectedLayer.type === 'text' && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400">{t.studio.typography}</label>
                    <select value={selectedLayer.fontFamily || 'sans'} onChange={e => updateLayer({...selectedLayer, fontFamily: e.target.value as any})} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none">
                      <option value="sans">{t.studio.fontSans}</option><option value="serif">{t.studio.fontSerif}</option>
                    </select>
                  </div>
                )}

                {/* 工艺材质 */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400">{t.studio.material}</label>
                  
                  {selectedLayer.type === 'text' ? (
                    <div className="flex flex-wrap gap-2">
                      {(['embossed', 'gold_foil', 'hologram', 'laser_etched', 'matte_black', 'classic_white'] as const).map(f => (
                        <button key={f} onClick={() => updateLayer({...selectedLayer, finish: f})} className={`px-3 py-1.5 text-[11px] font-medium rounded-full border transition-all ${selectedLayer.finish === f ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50' : 'bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10'}`}>
                          {f === 'embossed' ? t.studio.finishEmbossed : f === 'gold_foil' ? t.studio.finishGoldFoil : f === 'laser_etched' ? t.studio.finishLaser : f === 'matte_black' ? t.studio.finishMatte : f === 'hologram' ? t.studio.finishHologram : t.studio.finishClassicWhite}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {(['white', 'color', 'gold', 'silver', 'hologram'] as const).map(f => (
                        <button key={f} onClick={() => updateLayer({...selectedLayer, finish: f})} className={`py-2 text-xs font-medium rounded-xl border transition-all ${selectedLayer.finish === f ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50' : 'bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10'}`}>
                          {f === 'gold' ? '✨ 烫金 (Gold)' : f === 'silver' ? '✦ 银箔 (Silver)' : f === 'color' ? '🎨 彩印' : f === 'hologram' ? '🌈 全息 (Hologram)' : '纯白'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* 删除按钮 */}
                <button onClick={() => { setLayers(layers.filter(l => l.id !== selectedLayer.id)); setSelectedLayerId(null); }} className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition-colors mt-4">
                  删除此图层
                </button>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-zinc-500 text-center px-4 mt-10 border border-dashed border-white/10 rounded-2xl py-10 bg-white/[0.02]">
                <span dangerouslySetInnerHTML={{ __html: t.studio.emptyInspector }} />
              </div>
            )}
            
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
}
