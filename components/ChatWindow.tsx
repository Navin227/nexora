
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, User } from '../types';

interface ChatWindowProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  currentUser: User;
  onViewProfile?: (userId: string) => void;
  placeholder?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onSendMessage, currentUser, onViewProfile, placeholder = "Say hello..." }) => {
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    onSendMessage(inputValue);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20 select-none text-center">
            <p className="text-sm font-black uppercase tracking-[0.4em] text-slate-500 dark:text-white">Start the conversation</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="group flex items-start space-x-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <button onClick={() => onViewProfile?.(msg.senderId)} className="flex-shrink-0 relative">
                <img src={msg.senderAvatar} className="w-12 h-12 rounded-[1.2rem] bg-slate-100 dark:bg-zinc-800 border-2 border-white dark:border-white/10 shadow-lg group-hover:scale-110 transition-all duration-300" alt="" />
                <div className="absolute inset-0 rounded-[1.2rem] bg-brand-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline space-x-4 mb-2">
                  <button onClick={() => onViewProfile?.(msg.senderId)} className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest hover:text-brand-600 transition-colors">
                    {msg.senderName}
                  </button>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{msg.timestamp}</span>
                </div>
                <div className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {msg.content}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="p-10 border-t border-slate-200 dark:border-white/5 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-3xl">
        <div className="relative flex items-center group max-w-5xl mx-auto">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder} 
            className="w-full bg-slate-100 dark:bg-zinc-900/50 border-2 border-slate-200 dark:border-white/5 pl-8 pr-20 py-6 rounded-[2rem] outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500/30 transition-all text-base font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
          />
          <button 
            onClick={handleSend}
            className="absolute right-4 p-4 vibrant-gradient text-white rounded-2xl hover:scale-105 transition-all shadow-xl shadow-brand-500/30 active:scale-95"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
