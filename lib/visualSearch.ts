export interface VisualFingerprint {
  dominantHue: 'dark' | 'gold' | 'blue' | 'emerald' | 'warm' | 'white';
  brightness: number;
  contrast: number;
}

// 快速离屏分析图片色彩指纹（供以图搜图使用）
export async function extractImageFingerprint(imageSrc: string): Promise<VisualFingerprint> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 40;
      canvas.height = 25;
      if (!ctx) {
        resolve({ dominantHue: 'dark', brightness: 0.2, contrast: 0.5 });
        return;
      }
      ctx.drawImage(img, 0, 0, 40, 25);
      const data = ctx.getImageData(0, 0, 40, 25).data;
      let r = 0, g = 0, b = 0;
      const count = data.length / 4;
      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
      }
      r /= count; g /= count; b /= count;
      const brightness = (r * 299 + g * 587 + b * 114) / 1000 / 255;
      
      let dominantHue: VisualFingerprint['dominantHue'] = 'dark';
      if (brightness > 0.7) dominantHue = 'white';
      else if (r > b * 1.3 && g > b * 1.1) dominantHue = 'gold';
      else if (b > r * 1.2) dominantHue = 'blue';
      else if (g > r * 1.1 && g > b * 1.1) dominantHue = 'emerald';
      else if (r > b * 1.2) dominantHue = 'warm';

      resolve({ dominantHue, brightness, contrast: 0.6 });
    };
    img.onerror = () => resolve({ dominantHue: 'dark', brightness: 0.2, contrast: 0.5 });
  });
}
