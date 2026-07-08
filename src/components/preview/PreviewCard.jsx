'use client';
import React, { useRef } from 'react';
import { Download, Share, Copy } from 'lucide-react';
import { downloadCard, copyCardToClipboard } from '../../engines/export';
import { CanvasRenderer } from './CanvasRenderer';
import { GlassCard } from '../shared/GlassCard';
import { Button } from '../shared/Button';

import { useUIStore } from '../../store/useUIStore';
import { motion, AnimatePresence } from 'framer-motion';
import { translations } from '../../lib/translations';

export const PreviewCard = () => {
  const canvasRef = useRef(null);
  const { toast, lang } = useUIStore();
  const t = translations[lang || 'en'].preview;

  return (
    <div className="flex-1 h-full bg-[var(--bg-color)] flex flex-col items-center justify-center p-8 overflow-y-auto relative">
      <div className="w-full max-w-[560px] flex justify-between items-center mb-6">
        <h2 className="text-[16px] font-semibold text-[var(--text-primary)] tracking-wide">{t.title}</h2>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => copyCardToClipboard(canvasRef)} className="py-2.5 px-4 text-[13px] rounded-full shadow-md hover:shadow-lg transition-all">
            <Copy size={16} /> {t.copyBtn}
          </Button>
          <Button variant="primary" onClick={() => downloadCard(canvasRef)} className="py-2.5 px-4 text-[13px] rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
            <Download size={16} /> {t.downloadBtn}
          </Button>
        </div>
      </div>
      
      <div className="w-full max-w-[560px] h-full flex flex-col justify-center relative">
        <GlassCard animate={true} className="w-full p-4 md:p-8 flex items-center justify-center bg-[var(--glass-bg)] border-[var(--glass-border)]">
          <CanvasRenderer ref={canvasRef} />
        </GlassCard>
      </div>

      {/* Floating Glassmorphic Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-8 z-50 flex items-center gap-2 border px-5 py-3.5 rounded-full shadow-2xl backdrop-blur-md ${
              toast.type === 'error' 
                ? 'bg-[rgba(239,68,68,0.15)] border-[rgba(239,68,68,0.3)] text-red-200' 
                : 'bg-[rgba(17,17,17,0.85)] border-[rgba(255,255,255,0.1)] text-white'
            }`}
          >
            <span className="text-[13px] font-medium tracking-wide">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
