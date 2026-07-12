'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  LayoutDashboard, 
  BarChart3, 
  TableProperties, 
  Settings, 
  LogOut,
  ExternalLink,
  ChevronRight,
  X
} from 'lucide-react';
import { Logo } from './logo';

interface ProfileData {
  fullName: string;
  occupation: string | null;
  avatarUrl: string | null;
  profileUrl: string | null;
}

export default function Sidebar({ isOpen = false, setIsOpen }: { isOpen?: boolean, setIsOpen?: (v: boolean) => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/profile?t=${Date.now()}`, { cache: 'no-store' });
        const data = await res.json();
        if (data.success) {
          setProfile(data.profile);
        }
      } catch (err) {
        console.error('Failed to load profile in sidebar', err);
      }
    }
    fetchProfile();

    window.addEventListener('profile-updated', fetchProfile);
    return () => {
      window.removeEventListener('profile-updated', fetchProfile);
    };
  }, [pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    { label: 'Posts Feed', href: '/posts', icon: TableProperties },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-80 h-screen border-r border-white/5 bg-zinc-950/95 md:bg-zinc-950/40 backdrop-blur-xl flex flex-col justify-between shrink-0 transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      md:relative md:translate-x-0 md:sticky md:top-0
    `}>
      {/* Top Section */}
      <div className="p-6">
        <div className="mb-8 flex items-center justify-between md:block">
          <Logo />
          {/* Close button for mobile */}
          <button 
            className="md:hidden p-2 -mr-2 text-zinc-400 hover:text-white"
            onClick={() => setIsOpen?.(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Dynamic Profile Card */}
        {profile && (
          <a
            href={profile.profileUrl || '#'}
            target="_blank"
            rel="noreferrer"
            className="block glass-panel p-4 rounded-xl mb-6 relative overflow-hidden group hover:border-indigo-500/35 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              {profile.avatarUrl ? (
                <img 
                  src={profile.avatarUrl} 
                  alt={profile.fullName} 
                  className="h-10 w-10 rounded-full border border-white/10 object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center font-bold text-white uppercase text-sm">
                  {profile.fullName.substring(0, 2)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">{profile.fullName}</h4>
                  <ExternalLink className="h-3 w-3 text-zinc-500 group-hover:text-indigo-400 transition-colors shrink-0" />
                </div>
                <p className="text-[10px] text-zinc-500 truncate mt-0.5">{profile.occupation || 'LinkedIn Creator'}</p>
              </div>
            </div>
          </a>
        )}

        {/* Nav Links */}
        <nav className="space-y-1">
          {navItems.map(item => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen?.(false)}
                className={`flex items-center justify-between px-3.5 py-3 rounded-lg text-sm font-medium transition-all group ${
                  isActive 
                    ? 'bg-indigo-500/10 border-l-2 border-indigo-500 text-indigo-300' 
                    : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className={`h-3.5 w-3.5 text-zinc-600 transition-transform group-hover:translate-x-0.5 ${isActive ? 'text-indigo-400/50' : 'opacity-0 group-hover:opacity-100'}`} />
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-6 border-t border-white/5">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-colors w-full cursor-pointer"
        >
          <LogOut className="h-4.5 w-4.5 text-zinc-500 group-hover:text-red-400" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
