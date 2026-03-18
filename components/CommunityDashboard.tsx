
import React, { useState } from 'react';
import { Community, Project } from '../types';

interface CommunityDashboardProps {
  community: Community;
  onJoin: () => void;
  isJoined: boolean;
  projects: Project[];
  onCreateProject?: () => void;
}

const CommunityDashboard: React.FC<CommunityDashboardProps> = ({ community, onJoin, isJoined, projects, onCreateProject }) => {
  const [activeTab, setActiveTab] = useState<'ongoing' | 'completed' | 'proposed'>('ongoing');
  
  const communityProjects = projects.filter(p => p.communityId === community.id);
  const filteredProjects = communityProjects.filter(p => p.status.toLowerCase() === activeTab);

  return (
    <div className="flex-1 bg-white dark:bg-slate-950 overflow-y-auto custom-scrollbar">
      {/* Header Banner */}
      <div className="h-64 bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 relative">
        <div className="absolute inset-0 opacity-10 pattern-dots" />
        <div className="absolute -bottom-20 left-12 flex items-end space-x-8">
          <div className="w-40 h-40 bg-white dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-7xl shadow-2xl border-4 border-white dark:border-slate-950">
            {community.icon}
          </div>
          <div className="mb-6">
            <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase">{community.name}</h1>
            <div className="flex items-center space-x-6 text-primary-100 font-bold text-sm tracking-wide">
              <span>{community.memberCount} Members</span>
              <span>•</span>
              <span>{communityProjects.length} Projects</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-6 right-12">
          {isJoined ? (
            <div className="px-8 py-3 bg-white/20 backdrop-blur-md text-white rounded-2xl font-bold border border-white/30">
              Joined Member
            </div>
          ) : (
            <button 
              onClick={onJoin}
              className="px-10 py-4 bg-white text-primary-600 rounded-2xl font-bold text-lg shadow-2xl hover:scale-105 transition-all"
            >
              Join Community
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mt-28 px-12 pb-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* About Sidebar */}
        <div className="space-y-8">
          <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">About the space</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-8 text-sm">
              {community.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {community.tags.map(tag => (
                <span key={tag} className="text-[10px] bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-3 py-1.5 rounded-full font-black uppercase tracking-tighter">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          
          <div className="bg-primary-600 p-8 rounded-[2rem] text-white shadow-xl shadow-primary-600/20">
            <h3 className="text-xs font-black uppercase tracking-widest opacity-80 mb-4">Founder</h3>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center font-black">
                {community.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold">Space Moderator</p>
                <p className="text-xs opacity-70">Senior Contributor</p>
              </div>
            </div>
          </div>
        </div>

        {/* Project History Main */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-8 border-b border-slate-100 dark:border-slate-900 pb-4">
            <div className="flex items-center space-x-6">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Project Hub</h2>
              {isJoined && (
                <button 
                  onClick={onCreateProject}
                  className="px-4 py-2 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-500 hover:text-white transition-all"
                >
                  Propose Project
                </button>
              )}
            </div>
            <div className="flex space-x-4">
              {(['ongoing', 'completed', 'proposed'] as const).map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${
                    activeTab === tab 
                      ? 'bg-primary-600 text-white shadow-lg' 
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredProjects.length > 0 ? filteredProjects.map(project => (
              <div key={project.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl hover:border-primary-500 transition-all flex justify-between items-center group">
                <div className="flex-1 pr-6">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary-600">{project.name}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 mb-3">{project.description}</p>
                  <div className="flex gap-2">
                    {project.techStack.slice(0, 3).map(tech => (
                      <span key={tech} className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{tech}</span>
                    ))}
                  </div>
                </div>
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700" />
                  ))}
                </div>
              </div>
            )) : (
              <div className="py-20 text-center opacity-30">
                <p className="font-bold uppercase tracking-widest text-sm">No {activeTab} projects found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityDashboard;
