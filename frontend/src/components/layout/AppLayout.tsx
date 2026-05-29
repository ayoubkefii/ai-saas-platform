import { useState, useEffect, useRef } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, MessageSquare, CheckSquare, FileText,
  Settings, LogOut, Menu, X, Sparkles, ChevronLeft, Bell, Search,
  Plus, CheckCircle2, Clock, AlertCircle, BarChart3
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { useNotificationStore } from '../../store/notificationStore'
import { cn } from '../../lib/utils'
import NotificationCenter from '../ui/NotificationCenter'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/app/dashboard' },
  { icon: MessageSquare, label: 'AI Chat', to: '/app/chat' },
  { icon: CheckSquare, label: 'Tasks', to: '/app/tasks' },
  { icon: FileText, label: 'Documents', to: '/app/documents' },
  { icon: BarChart3, label: 'Analytics', to: '/app/analytics' },
  { icon: Settings, label: 'Workspace', to: '/app/workspace' },
]

const SEARCH_ITEMS = [
  { label: 'Go to Dashboard', to: '/app/dashboard', icon: LayoutDashboard, category: 'Navigation' },
  { label: 'Go to AI Chat', to: '/app/chat', icon: MessageSquare, category: 'Navigation' },
  { label: 'New Chat', to: '/app/chat', icon: Plus, category: 'Actions' },
  { label: 'Go to Tasks', to: '/app/tasks', icon: CheckSquare, category: 'Navigation' },
  { label: 'Go to Documents', to: '/app/documents', icon: FileText, category: 'Navigation' },
  { label: 'Go to Workspace', to: '/app/workspace', icon: Settings, category: 'Navigation' },
]

