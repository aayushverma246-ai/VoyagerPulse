'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/shared/sidebar';
import PulseLoader from '@/components/shared/loader';
import { Menu } from 'lucide-react';
import { Logo } from '@/components/shared/logo';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function initApp() {
      try {
        // Fetch profile to verify session is active and caches are loaded
        const res = await fetch('/api/profile');
        await res.json();
      } catch (err) {
        console.error('Failed to initialize session profile', err);
      } finally {
        // Guarantee loader shows for at least 1.2s to look beautiful and professional
        setTimeout(() => {
          setLoading(false);
        }, 1200);
      }
    }
    initApp();
  }, []);

  return (
    <div className="flex flex-col md:flex-row bg-black text-white min-h-screen">
      {/* Dynamic Loader screen */}
      <PulseLoader loading={loading} />

      {/* Mobile Top Navigation */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-zinc-950/40 backdrop-blur-xl sticky top-0 z-40">
        <Logo />
        <button onClick={() => setSidebarOpen(true)} className="p-2 -mr-2 text-zinc-400 hover:text-white">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Navigation Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:px-10 md:py-10">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-10">
          {children}
        </div>
      </main>
    </div>
  );
}
