'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CardData } from '@/lib/data';
import { CardPreviewModal } from '@/components/CardPreviewModal';
import { AIGeneratorModal } from '@/components/AIGeneratorModal';
import { useLanguage } from '@/lib/i18n';
import { SavedCard } from '@/lib/db';

interface StudioContextType {
  savedCardState: SavedCard | null;
  openStudioWithSaved: (saved: SavedCard) => void;
  activeCard: CardData | null;
  isStudioOpen: boolean;
  openStudio: (card?: CardData) => void;
  closeStudio: () => void;
  setActiveCard: (card: CardData | null) => void;
  isAiModalOpen: boolean;
  openAiModal: () => void;
  closeAiModal: () => void;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export function StudioProvider({ children }: { children: ReactNode }) {
  const [activeCard, setActiveCard] = useState<CardData | null>(null);
  const [savedCardState, setSavedCardState] = useState<SavedCard | null>(null);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const { t } = useLanguage();

  
  const openStudioWithSaved = (saved: SavedCard) => {
    setSavedCardState(saved);
    if (saved.mode === 'preset' && saved.presetCardId) {
      // Find the original preset card
      // We don't have access to masterPool here easily, so we just construct a temporary CardData
      setActiveCard({ id: saved.presetCardId, title: saved.title, imageUrl: saved.bgImage || '' } as any);
    } else {
      setActiveCard({ id: 'custom-upload', title: saved.title, imageUrl: '' } as any);
    }
    setIsStudioOpen(true);
  };
  
  const openStudio = (card?: CardData) => {
    setSavedCardState(null);
    if (card) {
      setActiveCard(card);
    } else {
      setActiveCard({ id: 'custom-upload', title: t.gallery.customCardTitle, imageUrl: '' } as any);
    }
    setIsStudioOpen(true);
  };

  const openAiModal = () => setIsAiModalOpen(true);
  const closeAiModal = () => setIsAiModalOpen(false);

  
  const closeStudio = () => {
    setSavedCardState(null);
    console.log('[CardCraft] 工坊关闭触发成功');
    setIsStudioOpen(false);
    setActiveCard(null); // Force clear active card to prevent any lingering state
    
    // Also clear query params just in case there were any
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.has('studio') || url.searchParams.has('diy')) {
        url.searchParams.delete('studio');
        url.searchParams.delete('diy');
        window.history.replaceState({}, '', url.toString());
      }
    }
  };


  return (
    <StudioContext.Provider value={{ savedCardState, openStudioWithSaved, activeCard, isStudioOpen, openStudio, closeStudio, setActiveCard, isAiModalOpen, openAiModal, closeAiModal }}>
      {children}
      {isStudioOpen && activeCard && (
        <CardPreviewModal 
          card={activeCard} 
          onClose={closeStudio} 
        />
      )}
          <AIGeneratorModal isOpen={isAiModalOpen} onClose={closeAiModal} />
    </StudioContext.Provider>
  );
}

export function useStudio() {
  const context = useContext(StudioContext);
  if (!context) {
    throw new Error('useStudio must be used within a StudioProvider');
  }
  return context;
}
