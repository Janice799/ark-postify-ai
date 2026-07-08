import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useDraftStore = create(
  persist(
    (set) => ({
      drafts: [],
      saveDraft: (draft) => set((state) => ({
        drafts: [
          {
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            ...draft
          },
          ...state.drafts
        ]
      })),
      deleteDraft: (id) => set((state) => ({
        drafts: state.drafts.filter((d) => d.id !== id)
      })),
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state })
    }),
    {
      name: 'maker-drafts-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      }
    }
  )
);
