import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent, DragOverEvent, DragStartEvent
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus, Trash2, GripVertical, Calendar, X, Loader2, Search, Filter, ChevronDown, Download, Upload } from 'lucide-react'
import { tasksApi } from '../../lib/api'
import { useThemeStore } from '../../store/themeStore'
import { cn, formatDate } from '../../lib/utils'
import type { Task, KanbanColumn } from '../../types'

const COLUMNS: Omit<KanbanColumn, 'tasks'>[] = [
  { id: 'todo', title: 'To Do', status: 'todo', color: 'bg-slate-500' },
  { id: 'in_progress', title: 'In Progress', status: 'in_progress', color: 'bg-blue-500' },
  { id: 'in_review', title: 'In Review', status: 'in_review', color: 'bg-yellow-500' },
  { id: 'done', title: 'Done', status: 'done', color: 'bg-emerald-500' },
]

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'text-slate-400', bg: 'bg-slate-400/10' },
  medium: { label: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  high: { label: 'High', color: 'text-orange-400', bg: 'bg-orange-400/10' },
  urgent: { label: 'Urgent', color: 'text-red-400', bg: 'bg-red-400/10' },
}

const TASK_TEMPLATES = [
  {
    name: 'Sprint Planning',
    tasks: [
      { title: 'Review backlog', priority: 'high' as const, status: 'todo' as const },
      { title: 'Estimate story points', priority: 'high' as const, status: 'todo' as const },
      { title: 'Assign tasks to team', priority: 'medium' as const, status: 'todo' as const },
      { title: 'Set sprint goals', priority: 'medium' as const, status: 'todo' as const },
    ],
  },
  {
    name: 'Feature Development',
    tasks: [
      { title: 'Design UI mockups', priority: 'high' as const, status: 'todo' as const },
      { title: 'Implement frontend', priority: 'high' as const, status: 'todo' as const },
      { title: 'Build API endpoints', priority: 'high' as const, status: 'todo' as const },
      { title: 'Write unit tests', priority: 'medium' as const, status: 'todo' as const },
      { title: 'Code review', priority: 'medium' as const, status: 'todo' as const },
    ],
  },
  {
    name: 'Bug Fix',
    tasks: [
      { title: 'Reproduce issue', priority: 'urgent' as const, status: 'todo' as const },
      { title: 'Identify root cause', priority: 'high' as const, status: 'todo' as const },
      { title: 'Implement fix', priority: 'high' as const, status: 'todo' as const },
      { title: 'Test fix', priority: 'high' as const, status: 'todo' as const },
      { title: 'Deploy to staging', priority: 'medium' as const, status: 'todo' as const },
    ],
  },
]

interface TaskCardProps {
  task: Task
  isDark: boolean
  onDelete: (id: string) => void
}

