'use client';
import React, { useEffect, useState } from 'react';
import { useUIStore } from '../../store/useUIStore';
import { BACKGROUND_CATEGORIES, getBgStyle } from '../../backgroundData';
import { motion } from 'framer-motion';
import { getImagesFromDB, deleteImageFromDB } from '../../store/customImageDB';
import { Trash2 } from 'lucide-react';
import { translations } from '../../lib/translations';

export const ThemesPanel = () => {
  const { bgStyle, setBgStyle, bgPosition, activeCategory, setActiveCategory, myImages, setMyImages, setCustomBgImage, removeMyImage, lang } = useUIStore();
  const t = translations[lang || 'en'].themes;

  const getLocalizedCategoryName = (cat) => {
    if (lang === 'ko') {
      if (cat === 'My Uploads') return '내 업로드';
      if (cat === 'Premium Nature') return '프리미엄 자연';
      if (cat === 'Premium Landscape') return '프리미엄 풍경';
      if (cat === 'Premium Lifestyle') return '프리미엄 일상';
      if (cat === 'Premium Gradients') return '프리미엄 그라디언트';
      if (cat === 'Minimal Solid') return '미니멀 단색';
      if (cat === 'Textures') return '텍스처';
      if (cat === 'Premium Photography') return '프리미엄 사진';
      if (cat === 'Pet Photography') return '반려동물 사진';
    }
    return cat;
  };

  useEffect(() => {
    // Load custom images from IndexedDB on mount
    getImagesFromDB().then(images => {
      if (images && images.length > 0) {
        setMyImages(images);
      }
    });
  }, [setMyImages]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.02 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const categories = Object.keys(BACKGROUND_CATEGORIES);
  if (myImages.length > 0) {
    categories.unshift('My Uploads');
  }

  const handleSelectMyImage = (img) => {
    setCustomBgImage(img.data);
    setBgStyle(`custom-${img.id}`);
  };

  const handleDeleteMyImage = async (e, id) => {
    e.stopPropagation();
    if (confirm(t.deleteConfirm)) {
      await deleteImageFromDB(id);
      removeMyImage(id);
      if (bgStyle === `custom-${id}`) {
        setBgStyle('mesh-sunset');
        setCustomBgImage(null);
      }
    }
  };

  return (
    <div className="flex-1 bg-[var(--bg-panel)] overflow-y-auto p-12 custom-scrollbar w-full h-full flex flex-col">
      <div className="max-w-[800px] mx-auto w-full flex-1 flex flex-col">
        <header className="mb-8 pb-6 border-b border-[var(--border-color)] flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2 tracking-tight">{t.title}</h2>
            <p className="text-[var(--text-secondary)] text-[14px]">{t.subtitle}</p>
          </div>
        </header>

        {/* Category Selector */}
        <div className="flex flex-wrap gap-2 mb-8 bg-[var(--glass-bg)] p-1.5 rounded-xl border border-[var(--border-color)] w-fit">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`relative px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${activeCategory === cat ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              {activeCategory === cat && (
                <motion.div layoutId="category-indicator" className="absolute inset-0 bg-[var(--border-color)] rounded-lg -z-10 shadow-sm" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
              )}
              {cat === 'My Uploads' ? (
                <span className="flex items-center gap-1.5">
                  <span className="text-[var(--accent-color)]">✦</span> {getLocalizedCategoryName(cat)} ({myImages.length})
                </span>
              ) : (
                `${getLocalizedCategoryName(cat)} (${BACKGROUND_CATEGORIES[cat].length})`
              )}
            </button>
          ))}
        </div>

        {/* Background Grid */}
        <motion.div 
          key={activeCategory}
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        >
          {activeCategory === 'My Uploads' ? (
            myImages.map((img) => (
              <motion.div
                key={img.id}
                variants={itemVariants}
                className="relative aspect-square rounded-2xl group"
              >
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelectMyImage(img)}
                  className={`w-full h-full relative rounded-2xl overflow-hidden shadow-sm transition-all outline outline-2 outline-offset-2 ${bgStyle === `custom-${img.id}` ? 'outline-[var(--text-primary)] shadow-md' : 'outline-transparent hover:outline-[var(--border-color)]'}`}
                  style={{ backgroundImage: `url(${img.data})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                  {bgStyle === `custom-${img.id}` && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-[2px]">
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-black shadow-lg">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                    </div>
                  )}
                </motion.button>
                <button 
                  onClick={(e) => handleDeleteMyImage(e, img.id)}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10 backdrop-blur-sm"
                  title="삭제"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))
          ) : (
            (BACKGROUND_CATEGORIES[activeCategory] || Object.values(BACKGROUND_CATEGORIES)[0]).map((bg) => (
              <motion.button
                key={bg.id}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setBgStyle(bg.id)}
                className={`relative aspect-square rounded-2xl overflow-hidden shadow-sm transition-all outline outline-2 outline-offset-2 ${bgStyle === bg.id ? 'outline-[var(--text-primary)] shadow-md' : 'outline-transparent hover:outline-[var(--border-color)]'}`}
                style={getBgStyle(bg, bgPosition)}
                title={bg.title}
              >
                {bgStyle === bg.id && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-[2px]">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-black shadow-lg">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                  </div>
                )}
              </motion.button>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
};
