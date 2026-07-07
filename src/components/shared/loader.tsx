'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogoIcon } from './logo';

interface LoaderProps {
  loading: boolean;
  message?: string;
}

const ANALYTICAL_PHRASES = [
  "Connecting to secure database...",
  "Verifying user authentication...",
  "Loading voyager session contexts...",
  "Retrieving cached feed items...",
  "Calculating engagement metrics...",
  "Synchronizing content state index...",
  "Finalizing dashboard view..."
];

export default function PulseLoader({ loading, message }: LoaderProps) {
  const [phraseIdx, setPhraseIdx] = useState(0);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setPhraseIdx(prev => (prev + 1) % ANALYTICAL_PHRASES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [loading]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center dot-grid select-none"
        >
          {/* Neon background glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-blue-500/5 blur-[80px] pointer-events-none" />

          <div className="flex flex-col items-center max-w-sm w-full px-6 relative z-10">
            {/* Pulsing Logo wrapper */}
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                filter: [
                  "drop-shadow(0 0 10px rgba(99,102,241,0.2))",
                  "drop-shadow(0 0 25px rgba(99,102,241,0.4))",
                  "drop-shadow(0 0 10px rgba(99,102,241,0.2))"
                ]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="mb-8"
            >
              <LogoIcon className="h-16 w-16" />
            </motion.div>

            {/* Platform Brand */}
            <h2 className="text-xl font-bold tracking-tight text-white mb-1.5 text-center font-sans">
              Voyager<span className="text-indigo-400 font-semibold">Pulse</span>
            </h2>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-8 text-center font-mono">
              INBOUND ANALYTICS
            </p>

            {/* Scanning Progress Bar */}
            <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden mb-5 border border-white/5">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ 
                  width: ["0%", "30%", "65%", "90%", "98%"],
                  transition: { duration: 6, ease: "easeInOut" }
                }}
                className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"
              />
            </div>

            {/* Rotating Messages */}
            <div className="h-6 flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={phraseIdx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-xs text-zinc-400 font-mono text-center truncate"
                >
                  {message || ANALYTICAL_PHRASES[phraseIdx]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
