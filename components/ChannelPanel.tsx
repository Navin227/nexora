
import React from 'react';
import { Community, Project } from '../types';

interface ChannelPanelProps {
  community: Community;
  projects: Project[];
  activeChannelId: string | null;
  activeProjectId: string | null;
  onSelectChannel: (id: string) => void;
  onSelectProject: (id: string) => void;
  onCreateProject: () => void;
}

const ChannelPanel: React.FC<ChannelPanelProps> = ({ 
  community, 
  projects, 
  activeChannelId, 
  activeProjectId, 
  onSelectChannel, 
  onSelectProject,
  onCreateProject
}) => {
  return (
    <div className="w-64 bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-white/5 flex flex-col flex-shrink-0 h-full transition-colors duration-300">
      <div className="h-16 flex items-center px-8 border-b border-slate-200 dark:border-white/5">
        <h2 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] truncate">{community.name}</h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 pt-8 space-y-12">
        {/* Channels */}
        <div>
          <div className="px-4 mb-4 flex items-center justify-between">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Channels</h3>
          </div>
          <div className="space-y-1">
            {community.channels.filter(c => c.type === 'chat').map(channel => (
              <button
                key={channel.id}
                onClick={() => onSelectChannel(channel.id)}
                className={`w-full text-left px-4 py-3 rounded-2xl flex items-center space-x-3 transition-all ${
                  activeChannelId === channel.id 
                    ? 'vibrant-gradient text-white shadow-xl shadow-brand-500/20 font-bold' 
                    : 'text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <span className={`text-lg ${activeChannelId === channel.id ? 'opacity-100' : 'opacity-30'}`}>#</span>
                <span className="text-xs font-black uppercase tracking-widest">{channel.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div>
          <div className="px-4 mb-4 flex items-center justify-between">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Projects</h3>
            <button 
              onClick={onCreateProject}
              className="p-1.5 text-brand-500 hover:bg-brand-500/10 rounded-lg transition-all"
              title="New Project"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
          <div className="space-y-1">
            {projects.map(project => (
              <button
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className={`w-full text-left px-4 py-3 rounded-2xl flex items-center space-x-3 transition-all ${
                  activeProjectId === project.id 
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-950 font-black shadow-2xl' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${project.status === 'Ongoing' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span className="text-xs font-black uppercase tracking-widest truncate">{project.name}</span>
              </button>
            ))}
            {projects.length === 0 && (
              <p className="px-4 text-[10px] text-slate-400 italic">No active projects</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChannelPanel;
