'use client';

import React from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { EditorWorkspace } from '../components/editor/EditorWorkspace';
import { PreviewCard } from '../components/preview/PreviewCard';
import { DraftsPanel } from '../components/drafts/DraftsPanel';
import { ThemesPanel } from '../components/themes/ThemesPanel';
import { ConfigPanel } from '../components/config/ConfigPanel';
import { CommitCraftPanel } from '../components/commitcraft/CommitCraftPanel';
import { useUIStore } from '../store/useUIStore';
import { AnimatePresence, motion } from 'framer-motion';

export default function Home() {
  const { activeTab, initializeAuth } = useUIStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const cleanup = initializeAuth();
    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, [initializeAuth]);

  if (!mounted) {
    return (
      <div className="flex h-screen w-full bg-[var(--bg-color)] overflow-hidden">
        <div className="w-[88px] h-full bg-[var(--bg-panel)] border-r border-[var(--border-color)] flex-shrink-0" />
        <main className="flex-1 flex overflow-hidden relative bg-[var(--bg-color)]" />
      </div>
    );
  }
  
  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.3 }
  };

  return (
    <div className="flex h-screen w-full bg-[var(--bg-color)] overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex overflow-hidden relative">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div key="home" {...pageVariants} className="flex w-full h-full absolute inset-0">
              <EditorWorkspace />
              <PreviewCard />
            </motion.div>
          )}
          {activeTab === 'commitcraft' && (
            <motion.div key="commitcraft" {...pageVariants} className="flex w-full h-full absolute inset-0">
              <CommitCraftPanel />
            </motion.div>
          )}
          {activeTab === 'drafts' && (
            <motion.div key="drafts" {...pageVariants} className="flex w-full h-full absolute inset-0">
              <DraftsPanel />
            </motion.div>
          )}
          {activeTab === 'backgrounds' && (
            <motion.div key="backgrounds" {...pageVariants} className="flex w-full h-full absolute inset-0">
              <ThemesPanel />
              <PreviewCard />
            </motion.div>
          )}
          {activeTab === 'settings' && (
            <motion.div key="settings" {...pageVariants} className="flex w-full h-full absolute inset-0">
              <ConfigPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
