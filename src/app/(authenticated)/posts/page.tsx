'use client';

import { useEffect, useState } from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  ExternalLink, 
  ArrowUpDown,
  Filter
} from 'lucide-react';

interface PostRecord {
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
  postType: string;
  hashtags: string[];
}

export default function PostsPage() {
  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [search, setSearch] = useState('');
  const [postType, setPostType] = useState('all');
  const [sortBy, setSortBy] = useState('engagementScore');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState(true);

  const [hasCookies, setHasCookies] = useState(false);
  const [hasSynced, setHasSynced] = useState(false);

  async function fetchPosts() {
    setLoading(true);
    try {
      const url = `/api/posts?search=${encodeURIComponent(search)}&postType=${postType}&sortBy=${sortBy}&order=${order}&page=${page}&limit=10`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts);
        setTotalPages(data.pagination.totalPages);
        setTotalPosts(data.pagination.total);
        setHasCookies(!!data.hasCookies);
        setHasSynced(!!data.hasSynced);
      }
    } catch (err) {
      console.error('Failed to load posts feed', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPosts();
  }, [page, postType, sortBy, order]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPosts();
  };

  const handleToggleSort = (field: string) => {
    if (sortBy === field) {
      setOrder(order === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setOrder('desc');
    }
    setPage(1);
  };

  // Convert post records to CSV file and download
  const handleExportCSV = () => {
    if (posts.length === 0) return;
    
    // Define headers
    const headers = ['Rank', 'Activity URN', 'Preview Text', 'Type', 'Likes', 'Comments', 'Shares', 'Impressions', 'Engagement Score', 'Engagement Rate %', 'Post URL'];
    
    // Map records to rows
    const rows = posts.map(post => [
      post.activityUrn, // Or post.rank
      `"${(post.text || '').replace(/"/g, '""').substring(0, 150)}..."`,
      post.postType,
      post.numLikes,
      post.numComments,
      post.numShares,
      post.numImpressions,
      post.engagementScore,
      post.engagementRate,
      post.postUrl || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `linkedin_posts_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400">
            Posts Catalog
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Detailed records, sorting, searching, and exports</p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={posts.length === 0}
          className="inline-flex items-center justify-center gap-2 border border-white/10 hover:border-white/20 disabled:border-zinc-800 bg-zinc-950 hover:bg-zinc-900 px-4.5 py-2.5 rounded-xl text-sm font-medium transition-all text-zinc-300 hover:text-white cursor-pointer"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Filter panel */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center bg-zinc-950/80 border border-white/10 rounded-xl px-3.5 py-2 w-full md:max-w-md">
          <Search className="h-4 w-4 text-zinc-500 shrink-0" />
          <input 
            type="text" 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search keywords or hashtags..."
            className="w-full bg-transparent text-sm placeholder-zinc-600 outline-none border-none ml-2 text-white"
          />
          <button type="submit" className="hidden">Submit</button>
        </form>

        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-zinc-500" />
            <select
              value={postType}
              onChange={e => { setPostType(e.target.value); setPage(1); }}
              className="bg-zinc-950 border border-white/10 text-xs rounded-xl px-3 py-2 text-zinc-300 outline-none focus:border-indigo-500/50"
            >
              <option value="all">All Content Formats</option>
              <option value="Short text">Short updates</option>
              <option value="Media Rich">Media Rich</option>
              <option value="Long-form Text">Long-form Narratives</option>
              <option value="Link Share">Link Shares</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01] text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono">
                <th className="px-6 py-4.5">Post Preview</th>
                <th className="px-6 py-4.5 cursor-pointer hover:bg-white/5" onClick={() => handleToggleSort('postType')}>
                  <div className="flex items-center gap-1.5">Type <ArrowUpDown className="h-3 w-3" /></div>
                </th>
                <th className="px-6 py-4.5 cursor-pointer hover:bg-white/5" onClick={() => handleToggleSort('numLikes')}>
                  <div className="flex items-center gap-1.5">Likes <ArrowUpDown className="h-3 w-3" /></div>
                </th>
                <th className="px-6 py-4.5 cursor-pointer hover:bg-white/5" onClick={() => handleToggleSort('numComments')}>
                  <div className="flex items-center gap-1.5">Comments <ArrowUpDown className="h-3 w-3" /></div>
                </th>
                <th className="px-6 py-4.5 cursor-pointer hover:bg-white/5" onClick={() => handleToggleSort('numImpressions')}>
                  <div className="flex items-center gap-1.5">Views <ArrowUpDown className="h-3 w-3" /></div>
                </th>
                <th className="px-6 py-4.5 cursor-pointer hover:bg-white/5" onClick={() => handleToggleSort('engagementScore')}>
                  <div className="flex items-center gap-1.5">Score <ArrowUpDown className="h-3 w-3" /></div>
                </th>
                <th className="px-6 py-4.5 cursor-pointer hover:bg-white/5" onClick={() => handleToggleSort('engagementRate')}>
                  <div className="flex items-center gap-1.5">ER % <ArrowUpDown className="h-3 w-3" /></div>
                </th>
                <th className="px-6 py-4.5">Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [...Array(5)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-6"><div className="h-4 w-64 bg-zinc-800 rounded"></div></td>
                    <td className="px-6 py-6"><div className="h-4 w-16 bg-zinc-800 rounded"></div></td>
                    <td className="px-6 py-6"><div className="h-4 w-8 bg-zinc-800 rounded"></div></td>
                    <td className="px-6 py-6"><div className="h-4 w-8 bg-zinc-800 rounded"></div></td>
                    <td className="px-6 py-6"><div className="h-4 w-12 bg-zinc-800 rounded"></div></td>
                    <td className="px-6 py-6"><div className="h-4 w-8 bg-zinc-800 rounded"></div></td>
                    <td className="px-6 py-6"><div className="h-4 w-8 bg-zinc-800 rounded"></div></td>
                    <td className="px-6 py-6"><div className="h-4 w-4 bg-zinc-800 rounded"></div></td>
                  </tr>
                ))
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-zinc-500 font-medium">
                    {search || postType !== 'all' 
                      ? "No posts matched filter parameters."
                      : hasCookies 
                        ? "No posts found. Sync your data to retrieve LinkedIn updates."
                        : "Connect your LinkedIn cookies in Settings to view recent posts."
                    }
                  </td>
                </tr>
              ) : (
                posts.map(post => (
                  <tr key={post.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-4.5 max-w-xs md:max-w-md">
                      <p className="text-zinc-200 line-clamp-2 leading-relaxed">{post.text}</p>
                      <span className="text-[10px] text-zinc-500 block mt-1.5 font-mono">{post.postedRelative || 'Recent'}</span>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className="inline-flex text-[10px] font-medium bg-zinc-900 border border-white/10 text-zinc-400 rounded-full px-2.5 py-0.5">{post.postType}</span>
                    </td>
                    <td className="px-6 py-4.5 text-zinc-300 font-mono">{post.numLikes}</td>
                    <td className="px-6 py-4.5 text-zinc-300 font-mono">{post.numComments}</td>
                    <td className="px-6 py-4.5 text-zinc-300 font-mono">{post.numImpressions.toLocaleString()}</td>
                    <td className="px-6 py-4.5 text-white font-semibold font-mono">{post.engagementScore}</td>
                    <td className="px-6 py-4.5 text-indigo-400 font-mono font-semibold">{post.engagementRate}%</td>
                    <td className="px-6 py-4.5">
                      {post.postUrl && (
                        <a 
                          href={post.postUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="p-1.5 rounded-lg border border-white/5 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-white inline-flex transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4.5 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500 font-medium">
            <span>Showing page {page} of {totalPages} ({totalPosts} total posts)</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-2 border border-white/10 hover:border-white/20 disabled:border-zinc-800 disabled:text-zinc-700 rounded-lg transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="p-2 border border-white/10 hover:border-white/20 disabled:border-zinc-800 disabled:text-zinc-700 rounded-lg transition-colors cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
