import { useEffect } from 'react'

interface Shortcut {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  action: () => void
  description: string
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const matchesKey = e.key.toLowerCase() === shortcut.key.toLowerCase()
        const matchesCtrl = shortcut.ctrlKey === undefined || e.ctrlKey === shortcut.ctrlKey
        const matchesShift = shortcut.shiftKey === undefined || e.shiftKey === shortcut.shiftKey
        const matchesAlt = shortcut.altKey === undefined || e.altKey === shortcut.altKey
        const matchesMeta = shortcut.metaKey === undefined || e.metaKey === shortcut.metaKey

        if (matchesKey && matchesCtrl && matchesShift && matchesAlt && matchesMeta) {
          e.preventDefault()
          shortcut.action()
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

export const SHORTCUTS = {
  NEW_CHAT: { key: 'n', ctrlKey: true, description: 'New chat' },
  SEARCH: { key: 'k', ctrlKey: true, description: 'Search' },
  TOGGLE_SIDEBAR: { key: 'b', ctrlKey: true, description: 'Toggle sidebar' },
  FOCUS_INPUT: { key: '/', description: 'Focus chat input' },
  VOICE_INPUT: { key: 'v', ctrlKey: true, description: 'Toggle voice input' },
  NEW_TASK: { key: 't', ctrlKey: true, description: 'New task' },
  HELP: { key: '?', description: 'Show shortcuts' },
}
