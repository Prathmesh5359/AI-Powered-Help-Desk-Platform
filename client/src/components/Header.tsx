import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, User as UserIcon, LogOut, Bell } from 'lucide-react';

export const Header: React.FC<{ onOpenNewTicket: () => void }> = ({ onOpenNewTicket }) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25">
          <Sparkles className="w-4 h-4 text-white" />
        </span>
        <div>
          <h1 className="font-bold text-slate-100 text-base leading-tight flex items-center gap-2">
            AI Help Desk <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">v1.0</span>
          </h1>
          <p className="text-xs text-slate-400">Automated Ticket Classification & Smart Agent Workspace</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onOpenNewTicket}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all active:scale-95"
        >
          + Submit Support Ticket
        </button>

        <div className="h-4 w-px bg-slate-800" />

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-slate-200">{user?.name}</div>
              <div className="text-[10px] text-slate-400 font-mono">{user?.role}</div>
            </div>
          </div>

          <button
            onClick={logout}
            title="Log out"
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
