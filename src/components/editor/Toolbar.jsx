'use client';
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Upload, X, Palette } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import { motion, AnimatePresence } from 'framer-motion';
import { getImagesFromDB, saveImageToDB, deleteImageFromDB } from '../../store/customImageDB';
import { translations } from '../../lib/translations';
const FONT_OPTIONS = [
  { value: "'Noto Sans KR', 'Inter', sans-serif", label: "Modern Sans", style: "'Noto Sans KR', 'Inter', sans-serif" },
  { value: "'Nanum Myeongjo', 'Playfair Display', serif", label: "Classic Serif", style: "'Nanum Myeongjo', 'Playfair Display', serif" },
  { value: "'Gowun Dodum', 'Noto Sans KR', sans-serif", label: "Soft Sans", style: "'Gowun Dodum', 'Noto Sans KR', sans-serif" },
  { value: "'Gaegu', cursive", label: "손글씨", style: "'Gaegu', cursive" },
  { value: "'Single Day', cursive", label: "동글손글씨", style: "'Single Day', cursive" },
  { value: "'Poor Story', cursive", label: "아기자기 손글씨", style: "'Poor Story', cursive" },
  { value: "'Gamja Flower', cursive", label: "귀여운 꽃글씨", style: "'Gamja Flower', cursive" },
  { value: "'Hi Melody', cursive", label: "귀여운 멜로디체", style: "'Hi Melody', cursive" },
  { value: "'Dancing Script', 'Gaegu', cursive", label: "Signature", style: "'Dancing Script', 'Gaegu', cursive" },
  { value: "'Roboto Mono', 'Noto Sans KR', monospace", label: "Monospace", style: "'Roboto Mono', 'Noto Sans KR', monospace" }
];

const COLOR_PRESETS = [
  { value: 'auto', label: '자동' },
  { value: '#ffffff', color: '#ffffff', border: true },
  { value: '#000000', color: '#000000' },
  { value: '#ef4444', color: '#ef4444' },
  { value: '#f59e0b', color: '#f59e0b' },
  { value: '#22c55e', color: '#22c55e' },
  { value: '#3b82f6', color: '#3b82f6' },
  { value: '#a855f7', color: '#a855f7' },
  { value: '#ec4899', color: '#ec4899' },
];

