"use client";

import React, { useEffect, useRef, useState } from "react";
// @ts-ignore
import { fabric } from "fabric";
import { Download, Upload, Layers } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function CanvasEditor() {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Initialize Fabric.js canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 1536,
      height: 969,
      backgroundColor: '#0A0A0C', // Very dark background matching the theme
      preserveObjectStacking: true,
    });
    
    // Add default rounded clip path to simulate Apple Wallet card
    const clipPath = new fabric.Rect({
      left: 0,
      top: 0,
      width: 1536,
      height: 969,
      rx: 75,
      ry: 75,
      absolutePositioned: true
    });
    canvas.clipPath = clipPath;

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fabricCanvas) return;

    const reader = new FileReader();
    reader.onload = (f) => {
      const data = f.target?.result as string;
      fabric.Image.fromURL(data, (img: fabric.Image) => {
        // Scale image to cover canvas width or height
        const scale = Math.max(1536 / (img.width || 1), 969 / (img.height || 1));
        img.set({
          scaleX: scale,
          scaleY: scale,
          left: 1536 / 2,
          top: 969 / 2,
          originX: 'center',
          originY: 'center',
        });
        fabricCanvas.add(img);
        fabricCanvas.sendToBack(img);
        fabricCanvas.renderAll();
      });
    };
    reader.readAsDataURL(file);
  };

  const addPresetChip = () => {
    if (!fabricCanvas) return;
    const chip = new fabric.Rect({
      left: 200,
      top: 400,
      width: 160,
      height: 120,
      fill: '#D4AF37',
      rx: 20,
      ry: 20,
      shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.6)', blur: 15 })
    });
    
    const chipLines = new fabric.Rect({
      left: 220,
      top: 420,
      width: 120,
      height: 80,
      fill: 'transparent',
      stroke: '#FFF8E7',
      strokeWidth: 3,
      opacity: 0.5
    });

    const group = new fabric.Group([chip, chipLines], {
      left: 150,
      top: 450,
    });

    fabricCanvas.add(group);
    fabricCanvas.renderAll();
  };

  const exportPNG = () => {
    if (!fabricCanvas) return;
    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1 // 1x scale is already 1536x969
    });
    
    const link = document.createElement('a');
    link.download = 'cardcraft-export.png';
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 w-full mt-4">
      {/* Sidebar Controls */}
      <div className="w-full xl:w-80 flex flex-col gap-6 p-6 rounded-3xl shrink-0 liquid-panel-luminous">
        <div>
          <h2 className="text-xl font-bold mb-6 text-white tracking-tight">{t.studio.layers}</h2>
          <div className="flex flex-col gap-4">
            <label className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors rounded-2xl cursor-pointer text-sm font-medium text-white shadow-sm active:scale-[0.98]">
              <Upload className="w-4 h-4" />
              {t.studio.uploadBg}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
            <button 
              onClick={addPresetChip}
              className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors rounded-2xl text-sm font-medium text-white shadow-sm active:scale-[0.98]"
            >
              <Layers className="w-4 h-4" />
              {t.studio.addChip}
            </button>
          </div>
        </div>

        <div className="mt-auto pt-6">
          <button 
            onClick={exportPNG}
            className="flex items-center justify-center gap-2 w-full py-4 px-4 bg-white text-zinc-950 hover:bg-zinc-200 transition-colors rounded-2xl font-bold shadow-[0_4px_20px_rgba(255,255,255,0.25)] active:scale-[0.98]"
          >
            <Download className="w-5 h-5" />
            {t.studio.exportPng}
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-hidden bg-black/40 rounded-3xl border border-white/10 flex items-center justify-center p-8 min-h-[600px] shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] relative">
        <div className="relative z-10" style={{ width: '100%', maxWidth: '1536px', aspectRatio: '1536/969' }}>
          <div className="absolute top-0 left-0 w-full h-full">
            <canvas 
              ref={canvasRef} 
              className="w-full h-auto rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.9)] border border-white/10" 
              style={{ maxWidth: '100%', height: 'auto', display: 'block' }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
