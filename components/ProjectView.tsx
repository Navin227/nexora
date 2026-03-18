
import React, { useState, useRef } from 'react';
import { Project, ChatMessage, Milestone, ProjectResource } from '../types';
import { MOCK_USERS } from '../constants';
import ChatWindow from './ChatWindow';

interface ProjectViewProps {
  project: Project;
  currentUserId: string;
  onStartProject?: (id: string) => void;
  onAddResource?: (projectId: string, title: string, url: string, type: ProjectResource['type'], size?: string) => void;
  onUpdateMilestone?: (projectId: string, milestoneId: string, updates: Partial<Milestone>) => void;
  onReorderMilestones?: (projectId: string, milestones: Milestone[]) => void;
  onAddMilestone?: (projectId: string, title: string) => void;
  onJoinProject?: (projectId: string) => void;
}

const ProjectView: React.FC<ProjectViewProps> = ({ project, currentUserId, onStartProject, onAddResource, onUpdateMilestone, onReorderMilestones, onAddMilestone, onJoinProject }) => {
  const isMember = project.contributors.includes(currentUserId);
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'chat' | 'assets'>('overview');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showResForm, setShowResForm] = useState(false);
  const [resTitle, setResTitle] = useState('');
  const [resUrl, setResUrl] = useState('');
  const [resType, setResType] = useState<ProjectResource['type']>('link');
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = (content: string) => {
    const user = MOCK_USERS.find(u => u.id === currentUserId);
    const newMessage: ChatMessage = { id: Date.now().toString(), senderId: currentUserId, senderName: user?.name || 'User', senderAvatar: user?.avatar || '', content, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleAddRes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle || !onAddResource) return;
    if (resType === 'file' || resType === 'image') {
      const file = fileInputRef.current?.files?.[0];
      if (file) {
        onAddResource(project.id, resTitle, URL.createObjectURL(file), resType, (file.size / (1024 * 1024)).toFixed(2) + ' MB');
        setResTitle(''); setShowResForm(false);
      }
    } else if (resUrl) {
      onAddResource(project.id, resTitle, resUrl, resType);
      setResTitle(''); setResUrl(''); setShowResForm(false);
    }
  };

  const moveMilestone = (idx: number, dir: 'up' | 'down') => {
    if (!onReorderMilestones) return;
    const nextIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (nextIdx < 0 || nextIdx >= project.milestones.length) return;
    const next = [...project.milestones];
    [next[idx], next[nextIdx]] = [next[nextIdx], next[idx]];
    onReorderMilestones(project.id, next);
  };

  const handleCompleteMilestone = (mId: string, assetId?: string) => {
    onUpdateMilestone?.(project.id, mId, { status: 'completed', attachedAssetId: assetId });
    setSelectedMilestone(null);
  };

  return (
    <div className="flex-1 flex flex-col bg-transparent overflow-hidden animate-in fade-in duration-500">
      {selectedMilestone && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md p-10 rounded-[2.5rem] shadow-2xl animate-in zoom-in border border-slate-200 dark:border-white/10">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 uppercase">Mark Complete</h2>
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Goal</p>
                <p className="text-lg font-bold text-slate-800 dark:text-white">{selectedMilestone.title}</p>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Attach Proof / Asset</label>
                <select className="w-full bg-slate-100 dark:bg-zinc-950 border-2 border-slate-200 dark:border-white/5 p-4 rounded-xl outline-none text-sm font-bold" onChange={(e) => setSelectedMilestone({...selectedMilestone, attachedAssetId: e.target.value})} value={selectedMilestone.attachedAssetId || ""}>
                  <option value="">No asset linked</option>
                  {project.resources.map(res => <option key={res.id} value={res.id}>{res.title}</option>)}
                </select>
              </div>
              <div className="flex space-x-4">
                <button onClick={() => setSelectedMilestone(null)} className="flex-1 py-4 bg-slate-200 dark:bg-zinc-800 rounded-2xl font-black text-xs uppercase">Cancel</button>
                <button onClick={() => handleCompleteMilestone(selectedMilestone.id, selectedMilestone.attachedAssetId)} className="flex-[2] py-4 vibrant-gradient text-white rounded-2xl font-black text-xs uppercase shadow-xl">Complete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-10 pt-10 pb-0 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-zinc-900/10">
        <div className="flex items-start justify-between mb-10">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 vibrant-gradient rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">{project.name}</h2>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${project.status === 'Ongoing' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : project.status === 'Completed' ? 'bg-brand-500/10 text-brand-600 border-brand-500/20 shadow-[0_0_10px_rgba(99,102,241,0.2)]' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>{project.status}</div>
              </div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{project.currentVersion || 'v0.1.0'} &bull; {project.contributors.length} Contributors</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {project.status === 'Proposed' && project.createdBy === currentUserId && (
              <button onClick={() => onStartProject?.(project.id)} className="px-8 py-3 vibrant-gradient text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-brand-500/20">Launch Project</button>
            )}
            {!isMember && (
              <button 
                onClick={() => onJoinProject?.(project.id)}
                className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-zinc-950 rounded-2xl font-black text-xs uppercase shadow-xl"
              >
                Join Project
              </button>
            )}
          </div>
        </div>
        <div className="flex space-x-10">
          {(['overview', 'milestones', 'chat', 'assets'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-4 text-[11px] font-black uppercase tracking-widest transition-all border-b-4 ${activeTab === tab ? 'border-brand-500 text-brand-600 dark:text-white' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>{tab}</button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
        {activeTab === 'overview' && (
          <div className="max-w-4xl space-y-16 animate-in fade-in">
            <section className="space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center"><span className="w-10 h-1 bg-brand-500/20 mr-4 rounded-full"></span> Description</h3>
              <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed font-medium">{project.description}</p>
            </section>
            <section className="space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center"><span className="w-10 h-1 bg-brand-500/20 mr-4 rounded-full"></span> Roles Needed</h3>
              <div className="flex flex-wrap gap-3">
                {project.rolesNeeded?.map(role => <span key={role} className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/5 px-6 py-4 rounded-3xl text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest shadow-sm">{role}</span>)}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'milestones' && (
          <div className="max-w-2xl animate-in slide-in-from-bottom-8">
             <div className="flex items-center justify-between mb-12">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Milestone Tracking</h3>
                {isMember && (
                  <button onClick={() => setShowMilestoneForm(!showMilestoneForm)} className="text-[9px] font-black text-brand-500 uppercase flex items-center space-x-2"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg><span>New Milestone</span></button>
                )}
             </div>

             {showMilestoneForm && (
               <div className="mb-10 p-6 bg-slate-100 dark:bg-white/5 rounded-[2rem] border border-brand-500/20">
                  <input type="text" className="w-full bg-transparent border-b-2 border-slate-300 dark:border-white/10 p-4 text-sm font-bold outline-none focus:border-brand-500 mb-4" placeholder="Milestone Title" value={newMilestoneTitle} onChange={e => setNewMilestoneTitle(e.target.value)} />
                  <div className="flex justify-end space-x-2">
                    <button onClick={() => setShowMilestoneForm(false)} className="px-4 py-2 text-[10px] font-black uppercase text-slate-500">Cancel</button>
                    <button onClick={() => { onAddMilestone?.(project.id, newMilestoneTitle); setNewMilestoneTitle(''); setShowMilestoneForm(false); }} className="px-6 py-2 bg-brand-500 text-white rounded-xl text-[10px] font-black uppercase">Add</button>
                  </div>
               </div>
             )}

             <div className="relative space-y-8 pl-12 border-l-4 border-slate-100 dark:border-white/5 ml-6">
                {project.milestones.map((m, idx) => {
                  const linkedAsset = project.resources.find(r => r.id === m.attachedAssetId);
                  return (
                    <div key={m.id} className="relative group">
                      <div className={`absolute -left-[64px] top-0 w-8 h-8 rounded-full border-4 border-white dark:border-zinc-950 shadow-2xl transition-all flex items-center justify-center ${m.status === 'completed' ? 'bg-emerald-500' : m.status === 'active' ? 'bg-brand-500 animate-pulse' : 'bg-slate-200 dark:bg-zinc-800'}`}>
                         {m.status === 'completed' && <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <div className="bg-white dark:bg-zinc-800/50 p-6 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm group-hover:shadow-xl transition-all">
                         <div className="flex justify-between items-start mb-4">
                           <span className={`text-[10px] font-black uppercase tracking-widest ${m.status === 'active' ? 'text-brand-600' : 'text-slate-400'}`}>Phase {idx + 1} &bull; {m.status}</span>
                           {isMember && (
                             <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button onClick={() => moveMilestone(idx, 'up')} className="p-1 hover:text-brand-500 transition-colors"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg></button>
                               <button onClick={() => moveMilestone(idx, 'down')} className="p-1 hover:text-brand-500 transition-colors"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></button>
                             </div>
                           )}
                         </div>
                         <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-4">{m.title}</h4>
                         {linkedAsset && (
                           <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-500 mb-6 bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/10"><svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.826L10.242 9.242" /></svg><span>{linkedAsset.title}</span></div>
                         )}
                         {isMember && m.status !== 'completed' && (
                           <button onClick={() => setSelectedMilestone(m)} className="w-full py-3 border-2 border-slate-100 dark:border-white/5 hover:border-brand-500/30 hover:bg-brand-500/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-600 transition-all">Mark as Complete</button>
                         )}
                      </div>
                    </div>
                  );
                })}
             </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="h-full flex flex-col glass-card rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10">
            {isMember ? <ChatWindow messages={messages} onSendMessage={handleSendMessage} currentUser={MOCK_USERS.find(u => u.id === currentUserId)!} placeholder="Message team..." /> : <div className="flex-1 flex flex-col items-center justify-center opacity-30 py-24"><p className="text-sm font-black uppercase tracking-widest">Team Chat is private</p></div>}
          </div>
        )}

        {activeTab === 'assets' && (
          <div className="space-y-12">
             <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Project Assets</h3>
                {isMember && <button onClick={() => setShowResForm(!showResForm)} className="px-6 py-3 vibrant-gradient text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-brand-500/20">{showResForm ? 'Cancel' : 'Add Asset'}</button>}
             </div>
             {showResForm && (
                <div className="bg-white dark:bg-zinc-800 p-10 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/10 animate-in slide-in-from-top-6">
                  <form onSubmit={handleAddRes} className="space-y-8">
                    <div className="flex space-x-2 p-1.5 bg-slate-100 dark:bg-zinc-950 rounded-2xl">
                      {(['link', 'doc', 'image', 'file', 'repo'] as const).map(type => <button key={type} type="button" onClick={() => setResType(type)} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${resType === type ? 'bg-brand-600 text-white' : 'text-slate-500'}`}>{type}</button>)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <input type="text" placeholder="Name this asset..." className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 p-5 rounded-2xl text-sm font-bold" value={resTitle} onChange={e => setResTitle(e.target.value)} required />
                      {resType === 'file' || resType === 'image' ? <input type="file" ref={fileInputRef} className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 p-4 rounded-2xl text-xs text-slate-500" /> : <input type="url" placeholder="https://..." className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 p-5 rounded-2xl text-sm font-mono" value={resUrl} onChange={e => setResUrl(e.target.value)} required />}
                    </div>
                    <button type="submit" className="w-full py-5 vibrant-gradient text-white rounded-2xl font-black text-xs uppercase shadow-2xl shadow-brand-500/20 transition-all">Upload Asset</button>
                  </form>
                </div>
             )}
             <div className="bg-white dark:bg-zinc-800/30 rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5">
                    <tr><th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Name</th><th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Type</th><th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Size</th><th className="px-10 py-6"></th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {project.resources?.map(res => (
                      <tr key={res.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all group"><td className="px-10 py-6"><span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{res.title}</span></td><td className="px-10 py-6"><span className="text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest bg-brand-500/10 px-4 py-1.5 rounded-full border border-brand-500/20">{res.type}</span></td><td className="px-10 py-6 font-bold text-[11px] text-slate-500 uppercase">{res.size || '--'}</td><td className="px-10 py-6 text-right"><a href={res.url} target="_blank" className="text-slate-400 hover:text-brand-500 inline-block p-3 hover:bg-brand-500/10 rounded-xl transition-all"><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg></a></td></tr>
                    ))}
                    {(!project.resources || project.resources.length === 0) && <tr><td colSpan={4} className="px-10 py-20 text-center text-sm font-bold text-slate-400 italic">No assets shared in this project node yet</td></tr>}
                  </tbody>
                </table>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectView;
