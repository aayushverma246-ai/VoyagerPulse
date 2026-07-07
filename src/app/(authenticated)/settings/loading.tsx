import React from 'react';

export default function SettingsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Title */}
      <div>
        <div className="h-9 w-64 bg-zinc-800 rounded-lg"></div>
        <div className="h-4 w-96 bg-zinc-800 rounded-md mt-2"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column Card */}
        <div className="h-[450px] bg-zinc-800/40 border border-white/5 rounded-2xl"></div>
        
        {/* Right Column Card */}
        <div className="space-y-8">
          <div className="h-[200px] bg-zinc-800/40 border border-white/5 rounded-2xl"></div>
          <div className="h-[230px] bg-zinc-800/40 border border-white/5 rounded-2xl"></div>
        </div>
      </div>
    </div>
  );
}
