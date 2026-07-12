'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  ThumbsUp, 
  Share2, 
  Eye, 
  Sparkles, 
  Copy, 
  ExternalLink, 
  RefreshCw,
  Award
} from 'lucide-react';

interface OverviewData {
  totalPosts: number;
  averageEngagement: number;
  averageLikes: number;
  averageComments: number;
  averageShares: number;
  averageImpressions: number;
  bestPostUrn: string | null;
  bestPostText: string | null;
  bestPostLikes: number;
  bestPostComments: number;
}

interface PostData {
  id: string;
  activityUrn: string;
  text: string | null;
  postUrl: string | null;
  postedRelative: string | null;
  numLikes: number;
  numComments: number;
  numShares: number;
  numImpressions: number;
  engagementScore: number;
  engagementRate: number;
  rank: number;
}

interface ProfileData {
  fullName: string;
  occupation: string | null;
  profileUrl: string | null;
  avatarUrl: string | null;
}

interface DashboardClientProps {
  initialProfile: ProfileData | null;
  initialOverview: OverviewData | null;
  initialBestPosts: PostData[];
  initialUserEmail: string;
  initialHasCookies: boolean;
  initialHasSynced: boolean;
}

export default function DashboardClient({
  initialProfile,
  initialOverview,
  initialBestPosts,
  initialUserEmail,
  initialHasCookies,
  initialHasSynced,
}: DashboardClientProps) {
  const [profile, setProfile] = useState<ProfileData | null>(initialProfile);
  const [overview, setOverview] = useState<OverviewData | null>(initialOverview);
  const [bestPosts, setBestPosts] = useState<PostData[]>(initialBestPosts);
  const [userEmail, setUserEmail] = useState(initialUserEmail);
  const [hasCookies, setHasCookies] = useState(initialHasCookies);
  const [hasSynced, setHasSynced] = useState(initialHasSynced);
  
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function fetchDashboardData() {
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
        setOverview(data.overview);
        setBestPosts(data.bestPosts);
        setUserEmail(data.email || '');
        setHasCookies(data.hasCookies);
        setHasSynced(data.hasSynced);
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSyncDemo = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed: true }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchDashboardData();
        window.dispatchEvent(new Event('profile-updated'));
      }
    } catch (err) {
      console.error('Failed to seed demo data', err);
    } finally {
      setSyncing(false);
    }
  };

  const handleCopyText = (text: string | null, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-10 animate-pulse">
        <div className="h-10 w-48 bg-zinc-800 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-zinc-800 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-zinc-800 rounded-2xl"></div>
          <div className="h-96 bg-zinc-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const hasData = overview && overview.totalPosts > 0;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400">
            Creator Dashboard
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Real-time pulse of your LinkedIn organic feed</p>
        </div>

        <div className="flex items-center gap-3">
          {userEmail === 'demo@voyagerpulse.com' && (
            <button
              onClick={handleSyncDemo}
              disabled={syncing}
              className="inline-flex items-center gap-2 border border-white/10 hover:border-white/20 disabled:border-zinc-800 bg-zinc-950 hover:bg-zinc-900 disabled:bg-black px-4.5 py-2.5 rounded-xl text-sm font-medium transition-all text-zinc-300 hover:text-white cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin text-indigo-400' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Demo Data'}
            </button>
          )}
          
          {profile ? (
            <Link
              href="/settings"
              className="inline-flex items-center gap-3 bg-zinc-900 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.fullName} className="w-8 h-8 rounded-full border border-white/10" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-white/10">
                  {profile.fullName.charAt(0)}
                </div>
              )}
              <div className="flex flex-col pr-2">
                <span className="text-sm font-medium text-white leading-tight">{profile.fullName}</span>
                {profile.occupation && (
                  <span className="text-[10px] text-zinc-400 line-clamp-1 max-w-[150px]">{profile.occupation}</span>
                )}
              </div>
            </Link>
          ) : (
            <Link
              href="/settings"
              className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white px-4.5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-500/10 cursor-pointer"
            >
              Connect LinkedIn
            </Link>
          )}
        </div>
      </div>

      {!hasData ? (
        /* Empty State */
        <div className="glass-panel p-16 rounded-2xl text-center flex flex-col items-center justify-center border border-dashed border-white/10 max-w-2xl mx-auto mt-12">
          <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
            <Sparkles className="h-7 w-7 text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold">
            {hasCookies && hasSynced ? "No posts found on this account" : "No LinkedIn insights found"}
          </h2>
          <p className="text-sm text-zinc-400 max-w-sm mt-2 leading-relaxed">
            {hasCookies && hasSynced 
              ? "We successfully connected to your LinkedIn account, but you haven't published any posts yet. Publish an update on LinkedIn and trigger sync."
              : "Connect your LinkedIn voyager session cookies in settings to retrieve and analyze your actual LinkedIn feed data."}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
            {userEmail === 'demo@voyagerpulse.com' && (
              <button
                onClick={handleSyncDemo}
                disabled={syncing}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-black hover:bg-zinc-200 px-6 py-3 rounded-xl font-medium transition-colors cursor-pointer"
              >
                <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                Seed Demo Analytics
              </button>
            )}
            <Link
              href="/settings"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Configure Credentials
            </Link>
          </div>
        </div>
      ) : (
        /* Core Dashboard Contents */
        <div className="space-y-10">
          
          {/* Key Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Posts */}
            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Total Posts</span>
                <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                  <Award className="h-4 w-4 text-indigo-400" />
                </div>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white">{overview.totalPosts}</h2>
              <p className="text-[10px] text-zinc-500 mt-2">Active tracked updates</p>
            </div>

            {/* Average Engagement */}
            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Avg Engagement Rate</span>
                <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                  <TrendingUp className="h-4 w-4 text-indigo-400" />
                </div>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white">{overview.averageEngagement}%</h2>
              <p className="text-[10px] text-zinc-500 mt-2">Per impression reach</p>
            </div>

            {/* Best Performing Post */}
            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group lg:col-span-2">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Best Performing Post</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded font-mono font-medium">RANK #1</span>
              </div>
              <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed mb-4">
                "{overview.bestPostText || 'Syncing content details...'}"
              </p>
              <div className="flex items-center gap-6 text-[10px] font-mono text-zinc-500">
                <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3 text-zinc-400" /> {overview.bestPostLikes} Likes</span>
                <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3 text-zinc-400" /> {overview.bestPostComments} Comments</span>
              </div>
            </div>
          </div>

          {/* Average Averages */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="glass-panel p-5 rounded-xl border border-white/5 bg-zinc-950/20 text-center">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">Avg Likes</span>
              <span className="text-xl font-bold text-white">{Math.round(overview.averageLikes)}</span>
            </div>
            <div className="glass-panel p-5 rounded-xl border border-white/5 bg-zinc-950/20 text-center">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">Avg Comments</span>
              <span className="text-xl font-bold text-white">{Math.round(overview.averageComments)}</span>
            </div>
            <div className="glass-panel p-5 rounded-xl border border-white/5 bg-zinc-950/20 text-center">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">Avg Shares</span>
              <span className="text-xl font-bold text-white">{Math.round(overview.averageShares)}</span>
            </div>
            <div className="glass-panel p-5 rounded-xl border border-white/5 bg-zinc-950/20 text-center">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">Avg Impressions</span>
              <span className="text-xl font-bold text-white">{Math.round(overview.averageImpressions)}</span>
            </div>
          </div>

          {/* Best Performing Posts Cards Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Top Performing Content</h2>
              <p className="text-xs text-zinc-400 mt-1">High engagement organic posts details</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {bestPosts.map((post, idx) => (
                <div key={post.id} className="glass-panel p-6 rounded-2xl flex flex-col justify-between hover:border-white/15 transition-colors relative group">
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full px-2.5 py-0.5 text-[10px] font-mono font-semibold">
                    RANK {idx + 1}
                  </div>
                  
                  <div>
                    <span className="text-[10px] font-semibold text-zinc-500 font-mono">{post.postedRelative || 'Recent'}</span>
                    <p className="text-sm text-zinc-200 leading-relaxed line-clamp-5 mt-3 mb-6">
                      "{post.text}"
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Performance metrics breakdown */}
                    <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-4 text-center">
                      <div>
                        <span className="block text-[9px] text-zinc-500 font-mono uppercase">Likes</span>
                        <span className="text-xs font-semibold text-white">{post.numLikes}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-zinc-500 font-mono uppercase">Comments</span>
                        <span className="text-xs font-semibold text-white">{post.numComments}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-zinc-500 font-mono uppercase">Er %</span>
                        <span className="text-xs font-semibold text-indigo-400 font-mono">{post.engagementRate}%</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 w-full pt-1">
                      <button
                        onClick={() => handleCopyText(post.text, post.id)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-[10px] font-medium py-2 rounded-lg text-zinc-300 hover:text-white transition-colors cursor-pointer"
                      >
                        <Copy className="h-3 w-3" />
                        {copiedId === post.id ? 'Copied!' : 'Copy Post'}
                      </button>
                      {post.postUrl && (
                        <a
                          href={post.postUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-[10px] font-medium py-2 rounded-lg text-white transition-colors text-center"
                        >
                          LinkedIn <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
