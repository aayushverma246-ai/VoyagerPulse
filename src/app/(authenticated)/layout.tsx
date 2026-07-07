'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/shared/sidebar';
import PulseLoader from '@/components/shared/loader';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);

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
    <div className="flex bg-black text-white min-h-screen">
      {/* Dynamic Loader screen */}
      <PulseLoader loading={loading} />

      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-10 py-10">
        <div className="max-w-7xl mx-auto space-y-10">
          {children}
        </div>
      </main>
    </div>
  );
}
