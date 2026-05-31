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

const StatCard = ({ title, value, change, icon: Icon, trend, isDark }: {
  title: string
  value: string | number
  change: number
  icon: any
  trend: 'up' | 'down'
  isDark: boolean
}) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.02 }}
    className={cn("rounded-2xl p-6 shimmer-effect", isDark ? "glass-premium" : "glass-card-light")}
  >
    <div className="flex items-start justify-between mb-4">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center">
        <Icon size={24} className={isDark ? "text-violet-400" : "text-violet-600"} />
      </div>
      <div className={cn(
        'flex items-center gap-1 text-sm font-medium',
        trend === 'up' ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : (isDark ? 'text-red-400' : 'text-red-600')
      )}>
        {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
        {Math.abs(change)}%
      </div>
    </div>
    <h3 className={cn("text-sm mb-1", isDark ? "text-white/50" : "text-gray-500")}>{title}</h3>
    <p className={cn("text-3xl font-bold", isDark ? "text-white" : "text-gray-900")}>{value}</p>
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
      <div className={cn("h-full flex items-center justify-center", isDark ? "text-white/50" : "text-gray-500")}>
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
            <h1 className={cn("font-display text-3xl font-bold mb-2", isDark ? "text-white" : "text-gray-900")}>Analytics Dashboard</h1>
            <p className={isDark ? "text-white/50" : "text-gray-600"}>Track your team's productivity and AI usage</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <StatCard
              title="Total Messages"
              value={data.stats.totalMessages.toLocaleString()}
              change={data.changes.messageChange}
              icon={MessageSquare}
              trend={data.changes.messageChange >= 0 ? 'up' : 'down'}
              isDark={isDark}
            />
            <StatCard
              title="Tasks Completed"
              value={data.stats.totalTasks}
              change={data.changes.taskChange}
              icon={CheckCircle}
              trend={data.changes.taskChange >= 0 ? 'up' : 'down'}
              isDark={isDark}
            />
            <StatCard
              title="Documents Analyzed"
              value={data.stats.totalDocuments}
              change={data.changes.documentChange}
              icon={FileText}
              trend={data.changes.documentChange >= 0 ? 'up' : 'down'}
              isDark={isDark}
            />
            <StatCard
              title="Avg Response Time"
              value={`${data.stats.avgResponseTime}ms`}
              change={data.changes.responseTimeChange}
              icon={Zap}
              trend={data.changes.responseTimeChange >= 0 ? 'up' : 'down'}
              isDark={isDark}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Chat Activity */}
            <motion.div
              whileHover={{ y: -2 }}
              className={cn("rounded-xl sm:rounded-2xl p-4 sm:p-6", isDark ? "glass-premium" : "glass-card-light")}
            >
              <h3 className={cn("font-semibold mb-4 sm:mb-6 flex items-center gap-2 text-sm sm:text-base", isDark ? "text-white" : "text-gray-900")}>
                <Activity size={16} className={cn("sm:size-20", isDark ? "text-violet-400" : "text-violet-600")} />
                Chat Activity
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={data.chatActivity}>
                  <defs>
                    <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                  <XAxis dataKey="name" stroke={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"} />
                  <YAxis stroke={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? 'rgba(10, 10, 17, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                      borderRadius: '8px',
                      color: isDark ? 'white' : '#111',
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
              className={cn("rounded-xl sm:rounded-2xl p-4 sm:p-6", isDark ? "glass-premium" : "glass-card-light")}
            >
              <h3 className={cn("font-semibold mb-4 sm:mb-6 flex items-center gap-2 text-sm sm:text-base", isDark ? "text-white" : "text-gray-900")}>
                <CheckCircle size={16} className={cn("sm:size-20", isDark ? "text-emerald-400" : "text-emerald-600")} />
                Task Completion
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.taskCompletion}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                  <XAxis dataKey="name" stroke={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"} />
                  <YAxis stroke={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? 'rgba(10, 10, 17, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                      borderRadius: '8px',
                      color: isDark ? 'white' : '#111',
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
              className={cn("rounded-xl sm:rounded-2xl p-4 sm:p-6", isDark ? "glass-premium" : "glass-card-light")}
            >
              <h3 className={cn("font-semibold mb-4 sm:mb-6 flex items-center gap-2 text-sm sm:text-base", isDark ? "text-white" : "text-gray-900")}>
                <FileText size={16} className={cn("sm:size-20", isDark ? "text-cyan-400" : "text-cyan-600")} />
                Document Types
              </h3>
              <ResponsiveContainer width="100%" height={250}>
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
                      backgroundColor: isDark ? 'rgba(10, 10, 17, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                      borderRadius: '8px',
                      color: isDark ? 'white' : '#111',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>

            {/* AI Performance */}
            <motion.div
              whileHover={{ y: -2 }}
              className={cn("rounded-xl sm:rounded-2xl p-4 sm:p-6", isDark ? "glass-premium" : "glass-card-light")}
            >
              <h3 className={cn("font-semibold mb-4 sm:mb-6 flex items-center gap-2 text-sm sm:text-base", isDark ? "text-white" : "text-gray-900")}>
                <Zap size={16} className={cn("sm:size-20", isDark ? "text-yellow-400" : "text-yellow-600")} />
                AI Response Time
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data.aiPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                  <XAxis dataKey="name" stroke={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"} />
                  <YAxis stroke={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? 'rgba(10, 10, 17, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                      borderRadius: '8px',
                      color: isDark ? 'white' : '#111',
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
            className={cn("rounded-xl sm:rounded-2xl p-4 sm:p-6", isDark ? "glass-premium" : "glass-card-light")}
          >
            <h3 className={cn("font-semibold mb-4 sm:mb-6 flex items-center gap-2 text-sm sm:text-base", isDark ? "text-white" : "text-gray-900")}>
              <Users size={16} className={cn("sm:size-20", isDark ? "text-blue-400" : "text-blue-600")} />
              Team Activity
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {data.teamActivity.map((user, i) => (
                <motion.div
                  key={user.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={cn("flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-lg sm:rounded-xl transition-colors", isDark ? "hover:bg-white/[0.03]" : "hover:bg-gray-100")}
                >
                  <div className="relative">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className={cn(
                      'absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2',
                      isDark ? 'border-[#060611]' : 'border-white',
                      user.status === 'online' ? 'bg-emerald-400' : user.status === 'away' ? 'bg-yellow-400' : 'bg-gray-400'
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("font-medium text-xs sm:text-sm truncate", isDark ? "text-white" : "text-gray-900")}>{user.name}</p>
                    <p className={cn("text-[10px] sm:text-xs truncate", isDark ? "text-white/40" : "text-gray-500")}>{user.activity}</p>
                  </div>
                  <div className={cn("text-[10px] sm:text-xs flex-shrink-0", isDark ? "text-white/30" : "text-gray-400")}>
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
