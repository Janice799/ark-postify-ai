import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Custom storage that strips customBgImage before saving (too large for localStorage)
const safeStorage = {
  getItem: (name) => {
    const str = localStorage.getItem(name);
    if (!str) return null;
    return JSON.parse(str);
  },
  setItem: (name, value) => {
    const toSave = { ...value };
    if (toSave.state) {
      const { customBgImage, toast, draftsUnlocked, ...safeState } = toSave.state;
      toSave.state = safeState;
    }
    try {
      localStorage.setItem(name, JSON.stringify(toSave));
    } catch (e) {
      console.warn('localStorage save failed:', e);
    }
  },
  removeItem: (name) => localStorage.removeItem(name),
};

let _customBgImage = null;

export const useUIStore = create(
  persist(
    (set, get) => ({
      activeTab: 'home',
      setActiveTab: (tab) => set({ activeTab: tab }),

      lang: 'en',
      setLang: (lang) => set({ lang }),

      draftsPassword: null,
      setDraftsPassword: (pw) => set({ draftsPassword: pw }),

      draftsUnlocked: false,
      setDraftsUnlocked: (unlocked) => set({ draftsUnlocked: unlocked }),

      bgStyle: 'mesh-sunset',
      setBgStyle: (style) => set({ bgStyle: style }),
      
      bgPosition: 'center',
      setBgPosition: (pos) => set({ bgPosition: pos }),
      
      activeCategory: 'Premium Gradients',
      setActiveCategory: (cat) => set({ activeCategory: cat }),
      
      aspectRatio: '16:9',
      setAspectRatio: (ratio) => set({ aspectRatio: ratio }),
      
      textColor: 'auto',
      setTextColor: (color) => set({ textColor: color }),
      
      fontFamily: "'Noto Sans KR', 'Inter', sans-serif",
      setFontFamily: (font) => set({ fontFamily: font }),
      
      fontSize: 'medium',
      setFontSize: (size) => set({ fontSize: size }),
      
      lineHeight: 'normal',
      setLineHeight: (height) => set({ lineHeight: height }),

      // Array of user uploaded images { id, data, timestamp }
      myImages: [],
      setMyImages: (images) => set({ myImages: images }),
      addMyImage: (imgObj) => set((state) => ({ myImages: [imgObj, ...state.myImages] })),
      removeMyImage: (id) => set((state) => ({ myImages: state.myImages.filter(img => img.id !== id) })),

      // customBgImage is stored in Zustand state (stripped during persist serialization in safeStorage)
      customBgImage: null,
      setCustomBgImage: (img) => set({ customBgImage: img }),

      aiProvider: 'openai',
      setAiProvider: (provider) => set({ aiProvider: provider }),

      apiKey: '',
      setApiKey: (key) => set({ apiKey: key }),

      geminiKey: '',
      setGeminiKey: (key) => set({ geminiKey: key }),

      // CommitCraft Settings
      commitCraftRepos: [],
      setCommitCraftRepos: (repos) => set({ commitCraftRepos: repos }),
      
      commitCraftTelegramChatId: '',
      setCommitCraftTelegramChatId: (id) => set({ commitCraftTelegramChatId: id }),
      
      commitCraftTelegramBotToken: '',
      setCommitCraftTelegramBotToken: (token) => set({ commitCraftTelegramBotToken: token }),
      
      commitCraftGithubToken: '',
      setCommitCraftGithubToken: (token) => set({ commitCraftGithubToken: token }),

      commitCraftLogs: [],
      setCommitCraftLogs: (logs) => set({ commitCraftLogs: logs }),
      
      toast: null,
      showToast: (message, type = 'success') => {
        set({ toast: { message, type } });
        // Auto-dismiss after 2.5 seconds
        setTimeout(() => {
          const current = get().toast;
          if (current && current.message === message) {
            set({ toast: null });
          }
        }, 2500);
      },
      hideToast: () => set({ toast: null }),

      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state })
    }),
    {
      name: 'maker-ui-storage',
      storage: safeStorage,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      }
    }
  )
);
