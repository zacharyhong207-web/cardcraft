import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const cardsPath = path.join(process.cwd(), 'public/data/cards.json');
    const localCards = JSON.parse(fs.readFileSync(cardsPath, 'utf-8'));

    // 1. 建立本地已有卡片的特征集合（用 ID 或 图片 URL 做唯一键）
    const existingIds = new Set(localCards.map((c: any) => String(c.id)));
    const existingUrls = new Set(localCards.map((c: any) => String(c.imageUrl)));

    // 2. 从 GitHub 获取远程社区卡片列表
    // 提示：建议使用 git/trees 递归获取完整文件列表，避免 contents 接口的 30/50 条分页限制
    const GITHUB_REPO = 'dharmx/walls'; // 实际抓取的仓库
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/git/trees/main?recursive=1`, {
      headers: {
        'User-Agent': 'CardCraft-App',
      },
    });

    if (!res.ok) {
      return NextResponse.json({ success: false, error: 'GitHub 访问受限或网络超时' }, { status: 500 });
    }

    const data = await res.json();
    const tree = data.tree || [];

    // 筛选出所有图片文件
    const imageFiles = tree.filter((file: any) => 
      file.type === 'blob' && /\.(png|jpe?g|webp)$/i.test(file.path)
    );

    // 3. 【核心修正点】：先全部排除掉本地已收录的！
    const unaddedCards = imageFiles.filter((file: any) => {
      const fileName = path.basename(file.path);
      // Construct raw jsdelivr URL which we previously used, or raw.githubusercontent.com
      // The original script used cdn.jsdelivr.net so we should match the existingUrls to what we actually save
      const rawUrl = `https://cdn.jsdelivr.net/gh/${GITHUB_REPO}@main/${file.path}`;
      // 只要 ID 或图片链接在本地存在，就排除
      return !existingIds.has(fileName) && !existingUrls.has(rawUrl);
    });

    // 如果所有卡片都已同步完毕
    if (unaddedCards.length === 0) {
      return NextResponse.json({ 
        success: true, 
        addedCount: 0, 
        message: '仓库中所有卡面已全部收录，没有更多新卡了！' 
      });
    }

    // 4. 从未收录的池子里，截取接下来的 50 张
    const BATCH_SIZE = 50;
    const batchToImport = unaddedCards.slice(0, BATCH_SIZE).map((file: any) => {
      const fileName = path.basename(file.path, path.extname(file.path));
      const rawUrl = `https://cdn.jsdelivr.net/gh/${GITHUB_REPO}@main/${file.path}`;
      
      const readableTitle = fileName.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

      return {
        id: `gh-${file.sha.slice(0, 10)}`,
        title: readableTitle,
        titleEn: readableTitle,
        imageUrl: rawUrl,
        author: 'GitHub Community',
        category: 'community',
        tags: ['community', 'github', 'apple-wallet'],
        likes: Math.floor(Math.random() * 5000) + 1000,
        downloads: Math.floor(Math.random() * 3000) + 500
      };
    });

    // 5. 追加写入 localCards 并保存
    const updatedCards = [...localCards, ...batchToImport];
    fs.writeFileSync(cardsPath, JSON.stringify(updatedCards, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      addedCount: batchToImport.length,
      totalCount: updatedCards.length,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
