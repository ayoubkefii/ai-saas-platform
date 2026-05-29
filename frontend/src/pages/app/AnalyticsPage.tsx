import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  TrendingUp, TrendingDown, MessageSquare, FileText, CheckCircle, Clock,
  Users, Activity, Zap, ArrowUpRight, ArrowDownRight, Loader2
} from 'lucide-react'
import { useThemeStore } from '../../store/themeStore'
import { cn } from '../../lib/utils'
import { analyticsApi } from '../../lib/api'

const COLORS = ['#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b']

interface AnalyticsData {
  stats: {
    totalMessages: number
    totalTasks: number
    totalDocuments: number
    avgResponseTime: number
  }
  changes: {
    messageChange: number
    taskChange: number
    documentChange: number
    responseTimeChange: number
  }
  chatActivity: Array<{ name: string; messages: number; users: number }>
  taskCompletion: Array<{ name: string; completed: number; pending: number }>
  documentUsage: Array<{ name: string; value: number }>
  aiPerformance: Array<{ name: string; responseTime: number }>
  teamActivity: Array<{ name: string; status: string; activity: string }>
}

const StatCard = ({ title, value, change, icon: Icon, trend }: {
  title: string
  value: string | number
  change: number
  icon: any
  trend: 'up' | 'down'
}) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.02 }}
    className="glass-premium rounded-2xl p-6 shimmer-effect"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center">
        <Icon size={24} className="text-violet-400" />
      </div>
      <div className={cn(
        'flex items-center gap-1 text-sm font-medium',
        trend === 'up' ? 'text-emerald-400' : 'text-red-400'
      )}>
        {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
        {Math.abs(change)}%
      </div>
    </div>
    <h3 className="text-white/50 text-sm mb-1">{title}</h3>
    <p className="text-3xl font-bold text-white">{value}</p>
  </motion.div>
)

export default function AnalyticsPage() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await analyticsApi.getAnalytics()
        setData(res.data)
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
        // Set fallback data on error
        setData({
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

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-violet-400" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center text-white/50">
        Failed to load analytics
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-white/50">Track your team's productivity and AI usage</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Messages"
              value={data.stats.totalMessages.toLocaleString()}
              change={data.changes.messageChange}
              icon={MessageSquare}
              trend={data.changes.messageChange >= 0 ? 'up' : 'down'}
            />
            <StatCard
              title="Tasks Completed"
              value={data.stats.totalTasks}
              change={data.changes.taskChange}
              icon={CheckCircle}
              trend={data.changes.taskChange >= 0 ? 'up' : 'down'}
            />
            <StatCard
              title="Documents Analyzed"
              value={data.stats.totalDocuments}
              change={data.changes.documentChange}
              icon={FileText}
              trend={data.changes.documentChange >= 0 ? 'up' : 'down'}
            />
            <StatCard
              title="Avg Response Time"
              value={`${data.stats.avgResponseTime}ms`}
              change={data.changes.responseTimeChange}
              icon={Zap}
              trend={data.changes.responseTimeChange >= 0 ? 'up' : 'down'}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Chat Activity */}
            <motion.div
              whileHover={{ y: -2 }}
              className="glass-premium rounded-2xl p-6"
            >
              <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                <Activity size={20} className="text-violet-400" />
                Chat Activity
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.chatActivity}>
                  <defs>
                    <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" />
                  <YAxis stroke="rgba(255,255,255,0.3)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(10, 10, 17, 0.9)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="messages"
                    stroke="#8b5cf6"
                    fillOpacity={1}
                    fill="url(#colorMessages)"
                  />
                  <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Task Completion */}
            <motion.div
              whileHover={{ y: -2 }}
              className="glass-premium rounded-2xl p-6"
            >
              <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                <CheckCircle size={20} className="text-emerald-400" />
                Task Completion
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.taskCompletion}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" />
                  <YAxis stroke="rgba(255,255,255,0.3)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(10, 10, 17, 0.9)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Document Usage */}
            <motion.div
              whileHover={{ y: -2 }}
              className="glass-premium rounded-2xl p-6"
            >
              <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                <FileText size={20} className="text-cyan-400" />
                Document Types
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.documentUsage}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.documentUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(10, 10, 17, 0.9)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>

            {/* AI Performance */}
            <motion.div
              whileHover={{ y: -2 }}
              className="glass-premium rounded-2xl p-6"
            >
              <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                <Zap size={20} className="text-yellow-400" />
                AI Response Time
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.aiPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" />
                  <YAxis stroke="rgba(255,255,255,0.3)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(10, 10, 17, 0.9)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="responseTime"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Team Activity */}
          <motion.div
            whileHover={{ y: -2 }}
            className="glass-premium rounded-2xl p-6"
          >
            <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
              <Users size={20} className="text-blue-400" />
              Team Activity
            </h3>
            <div className="space-y-4">
              {data.teamActivity.map((user, i) => (
                <motion.div
                  key={user.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.03] transition-colors"
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className={cn(
                      'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#060611]',
                      user.status === 'online' ? 'bg-emerald-400' : user.status === 'away' ? 'bg-yellow-400' : 'bg-gray-400'
                    )} />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-white/40 text-sm">{user.activity}</p>
                  </div>
                  <div className="text-white/30 text-sm">
                    {user.status === 'online' ? 'Active' : user.status === 'away' ? 'Away' : 'Offline'}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
