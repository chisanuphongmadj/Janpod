import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addFavorite,
  clearFavorites,
  fetchFavorites,
  identify,
  removeFavorite,
  updateFavoriteNote,
} from '../api/janpod'
import { useSessionStore } from '../store/sessionStore'
import type { Favorite, MealCardData } from '../types/meal'
import { favoriteKeys } from './queryKeys'

/**
 * Personal Collection "สูตรของฉัน" — CRUD กับตาราง favorites ผ่าน Backend
 *   Create  POST   /users/:id/favorites
 *   Read    GET    /users/:id/favorites
 *   Update  PATCH  /users/:id/favorites/:mealId   (โน้ต)
 *   Delete  DELETE /users/:id/favorites/:mealId  และ DELETE /users/:id/favorites (ล้างทั้งหมด)
 * ทุก mutation อัปเดตหน้าจอแบบ optimistic ก่อน ถ้า API ล้มเหลวจะย้อนกลับ
 */

export function useFavorites() {
  const user = useSessionStore((state) => state.user)
  return useQuery({
    queryKey: favoriteKeys.byUser(user?.id ?? 0),
    queryFn: ({ signal }) => fetchFavorites(user!.id, signal),
    enabled: user !== null,
    staleTime: 60 * 1000,
  })
}

export function useIsFavorite(mealId: string) {
  const { data } = useFavorites()
  return data?.some((fav) => fav.mealId === mealId) ?? false
}

/** ตัวช่วยสำหรับ optimistic update ของ list favorites ของผู้ใช้ปัจจุบัน */
function useOptimistic() {
  const queryClient = useQueryClient()
  const user = useSessionStore((state) => state.user)
  const key = favoriteKeys.byUser(user?.id ?? 0)

  async function apply(update: (list: Favorite[]) => Favorite[]) {
    await queryClient.cancelQueries({ queryKey: key })
    const previous = queryClient.getQueryData<Favorite[]>(key)
    queryClient.setQueryData<Favorite[]>(key, (list) => update(list ?? []))
    return { previous }
  }

  return {
    user,
    apply,
    rollback: (context?: { previous?: Favorite[] }) => queryClient.setQueryData(key, context?.previous),
    refresh: () => queryClient.invalidateQueries({ queryKey: key }),
  }
}

function requireUser(user: { id: number } | null) {
  if (!user) throw new Error('Please enter your email first')
  return user
}

/** เพิ่ม/ลบ เมนูจากสูตรของฉัน (ปุ่มหัวใจ) */
export function useToggleFavorite() {
  const { user, apply, rollback, refresh } = useOptimistic()
  return useMutation({
    mutationFn: ({ meal, saved }: { meal: MealCardData; saved: boolean }) => {
      const { id } = requireUser(user)
      return saved ? removeFavorite(id, meal.idMeal) : addFavorite(id, meal.idMeal).then(() => undefined)
    },
    onMutate: ({ meal, saved }) =>
      apply((list) =>
        saved
          ? list.filter((fav) => fav.mealId !== meal.idMeal)
          : [{ id: -Date.now(), mealId: meal.idMeal, note: null, createdAt: new Date().toISOString(), meal }, ...list],
      ),
    onError: (_error, _vars, context) => rollback(context),
    onSettled: refresh,
  })
}

export function useRemoveFavorite() {
  const { user, apply, rollback, refresh } = useOptimistic()
  return useMutation({
    mutationFn: (mealId: string) => removeFavorite(requireUser(user).id, mealId),
    onMutate: (mealId) => apply((list) => list.filter((fav) => fav.mealId !== mealId)),
    onError: (_error, _vars, context) => rollback(context),
    onSettled: refresh,
  })
}

export function useUpdateNote() {
  const { user, apply, rollback, refresh } = useOptimistic()
  return useMutation({
    mutationFn: ({ mealId, note }: { mealId: string; note: string }) =>
      updateFavoriteNote(requireUser(user).id, mealId, note),
    onMutate: ({ mealId, note }) =>
      apply((list) => list.map((fav) => (fav.mealId === mealId ? { ...fav, note: note.trim() || null } : fav))),
    onError: (_error, _vars, context) => rollback(context),
    onSettled: refresh,
  })
}

export function useClearFavorites() {
  const { user, apply, rollback, refresh } = useOptimistic()
  return useMutation({
    mutationFn: () => clearFavorites(requireUser(user).id),
    onMutate: () => apply(() => []),
    onError: (_error, _vars, context) => rollback(context),
    onSettled: refresh,
  })
}

/** ระบุตัวตนด้วยอีเมล: POST /users/identify (มีอยู่แล้วคืนผู้ใช้เดิม ไม่มีสร้างใหม่) */
export function useIdentify() {
  const setUser = useSessionStore((state) => state.setUser)
  return useMutation({
    mutationFn: (email: string) => identify(email),
    onSuccess: setUser,
  })
}
