
import React from 'react';
import { Community, User, Role } from '../types';
import { MOCK_USERS } from '../constants';

interface MemberSidebarProps {
  community: Community;
  projectMembers?: string[];
  onViewProfile?: (userId: string) => void;
}

const MemberSidebar: React.FC<MemberSidebarProps> = ({ community, projectMembers, onViewProfile }) => {
  const getMembersInRole = (roleId: string) => {
    let members = community.members.filter(m => m.roleId === roleId);
    if (projectMembers) {
      members = members.filter(m => projectMembers.includes(m.userId));
    }
    return members;
  };

  const currentCount = projectMembers ? projectMembers.length : community.memberCount;

  return (
    <div className="w-72 bg-white dark:bg-zinc-950 border-l border-slate-200 dark:border-white/5 flex flex-col flex-shrink-0 h-full relative z-10 shadow-2xl transition-colors duration-300">
      <div className="p-10 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-zinc-900/10">
        <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-3">
          {projectMembers ? 'Active Members' : 'Community Members'}
        </h3>
        <p className="text-[11px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest">{currentCount} Verified Nodes</p>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-12 custom-scrollbar">
        {community.roles.map(role => {
          const members = getMembersInRole(role.id);
          if (members.length === 0) return null;
          return (
            <div key={role.id}>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 px-3 flex items-center">
                <span className="w-4 h-1 bg-brand-500/20 mr-3 rounded-full"></span>
                {role.name} &bull; {members.length}
              </h4>
              <div className="space-y-2">
                {members.map(member => {
                  const user = MOCK_USERS.find(u => u.id === member.userId);
                  if (!user) return null;
                  return (
                    <button 
                      key={user.id} 
                      onClick={() => onViewProfile?.(user.id)}
                      className="w-full flex items-center space-x-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-all group text-left border border-transparent hover:border-slate-200 dark:hover:border-white/5"
                    >
                      <div className="relative">
                        <img src={user.avatar} className="w-10 h-10 rounded-2xl border-2 border-white dark:border-zinc-800 shadow-lg group-hover:scale-110 transition-transform duration-300" alt="" />
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-zinc-950 rounded-full shadow-lg" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-xs font-black truncate group-hover:text-brand-600 dark:group-hover:text-white transition-colors uppercase tracking-tight block ${role.color}`}>
                          {user.name}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter block mt-1">Contributor</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MemberSidebar;
