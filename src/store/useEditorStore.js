import { create } from 'zustand';

export const useEditorStore = create((set) => ({
  mode: 'ai', // 'ai' or 'manual'
  setMode: (mode) => set({ mode }),
  
  targetSNS: 'x', // 'x', 'linkedin', 'instagram'
  setTargetSNS: (sns) => set({ targetSNS: sns }),
  
  koreanText: '',
  setKoreanText: (text) => set({ koreanText: text }),

  persona: '',
  setPersona: (persona) => set({ persona }),
  
  englishText: '',
  setEnglishText: (text) => set({ englishText: text }),
  appendEnglishText: (text) => set((state) => ({ englishText: state.englishText + text })),
  clearEnglishText: () => set({ englishText: '' }),

  koreanTranslation: '',
  setKoreanTranslation: (text) => set({ koreanTranslation: text }),
  clearKoreanTranslation: () => set({ koreanTranslation: '' }),
  
  isTranslating: false,
  setIsTranslating: (status) => set({ isTranslating: status }),
}));
