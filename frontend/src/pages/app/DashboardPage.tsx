import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  MessageSquare, CheckSquare, FileText, TrendingUp,
  ArrowRight, Zap, Clock, BarChart2, Plus
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { analyticsApi } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { cn, formatRelativeTime } from '../../lib/utils'
import type { AnalyticsData } from '../../types'

function SkeletonCard() {
  return (
    <div className="glass-card rounded-xl p-6">
      <div className="skeleton h-4 w-24 rounded mb-3" />
      <div className="skeleton h-8 w-16 rounded mb-2" />
      <div className="skeleton h-3 w-32 rounded" />
    </div>
  )
}

const recentActivity = [
  { icon: MessageSquare, text: 'New chat: "Explain React hooks"', time: new Date(Date.now() - 120000).toISOString(), color: 'text-violet-400' },
  { icon: CheckSquare, text: 'Task completed: "API integration"', time: new Date(Date.now() - 3600000).toISOString(), color: 'text-emerald-400' },
  { icon: FileText, text: 'Document uploaded: "Q4 Report.pdf"', time: new Date(Date.now() - 7200000).toISOString(), color: 'text-blue-400' },
  { icon: MessageSquare, text: 'New chat: "Write a Python script"', time: new Date(Date.now() - 86400000).toISOString(), color: 'text-violet-400' },
  { icon: CheckSquare, text: 'Task created: "Deploy backend"', time: new Date(Date.now() - 172800000).toISOString(), color: 'text-orange-400' },
]

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuthStore()
  const { theme } = useThemeStore()

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await analyticsApi.getAnalytics()
        setAnalytics(res.data)
      } catch {
        setAnalytics({
          stats: { totalMessages: 0, totalTasks: 0, totalDocuments: 0, avgResponseTime: 0 },
          changes: { messageChange: 0, taskChange: 0, documentChange: 0, responseTimeChange: 0 },
          chatActivity: [],
          taskCompletion: [],
          documentUsage: [],
          aiPerformance: [],
          teamActivity: [],
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  const statsCards = analytics
    ? [
        { label: 'Messages', value: analytics.stats.totalMessages.toLocaleString(), icon: MessageSquare, color: 'from-violet-500 to-purple-600', change: `${analytics.changes.messageChange >= 0 ? '+' : ''}${analytics.changes.messageChange}%` },
        { label: 'Tasks', value: analytics.stats.totalTasks, icon: CheckSquare, color: 'from-emerald-500 to-teal-600', change: `${analytics.changes.taskChange >= 0 ? '+' : ''}${analytics.changes.taskChange}%` },
        { label: 'Documents', value: analytics.stats.totalDocuments, icon: FileText, color: 'from-orange-500 to-red-600', change: `${analytics.changes.documentChange >= 0 ? '+' : ''}${analytics.changes.documentChange}%` },
        { label: 'Response Time', value: `${analytics.stats.avgResponseTime}ms`, icon: Zap, color: 'from-blue-500 to-cyan-600', change: `${analytics.changes.responseTimeChange >= 0 ? '+' : ''}${analytics.changes.responseTimeChange}%` },
      ]
    : []

  const isDark = theme === 'dark'

  return (
    <div className={cn('p-6 lg:p-8 max-w-7xl mx-auto', isDark ? 'text-white' : 'text-gray-900')}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className={cn('font-display text-2xl font-bold mb-1', isDark ? 'text-white' : 'text-gray-900')}>
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className={cn('text-sm', isDark ? 'text-white/50' : 'text-gray-500')}>
          Here's what's happening in your workspace
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : statsCards.map(({ label, value, icon: Icon, color, change }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -2, scale: 1.01 }}
                className={cn('rounded-xl p-6 cursor-default', isDark ? 'glass-card' : 'glass-card-light')}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
                    <Icon size={16} className="text-white" />
                  </div>
                  <span className="text-xs text-emerald-400 font-medium bg-emerald-400/10 px-2 py-0.5 rounded-full">
                    {change}
                  </span>
                </div>
                <p className={cn('font-display text-2xl font-bold mb-0.5', isDark ? 'text-white' : 'text-gray-900')}>{value}</p>
                <p className={cn('text-xs', isDark ? 'text-white/40' : 'text-gray-500')}>{label}</p>
              </motion.div>
            ))}
      </div>

      {/* Chart + Activity */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={cn('lg:col-span-2 rounded-xl p-6', isDark ? 'glass-card' : 'glass-card-light')}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={cn('font-display font-semibold', isDark ? 'text-white' : 'text-gray-900')}>Usage Overview</h2>
              <p className={cn('text-xs mt-0.5', isDark ? 'text-white/40' : 'text-gray-500')}>Messages & tasks last 7 days</p>
            </div>
            <BarChart2 size={18} className={isDark ? 'text-white/30' : 'text-gray-400'} />
          </div>
          {isLoading ? (
            <div className="skeleton h-48 rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={analytics?.chatActivity || []}>
                <defs>
                  <linearGradient id="messagesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="tasksGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fill: isDark ? 'rgba(255,255,255,0.3)' : '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: isDark ? 'rgba(255,255,255,0.3)' : '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: isDark ? 'rgba(10,10,26,0.95)' : 'rgba(255,255,255,0.95)',
                    border: '1px solid rgba(139,92,246,0.2)',
                    borderRadius: '8px',
                    color: isDark ? 'white' : '#111',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="messages" stroke="#8b5cf6" strokeWidth={2} fill="url(#messagesGrad)" name="Messages" />
                <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} fill="url(#tasksGrad)" name="Users" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={cn('rounded-xl p-6', isDark ? 'glass-card' : 'glass-card-light')}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className={cn('font-display font-semibold', isDark ? 'text-white' : 'text-gray-900')}>Recent Activity</h2>
            <Clock size={16} className={isDark ? 'text-white/30' : 'text-gray-400'} />
          </div>
          <div className="space-y-4">
            {recentActivity.map(({ icon: Icon, text, time, color }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.06 }}
                className="flex items-start gap-3"
              >
                <div className={cn('w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5', isDark ? 'bg-white/[0.04]' : 'bg-gray-100')}>
                  <Icon size={13} className={color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-xs leading-snug', isDark ? 'text-white/70' : 'text-gray-700')}>{text}</p>
                  <p className={cn('text-xs mt-0.5', isDark ? 'text-white/30' : 'text-gray-400')}>{formatRelativeTime(time)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className={cn('font-display font-semibold mb-4', isDark ? 'text-white' : 'text-gray-900')}>Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'New Chat', desc: 'Start an AI conversation', icon: MessageSquare, to: '/app/chat', color: 'from-violet-500 to-purple-600' },
            { label: 'Upload PDF', desc: 'Analyze a document', icon: FileText, to: '/app/documents', color: 'from-blue-500 to-cyan-600' },
            { label: 'Add Task', desc: 'Track your work', icon: CheckSquare, to: '/app/tasks', color: 'from-emerald-500 to-teal-600' },
            { label: 'View Analytics', desc: 'See your usage', icon: TrendingUp, to: '/app/analytics', color: 'from-orange-500 to-red-600' },
          ].map(({ label, desc, icon: Icon, to, color }, i) => (
            <Link key={label} to={to}>
              <motion.div
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn('rounded-xl p-5 cursor-pointer group transition-all', isDark ? 'glass-card hover:border-white/15' : 'glass-card-light hover:shadow-md')}
              >
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon size={16} className="text-white" />
                </div>
                <p className={cn('text-sm font-medium mb-0.5', isDark ? 'text-white' : 'text-gray-900')}>{label}</p>
                <p className={cn('text-xs', isDark ? 'text-white/40' : 'text-gray-500')}>{desc}</p>
                <ArrowRight size={14} className={cn('mt-2 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all', isDark ? 'text-white/50' : 'text-gray-400')} />
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
