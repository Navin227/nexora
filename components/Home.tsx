
import React, { useState } from 'react';
import { MOCK_DMS, MOCK_USERS } from '../constants';
import ChatWindow from './ChatWindow';
import { ChatMessage, User } from '../types';

interface HomeProps {
  joinedCount: number;
  currentUser: User;
  onCreateCommunity: () => void;
  onViewProfile?: (userId: string) => void;
}

const Home: React.FC<HomeProps> = ({ joinedCount, currentUser, onCreateCommunity, onViewProfile }) => {
  const [activeDmId, setActiveDmId] = useState<string | null>(null);
  const [dmHistory, setDmHistory] = useState<Record<string, ChatMessage[]>>({
    'dm1': [
      { id: '1', senderId: 'u2', senderName: 'Sarah Chen', senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', content: 'Hey! The new UI mockups are ready. Check them out when you can.', timestamp: '2:15 PM' }
    ]
  });

  const activeDm = MOCK_DMS.find(dm => dm.id === activeDmId);

  const handleSendMessage = (content: string) => {
    if (!activeDmId) return;
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setDmHistory(prev => ({
      ...prev,
      [activeDmId]: [...(prev[activeDmId] || []), newMessage]
    }));
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-transparent relative">
      <div className="flex-1 overflow-y-auto p-12 flex flex-col items-center justify-center relative custom-scrollbar">
        {!activeDmId ? (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 text-center max-w-2xl w-full">
            <div className="w-24 h-24 rounded-3xl vibrant-gradient flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-brand-500/30 text-white animate-float">
               <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            </div>
            <h2 className="text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter uppercase">Welcome Home</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-12 text-lg font-medium leading-relaxed max-w-md mx-auto">
              You're currently active in <span className="text-brand-600 dark:text-brand-400 font-bold">{joinedCount} communities</span>. Ready to collab on something new?
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button 
                onClick={onCreateCommunity} 
                className="px-12 py-4 vibrant-gradient text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-500/20"
              >
                Create a space
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col animate-in fade-in duration-500">
             <div className="flex items-center justify-between mb-8 px-6">
               <div className="flex items-center space-x-6">
                  <button onClick={() => setActiveDmId(null)} className="p-3 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-500 hover:text-brand-500 transition-all">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  </button>
                  <div className="flex items-center space-x-4">
                    <img src={activeDm?.senderAvatar} className="w-12 h-12 rounded-2xl border-2 border-brand-500/20" alt="" />
                    <div className="text-left">
                      <h3 className="font-black text-xl text-slate-900 dark:text-white tracking-tight uppercase">{activeDm?.senderName}</h3>
                      <span className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.2em]">Active Now</span>
                    </div>
                  </div>
               </div>
             </div>
             <div className="flex-1 glass-card rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/10">
                <ChatWindow 
                  messages={dmHistory[activeDmId] || []} 
                  onSendMessage={handleSendMessage} 
                  currentUser={currentUser}
                  onViewProfile={onViewProfile}
                  placeholder={`Message ${activeDm?.senderName.split(' ')[0]}...`}
                />
             </div>
          </div>
        )}
      </div>

      {/* DMs Sidebar */}
      <div className="w-80 bg-white dark:bg-zinc-950 border-l border-slate-200 dark:border-white/5 flex flex-col flex-shrink-0 z-10 transition-colors duration-300">
        <div className="p-10 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
          <h3 className="font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em] text-[10px]">Messages</h3>
          <button className="text-brand-500 p-2 hover:bg-brand-500/10 rounded-xl transition-all">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
          {MOCK_DMS.map((dm) => (
            <button 
              key={dm.id} 
              onClick={() => setActiveDmId(dm.id)}
              className={`w-full p-4 flex items-center space-x-5 transition-all rounded-[1.5rem] border group text-left ${activeDmId === dm.id ? 'bg-brand-500/10 border-brand-500/30 ring-4 ring-brand-500/5' : 'hover:bg-slate-50 dark:hover:bg-white/5 border-transparent'}`}
            >
              <div className="relative flex-shrink-0">
                <img src={dm.senderAvatar} className="w-12 h-12 rounded-2xl border-2 border-white dark:border-zinc-800 shadow-lg group-hover:scale-110 transition-transform duration-300" alt="" />
                {dm.unread && <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-accent border-2 border-white dark:border-zinc-950 rounded-full shadow-lg" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <span className={`text-sm font-black truncate uppercase tracking-tight ${dm.unread ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                    {dm.senderName}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 ml-2">{dm.timestamp}</span>
                </div>
                <p className={`text-xs truncate font-medium leading-relaxed ${dm.unread ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600'}`}>
                  {dm.lastMessage}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
