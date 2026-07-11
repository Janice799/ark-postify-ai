'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Captured client error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#050505] text-[#ededed] flex flex-col items-center justify-center p-8 text-center font-sans">
      <div className="max-w-[600px] w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-2xl p-8 shadow-2xl backdrop-blur-md">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Something went wrong</h2>
        <p className="text-[var(--text-secondary)] text-[14px] mb-6">
          The application encountered a client-side rendering error. Please try reloading or check the error details below.
        </p>

        <div className="text-left bg-[rgba(0,0,0,0.5)] border border-[var(--border-color)] rounded-xl p-4 mb-6 font-mono text-[13px] text-red-400 overflow-auto max-h-[250px] whitespace-pre-wrap select-all shadow-inner custom-scrollbar">
          <strong>Error:</strong> {error?.message || error?.toString()}
          {error?.stack && (
            <div className="mt-2 pt-2 border-t border-white/5 text-zinc-500 text-[11px] select-text">
              {error.stack}
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            }}
            className="flex-1 max-w-[150px] py-3 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-all active:scale-[0.98] cursor-pointer text-[14px]"
          >
            Reload Page
          </button>
          <button
            onClick={() => reset()}
            className="flex-1 max-w-[150px] py-3 bg-[var(--border-color)] text-white font-semibold rounded-xl hover:bg-white/10 transition-all active:scale-[0.98] cursor-pointer text-[14px]"
          >
            Try Again
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(error?.stack || error?.message || String(error));
              alert('Error details copied to clipboard!');
            }}
            className="flex-1 max-w-[180px] py-3 bg-[rgba(255,255,255,0.05)] border border-[var(--glass-border)] text-[var(--text-secondary)] font-semibold rounded-xl hover:text-white hover:bg-white/10 transition-all active:scale-[0.98] cursor-pointer text-[14px]"
          >
            Copy Details
          </button>
        </div>
      </div>
    </div>
  );
}
