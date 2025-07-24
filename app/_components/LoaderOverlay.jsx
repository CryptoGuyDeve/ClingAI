import React from 'react';

export default function LoaderOverlay({ show = false }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm transition-all">
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        {/* Animated logo with shimmer */}
        <div className="relative text-4xl md:text-5xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-shimmer">
          CLINGAI
          <span className="absolute left-0 top-0 w-full h-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer-overlay" />
        </div>
        {/* Animated dots */}
        <div className="flex gap-2 mt-2">
          <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.2s]"></span>
          <span className="w-3 h-3 bg-purple-500 rounded-full animate-bounce [animation-delay:0s]"></span>
          <span className="w-3 h-3 bg-pink-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
        </div>
      </div>
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 2s linear infinite;
        }
        .animate-shimmer-overlay {
          pointer-events: none;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s linear infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.4s;
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(1); }
          40% { transform: scale(1.4); }
        }
        .animate-bounce {
          animation: bounce 1.2s infinite;
        }
      `}</style>
    </div>
  );
} 