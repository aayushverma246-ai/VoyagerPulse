import React from 'react';

export function LogoIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Container in brand blue-to-indigo gradient */}
      <rect width="32" height="32" rx="8" fill="url(#logo-grad)" />
      
      {/* Dot on the "i" */}
      <circle cx="9.5" cy="11.5" r="1.6" fill="white" />
      
      {/* "i" stem */}
      <path 
        d="M9.5 15.5V22" 
        stroke="white" 
        strokeWidth="3.2" 
        strokeLinecap="round" 
      />
      
      {/* "n" transitioning into an upward-trending arrow/pulse wave */}
      <path 
        d="M14.5 22V15.5C14.5 13.2 18 13.2 18 16V19.5C18 20.8 19.5 21.2 20.5 20.2L27 13.5" 
        stroke="white" 
        strokeWidth="3.2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* Arrowhead */}
      <path 
        d="M22 13.5H27V18.5" 
        stroke="white" 
        strokeWidth="3.2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0A66C2" />
          <stop offset="1" stopColor="#4F46E5" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Logo({ showText = true }: { showText?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoIcon className="h-8 w-8 shadow-lg shadow-indigo-500/10 hover:scale-105 transition-transform duration-200" />
      {showText && (
        <span className="font-bold text-base tracking-tight text-white font-sans">
          Voyager<span className="text-indigo-400 font-semibold">Pulse</span>
        </span>
      )}
    </div>
  );
}
