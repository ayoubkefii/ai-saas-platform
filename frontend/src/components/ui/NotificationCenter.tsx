import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, Info, X, Bell } from 'lucide-react'
import { useNotificationStore } from '../../store/notificationStore'
import { cn } from '../../lib/utils'

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const colors = {
  success: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  error: 'text-red-400 bg-red-500/10 border-red-500/20',
  warning: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  info: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
}

export default function NotificationCenter() {
  const { notifications, markAsRead, removeNotification } = useNotificationStore()

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => {
          const Icon = icons[notification.type]
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={cn(
                'pointer-events-auto glass-premium rounded-xl p-4 border shadow-lg',
                colors[notification.type]
              )}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm">{notification.title}</p>
                  <p className="text-white/60 text-sm mt-1">{notification.message}</p>
                  {notification.action && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        notification.action?.onClick()
                        removeNotification(notification.id)
                      }}
                      className="mt-2 text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      {notification.action.label}
                    </button>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeNotification(notification.id)
                  }}
                  className="flex-shrink-0 text-white/30 hover:text-white/60 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
