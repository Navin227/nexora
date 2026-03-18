import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChannelPanel from './components/ChannelPanel';
import ProjectView from './components/ProjectView';
import Profile from './components/Profile';
import Home from './components/Home';
import Explore from './components/Explore';
import CommunityDashboard from './components/CommunityDashboard';
import ChatWindow from './components/ChatWindow';
import MemberSidebar from './components/MemberSidebar';
import { MOCK_COMMUNITIES, MOCK_PROJECTS, MOCK_USERS } from './constants';
import { Community, Project, ChatMessage, User, Milestone, ProjectResource, ProjectStatus, JoinRequest } from './types';

const App: React.FC = () => {
  const [isLanding, setIsLanding] = useState(true);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [activeCommunityId, setActiveCommunityId] = useState<string | null>(null);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [view, setView] = useState<'home' | 'community' | 'profile' | 'explore' | 'community-preview' | 'user-profile'>('home');
  const [darkMode, setDarkMode] = useState(true);
  const [joinedCommunityIds, setJoinedCommunityIds] = useState<string[]>(['c1']);
  const [previewCommunity, setPreviewCommunity] = useState<Community | null>(null);
  
  // Simulation: start as a "new" user if we want to show onboarding
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'u-new',
    name: 'New Builder',
    role: 'Student',
    college: 'Your University',
    bio: '',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NewUser',
    skills: [],
    githubUrl: '',
    linkedinUrl: '',
    reputation: 0,
    hasOnboarded: false
  });
  
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [communities, setCommunities] = useState<Community[]>(MOCK_COMMUNITIES);
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [requests, setRequests] = useState<JoinRequest[]>([]);

  const [channelMessages, setChannelMessages] = useState<Record<string, ChatMessage[]>>({
    'ch1': [{ id: '1', senderId: 'u2', senderName: 'Sarah Chen', senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', content: 'Hey team! Ready to build something amazing today?', timestamp: '10:05 AM' }]
  });

  const [isCreatingCommunity, setIsCreatingCommunity] = useState(false);
  const [newCommunityData, setNewCommunityData] = useState({ name: '', description: '', firstMilestone: '' });
  
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectData, setNewProjectData] = useState({ 
    name: '', 
    description: '', 
    roles: '', 
    initialMilestones: ['Phase 1: Initial Research', 'Phase 2: MVP Design'] 
  });

  const [onboardingForm, setOnboardingForm] = useState({
    bio: '',
    interests: '',
    portfolio: '',
    github: '',
    linkedin: '',
    cv: ''
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  const activeCommunity = communities.find(c => c.id === activeCommunityId);
  const activeProject = projects.find(p => p.id === activeProjectId);
  const activeChannel = activeCommunity?.channels.find(c => c.id === activeChannelId);
  const communityProjects = projects.filter(p => p.communityId === activeCommunityId);
  const viewedUser = MOCK_USERS.find(u => u.id === selectedUserId) || (selectedUserId === currentUser.id ? currentUser : null) || MOCK_USERS[0];

  const handleSelectCommunity = (id: string | null) => {
    setActiveCommunityId(id);
    const community = communities.find(c => c.id === id);
    if (community) {
      setActiveChannelId(community.channels[0].id);
      setActiveProjectId(null);
      setView('community');
    } else {
      setView('home');
    }
  };

  const handleSelectChannel = (id: string) => {
    setActiveChannelId(id);
    setActiveProjectId(null);
    setView('community');
  };

  const handleSelectProject = (id: string) => {
    setActiveProjectId(id);
    setActiveChannelId(null);
    setView('community');
  };

  const handleViewProfile = (userId: string) => {
    setSelectedUserId(userId);
    setView('user-profile');
  };

  const handleLogin = () => {
    // Simulated Google Login
    setIsLanding(false);
    if (!currentUser.hasOnboarded) {
      setIsOnboarding(true);
    } else {
      setView('home');
    }
  };

  const handleOnboardingSubmit = () => {
    setCurrentUser(prev => ({
      ...prev,
      bio: onboardingForm.bio,
      skills: onboardingForm.interests.split(',').map(s => s.trim()).filter(s => s !== ''),
      portfolioUrl: onboardingForm.portfolio,
      githubUrl: onboardingForm.github,
      linkedinUrl: onboardingForm.linkedin,
      cvUrl: onboardingForm.cv,
      hasOnboarded: true
    }));
    setIsOnboarding(false);
    setView('home');
  };

  const handleUpdateMilestone = (projectId: string, milestoneId: string, updates: Partial<Milestone>) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const updatedMilestones = p.milestones.map(m => m.id === milestoneId ? { ...m, ...updates } : m);
      const allCompleted = updatedMilestones.length > 0 && updatedMilestones.every(m => m.status === 'completed');
      return {
        ...p,
        milestones: updatedMilestones,
        status: (allCompleted ? 'Completed' : p.status) as ProjectStatus
      };
    }));
  };

  const handleReorderMilestones = (projectId: string, milestones: Milestone[]) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, milestones } : p));
  };

  const handleAddMilestone = (projectId: string, title: string) => {
    const newMilestone: Milestone = {
      id: `m-${Date.now()}`,
      title,
      description: '',
      dueDate: '',
      status: 'pending'
    };
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, milestones: [...p.milestones, newMilestone] } : p));
  };

  const handleCreateCommunitySubmit = () => {
    if (!newCommunityData.name.trim()) return;
    const newId = `c${Date.now()}`;
    const newComm: Community = {
      id: newId,
      name: newCommunityData.name,
      description: newCommunityData.description,
      icon: '🚀',
      memberCount: 1,
      projectCount: 1,
      channels: [
        { id: `ch-gen-${newId}`, name: 'general', type: 'chat' },
        { id: `ch-pro-${newId}`, name: 'projects', type: 'chat' }
      ],
      tags: ['new-space'],
      createdBy: currentUser.id,
      roles: [{ id: 'r1', name: 'Maintainer', color: 'text-brand-500' }, { id: 'r2', name: 'Member', color: 'text-slate-500' }],
      members: [{ userId: currentUser.id, roleId: 'r1' }]
    };
    
    const initialProject: Project = {
      id: `p-init-${newId}`,
      name: `${newCommunityData.name} Initiation`,
      description: 'The starting project for this community.',
      communityId: newId,
      status: 'Ongoing',
      techStack: [],
      contributors: [currentUser.id],
      tasks: [],
      milestones: [{ id: 'm-init', title: newCommunityData.firstMilestone || 'Set up community foundation', description: '', dueDate: '', status: 'active' }],
      resources: [],
      createdBy: currentUser.id
    };

    setCommunities(prev => [...prev, newComm]);
    setProjects(prev => [...prev, initialProject]);
    setJoinedCommunityIds(prev => [...prev, newId]);
    setIsCreatingCommunity(false);
    setNewCommunityData({ name: '', description: '', firstMilestone: '' });
    handleSelectCommunity(newId);
  };

  const handleCreateProjectSubmit = () => {
    if (!newProjectData.name.trim() || !activeCommunityId) return;
    const newId = `p${Date.now()}`;
    const milestones: Milestone[] = newProjectData.initialMilestones.map((m, i) => ({
      id: `m${i}-${Date.now()}`,
      title: m,
      description: '',
      dueDate: '',
      status: i === 0 ? 'active' : 'pending'
    }));

    const newProject: Project = {
      id: newId,
      name: newProjectData.name,
      description: newProjectData.description,
      communityId: activeCommunityId,
      status: 'Proposed',
      techStack: [],
      contributors: [currentUser.id],
      tasks: [],
      milestones: milestones,
      resources: [],
      rolesNeeded: newProjectData.roles.split(',').map(r => r.trim()).filter(r => !!r),
      createdBy: currentUser.id
    };
    setProjects(prev => [...prev, newProject]);
    setIsCreatingProject(false);
    setNewProjectData({ name: '', description: '', roles: '', initialMilestones: ['Phase 1: Initial Research', 'Phase 2: MVP Design'] });
    setActiveProjectId(newId);
    setActiveChannelId(null);
  };

  const handleJoinCommunity = (id: string) => {
    const community = communities.find(c => c.id === id);
    if (!community) return;

    if (joinedCommunityIds.includes(id)) {
      setActiveCommunityId(id);
      setActiveChannelId(community.channels[0].id);
      setActiveProjectId(null);
      setView('community');
      return;
    }

    // Send request to owner
    const newRequest: JoinRequest = {
      id: `req-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      communityId: id,
      targetName: community.name,
      status: 'pending',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setRequests(prev => [...prev, newRequest]);
    alert(`Join request sent to ${community.name} moderator!`);
  };

  const handleJoinProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    if (project.contributors.includes(currentUser.id)) return;

    const newRequest: JoinRequest = {
      id: `req-p-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      projectId: projectId,
      targetName: project.name,
      status: 'pending',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setRequests(prev => [...prev, newRequest]);
    alert(`Join request sent to ${project.name} lead!`);
  };

  const handleAcceptRequest = (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    if (request.communityId) {
      setJoinedCommunityIds(prev => [...prev, request.communityId!]);
    } else if (request.projectId) {
      setProjects(prev => prev.map(p => p.id === request.projectId ? { ...p, contributors: [...p.contributors, request.userId] } : p));
    }

    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'accepted' } : r));
  };

  const handleSendMessage = (content: string) => {
    if (!activeChannelId) return;
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChannelMessages(prev => ({
      ...prev,
      [activeChannelId]: [...(prev[activeChannelId] || []), newMessage]
    }));
  };

  const handleStartProject = (projectId: string) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: 'Ongoing' } : p));
  };

  const handleAddResource = (projectId: string, title: string, url: string, type: ProjectResource['type'], size?: string) => {
    const newRes: ProjectResource = { id: `res-${Date.now()}`, title, url, type, size };
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, resources: [...p.resources, newRes] } : p));
  };

  const handleLogout = () => {
    setIsLanding(true);
    setView('home');
    setActiveCommunityId(null);
    // Reset simulation for next login
    setCurrentUser(prev => ({ ...prev, hasOnboarded: false }));
  };

  if (isLanding) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 overflow-hidden relative bg-white dark:bg-zinc-950 transition-colors duration-500">
        <div className="absolute inset-0 vibrant-gradient opacity-10 dark:opacity-20 pointer-events-none"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-500/20 blur-[150px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-accent/20 blur-[150px] rounded-full animate-pulse-slow"></div>
        
        <div className="max-w-4xl w-full relative z-10 text-center space-y-12 animate-in fade-in zoom-in duration-1000">
           <div className="inline-flex items-center space-x-2 px-5 py-2 glass-card rounded-full text-brand-600 dark:text-brand-300 text-xs font-bold tracking-widest uppercase border border-brand-500/30 shadow-xl shadow-brand-500/10">
             <span className="flex h-2.5 w-2.5 rounded-full bg-brand-500 mr-2 animate-ping"></span>
             Join the Crafting Era
           </div>
           
           <div className="space-y-6">
              <h1 className="text-8xl md:text-9xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">NEXORA</h1>
              <p className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-accent tracking-widest uppercase">Connect. Collab. Craft.</p>
              <p className="text-lg md:text-xl font-medium text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">The professional network for builders. Join communities, manage milestones, and grow your reputation through proof-of-work.</p>
           </div>

           <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
              <button 
                onClick={handleLogin}
                className="group relative px-10 py-5 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl border border-slate-200 dark:border-white/10 flex items-center space-x-4"
              >
                <img src="https://www.google.com/favicon.ico" className="w-6 h-6" alt="Google" />
                <span>Continue with Google</span>
              </button>
           </div>
        </div>
      </div>
    );
  }

  if (isOnboarding) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-6 transition-colors duration-500 relative overflow-hidden">
        <div className="absolute inset-0 vibrant-gradient opacity-5 pointer-events-none"></div>
        <div className="w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-[3rem] p-12 shadow-2xl border border-slate-200 dark:border-white/10 z-10 relative animate-in zoom-in duration-500">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Complete Profile</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-10 font-medium">Almost there! Tell the community what you craft.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Bio / Pitch</label>
                <textarea className="w-full bg-slate-50 dark:bg-zinc-950 border-2 border-slate-200 dark:border-white/5 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 text-sm h-32 transition-all font-medium" value={onboardingForm.bio} onChange={e => setOnboardingForm(p => ({ ...p, bio: e.target.value }))} placeholder="E.g. Full-stack dev obsessed with real-time systems..." />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Interests & Skills</label>
                <input type="text" className="w-full bg-slate-50 dark:bg-zinc-950 border-2 border-slate-200 dark:border-white/5 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-bold" value={onboardingForm.interests} onChange={e => setOnboardingForm(p => ({ ...p, interests: e.target.value }))} placeholder="React, Figma, Go, Python..." />
              </div>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">GitHub</label>
                  <input type="url" className="w-full bg-slate-50 dark:bg-zinc-950 border-2 border-slate-200 dark:border-white/5 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 text-sm" value={onboardingForm.github} onChange={e => setOnboardingForm(p => ({ ...p, github: e.target.value }))} placeholder="github.com/..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">LinkedIn</label>
                  <input type="url" className="w-full bg-slate-50 dark:bg-zinc-950 border-2 border-slate-200 dark:border-white/5 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 text-sm" value={onboardingForm.linkedin} onChange={e => setOnboardingForm(p => ({ ...p, linkedin: e.target.value }))} placeholder="linkedin.com/in/..." />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Portfolio / Website</label>
                <input type="url" className="w-full bg-slate-50 dark:bg-zinc-950 border-2 border-slate-200 dark:border-white/5 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 text-sm" value={onboardingForm.portfolio} onChange={e => setOnboardingForm(p => ({ ...p, portfolio: e.target.value }))} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">CV / Resume Link</label>
                <input type="url" className="w-full bg-slate-50 dark:bg-zinc-950 border-2 border-slate-200 dark:border-white/5 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 text-sm" value={onboardingForm.cv} onChange={e => setOnboardingForm(p => ({ ...p, cv: e.target.value }))} placeholder="Google Drive / Notion link..." />
              </div>
            </div>
          </div>
          <button onClick={handleOnboardingSubmit} className="w-full mt-12 py-5 vibrant-gradient text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-brand-500/30 hover:scale-[1.02] active:scale-95 transition-all">Launch My Journey</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-zinc-950 overflow-hidden text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      
      {/* Creation Modal: Community */}
      {isCreatingCommunity && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg p-10 rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300 border border-slate-200 dark:border-white/10">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8 tracking-tight uppercase">Create a Space</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Community Name</label>
                <input type="text" placeholder="e.g. Robotics Club" className="w-full bg-slate-100 dark:bg-zinc-950 border-2 border-slate-200 dark:border-white/5 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-bold" value={newCommunityData.name} onChange={e => setNewCommunityData(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Description</label>
                <textarea placeholder="What's the mission?" className="w-full bg-slate-100 dark:bg-zinc-950 border-2 border-slate-200 dark:border-white/5 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium h-24" value={newCommunityData.description} onChange={e => setNewCommunityData(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Starter Milestone</label>
                <input type="text" placeholder="e.g. Host first meetup" className="w-full bg-slate-100 dark:bg-zinc-950 border-2 border-slate-200 dark:border-white/5 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-bold" value={newCommunityData.firstMilestone} onChange={e => setNewCommunityData(p => ({ ...p, firstMilestone: e.target.value }))} />
              </div>
              <div className="flex space-x-4 pt-4">
                <button onClick={() => setIsCreatingCommunity(false)} className="flex-1 py-4 bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest">Cancel</button>
                <button onClick={handleCreateCommunitySubmit} className="flex-[2] py-4 vibrant-gradient text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-500/20">Create Space</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Creation Modal: Project */}
      {isCreatingProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-xl p-10 rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300 border border-slate-200 dark:border-white/10">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8 tracking-tight uppercase">Propose Project</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Project Name</label>
                <input type="text" placeholder="e.g. Open Source CLI" className="w-full bg-slate-100 dark:bg-zinc-950 border-2 border-slate-200 dark:border-white/5 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-bold" value={newProjectData.name} onChange={e => setNewProjectData(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Initial Milestones</label>
                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar p-1">
                  {newProjectData.initialMilestones.map((m, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <input type="text" className="flex-1 bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-white/5 p-3 rounded-xl text-xs font-bold" value={m} onChange={e => {
                        const next = [...newProjectData.initialMilestones];
                        next[idx] = e.target.value;
                        setNewProjectData(p => ({ ...p, initialMilestones: next }));
                      }} />
                      {idx > 0 && (
                        <button onClick={() => {
                          const next = newProjectData.initialMilestones.filter((_, i) => i !== idx);
                          setNewProjectData(p => ({ ...p, initialMilestones: next }));
                        }} className="p-2 text-rose-500 hover:scale-110 transition-transform">×</button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => setNewProjectData(p => ({ ...p, initialMilestones: [...p.initialMilestones, ''] }))} className="text-[9px] font-black text-brand-500 uppercase flex items-center space-x-1 py-1 hover:underline">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                    <span>Add Milestone</span>
                  </button>
                </div>
              </div>
              <div className="flex space-x-4 pt-4">
                <button onClick={() => setIsCreatingProject(false)} className="flex-1 py-4 bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest">Cancel</button>
                <button onClick={handleCreateProjectSubmit} className="flex-[2] py-4 bg-slate-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Propose</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Sidebar 
        activeCommunityId={view === 'explore' || view === 'community-preview' ? 'explore' : activeCommunityId} 
        joinedCommunities={communities.filter(c => joinedCommunityIds.includes(c.id))} 
        onSelectCommunity={handleSelectCommunity} 
        onOpenExplore={() => { setView('explore'); setActiveCommunityId(null); }} 
        onOpenProfile={() => { handleViewProfile(currentUser.id); }} 
        onOpenHome={() => { setView('home'); setActiveCommunityId(null); }} 
        onCreateCommunity={() => setIsCreatingCommunity(true)} 
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl z-20">
          <div className="flex items-center space-x-4">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{view.replace('-', ' ')}</span>
            {activeCommunity && (
              <>
                <span className="text-slate-300">/</span>
                <h1 className="text-sm font-black uppercase tracking-widest text-brand-600 dark:text-brand-400">{activeCommunity.name}</h1>
              </>
            )}
          </div>
          <div className="flex items-center space-x-4">
             <button onClick={() => setDarkMode(!darkMode)} className="p-3 bg-slate-100 dark:bg-white/5 rounded-xl hover:scale-110 active:scale-95 transition-all text-slate-500 dark:text-slate-400 hover:text-brand-500">
                {darkMode ? <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> : <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
             </button>
          </div>
        </header>

        <main className="flex-1 flex overflow-hidden">
          {view === 'home' && <Home joinedCount={joinedCommunityIds.length} currentUser={currentUser} onCreateCommunity={() => setIsCreatingCommunity(true)} onViewProfile={handleViewProfile} />}
          {view === 'explore' && <Explore joinedIds={joinedCommunityIds} onPreviewCommunity={community => { setPreviewCommunity(community); setView('community-preview'); }} />}
          {view === 'community-preview' && previewCommunity && <CommunityDashboard community={previewCommunity} onJoin={() => handleJoinCommunity(previewCommunity.id)} isJoined={joinedCommunityIds.includes(previewCommunity.id)} projects={projects} onCreateProject={() => setIsCreatingProject(true)} />}
          {view === 'community' && activeCommunity && (
            <>
              <ChannelPanel community={activeCommunity} projects={communityProjects} activeChannelId={activeChannelId} activeProjectId={activeProjectId} onSelectChannel={handleSelectChannel} onSelectProject={handleSelectProject} onCreateProject={() => setIsCreatingProject(true)} />
              <div className="flex-1 flex overflow-hidden bg-white dark:bg-zinc-900/10">
                {activeChannelId ? (
                  <ChatWindow messages={channelMessages[activeChannelId!] || []} onSendMessage={handleSendMessage} currentUser={currentUser} onViewProfile={handleViewProfile} placeholder={`Message in #${activeChannel?.name || 'general'}...`} />
                ) : activeProject ? (
                  <ProjectView project={activeProject} currentUserId={currentUser.id} onStartProject={handleStartProject} onAddResource={handleAddResource} onUpdateMilestone={handleUpdateMilestone} onReorderMilestones={handleReorderMilestones} onAddMilestone={handleAddMilestone} onJoinProject={handleJoinProject} />
                ) : (
                   <div className="flex-1 flex items-center justify-center opacity-30 text-[11px] font-black uppercase tracking-[0.4em] select-none italic">Select a channel or project to begin</div>
                )}
                <MemberSidebar community={activeCommunity} projectMembers={activeProject?.contributors} onViewProfile={handleViewProfile} />
              </div>
            </>
          )}
          {(view === 'profile' || view === 'user-profile') && <Profile user={viewedUser} onLogout={handleLogout} isOwnProfile={viewedUser.id === currentUser.id} onClose={() => setView(activeCommunityId ? 'community' : 'home')} requests={requests} onAcceptRequest={handleAcceptRequest} />}
        </main>
      </div>
    </div>
  );
};

export default App;