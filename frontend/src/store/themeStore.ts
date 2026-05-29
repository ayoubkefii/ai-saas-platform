import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeStore {
  theme: 'dark' | 'light'
  toggleTheme: () => void
  setTheme: (theme: 'dark' | 'light') => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'dark' ? 'light' : 'dark'
          document.documentElement.classList.remove('dark', 'light')
          document.documentElement.classList.add(newTheme)
          return { theme: newTheme }
        }),
      setTheme: (theme) => {
        document.documentElement.classList.remove('dark', 'light')
        document.documentElement.classList.add(theme)
        set({ theme })
      },
    }),
    { name: 'theme-storage' }
  )
)
