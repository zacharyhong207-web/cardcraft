'use client';

import React from 'react';
import { LogoConfig, LogoAnchor, DEFAULT_LOGO_CONFIG } from '@/types/studio';
import { LayoutTemplate, Maximize2, MoveHorizontal, MoveVertical, RotateCcw } from 'lucide-react';

interface LogoCustomizerProps {
  config: LogoConfig;
  onChange: (config: LogoConfig) => void;
}

export function LogoCustomizer({ config, onChange }: LogoCustomizerProps) {
  const anchors: { id: LogoAnchor; label: string }[] = [
    { id: 'top-left', label: '左上角' },
    { id: 'top-right', label: '右上角' },
    { id: 'bottom-left', label: '左下角' },
    { id: 'bottom-right', label: '右下角' },
  ];

  

  const handleReset = () => {
    onChange({ ...DEFAULT_LOGO_CONFIG, network: config.network });
  };

  return (
    <div className="space-y-4 bg-zinc-900/50 p-5 rounded-2xl border border-white/10 mt-2 backdrop-blur-md">
      <div className="flex items-center justify-between mb-3 text-sm font-medium text-white">
        <div className="flex items-center gap-2">
          <LayoutTemplate className="w-4 h-4 text-emerald-400" />
          徽标排版引擎
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-white transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          重置
        </button>
      </div>

      {/* 四角停靠网格 */}
      <div className="grid grid-cols-2 gap-2">
        {anchors.map((a) => (
          <button
            key={a.id}
            onClick={() => onChange({ ...config, anchor: a.id })}
            className={`py-2 text-xs font-medium rounded-xl border transition-all ${
              config.anchor === a.id
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                : 'bg-white/5 text-zinc-400 border-transparent hover:bg-white/10'
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      <div className="space-y-4 pt-3 border-t border-white/5">
        {/* Scale Slider 70% ~ 140% */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-zinc-400">
            <div className="flex items-center gap-1.5"><Maximize2 className="w-3.5 h-3.5"/> 缩放比例</div>
            <span className="font-mono text-zinc-300">{Math.round(config.scale * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.7"
            max="1.4"
            step="0.05"
            value={config.scale}
            onChange={(e) => onChange({ ...config, scale: parseFloat(e.target.value) })}
            className="w-full accent-emerald-500 bg-zinc-800 rounded-lg h-1.5 appearance-none cursor-pointer"
          />
        </div>

        {/* Offset X Slider -5% ~ 5% */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-zinc-400">
            <div className="flex items-center gap-1.5"><MoveHorizontal className="w-3.5 h-3.5"/> 水平微调</div>
            <span className="font-mono text-zinc-300">{config.offsetX > 0 ? '+' : ''}{config.offsetX}%</span>
          </div>
          <input
            type="range"
            min="-5"
            max="5"
            step="1"
            value={config.offsetX}
            onChange={(e) => onChange({ ...config, offsetX: parseFloat(e.target.value) })}
            className="w-full accent-emerald-500 bg-zinc-800 rounded-lg h-1.5 appearance-none cursor-pointer"
          />
        </div>

        {/* Offset Y Slider -5% ~ 5% */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-zinc-400">
            <div className="flex items-center gap-1.5"><MoveVertical className="w-3.5 h-3.5"/> 垂直微调</div>
            <span className="font-mono text-zinc-300">{config.offsetY > 0 ? '+' : ''}{config.offsetY}%</span>
          </div>
          <input
            type="range"
            min="-5"
            max="5"
            step="1"
            value={config.offsetY}
            onChange={(e) => onChange({ ...config, offsetY: parseFloat(e.target.value) })}
            className="w-full accent-emerald-500 bg-zinc-800 rounded-lg h-1.5 appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
