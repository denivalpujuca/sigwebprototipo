import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 bg-surface flex justify-between items-center px-8 z-40">
      <nav className="flex items-center gap-8">
        <a className="text-slate-600 hover:text-slate-900 text-sm font-medium" href="#">Dashboard</a>
        <a className="text-[#22C55E] font-bold border-b-2 border-[#22C55E] h-16 flex items-center text-sm" href="#">Analytics</a>
      </nav>
      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <div className="w-px h-6 bg-outline-variant opacity-20"></div>
        <div className="w-8 h-8 rounded-full bg-slate-400 flex items-center justify-center">
          <span className="text-white text-xs">A</span>
        </div>
      </div>
    </header>
  );
};