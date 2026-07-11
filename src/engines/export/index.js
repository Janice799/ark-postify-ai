import { BACKGROUND_CATEGORIES } from '../../backgroundData';
import { useUIStore } from '../../store/useUIStore';
import { useEditorStore } from '../../store/useEditorStore';
import { translations } from '../../lib/translations';

const loadImg = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = url;
  });
};

const parseLinearGradient = (val) => {
  const matches = [...val.matchAll(/(#[a-fA-F0-9]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\))/g)];
  if (matches.length >= 2) {
    return [matches[0][0], matches[1][0]];
  }
  return null;
};

const parseTextShadow = (shadowStr) => {
  if (!shadowStr || shadowStr === 'none') return null;
  const colorMatch = shadowStr.match(/(rgba?\(.*?\)|#[a-fA-F0-9]{3,8}|[a-zA-Z]+)$/);
  if (!colorMatch) return null;
  const color = colorMatch[1];
  const rest = shadowStr.replace(color, '').trim();
  const parts = rest.split(/\s+/);
  if (parts.length >= 3) {
    const offsetX = parseFloat(parts[0]) * 2.5;
    const offsetY = parseFloat(parts[1]) * 2.5;
    const blur = parseFloat(parts[2]) * 2.5;
    return { offsetX, offsetY, blur, color };
  }
  return null;
};

// CJK-aware character and word-level line wrapping algorithm
const wrapTextCJK = (ctx, text, maxWidth) => {
  const paragraphs = text.split('\n');
  const lines = [];
  
  for (const para of paragraphs) {
    if (para === '') {
      lines.push('');
      continue;
    }
    
    const hasCJK = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf\uac00-\ud7a3]/.test(para);
    
    if (hasCJK) {
      const tokens = [];
      let currentEngWord = '';
      for (const char of para) {
        if (/[a-zA-Z0-9']/.test(char)) {
          currentEngWord += char;
        } else {
          if (currentEngWord) {
            tokens.push(currentEngWord);
            currentEngWord = '';
          }
          tokens.push(char);
        }
      }
      if (currentEngWord) {
        tokens.push(currentEngWord);
      }
      
      let currentLine = '';
      for (const token of tokens) {
        if (token === ' ' && !currentLine) continue;
        const testLine = currentLine + token;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine) {
          lines.push(currentLine.trim());
          currentLine = token === ' ' ? '' : token;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        lines.push(currentLine.trim());
      }
    } else {
      const words = para.split(' ');
      let currentLine = '';
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const testLine = currentLine ? currentLine + ' ' + word : word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }
    }
  }
  return lines;
};

export const renderCardToCanvas = async () => {
  const { bgStyle, bgPosition, aspectRatio, fontFamily, fontSize, lineHeight, textColor, customBgImage } = useUIStore.getState();
  const { englishText } = useEditorStore.getState();
  
  const is169 = aspectRatio === '16:9';
  const width = 1200;
  const height = is169 ? 675 : 1200;
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  const isCustomBackground = bgStyle?.startsWith('custom-');
  
  // Find background object
  let currentBgObj = null;
  for (const category of Object.values(BACKGROUND_CATEGORIES)) {
    const found = category.find(b => b.id === bgStyle);
    if (found) {
      currentBgObj = found;
      break;
    }
  }
  if (!currentBgObj && !isCustomBackground) {
    const firstCategory = Object.values(BACKGROUND_CATEGORIES)[0];
    currentBgObj = firstCategory ? firstCategory[0] : { id: 'fallback', type: 'solid', value: '#111', textColor: '#fff', textShadow: 'none' };
  }
  
  // 1. Draw Background Layer
  if (isCustomBackground && customBgImage) {
    try {
      const img = await loadImg(customBgImage);
      // Draw Cover Image
      const iw = img.width;
      const ih = img.height;
      const r = Math.max(width / iw, height / ih);
      const nw = iw * r;
      const nh = ih * r;
      const nx = (width - nw) / 2;
      let ny = (height - nh) / 2;
      
      if (bgPosition === 'top') ny = 0;
      else if (bgPosition === 'bottom') ny = height - nh;
      
      ctx.drawImage(img, nx, ny, nw, nh);
    } catch (e) {
      console.error('Failed to load custom background image', e);
      ctx.fillStyle = '#111111';
      ctx.fillRect(0, 0, width, height);
    }
  } else if (currentBgObj) {
    if (currentBgObj.type === 'solid') {
      ctx.fillStyle = currentBgObj.value;
      ctx.fillRect(0, 0, width, height);
    } else if (currentBgObj.type === 'gradient') {
      if (currentBgObj.id === 'mesh-sunset') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        
        let g = ctx.createRadialGradient(width * 0.4, height * 0.2, 0, width * 0.4, height * 0.2, width * 0.7);
        g.addColorStop(0, 'hsla(28,100%,74%,1)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);
        
        g = ctx.createRadialGradient(width * 0.8, 0, 0, width * 0.8, 0, width * 0.7);
        g.addColorStop(0, 'hsla(189,100%,56%,1)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);
        
        g = ctx.createRadialGradient(0, height * 0.5, 0, 0, height * 0.5, width * 0.7);
        g.addColorStop(0, 'hsla(355,100%,93%,1)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);
      } else if (currentBgObj.id === 'mesh-ocean') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        
        let g = ctx.createRadialGradient(width * 0.8, 0, 0, width * 0.8, 0, width * 0.7);
        g.addColorStop(0, 'hsla(189,100%,56%,1)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);
        
        g = ctx.createRadialGradient(0, height * 0.5, 0, 0, height * 0.5, width * 0.7);
        g.addColorStop(0, 'hsla(355,100%,93%,1)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);
        
        g = ctx.createRadialGradient(width * 0.8, height, 0, width * 0.8, height, width * 0.7);
        g.addColorStop(0, 'hsla(242,100%,70%,1)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);
      } else if (currentBgObj.id === 'mesh-dark') {
        ctx.fillStyle = '#111111';
        ctx.fillRect(0, 0, width, height);
        
        let g = ctx.createRadialGradient(0, 0, 0, 0, 0, width * 0.7);
        g.addColorStop(0, 'hsla(253,16%,7%,1)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);
        
        g = ctx.createRadialGradient(width * 0.5, 0, 0, width * 0.5, 0, width * 0.7);
        g.addColorStop(0, 'hsla(225,39%,30%,1)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);
        
        g = ctx.createRadialGradient(width, 0, 0, width, 0, width * 0.7);
        g.addColorStop(0, 'hsla(339,49%,30%,1)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);
      } else {
        const colors = parseLinearGradient(currentBgObj.value);
        if (colors) {
          const g = ctx.createLinearGradient(0, 0, width, height);
          g.addColorStop(0, colors[0]);
          g.addColorStop(1, colors[1]);
          ctx.fillStyle = g;
        } else {
          ctx.fillStyle = currentBgObj.bgColor || '#fff';
        }
        ctx.fillRect(0, 0, width, height);
      }
    } else if (currentBgObj.type === 'texture') {
      ctx.fillStyle = currentBgObj.bgColor || '#111';
      ctx.fillRect(0, 0, width, height);
      
      if (currentBgObj.id.startsWith('pattern-dots')) {
        ctx.fillStyle = currentBgObj.id === 'pattern-dots-light' ? '#dddddd' : '#333333';
        for (let x = 10; x < width; x += 20) {
          for (let y = 10; y < height; y += 20) {
            ctx.beginPath();
            ctx.arc(x, y, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (currentBgObj.id.startsWith('grid')) {
        ctx.strokeStyle = currentBgObj.id === 'grid-light' ? '#eeeeee' : '#333333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 20; x < width; x += 20) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
        }
        for (let y = 20; y < height; y += 20) {
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
        }
        ctx.stroke();
      } else if (currentBgObj.id.startsWith('lines-h')) {
        ctx.strokeStyle = currentBgObj.id === 'lines-h-light' ? '#eeeeee' : '#333333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let y = 20; y < height; y += 20) {
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
        }
        ctx.stroke();
      } else if (currentBgObj.id.startsWith('lines-v')) {
        ctx.strokeStyle = currentBgObj.id === 'lines-v-light' ? '#eeeeee' : '#333333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 20; x < width; x += 20) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
        }
        ctx.stroke();
      } else if (currentBgObj.id.startsWith('crosshatch')) {
        ctx.strokeStyle = currentBgObj.id === 'crosshatch-light' ? '#eeeeee' : '#333333';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        for (let k = -height; k < width; k += 30) {
          ctx.moveTo(k, 0);
          ctx.lineTo(k + height, height);
          ctx.moveTo(k + height, 0);
          ctx.lineTo(k, height);
        }
        ctx.stroke();
      }
    } else if (currentBgObj.type === 'image') {
      try {
        const cleanedUrl = currentBgObj.value.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
        const img = await loadImg(cleanedUrl);
        const iw = img.width;
        const ih = img.height;
        const r = Math.max(width / iw, height / ih);
        const nw = iw * r;
        const nh = ih * r;
        const nx = (width - nw) / 2;
        let ny = (height - nh) / 2;
        
        if (bgPosition === 'top') ny = 0;
        else if (bgPosition === 'bottom') ny = height - nh;
        
        ctx.drawImage(img, nx, ny, nw, nh);
      } catch (e) {
        console.error('Failed to load preset background image', e);
        ctx.fillStyle = '#11';
        ctx.fillRect(0, 0, width, height);
      }
    }
  } else {
    ctx.fillStyle = '#11';
    ctx.fillRect(0, 0, width, height);
  }
  
  // 2. Draw Text Layer
  const isHandwrittenFont = /Gaegu|Single Day|Poor Story|Gamja Flower|Hi Melody|Dancing Script|Caveat/i.test(fontFamily);
  
  let fontSizeInPx = is169 ? 90 : 105; // medium defaults
  if (fontSize === 'small') fontSizeInPx = is169 ? 70 : 80;
  if (fontSize === 'large') fontSizeInPx = is169 ? 120 : 135;
  if (fontSize === 'xlarge') fontSizeInPx = is169 ? 150 : 180;
  
  // Heuristic length-based scale to prevent clipping of long paragraphs
  const textLength = englishText?.length || 0;
  if (textLength > 100) {
    const lengthScale = Math.max(0.52, 1 - (textLength - 100) * 0.0038);
    fontSizeInPx = fontSizeInPx * lengthScale;
  }
  
  let dynamicLineHeight = 1.5;
  if (lineHeight === 'tight') dynamicLineHeight = 1.2;
  if (lineHeight === 'relaxed') dynamicLineHeight = 1.8;
  if (lineHeight === 'loose') dynamicLineHeight = 2.0;
  if (isHandwrittenFont && lineHeight === 'normal') dynamicLineHeight = 1.28;
  
  const textLineHeight = fontSizeInPx * dynamicLineHeight;
  
  const resolvedTextColor = textColor === 'auto'
    ? (isCustomBackground ? '#ffffff' : (currentBgObj?.textColor || '#fff'))
    : textColor;
    
  const resolvedTextShadow = textColor === '#000000'
    ? 'none'
    : (isCustomBackground ? '0 2px 8px rgba(0,0,0,0.5)' : (currentBgObj?.textShadow || 'none'));
    
  ctx.font = `${isHandwrittenFont ? '500' : '400'} ${fontSizeInPx}px ${fontFamily}`;
  ctx.fillStyle = resolvedTextColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const shadow = parseTextShadow(resolvedTextShadow);
  if (shadow) {
    ctx.shadowColor = shadow.color;
    ctx.shadowBlur = shadow.blur;
    ctx.shadowOffsetX = shadow.offsetX;
    ctx.shadowOffsetY = shadow.offsetY;
  }
  
  const paddingX = 140;
  const maxWidth = width - (paddingX * 2);
  const lines = wrapTextCJK(ctx, englishText || 'Your text will appear here...', maxWidth);
  
  const totalTextHeight = lines.length * textLineHeight;
  let startY = (height / 2) - (totalTextHeight / 2) + (textLineHeight / 2);
  
  for (const line of lines) {
    ctx.fillText(line, width / 2, startY);
    startY += textLineHeight;
  }
  
  return canvas;
};

export const downloadCard = async (canvasRef) => {
  try {
    const canvas = await renderCardToCanvas();
    const dataUrl = canvas.toDataURL('image/png');
    
    const link = document.createElement('a');
    link.href = dataUrl;
    const { lang } = useUIStore.getState();
    const t = translations[lang || 'en'].preview;

    link.download = `postify-${new Date().toISOString().split('T')[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    useUIStore.getState().showToast(t.toastDownloaded);
    return true;
  } catch (err) {
    console.error('Failed to download image:', err);
    const { lang } = useUIStore.getState();
    useUIStore.getState().showToast(lang === 'en' ? `Download failed: ${err.message}` : `다운로드 실패: ${err.message}`, 'error');
    return false;
  }
};

export const copyCardToClipboard = async (canvasRef) => {
  const { lang } = useUIStore.getState();
  const t = translations[lang || 'en'].preview;

  if (!navigator.clipboard || !window.ClipboardItem) {
    useUIStore.getState().showToast(lang === 'en' ? 'Clipboard copy is not supported in this browser.' : '이 브라우저에서는 이미지 복사를 지원하지 않습니다.', 'error');
    return false;
  }
  
  try {
    const canvas = await renderCardToCanvas();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) {
      throw new Error(lang === 'en' ? 'Failed to convert image.' : '이미지 변환에 실패했습니다.');
    }
    
    const item = new ClipboardItem({ 'image/png': blob });
    await navigator.clipboard.write([item]);
    useUIStore.getState().showToast(t.toastCopied);
    return true;
  } catch (err) {
    console.error('Clipboard copy error:', err);
    useUIStore.getState().showToast(
      lang === 'en' 
        ? `Copy failed: ${err.message || 'Permission denied or unknown error.'}` 
        : `복사 실패: ${err.message || '권한 또는 알 수 없는 이유로 실패했습니다.'}`, 
      'error'
    );
    return false;
  }
};
