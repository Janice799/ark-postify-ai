'use client';
import React from 'react';
import { Home, Edit3, Image as ImageIcon, Settings, MessageSquare, GitBranch } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import { motion } from 'framer-motion';
import { translations } from '../../lib/translations';

const NavButton = ({ id, icon: Icon, label, disabled, activeTab, setActiveTab }) => {
  const isActive = activeTab === id;
  return (
    <button
      className={`relative flex flex-col items-center justify-center gap-1.5 w-full py-5 transition-colors ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/5'} ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
      onClick={() => !disabled && setActiveTab(id)}
    >
      {isActive && (
        <motion.div
          layoutId="sidebar-active-indicator"
          className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--text-primary)] rounded-r-md"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
      <span className="text-[10px] font-bold tracking-widest">{label}</span>
    </button>
  );
};

export const Sidebar = () => {
  const { activeTab, setActiveTab, lang, setLang } = useUIStore();
  const t = translations[lang || 'en'].sidebar;
  
  return (
    <nav className="w-[88px] h-full bg-[var(--bg-panel)] border-r border-[var(--border-color)] flex flex-col items-center py-6 flex-shrink-0 z-20">
      <div className="mb-10 w-14 h-14 flex items-center justify-center rounded-[18px] shadow-lg overflow-hidden border border-white/10 bg-black">
        <img src="/icon.png" alt="Postify AI Logo" className="w-full h-full object-cover" />
      </div>
      
      <div className="w-full flex flex-col gap-2">
        <NavButton id="home" icon={Home} label={t.home} activeTab={activeTab} setActiveTab={setActiveTab} />
        <NavButton id="commitcraft" icon={GitBranch} label={t.commitcraft} activeTab={activeTab} setActiveTab={setActiveTab} />
        <NavButton id="drafts" icon={Edit3} label={t.drafts} activeTab={activeTab} setActiveTab={setActiveTab} />
        <NavButton id="backgrounds" icon={ImageIcon} label={t.themes} activeTab={activeTab} setActiveTab={setActiveTab} />
        <NavButton id="settings" icon={Settings} label={t.config} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Premium Language Toggle Switch */}
      <div className="mt-auto w-full px-2.5 flex flex-col items-center">
        <div className="flex bg-white/5 rounded-full p-0.5 border border-white/10 relative">
          <button 
            onClick={() => setLang('en')}
            className={`px-2.5 py-1 text-[9px] font-bold rounded-full transition-all duration-300 relative z-10 ${lang === 'en' ? 'text-[var(--bg-color)]' : 'text-[var(--text-secondary)] hover:text-white'}`}
          >
            EN
          </button>
          <button 
            onClick={() => setLang('ko')}
            className={`px-2.5 py-1 text-[9px] font-bold rounded-full transition-all duration-300 relative z-10 ${lang === 'ko' ? 'text-[var(--bg-color)]' : 'text-[var(--text-secondary)] hover:text-white'}`}
          >
            KO
          </button>
          <motion.div 
            className="absolute top-0.5 bottom-0.5 bg-[var(--text-primary)] rounded-full z-0"
            animate={{
              left: lang === 'en' ? '2px' : '50%',
              right: lang === 'en' ? '50%' : '2px'
            }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
          />
        </div>
      </div>
    </nav>
  );
};
