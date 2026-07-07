'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell 
} from 'recharts';
import { 
  Sparkles, 
  Lightbulb, 
  TrendingUp, 
  Hashtag, 
  Calendar,
  AlertTriangle,
  HelpCircle,
  FileText
} from 'lucide-react';
import { AnalyticsInsightsData } from '@/types';

interface SummaryData {
  postsCount: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalImpressions: number;
  averageLikes: number;
  averageComments: number;
  averageShares: number;
  averageImpressions: number;
  averageEngagementRate: number;
  topHashtags: any;
  topMentions: any;
  insights: AnalyticsInsightsData | null;
}

interface TimelineItem {
  index: number;
  postedRelative: string;
  likes: number;
  comments: number;
  shares: number;
  impressions: number;
  engagement: number;
  rate: number;
}

interface TypeBreakdownItem {
  type: string;
  count: number;
  avgLikes: number;
  avgComments: number;
  avgImpressions: number;
  avgEngagement: number;
}

interface AnalyticsClientProps {
  initialSummary: SummaryData | null;
  initialTimeline: TimelineItem[];
  initialTypeBreakdown: TypeBreakdownItem[];
  initialHasCookies: boolean;
  initialHasSynced: boolean;
}

export default function AnalyticsClient({
  initialSummary,
  initialTimeline,
  initialTypeBreakdown,
  initialHasCookies,
  initialHasSynced,
}: AnalyticsClientProps) {
  const [summary, setSummary] = useState<SummaryData | null>(initialSummary);
  const [timeline, setTimeline] = useState<TimelineItem[]>(initialTimeline);
  const [typeBreakdown, setTypeBreakdown] = useState<TypeBreakdownItem[]>(initialTypeBreakdown);
  const [hasCookies, setHasCookies] = useState(initialHasCookies);
  const [hasSynced, setHasSynced] = useState(initialHasSynced);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (loading) {
    return (
      <div className="space-y-10 animate-pulse">
        <div className="h-10 w-48 bg-zinc-800 rounded-lg"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-96 bg-zinc-800 rounded-2xl"></div>
          <div className="h-96 bg-zinc-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const hasData = summary && summary.postsCount > 0;
  const insights = summary?.insights;

  // Colors for Recharts
  const indigoColor = '#6366f1';
  const blueColor = '#3b82f6';
  const colorsArray = ['#6366f1', '#3b82f6', '#10b981', '#ec4899', '#3b82f6'];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400">
          LinkedIn Analytics
        </h1>
        <p className="text-zinc-400 text-sm mt-1">Deep-dive visual representation of content metrics and behavior</p>
      </div>

      {!hasData ? (
        <div className="glass-panel p-16 rounded-2xl text-center flex flex-col items-center justify-center border border-dashed border-white/10 max-w-2xl mx-auto mt-12">
          <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
            <TrendingUp className="h-7 w-7 text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold">
            {hasCookies ? "No posts found to analyze" : "No analytics data available"}
          </h2>
          <p className="text-sm text-zinc-400 max-w-sm mt-2 leading-relaxed">
            {hasCookies 
              ? "We successfully connected to your LinkedIn account, but you haven't published any posts yet. Publish an update on LinkedIn and run a data sync in Settings."
              : "Please configure cookies in settings first to render interactive timelines and custom engagement reports."}
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            {hasCookies ? (
              <Link
                href="/settings"
                className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Go to Settings & Sync
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Timeline area chart */}
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-6">Engagement Score Over Time</h3>
              <div className="h-72 w-full">
                {mounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeline}>
                      <defs>
                        <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={indigoColor} stopOpacity={0.2}/>
                          <stop offset="95%" stopColor={indigoColor} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="index" stroke="#52525b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#52525b" fontSize={10} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ background: '#09090b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                        labelFormatter={(value) => `Post #${value}`}
                      />
                      <Area type="monotone" dataKey="engagement" stroke={indigoColor} strokeWidth={2} fillOpacity={1} fill="url(#colorEngagement)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Content format breakdown */}
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-6">Avg Engagement by Content Type</h3>
              <div className="h-72 w-full">
                {mounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={typeBreakdown}>
                      <XAxis dataKey="type" stroke="#52525b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#52525b" fontSize={10} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ background: '#09090b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                      />
                      <Bar dataKey="avgEngagement" radius={[4, 4, 0, 0]}>
                        {typeBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={colorsArray[index % colorsArray.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Hashtag analytics bar chart */}
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-6">Top Hashtags by Engagement</h3>
              <div className="h-72 w-full">
                {mounted && insights && (insights as any).bestHashtags?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="layout" data={(insights as any).bestHashtags}>
                      <XAxis type="number" stroke="#52525b" fontSize={10} tickLine={false} />
                      <YAxis type="category" dataKey="hashtag" stroke="#52525b" fontSize={10} tickLine={false} width={80} />
                      <Tooltip 
                        contentStyle={{ background: '#09090b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                      />
                      <Bar dataKey="avgEngagement" fill={blueColor} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-zinc-600">No hashtags parsed from text.</div>
                )}
              </div>
            </div>

            {/* Impressions Timeline */}
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-6">Impressions timeline</h3>
              <div className="h-72 w-full">
                {mounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeline}>
                      <defs>
                        <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={blueColor} stopOpacity={0.2}/>
                          <stop offset="95%" stopColor={blueColor} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="index" stroke="#52525b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#52525b" fontSize={10} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ background: '#09090b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                      />
                      <Area type="monotone" dataKey="impressions" stroke={blueColor} strokeWidth={2} fillOpacity={1} fill="url(#colorImpressions)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

          </div>

          {/* Content Insights & Rule Recommendations Panels */}
          {insights && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Key Heuristics */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-400" />
                  <h3 className="text-lg font-bold text-white">Advanced Content Insights</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Style Recommendation Card */}
                  <div className="glass-panel p-6 rounded-2xl border-l-4 border-indigo-500">
                    <span className="text-[10px] font-semibold font-mono text-indigo-400 uppercase tracking-wide">BEST POSTING STYLE</span>
                    <h4 className="text-base font-bold text-white mt-1">{insights.bestPostingStyle.title}</h4>
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{insights.bestPostingStyle.description}</p>
                    <span className="mt-4 inline-flex items-center text-[10px] bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded font-mono font-medium">IMPACT: {insights.bestPostingStyle.impact}</span>
                  </div>

                  {/* Format Card */}
                  <div className="glass-panel p-6 rounded-2xl border-l-4 border-blue-500">
                    <span className="text-[10px] font-semibold font-mono text-blue-400 uppercase tracking-wide">TOP PERFORMING CONTENT FORMAT</span>
                    <h4 className="text-base font-bold text-white mt-1">{insights.topPerformingContentType.type}</h4>
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{insights.topPerformingContentType.description}</p>
                    <span className="mt-4 inline-flex items-center text-[10px] bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded font-mono font-medium">AVG ENTR: {insights.topPerformingContentType.avgEngagement}</span>
                  </div>
                </div>

                {/* Recommendations timeline bullets */}
                <div className="glass-panel p-6 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4.5 w-4.5 text-blue-400" />
                    <h4 className="text-sm font-semibold text-white">Actionable Recommendations</h4>
                  </div>
                  <ul className="space-y-3">
                    {insights.postingRecommendations.map((rec, i) => (
                      <li key={i} className="text-xs text-zinc-300 flex items-start gap-2.5 leading-relaxed">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Column: Topics & Performance Flaws */}
              <div className="space-y-8">
                {/* Most engaging topics parsed */}
                <div className="glass-panel p-6 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4.5 w-4.5 text-indigo-400" />
                    <h4 className="text-sm font-semibold text-white">Most Engaging Topics</h4>
                  </div>
                  <div className="space-y-3.5">
                    {insights.mostEngagingTopics?.map((topic, i) => (
                      <div key={i} className="flex justify-between items-center text-xs">
                        <span className="text-zinc-300 font-medium">"{topic.topic}"</span>
                        <div className="flex items-center gap-2 font-mono text-[10px]">
                          <span className="text-zinc-500">x{topic.count} freq</span>
                          <span className="text-indigo-400 font-semibold">{topic.weight} score</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weakest Performing Posts flaws */}
                <div className="glass-panel p-6 rounded-2xl border-l-4 border-red-500/60 space-y-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4.5 w-4.5 text-red-400" />
                    <h4 className="text-sm font-semibold text-white">Weakest Performance Factors</h4>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {insights.weakestPerformingPosts.description}
                  </p>
                  <ul className="space-y-2.5">
                    {insights.weakestPerformingPosts.commonFactors.map((factor, i) => (
                      <li key={i} className="text-[11px] text-zinc-300 flex items-center gap-2 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500/50 shrink-0" />
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
}
