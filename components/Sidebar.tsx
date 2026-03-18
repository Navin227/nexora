
import React from 'react';
import { Community } from '../types';

interface SidebarProps {
  activeCommunityId: string | null;
  joinedCommunities: Community[];
  onSelectCommunity: (id: string | null) => void;
  onOpenExplore: () => void;
  onOpenProfile: () => void;
  onOpenHome: () => void;
  onCreateCommunity: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeCommunityId, 
  joinedCommunities, 
  onSelectCommunity, 
  onOpenExplore, 
  onOpenProfile,
  onOpenHome,
  onCreateCommunity
}) => {
  return (
    <div className="w-[88px] bg-white dark:bg-zinc-950 flex flex-col items-center py-8 space-y-8 border-r border-slate-200 dark:border-white/5 flex-shrink-0 h-full relative z-30 transition-colors duration-300">
      {/* Brand Icon */}
      <button 
        onClick={onOpenHome}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-2xl ${
          activeCommunityId === null 
            ? 'vibrant-gradient text-white shadow-brand-500/40 scale-110' 
            : 'bg-slate-100 dark:bg-zinc-900 text-slate-500 hover:text-brand-500 dark:hover:text-brand-400 border border-slate-200 dark:border-white/5'
        }`}
      >
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
      </button>

      <div className="w-10 h-1 bg-slate-200 dark:bg-white/5 rounded-full" />

      {/* Global Explorer */}
      <button 
        onClick={onOpenExplore}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group ${
          activeCommunityId === 'explore' 
            ? 'vibrant-gradient text-white shadow-brand-500/40' 
            : 'bg-slate-100 dark:bg-zinc-900 text-slate-500 hover:bg-slate-200 dark:hover:bg-zinc-800 border border-slate-200 dark:border-white/5'
        }`}
        title="Explore"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      </button>

      {/* Community List */}
      <div className="flex-1 w-full overflow-y-auto custom-scrollbar flex flex-col items-center space-y-5 px-3">
        {joinedCommunities.map((community) => (
          <button
            key={community.id}
            onClick={() => onSelectCommunity(community.id)}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group relative border shadow-lg ${
              activeCommunityId === community.id 
                ? 'vibrant-gradient border-transparent shadow-brand-500/40 text-white scale-110' 
                : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-400 hover:border-brand-500/50 border-slate-200 dark:border-white/5'
            }`}
          >
            <span className="text-sm font-black tracking-tighter uppercase">{community.name.substring(0, 2)}</span>
            <div className="absolute left-20 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-2xl opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none transition-all duration-300 shadow-2xl translate-x-4 group-hover:translate-x-0">
              {community.name}
            </div>
          </button>
        ))}

        <button 
          onClick={onCreateCommunity}
          className="w-14 h-14 rounded-2xl flex items-center justify-center border-4 border-dashed border-slate-200 dark:border-white/10 text-slate-400 hover:text-brand-500 hover:border-brand-500 transition-all duration-300"
          title="Create Space"
        >
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
        </button>
      </div>

      <div className="pt-8 border-t border-slate-200 dark:border-white/5 w-full flex flex-col items-center">
        <button 
          onClick={onOpenProfile}
          className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-zinc-900 border-2 border-slate-200 dark:border-white/10 overflow-hidden transition-all hover:scale-110 hover:ring-4 ring-brand-500/20 active:scale-95 group"
        >
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" className="group-hover:scale-110 transition-transform duration-300" alt="Profile" />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
