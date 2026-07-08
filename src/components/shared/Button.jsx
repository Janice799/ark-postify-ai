'use client';
import React from 'react';
import { motion } from 'framer-motion';

export const Button = ({ 
  children, 
  variant = 'primary', 
  className = '',
  disabled,
  onClick,
  ...props 
}) => {
  const baseStyle = "flex items-center justify-center gap-2 rounded-lg font-medium transition-colors outline-none disabled:opacity-50 disabled:cursor-not-allowed text-sm";
  
  const variants = {
    primary: "bg-[var(--text-primary)] text-[var(--bg-color)] hover:opacity-90 px-4 py-3",
    secondary: "bg-[var(--glass-bg)] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--glass-border)] px-4 py-2",
    ghost: "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--glass-bg)] hover:text-[var(--text-primary)] px-3 py-2",
    active: "bg-[var(--border-color)] text-[var(--text-primary)] shadow-sm px-3 py-2"
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.01 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.button>
  );
};
