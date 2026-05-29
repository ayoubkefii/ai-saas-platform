export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  plan: 'free' | 'pro' | 'enterprise'
  createdAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
  chatId: string
}

export interface Chat {
  id: string
  title: string
  userId: string
  createdAt: string
  updatedAt: string
  messages?: Message[]
}

export interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'in_review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface Document {
  id: string
  name: string
  size: number
  type: string
  summary?: string
  userId: string
  createdAt: string
  url: string
}

export interface AnalyticsData {
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

export interface KanbanColumn {
  id: string
  title: string
  status: Task['status']
  color: string
  tasks: Task[]
}

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
