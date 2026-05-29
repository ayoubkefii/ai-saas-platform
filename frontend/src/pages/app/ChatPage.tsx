import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import {
  Send, Plus, Trash2, MessageSquare, Loader2, Copy, Check, Sparkles, Menu, X, Mic, MicOff, Search
} from 'lucide-react'
import { chatApi } from '../../lib/api'
import { useThemeStore } from '../../store/themeStore'
import { cn, formatRelativeTime, truncate } from '../../lib/utils'
import type { Chat, Message } from '../../types'
import ChatBackground from '../../components/ui/ChatBackground'
import { useKeyboardShortcuts, SHORTCUTS } from '../../hooks/useKeyboardShortcuts'

interface CodeProps {
  className?: string
  children?: React.ReactNode
  node?: unknown
}

function CodeBlock({ className, children }: CodeProps) {
  const [copied, setCopied] = useState(false)
  const match = /language-(\w+)/.exec(className || '')
  const language = match ? match[1] : ''
  const code = String(children).replace(/\n$/, '')
  const isInline = !code.includes('\n') && !language

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isInline) {
    return <code className="bg-violet-500/15 border border-violet-500/20 rounded px-1.5 py-0.5 text-violet-300 text-sm font-mono">{children}</code>
  }

  return (
    <div className="relative group my-3">
      <div className="flex items-center justify-between bg-[#1a1a2e] rounded-t-lg px-4 py-2 border border-white/[0.06] border-b-0">
        <span className="text-xs text-white/40 font-mono">{language || 'code'}</span>
        <button onClick={handleCopy} className="text-white/30 hover:text-white/70 transition-colors flex items-center gap-1.5 text-xs">
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language}
        PreTag="div"
        customStyle={{ margin: 0, borderRadius: '0 0 8px 8px', border: '1px solid rgba(255,255,255,0.06)', borderTop: 0, fontSize: '13px' }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

export default function ChatPage() {
  const { chatId } = useParams()
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChat, setCurrentChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isLoadingChats, setIsLoadingChats] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [chatSearchQuery, setChatSearchQuery] = useState('')
  const [showChatSearch, setShowChatSearch] = useState(false)
  const [lastFinalInput, setLastFinalInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<any>(null)
  const isDark = theme === 'dark'

  // Initialize speech recognition once
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onresult = (event: any) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        if (finalTranscript) {
          setInput(prev => {
            const newInput = prev + finalTranscript + ' '
            setLastFinalInput(newInput)
            return newInput
          })
        } else if (interimTranscript) {
          // Show interim results by appending to last final input
          setInput(lastFinalInput + interimTranscript)
        }
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone access to use voice input.')
        }
        setIsListening(false)
      }

      recognition.onend = () => {
        // Don't auto-restart - let user control it
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }
  }, [])

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.')
      return
    }

    try {
      if (isListening) {
        recognitionRef.current.stop()
        setIsListening(false)
      } else {
        recognitionRef.current.start()
        setIsListening(true)
      }
    } catch (error) {
      console.error('Error toggling speech recognition:', error)
      setIsListening(false)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    }
  }, [])

  // Generate AI suggestions based on input
  useEffect(() => {
    if (input.length > 2) {
      const lastWord = input.split(' ').pop()?.toLowerCase() || ''
      const suggestionPatterns: Record<string, string[]> = {
        'write': [' a blog post', ' code in Python', ' a product description', ' an email'],
        'explain': [' how AI works', ' quantum computing', ' the difference between SQL and NoSQL'],
        'create': [' a REST API', ' a React component', ' a database schema', ' a marketing plan'],
        'help': [' me debug this code', ' me write a resume', ' me plan a project'],
        'analyze': [' this data', ' this document', ' user behavior'],
        'optimize': [' my code', ' database queries', ' performance'],
        'build': [' a website', ' a mobile app', ' a chatbot'],
        'design': [' a logo', ' a user interface', ' a database'],
        'debug': [' my React app', ' my Python script', ' my API'],
      }

      const matches = Object.entries(suggestionPatterns).filter(([key]) =>
        lastWord.includes(key) || key.includes(lastWord)
      )

      if (matches.length > 0) {
        const allSuggestions = matches.flatMap(([_, suggestions]) => suggestions)
        setSuggestions(allSuggestions.slice(0, 4))
        setShowSuggestions(true)
      } else {
        setShowSuggestions(false)
      }
    } else {
      setShowSuggestions(false)
    }
  }, [input])

  const applySuggestion = (suggestion: string) => {
    setInput(prev => prev + suggestion)
    setShowSuggestions(false)
    textareaRef.current?.focus()
  }

  const filteredChats = chats.filter(chat => {
    if (!chatSearchQuery) return true
    const query = chatSearchQuery.toLowerCase()
    return chat.title.toLowerCase().includes(query) ||
           chat.messages.some(msg => msg.content.toLowerCase().includes(query))
  })

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingContent, scrollToBottom])

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await chatApi.getChats()
        setChats(res.data.chats || [])
      } catch {
        setChats([])
      } finally {
        setIsLoadingChats(false)
      }
    }
    fetchChats()
  }, [])

  useEffect(() => {
    if (chatId) {
      const fetchChat = async () => {
        setIsLoadingMessages(true)
        try {
          const res = await chatApi.getChat(chatId)
          setCurrentChat(res.data.chat)
          setMessages(res.data.chat.messages || [])
        } catch {
          navigate('/app/chat')
        } finally {
          setIsLoadingMessages(false)
        }
      }
      fetchChat()
    } else {
      setCurrentChat(null)
      setMessages([])
    }
  }, [chatId, navigate])

  const handleNewChat = async () => {
    try {
      const res = await chatApi.createChat()
      const newChat = res.data.chat
      setChats(prev => [newChat, ...prev])
      navigate(`/app/chat/${newChat.id}`)
    } catch {
      navigate('/app/chat/new')
    }
  }

  const handleDeleteChat = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await chatApi.deleteChat(id)
      setChats(prev => prev.filter(c => c.id !== id))
      if (chatId === id) navigate('/app/chat')
    } catch {}
  }

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      ...SHORTCUTS.NEW_CHAT,
      action: handleNewChat,
    },
    {
      ...SHORTCUTS.TOGGLE_SIDEBAR,
      action: () => setSidebarOpen(prev => !prev),
    },
    {
      ...SHORTCUTS.FOCUS_INPUT,
      action: () => textareaRef.current?.focus(),
    },
    {
      ...SHORTCUTS.VOICE_INPUT,
      action: toggleListening,
    },
  ])

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return

    const content = input.trim()
    setInput('')

    let activeChatId = chatId

    if (!activeChatId) {
      try {
        const res = await chatApi.createChat(truncate(content, 40))
        const newChat = res.data.chat
        setChats(prev => [newChat, ...prev])
        activeChatId = newChat.id
        navigate(`/app/chat/${newChat.id}`, { replace: true })
      } catch {
        return
      }
    }

    const resolvedChatId = activeChatId as string

    const userMsg: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
      chatId: resolvedChatId,
    }
    setMessages(prev => [...prev, userMsg])
    setIsStreaming(true)
    setStreamingContent('')

    try {
      const response = await chatApi.streamMessage(resolvedChatId, content)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      if (!response.body) throw new Error('No response body')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''
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
              fullContent += delta
              setStreamingContent(fullContent)
            }
          } catch {}
        }
      }

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: fullContent,
        createdAt: new Date().toISOString(),
        chatId: resolvedChatId,
      }
      setMessages(prev => [...prev, assistantMsg])

      setChats(prev => prev.map(c =>
        c.id === resolvedChatId
          ? { ...c, title: c.title === 'New Chat' ? truncate(content, 40) : c.title, updatedAt: new Date().toISOString() }
          : c
      ))
    } catch (err) {
      const errMsg: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        createdAt: new Date().toISOString(),
        chatId: resolvedChatId,
      }
      setMessages(prev => [...prev, errMsg])
    } finally {
      setIsStreaming(false)
      setStreamingContent('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'
  }

  return (
    <div className={cn('flex h-full relative', isDark ? 'bg-[#060611]' : 'bg-gray-50')}>
      {isDark && <ChatBackground />}
      {/* Chat Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'flex flex-col border-r overflow-hidden flex-shrink-0',
              isDark ? 'bg-[#0a0a1a] border-white/[0.06]' : 'bg-white border-gray-200'
            )}
          >
            <div className={cn('p-4 border-b', isDark ? 'border-white/[0.06]' : 'border-gray-200')}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNewChat}
                className="w-full flex items-center gap-2 bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-medium px-3 py-2.5 rounded-lg"
              >
                <Plus size={16} />
                New Chat
              </motion.button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {isLoadingChats ? (
                <div className="space-y-2 p-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="skeleton h-10 rounded-lg" />
                  ))}
                </div>
              ) : chats.length === 0 ? (
                <div className={cn('text-center py-8 text-sm', isDark ? 'text-white/30' : 'text-gray-400')}>
                  No chats yet. Start a new one!
                </div>
              ) : (
                <>
                  {/* Chat Search */}
                  <div className="px-3 pb-3">
                    <div className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all',
                      isDark ? 'bg-white/[0.03] border-white/[0.08] focus-within:border-violet-500/40' : 'bg-white border-gray-200 focus-within:border-violet-400'
                    )}>
                      <Search size={14} className={isDark ? 'text-white/30' : 'text-gray-400'} />
                      <input
                        value={chatSearchQuery}
                        onChange={(e) => setChatSearchQuery(e.target.value)}
                        placeholder="Search chats..."
                        className={cn('bg-transparent text-xs outline-none flex-1', isDark ? 'text-white placeholder-white/30' : 'text-gray-900 placeholder-gray-400')}
                      />
                    </div>
                  </div>

                  {filteredChats.map((chat) => (
                  <motion.div
                    key={chat.id}
                    whileHover={{ x: 2 }}
                    onClick={() => navigate(`/app/chat/${chat.id}`)}
                    className={cn(
                      'group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer text-sm mb-1 transition-all',
                      chatId === chat.id
                        ? isDark ? 'bg-violet-500/15 text-violet-300' : 'bg-violet-50 text-violet-700'
                        : isDark ? 'text-white/50 hover:bg-white/[0.04] hover:text-white/80' : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <MessageSquare size={14} className="flex-shrink-0" />
                    <span className="flex-1 truncate">{chat.title || 'New Chat'}</span>
                    <button
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </motion.div>
                ))}
                </>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className={cn('h-12 flex items-center gap-3 px-4 border-b flex-shrink-0', isDark ? 'border-white/[0.06]' : 'border-gray-200')}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn('p-1.5 rounded-md transition-colors', isDark ? 'text-white/40 hover:text-white/70 hover:bg-white/[0.06]' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100')}
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
          <span className={cn('text-sm font-medium', isDark ? 'text-white/70' : 'text-gray-700')}>
            {currentChat?.title || 'New Chat'}
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {!chatId && !isStreaming ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center mb-4 glow-purple"
              >
                <Sparkles size={28} className="text-white" />
              </motion.div>
              <h2 className={cn('font-display text-xl font-bold mb-2', isDark ? 'text-white' : 'text-gray-900')}>
                What can I help you with?
              </h2>
              <p className={cn('text-sm mb-8 max-w-sm', isDark ? 'text-white/40' : 'text-gray-500')}>
                Powered by Llama 3 70B via Groq. Ask me anything — code, writing, analysis, math.
              </p>
              <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
                {[
                  '✍️ Write a blog post about AI trends',
                  '🐍 Write a Python web scraper',
                  '📊 Explain transformer architecture',
                  '🔍 Debug this React component',
                ].map((prompt) => (
                  <motion.button
                    key={prompt}
                    whileHover={{ scale: 1.03, y: -2, rotateX: 2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setInput(prompt.slice(3))}
                    className={cn(
                      'text-left text-sm px-4 py-3 rounded-xl transition-all relative overflow-hidden',
                      isDark ? 'glass-premium holographic text-white/60 hover:text-white/80 shimmer-effect' : 'glass-card-light text-gray-600 hover:text-gray-900'
                    )}
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              {isLoadingMessages ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className={cn('flex gap-3', i % 2 === 0 ? 'justify-end' : 'justify-start')}>
                      <div className="skeleton h-12 w-48 rounded-2xl" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                      >
                        {msg.role === 'assistant' && (
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                            <Sparkles size={14} className="text-white" />
                          </div>
                        )}
                        <div className={cn(
                          'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed relative overflow-hidden',
                          msg.role === 'user'
                            ? 'bg-gradient-animated text-white rounded-br-sm shimmer-effect'
                            : isDark ? 'glass-premium border border-white/[0.08] text-white/85 rounded-bl-sm hover:border-violet-500/30' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                        )}>
                          {msg.role === 'assistant' ? (
                            <div className="prose-dark">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  code: (props) => <CodeBlock {...props} />,
                                }}
                              >
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {isStreaming && streamingContent && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3 justify-start"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                        <Sparkles size={14} className="text-white" />
                      </div>
                      <div className={cn(
                        'max-w-[80%] rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed',
                        isDark ? 'bg-white/[0.04] border border-white/[0.06] text-white/85' : 'bg-white border border-gray-200 text-gray-800'
                      )}>
                        <div className="prose-dark">
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: (props) => <CodeBlock {...props} /> }}>
                            {streamingContent}
                          </ReactMarkdown>
                        </div>
                        <span className="inline-block w-2 h-4 bg-violet-400 animate-pulse ml-0.5 align-middle" />
                      </div>
                    </motion.div>
                  )}

                  {isStreaming && !streamingContent && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                        <Loader2 size={14} className="text-white animate-spin" />
                      </div>
                      <div className={cn('rounded-2xl rounded-bl-sm px-4 py-3', isDark ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-white border border-gray-200')}>
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className={cn('p-4 border-t', isDark ? 'border-white/[0.06] bg-[#060611]/90 backdrop-blur-sm' : 'border-gray-200 bg-white')}>
          <div className="max-w-3xl mx-auto">
            <div className={cn(
              'flex gap-3 items-end rounded-xl border p-3 transition-all',
              isDark ? 'bg-white/[0.03] border-white/[0.08] focus-within:border-violet-500/40' : 'bg-white border-gray-200 focus-within:border-violet-400'
            )}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything... (Shift+Enter for new line)"
                rows={1}
                className={cn(
                  'flex-1 bg-transparent text-sm resize-none outline-none max-h-48',
                  isDark ? 'text-white placeholder-white/20' : 'text-gray-900 placeholder-gray-400'
                )}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleListening}
                className={cn(
                  'flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all mr-2',
                  isListening
                    ? 'bg-red-500/20 text-red-400 animate-pulse'
                    : 'text-white/30 hover:text-white/60 hover:bg-white/[0.05]'
                )}
                title={isListening ? 'Stop listening' : 'Voice input'}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 flex items-center justify-center disabled:opacity-40 transition-all"
              >
                {isStreaming ? (
                  <Loader2 size={16} className="text-white animate-spin" />
                ) : (
                  <Send size={16} className="text-white" />
                )}
              </motion.button>
            </div>
            <p className={cn('text-xs mt-2 text-center', isDark ? 'text-white/20' : 'text-gray-400')}>
              AI Workspace uses Groq Llama 3 70B · Responses may contain errors
            </p>

            {/* AI Suggestions */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-3 space-y-2"
                >
                  <p className="text-xs text-white/30 flex items-center gap-2">
                    <Sparkles size={12} />
                    AI Suggestions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => applySuggestion(suggestion)}
                        className={cn(
                          'text-xs px-3 py-1.5 rounded-lg transition-all',
                          isDark
                            ? 'bg-violet-500/10 border border-violet-500/20 text-violet-300 hover:bg-violet-500/20'
                            : 'bg-violet-50 border border-violet-200 text-violet-700 hover:bg-violet-100'
                        )}
                      >
                        {suggestion}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
