import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabaseClient';

const LEGACY_FONT_SIZES = {
  small: 80,
  medium: 105,
  large: 135,
  xlarge: 180,
};

const normalizeFontSize = (value) => {
  const migratedValue = LEGACY_FONT_SIZES[value] ?? Number(value);
  if (!Number.isFinite(migratedValue)) return 105;
  return Math.min(220, Math.max(24, Math.round(migratedValue)));
};

// Custom storage that strips customBgImage and user before saving
const safeStorage = {
  getItem: (name) => {
    const str = localStorage.getItem(name);
    if (!str) return null;
    const storedValue = JSON.parse(str);
    if (storedValue?.state) {
      storedValue.state.fontSize = normalizeFontSize(storedValue.state.fontSize);
    }
    return storedValue;
  },
  setItem: (name, value) => {
    const toSave = { ...value };
    if (toSave.state) {
      const { customBgImage, toast, draftsUnlocked, user, ...safeState } = toSave.state;
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

      // Auth states
      user: null,
      setUser: (user) => set({ user }),
      
      initializeAuth: () => {
        if (!supabase) {
          if (typeof window !== 'undefined') {
            const mockUserStr = localStorage.getItem('mock_user');
            if (mockUserStr) {
              try {
                set({ user: JSON.parse(mockUserStr) });
              } catch (e) {}
            }
          }
          return;
        }
        
        supabase.auth.getSession().then(({ data: { session } }) => {
          set({ user: session?.user || null });
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          set({ user: session?.user || null });
        });

        return () => {
          if (subscription && typeof subscription.unsubscribe === 'function') {
            subscription.unsubscribe();
          }
        };
      },

      probeLocalApi: async () => {
        if (typeof window === 'undefined') return;
        const targetUrl = get().localApiUrl || 'http://localhost:3005';
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 1200);
          const res = await fetch(`${targetUrl.replace(/\/$/, '')}/api/local/pull-status`, { signal: controller.signal });
          clearTimeout(timeoutId);
          if (res.ok) {
            set({ isLocalConnected: true });
          } else {
            set({ isLocalConnected: false });
          }
        } catch (err) {
          set({ isLocalConnected: false });
        }
      },

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
      
      fontSize: 105,
      setFontSize: (size) => set({ fontSize: normalizeFontSize(size) }),
      
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

      localModelPath: '',
      setLocalModelPath: (path) => set({ localModelPath: path }),

      localApiUrl: 'http://localhost:3005',
      setLocalApiUrl: (url) => set({ localApiUrl: url }),

      isLocalConnected: false,
      setIsLocalConnected: (connected) => set({ isLocalConnected: connected }),

      hfToken: '',
      setHfToken: (token) => set({ hfToken: token }),

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
