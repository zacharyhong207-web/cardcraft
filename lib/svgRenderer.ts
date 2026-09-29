import React from 'react';
import { renderToString } from 'react-dom/server';
import { Apple, HSBC, Chase, Citi, Visa, Mastercard, Amex, UnionPay, JCB } from '../components/diy/CardLogos';

export const getDefs = () => {
  return `<defs>
    <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffd700" />
      <stop offset="50%" stop-color="#d4af37" />
      <stop offset="100%" stop-color="#aa8323" />
    </linearGradient>
  </defs>`;
};

export const getIssuerSvg = (issuer: string, style: string) => {
  let el = null;
  const props = { variant: style as any, xmlns: "http://www.w3.org/2000/svg" };
  switch (issuer) {
    case 'apple': el = React.createElement(Apple, props); break;
    case 'hsbc': el = React.createElement(HSBC, props); break;
    case 'chase': el = React.createElement(Chase, props); break;
    case 'citi': el = React.createElement(Citi, props); break;
  }
  if (!el) return '';
  const str = renderToString(el);
  // Inject defs right after the opening <svg> tag for gold gradient
  return str.replace(/<svg[^>]*>/, `$&${getDefs()}`);
};

export const getNetworkSvg = (network: string, style: string) => {
  let el = null;
  const props = { variant: style as any, xmlns: "http://www.w3.org/2000/svg" };
  switch (network) {
    case 'visa': el = React.createElement(Visa, props); break;
    case 'mastercard': el = React.createElement(Mastercard, props); break;
    case 'amex': el = React.createElement(Amex, props); break;
    case 'unionpay': el = React.createElement(UnionPay, props); break;
    case 'jcb': el = React.createElement(JCB, props); break;
  }
  if (!el) return '';
  const str = renderToString(el);
  return str.replace(/<svg[^>]*>/, `$&${getDefs()}`);
};
