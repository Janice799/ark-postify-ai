'use client';
import React from 'react';
import { InputArea } from './InputArea';
import { Toolbar } from './Toolbar';
import { GlassCard } from '../shared/GlassCard';

export const EditorWorkspace = () => {
  return (
    <GlassCard animate={true} className="w-[420px] lg:w-[480px] xl:w-[560px] flex-shrink-0 h-full flex flex-col rounded-none border-y-0 border-l-0 z-10">
      <header className="px-6 py-4 border-b border-[var(--border-color)] bg-[rgba(10,10,10,0.8)] backdrop-blur-md sticky top-0 z-10">
        <h2 className="text-[14px] font-semibold text-[var(--text-secondary)] tracking-wider uppercase">Create Post</h2>
      </header>
      <div className="p-6 overflow-y-auto custom-scrollbar">
        <InputArea />
        <Toolbar />
      </div>
    </GlassCard>
  );
};
