// 双语词族映射表（支持常见意象、主体、色彩与风格）
const THESAURUS_GROUPS: string[][] = [
  // 城市与建筑
  ['城市', '都市', '街头', '街道', '摩天大楼', '霓虹', 'city', 'urban', 'metropolis', 'street', 'downtown', 'skyline', 'neon'],
  // 城堡与古建
  ['城堡', '古堡', '中世纪', '宫殿', '要塞', '古建', 'castle', 'chateau', 'palace', 'fortress', 'medieval', 'burg'],
  // 自然山川
  ['山', '雪山', '山峰', '日照金山', '阿尔卑斯', '岩壁', 'mountain', 'mount', 'alps', 'peak', 'summit', 'ridge', 'alpenglow'],
  // 铁路与载具
  ['火车', '列车', '机车', '铁道', '轨道', '车厢', '内燃机', 'train', 'locomotive', 'rail', 'railway', 'carriage', 'engine', 'transit'],
  // 天气与光影
  ['雨', '雨天', '雨夜', '湿漉', '倒影', '积水', 'rain', 'rainy', 'wet', 'reflection', 'puddle'],
  ['雾', '晨雾', '薄雾', '迷雾', 'fog', 'mist', 'haze', 'foggy', 'misty'],
  ['日落', '夕阳', '黄昏', '晨曦', '朝霞', '晚霞', 'sunset', 'sunrise', 'dusk', 'dawn', 'glow', 'twilight'],
  // 地图与典籍
  ['地图', '世界地图', '木刻', '羊皮纸', '复古', '航海', 'map', 'cartography', 'atlas', 'antique', 'parchment', 'woodcut'],
  // 风格与情绪
  ['暗黑', '深空', '黑武士', '冷淡', '极简', 'dark', 'black', 'noir', 'stealth', 'minimal', 'minimalist'],
  ['暖色', '金色', '复古胶片', '颗粒', 'warm', 'gold', 'golden', 'vintage', 'retro', 'film', 'grain'],
];

/**
 * 将用户输入的检索词扩展为双语同义词组
 * 例如输入 "城市" -> ["城市", "city", "urban", "metropolis", "街道"...]
 * 输入 "castle" -> ["castle", "城堡", "古堡", "medieval", "fortress"...]
 */
export function expandQueryBilingual(rawQuery: string): string[] {
  if (!rawQuery || !rawQuery.trim()) return [];

  const lowerQ = rawQuery.trim().toLowerCase();
  const resultSet = new Set<string>([lowerQ]);

  for (const group of THESAURUS_GROUPS) {
    // 判断用户输入的词是否命中了该同义词组中的任意一项
    const isMatched = group.some(term => 
      term.toLowerCase().includes(lowerQ) || lowerQ.includes(term.toLowerCase())
    );

    if (isMatched) {
      // 将整组双语同义词全部扩充进搜索词表
      group.forEach(term => resultSet.add(term.toLowerCase()));
    }
  }

  return Array.from(resultSet);
}
