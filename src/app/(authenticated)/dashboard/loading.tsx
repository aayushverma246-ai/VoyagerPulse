import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="h-9 w-64 bg-zinc-800 rounded-lg"></div>
          <div className="h-4 w-96 bg-zinc-800 rounded-md mt-2"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-32 bg-zinc-800 rounded-xl"></div>
          <div className="h-10 w-36 bg-zinc-800 rounded-xl"></div>
        </div>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="h-32 bg-zinc-800/40 border border-white/5 rounded-2xl"></div>
        <div className="h-32 bg-zinc-800/40 border border-white/5 rounded-2xl"></div>
        <div className="h-32 bg-zinc-800/40 border border-white/5 rounded-2xl lg:col-span-2"></div>
      </div>

      {/* Averages */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="h-20 bg-zinc-800/40 border border-white/5 rounded-xl"></div>
        <div className="h-20 bg-zinc-800/40 border border-white/5 rounded-xl"></div>
        <div className="h-20 bg-zinc-800/40 border border-white/5 rounded-xl"></div>
        <div className="h-20 bg-zinc-800/40 border border-white/5 rounded-xl"></div>
      </div>

      {/* Bottom section */}
      <div className="space-y-6">
        <div className="h-8 w-48 bg-zinc-800 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-80 bg-zinc-800/40 border border-white/5 rounded-2xl"></div>
          <div className="h-80 bg-zinc-800/40 border border-white/5 rounded-2xl"></div>
          <div className="h-80 bg-zinc-800/40 border border-white/5 rounded-2xl"></div>
        </div>
      </div>
    </div>
  );
}
