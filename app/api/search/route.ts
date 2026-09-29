import { expandQueryBilingual } from '@/lib/bilingualThesaurus';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  const { query, language = 'zh' } = await req.json();

  if (!query || !query.trim()) {
    return NextResponse.json({ results: [] });
  }

  const cardsPath = path.join(process.cwd(), 'public/data/cards.json');
  const cards = JSON.parse(fs.readFileSync(cardsPath, 'utf-8'));

  // 借助轻量智能模型对用户输入进行意图与意象扩展，或进行语义评分
  // 对比用户的搜索词与卡库中每张卡的 summaryForEmbedding & visualDna
  const expandedQueries = expandQueryBilingual(query);
  const scoredCards = cards.map((card: any) => {
    let score = 0;
    const q = query.toLowerCase();
    
    // Evaluate across all expanded bilingual queries
    let matchMultiplier = 1;
    let localScore = 0;
    
    for (const eq of expandedQueries) {
      if (card.title?.toLowerCase().includes(eq) || card.titleEn?.toLowerCase().includes(eq)) localScore += 40;
      const dnaText = `${card.visualDna?.lighting || ''} ${card.visualDna?.palette || ''} ${card.visualDna?.mood || ''} ${card.visualDna?.composition || ''}`.toLowerCase();
      if (dnaText.includes(eq)) localScore += 30;
      const matchedKeywords = card.semanticKeywords?.filter((kw: string) => kw.toLowerCase().includes(eq) || eq.includes(kw.toLowerCase()));
      if (matchedKeywords && matchedKeywords.length > 0) localScore += matchedKeywords.length * 8;
      if (card.summaryForEmbedding?.toLowerCase().includes(eq)) localScore += 25;
    }
    
    score = Math.min(localScore, 50); // cap max base score so percentage doesn't explode

    

    // 计算归一化匹配契合度 (百分比)
    const matchPercentage = Math.min(Math.round((score / 50) * 100), 99);

    return {
      ...card,
      matchScore: matchPercentage,
      aiReason: card.visualDna
        ? `${card.visualDna.palette} · ${card.visualDna.lighting} · ${card.visualDna.mood}`
        : null
    };
  });

  // 过滤并按匹配得分由高到低降序
  const results = scoredCards
    .filter((c: any) => c.matchScore > 20)
    .sort((a: any, b: any) => b.matchScore - a.matchScore);

  return NextResponse.json({ results });
}
