import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Eye, EyeOff, Save, Sun, Moon, Loader2, Check } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { userApi } from '../../lib/api'
import { cn } from '../../lib/utils'

export default function WorkspacePage() {
  const { user, setUser } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const isDark = theme === 'dark'

  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState('')
  const [isSavingPw, setIsSavingPw] = useState(false)
  const [pwSuccess, setPwSuccess] = useState(false)
  const [pwError, setPwError] = useState('')

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSaving(true)
    try {
      const res = await userApi.updateProfile({ name, email })
      setUser(res.data.user)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch {
      setError('Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const cardClass = cn(
    'rounded-2xl p-6 mb-6',
    isDark ? 'glass-card' : 'bg-white border border-gray-200 shadow-sm'
  )

  const inputClass = cn(
    'w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all',
    isDark
      ? 'bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 focus:border-violet-500/50'
      : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-violet-400'
  )

  const labelClass = cn('text-xs font-medium mb-1.5 block', isDark ? 'text-white/60' : 'text-gray-500')

  return (
    <div className={cn('p-6 lg:p-8 max-w-3xl mx-auto', isDark ? '' : 'bg-gray-50 min-h-full')}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className={cn('font-display text-2xl font-bold mb-1', isDark ? 'text-white' : 'text-gray-900')}>
          Workspace Settings
        </h1>
        <p className={cn('text-sm', isDark ? 'text-white/50' : 'text-gray-500')}>
          Manage your profile and preferences
        </p>
      </motion.div>

      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className={cardClass}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-400 to-blue-400 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className={cn('font-display font-bold text-lg', isDark ? 'text-white' : 'text-gray-900')}>{user?.name}</h2>
              <p className={cn('text-sm', isDark ? 'text-white/50' : 'text-gray-500')}>{user?.email}</p>
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full mt-1 inline-block font-medium',
                isDark ? 'bg-violet-500/15 text-violet-400' : 'bg-violet-100 text-violet-600'
              )}>
                {user?.plan || 'free'} plan
              </span>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Full name</label>
                <div className="relative">
                  <User size={14} className={cn('absolute left-3 top-1/2 -translate-y-1/2', isDark ? 'text-white/30' : 'text-gray-400')} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={cn(inputClass, 'pl-9')}
                    placeholder="Your name"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Email address</label>
                <div className="relative">
                  <Mail size={14} className={cn('absolute left-3 top-1/2 -translate-y-1/2', isDark ? 'text-white/30' : 'text-gray-400')} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={cn(inputClass, 'pl-9')}
                    placeholder="your@email.com"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <motion.button
                type="submit"
                disabled={isSaving}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg disabled:opacity-60"
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : saveSuccess ? <Check size={14} /> : <Save size={14} />}
                {saveSuccess ? 'Saved!' : 'Save changes'}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>

      {/* Appearance */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className={cardClass}>
          <h3 className={cn('font-display font-semibold mb-4', isDark ? 'text-white' : 'text-gray-900')}>Appearance</h3>
          <div className="grid grid-cols-2 gap-3">
            {(['dark', 'light'] as const).map((t) => (
              <motion.button
                key={t}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => theme !== t && toggleTheme()}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left',
                  theme === t
                    ? 'border-violet-500 bg-violet-500/10'
                    : isDark ? 'border-white/[0.06] hover:border-white/20' : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <div className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center',
                  t === 'dark' ? 'bg-slate-800' : 'bg-amber-50 border border-amber-100'
                )}>
                  {t === 'dark' ? <Moon size={16} className="text-violet-400" /> : <Sun size={16} className="text-amber-500" />}
                </div>
                <div>
                  <p className={cn('text-sm font-medium capitalize', isDark ? 'text-white/80' : 'text-gray-800')}>{t}</p>
                  <p className={cn('text-xs', isDark ? 'text-white/30' : 'text-gray-400')}>
                    {t === 'dark' ? 'Easier on the eyes' : 'Better for daylight'}
                  </p>
                </div>
                {theme === t && (
                  <div className="ml-auto w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                    <Check size={11} className="text-white" />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Security */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className={cardClass}>
          <h3 className={cn('font-display font-semibold mb-4', isDark ? 'text-white' : 'text-gray-900')}>Security</h3>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Current password</label>
              <div className="relative">
                <Lock size={14} className={cn('absolute left-3 top-1/2 -translate-y-1/2', isDark ? 'text-white/30' : 'text-gray-400')} />
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={cn(inputClass, 'pl-9 pr-10')}
                  placeholder="Enter current password"
                />
                <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className={cn('absolute right-3 top-1/2 -translate-y-1/2', isDark ? 'text-white/30 hover:text-white/60' : 'text-gray-400 hover:text-gray-600')}>
                  {showCurrentPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div>
              <label className={labelClass}>New password</label>
              <div className="relative">
                <Lock size={14} className={cn('absolute left-3 top-1/2 -translate-y-1/2', isDark ? 'text-white/30' : 'text-gray-400')} />
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={cn(inputClass, 'pl-9 pr-10')}
                  placeholder="Min. 8 characters"
                />
                <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                  className={cn('absolute right-3 top-1/2 -translate-y-1/2', isDark ? 'text-white/30 hover:text-white/60' : 'text-gray-400 hover:text-gray-600')}>
                  {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            {pwError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">{pwError}</div>
            )}
            <motion.button
              onClick={async () => {
                if (!currentPassword || !newPassword) return
                if (newPassword.length < 8) { setPwError('New password must be at least 8 characters'); return }
                setPwError('')
                setIsSavingPw(true)
                try {
                  await userApi.updatePassword(currentPassword, newPassword)
                  setPwSuccess(true)
                  setCurrentPassword('')
                  setNewPassword('')
                  setTimeout(() => setPwSuccess(false), 2000)
                } catch {
                  setPwError('Failed to update password. Check your current password.')
                } finally {
                  setIsSavingPw(false)
                }
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!currentPassword || !newPassword || isSavingPw}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40',
                isDark ? 'bg-white/[0.06] text-white/70 hover:bg-white/[0.1]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {isSavingPw ? <Loader2 size={14} className="animate-spin" /> : pwSuccess ? <Check size={14} /> : null}
              {pwSuccess ? 'Updated!' : 'Update password'}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className={cn('rounded-2xl p-6 border', isDark ? 'border-red-500/20 bg-red-500/5' : 'border-red-200 bg-red-50')}>
          <h3 className="font-display font-semibold text-red-400 mb-2">Danger Zone</h3>
          <p className={cn('text-sm mb-4', isDark ? 'text-white/40' : 'text-gray-500')}>
            Permanently delete your account and all associated data.
          </p>
          <button className="text-sm text-red-400 border border-red-500/30 px-4 py-2 rounded-lg hover:bg-red-500/10 transition-colors">
            Delete my account
          </button>
        </div>
      </motion.div>
    </div>
  )
}
