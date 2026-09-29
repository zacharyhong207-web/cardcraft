import { LogoConfig } from '@/types/studio';
export type ChipStyle = 'gold' | 'silver' | 'none';

export interface CardData {
  id: string;
  title: string;
  titleEn?: string;
  scene?: string;
  palette?: string;
  atmosphere?: string;
  
  // 新增的多模态视觉特征基因
  visualDna?: {
    lighting: string;
    palette: string;
    mood: string;
    composition: string;
    recommendedBadge: string;
  };
  semanticKeywords?: string[];
  summaryForEmbedding?: string;

  // 搜索时由服务端附加的 AI 评分与推荐理由
  matchScore?: number;
  aiReason?: string;

  author: string;
  tags: string[]; // 灵活标签池，前端据此自动聚类
  keywords?: string[]; // 隐式联想搜索词库
  imageUrl: string;
  source?: string;
  sourceUrl?: string;
  chipStyle?: ChipStyle;
  likes: number;
  downloads: number;
}

export interface DIYConfig {
  logoConfig?: LogoConfig;
  network?: 'visa' | 'mastercard' | 'amex' | 'unionpay' | 'jcb' | 'none';
  issuer?: 'apple' | 'hsbc' | 'chase' | 'citi' | 'none';
  style: 'white' | 'color' | 'gold';
  holderName?: string;
  showNfc?: boolean;
}

