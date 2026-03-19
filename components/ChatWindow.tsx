
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, User } from '../types';

interface ChatWindowProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  currentUser: User;
  onViewProfile?: (userId: string) => void;
  placeholder?: string;
  isLoading?: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  messages, 
  onSendMessage, 
  currentUser, 
  onViewProfile, 
  placeholder = "Share your thoughts...",
  isLoading = false
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }, 0);
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim() || isLoading) return;
    onSendMessage(inputValue);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-50/50 dark:from-zinc-950/50 to-white dark:to-zinc-950">
      {/* Messages Container */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 md:p-12 space-y-6 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-brand-500/20 to-brand-accent/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-brand-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">No messages yet</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Start the conversation...</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isCurrentUser = msg.senderId === currentUser.id;
            const showAvatar = idx === 0 || messages[idx - 1].senderId !== msg.senderId;

            return (
              <div key={msg.id} className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                {showAvatar ? (
                  <button onClick={() => onViewProfile?.(msg.senderId)} className="flex-shrink-0 group relative">
                    <img 
                      src={msg.senderAvatar} 
                      className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 border-2 border-white dark:border-white/10 shadow-lg group-hover:scale-110 transition-all duration-300" 
                      alt={msg.senderName}
                    />
                    <div className="absolute inset-0 rounded-full bg-brand-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>
                ) : (
                  <div className="w-10 flex-shrink-0" />
                )}
                
                <div className={`flex-1 min-w-0 ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col`}>
                  {showAvatar && (
                    <div className="flex items-baseline gap-2 mb-1">
                      <button 
                        onClick={() => onViewProfile?.(msg.senderId)}
                        className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider hover:text-brand-500 transition-colors"
                      >
                        {msg.senderName}
                      </button>
                      <span className="text-[10px] font-medium text-slate-400">{msg.timestamp}</span>
                    </div>
                  )}
                  <div className={`px-4 py-3 rounded-2xl shadow-sm transition-all ${
                    isCurrentUser
                      ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-br-sm'
                      : 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-white/10 rounded-bl-sm'
                  }`}>
                    <p className="text-sm leading-relaxed font-medium break-words">
                      {msg.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-200 dark:border-white/5 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl p-6 md:p-8">
        <div className="relative flex items-end gap-3 max-w-4xl mx-auto">
          <div className="flex-1 flex flex-col gap-2">
            <textarea 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              placeholder={placeholder}
              disabled={isLoading}
              rows={1}
              className="w-full bg-slate-100 dark:bg-zinc-900 border-2 border-slate-200 dark:border-white/10 px-5 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/30 transition-all text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
              style={{
                minHeight: '44px',
                maxHeight: '120px',
                height: Math.min(Math.max(44, inputValue.split('\n').length * 20 + 24), 120)
              }}
            />
          </div>
          <button 
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim()}
            className="flex-shrink-0 p-3 bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative h-11"
          >
            {isLoading ? (
              <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2 px-2">Press Enter to send, Shift+Enter for new line</p>
      </div>
    </div>
  );
};

export default ChatWindow;
