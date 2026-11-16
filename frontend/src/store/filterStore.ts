import { create } from 'zustand'

/**
 * Client State: ตัวกรองบนหน้าหลัก (คำค้นและหมวดที่เลือก)
 * เก็บใน memory เพื่อให้กลับจากหน้า detail แล้วยังเห็นผลการค้นหาเดิม (ไม่ต้อง persist)
 */
export interface FilterState {
  search: string
  category: string | null
}

export interface FilterActions {
  setSearch: (search: string) => void
  setCategory: (category: string | null) => void
  reset: () => void
}

const initialState: FilterState = { search: '', category: null }

export const useFilterStore = create<FilterState & FilterActions>()((set) => ({
  ...initialState,
  setSearch: (search) => set({ search }),
  setCategory: (category) => set({ category }),
  reset: () => set(initialState),
}))
