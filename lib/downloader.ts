import { CardLayerState } from '@/types/studio';


export async function generateCardDataURL(
  card: { title: string; imageUrl: string },
  layers: CardLayerState[],
  customBg?: string | null,
  bgTransform: {xPct: number, yPct: number, scale: number} = {xPct: 0, yPct: 0, scale: 1},
  lowRes: boolean = false
): Promise<string> {
  const WIDTH = lowRes ? 768 : 1536;
  const HEIGHT = lowRes ? 484 : 969;
  const RADIUS = lowRes ? 36 : 72; 

  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  let srcUrl = customBg || card.imageUrl;
  if (!srcUrl) return '';

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = srcUrl.startsWith('data:') || srcUrl.startsWith('blob:') ? srcUrl : `/api/proxy-image?url=${encodeURIComponent(srcUrl)}`;

  try {
    await img.decode();
  } catch (err) {
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
  }

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(0, 0, WIDTH, HEIGHT, RADIUS);
  ctx.clip();

  // Draw BG with transform
  const imgRatio = img.width / img.height;
  const canvasRatio = WIDTH / HEIGHT;
  let renderW, renderH, offsetX, offsetY;

  if (imgRatio > canvasRatio) {
    renderH = HEIGHT;
    renderW = HEIGHT * imgRatio;
    offsetX = (WIDTH - renderW) / 2;
    offsetY = 0;
  } else {
    renderW = WIDTH;
    renderH = WIDTH / imgRatio;
    offsetX = 0;
    offsetY = (HEIGHT - renderH) / 2;
  }
  
  const scaledW = renderW * bgTransform.scale;
  const scaledH = renderH * bgTransform.scale;
  const shiftX = (bgTransform.xPct / 100) * WIDTH;
  const shiftY = (bgTransform.yPct / 100) * HEIGHT;
  const finalX = offsetX - (scaledW - renderW) / 2 + shiftX;
  const finalY = offsetY - (scaledH - renderH) / 2 + shiftY;

  ctx.drawImage(img, finalX, finalY, scaledW, scaledH);

  // Glass overlay
  const glassGrad = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
  glassGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.03)');
  glassGrad.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
  ctx.fillStyle = glassGrad;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);
  const { getIssuerSvg, getNetworkSvg } = await import('./svgRenderer');

  for (const layer of sortedLayers) {
    const centerX = (layer.xPct / 100) * WIDTH;
    const centerY = (layer.yPct / 100) * HEIGHT;

    if (layer.type === 'text') {
      ctx.save();
      const baseFontSize = 0.045 * WIDTH;
      ctx.font = `bold ${baseFontSize * layer.scale}px ${layer.fontFamily === 'serif' ? 'serif' : 'sans-serif'}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const text = layer.content.toUpperCase();

      if (layer.finish === 'embossed') {
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetY = -1;
        ctx.fillText(text, centerX, centerY);
        
        ctx.shadowColor = 'rgba(255,255,255,0.6)';
        ctx.shadowBlur = 1.5;
        ctx.shadowOffsetY = 1;
        ctx.fillText(text, centerX, centerY);
      } else if (layer.finish === 'gold_foil') {
        const grad = ctx.createLinearGradient(centerX - 100, centerY - 20, centerX + 100, centerY + 20);
        grad.addColorStop(0, '#bf953f');
        grad.addColorStop(0.25, '#fcf6ba');
        grad.addColorStop(0.5, '#b38728');
        grad.addColorStop(0.75, '#fbf5b7');
        grad.addColorStop(1, '#aa771c');
        
        ctx.fillStyle = grad;
        ctx.shadowColor = 'rgba(170,119,28,0.4)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 2;
        ctx.fillText(text, centerX, centerY);
      } else if (layer.finish === 'laser_etched') {
        ctx.fillStyle = '#e0e0e0';
        ctx.shadowColor = 'rgba(255,255,255,0.8)';
        ctx.shadowBlur = 1;
        ctx.shadowOffsetY = 1;
        ctx.fillText(text, centerX, centerY);
        
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowOffsetY = -1;
        ctx.fillText(text, centerX, centerY);
      } else if (layer.finish === 'matte_black') {
        ctx.fillStyle = '#18181b';
        ctx.shadowColor = 'rgba(255,255,255,0.2)';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0.5;
        ctx.fillText(text, centerX, centerY);
      } else {
        ctx.fillStyle = layer.finish === 'gold' ? '#D4AF37' : layer.finish === 'silver' ? '#C0C0C0' : 'white';
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 2;
        ctx.fillText(text, centerX, centerY);
      }
      ctx.restore();
        } else if (layer.type === 'logo' || layer.type === 'chip' || layer.type === 'image') {
      const isNetwork = ['visa', 'mastercard', 'unionpay', 'amex', 'jcb'].includes(layer.content);
      const isIssuer = ['apple', 'hsbc', 'chase', 'citi'].includes(layer.content);
      const isMetallic = layer.finish === 'gold' || layer.finish === 'silver' || layer.finish === 'hologram';

      let svgStr = '';
      if (isNetwork) {
        svgStr = getNetworkSvg(layer.content as any, isMetallic ? 'white' : (layer.finish as any));
      } else if (isIssuer) {
        svgStr = getIssuerSvg(layer.content as any, isMetallic ? 'white' : (layer.finish as any));
      }

      if (svgStr || layer.content.startsWith('data:image')) {
        const src = layer.content.startsWith('data:image') ? layer.content : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgStr)}`;
        const layerImg = new Image();
        await new Promise(r => { layerImg.onload = r; layerImg.src = src; });
        
        const baseWidth = 0.15 * WIDTH; 
        const aspectRatio = layerImg.width / layerImg.height;
        const targetW = baseWidth * layer.scale;
        const targetH = targetW / aspectRatio;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate((layer.rotation * Math.PI) / 180);

        if (isMetallic) {
          // Offscreen mask composite
          const offCanvas = document.createElement('canvas');
          offCanvas.width = targetW;
          offCanvas.height = targetH;
          const octx = offCanvas.getContext('2d')!;
          
          // Draw silhouette
          octx.drawImage(layerImg, 0, 0, targetW, targetH);
          
          octx.globalCompositeOperation = 'source-in';
          
          const grad = octx.createLinearGradient(0, 0, targetW, targetH);
          if (layer.finish === 'gold') {
             grad.addColorStop(0, '#FFE082');
             grad.addColorStop(0.25, '#FFB300');
             grad.addColorStop(0.5, '#FFF8E1');
             grad.addColorStop(0.75, '#FFA000');
             grad.addColorStop(1, '#FFE082');
          } else if (layer.finish === 'silver') {
             grad.addColorStop(0, '#F5F5F5');
             grad.addColorStop(0.3, '#BDBDBD');
             grad.addColorStop(0.5, '#FFFFFF');
             grad.addColorStop(0.7, '#9E9E9E');
             grad.addColorStop(1, '#EEEEEE');
          } else if (layer.finish === 'hologram') {
             grad.addColorStop(0, '#ff7b9c');
             grad.addColorStop(0.3, '#7b9cff');
             grad.addColorStop(0.6, '#9cff7b');
             grad.addColorStop(1, '#ff7b9c');
          }
          octx.fillStyle = grad;
          octx.fillRect(0, 0, targetW, targetH);

          // Drop shadow for the metallic logo
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = 2;
          ctx.shadowOffsetY = 1;

          ctx.drawImage(offCanvas, -targetW / 2, -targetH / 2, targetW, targetH);
        } else {
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = 4;
          ctx.shadowOffsetY = 2;

          if (layer.finish === 'white') {
            // Render white using source-in just like metallic, but with solid white
            const offCanvas = document.createElement('canvas');
            offCanvas.width = targetW;
            offCanvas.height = targetH;
            const octx = offCanvas.getContext('2d')!;
            octx.drawImage(layerImg, 0, 0, targetW, targetH);
            octx.globalCompositeOperation = 'source-in';
            octx.fillStyle = '#FFFFFF';
            octx.fillRect(0, 0, targetW, targetH);
            ctx.drawImage(offCanvas, -targetW / 2, -targetH / 2, targetW, targetH);
          } else {
            ctx.drawImage(layerImg, -targetW / 2, -targetH / 2, targetW, targetH);
          }
        }
        
        ctx.restore();
      }
    }

  }

  ctx.lineWidth = lowRes ? 2 : 4;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.stroke();
  ctx.restore();

  // Convert to highly compressed JPEG or base64 to save DB space
  return canvas.toDataURL('image/jpeg', 0.85);
}


export async function downloadCardAsPng(
  card: { title: string; imageUrl: string },
  layers: CardLayerState[],
  customBg?: string | null,
  bgTransform: {xPct: number, yPct: number, scale: number} = {xPct: 0, yPct: 0, scale: 1}
) {
  const dataUrl = await generateCardDataURL(card, layers, customBg, bgTransform, false);
  const link = document.createElement('a');
  link.download = `${card.title.replace(/[\s\/\\]+/g, '_')}-Studio.png`;
  link.href = dataUrl;
  link.click();
}