export const Toolbar = () => {
  const { aspectRatio, setAspectRatio, fontFamily, setFontFamily, bgPosition, setBgPosition, fontSize, setFontSize, lineHeight, setLineHeight, textColor, setTextColor, customBgImage, setCustomBgImage, setBgStyle, bgStyle, myImages, setMyImages, addMyImage, removeMyImage, setActiveCategory, lang } = useUIStore();
  const t = translations[lang || 'en'].editor;

  const getLocalizedFontLabel = (font) => {
    if (lang === 'en') {
      if (font.label === '손글씨') return 'Handwriting';
      if (font.label === '동글손글씨') return 'Round Handwriting';
      if (font.label === '아기자기 손글씨') return 'Cute Handwriting';
      if (font.label === '귀여운 꽃글씨') return 'Flower Handwriting';
      if (font.label === '귀여운 멜로디체') return 'Melody Handwriting';
    }
    return font.label;
  };

  const [isFontOpen, setIsFontOpen] = useState(false);
  const fontRef = useRef(null);
  const fileInputRef = useRef(null);
  const colorInputRef = useRef(null);

  useEffect(() => {
    getImagesFromDB().then((images) => {
      if (images?.length) {
        setMyImages(images);
      }
    });
  }, [setMyImages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fontRef.current && !fontRef.current.contains(event.target)) {
        setIsFontOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert(lang === 'en' ? 'Only image files can be uploaded.' : '이미지 파일만 업로드할 수 있습니다.');
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = async () => {
      const MAX_SIZE = 1200;
      let w = img.width;
      let h = img.height;
      if (w > MAX_SIZE || h > MAX_SIZE) {
        if (w > h) { h = Math.round(h * MAX_SIZE / w); w = MAX_SIZE; }
        else { w = Math.round(w * MAX_SIZE / h); h = MAX_SIZE; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
      
      const newImage = {
        id: 'upload-' + Date.now(),
        data: compressedDataUrl,
        timestamp: Date.now()
      };
      
      // Save to IndexedDB and state
      const saved = await saveImageToDB(newImage);
      if (!saved) {
        URL.revokeObjectURL(url);
        alert(lang === 'en' ? 'Failed to save image. Please try again.' : '이미지 저장에 실패했습니다. 다시 시도해 주세요.');
        return;
      }
      addMyImage(newImage);
      
      setCustomBgImage(compressedDataUrl);
      setBgStyle(`custom-${newImage.id}`);
      setActiveCategory('My Uploads');
      alert(t.uploadSuccess);
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      alert(lang === 'en' ? 'Failed to load image. Please try another file.' : '이미지를 불러오지 못했습니다. 다른 파일로 다시 시도해 주세요.');
    };
    img.src = url;
    e.target.value = '';
  };

  const handleSelectSavedImage = (img) => {
    setCustomBgImage(img.data);
    setBgStyle(`custom-${img.id}`);
  };

  const handleDeleteSavedImage = async (id) => {
    const deleted = await deleteImageFromDB(id);
    if (!deleted) {
      alert(lang === 'en' ? 'Failed to delete image. Please try again.' : '이미지 삭제에 실패했습니다. 다시 시도해 주세요.');
      return;
    }

    removeMyImage(id);
    if (bgStyle === `custom-${id}`) {
      setCustomBgImage(null);
      setBgStyle('mesh-sunset');
    }
  };

  return (
    <div className="flex flex-col gap-5 mt-6 pt-5 border-t border-[var(--border-color)]">

      {/* Row 1: Aspect Ratio + Font Style */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-[12px] font-medium text-[var(--text-secondary)] mb-1.5 block">{t.ratio}</label>
          <div className="relative flex bg-[var(--glass-bg)] p-1 rounded-lg border border-[var(--border-color)]">
            <button 
              className={`relative z-10 flex-1 py-1.5 text-[12px] rounded-md transition-colors ${aspectRatio === '1:1' ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`} 
              onClick={() => setAspectRatio('1:1')}
              title="Square 1:1"
            >
              {aspectRatio === '1:1' && <motion.div layoutId="ratio-mode" className="absolute inset-0 bg-[var(--border-color)] rounded-md shadow-sm -z-10" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
              1:1
            </button>
            <button
              className={`relative z-10 flex-1 py-1.5 text-[12px] rounded-md transition-colors ${aspectRatio === '4:5' ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              onClick={() => setAspectRatio('4:5')}
              title="Threads 4:5"
            >
              {aspectRatio === '4:5' && <motion.div layoutId="ratio-mode" className="absolute inset-0 bg-[var(--border-color)] rounded-md shadow-sm -z-10" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
              4:5
            </button>
            <button 
              className={`relative z-10 flex-1 py-1.5 text-[12px] rounded-md transition-colors ${aspectRatio === '16:9' ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`} 
              onClick={() => setAspectRatio('16:9')}
              title="X 16:9"
            >
              {aspectRatio === '16:9' && <motion.div layoutId="ratio-mode" className="absolute inset-0 bg-[var(--border-color)] rounded-md shadow-sm -z-10" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
              16:9
            </button>
          </div>
        </div>

        <div className="flex-1 relative" ref={fontRef}>
          <label className="text-[12px] font-medium text-[var(--text-secondary)] mb-1.5 block">{t.fontStyle}</label>
          <div 
            onClick={() => setIsFontOpen(!isFontOpen)}
            className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg p-2 text-[13px] text-[var(--text-primary)] flex justify-between items-center cursor-pointer hover:border-[var(--accent-color)] transition-colors"
            style={{ fontFamily: fontFamily }}
          >
            <span className="truncate">
              {FONT_OPTIONS.find(f => f.value === fontFamily) 
                ? getLocalizedFontLabel(FONT_OPTIONS.find(f => f.value === fontFamily)) 
                : 'Select Font'}
            </span>
            <ChevronDown size={14} className={`text-[var(--text-secondary)] transition-transform flex-shrink-0 ml-1 ${isFontOpen ? 'rotate-180' : ''}`} />
          </div>
          
          <AnimatePresence>
            {isFontOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute top-[100%] left-0 w-full mt-1 bg-[var(--bg-color)] border border-[var(--glass-border)] rounded-xl shadow-2xl z-50 overflow-hidden"
              >
                {FONT_OPTIONS.map((font) => (
                  <div 
                    key={font.value}
                    onClick={() => {
                      setFontFamily(font.value);
                      setIsFontOpen(false);
                    }}
                    className={`px-3 py-2 text-[13px] cursor-pointer flex justify-between items-center hover:bg-[var(--glass-bg)] transition-colors ${fontFamily === font.value ? 'bg-[rgba(94,106,210,0.1)] text-[var(--accent-color)]' : 'text-[var(--text-primary)]'}`}
                    style={{ fontFamily: font.style }}
                  >
                    {getLocalizedFontLabel(font)}
                    {fontFamily === font.value && <Check size={14} />}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Row 2: Font Size + Line Height */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-[12px] font-medium text-[var(--text-secondary)] mb-1.5 block">{t.fontSize}</label>
          <select 
            value={fontSize} 
            onChange={(e) => setFontSize(e.target.value)}
            className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg p-2 text-[13px] text-[var(--text-primary)] outline-none cursor-pointer focus:border-[var(--accent-color)]"
          >
            <option value="small">{t.sizeSmall}</option>
            <option value="medium">{t.sizeMedium}</option>
            <option value="large">{t.sizeLarge}</option>
            <option value="xlarge">{t.sizeXLarge}</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="text-[12px] font-medium text-[var(--text-secondary)] mb-1.5 block">{t.lineHeight}</label>
          <select 
            value={lineHeight} 
            onChange={(e) => setLineHeight(e.target.value)}
            className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg p-2 text-[13px] text-[var(--text-primary)] outline-none cursor-pointer focus:border-[var(--accent-color)]"
          >
            <option value="tight">{t.lhTight}</option>
            <option value="normal">{t.lhNormal}</option>
            <option value="relaxed">{t.lhRelaxed}</option>
            <option value="loose">{t.lhLoose}</option>
          </select>
        </div>
      </div>

      {/* Row 3: Text Color (swatches + color picker) */}
      <div>
        <label className="text-[12px] font-medium text-[var(--text-secondary)] mb-1.5 block">{t.textColor}</label>
        <div className="flex items-center gap-1.5">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => setTextColor(preset.value)}
              className={`relative flex items-center justify-center transition-all ${
                preset.value === 'auto' 
                  ? `px-2.5 py-1 rounded-md text-[11px] font-medium ${textColor === 'auto' ? 'bg-[var(--border-color)] text-[var(--text-primary)]' : 'bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'} border border-[var(--border-color)]`
                  : `w-6 h-6 rounded-full ${textColor === preset.value ? 'ring-2 ring-offset-1 ring-[var(--accent-color)] ring-offset-[var(--bg-color)]' : 'hover:scale-110'}`
              }`}
              style={preset.color ? { backgroundColor: preset.color, border: preset.border ? '1px solid rgba(255,255,255,0.3)' : undefined } : undefined}
              title={preset.value === 'auto' ? t.autoText : preset.value}
            >
              {preset.value === 'auto' && t.autoText}
            </button>
          ))}
          {/* Custom color picker */}
          <button
            onClick={() => colorInputRef.current?.click()}
            className={`w-6 h-6 rounded-full border border-dashed border-[var(--text-secondary)] flex items-center justify-center hover:border-[var(--accent-color)] hover:scale-110 transition-all overflow-hidden ${textColor !== 'auto' && !COLOR_PRESETS.find(p => p.value === textColor) ? 'ring-2 ring-offset-1 ring-[var(--accent-color)] ring-offset-[var(--bg-color)]' : ''}`}
            style={textColor !== 'auto' && !COLOR_PRESETS.find(p => p.value === textColor) ? { backgroundColor: textColor } : undefined}
            title={lang === 'en' ? 'Choose custom color' : '커스텀 색상 선택'}
          >
            {(textColor === 'auto' || COLOR_PRESETS.find(p => p.value === textColor)) && <Palette size={10} className="text-[var(--text-secondary)]" />}
          </button>
          <input 
            ref={colorInputRef}
            type="color" 
            value={textColor === 'auto' ? '#ffffff' : textColor}
            onChange={(e) => setTextColor(e.target.value)}
            className="hidden"
          />
        </div>
      </div>

      {/* Row 4: Image Position */}
      <div>
        <label className="text-[12px] font-medium text-[var(--text-secondary)] mb-1.5 block">{t.bgPosition}</label>
        <div className="relative flex bg-[var(--glass-bg)] p-1 rounded-lg border border-[var(--border-color)]">
          {['top', 'center', 'bottom'].map((pos) => (
            <button 
              key={pos}
              className={`relative z-10 flex-1 py-1.5 text-[12px] rounded-md transition-colors ${bgPosition === pos ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`} 
              onClick={() => setBgPosition(pos)}
            >
              {bgPosition === pos && <motion.div layoutId="pos-mode" className="absolute inset-0 bg-[var(--border-color)] rounded-md shadow-sm -z-10" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
              {pos === 'top' ? t.top : pos === 'bottom' ? t.bottom : t.center}
            </button>
          ))}
        </div>
      </div>

      {/* Row 5: Image Upload */}
      <div>
        <label className="text-[12px] font-medium text-[var(--text-secondary)] mb-1.5 block">
          {lang === 'en' ? 'My Background Images' : '내 배경 이미지'}
        </label>
        {customBgImage ? (
          <div className="flex gap-2">
            <div 
              className={`flex-1 bg-[var(--glass-bg)] border rounded-lg p-2 text-[12px] text-[var(--text-primary)] flex items-center gap-2 cursor-pointer hover:border-[var(--accent-color)] transition-colors ${bgStyle?.startsWith('custom-') ? 'border-[var(--accent-color)]' : 'border-[var(--glass-border)]'}`}
              onClick={() => {
                const matchingImage = useUIStore.getState().myImages.find(img => img.data === customBgImage);
                if (matchingImage) setBgStyle(`custom-${matchingImage.id}`);
                else setBgStyle('custom-upload');
              }}
            >
              <div className="w-7 h-7 rounded bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url(${customBgImage})` }} />
              <span className="truncate">{lang === 'en' ? 'Uploaded' : '업로드됨'}</span>
              {bgStyle?.startsWith('custom-') && <Check size={12} className="ml-auto text-[var(--accent-color)] flex-shrink-0" />}
            </div>
            <button onClick={() => fileInputRef.current?.click()} className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg px-2 text-[11px] text-[var(--text-secondary)] hover:border-[var(--accent-color)] transition-colors">
              {lang === 'en' ? 'Change' : '변경'}
            </button>
            <button onClick={() => { setCustomBgImage(null); setBgStyle('mesh-sunset'); }} className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg px-2 text-[var(--text-secondary)] hover:text-red-400 hover:border-red-400 transition-colors"><X size={12} /></button>
          </div>
        ) : (
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-[var(--glass-bg)] border border-dashed border-[var(--glass-border)] rounded-lg p-2.5 text-[12px] text-[var(--text-secondary)] flex items-center justify-center gap-2 cursor-pointer hover:border-[var(--accent-color)] hover:text-[var(--text-primary)] transition-colors"
          >
            <Upload size={14} />
            {lang === 'en' ? 'Upload Image' : '내 이미지 업로드'}
          </button>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        {myImages.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {myImages.slice(0, 6).map((img) => (
              <div key={img.id} className="relative group">
                <button
                  onClick={() => handleSelectSavedImage(img)}
                  className={`w-full aspect-square rounded-lg overflow-hidden border transition-all ${bgStyle === `custom-${img.id}` ? 'border-[var(--accent-color)]' : 'border-[var(--glass-border)] hover:border-[var(--accent-color)]'}`}
                  style={{ backgroundImage: `url(${img.data})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                  title={lang === 'en' ? 'Select saved image' : '저장된 이미지 선택'}
                />
                <button
                  onClick={() => handleDeleteSavedImage(img.id)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white text-[11px] opacity-0 group-hover:opacity-100 transition-opacity"
                  title={lang === 'en' ? 'Delete image' : '이미지 삭제'}
                >
                  <X size={12} className="mx-auto" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
