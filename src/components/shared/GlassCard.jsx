'use client';
import React from 'react';
import { motion } from 'framer-motion';

export const GlassCard = ({ children, className = '', animate = false }) => {
  const combinedClass = `bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl ${className}`;

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={combinedClass}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={combinedClass}>
      {children}
    </div>
  );
};
