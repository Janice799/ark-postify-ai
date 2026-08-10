'use client';
import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { useUIStore } from '../../store/useUIStore';
import { renderCardToCanvas, SOCIAL_FORMATS } from '../../engines/export';

export const CanvasRenderer = forwardRef((props, ref) => {
  const canvasRef = useRef(null);
  const renderVersionRef = useRef(0);
  const { englishText } = useEditorStore();
  const {
    bgStyle,
    bgPosition,
    aspectRatio,
    fontFamily,
    fontSize,
    lineHeight,
    textColor,
    customBgImage,
    setCustomBgImage,
  } = useUIStore();
  const previewFormat = SOCIAL_FORMATS[aspectRatio] || SOCIAL_FORMATS['1:1'];

  useImperativeHandle(ref, () => canvasRef.current);

  useEffect(() => {
    if (!bgStyle?.startsWith('custom-') || customBgImage) return;

    const imageId = bgStyle.replace('custom-', '');
    import('../../store/customImageDB').then(({ getImagesFromDB }) => {
      getImagesFromDB().then((images) => {
        const image = images?.find((item) => item.id === imageId);
        if (image) setCustomBgImage(image.data);
      });
    });
  }, [bgStyle, customBgImage, setCustomBgImage]);

  useEffect(() => {
    const renderVersion = ++renderVersionRef.current;
    const timeoutId = window.setTimeout(async () => {
      try {
        const rendered = await renderCardToCanvas();
        if (renderVersion !== renderVersionRef.current || !canvasRef.current) return;

        const preview = canvasRef.current;
        preview.width = rendered.width;
        preview.height = rendered.height;
        const context = preview.getContext('2d');
        context.clearRect(0, 0, preview.width, preview.height);
        context.drawImage(rendered, 0, 0);

        if (rendered.effectiveFontSize !== undefined) {
          useUIStore.getState().setEffectiveFontSize(rendered.effectiveFontSize);
        }
      } catch (error) {
        console.error('Failed to render preview canvas:', error);
      }
    }, 80);

    return () => window.clearTimeout(timeoutId);
  }, [
    englishText,
    bgStyle,
    bgPosition,
    aspectRatio,
    fontFamily,
    fontSize,
    lineHeight,
    textColor,
    customBgImage,
  ]);

  return (
    <div className="w-full max-w-[480px] mx-auto flex items-center justify-center drop-shadow-2xl">
      <canvas
        ref={canvasRef}
        width={previewFormat.width}
        height={previewFormat.height}
        className="block w-full h-auto rounded-xl"
        aria-label="Social image preview"
      />
    </div>
  );
});

CanvasRenderer.displayName = 'CanvasRenderer';
