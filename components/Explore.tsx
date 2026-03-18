
import React, { useState } from 'react';
import { MOCK_COMMUNITIES } from '../constants';
import { Community } from '../types';

interface ExploreProps {
  onPreviewCommunity: (community: Community) => void;
  joinedIds: string[];
}

const Explore: React.FC<ExploreProps> = ({ onPreviewCommunity, joinedIds }) => {
  const [search, setSearch] = useState('');

  const filtered = MOCK_COMMUNITIES.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-900 p-8 overflow-y-auto custom-scrollbar">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Discover Communities</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Find interest-based spaces where students collaborate on meaningful projects.
          </p>
          <div className="mt-8 relative max-w-xl mx-auto">
            <input 
              type="text" 
              placeholder="Search by interests, tags, or keywords..." 
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 absolute left-4 top-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(community => (
            <div 
              key={community.id} 
              onClick={() => onPreviewCommunity(community)}
              className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                  {community.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg truncate">{community.name}</h3>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    <span>{community.memberCount} M</span>
                    <span>•</span>
                    <span>{community.projectCount} P</span>
                  </div>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 flex-1 leading-relaxed line-clamp-3">
                {community.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {community.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-[10px] bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 px-2 py-1 rounded-lg font-bold uppercase tracking-wider">
                    #{tag}
                  </span>
                ))}
              </div>
              <button 
                className={`w-full py-3 rounded-xl font-bold transition-all ${
                  joinedIds.includes(community.id) 
                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-500' 
                  : 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 group-hover:bg-primary-600 group-hover:text-white shadow-sm'
                }`}
              >
                {joinedIds.includes(community.id) ? 'Already Member' : 'View Dashboard'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Explore;