function TaskCard({ task, isDark, onDelete }: TaskCardProps) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 'auto',
  }

  const priority = PRIORITY_CONFIG[task.priority]

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2, scale: 1.01 }}
      className={cn(
        'group rounded-xl p-3 mb-2 cursor-default relative overflow-hidden',
        isDragging ? 'shadow-2xl shadow-violet-500/30' : '',
        isDark ? 'glass-premium hover:border-white/15 shimmer-effect' : 'bg-white border border-gray-200 hover:border-gray-300 shadow-sm'
      )}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className={cn('mt-0.5 cursor-grab active:cursor-grabbing flex-shrink-0', isDark ? 'text-white/20 hover:text-white/40' : 'text-gray-300 hover:text-gray-500')}
        >
          <GripVertical size={14} />
        </button>
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-medium leading-snug', isDark ? 'text-white' : 'text-gray-900')}>{task.title}</p>
          {task.description && (
            <p className={cn('text-xs mt-1 leading-relaxed line-clamp-2', isDark ? 'text-gray-400' : 'text-gray-500')}>{task.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', priority.color, priority.bg)}>
              {priority.label}
            </span>
            {task.dueDate && (
              <span className={cn('text-xs flex items-center gap-1', isDark ? 'text-gray-400' : 'text-gray-500')}>
                <Calendar size={10} />
                {formatDate(task.dueDate)}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 text-red-400/50 hover:text-red-400 transition-all flex-shrink-0"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </motion.div>
  )
}

interface AddTaskModalProps {
  onAdd: (task: Partial<Task>) => void
  onClose: () => void
  defaultStatus: Task['status']
  isDark: boolean
}

function AddTaskModal({ onAdd, onClose, defaultStatus, isDark }: AddTaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Task['priority']>('medium')
  const [dueDate, setDueDate] = useState('')
  const [status, setStatus] = useState<Task['status']>(defaultStatus)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!title.trim()) return
    onAdd({ title: title.trim(), description: description.trim() || undefined, priority, status, dueDate: dueDate || undefined })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={cn('w-full max-w-md rounded-2xl p-6', isDark ? 'glass-card border border-white/[0.08]' : 'bg-white shadow-2xl')}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className={cn('font-display font-bold', isDark ? 'text-white' : 'text-gray-900')}>New Task</h2>
          <button onClick={onClose} className={cn('p-1 rounded-lg', isDark ? 'text-white/40 hover:text-white/70' : 'text-gray-400 hover:text-gray-700')}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={cn('text-xs font-medium mb-1.5 block', isDark ? 'text-white/60' : 'text-gray-500')}>Title *</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={cn(
                'w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all',
                isDark ? 'bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 focus:border-violet-500/50' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-violet-400'
              )}
              placeholder="What needs to be done?"
            />
          </div>

          <div>
            <label className={cn('text-xs font-medium mb-1.5 block', isDark ? 'text-white/60' : 'text-gray-500')}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className={cn(
                'w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all resize-none',
                isDark ? 'bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 focus:border-violet-500/50' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-violet-400'
              )}
              placeholder="Optional description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={cn('text-xs font-medium mb-1.5 block', isDark ? 'text-white/60' : 'text-gray-500')}>Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Task['priority'])}
                className={cn(
                  'w-full rounded-lg px-3 py-2.5 text-sm outline-none',
                  isDark ? 'bg-white/[0.04] border border-white/[0.08] text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'
                )}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className={cn('text-xs font-medium mb-1.5 block', isDark ? 'text-white/60' : 'text-gray-500')}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Task['status'])}
                className={cn(
                  'w-full rounded-lg px-3 py-2.5 text-sm outline-none',
                  isDark ? 'bg-white/[0.04] border border-white/[0.08] text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'
                )}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div>
            <label className={cn('text-xs font-medium mb-1.5 block', isDark ? 'text-white/60' : 'text-gray-500')}>Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={cn(
                'w-full rounded-lg px-3 py-2.5 text-sm outline-none',
                isDark ? 'bg-white/[0.04] border border-white/[0.08] text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'
              )}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isDark ? 'bg-white/[0.04] text-white/60 hover:text-white/80' : 'bg-gray-100 text-gray-600 hover:text-gray-800'
              )}
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-violet-600 to-blue-600 text-white"
            >
              Add Task
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default function TasksPage() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [defaultStatus, setDefaultStatus] = useState<Task['status']>('todo')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState<Task['priority'] | 'all'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  )

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await tasksApi.getTasks()
        setTasks(res.data.tasks || [])
      } catch {
        setTasks([
          { id: '1', title: 'Set up project structure', description: 'Initialize repos and CI/CD', status: 'done', priority: 'high', userId: '1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: '2', title: 'Design system components', description: 'Build reusable UI kit', status: 'in_progress', priority: 'high', userId: '1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: '3', title: 'API integration', status: 'in_review', priority: 'medium', userId: '1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: '4', title: 'Write documentation', status: 'todo', priority: 'low', userId: '1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: '5', title: 'Deploy to production', status: 'todo', priority: 'urgent', userId: '1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        ])
      } finally {
        setIsLoading(false)
      }
    }
    fetchTasks()
  }, [])

  const getTasksByStatus = (status: Task['status']) =>
    tasks
      .filter(t => t.status === status)
      .filter(t => {
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          return t.title.toLowerCase().includes(query) ||
                 (t.description && t.description.toLowerCase().includes(query))
        }
        return true
      })
      .filter(t => {
        if (filterPriority !== 'all') {
          return t.priority === filterPriority
        }
        return true
      })

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return
    const activeTask = tasks.find(t => t.id === active.id)
    if (!activeTask) return

    const overId = String(over.id)
    const overTask = tasks.find(t => t.id === overId)
    const overColumn = COLUMNS.find(c => c.id === overId)

    const newStatus = overTask?.status || overColumn?.status
    if (newStatus && newStatus !== activeTask.status) {
      setTasks(prev => prev.map(t => t.id === activeTask.id ? { ...t, status: newStatus } : t))
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeTask = tasks.find(t => t.id === active.id)
    if (!activeTask) return

    try {
      await tasksApi.updateTask(activeTask.id, { status: activeTask.status })
    } catch {}
  }

  const handleAddTask = async (taskData: Partial<Task>) => {
    try {
      const res = await tasksApi.createTask(taskData)
      setTasks(prev => [...prev, res.data.task])
    } catch {
      const newTask: Task = {
        id: `temp-${Date.now()}`,
        title: taskData.title || 'New Task',
        description: taskData.description,
        status: taskData.status || 'todo',
        priority: taskData.priority || 'medium',
        dueDate: taskData.dueDate,
        userId: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setTasks(prev => [...prev, newTask])
    }
    setShowModal(false)
  }

  const handleDeleteTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
    try {
      await tasksApi.deleteTask(id)
    } catch {}
  }

  const handleExportTasks = () => {
    const dataStr = JSON.stringify(tasks, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `tasks-export-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImportTasks = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const importedTasks = JSON.parse(event.target?.result as string)
        if (Array.isArray(importedTasks)) {
          setTasks(prev => [...prev, ...importedTasks.map((t: any) => ({
            ...t,
            id: `imported-${Date.now()}-${Math.random()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }))])
        }
      } catch (error) {
        console.error('Error importing tasks:', error)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleApplyTemplate = (templateIndex: number) => {
    const template = TASK_TEMPLATES[templateIndex]
    const newTasks = template.tasks.map((task) => ({
      ...task,
      id: `template-${Date.now()}-${Math.random()}`,
      userId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))
    setTasks(prev => [...prev, ...newTasks])
    setShowTemplates(false)
  }

  return (
    <div className={cn('h-full flex flex-col', isDark ? '' : 'bg-gray-50')}>
      {/* Header */}
      <div className={cn('flex items-center justify-between px-6 py-4 border-b', isDark ? 'border-white/[0.06]' : 'border-gray-200')}>
        <div>
          <h1 className={cn('font-display font-bold text-xl', isDark ? 'text-white' : 'text-gray-900')}>Tasks</h1>
          <p className={cn('text-xs mt-0.5', isDark ? 'text-white/40' : 'text-gray-500')}>
            {tasks.filter(t => t.status === 'done').length} of {tasks.length} completed
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all',
            isDark ? 'bg-white/[0.03] border-white/[0.08] focus-within:border-violet-500/40' : 'bg-white border-gray-200 focus-within:border-violet-400'
          )}>
            <Search size={16} className={isDark ? 'text-white/30' : 'text-gray-400'} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className={cn('bg-transparent text-sm outline-none w-40', isDark ? 'text-white placeholder-white/30' : 'text-gray-900 placeholder-gray-400')}
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all',
                isDark ? 'bg-white/[0.03] border-white/[0.08] hover:border-violet-500/40' : 'bg-white border-gray-200 hover:border-violet-400'
              )}
            >
              <Filter size={16} className={isDark ? 'text-white/30' : 'text-gray-400'} />
              <span className={cn('text-sm', isDark ? 'text-white/60' : 'text-gray-600')}>
                {filterPriority === 'all' ? 'All' : PRIORITY_CONFIG[filterPriority].label}
              </span>
              <ChevronDown size={14} className={isDark ? 'text-white/30' : 'text-gray-400'} />
            </motion.button>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className={cn(
                    'absolute right-0 top-full mt-2 w-40 rounded-xl border shadow-xl z-10 overflow-hidden',
                    isDark ? 'bg-[#0e0e20] border-white/[0.08]' : 'bg-white border-gray-200'
                  )}
                >
                  {['all', 'low', 'medium', 'high', 'urgent'].map((priority) => (
                    <button
                      key={priority}
                      onClick={() => { setFilterPriority(priority as Task['priority'] | 'all'); setShowFilters(false) }}
                      className={cn(
                        'w-full px-4 py-2.5 text-left text-sm transition-colors',
                        filterPriority === priority
                          ? isDark ? 'bg-violet-500/10 text-violet-300' : 'bg-violet-50 text-violet-700'
                          : isDark ? 'text-white/60 hover:bg-white/[0.04]' : 'text-gray-600 hover:bg-gray-50'
                      )}
                    >
                      {priority === 'all' ? 'All Priorities' : PRIORITY_CONFIG[priority as Task['priority']].label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Export/Import */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleExportTasks}
              className={cn(
                'p-2 rounded-lg border transition-all',
                isDark ? 'bg-white/[0.03] border-white/[0.08] hover:border-violet-500/40' : 'bg-white border-gray-200 hover:border-violet-400'
              )}
              title="Export tasks"
            >
              <Download size={16} className={isDark ? 'text-white/30' : 'text-gray-400'} />
            </motion.button>
            <label className={cn(
              'p-2 rounded-lg border transition-all cursor-pointer',
              isDark ? 'bg-white/[0.03] border-white/[0.08] hover:border-violet-500/40' : 'bg-white border-gray-200 hover:border-violet-400'
            )} title="Import tasks">
              <Upload size={16} className={isDark ? 'text-white/30' : 'text-gray-400'} />
              <input
                type="file"
                accept=".json"
                onChange={handleImportTasks}
                className="hidden"
              />
            </label>
          </div>

          {/* Templates */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowTemplates(!showTemplates)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all',
                isDark ? 'bg-white/[0.03] border-white/[0.08] hover:border-violet-500/40' : 'bg-white border-gray-200 hover:border-violet-400'
              )}
            >
              <Filter size={16} className={isDark ? 'text-white/30' : 'text-gray-400'} />
              <span className={cn('text-sm', isDark ? 'text-white/60' : 'text-gray-600')}>Templates</span>
              <ChevronDown size={14} className={isDark ? 'text-white/30' : 'text-gray-400'} />
            </motion.button>

            <AnimatePresence>
              {showTemplates && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className={cn(
                    'absolute right-0 top-full mt-2 w-56 rounded-xl border shadow-xl z-10 overflow-hidden',
                    isDark ? 'bg-[#0e0e20] border-white/[0.08]' : 'bg-white border-gray-200'
                  )}
                >
                  <div className="p-2">
                    <p className={cn('text-xs font-medium mb-2 px-2', isDark ? 'text-white/40' : 'text-gray-500')}>Quick Start Templates</p>
                    {TASK_TEMPLATES.map((template, index) => (
                      <button
                        key={template.name}
                        onClick={() => handleApplyTemplate(index)}
                        className={cn(
                          'w-full px-3 py-2.5 text-left text-sm rounded-lg transition-colors mb-1',
                          isDark ? 'text-white/60 hover:bg-white/[0.04]' : 'text-gray-600 hover:bg-gray-50'
                        )}
                      >
                        <div className="font-medium">{template.name}</div>
                        <div className={cn('text-xs mt-0.5', isDark ? 'text-white/30' : 'text-gray-400')}>
                          {template.tasks.length} tasks
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { setDefaultStatus('todo'); setShowModal(true) }}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          <Plus size={16} />
          Add Task
        </motion.button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="grid grid-cols-4 gap-4">
            {COLUMNS.map((col) => (
              <div key={col.id} className="space-y-3">
                <div className="skeleton h-8 rounded-lg" />
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton h-24 rounded-xl" />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 min-h-full">
              {COLUMNS.map((col) => {
                const columnTasks = getTasksByStatus(col.status)
                return (
                  <div
                    key={col.id}
                    className={cn(
                      'rounded-2xl p-4 min-h-[400px]',
                      isDark ? 'bg-white/[0.02] border border-white/[0.05]' : 'bg-gray-100/60 border border-gray-200'
                    )}
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className={cn('w-2.5 h-2.5 rounded-full', col.color)} />
                        <span className={cn('text-sm font-semibold', isDark ? 'text-white/70' : 'text-gray-700')}>{col.title}</span>
                        <span className={cn(
                          'text-xs px-1.5 py-0.5 rounded-full font-medium',
                          isDark ? 'bg-white/[0.06] text-white/40' : 'bg-gray-200 text-gray-500'
                        )}>{columnTasks.length}</span>
                      </div>
                      <button
                        onClick={() => { setDefaultStatus(col.status); setShowModal(true) }}
                        className={cn('p-1 rounded-md transition-colors', isDark ? 'text-white/20 hover:text-white/50 hover:bg-white/[0.06]' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200')}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Tasks */}
                    <SortableContext items={columnTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                      <AnimatePresence>
                        {columnTasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            isDark={isDark}
                            onDelete={handleDeleteTask}
                          />
                        ))}
                      </AnimatePresence>
                    </SortableContext>

                    {columnTasks.length === 0 && (
                      <div
                        className={cn(
                          'h-24 rounded-xl border-2 border-dashed flex items-center justify-center text-xs cursor-pointer transition-colors',
                          isDark ? 'border-white/[0.06] text-white/20 hover:border-violet-500/30' : 'border-gray-200 text-gray-400 hover:border-violet-300'
                        )}
                        onClick={() => { setDefaultStatus(col.status); setShowModal(true) }}
                      >
                        Drop here or click to add
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </DndContext>
        )}
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showModal && (
          <AddTaskModal
            onAdd={handleAddTask}
            onClose={() => setShowModal(false)}
            defaultStatus={defaultStatus}
            isDark={isDark}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
