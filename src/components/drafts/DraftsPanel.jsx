'use client';
import React from 'react';
import { Trash2, ExternalLink, Clock, Lock, Unlock, Shield } from 'lucide-react';
import { useDraftStore } from '../../store/useDraftStore';
import { useEditorStore } from '../../store/useEditorStore';
import { useUIStore } from '../../store/useUIStore';
import { motion, AnimatePresence } from 'framer-motion';
import { translations } from '../../lib/translations';

export const DraftsPanel = () => {
  const { drafts, deleteDraft } = useDraftStore();
  const { setKoreanText, setEnglishText } = useEditorStore();
  const { setBgStyle, setActiveTab, lang, draftsPassword, setDraftsPassword, draftsUnlocked, setDraftsUnlocked } = useUIStore();
  const t = translations[lang || 'en'].drafts;

  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState('');

  const handleSetPassword = (e) => {
    e.preventDefault();
    if (!password) return;
    if (password !== confirmPassword) {
      setErrorMsg(t.errorMismatch);
      return;
    }
    setDraftsPassword(password);
    setDraftsUnlocked(true);
    setErrorMsg('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleUnlock = (e) => {
    e.preventDefault();
    if (password === draftsPassword) {
      setDraftsUnlocked(true);
      setErrorMsg('');
      setPassword('');
    } else {
      setErrorMsg(t.errorWrong);
    }
  };

  const handleResetPassword = () => {
    if (confirm(lang === 'en' ? 'Warning: Resetting your password will delete all saved drafts. Proceed?' : '경고: 비밀번호를 재설정하면 보안을 위해 저장된 모든 초안이 삭제됩니다. 계속하시겠습니까?')) {
      useDraftStore.setState({ drafts: [] });
      setDraftsPassword(null);
      setDraftsUnlocked(false);
      setPassword('');
      setConfirmPassword('');
      setErrorMsg('');
    }
  };

  const handleLoad = (draft) => {
    setKoreanText(draft.koreanText || '');
    setEnglishText(draft.englishText || '');
    if (draft.bgStyle) setBgStyle(draft.bgStyle);
    setActiveTab('home');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
  };

  // 1. Password Lock Screens
  if (!draftsPassword) {
    return (
      <div className="flex-1 bg-[var(--bg-panel)] overflow-y-auto p-12 custom-scrollbar w-full h-full flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="max-w-[420px] w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-8 shadow-xl text-center"
        >
          <div className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.05)] border border-[var(--border-color)] flex items-center justify-center mx-auto mb-6 text-[var(--text-primary)]">
            <Lock size={22} />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">{t.setPwTitle}</h2>
          <p className="text-[13px] text-[var(--text-secondary)] mb-6">{t.setPwDesc}</p>
          
          <form onSubmit={handleSetPassword} className="space-y-4 text-left">
            <div>
              <input 
                type="password"
                placeholder={t.pwPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[rgba(0,0,0,0.3)] border border-[var(--border-color)] rounded-xl p-3.5 text-[15px] font-mono tracking-wider text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)] transition-all shadow-inner"
                required
              />
            </div>
            <div>
              <input 
                type="password"
                placeholder={t.confirmPwPlaceholder}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[rgba(0,0,0,0.3)] border border-[var(--border-color)] rounded-xl p-3.5 text-[15px] font-mono tracking-wider text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)] transition-all shadow-inner"
                required
              />
            </div>
            {errorMsg && (
              <p className="text-[12px] text-red-400 font-medium">{errorMsg}</p>
            )}
            <button 
              type="submit"
              className="w-full py-3 bg-[var(--text-primary)] text-[var(--bg-color)] rounded-xl font-semibold hover:opacity-90 transition-opacity text-[14px]"
            >
              {t.setBtn}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (!draftsUnlocked) {
    return (
      <div className="flex-1 bg-[var(--bg-panel)] overflow-y-auto p-12 custom-scrollbar w-full h-full flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="max-w-[420px] w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-8 shadow-xl text-center"
        >
          <div className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.05)] border border-[var(--border-color)] flex items-center justify-center mx-auto mb-6 text-[var(--text-primary)]">
            <Lock size={22} className="text-[var(--accent-color)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">{t.enterPwTitle}</h2>
          <p className="text-[13px] text-[var(--text-secondary)] mb-6">{t.enterPwDesc}</p>
          
          <form onSubmit={handleUnlock} className="space-y-4 text-left">
            <div>
              <input 
                type="password"
                placeholder={t.pwPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[rgba(0,0,0,0.3)] border border-[var(--border-color)] rounded-xl p-3.5 text-[15px] font-mono tracking-wider text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)] transition-all shadow-inner"
                required
                autoFocus
              />
            </div>
            {errorMsg && (
              <p className="text-[12px] text-red-400 font-medium">{errorMsg}</p>
            )}
            <button 
              type="submit"
              className="w-full py-3 bg-[var(--text-primary)] text-[var(--bg-color)] rounded-xl font-semibold hover:opacity-90 transition-opacity text-[14px]"
            >
              {t.unlockBtn}
            </button>
          </form>
          
          <button 
            onClick={handleResetPassword}
            className="mt-6 text-[11px] text-[var(--text-secondary)] hover:text-red-400 transition-colors"
          >
            {lang === 'en' ? 'Forgot password? Reset drafts' : '비밀번호를 잊으셨나요? 보관함 초기화'}
          </button>
        </motion.div>
      </div>
    );
  }

  // 2. Unlocked Drafts View
  return (
    <div className="flex-1 bg-[var(--bg-panel)] overflow-y-auto p-12 custom-scrollbar w-full h-full">
      <div className="max-w-[800px] mx-auto w-full">
        <header className="mb-10 pb-6 border-b border-[var(--border-color)] flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2 tracking-tight">{t.title}</h2>
            <p className="text-[var(--text-secondary)] text-[14px]">
              {lang === 'en' ? `You have ${drafts.length} saved drafts.` : `총 ${drafts.length}개의 초안이 저장되어 있습니다.`}
            </p>
          </div>
          <button 
            onClick={() => setDraftsUnlocked(false)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg text-[12px] text-[var(--text-secondary)] hover:text-red-400 hover:border-red-400 transition-all font-medium"
            title={t.lockBtn}
          >
            <Lock size={12} />
            {t.lockBtn}
          </button>
        </header>

        {drafts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center p-16 bg-[var(--glass-bg)] rounded-2xl border border-dashed border-[var(--border-color)]"
          >
            <p className="text-[var(--text-secondary)] text-[15px]">{t.noDraftsSub}</p>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full"
          >
            <AnimatePresence>
              {drafts.map(draft => (
                <motion.div 
                  key={draft.id} 
                  variants={itemVariants}
                  exit="exit"
                  whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.3)' }}
                  className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-6 flex flex-col gap-4 transition-colors hover:border-[var(--text-secondary)]"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-[var(--text-secondary)] flex items-center gap-1.5 font-medium">
                      <Clock size={14} /> {new Date(Number(draft.id)).toLocaleString(lang === 'ko' ? 'ko-KR' : 'en-US')}
                    </span>
                    <button 
                      onClick={() => deleteDraft(draft.id)} 
                      className="text-red-400 hover:text-red-300 opacity-60 hover:opacity-100 transition-opacity p-1"
                      title={lang === 'en' ? 'Delete' : '삭제'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-3">
                    <p className="text-[14px] text-[var(--text-secondary)] line-clamp-2">
                      {draft.koreanText || (lang === 'en' ? 'No original text' : '원본 텍스트가 없습니다')}
                    </p>
                    <div className="text-[15px] text-[var(--text-primary)] p-4 bg-black/20 rounded-xl border border-[var(--border-color)] line-clamp-3 font-serif leading-relaxed tracking-wide">
                      {draft.englishText || (lang === 'en' ? 'No generated text' : '생성된 텍스트가 없습니다')}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleLoad(draft)} 
                    className="mt-2 py-2.5 bg-[var(--text-primary)] text-[var(--bg-color)] w-full rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity text-[14px]"
                  >
                    <ExternalLink size={16} /> {lang === 'en' ? 'Load Draft' : '초안 불러오기'}
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};
