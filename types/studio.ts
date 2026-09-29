export type LogoAnchor = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface LogoConfig {
  network: 'visa' | 'mastercard' | 'unionpay' | 'amex' | 'jcb' | 'none';
  anchor: LogoAnchor;
  scale: number;
  offsetX: number;
  offsetY: number;
}

export const DEFAULT_LOGO_CONFIG: LogoConfig = {
  network: 'visa',
  anchor: 'bottom-right',
  scale: 1.0,
  offsetX: 0,
  offsetY: 0,
};

// NEW: Figma-style Direct Manipulation State
export interface CardLayerState {
  id: string;
  type: 'logo' | 'text' | 'chip' | 'image';
  content: string; // url, text, or identifier
  xPct: number;    // % relative to card width
  yPct: number;    // % relative to card height
  scale: number;   // 1.0 = base size
  rotation: number;
  zIndex: number;
  finish: 'white' | 'color' | 'gold' | 'silver' | 'embossed' | 'gold_foil' | 'laser_etched' | 'matte_black' | 'classic_white' | 'hologram';
  fontFamily?: 'serif' | 'sans';
}

