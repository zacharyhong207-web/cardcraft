"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Bookmark, Edit2, Trash2, ChevronDown } from 'lucide-react';
import { SavedCard, getAllSavedCards, deleteSavedCard } from '@/lib/db';
import { useLanguage } from '@/lib/i18n';
import { useStudio } from '@/components/StudioProvider';

export function MyCollectionSection() {
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const { t } = useLanguage();
  const { openStudioWithSaved, isStudioOpen } = useStudio();

  const loadCards = async () => {
    try {
      const data = await getAllSavedCards();
      setCards(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    // Reload when studio closes (in case user just saved a card)
    if (!isStudioOpen) {
      loadCards();
    }
  }, [isStudioOpen]);

  useEffect(() => {
    loadCards();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDeleteId === id) {
      await deleteSavedCard(id);
      setConfirmDeleteId(null);
      loadCards();
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  if (cards.length === 0) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-6 mb-8 relative z-20">
      {/* Header */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 mb-4 group outline-none"
      >
        <Bookmark className="w-5 h-5 text-indigo-400" />
        <h2 className="text-lg font-bold text-white tracking-wide">
          {t.gallery?.myVault || 'My Vault'} ({cards.length})
        </h2>
        <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} className="text-zinc-500 group-hover:text-zinc-300 transition-colors ml-1">
          <ChevronRight className="w-4 h-4" />
        </motion.div>
      </button>

      {/* Grid / Carousel */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-4 snap-x snap-mandatory">
              {cards.map((card) => (
                <div 
                  key={card.id} 
                  className="snap-start shrink-0 w-64 md:w-72 aspect-[1.586/1] rounded-[20px] apple-glass group relative overflow-hidden cursor-pointer"
                  onClick={() => openStudioWithSaved(card)}
                >
                  <img src={card.previewImage} className="w-full h-full object-cover rounded-[18px]" alt={card.title} />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 backdrop-blur-sm rounded-[18px]">
                    <span className="text-sm font-semibold text-white truncate max-w-[80%] drop-shadow-md">
                      {card.title}
                    </span>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); openStudioWithSaved(card); }}
                        className="px-4 py-1.5 rounded-full apple-glass text-white text-xs font-medium hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        {t.gallery?.editCard || 'Edit'}
                      </button>
                      
                      <button 
                        onClick={(e) => handleDelete(card.id, e)}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 \${confirmDeleteId === card.id ? 'bg-red-500/80 text-white' : 'apple-glass text-red-400'}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {confirmDeleteId === card.id ? (t.gallery?.confirmDelete || 'Confirm?') : (t.gallery?.deleteCard || 'Delete')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
