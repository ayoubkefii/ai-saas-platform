import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  Sparkles, MessageSquare, FileText, CheckSquare, Zap,
  Shield, BarChart3, ArrowRight, Star, Check, ChevronDown,
  Globe, Brain, Layers
} from 'lucide-react'
import ThreeBackground from '../components/ui/ThreeBackground'

const features = [
  { icon: Brain, title: 'AI-Powered Chat', desc: 'Streaming responses powered by Llama 3 70B. Ask anything, get expert-level answers instantly.', color: 'from-violet-500 to-purple-600' },
  { icon: FileText, title: 'Document Intelligence', desc: 'Upload PDFs and extract insights. Ask follow-up questions about any document.', color: 'from-blue-500 to-cyan-600' },
  { icon: CheckSquare, title: 'Smart Task Manager', desc: 'Kanban-style board with drag & drop. AI-assisted prioritization and deadline tracking.', color: 'from-emerald-500 to-teal-600' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Real-time insights into your productivity, usage metrics, and work patterns.', color: 'from-orange-500 to-red-600' },
  { icon: Shield, title: 'Enterprise Security', desc: 'JWT authentication, encrypted storage, and role-based access control built-in.', color: 'from-pink-500 to-rose-600' },
  { icon: Zap, title: 'Lightning Fast', desc: 'Optimistic UI updates, streaming responses, and edge-cached assets for instant interactions.', color: 'from-yellow-500 to-orange-600' },
]

const steps = [
  { step: '01', title: 'Create your workspace', desc: 'Sign up in seconds. No credit card required. Your workspace is ready instantly.' },
  { step: '02', title: 'Connect your AI', desc: 'Pre-configured with Groq\'s Llama 3 70B. Streaming responses, no latency.' },
  { step: '03', title: 'Start building', desc: 'Chat, upload documents, manage tasks. Everything in one beautiful workspace.' },
]

const plans = [
  { name: 'Free', price: '$0', period: '/month', features: ['100 AI messages/mo', '3 documents', '50 tasks', 'Basic analytics', 'Community support'], cta: 'Start Free', popular: false },
  { name: 'Pro', price: '$19', period: '/month', features: ['Unlimited AI messages', '50 documents', 'Unlimited tasks', 'Advanced analytics', 'Priority support', 'API access'], cta: 'Start Pro', popular: true },
  { name: 'Enterprise', price: '$99', period: '/month', features: ['Everything in Pro', 'Custom AI models', 'Unlimited documents', 'Team management', 'SSO/SAML', 'SLA guarantee'], cta: 'Contact Sales', popular: false },
]

const testimonials = [
  { name: 'Sarah Chen', role: 'CTO @ Veritas Labs', avatar: 'SC', text: 'AI Workspace replaced 4 separate tools for us. The document AI is incredibly accurate.', rating: 5 },
  { name: 'Marcus Webb', role: 'Founder @ Luminary', avatar: 'MW', text: 'The UI is genuinely beautiful. My team actually wants to use it — that\'s rare for productivity tools.', rating: 5 },
  { name: 'Priya Nair', role: 'VP Eng @ Scale', avatar: 'PN', text: 'Streaming chat with code highlighting is buttery smooth. The kanban board is best-in-class.', rating: 5 },
]

const faqs = [
  { q: 'What AI models are used?', a: 'We use Groq\'s Llama 3 70B by default — one of the fastest and most capable open models available. Enterprise plans can bring custom models.' },
  { q: 'Is my data secure?', a: 'All data is encrypted at rest and in transit. We use JWT authentication, and your documents are processed in isolated containers. We never train on your data.' },
  { q: 'Can I export my data?', a: 'Yes, you can export all chats, tasks, and documents at any time in standard formats (JSON, CSV, PDF).' },
  { q: 'Is there a free trial for Pro?', a: 'The Free plan gives you enough to experience the full product. Pro plans come with a 14-day money-back guarantee.' },
  { q: 'Do you support team workspaces?', a: 'Team features are available on Enterprise. We\'re rolling out team workspaces for Pro users in Q2 2025.' },
]

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#060611] text-white overflow-x-hidden">
      {/* Nav */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-3 sm:py-4"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center glow-purple">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-sm sm:text-base gradient-text-purple">AI Workspace</span>
          </div>
          <div className="hidden md:flex items-center gap-6 sm:gap-8 text-xs sm:text-sm text-white/60">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/login" className="text-xs sm:text-sm text-white/70 hover:text-white transition-colors">
              Sign in
            </Link>
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bg-gradient-animated text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 rounded-lg animate-pulse-glow"
              >
                Get started
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 sm:pt-20">
        <ThreeBackground />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#060611]/20 to-[#060611] pointer-events-none" />

        <div className="relative z-10 text-center max-w-5xl mx-auto px-4 sm:px-6">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.1] sm:leading-[0.95] tracking-tight mb-4 sm:mb-6"
          >
            <span className="text-white">Your AI</span>
            <br />
            <span className="gradient-text">Command Center</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2"
          >
            The intelligent workspace that combines AI chat, document analysis, and task management. 
            Built for teams that move fast.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4"
          >
            <Link to="/register" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(139, 92, 246, 0.5)' }}
                whileTap={{ scale: 0.96 }}
                className="w-full sm:w-auto bg-gradient-animated text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg flex items-center justify-center gap-2 bg-size-300"
              >
                Start building free
                <ArrowRight size={20} />
              </motion.button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto glass border border-white/[0.1] text-white/80 hover:text-white font-medium px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare size={20} />
                See demo
              </motion.button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-12 sm:mt-16 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-white/40 px-4"
          >
            {['No credit card', 'Free forever plan', '500+ teams use it'].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <Check size={14} className="text-violet-400" />
                {item}
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="mt-16 sm:mt-20"
          >
            <a href="#features" className="text-white/30 flex flex-col items-center gap-2 hover:text-white/60 transition-colors">
              <span className="text-[10px] sm:text-xs tracking-widest uppercase">Explore</span>
              <ChevronDown size={20} className="animate-bounce" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-32 px-4 sm:px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#060611] via-[#0a0820] to-[#060611] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <FadeIn>
            <div className="text-center mb-12 sm:mb-20">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs sm:text-sm mb-4">
                <Layers size={14} />
                Everything you need
              </div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                One workspace.<br />
                <span className="gradient-text">Infinite possibilities.</span>
              </h2>
              <p className="text-white/50 text-base sm:text-lg max-w-xl mx-auto px-4">
                Replace your scattered tools with a single, AI-powered platform that actually learns how you work.
              </p>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map(({ icon: Icon, title, desc, color }, i) => (
              <FadeIn key={title} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="glass-premium rounded-xl sm:rounded-2xl p-4 sm:p-6 cursor-default group shimmer-effect holographic"
                >
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 glow-purple`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <h3 className="font-display font-semibold text-white mb-2 text-sm sm:text-base">{title}</h3>
                  <p className="text-white/50 text-xs sm:text-sm leading-relaxed">{desc}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-32 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12 sm:mb-20">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs sm:text-sm mb-4">
                <Zap size={14} />
                Simple by design
              </div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                Up and running in <span className="gradient-text">3 minutes</span>
              </h2>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            {steps.map(({ step, title, desc }, i) => (
              <FadeIn key={step} delay={i * 0.1}>
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <span className="font-display font-bold text-violet-400 text-sm sm:text-lg">{step}</span>
                  </div>
                  <h3 className="font-display font-semibold text-white mb-2 text-sm sm:text-base">{title}</h3>
                  <p className="text-white/50 text-xs sm:text-sm leading-relaxed px-2">{desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 sm:py-32 px-4 sm:px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/10 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <FadeIn>
            <div className="text-center mb-12 sm:mb-20">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs sm:text-sm mb-4">
                <Globe size={14} />
                Simple pricing
              </div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                Start free. <span className="gradient-text">Scale when ready.</span>
              </h2>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {plans.map(({ name, price, period, features, cta, popular }, i) => (
              <FadeIn key={name} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -4, scale: 1.01 }}
                  className={`relative rounded-xl sm:rounded-2xl p-4 sm:p-6 ${popular
                    ? 'holographic neon-border glass-premium'
                    : 'glass-premium'
                  }`}
                >
                  {popular && (
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-2 sm:-top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-500 to-blue-500 text-white text-[10px] sm:text-xs font-bold px-3 sm:px-4 py-0.5 sm:py-1 rounded-full glow-purple"
                    >
                      Most Popular
                    </motion.div>
                  )}
                  <div className="mb-4 sm:mb-6">
                    <h3 className="font-display font-bold text-white text-base sm:text-lg mb-1">{name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-3xl sm:text-4xl font-bold gradient-text">{price}</span>
                      <span className="text-white/40 text-xs sm:text-sm">{period}</span>
                    </div>
                  </div>
                  <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                    {features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-white/70">
                        <Check size={14} className="text-violet-400 flex-shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <Link to="/register">
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(139, 92, 246, 0.4)' }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-full py-2.5 sm:py-3 rounded-xl font-medium text-xs sm:text-sm transition-all ${popular
                        ? 'bg-gradient-animated text-white'
                        : 'glass border border-white/10 text-white/70 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {cta}
                    </motion.button>
                  </Link>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 sm:py-32 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12 sm:mb-20">
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                Loved by <span className="gradient-text">builders</span>
              </h2>
            </div>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {testimonials.map(({ name, role, avatar, text, rating }, i) => (
              <FadeIn key={name} delay={i * 0.1}>
                <motion.div whileHover={{ y: -4 }} className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <div className="flex mb-3 sm:mb-4">
                    {Array.from({ length: rating }).map((_, j) => (
                      <Star key={j} size={14} className="text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-white/70 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">"{text}"</p>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-violet-400 to-blue-400 flex items-center justify-center text-white text-[10px] sm:text-xs font-bold">
                      {avatar}
                    </div>
                    <div>
                      <p className="text-white text-xs sm:text-sm font-medium">{name}</p>
                      <p className="text-white/40 text-[10px] sm:text-xs">{role}</p>
                    </div>
                  </div>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 sm:py-32 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
                Frequently asked <span className="gradient-text">questions</span>
              </h2>
            </div>
          </FadeIn>
          <div className="space-y-3 sm:space-y-4">
            {faqs.map(({ q, a }, i) => (
              <FadeIn key={q} delay={i * 0.06}>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="glass-card rounded-lg sm:rounded-xl p-4 sm:p-6"
                >
                  <h3 className="font-medium text-white mb-2 text-sm sm:text-base">{q}</h3>
                  <p className="text-white/50 text-xs sm:text-sm leading-relaxed">{a}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-32 px-4 sm:px-6">
        <FadeIn>
          <div className="max-w-3xl mx-auto text-center">
            <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-12 neon-border relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-blue-500/10 pointer-events-none" />
              <div className="relative z-10">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center mx-auto mb-4 sm:mb-6 glow-purple">
                  <Sparkles size={28} className="text-white" />
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
                  Ready to build smarter?
                </h2>
                <p className="text-white/50 mb-6 sm:mb-8 max-w-lg mx-auto text-sm sm:text-base">
                  Join thousands of builders who have transformed how they work with AI Workspace.
                </p>
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.04, boxShadow: '0 0 60px rgba(139, 92, 246, 0.5)' }}
                    whileTap={{ scale: 0.96 }}
                    className="bg-gradient-animated text-white font-semibold px-6 sm:px-10 py-3 sm:py-4 rounded-xl text-base sm:text-lg flex items-center justify-center gap-2 sm:gap-3 mx-auto"
                  >
                    Start for free
                    <ArrowRight size={20} />
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 px-4 sm:px-6 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
              <Sparkles size={13} className="text-white" />
            </div>
            <span className="font-display font-bold text-xs sm:text-sm gradient-text-purple">AI Workspace</span>
          </div>
          <p className="text-white/30 text-xs sm:text-sm">© 2025 AI Workspace. All rights reserved.</p>
          <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm text-white/40">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
