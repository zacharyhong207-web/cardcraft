"use client";

import React, { useState, useRef } from "react";
import { Upload, Link as LinkIcon, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface QuickImportProps {
  onImport: (url: string) => void;
}

export function QuickImport({ onImport }: QuickImportProps) {
  const { t } = useLanguage();
  const [url, setUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setIsLoading(true);
    // Simulate loading for the URL import
    setTimeout(() => {
      onImport(url);
      setUrl("");
      setIsLoading(false);
    }, 600);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        onImport(event.target.result);
      }
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        onImport(event.target.result);
      }
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-12">
      <div 
        className={cn(
          "liquid-panel-luminous rounded-[24px] p-2 flex flex-col sm:flex-row gap-2 transition-all duration-300",
          isDragging && "ring-2 ring-white/30 bg-white/[0.05]"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <form onSubmit={handleUrlSubmit} className="flex-1 relative">
          <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="url"
            placeholder="Paste image URL to create card..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-black/20 hover:bg-black/40 focus:bg-black/60 border border-transparent focus:border-white/10 transition-all rounded-[18px] py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-zinc-500 outline-none shadow-inner"
          />
        </form>

        <div className="hidden sm:block w-px bg-white/10 my-2 mx-1" />

        <div className="flex gap-2">
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-[18px] px-6 py-3.5 text-sm font-medium text-zinc-300 hover:text-white transition-colors active:scale-95"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Upload
          </button>
          
          {url && (
            <button 
              onClick={handleUrlSubmit}
              disabled={isLoading}
              className="flex items-center justify-center bg-white text-black rounded-[18px] px-6 py-3.5 text-sm font-bold shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:bg-zinc-200 transition-colors active:scale-95"
            >
              Create
            </button>
          )}
        </div>
        
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
