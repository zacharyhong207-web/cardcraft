'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CardLayerState } from '@/types/studio';

interface DraggableLayerProps {
  layer: CardLayerState;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updated: CardLayerState) => void;
  renderContent: (layer: CardLayerState) => React.ReactNode;
  containerRef: React.RefObject<HTMLDivElement>;
}

export function DraggableLayer({
  layer,
  isSelected,
  onSelect,
  onChange,
  renderContent,
  containerRef,
}: DraggableLayerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const layerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  // local temporary state for fluid UI updates
  const [localPos, setLocalPos] = useState({ xPct: layer.xPct, yPct: layer.yPct });
  
  // store offset from the center of the element to the pointer
  const dragStartOffset = useRef({ offsetX: 0, offsetY: 0 });

  // Sync with prop changes when not dragging
  useEffect(() => {
    if (!isDragging) {
      setLocalPos({ xPct: layer.xPct, yPct: layer.yPct });
    }
  }, [layer.xPct, layer.yPct, isDragging]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (isEditing) return;
    onSelect();
    
    // Prevent default to stop text selection during drag
    if (e.target instanceof HTMLElement && e.target.tagName !== 'INPUT') {
       e.preventDefault();
    }
    
    if ((e.target as HTMLElement).closest('.resize-handle')) {
        return; // Let handleResizePointerDown take over
    }

    if (!containerRef.current || !layerRef.current) return;
    
    const layerRect = layerRef.current.getBoundingClientRect();

    // calculate pointer offset from the element's CENTER
    const centerX = layerRect.left + layerRect.width / 2;
    const centerY = layerRect.top + layerRect.height / 2;
    
    dragStartOffset.current = {
      offsetX: e.clientX - centerX,
      offsetY: e.clientY - centerY,
    };

    setIsDragging(true);
    
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // The current logical center in screen coordinates is clientX - offset
    const targetCenterX = e.clientX - dragStartOffset.current.offsetX;
    const targetCenterY = e.clientY - dragStartOffset.current.offsetY;
    
    // Precise conversion to percentage using the scaled rect width/height
    const newXPct = ((targetCenterX - containerRect.left) / containerRect.width) * 100;
    const newYPct = ((targetCenterY - containerRect.top) / containerRect.height) * 100;
    
    setLocalPos({ xPct: newXPct, yPct: newYPct });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    
    e.currentTarget.releasePointerCapture(e.pointerId);
    
    // Direct state commit of the exact last frame's position - no snapping!
    onChange({ ...layer, xPct: localPos.xPct, yPct: localPos.yPct });
  };

  const handleResizePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const startY = e.clientY;
    const startScale = layer.scale;
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);

    const onPointerMove = (moveEvent: PointerEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const scaleDelta = deltaY / 100; // arbitrary sensitivity
      const newScale = Math.max(0.5, Math.min(startScale + scaleDelta, 3.0));
      onChange({ ...layer, scale: newScale });
    };

    const onPointerUp = (upEvent: PointerEvent) => {
      target.releasePointerCapture(upEvent.pointerId);
      target.removeEventListener('pointermove', onPointerMove as any);
      target.removeEventListener('pointerup', onPointerUp as any);
    };

    target.addEventListener('pointermove', onPointerMove as any);
    target.addEventListener('pointerup', onPointerUp as any);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (layer.type === 'text') {
      setIsEditing(true);
    }
  };

  return (
    <div
      ref={layerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDoubleClick={handleDoubleClick}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        left: `${localPos.xPct}%`,
        top: `${localPos.yPct}%`,
        transform: `translate(-50%, -50%) scale(${layer.scale})`,
        zIndex: layer.zIndex,
      }}
      className={`
        cursor-grab active:cursor-grabbing touch-none select-none
        ${isSelected && !isEditing ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-black/20' : ''}
      `}
    >
      {isEditing && layer.type === 'text' ? (
        <input
          autoFocus
          className="bg-transparent outline-none text-white text-center font-bold font-sans uppercase drop-shadow-md"
          value={layer.content}
          onChange={(e) => onChange({ ...layer, content: e.target.value })}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => { if (e.key === 'Enter') setIsEditing(false); }}
          style={{ width: `${Math.max(100, layer.content.length * 15)}px` }}
        />
      ) : (
        renderContent(layer)
      )}

      {/* Resize Handle */}
      {isSelected && !isEditing && (
        <div
          onPointerDown={handleResizePointerDown}
          className="resize-handle absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nwse-resize shadow-sm"
        />
      )}
    </div>
  );
}
