'use client';

import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ArrowUpRight, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Terminal, 
  Heart, 
  MessageSquare, 
  Share2, 
  Layers, 
  TrendingUp,
  Activity,
  Maximize2,
  FileText,
  HelpCircle
} from 'lucide-react';
import { Logo } from '@/components/shared/logo';

// Mock Data for the Interactive Dashboard Preview
const ANALYTICS_DATA = {
  impressions: 142850,
  impressionsGrow: 12.4,
  engagement: 5.24,
  engagementGrow: 0.8,
  totalPosts: 42,
  history: [
    { date: 'Jun 12', impressions: 12400, engRate: 4.8, likes: 110, comments: 24 },
    { date: 'Jun 16', impressions: 18200, engRate: 5.1, likes: 145, comments: 32 },
    { date: 'Jun 20', impressions: 24800, engRate: 5.3, likes: 210, comments: 45 },
    { date: 'Jun 24', impressions: 38900, engRate: 5.8, likes: 320, comments: 64 },
    { date: 'Jun 28', impressions: 48550, engRate: 6.2, likes: 412, comments: 88 },
  ]
};

const POSTS_DATA = [
  {
    id: 1,
    text: "I spent 3 years building SaaS products. Here are the 5 lessons I learned about finding product-market fit, retaining early customers, and knowing when to pivot...",
    type: "Text-Only",
    impressions: "48.5K",
    engagement: "6.2%",
    likes: 412,
    comments: 88,
    shares: 12,
    status: "Excellent"
  },
  {
    id: 2,
    text: "How to configure Prisma middleware in a production Next.js environment for secure AES column encryption. Sharing the complete code and step-by-step setup guides below...",
    type: "Gallery/Images",
    impressions: "38.9K",
    engagement: "5.8%",
    likes: 320,
    comments: 64,
    shares: 24,
    status: "Good"
  },
  {
    id: 3,
    text: "A quick reminder for creators: Put your outbound links in the comments. The LinkedIn algorithm deprioritizes posts containing links in the body, lowering organic reach.",
    type: "Text-Only",
    impressions: "24.8K",
    engagement: "5.3%",
    likes: 210,
    comments: 45,
    shares: 8,
    status: "Average"
  }
];



