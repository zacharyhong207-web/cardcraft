import * as React from "react";
import type { SVGProps } from "react";
export function ChaseOfficial(props: SVGProps<SVGSVGElement> & { variant?: 'color'|'white'|'gold' }) {
  const { variant = 'white', ...rest } = props;
  const isColor = variant === 'color';
  const isGold = variant === 'gold';
  // simple-icons uses currentColor or just a path. We'll add fill.
  const fill = isColor ? (false ? '#1434CB' : '#117aca') : isGold ? 'url(#gold-gradient)' : 'rgba(255,255,255,0.9)';
  return (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    {...props}
   fill={fill}>
    <path d="M0 15.415c0 .468.38.85.848.85h5.937V.575L0 7.72zm15.416 8.582c.467 0 .846-.38.846-.849v-5.937H.573l7.146 6.785h7.697M24 8.587a.844.844 0 0 0-.847-.846h-5.938V23.43l6.782-7.148zM8.585.003a.847.847 0 0 0-.847.847v5.94h15.688L16.282.003z" />
  </svg>
);
}
