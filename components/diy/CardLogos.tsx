import React from 'react';

export type LogoVariant = 'color' | 'white' | 'gold';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  variant?: LogoVariant;
}

const getFill = (variant: LogoVariant, colorFill: string) => {
  if (variant === 'white') return 'currentColor';
  if (variant === 'gold') return 'url(#gold-gradient)';
  return colorFill;
};

// SVG Definitions for Gold Gradient
export const LogoDefs = () => (
  <svg width="0" height="0" className="hidden">
    <defs>
      <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffd700" />
        <stop offset="50%" stopColor="#d4af37" />
        <stop offset="100%" stopColor="#aa8323" />
      </linearGradient>
    </defs>
  </svg>
);

// --- Issuers ---

export { AppleOfficial as Apple } from './Apple';
export { HsbcOfficial as HSBC } from './Hsbc';
export { ChaseOfficial as Chase } from './Chase';

export function Citi({ variant = 'white', className, ...props }: LogoProps) {
  const fillBlue = getFill(variant, '#003b70');
  const fillRed = getFill(variant, '#ee1c25');
  return (
    <svg viewBox="0 0 100 50" className={className} {...props}>
      <path d="M20,40 Q50,0 80,40" fill="none" stroke={fillRed} strokeWidth="6" />
      <text x="50" y="45" fontSize="30" fontFamily="Arial" fontWeight="bold" fill={fillBlue} textAnchor="middle">citi</text>
    </svg>
  );
}

// --- Networks ---

export { VisaOfficial as Visa } from './Visa';
export { MastercardOfficial as Mastercard } from './Mastercard';
export { AmexOfficial as Amex } from './Amex';
export { UnionPayOfficial as UnionPay } from './Unionpay';
export { JcbOfficial as JCB } from './Jcb';
