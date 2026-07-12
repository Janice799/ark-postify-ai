'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Home, Edit3, Image as ImageIcon, Settings, MessageSquare, GitBranch, LogIn, LogOut, User } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import { motion, AnimatePresence } from 'framer-motion';
import { translations } from '../../lib/translations';
import { supabase } from '../../lib/supabaseClient';

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
  const { activeTab, setActiveTab, lang, setLang, user, setUser, showToast } = useUIStore();
  const t = translations[lang || 'en'].sidebar;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close profile menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogin = async () => {
    if (supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: typeof window !== 'undefined' ? window.location.origin : '' }
        });
        if (error) throw error;
      } catch (err) {
        showToast(err.message || 'Google Sign-In failed', 'error');
      }
    } else {
      // Mock login fallback
      const mockUser = {
        id: 'mock-user-123',
        email: 'sinaecho@example.com',
        user_metadata: {
          full_name: 'Sinae Cho',
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150'
        }
      };
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      showToast(lang === 'en' ? 'Logged in as Demo User (Mock Auth Mode)' : '데모 계정으로 로그인되었습니다 (Mock 모드)', 'success');
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      } catch (err) {
        showToast(err.message || 'Log out failed', 'error');
      }
    } else {
      // Mock logout
      localStorage.removeItem('mock_user');
      setUser(null);
      showToast(lang === 'en' ? 'Logged out successfully' : '로그아웃 되었습니다.', 'success');
    }
    setIsMenuOpen(false);
  };

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
        <NavButton id="mvp" icon={MessageSquare} label={t.mvp} activeTab={activeTab} setActiveTab={setActiveTab} />
        <NavButton id="settings" icon={Settings} label={t.config} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <div className="mt-auto w-full flex flex-col items-center gap-6 relative" ref={menuRef}>
        {/* Premium Language Toggle Switch */}
        <div className="w-full px-2.5">
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

        {/* Profile Avatar / Login Action */}
        <div className="w-full flex justify-center">
          {user ? (
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative w-10 h-10 rounded-full border border-white/20 overflow-hidden hover:border-white transition-all shadow-md focus:outline-none cursor-pointer"
            >
              <img 
                src={user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150'} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border border-[var(--bg-panel)] rounded-full" />
            </button>
          ) : (
            <button 
              onClick={handleLogin}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[var(--text-secondary)] hover:text-white hover:border-white/30 transition-all focus:outline-none cursor-pointer"
              title={lang === 'en' ? 'Sign in with Google' : '구글 로그인'}
            >
              <LogIn size={18} />
            </button>
          )}
        </div>

        {/* Profile Dropdown Card */}
        <AnimatePresence>
          {isMenuOpen && user && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute bottom-12 left-16 w-56 bg-[rgba(20,20,20,0.92)] backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl z-50 flex flex-col gap-3"
            >
              <div className="flex flex-col gap-1 min-w-0">
                <p className="text-[13px] font-bold text-white truncate">{user.user_metadata?.full_name || 'User'}</p>
                <p className="text-[11px] text-[var(--text-secondary)] truncate">{user.email}</p>
                <span className="text-[9px] mt-1 font-bold px-1.5 py-0.5 rounded w-max bg-white/5 border border-white/10 text-[var(--text-secondary)]">
                  {supabase ? 'Supabase Live' : 'Local Sandbox'}
                </span>
              </div>
              <button 
                onClick={handleLogout}
                className="mt-2 w-full py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-[12px] text-red-400 font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <LogOut size={12} />
                {lang === 'en' ? 'Log Out' : '로그아웃'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};
