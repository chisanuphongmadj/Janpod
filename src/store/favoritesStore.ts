import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

/**
 * Client State: คอลเลกชัน "สูตรของฉัน"
 * เก็บเฉพาะ ID ของเมนูเท่านั้น — ข้อมูลเมนูจริงดึงผ่าน TanStack Query (Server State)
 */
export interface FavoritesState {
  favoriteIds: string[]
}

export interface FavoritesActions {
  isFavorite: (id: string) => boolean
  toggleFavorite: (id: string) => void
  removeFavorite: (id: string) => void
  clear: () => void
}

export type FavoritesStore = FavoritesState & FavoritesActions

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favoriteIds: [],
      isFavorite: (id) => get().favoriteIds.includes(id),
      toggleFavorite: (id) =>
        set((state) => ({
          favoriteIds: state.favoriteIds.includes(id)
            ? state.favoriteIds.filter((favId) => favId !== id)
            : [id, ...state.favoriteIds],
        })),
      removeFavorite: (id) =>
        set((state) => ({ favoriteIds: state.favoriteIds.filter((favId) => favId !== id) })),
      clear: () => set({ favoriteIds: [] }),
    }),
    {
      name: 'janpod-favorites',
      storage: createJSONStorage(() => localStorage),
      // persist เฉพาะ state (ID) ไม่รวม functions
      partialize: (state): FavoritesState => ({ favoriteIds: state.favoriteIds }),
      version: 1,
    },
  ),
)
