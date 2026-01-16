import { create } from "zustand"

interface UIStore {
  isModalOpen: boolean
  openModal: () => void
  closeModal: () => void
  isSidebarOpen: boolean
  toggleSidebar: () => void
  openDropdown: string | null
  setOpenDropdown: (id: string | null) => void
}

export const useUIStore = create<UIStore>((set) => ({
  isModalOpen: false,
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  openDropdown: null,
  setOpenDropdown: (id) => set({ openDropdown: id }),
}))
