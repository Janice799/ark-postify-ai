'use client';
import React, { forwardRef } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { useUIStore } from '../../store/useUIStore';
import { BACKGROUND_CATEGORIES, getBgStyle } from '../../backgroundData';

export const CanvasRenderer = forwardRef((props, ref) => {
  const { englishText } = useEditorStore();
  const { bgStyle, bgPosition, aspectRatio, fontFamily, fontSize, lineHeight, textColor, customBgImage, setCustomBgImage } = useUIStore();
  const isCustomBackground = bgStyle?.startsWith('custom-');
  const isHandwrittenFont = /Gaegu|Single Day|Poor Story|Gamja Flower|Hi Melody|Dancing Script|Caveat/i.test(fontFamily);

  React.useEffect(() => {
    if (isCustomBackground && !customBgImage) {
      const id = bgStyle.replace('custom-', '');
      import('../../store/customImageDB').then(({ getImagesFromDB }) => {
        getImagesFromDB().then((images) => {
          const found = images?.find(img => img.id === id);
          if (found) {
            setCustomBgImage(found.data);
          }
        });
      });
    }
  }, [bgStyle, isCustomBackground, customBgImage, setCustomBgImage]);

  // Find the selected background object
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

  const is169 = aspectRatio === '16:9';
  const aspectRatioClass = is169 ? 'aspect-[16/9]' : 'aspect-square';

  // Calculate dynamic font size using container queries (cqw) for perfect vector-like scaling
  let cqwSize = is169 ? 7.5 : 8.75; // medium
  if (fontSize === 'small') cqwSize = is169 ? 5.83 : 6.67;
  if (fontSize === 'large') cqwSize = is169 ? 10.0 : 11.25;
  if (fontSize === 'xlarge') cqwSize = is169 ? 12.5 : 15.0;

  // Heuristic length-based scale to prevent clipping of long paragraphs
  const textLength = englishText?.length || 0;
  let lengthScale = 1.0;
  if (textLength > 100) {
    lengthScale = Math.max(0.52, 1 - (textLength - 100) * 0.0038);
  }
  const dynamicFontSize = `calc(${cqwSize}cqw * ${lengthScale})`;

  // Calculate dynamic line height
  let dynamicLineHeight = 1.5;
  if (lineHeight === 'tight') dynamicLineHeight = 1.2;
  if (lineHeight === 'relaxed') dynamicLineHeight = 1.8;
  if (lineHeight === 'loose') dynamicLineHeight = 2.0;
  if (isHandwrittenFont && lineHeight === 'normal') dynamicLineHeight = 1.28;

  // Helper to map single keyword bgPosition to full center coordinates for robust parsing
  const getPositionValue = (pos) => {
    if (pos === 'top') return 'center top';
    if (pos === 'bottom') return 'center bottom';
    return 'center center';
  };

  // Determine background style
  let bgInlineStyle;
  if (isCustomBackground && customBgImage) {
    bgInlineStyle = {
      backgroundImage: `url(${customBgImage})`,
      backgroundColor: '#111',
      backgroundSize: 'cover',
      backgroundPosition: getPositionValue(bgPosition),
      backgroundRepeat: 'no-repeat',
    };
  } else {
    bgInlineStyle = getBgStyle(currentBgObj, bgPosition);
  }

  // Determine text color
  const resolvedTextColor = textColor === 'auto'
    ? (isCustomBackground ? '#ffffff' : (currentBgObj?.textColor || '#fff'))
    : textColor;
  const resolvedTextShadow = textColor === '#000000'
    ? 'none'
    : (isCustomBackground ? '0 2px 8px rgba(0,0,0,0.5)' : (currentBgObj?.textShadow || 'none'));
  const fontWeight = isHandwrittenFont ? 500 : 400;
  const letterSpacing = isHandwrittenFont ? '-0.03em' : '0.02em';
  const textAlign = 'center';
  const maxWidth = '100%';

  return (
    <div className="w-full max-w-[480px] mx-auto flex items-center justify-center drop-shadow-2xl">
      <div 
        ref={ref}
        className={`w-full ${aspectRatioClass} overflow-hidden rounded-xl relative flex items-center justify-center transition-all duration-500 ease-in-out`}
        style={{
          ...bgInlineStyle,
          containerType: 'inline-size',
          padding: '11.6%'
        }}
      >
        <div 
          className="w-full whitespace-pre-wrap break-words transition-all duration-300 notranslate" 
          translate="no"
          style={{ 
            fontFamily: fontFamily,
            color: resolvedTextColor,
            textShadow: resolvedTextShadow,
            fontSize: dynamicFontSize,
            lineHeight: dynamicLineHeight,
            fontWeight,
            letterSpacing,
            textAlign,
            maxWidth,
          }}
        >
          {englishText || 'Your text will appear here...'}
        </div>
      </div>
    </div>
  );
});

CanvasRenderer.displayName = 'CanvasRenderer';
