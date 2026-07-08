'use client';
import React from 'react';
import { Edit3, Sparkles, Languages, Save, MessageCircle, Briefcase, Camera } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { useUIStore } from '../../store/useUIStore';
import { useDraftStore } from '../../store/useDraftStore';
import { generateXPost, generateManualTranslation } from '../../engines/aiEngine';
import { Button } from '../shared/Button';
import { TextArea } from '../shared/TextArea';
import { motion } from 'framer-motion';
import { translations } from '../../lib/translations';

export const InputArea = () => {
  const { mode, setMode, targetSNS, setTargetSNS, koreanText, setKoreanText, persona, setPersona, englishText, setEnglishText, isTranslating } = useEditorStore();
  const { bgStyle, lang } = useUIStore();
  const { saveDraft } = useDraftStore();
  const t = translations[lang || 'en'].editor;

  const handleTranslate = () => {
    if (mode === 'ai') generateXPost();
    else generateManualTranslation();
  };

  const getMaxChars = () => {
    if (targetSNS === 'x') return 280;
    if (targetSNS === 'instagram') return 2200;
    if (targetSNS === 'linkedin') return 3000;
    return 280;
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Input Mode Selector */}
      <div className="relative flex bg-[var(--glass-bg)] p-1 rounded-lg border border-[var(--border-color)]">
        <button 
          className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-[13px] font-medium transition-colors ${mode === 'manual' ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
          onClick={() => setMode('manual')}
        >
          {mode === 'manual' && (
            <motion.div layoutId="input-mode" className="absolute inset-0 bg-[var(--border-color)] rounded-md shadow-sm -z-10" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
          )}
          <Edit3 size={16} /> {t.manualMode}
        </button>
        <button 
          className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-[13px] font-medium transition-colors ${mode === 'ai' ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
          onClick={() => setMode('ai')}
        >
          {mode === 'ai' && (
            <motion.div layoutId="input-mode" className="absolute inset-0 bg-[var(--border-color)] rounded-md shadow-sm -z-10" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
          )}
          <Sparkles size={16} /> {t.aiMode}
        </button>
      </div>

      {/* Target SNS Selector (Visible in all modes for char limit) */}
      <div className="flex gap-2">
        <button 
          onClick={() => setTargetSNS('x')}
          className={`flex-1 py-2.5 rounded-lg border flex items-center justify-center gap-2 transition-all ${targetSNS === 'x' ? 'border-[var(--text-primary)] bg-[rgba(255,255,255,0.05)] text-[var(--text-primary)]' : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]'}`}
        >
          <MessageCircle size={16} /> <span className="text-[12px] font-bold">X (Twitter)</span>
        </button>
        <button 
          onClick={() => setTargetSNS('linkedin')}
          className={`flex-1 py-2.5 rounded-lg border flex items-center justify-center gap-2 transition-all ${targetSNS === 'linkedin' ? 'border-[var(--text-primary)] bg-[rgba(255,255,255,0.05)] text-[var(--text-primary)]' : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]'}`}
        >
          <Briefcase size={16} /> <span className="text-[12px] font-bold">LinkedIn</span>
        </button>
        <button 
          onClick={() => setTargetSNS('instagram')}
          className={`flex-1 py-2.5 rounded-lg border flex items-center justify-center gap-2 transition-all ${targetSNS === 'instagram' ? 'border-[var(--text-primary)] bg-[rgba(255,255,255,0.05)] text-[var(--text-primary)]' : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]'}`}
        >
          <Camera size={16} /> <span className="text-[12px] font-bold">Instagram</span>
        </button>
      </div>

      <TextArea
        label={mode === 'ai' ? t.topicLabel : t.koLabel}
        placeholder={mode === 'ai' ? t.placeholderAi : t.placeholderManual}
        value={koreanText}
        onChange={(e) => setKoreanText(e.target.value)}
        rows={4}
      />

      <TextArea
        label={t.personaLabel}
        placeholder={t.personaPlaceholder}
        value={persona}
        onChange={(e) => setPersona(e.target.value)}
        rows={3}
      />

      <Button 
        variant="primary" 
        onClick={handleTranslate} 
        disabled={isTranslating || !koreanText}
        className="w-full"
      >
        <Languages size={18} />
        {isTranslating ? (mode === 'ai' ? t.generating : t.translating) : (mode === 'ai' ? t.generateBtn : t.translateBtn)}
      </Button>

      <div className="mt-4 pt-6 border-t border-[var(--border-color)]">
        <div className="flex justify-between items-center mb-3">
          <label className="text-[13px] font-medium text-[var(--text-secondary)]">{t.resultLabel}</label>
          <div className="flex items-center gap-3">
            <Button 
              variant="secondary" 
              onClick={() => {
                saveDraft({ koreanText, englishText, persona, bgStyle });
                alert(t.saveSuccess);
              }}
              className="py-1.5 px-3 text-[12px] h-8"
            >
              <Save size={14} /> {t.saveBtn}
            </Button>
            <span className={`text-[13px] font-bold ${englishText.length > getMaxChars() ? 'text-red-500' : 'text-[var(--text-secondary)]'}`}>
              {englishText.length} / {getMaxChars()}
            </span>
          </div>
        </div>
        <TextArea
          className="bg-[rgba(94,106,210,0.05)] border-[rgba(94,106,210,0.2)] text-[15px]"
          placeholder={t.resultPlaceholder}
          value={englishText}
          onChange={(e) => setEnglishText(e.target.value)}
          rows={7}
        />
      </div>
    </div>
  );
};
