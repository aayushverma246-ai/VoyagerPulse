import React from 'react';

export default function PostsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="h-9 w-48 bg-zinc-800 rounded-lg"></div>
          <div className="h-4 w-80 bg-zinc-800 rounded-md mt-2"></div>
        </div>
        <div className="h-10 w-32 bg-zinc-800 rounded-xl"></div>
      </div>

      {/* Filter panel */}
      <div className="h-16 bg-zinc-800/40 border border-white/5 rounded-2xl flex items-center justify-between px-6">
        <div className="h-9 w-64 bg-zinc-800 rounded-xl"></div>
        <div className="h-9 w-40 bg-zinc-800 rounded-xl"></div>
      </div>

      {/* Table grid */}
      <div className="border border-white/5 rounded-2xl bg-zinc-800/20 overflow-hidden">
        <div className="h-12 bg-white/[0.02] border-b border-white/5 flex items-center px-6 gap-8">
          <div className="h-4 w-40 bg-zinc-800 rounded"></div>
          <div className="h-4 w-20 bg-zinc-800 rounded"></div>
          <div className="h-4 w-12 bg-zinc-800 rounded"></div>
          <div className="h-4 w-12 bg-zinc-800 rounded"></div>
          <div className="h-4 w-16 bg-zinc-800 rounded"></div>
          <div className="h-4 w-12 bg-zinc-800 rounded"></div>
          <div className="h-4 w-12 bg-zinc-800 rounded"></div>
        </div>
        <div className="divide-y divide-white/5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 flex items-center px-6 gap-8">
              <div className="h-5 w-64 bg-zinc-800 rounded"></div>
              <div className="h-4 w-16 bg-zinc-800 rounded"></div>
              <div className="h-4 w-8 bg-zinc-800 rounded"></div>
              <div className="h-4 w-8 bg-zinc-800 rounded"></div>
              <div className="h-4 w-12 bg-zinc-800 rounded"></div>
              <div className="h-4 w-8 bg-zinc-800 rounded"></div>
              <div className="h-4 w-8 bg-zinc-800 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