export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'posts' | 'rules'>('analytics');
  const [selectedChartPoint, setSelectedChartPoint] = useState<number>(4); // default to last point
  


  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] font-sans antialiased overflow-x-hidden relative flex flex-col justify-between selection:bg-indigo-500/20 selection:text-indigo-300">
      {/* Subtle Background Textures */}
      <div className="absolute inset-0 dot-grid pointer-events-none opacity-40" />
      <div className="absolute top-[-5%] left-[10%] w-[60vw] h-[60vw] rounded-full bg-zinc-900/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-950/5 blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-6xl mx-auto px-6 py-5 flex items-center justify-between border-b border-zinc-900 relative z-10">
        <Logo />
        
        {/* Status indicator & Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-950 border border-zinc-900 font-mono text-[10px] text-zinc-500 select-none">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>SYSTEM_STATUS: OPERATIONAL</span>
          </div>
          <nav className="flex items-center gap-6 text-xs text-zinc-400 font-mono">
            <a href="#preview" className="hover:text-zinc-200 transition-colors">PROD_PREVIEW</a>
            <a href="#security" className="hover:text-zinc-200 transition-colors">SECURITY_MANIFEST</a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            href="/login" 
            className="text-xs font-mono text-zinc-400 hover:text-zinc-200 px-3 py-2 transition-colors"
          >
            SIGN_IN
          </Link>
          <Link 
            href="/signup" 
            className="text-xs font-mono bg-zinc-100 text-zinc-950 hover:bg-white hover:text-black font-semibold px-4 py-2 rounded border border-zinc-300 transition-all shadow-sm"
          >
            START_ANALYSIS
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow w-full max-w-6xl mx-auto px-6 pt-16 md:pt-24 pb-20 relative z-10">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">


          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold tracking-tight text-zinc-100 font-sans leading-[1.1] text-balance"
          >
            Fine-Grained Analytics for LinkedIn Authors.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-sm md:text-base text-zinc-400 max-w-xl leading-relaxed font-mono"
          >
            Connect your feed securely via local cookie encryption. Track true performance, audit formatting density, and optimize engagement without AI-hallucinated noise.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto font-mono text-xs"
          >
            <Link 
              href="/signup" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3.5 rounded font-bold transition-all shadow-lg shadow-indigo-500/10 group border border-indigo-700"
            >
              Analyze Your Feed
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link 
              href="/login" 
              className="w-full sm:w-auto inline-flex items-center justify-center bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white px-6 py-3.5 rounded transition-colors"
            >
              Explore Demo Dashboard
            </Link>
          </motion.div>
        </div>

        {/* SECTION: Interactive Product Preview Dashboard */}
        <section id="preview" className="mt-20 md:mt-28">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
            <div>
              <span className="text-[10px] font-mono text-indigo-400 tracking-wider uppercase block mb-1">// SYSTEM_INTERFACE</span>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-200">Interactive Console Preview</h2>
            </div>
            {/* Console Tabs */}
            <div className="inline-flex p-1 rounded-lg bg-zinc-950 border border-zinc-900 font-mono text-[10px]">
              {(['analytics', 'posts', 'rules'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded transition-all cursor-pointer capitalize font-semibold ${
                    activeTab === tab 
                      ? 'bg-zinc-900 text-indigo-400 border border-zinc-800 shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Card Container */}
          <div className="glass-panel rounded-xl border border-zinc-900 overflow-hidden shadow-2xl relative">
            {/* Panel Top bar */}
            <div className="px-4 py-3 bg-zinc-950/90 border-b border-zinc-900 flex items-center justify-between font-mono text-[10px] text-zinc-500">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-800 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-800 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-800 inline-block"></span>
                <span className="ml-2 select-none text-zinc-600">voyager_pulse_interface.log</span>
              </div>
              <div className="flex items-center gap-3">
                <span>SECURE_SESSION: ACTIVE</span>
                <Maximize2 className="h-3 w-3 text-zinc-600" />
              </div>
            </div>

            {/* Panel Content Area */}
            <div className="p-6 md:p-8 min-h-[360px] bg-zinc-950/40 relative">
              <AnimatePresence mode="wait">
                {/* TAB 1: ANALYTICS PREVIEW */}
                {activeTab === 'analytics' && (
                  <motion.div
                    key="analytics"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                  >
                    {/* Metrics Left */}
                    <div className="lg:col-span-4 flex flex-col justify-between gap-6 font-mono">
                      <div>
                        <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">TOTAL_IMPRESSIONS_30D</div>
                        <div className="text-3xl font-bold tracking-tight text-zinc-100">
                          {ANALYTICS_DATA.impressions.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-emerald-400 mt-1.5 flex items-center gap-1">
                          <span className="font-bold">▲ +{ANALYTICS_DATA.impressionsGrow}%</span>
                          <span className="text-zinc-600">VS LAST WEEK</span>
                        </div>
                      </div>

                      <div className="border-t border-zinc-900/80 pt-4">
                        <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">AVG_ENGAGEMENT_RATE</div>
                        <div className="text-3xl font-bold tracking-tight text-zinc-100">
                          {ANALYTICS_DATA.engagement}%
                        </div>
                        <div className="text-[11px] text-emerald-400 mt-1.5 flex items-center gap-1">
                          <span className="font-bold">▲ +{ANALYTICS_DATA.engagementGrow}%</span>
                          <span className="text-zinc-600">AVG REACH LEVEL</span>
                        </div>
                      </div>

                      <div className="border-t border-zinc-900/80 pt-4">
                        <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">PROCESSED_POSTS</div>
                        <div className="text-lg font-bold text-zinc-200">
                          {ANALYTICS_DATA.totalPosts} updates
                        </div>
                        <span className="text-[10px] text-zinc-600">SUPABASE CACHED</span>
                      </div>
                    </div>

                    {/* SVG Interactive Chart Right */}
                    <div className="lg:col-span-8 flex flex-col justify-between">
                      <div className="mb-4 flex items-center justify-between text-xs font-mono text-zinc-500">
                        <span>IMPRESSIONS TIMELINE (30 DAYS)</span>
                        <span className="text-indigo-400">Hover points for detailed logs</span>
                      </div>
                      
                      {/* SVG Line Graph wrapper */}
                      <div className="relative h-48 w-full bg-zinc-950 border border-zinc-900/85 rounded-lg p-4 flex items-end">
                        {/* Grid lines */}
                        <div className="absolute inset-0 flex flex-col justify-between py-4 pointer-events-none opacity-20">
                          <div className="w-full border-t border-zinc-700"></div>
                          <div className="w-full border-t border-zinc-700"></div>
                          <div className="w-full border-t border-zinc-700"></div>
                        </div>

                        {/* Interactive SVG */}
                        <svg className="w-full h-full" viewBox="0 0 540 140" preserveAspectRatio="none">
                          {/* Animated line path */}
                          <motion.path
                            d="M 20 120 L 140 100 L 260 80 L 380 50 L 500 20"
                            fill="none"
                            stroke="#4f46e5" /* indigo-600 */
                            strokeWidth="2.5"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                          {/* Shadow fill path */}
                          <path
                            d="M 20 120 L 140 100 L 260 80 L 380 50 L 500 20 L 500 140 L 20 140 Z"
                            fill="url(#chart-grad)"
                            opacity="0.08"
                          />
                          <defs>
                            <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#4f46e5" />
                              <stop offset="100%" stopColor="#000000" />
                            </linearGradient>
                          </defs>
                        </svg>

                        {/* Point triggers */}
                        <div className="absolute inset-0 flex justify-between px-[20px] pt-4 items-end">
                          {ANALYTICS_DATA.history.map((pt, i) => (
                            <button
                              key={pt.date}
                              onMouseEnter={() => setSelectedChartPoint(i)}
                              onClick={() => setSelectedChartPoint(i)}
                              className="relative flex flex-col items-center justify-end h-full group focus:outline-none z-10 cursor-pointer"
                              style={{ width: '60px' }}
                            >
                              {/* Hover Indicator point */}
                              <div className={`w-3 h-3 rounded-full border-2 border-zinc-950 transition-all ${
                                selectedChartPoint === i 
                                  ? 'bg-indigo-500 scale-125 ring-4 ring-indigo-500/10' 
                                  : 'bg-zinc-700 group-hover:bg-zinc-400 group-hover:scale-110'
                              }`} 
                              style={{ marginBottom: `${140 - (120 - i*25) - 36}px` }} // alignment helper
                              />
                              <span className="font-mono text-[9px] text-zinc-600 mt-2 select-none">{pt.date}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Selected Point Metadata card */}
                      <div className="mt-4 p-3 bg-zinc-950 border border-zinc-900/60 rounded flex items-center justify-between font-mono text-[10px] text-zinc-400">
                        <div className="flex items-center gap-3">
                          <span className="text-zinc-600">DATE:</span>
                          <span className="text-zinc-200 font-bold">{ANALYTICS_DATA.history[selectedChartPoint].date}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-zinc-600">IMPRESSIONS:</span>
                          <span className="text-indigo-400 font-bold">{ANALYTICS_DATA.history[selectedChartPoint].impressions.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-zinc-600">ENG_RATE:</span>
                          <span className="text-zinc-200 font-bold">{ANALYTICS_DATA.history[selectedChartPoint].engRate}%</span>
                        </div>
                        <div className="hidden sm:flex items-center gap-3">
                          <span className="text-zinc-600">LIKES:</span>
                          <span className="text-zinc-300">{ANALYTICS_DATA.history[selectedChartPoint].likes}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* TAB 2: POSTS LIST PREVIEW */}
                {activeTab === 'posts' && (
                  <motion.div
                    key="posts"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="text-xs font-mono text-zinc-500 mb-2">RECENT_POSTS_PERFORMANCE</div>
                    {POSTS_DATA.map((post) => (
                      <div 
                        key={post.id} 
                        className="p-4 bg-zinc-950 border border-zinc-900 rounded-lg hover:border-zinc-800 transition-colors flex flex-col md:flex-row gap-4 justify-between items-start md:items-center"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-mono text-zinc-400">{post.type}</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                              post.status === 'Excellent' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              post.status === 'Good' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                              'bg-zinc-800 text-zinc-400 border border-zinc-700'
                            }`}>{post.status}</span>
                          </div>
                          <p className="text-xs text-zinc-300 truncate md:max-w-2xl">{post.text}</p>
                        </div>

                        {/* Interactive Engagement stats pill */}
                        <div className="flex items-center gap-6 font-mono text-[10px] text-zinc-500 shrink-0 w-full md:w-auto pt-2 md:pt-0 border-t md:border-0 border-zinc-900">
                          <div>
                            <span className="text-zinc-600 block text-[9px]">IMPRESSIONS</span>
                            <span className="text-zinc-200 font-bold">{post.impressions}</span>
                          </div>
                          <div>
                            <span className="text-zinc-600 block text-[9px]">ENGAGEMENT</span>
                            <span className="text-indigo-400 font-bold">{post.engagement}</span>
                          </div>
                          <div className="flex items-center gap-3 text-zinc-400">
                            <span className="flex items-center gap-1"><Heart className="h-3 w-3 text-zinc-600" /> {post.likes}</span>
                            <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3 text-zinc-600" /> {post.comments}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {/* TAB 3: RULES CHECKLIST PREVIEW */}
                {activeTab === 'rules' && (
                  <motion.div
                    key="rules"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    <div className="space-y-4">
                      <div className="text-xs font-mono text-zinc-500">// ALGORITHMIC_HEALTH_CHECKS</div>
                      <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-lg flex items-start gap-3">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-mono font-bold text-zinc-200">First-Line Hook Audit</h4>
                          <p className="text-[11px] text-zinc-400 mt-1">Keeps introductory hooks under 100 characters so they display cleanly on mobile feeds before truncation.</p>
                        </div>
                      </div>
                      <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-lg flex items-start gap-3">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-mono font-bold text-zinc-200">Line Break Spacing Audit</h4>
                          <p className="text-[11px] text-zinc-400 mt-1">Parses double space parameters between text clusters to prevent high-density reading fatigue.</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="text-xs font-mono text-zinc-500">// OUTBOUND_REFERRAL_AUDIT</div>
                      <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-lg flex items-start gap-3">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-mono font-bold text-zinc-200">Outbound Link Isolation</h4>
                          <p className="text-[11px] text-zinc-400 mt-1">Scans core body text for redirects. Warns you if you write a link in the body, which reduces reach weight.</p>
                        </div>
                      </div>
                      <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-lg flex items-start gap-3">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-mono font-bold text-zinc-200">Tag Density Inspector</h4>
                          <p className="text-[11px] text-zinc-400 mt-1">Checks if total hashtags exceed 5. LinkedIn algorithms flag multiple hashtags as promotional spam.</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* SECTION: Cryptographic Safety / AES-256-GCM Visualization */}
        <section id="security" className="mt-28 md:mt-36 border-t border-zinc-900 pt-20">
          <div className="max-w-2xl mb-12">
            <span className="text-[10px] font-mono text-indigo-400 tracking-wider uppercase block mb-1">// CRYPTOGRAPHIC_SECURITY_MANIFEST</span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-100">Zero-Plaintext Cookie Ingestion</h2>
            <p className="mt-4 text-xs md:text-sm font-mono text-zinc-400 leading-relaxed">
              Plaintext credentials never touch persistent tables. To interact with LinkedIn's internal GraphQL endpoint, VoyagerPulse encrypts keys at rest and clears memory heaps immediately.
            </p>
          </div>

          {/* Animated Pipeline Flowchart */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            
            {/* Step 1 */}
            <div className="glass-panel p-5 rounded-lg border border-zinc-900 flex flex-col justify-between relative bg-zinc-950/20">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[9px] text-zinc-500">STEP_01</span>
                  <Lock className="h-4 w-4 text-zinc-500" />
                </div>
                <h3 className="text-xs font-mono font-bold text-zinc-200">Session Cookie Input</h3>
                <p className="text-[11px] text-zinc-400 mt-2 font-mono">You input session credentials (`li_at` & `JSESSIONID`) locally via HTTPS.</p>
              </div>
              <div className="border-t border-zinc-900 pt-3 mt-4 text-[9px] font-mono text-zinc-600">CLIENT_TO_SERVER</div>
            </div>

            {/* Step 2 */}
            <div className="glass-panel p-5 rounded-lg border border-zinc-900 flex flex-col justify-between relative bg-zinc-950/20">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[9px] text-zinc-500">STEP_02</span>
                  <ShieldCheck className="h-4 w-4 text-indigo-400" />
                </div>
                <h3 className="text-xs font-mono font-bold text-zinc-200">AES-256-GCM Encryption</h3>
                <p className="text-[11px] text-zinc-400 mt-2 font-mono">Server encrypts values symmetrically with unique GCM auth tags prior to database writes.</p>
              </div>
              <div className="border-t border-zinc-900 pt-3 mt-4 text-[9px] font-mono text-zinc-600">CIPHERTEXT_OUTPUT</div>
            </div>

            {/* Step 3 */}
            <div className="glass-panel p-5 rounded-lg border border-zinc-900 flex flex-col justify-between relative bg-zinc-950/20">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[9px] text-zinc-500">STEP_03</span>
                  <Layers className="h-4 w-4 text-zinc-500" />
                </div>
                <h3 className="text-xs font-mono font-bold text-zinc-200">PostgreSQL Cache</h3>
                <p className="text-[11px] text-zinc-400 mt-2 font-mono">Only ciphertext is saved in database tables. Row-Level Security (RLS) restricts access to your UUID.</p>
              </div>
              <div className="border-t border-zinc-900 pt-3 mt-4 text-[9px] font-mono text-zinc-600">DB_PERSISTED</div>
            </div>

            {/* Step 4 */}
            <div className="glass-panel p-5 rounded-lg border border-zinc-900 flex flex-col justify-between relative bg-zinc-950/20">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[9px] text-zinc-500">STEP_04</span>
                  <Activity className="h-4 w-4 text-emerald-400" />
                </div>
                <h3 className="text-xs font-mono font-bold text-zinc-200">API Query & Heap Wipe</h3>
                <p className="text-[11px] text-zinc-400 mt-2 font-mono">Decrypted in memory temporarily to request Voyager data. Memory buffers wiped immediately.</p>
              </div>
              <div className="border-t border-zinc-900 pt-3 mt-4 text-[9px] font-mono text-zinc-600">ZERO_PERSISTENCE</div>
            </div>
          </div>
        </section>



        {/* SECTION: Features Grid */}
        <section className="mt-28 md:mt-36 border-t border-zinc-900 pt-20">
          <div className="max-w-2xl mb-12">
            <span className="text-[10px] font-mono text-indigo-400 tracking-wider uppercase block mb-1">// PLATFORM_ARCHITECTURE</span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-100">Engineered for Performance</h2>
            <p className="mt-4 text-xs md:text-sm font-mono text-zinc-400 leading-relaxed">
              VoyagerPulse runs on a modern, high-performance stack designed to process and store your analytics data efficiently and securely.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-zinc-950/20 border border-zinc-900 rounded-lg hover:border-zinc-800 transition-colors group">
              <div className="h-8 w-8 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 text-indigo-400 font-mono text-xs group-hover:border-zinc-700">01</div>
              <h3 className="text-sm font-semibold text-zinc-200 font-mono">Supabase SQL Storage</h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Relational tracking. Cache reaction breakdowns, shares, character counts, and views locally with optimized database structures.
              </p>
            </div>
            <div className="p-6 bg-zinc-950/20 border border-zinc-900 rounded-lg hover:border-zinc-800 transition-colors group">
              <div className="h-8 w-8 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 text-indigo-400 font-mono text-xs group-hover:border-zinc-700">02</div>
              <h3 className="text-sm font-semibold text-zinc-200 font-mono">High-Fidelity Recharts</h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Visualize trend velocities. Inspect likes-to-comments distributions and hashtag reach using interactive React visual charts.
              </p>
            </div>
            <div className="p-6 bg-zinc-950/20 border border-zinc-900 rounded-lg hover:border-zinc-800 transition-colors group">
              <div className="h-8 w-8 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 text-indigo-400 font-mono text-xs group-hover:border-zinc-700">03</div>
              <h3 className="text-sm font-semibold text-zinc-200 font-mono">No AI Hype. Just Data.</h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                No hallucinating bots or generative clutter. We parse structures deterministically based on verified engineering rules that optimize reach.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION: Final CTA */}
        <section className="mt-28 md:mt-36 border-t border-zinc-900 pt-20 pb-12 text-center max-w-xl mx-auto">
          <span className="text-[10px] font-mono text-indigo-400 tracking-wider uppercase block mb-2">// GET_STARTED</span>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-100">Ready to audit your reach?</h2>
          <p className="mt-4 text-xs font-mono text-zinc-400 leading-relaxed">
            Connect your feed securely and get instant access to your post analytics, engagement rates, and format optimizations.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 font-mono text-xs">
            <Link 
              href="/signup" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3.5 rounded font-bold transition-all shadow-lg shadow-indigo-500/10 group border border-indigo-700"
            >
              Start Free Analysis
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link 
              href="/login" 
              className="w-full sm:w-auto inline-flex items-center justify-center bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white px-6 py-3.5 rounded transition-colors"
            >
              Explore Demo
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-8 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between text-[10px] font-mono text-zinc-500 relative z-10 gap-4 mt-12">
        <div>
          © 2026 VOYAGERPULSE. SECURED WITH AES-256-GCM.
        </div>
      </footer>
    </div>
  );
}
