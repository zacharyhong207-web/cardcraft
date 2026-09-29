// 核心中英双向映射字典
export const BILINGUAL_MAP: Record<string, string[]> = {
  // 自然与地理
  'mountain': ['山', '雪山', '高山', '峰', '山脉'],
  'desert': ['沙漠', '荒漠', '沙丘', '戈壁'],
  'pyramid': ['金字塔', '古埃及', '法老', '陵墓'],
  'pyramids': ['金字塔', '古埃及'],
  'sea': ['海', '大海', '海洋', '波浪'],
  'ocean': ['海', '海洋', '深海'],
  'forest': ['森林', '树木', '树林'],
  'sky': ['天空', '云端', '苍穹'],
  'space': ['太空', '宇宙', '星空', '深空'],
  'nebula': ['星云', '星系', '太空'],

  // 人物、建筑与题材
  'building': ['建筑', '房屋', '古建', '城堡'],
  'man': ['人', '男人', '人物', '男性'],
  'portrait': ['肖像', '人像', '油画'],
  'painting': ['油画', '画作', '艺术', '水彩'],
  'dripping': ['滴落', '溶解', '超现实'],
  'retro': ['复古', '怀旧', '老式'],

  // 交通与出行
  'metro': ['地铁', '地下铁', '轻轨'],
  'subway': ['地铁', '地下铁'],
  'train': ['火车', '列车', '机车', '铁道'],
  'transit': ['交通', '出行', '一卡通'],
  'pass': ['通行证', '门禁', '卡面', '通票'],

  // 材质与工艺
  'titanium': ['钛', '钛金属', '原色钛'],
  'carbon': ['碳纤维', '碳'],
  'gold': ['金', '黄金', '黑金', '沉金'],
  'silver': ['银', '银色', '不锈钢'],
  'circuit': ['电路', '走线', '电路板', 'pcb'],
  'chip': ['芯片', '晶圆', '半导体']
};

// 反向索引：由中文查英文（自动构建，无需人工重复手写）
export const ZH_TO_EN_MAP: Record<string, string[]> = {};

Object.entries(BILINGUAL_MAP).forEach(([enKey, zhList]) => {
  zhList.forEach(zh => {
    if (!ZH_TO_EN_MAP[zh]) ZH_TO_EN_MAP[zh] = [];
    ZH_TO_EN_MAP[zh].push(enKey);
  });
});
