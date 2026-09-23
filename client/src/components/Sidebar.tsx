import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Ticket, Users, Sparkles, BookOpen } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Tickets Queue', path: '/tickets', icon: <Ticket className="w-4 h-4" /> },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ label: 'User Management', path: '/users', icon: <Users className="w-4 h-4" /> });
  }

  return (
    <aside className="w-60 border-r border-slate-800 bg-[#0f172a]/60 backdrop-blur-lg flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
            Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/30 shadow-inner'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-3.5 rounded-xl bg-gradient-to-b from-blue-900/20 to-indigo-900/20 border border-blue-500/20 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-300">
            <Sparkles className="w-4 h-4 text-blue-400" />
            AI Intelligence Active
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Auto-categorizes inbound emails, builds ticket summaries & suggests responses from knowledge base.
          </p>
        </div>
      </div>

      <div className="text-center text-[10px] text-slate-600 py-2 border-t border-slate-800/80">
        AI Help Desk Workspace
      </div>
    </aside>
  );
};
