
import React from 'react';
import { ChatSession, AppMode } from '../types';
import { 
  Plus, 
  MessageSquare, 
  Settings, 
  BookOpen, 
  Lightbulb, 
  Globe,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  sessions, 
  currentSessionId, 
  onNewChat, 
  onSelectSession, 
  onDeleteSession,
  mode,
  setMode,
  isOpen,
  setIsOpen
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <Globe size={24} />
              </div>
              <div>
                <h1 className="font-bold text-xl text-slate-800">Zaki AI</h1>
                <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Assistant Inteligente</p>
              </div>
            </div>

            <button 
              onClick={onNewChat}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl flex items-center justify-center gap-2 font-medium transition-all shadow-md shadow-indigo-100 active:scale-95"
            >
              <Plus size={18} />
              New Conversation
            </button>
          </div>

          {/* Modes Section */}
          <div className="px-6 mb-6">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Specialized Modes</h2>
            <div className="space-y-1">
              {[
                { id: AppMode.GENERAL, label: 'General Assistant', icon: Globe },
                { id: AppMode.LEARNING, label: 'Learning Buddy', icon: BookOpen },
                { id: AppMode.BRAINSTORM, label: 'Brainstorming', icon: Lightbulb },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id as AppMode)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                    ${mode === m.id 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <m.icon size={18} className={mode === m.id ? 'text-indigo-600' : 'text-slate-400'} />
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* History */}
          <div className="flex-1 overflow-y-auto px-6">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Recent History</h2>
            <div className="space-y-1">
              {sessions.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">No chats yet</p>
              ) : (
                sessions.map((session) => (
                  <div 
                    key={session.id}
                    className={`group flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all
                      ${currentSessionId === session.id 
                        ? 'bg-slate-100 text-slate-900 border border-slate-200 shadow-sm' 
                        : 'text-slate-500 hover:bg-slate-50 border border-transparent'}`}
                    onClick={() => onSelectSession(session.id)}
                  >
                    <MessageSquare size={16} className={currentSessionId === session.id ? 'text-indigo-600' : 'text-slate-300'} />
                    <span className="flex-1 truncate text-sm">{session.title}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-100">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">
              <Settings size={18} />
              Settings
            </button>
          </div>
        </div>

        {/* Toggle Button for mobile when sidebar is hidden */}
        {!isOpen && (
          <button 
            onClick={() => setIsOpen(true)}
            className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-xl flex items-center justify-center z-50 transition-transform active:scale-90"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
