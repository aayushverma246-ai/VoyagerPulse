import React from 'react';

export default function AnalyticsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div>
        <div className="h-9 w-64 bg-zinc-800 rounded-lg"></div>
        <div className="h-4 w-96 bg-zinc-800 rounded-md mt-2"></div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-[360px] bg-zinc-800/40 border border-white/5 rounded-2xl"></div>
        <div className="h-[360px] bg-zinc-800/40 border border-white/5 rounded-2xl"></div>
        <div className="h-[360px] bg-zinc-800/40 border border-white/5 rounded-2xl"></div>
        <div className="h-[360px] bg-zinc-800/40 border border-white/5 rounded-2xl"></div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-6 w-48 bg-zinc-800 rounded-md"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="h-40 bg-zinc-800/40 border border-white/5 rounded-2xl"></div>
            <div className="h-40 bg-zinc-800/40 border border-white/5 rounded-2xl"></div>
          </div>
        </div>
        <div className="h-64 bg-zinc-800/40 border border-white/5 rounded-2xl"></div>
      </div>
    </div>
  );
}
