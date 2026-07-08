'use client';
import React from 'react';

export const TextArea = ({ 
  label, 
  description,
  error,
  className = '',
  ...props 
}) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <div className="flex justify-between items-center">
          <label className="text-[13px] font-medium text-[var(--text-secondary)]">
            {label}
          </label>
          {description && (
            <span className="text-[12px] text-[var(--text-secondary)]">{description}</span>
          )}
        </div>
      )}
      <textarea
        className={`w-full bg-transparent border border-[var(--glass-border)] rounded-lg p-4 text-[14px] leading-relaxed text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] transition-all resize-y font-sans ${error ? 'border-red-500/50' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-[12px] text-red-400 mt-1">{error}</span>}
    </div>
  );
};
