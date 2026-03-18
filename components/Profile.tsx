import React from 'react';
import { User, JoinRequest } from '../types';
import { MOCK_PROJECTS } from '../constants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProfileProps {
  user: User;
  onLogout: () => void;
  isOwnProfile?: boolean;
  onClose?: () => void;
  requests?: JoinRequest[];
  onAcceptRequest?: (id: string) => void;
}

const contributionData = [
  { name: 'W1', count: 4 },
  { name: 'W2', count: 9 },
  { name: 'W3', count: 18 },
  { name: 'W4', count: 12 },
  { name: 'W5', count: 28 },
  { name: 'W6', count: 22 },
  { name: 'W7', count: 35 }
];

const Profile: React.FC<ProfileProps> = ({ user, onLogout, isOwnProfile = true, onClose, requests = [], onAcceptRequest }) => {
  const userProjects = MOCK_PROJECTS.filter(p => p.contributors.includes(user.id));
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const completedMilestones = MOCK_PROJECTS.flatMap(p => 
    p.milestones.filter(m => m.status === 'completed' && p.contributors.includes(user.id))
  );

  return (
    <div className="flex-1 overflow-y-auto bg-white dark:bg-zinc-950 custom-scrollbar animate-in slide-in-from-right-8 duration-500">
      <div className="relative h-72 w-full">
        <div className="absolute inset-0 bg-slate-100 dark:bg-zinc-900 overflow-hidden">
           <div className="absolute top-0 right-0 w-[60%] h-full bg-brand-500/10 blur-[150px] rounded-full"></div>
           <div className="absolute bottom-0 left-0 w-[40%] h-full bg-brand-accent/10 blur-[150px] rounded-full"></div>
        </div>
        {onClose && (
          <button 
            onClick={onClose} 
            className="absolute top-6 left-6 z-20 p-2 glass-card rounded-xl text-slate-500 dark:text-white hover:bg-white/10 transition-all border border-slate-200 dark:border-white/10"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
        )}
        <div className="absolute -bottom-16 left-12 flex items-end space-x-8">
          <div className="relative group">
            <img src={user.avatar} className="w-36 h-36 rounded-[2.5rem] border-4 border-white dark:border-zinc-950 shadow-2xl object-cover bg-zinc-100 dark:bg-zinc-900" alt="" />
            <div className="absolute -top-3 -right-3 vibrant-gradient text-white text-[9px] font-black px-2.5 py-1 rounded-full shadow-lg uppercase tracking-widest">Lvl {Math.floor(user.reputation / 100)}</div>
          </div>
          <div className="mb-6 space-y-2">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{user.name}</h1>
            <div className="flex items-center space-x-3">
              <span className="text-brand-600 dark:text-brand-400 font-black text-xs uppercase tracking-widest">{user.role}</span>
              <span className="text-slate-300 font-bold text-xs">&bull;</span>
              <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">{user.college}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-24 px-12 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-8">
          {/* Main Info Card */}
          <div className="bg-slate-50 dark:bg-zinc-900/50 p-8 rounded-[3rem] space-y-8 border border-slate-200 dark:border-white/5 shadow-sm">
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Craftsman Bio</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-medium">
                {user.bio || "This crafter hasn't shared their story yet."}
              </p>
            </div>
            
            {/* Social Links Icons */}
            <div className="flex items-center space-x-4">
              {user.githubUrl && (
                <a href={user.githubUrl} target="_blank" className="p-3 bg-white dark:bg-zinc-800 rounded-xl text-slate-500 dark:text-white hover:text-brand-500 transition-all shadow-sm border border-slate-200 dark:border-white/5">
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </a>
              )}
              {user.linkedinUrl && (
                <a href={user.linkedinUrl} target="_blank" className="p-3 bg-white dark:bg-zinc-800 rounded-xl text-slate-500 dark:text-white hover:text-brand-500 transition-all shadow-sm border border-slate-200 dark:border-white/5">
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
              )}
              {user.portfolioUrl && (
                <a href={user.portfolioUrl} target="_blank" className="p-3 bg-white dark:bg-zinc-800 rounded-xl text-slate-500 dark:text-white hover:text-brand-500 transition-all shadow-sm border border-slate-200 dark:border-white/5">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                </a>
              )}
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-white/5 space-y-4">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tech Arsenal</h3>
               <div className="flex flex-wrap gap-2">
                 {user.skills.length > 0 ? user.skills.map(skill => (
                   <span key={skill} className="px-3 py-1.5 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black tracking-wider uppercase">
                     {skill}
                   </span>
                 )) : (
                   <span className="text-[10px] text-slate-400 italic font-bold">No skills listed yet</span>
                 )}
               </div>
            </div>

            {isOwnProfile && pendingRequests.length > 0 && (
              <div className="pt-6 border-t border-slate-200 dark:border-white/5 space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pending Requests</h3>
                <div className="space-y-3">
                  {pendingRequests.map(req => (
                    <div key={req.id} className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/5 p-4 rounded-2xl shadow-sm">
                      <div className="flex items-center space-x-3 mb-3">
                        <img src={req.userAvatar} className="w-8 h-8 rounded-lg" alt="" />
                        <div className="min-w-0">
                          <p className="text-[10px] font-black text-slate-900 dark:text-white truncate uppercase">{req.userName}</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase">wants to join {req.targetName}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => onAcceptRequest?.(req.id)}
                          className="flex-1 py-2 bg-brand-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-brand-500/20"
                        >
                          Accept
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {user.cvUrl && (
              <a href={user.cvUrl} target="_blank" className="w-full flex items-center justify-center space-x-3 py-4 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-500 hover:text-white transition-all">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <span>Download Resume</span>
              </a>
            )}
          </div>
          {isOwnProfile && (
            <button 
              onClick={onLogout} 
              className="w-full py-4 border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
            >
              Terminate Session
            </button>
          )}
        </div>

        <div className="lg:col-span-8 space-y-10">
          {/* Contribution Graph Simulation */}
          <div className="bg-slate-50 dark:bg-zinc-900/30 p-8 rounded-[3rem] border border-slate-200 dark:border-white/5">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Crafting Index</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={contributionData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ background: '#09090b', borderRadius: '16px', border: 'none', color: '#fff' }}
                    itemStyle={{ color: '#6366f1', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={4} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Contribution History</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedMilestones.length > 0 ? completedMilestones.map((m, i) => (
                <div key={i} className="bg-slate-50 dark:bg-zinc-900/50 p-6 rounded-[2rem] border border-slate-200 dark:border-white/5 flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Completed Milestone</span>
                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase leading-tight">{m.title}</p>
                  </div>
                </div>
              )) : (
                <div className="md:col-span-2 py-10 text-center opacity-30 border border-dashed border-slate-200 dark:border-white/5 rounded-[2rem]">
                   <p className="text-xs font-black uppercase tracking-widest">No verified contributions yet</p>
                </div>
              )}
              {userProjects.map(project => (
                <div key={project.id} className="bg-white dark:bg-zinc-800/40 p-6 rounded-[2.5rem] border border-slate-200 dark:border-white/5 hover:border-brand-500/30 transition-all group cursor-pointer relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors uppercase">{project.name}</h4>
                    <span className="text-[8px] font-black bg-brand-500/10 text-brand-600 border border-brand-500/20 px-2 py-0.5 rounded-full uppercase tracking-widest">{project.status}</span>
                  </div>
                  <p className="text-slate-500 text-xs mb-6 line-clamp-2 font-medium">{project.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;