import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { API_URL, janpodApi, type ApiUser } from '../api/janpod'
import { fetchMealById } from '../api/mealdb'
import type { MealCardData } from '../types/meal'

/**
 * Client State: คอลเลกชัน "สูตรของฉัน"
 * เก็บเฉพาะ ID ของเมนูเท่านั้น — ข้อมูลเมนูจริงดึงผ่าน TanStack Query (Server State)
 *
 * เมื่อตั้งค่า VITE_API_URL และผู้ใช้ระบุอีเมลแล้ว ทุกการเปลี่ยนแปลงจะบันทึกลงฐานข้อมูล
 * (Supabase ผ่าน Backend API) ด้วย แบบ optimistic: อัปเดตหน้าจอก่อน ถ้า API ล้มเหลวค่อยย้อนกลับ
 */
export interface FavoritesState {
  favoriteIds: string[]
  user: ApiUser | null
}

export interface FavoritesActions {
  isFavorite: (id: string) => boolean
  toggleFavorite: (meal: MealCardData) => void
  removeFavorite: (id: string) => void
  clear: () => void
  /** ระบุตัวตนด้วยอีเมล แล้วรวมสูตรในเครื่องกับสูตรในฐานข้อมูล */
  identify: (email: string) => Promise<void>
  signOut: () => void
}

export type FavoritesStore = FavoritesState & FavoritesActions

export const syncEnabled = Boolean(API_URL)

function report(error: unknown) {
  console.error('[Janpod API]', error)
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favoriteIds: [],
      user: null,
      isFavorite: (id) => get().favoriteIds.includes(id),

      toggleFavorite: (meal) => {
        const id = meal.idMeal
        const wasFavorite = get().favoriteIds.includes(id)
        set((state) => ({
          favoriteIds: wasFavorite
            ? state.favoriteIds.filter((favId) => favId !== id)
            : [id, ...state.favoriteIds],
        }))
        const user = get().user
        if (!syncEnabled || !user) return
        const request = wasFavorite ? janpodApi.removeFavorite(user.id, id) : janpodApi.addFavorite(user.id, meal)
        request.catch((error) => {
          report(error)
          // ย้อนกลับสถานะเดิม
          set((state) => ({
            favoriteIds: wasFavorite
              ? [id, ...state.favoriteIds.filter((favId) => favId !== id)]
              : state.favoriteIds.filter((favId) => favId !== id),
          }))
        })
      },

      removeFavorite: (id) => {
        set((state) => ({ favoriteIds: state.favoriteIds.filter((favId) => favId !== id) }))
        const user = get().user
        if (syncEnabled && user) janpodApi.removeFavorite(user.id, id).catch(report)
      },

      clear: () => {
        set({ favoriteIds: [] })
        const user = get().user
        if (syncEnabled && user) janpodApi.clearFavorites(user.id).catch(report)
      },

      identify: async (email) => {
        const user = await janpodApi.identify(email)
        const remote = await janpodApi.listFavorites(user.id)
        const remoteIds = remote.map((fav) => fav.mealId)
        const local = get().favoriteIds
        set({ user, favoriteIds: [...new Set([...local, ...remoteIds])] })
        // ส่งสูตรที่มีแค่ในเครื่องขึ้นฐานข้อมูล (ดึงชื่อ/รูปจาก TheMealDB เพื่อสร้างแถวในตาราง meals)
        await Promise.all(
          local
            .filter((id) => !remoteIds.includes(id))
            .map(async (id) => {
              try {
                const meal = await fetchMealById(id)
                if (meal) await janpodApi.addFavorite(user.id, meal)
              } catch (error) {
                report(error)
              }
            }),
        )
      },

      signOut: () => set({ user: null }),
    }),
    {
      name: 'janpod-favorites',
      storage: createJSONStorage(() => localStorage),
      // persist เฉพาะ state ไม่รวม functions
      partialize: (state): FavoritesState => ({ favoriteIds: state.favoriteIds, user: state.user }),
      version: 1,
    },
  ),
)
