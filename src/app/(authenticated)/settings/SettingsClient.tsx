'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Key, 
  Settings as SettingsIcon, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  HelpCircle,
  Database,
  History
} from 'lucide-react';

interface RefreshLog {
  id: string;
  status: string;
  errorMessage: string | null;
  postsFetched: number;
  createdAt: string;
}

interface SettingsClientProps {
  initialTheme: string;
  initialAutoRefresh: boolean;
  initialHasCookies: boolean;
  initialRefreshHistory: RefreshLog[];
  initialUserEmail: string;
}

export default function SettingsClient({
  initialTheme,
  initialAutoRefresh,
  initialHasCookies,
  initialRefreshHistory,
  initialUserEmail,
}: SettingsClientProps) {
  const router = useRouter();
  const [liAt, setLiAt] = useState('');
  const [jsessionid, setJsessionid] = useState('');
  const [theme, setTheme] = useState(initialTheme);
  const [autoRefresh, setAutoRefresh] = useState(initialAutoRefresh);
  const [hasCookies, setHasCookies] = useState(initialHasCookies);
  const [refreshHistory, setRefreshHistory] = useState<RefreshLog[]>(initialRefreshHistory);
  const [userEmail, setUserEmail] = useState(initialUserEmail);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  async function fetchSettings() {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success) {
        setUserEmail(data.email || '');
        setTheme(data.settings.theme || 'dark');
        setAutoRefresh(data.settings.autoRefresh || false);
        setHasCookies(data.hasCookies);
        setRefreshHistory(data.refreshHistory || []);
      }
    } catch (err) {
      console.error('Failed to load settings', err);
    }
  }

  const handleSaveCookies = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!liAt || !jsessionid) return;
    
    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liAt, jsessionid }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: 'success', text: 'Cookies encrypted and saved. Old profile data purged.' });
        setHasCookies(true);
        setLiAt('');
        setJsessionid('');
        await fetchSettings();
        window.dispatchEvent(new Event('profile-updated'));
        router.refresh();
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to save cookies.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'An unexpected connection error occurred.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSyncData = async () => {
    setSyncing(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: 'success', text: `Sync complete. Fetched ${data.postsFetched} posts.` });
        await fetchSettings();
        window.dispatchEvent(new Event('profile-updated'));
        router.refresh();
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Sync failed.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Network connection failed.' });
    } finally {
      setSyncing(false);
    }
  };

  const handleSeedDemo = async () => {
    setSyncing(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed: true }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: 'success', text: 'Mock demonstration data seeded successfully.' });
        await fetchSettings();
        window.dispatchEvent(new Event('profile-updated'));
        router.refresh();
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to seed mock data.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Seeding failed.' });
    } finally {
      setSyncing(false);
    }
  };

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

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400">
          Settings & Sync Config
        </h1>
        <p className="text-zinc-400 text-sm mt-1">Configure credentials, refresh databases, and check connection states</p>
      </div>

      {statusMessage && (
        <div className={`px-4 py-3 rounded-lg border text-sm font-medium ${
          statusMessage.type === 'success' 
            ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' 
            : 'border-red-500/20 bg-red-500/5 text-red-400'
        }`}>
          {statusMessage.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Cookies Form */}
        <div className="space-y-8">
          
          {/* Voyager credentials card */}
          <div className="glass-panel p-6 rounded-2xl space-y-6">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-indigo-400" />
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">LinkedIn Session Credentials</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Cookies are encrypted symmetrically using AES-256-GCM.</p>
              </div>
            </div>

            {/* Connection Status Indicator */}
            <div className="flex items-center gap-3 bg-zinc-950/60 border border-white/5 p-4 rounded-xl">
              {hasCookies ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-white">Credentials Active</span>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Cookies are saved. You can trigger updates dynamically.</p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-indigo-500 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-zinc-300">Credentials Missing</span>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Add Voyager cookies to connect live feed analytics.</p>
                  </div>
                </>
              )}
            </div>

            <form onSubmit={handleSaveCookies} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">li_at cookie value</label>
                <input 
                  type="password" 
                  value={liAt}
                  onChange={e => setLiAt(e.target.value)}
                  placeholder="Paste li_at cookie string here"
                  className="w-full bg-zinc-950/60 border border-white/10 focus:border-indigo-500/50 rounded-lg py-2.5 px-3.5 text-xs text-white placeholder-zinc-700 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">JSESSIONID value</label>
                <input 
                  type="password" 
                  value={jsessionid}
                  onChange={e => setJsessionid(e.target.value)}
                  placeholder='Paste JSESSIONID cookie string (e.g. "ajax:4839...")'
                  className="w-full bg-zinc-950/60 border border-white/10 focus:border-indigo-500/50 rounded-lg py-2.5 px-3.5 text-xs text-white placeholder-zinc-700 outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={saving || !liAt || !jsessionid}
                className="w-full inline-flex items-center justify-center bg-white text-black hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-500 rounded-lg py-2.5 text-xs font-semibold transition-colors cursor-pointer font-sans"
              >
                {saving ? 'Encrypting & Saving...' : 'Save & Encrypt Cookies'}
              </button>
            </form>

            {/* Help guidelines */}
            <div className="bg-zinc-950/20 border-t border-white/5 pt-4 text-[10px] text-zinc-500 space-y-2 leading-relaxed">
              <span className="flex items-center gap-1.5 font-semibold text-zinc-400"><HelpCircle className="h-3.5 w-3.5" /> How to find these cookies:</span>
              <ol className="list-decimal list-inside pl-1 space-y-1">
                <li>Log in to LinkedIn.com in a browser.</li>
                <li>Right click, open <span className="font-semibold text-zinc-400">Inspect</span> (Developer Tools).</li>
                <li>Go to the <span className="font-semibold text-zinc-400">Application</span> tab (or <span className="font-semibold text-zinc-400">Storage</span>).</li>
                <li>Find <span className="font-semibold text-zinc-400">Cookies</span> &gt; <span className="font-semibold text-zinc-400">https://www.linkedin.com</span>.</li>
                <li>Copy values for <code className="text-indigo-400 font-mono">li_at</code> and <code className="text-indigo-400 font-mono">JSESSIONID</code>.</li>
              </ol>
            </div>
          </div>

        </div>

        {/* Right Column: Database Operations & logs */}
        <div className="space-y-8">
          
          {/* Data Refresh panel */}
          <div className="glass-panel p-6 rounded-2xl space-y-6">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Data Sync Operations</h3>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Updating your data will query LinkedIn's GraphQL Voyager API directly and update comments, likes, shares, and impressions.
            </p>

            {userEmail === 'demo@voyagerpulse.com' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleSyncData}
                  disabled={syncing || !hasCookies}
                  className="inline-flex items-center justify-center gap-2 border border-indigo-500/30 hover:border-indigo-500/50 bg-indigo-500/5 hover:bg-indigo-500/10 disabled:border-zinc-800 disabled:bg-black disabled:text-zinc-600 px-4.5 py-3 rounded-xl text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${syncing && hasCookies ? 'animate-spin' : ''}`} />
                  Fetch Live Updates
                </button>
                
                <button
                  onClick={handleSeedDemo}
                  disabled={syncing}
                  className="inline-flex items-center justify-center gap-2 border border-white/10 hover:border-white/20 bg-zinc-950 hover:bg-zinc-900 disabled:border-zinc-800 disabled:text-zinc-600 px-4.5 py-3 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  <Database className={`h-3.5 w-3.5 ${syncing && !hasCookies ? 'animate-spin text-indigo-400' : ''}`} />
                  Reset & Seed Mock Data
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={handleSyncData}
                  disabled={syncing || !hasCookies}
                  className="w-full inline-flex items-center justify-center gap-2 border border-indigo-500/30 hover:border-indigo-500/50 bg-indigo-500/5 hover:bg-indigo-500/10 disabled:border-zinc-800 disabled:bg-black disabled:text-zinc-600 px-4.5 py-3 rounded-xl text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${syncing && hasCookies ? 'animate-spin' : ''}`} />
                  Fetch Live Updates
                </button>
              </div>
            )}
          </div>

          {/* Sync History Logs */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <History className="h-5 w-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Synchronization Log History</h3>
            </div>

            <div className="space-y-3">
              {refreshHistory.length === 0 ? (
                <div className="text-xs text-zinc-600 text-center py-6 font-medium">No sync logs found.</div>
              ) : (
                refreshHistory.map(log => (
                  <div key={log.id} className="flex justify-between items-start text-xs border-b border-white/5 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        {log.status === 'success' ? (
                          <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-red-400" />
                        )}
                        <span className="font-semibold text-white capitalize">{log.status}</span>
                      </div>
                      {log.errorMessage ? (
                        <p className="text-[10px] text-red-400 leading-normal max-w-xs">{log.errorMessage}</p>
                      ) : (
                        <p className="text-[10px] text-zinc-500 font-mono">Fetched {log.postsFetched} posts.</p>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-600 font-mono mt-0.5">
                      {new Date(log.createdAt).toLocaleString(undefined, { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: 'numeric', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
