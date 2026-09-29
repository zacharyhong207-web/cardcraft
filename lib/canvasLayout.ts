import { LogoConfig } from '@/types/studio';

export interface LogoPlacement {
  widthPct: number;    // relative to container width
  heightPct: number;   // relative to container height
  leftPct: number;     // relative to container width
  topPct: number;      // relative to container height
}

/**
 * 纯函数：统一计算 Logo 的绝对百分比坐标与尺寸
 * @param config 用户配置的 Logo 参数
 * @param logoIntrinsicRatio Logo 原生宽高比 (width / height)
 * @param containerRatio 容器宽高比 (默认 1536/969 = 1.585)
 * @returns { widthPct, heightPct, leftPct, topPct } (均为 0~100 的百分比)
 */
export function getLogoPlacement(
  config: LogoConfig,
  logoIntrinsicRatio: number,
  containerRatio: number = 1536 / 969
): LogoPlacement {
  // 基准尺寸与边距（基于 1536x969 换算为百分比）
  // Base height: 64px / 969px ≈ 6.6%
  const BASE_HEIGHT_PCT = 6.6; 
  // Base padding: 72px / 969px ≈ 7.43% for vertical, 72px / 1536px ≈ 4.69% for horizontal
  const PAD_Y_PCT = 7.43; 
  const PAD_X_PCT = 4.69;

  // 缩放后的最终宽高百分比
  const heightPct = BASE_HEIGHT_PCT * config.scale;
  // widthPct = (heightPct * containerHeight) * logoIntrinsicRatio / containerWidth
  // widthPct = heightPct * logoIntrinsicRatio / containerRatio
  const widthPct = (heightPct * logoIntrinsicRatio) / containerRatio;

  let leftPct = 0;
  let topPct = 0;

  // 根据四角停靠计算基础坐标
  if (config.anchor.includes('left')) {
    leftPct = PAD_X_PCT;
  } else {
    leftPct = 100 - PAD_X_PCT - widthPct;
  }

  if (config.anchor.includes('top')) {
    topPct = PAD_Y_PCT;
  } else {
    topPct = 100 - PAD_Y_PCT - heightPct;
  }

  // 叠加用户微调偏移量
  // 用户的 offsetX 是 -5 到 5，代表基于自身的百分比偏移，如 5% width
  // 换算为容器宽度的百分比增量
  const moveXPct = (config.offsetX / 100) * widthPct;
  const moveYPct = (config.offsetY / 100) * heightPct;

  leftPct += moveXPct;
  topPct += moveYPct;

  return { widthPct, heightPct, leftPct, topPct };
}
