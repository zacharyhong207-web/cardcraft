import { expandQueryBilingual } from './bilingualThesaurus';

export function searchCardsBilingual(cards: any[], query: string) {
  if (!query || !query.trim()) return cards;

  // 获取扩展后的双语意向词族
  const queryTokens = expandQueryBilingual(query);

  const scoredCards = cards.map(card => {
    let score = 0;
    const titleZh = (card.title || '').toLowerCase();
    const titleEn = (card.titleEn || '').toLowerCase();
    const summary = (card.summaryForEmbedding || '').toLowerCase();
    const dnaText = `${card.visualDna?.lighting || ''} ${card.visualDna?.palette || ''} ${card.visualDna?.mood || ''}`.toLowerCase();
    
    // 合并卡片现有的所有关键词与标签
    const cardKeywords = [
      ...(card.tags || []),
      ...(card.semanticKeywords || []),
      card.category || ''
    ].map(k => String(k).toLowerCase());

    // 遍历每一个扩展词进行命中测试
    for (const token of queryTokens) {
      // 1. 用户原始搜索词直接命中标题（最高权重 50 分）
      if (token === query.toLowerCase() && (titleZh.includes(token) || titleEn.includes(token))) {
        score += 50;
      }
      // 2. 扩展词命中标题（30 分）
      else if (titleZh.includes(token) || titleEn.includes(token)) {
        score += 30;
      }

      // 3. 命中关键词/标签库（每次命中 +15 分）
      const kwMatches = cardKeywords.filter(kw => kw.includes(token) || token.includes(kw));
      if (kwMatches.length > 0) {
        score += kwMatches.length * 15;
      }

      // 4. 命中视觉模型生成的描述或 DNA 字段（+10 分）
      if (summary.includes(token) || dnaText.includes(token)) {
        score += 10;
      }
    }

    return {
      ...card,
      searchScore: score,
    };
  });

  // 仅保留有命中得分的卡片，并按相关度由高到低降序排列
  return scoredCards
    .filter(card => card.searchScore > 0)
    .sort((a, b) => b.searchScore - a.searchScore);
}
