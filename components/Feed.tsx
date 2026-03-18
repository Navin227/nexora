
import React from 'react';

const Feed: React.FC = () => {
  const events = [
    { id: 1, type: 'project', user: 'Sarah Chen', action: 'proposed a new project', target: 'AR Navigation Kit', community: 'AI / ML', time: '10m ago' },
    { id: 2, type: 'milestone', user: 'Nexora Core', action: 'reached 50 contributors', target: '', community: 'Web Development', time: '1h ago' },
    { id: 3, type: 'join', user: 'Devin Page', action: 'joined', target: 'Cybersecurity', community: 'Cybersecurity', time: '2h ago' },
    { id: 4, type: 'project', user: 'Alex Rivers', action: 'updated task "API Integration"', target: 'Nexora Core', community: 'Web Development', time: '3h ago' },
  ];

  return (
    <div className="flex-1 bg-[#0f172a] p-8 overflow-y-auto custom-scrollbar">
      <div className="max-w-3xl mx-auto space-y-12">
        <header>
          <h1 className="text-4xl font-bold text-white mb-2">Morning, Alex!</h1>
          <p className="text-slate-400">Here's what's happening in your communities today.</p>
        </header>

        <section className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Global Activity</h2>
          </div>

          <div className="space-y-4">
            {events.map(event => (
              <div key={event.id} className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 flex items-start space-x-4 hover:bg-slate-800/40 transition-all cursor-pointer">
                <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${
                  event.type === 'project' ? 'bg-indigo-500/20 text-indigo-400' :
                  event.type === 'milestone' ? 'bg-teal-500/20 text-teal-400' : 'bg-slate-700/50 text-slate-400'
                }`}>
                  {event.type === 'project' && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                  )}
                  {event.type === 'milestone' && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z"></path></svg>
                  )}
                  {event.type === 'join' && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-slate-200 text-sm">
                      <span className="font-bold text-white">{event.user}</span> {event.action} <span className="text-indigo-400 font-bold">{event.target}</span>
                    </p>
                    <span className="text-[10px] text-slate-500 font-medium">{event.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{event.community}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Feed;
