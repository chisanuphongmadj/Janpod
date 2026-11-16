import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { User } from '../types/meal'

/**
 * Client State: ผู้ใช้ที่ระบุตัวตนด้วยอีเมลแล้ว (ไม่มีรหัสผ่าน)
 * เก็บแค่ข้อมูลผู้ใช้ไว้ใน LocalStorage เพื่อไม่ต้องกรอกอีเมลใหม่ทุกครั้ง
 * ส่วน "สูตรของฉัน" เป็น Server State อยู่ในฐานข้อมูล ดึงผ่าน TanStack Query (src/hooks/useFavorites.ts)
 */
export interface SessionState {
  user: User | null
}

export interface SessionActions {
  setUser: (user: User) => void
  signOut: () => void
}

export const useSessionStore = create<SessionState & SessionActions>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      signOut: () => set({ user: null }),
    }),
    {
      name: 'janpod-session',
      storage: createJSONStorage(() => localStorage),
      partialize: (state): SessionState => ({ user: state.user }),
      version: 1,
    },
  ),
)
