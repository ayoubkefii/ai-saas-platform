import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, FileText, Trash2, MessageSquare, Loader2,
  File, X, Send, Sparkles, ChevronRight, Download, Eye, MoreVertical, Clock
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { documentsApi } from '../../lib/api'
import { useThemeStore } from '../../store/themeStore'
import { cn, formatDate, formatBytes } from '../../lib/utils'
import type { Document } from '../../types'

export default function DocumentsPage() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [question, setQuestion] = useState('')
  const [isAsking, setIsAsking] = useState(false)
  const [answer, setAnswer] = useState('')
  const [streamingAnswer, setStreamingAnswer] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [docMenuOpen, setDocMenuOpen] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const answerEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchDocuments()
  }, [])

  useEffect(() => {
    answerEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [streamingAnswer])

  const fetchDocuments = async () => {
    try {
      const res = await documentsApi.getDocuments()
      setDocuments(res.data.documents || [])
    } catch {
      setDocuments([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpload = async (file: File) => {
    if (!file || file.type !== 'application/pdf') {
      alert('Please upload a PDF file')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File must be under 10MB')
      return
    }
    setIsUploading(true)
    setUploadProgress(0)
    const formData = new FormData()
    formData.append('file', file)

    const interval = setInterval(() => {
      setUploadProgress(p => Math.min(p + 10, 85))
    }, 300)

    try {
      const res = await documentsApi.uploadDocument(formData)
      clearInterval(interval)
      setUploadProgress(100)
      setTimeout(() => {
        setDocuments(prev => [res.data.document, ...prev])
        setUploadProgress(0)
        setIsUploading(false)
      }, 500)
    } catch {
      clearInterval(interval)
      setIsUploading(false)
      setUploadProgress(0)
      alert('Upload failed. Please try again.')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleUpload(file)
  }

  const handleDelete = async (id: string) => {
    try {
      await documentsApi.deleteDocument(id)
      setDocuments(prev => prev.filter(d => d.id !== id))
      if (selectedDoc?.id === id) {
        setSelectedDoc(null)
        setAnswer('')
      }
    } catch {}
  }

  const handleAsk = async () => {
    if (!question.trim() || !selectedDoc || isAsking) return
    const q = question.trim()
    setQuestion('')
    setIsAsking(true)
    setAnswer('')
    setStreamingAnswer('')

    try {
      const response = await documentsApi.streamAsk(selectedDoc.id, q)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      if (!response.body) throw new Error('No body')
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let full = ''
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith('data: ')) continue
          const data = trimmed.slice(6).trim()
          if (data === '[DONE]') continue
          try {
            const parsed = JSON.parse(data)
            const delta = parsed.choices?.[0]?.delta?.content || ''
            if (delta) {
              full += delta
              setStreamingAnswer(full)
            }
          } catch {}
        }
      }
      setAnswer(full)
    } catch {
      setAnswer('Failed to get answer. Please try again.')
    } finally {
      setIsAsking(false)
      setStreamingAnswer('')
    }
  }

  return (
    <div className={cn('flex h-full', isDark ? '' : 'bg-gray-50')}>
      {/* Document List */}
      <div className={cn('w-72 flex-shrink-0 border-r flex flex-col', isDark ? 'border-white/[0.06] bg-[#0a0a1a]' : 'border-gray-200 bg-white')}>
        <div className={cn('p-4 border-b', isDark ? 'border-white/[0.06]' : 'border-gray-200')}>
          <h2 className={cn('font-display font-semibold mb-3', isDark ? 'text-white' : 'text-gray-900')}>Documents</h2>

          {/* Upload Zone */}
          <motion.div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            animate={dragOver ? { scale: 1.02 } : { scale: 1 }}
            whileHover={{ scale: 1.01, rotateX: 2 }}
            className={cn(
              'border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all relative overflow-hidden',
              dragOver
                ? 'holographic neon-border'
                : isDark ? 'glass-premium border-white/10 hover:border-violet-500/40 shimmer-effect' : 'border-gray-200 hover:border-violet-400 hover:bg-violet-50'
            )}
          >
            {isUploading ? (
              <div className="space-y-2">
                <Loader2 size={20} className="mx-auto text-violet-400 animate-spin" />
                <div className={cn('h-1.5 rounded-full overflow-hidden', isDark ? 'bg-white/10' : 'bg-gray-200')}>
                  <motion.div
                    className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full"
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className={cn('text-xs', isDark ? 'text-white/40' : 'text-gray-500')}>Uploading & analyzing...</p>
              </div>
            ) : (
              <>
                <Upload size={20} className="mx-auto mb-2 text-violet-400" />
                <p className={cn('text-xs font-medium', isDark ? 'text-white/70' : 'text-gray-700')}>Drop PDF here</p>
                <p className={cn('text-xs mt-0.5', isDark ? 'text-white/30' : 'text-gray-400')}>or click to browse · Max 10MB</p>
              </>
            )}
          </motion.div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f) }}
          />
        </div>

        {/* Document List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-16 rounded-lg" />
            ))
          ) : documents.length === 0 ? (
            <div className={cn('text-center py-12 text-sm', isDark ? 'text-gray-400' : 'text-gray-500')}>
              <FileText size={32} className="mx-auto mb-3 opacity-50" />
              <p>No documents yet.</p>
              <p>Upload a PDF to get started.</p>
            </div>
          ) : (
            documents.map((doc) => (
              <motion.div
                key={doc.id}
                whileHover={{ x: 4, scale: 1.02 }}
                onClick={() => { setSelectedDoc(doc); setAnswer('') }}
                className={cn(
                  'group flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all relative overflow-hidden',
                  selectedDoc?.id === doc.id
                    ? isDark ? 'holographic neon-border' : 'bg-violet-50 border border-violet-200'
                    : isDark ? 'glass-premium hover:border-white/15 shimmer-effect' : 'hover:bg-gray-50'
                )}
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <File size={14} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-xs font-medium truncate', isDark ? 'text-white' : 'text-gray-900')}>{doc.name}</p>
                  <p className={cn('text-xs', isDark ? 'text-gray-400' : 'text-gray-500')}>{formatBytes(doc.size)} · {formatDate(doc.createdAt)}</p>
                </div>
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setDocMenuOpen(docMenuOpen === doc.id ? null : doc.id) }}
                    className={cn('p-1 rounded hover:bg-white/[0.1]', isDark ? 'text-white/30 hover:text-white/60' : 'text-gray-400 hover:text-gray-600')}
                  >
                    <MoreVertical size={14} />
                  </button>

                  <AnimatePresence>
                    {docMenuOpen === doc.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={cn(
                          'absolute right-0 top-full mt-1 w-36 rounded-lg border shadow-xl z-10 overflow-hidden',
                          isDark ? 'bg-[#0e0e20] border-white/[0.08]' : 'bg-white border-gray-200'
                        )}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => { setSelectedDoc(doc); setDocMenuOpen(null) }}
                          className={cn('w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors', isDark ? 'text-white/60 hover:bg-white/[0.04]' : 'text-gray-600 hover:bg-gray-50')}
                        >
                          <Eye size={14} />
                          Preview
                        </button>
                        <button
                          onClick={() => { /* Download logic */ setDocMenuOpen(null) }}
                          className={cn('w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors', isDark ? 'text-white/60 hover:bg-white/[0.04]' : 'text-gray-600 hover:bg-gray-50')}
                        >
                          <Download size={14} />
                          Download
                        </button>
                        <button
                          onClick={() => { handleDelete(doc.id); setDocMenuOpen(null) }}
                          className={cn('w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-red-400', isDark ? 'hover:bg-red-500/10' : 'hover:bg-red-50')}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Document View + Q&A */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {!selectedDoc ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4"
            >
              <FileText size={28} className="text-white" />
            </motion.div>
            <h2 className={cn('font-display text-xl font-bold mb-2', isDark ? 'text-white' : 'text-gray-900')}>Select a document</h2>
            <p className={cn('text-sm max-w-sm', isDark ? 'text-white/40' : 'text-gray-500')}>
              Upload a PDF and ask questions about it. The AI will analyze the content and provide intelligent answers.
            </p>
          </div>
        ) : (
          <>
            {/* Doc Header */}
            <div className={cn('p-4 border-b flex items-center gap-3 flex-shrink-0', isDark ? 'border-white/[0.06]' : 'border-gray-200')}>
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <File size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className={cn('font-medium text-sm truncate', isDark ? 'text-white' : 'text-gray-900')}>{selectedDoc.name}</h2>
                <p className={cn('text-xs', isDark ? 'text-white/40' : 'text-gray-500')}>{formatBytes(selectedDoc.size)} · Uploaded {formatDate(selectedDoc.createdAt)}</p>
              </div>
              <button onClick={() => setSelectedDoc(null)} className={cn('p-1.5 rounded-lg', isDark ? 'text-white/40 hover:text-white/70 hover:bg-white/[0.06]' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100')}>
                <X size={16} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* AI Summary */}
              {selectedDoc.summary && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn('rounded-xl p-5 mb-6', isDark ? 'bg-gradient-to-br from-violet-500/10 to-blue-500/10 border border-violet-500/20' : 'bg-violet-50 border border-violet-200')}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                      <Sparkles size={14} className="text-white" />
                    </div>
                    <span className={cn('text-sm font-semibold', isDark ? 'text-violet-300' : 'text-violet-700')}>AI Summary</span>
                  </div>
                  <div className={cn('text-sm leading-relaxed prose-dark', isDark ? 'text-white/70' : 'text-gray-700')}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedDoc.summary}</ReactMarkdown>
                  </div>
                </motion.div>
              )}

              {/* Q&A History */}
              {(answer || streamingAnswer) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn('rounded-xl p-5 mb-4', isDark ? 'glass-card' : 'glass-card-light')}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare size={14} className="text-violet-400" />
                    <span className={cn('text-sm font-medium', isDark ? 'text-white/70' : 'text-gray-700')}>Answer</span>
                    {isAsking && <Loader2 size={12} className="text-violet-400 animate-spin ml-auto" />}
                  </div>
                  <div className={cn('text-sm leading-relaxed prose-dark', isDark ? 'text-white/80' : 'text-gray-700')}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {streamingAnswer || answer}
                    </ReactMarkdown>
                    {isAsking && <span className="inline-block w-2 h-4 bg-violet-400 animate-pulse ml-0.5 align-middle" />}
                  </div>
                  <div ref={answerEndRef} />
                </motion.div>
              )}

              {/* Suggested Questions */}
              {!answer && !streamingAnswer && (
                <div>
                  <p className={cn('text-sm font-medium mb-3', isDark ? 'text-white/50' : 'text-gray-500')}>Suggested questions</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      'What are the main topics covered?',
                      'Summarize the key findings',
                      'What are the action items?',
                      'What conclusions were drawn?',
                    ].map((q) => (
                      <motion.button
                        key={q}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setQuestion(q)}
                        className={cn(
                          'flex items-center gap-2 text-left text-sm px-4 py-3 rounded-xl transition-all',
                          isDark ? 'glass-card text-white/60 hover:text-white/80' : 'glass-card-light text-gray-600 hover:text-gray-900'
                        )}
                      >
                        <ChevronRight size={14} className="text-violet-400 flex-shrink-0" />
                        {q}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Ask Input */}
            <div className={cn('p-4 border-t', isDark ? 'border-white/[0.06]' : 'border-gray-200')}>
              <div className={cn(
                'flex gap-3 items-end rounded-xl border p-3 transition-all',
                isDark ? 'bg-white/[0.03] border-white/[0.08] focus-within:border-violet-500/40' : 'bg-white border-gray-200 focus-within:border-violet-400'
              )}>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAsk() } }}
                  placeholder="Ask a question about this document..."
                  rows={1}
                  className={cn(
                    'flex-1 bg-transparent text-sm resize-none outline-none',
                    isDark ? 'text-white placeholder-white/20' : 'text-gray-900 placeholder-gray-400'
                  )}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAsk}
                  disabled={!question.trim() || isAsking}
                  className="w-9 h-9 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 flex items-center justify-center disabled:opacity-40 flex-shrink-0"
                >
                  {isAsking ? <Loader2 size={16} className="text-white animate-spin" /> : <Send size={16} className="text-white" />}
                </motion.button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