const NOTIFICATIONS = [
  { id: '1', icon: CheckCircle2, color: 'text-emerald-400', title: 'Task completed', body: 'Your task has been marked as done.', time: '2m ago' },
  { id: '2', icon: MessageSquare, color: 'text-violet-400', title: 'AI Chat ready', body: 'Groq Llama 3 70B is connected and ready.', time: '5m ago' },
  { id: '3', icon: Clock, color: 'text-blue-400', title: 'Document processed', body: 'Your PDF has been analyzed successfully.', time: '10m ago' },
  { id: '4', icon: AlertCircle, color: 'text-amber-400', title: 'Welcome!', body: 'AI Workspace is ready. Start by creating a chat.', time: 'just now' },
]

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(NOTIFICATIONS.length)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(prev => !prev)
      }
      if (e.key === 'Escape') {
        setSearchOpen(false)
        setNotifOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50)
    else setSearchQuery('')
  }, [searchOpen])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    if (notifOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [notifOpen])

  const filteredSearch = SEARCH_ITEMS.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSearchSelect = (to: string) => {
    setSearchOpen(false)
    navigate(to)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className={cn('flex h-screen overflow-hidden', theme === 'light' ? 'bg-gray-50' : 'bg-[#060611]')}>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 72 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'hidden lg:flex flex-col h-full border-r z-20 relative',
          theme === 'light'
            ? 'bg-white border-gray-200'
            : 'glass-premium border-white/[0.08]'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 h-16 border-b border-white/[0.06]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center flex-shrink-0 glow-purple">
            <Sparkles size={16} className="text-white" />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-display font-bold text-sm gradient-text-purple whitespace-nowrap"
              >
                AI Workspace
              </motion.span>
            )}
          </AnimatePresence>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn(
              'ml-auto p-1.5 rounded-md transition-colors',
              theme === 'light' ? 'hover:bg-gray-100 text-gray-500' : 'hover:bg-white/[0.06] text-white/50'
            )}
          >
            <ChevronLeft size={14} className={cn('transition-transform', !sidebarOpen && 'rotate-180')} />
          </motion.button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ icon: Icon, label, to }) => (
            <NavLink key={to} to={to}>
              {({ isActive }) => (
                <motion.div
                  whileHover={{ x: 4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative overflow-hidden',
                    isActive
                      ? 'holographic neon-border text-violet-300'
                      : theme === 'light'
                        ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        : 'text-white/50 hover:bg-white/[0.04] hover:text-white/80'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavGlow"
                      className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-blue-500/10"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon size={18} className="flex-shrink-0 relative z-10" />
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="whitespace-nowrap relative z-10"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {isActive && sidebarOpen && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 glow-purple relative z-10"
                    />
                  )}
                </motion.div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className={cn('p-3 border-t', theme === 'light' ? 'border-gray-200' : 'border-white/[0.06]')}>
          <div className={cn('flex items-center gap-3 p-2 rounded-lg', !sidebarOpen && 'justify-center')}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-blue-400 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className={cn('text-xs font-medium truncate', theme === 'light' ? 'text-gray-900' : 'text-white/80')}>
                    {user?.name}
                  </p>
                  <p className={cn('text-xs truncate', theme === 'light' ? 'text-gray-500' : 'text-white/40')}>
                    {user?.email}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className={cn(
              'mt-1 w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
              !sidebarOpen && 'justify-center',
              theme === 'light'
                ? 'text-red-500 hover:bg-red-50'
                : 'text-red-400/70 hover:bg-red-500/10 hover:text-red-400'
            )}
          >
            <LogOut size={16} className="flex-shrink-0" />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Log out
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 z-30 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 h-full w-64 bg-[#0a0a1a] border-r border-white/[0.06] z-40 lg:hidden flex flex-col"
            >
              <div className="flex items-center gap-3 p-4 h-16 border-b border-white/[0.06]">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                  <Sparkles size={16} className="text-white" />
                </div>
                <span className="font-display font-bold text-sm gradient-text-purple">AI Workspace</span>
                <button onClick={() => setMobileOpen(false)} className="ml-auto text-white/50">
                  <X size={18} />
                </button>
              </div>
              <nav className="flex-1 p-3 space-y-1">
                {navItems.map(({ icon: Icon, label, to }) => (
                  <NavLink key={to} to={to} onClick={() => setMobileOpen(false)}>
                    {({ isActive }) => (
                      <div className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                        isActive
                          ? 'bg-violet-500/15 text-violet-400'
                          : 'text-white/50 hover:bg-white/[0.04] hover:text-white/80'
                      )}>
                        <Icon size={18} />
                        {label}
                      </div>
                    )}
                  </NavLink>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Bar */}
        <header className={cn(
          'h-16 flex items-center gap-4 px-4 lg:px-6 border-b flex-shrink-0',
          theme === 'light' ? 'bg-white border-gray-200' : 'glass-premium border-white/[0.08]'
        )}>
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-white/50 hover:text-white"
          >
            <Menu size={20} />
          </button>

          <button
            onClick={() => setSearchOpen(true)}
            className={cn(
              'flex-1 max-w-md flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors',
              theme === 'light' ? 'bg-gray-100 text-gray-400 hover:bg-gray-200' : 'bg-white/[0.04] text-white/30 border border-white/[0.06] hover:bg-white/[0.07]'
            )}
          >
            <Search size={14} />
            <span>Search anything...</span>
            <kbd className={cn(
              'ml-auto text-xs px-1.5 py-0.5 rounded font-mono',
              theme === 'light' ? 'bg-gray-200 text-gray-500' : 'bg-white/[0.06] text-white/30'
            )}>⌘K</kbd>
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className={cn(
                'p-2 rounded-lg text-sm transition-colors',
                theme === 'light' ? 'hover:bg-gray-100 text-gray-600' : 'hover:bg-white/[0.06] text-white/50'
              )}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </motion.button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen(prev => !prev); setUnreadCount(0) }}
                className={cn(
                  'p-2 rounded-lg relative transition-colors',
                  theme === 'light' ? 'hover:bg-gray-100 text-gray-600' : 'hover:bg-white/[0.06] text-white/50'
                )}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-violet-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className={cn(
                      'absolute right-0 top-12 w-80 rounded-xl shadow-2xl border z-50 overflow-hidden',
                      theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#0e0e20] border-white/[0.08]'
                    )}
                  >
                    <div className={cn('px-4 py-3 border-b flex items-center justify-between', theme === 'light' ? 'border-gray-100' : 'border-white/[0.06]')}>
                      <span className={cn('text-sm font-semibold', theme === 'light' ? 'text-gray-900' : 'text-white')}>Notifications</span>
                      <span className={cn('text-xs', theme === 'light' ? 'text-gray-400' : 'text-white/30')}>{NOTIFICATIONS.length} total</span>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-white/[0.04]">
                      {NOTIFICATIONS.map((n) => (
                        <div key={n.id} className={cn('flex gap-3 px-4 py-3 transition-colors', theme === 'light' ? 'hover:bg-gray-50' : 'hover:bg-white/[0.03]')}>
                          <n.icon size={16} className={cn('flex-shrink-0 mt-0.5', n.color)} />
                          <div className="flex-1 min-w-0">
                            <p className={cn('text-xs font-medium', theme === 'light' ? 'text-gray-900' : 'text-white/80')}>{n.title}</p>
                            <p className={cn('text-xs mt-0.5', theme === 'light' ? 'text-gray-500' : 'text-white/40')}>{n.body}</p>
                          </div>
                          <span className={cn('text-xs flex-shrink-0', theme === 'light' ? 'text-gray-400' : 'text-white/25')}>{n.time}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-blue-400 flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Search Command Palette */}
      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -20 }}
              transition={{ duration: 0.15 }}
              className={cn(
                'fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-lg rounded-2xl shadow-2xl border z-50 overflow-hidden',
                theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#0e0e20] border-white/[0.08]'
              )}
            >
              <div className={cn('flex items-center gap-3 px-4 py-3 border-b', theme === 'light' ? 'border-gray-100' : 'border-white/[0.06]')}>
                <Search size={16} className={theme === 'light' ? 'text-gray-400' : 'text-white/30'} />
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search pages, actions..."
                  className={cn(
                    'flex-1 bg-transparent text-sm outline-none',
                    theme === 'light' ? 'text-gray-900 placeholder-gray-400' : 'text-white placeholder-white/30'
                  )}
                />
                <kbd className={cn('text-xs px-1.5 py-0.5 rounded font-mono', theme === 'light' ? 'bg-gray-100 text-gray-400' : 'bg-white/[0.06] text-white/30')}>Esc</kbd>
              </div>
              <div className="py-2 max-h-72 overflow-y-auto">
                {filteredSearch.length === 0 ? (
                  <p className={cn('text-sm text-center py-6', theme === 'light' ? 'text-gray-400' : 'text-white/30')}>No results found</p>
                ) : (
                  filteredSearch.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => handleSearchSelect(item.to)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors',
                        theme === 'light' ? 'hover:bg-gray-50 text-gray-700' : 'hover:bg-white/[0.04] text-white/70'
                      )}
                    >
                      <item.icon size={15} className="text-violet-400 flex-shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      <span className={cn('text-xs', theme === 'light' ? 'text-gray-400' : 'text-white/25')}>{item.category}</span>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <NotificationCenter />
    </div>
  )
}
