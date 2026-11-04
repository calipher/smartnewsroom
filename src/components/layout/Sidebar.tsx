import React from 'react';
import {
  LayoutDashboard,
  Building2,
  FileText,
  Calendar,
  Sparkles,
  Mic,
  Languages,
  Film,
  Send,
  BarChart3,
  Users,
  Settings,
  ShieldCheck,
  CheckSquare,
  BookOpen,
  LogOut,
} from 'lucide-react';
import { useNewsroom } from '../../contexts/NewsroomContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isOpen,
  setIsOpen,
}) => {
  const { currentOrg, currentUser, stories, unreadNotificationsCount, logout } = useNewsroom();

  // Compute pending assignments for current user
  const myAssignmentsCount = stories.filter(
    (s) => s.assignedToUserId === currentUser.id && s.status !== 'published' && s.status !== 'archived'
  ).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'newsroom', label: 'Newsroom & Depts', icon: Building2 },
    {
      id: 'assignments',
      label: 'My Assignments',
      icon: CheckSquare,
      badge: myAssignmentsCount > 0 ? myAssignmentsCount : undefined,
    },
    { id: 'stories', label: 'Story Management', icon: FileText, count: stories.length },
    { id: 'editor', label: 'Article Editor', icon: BookOpen },
    { id: 'calendar', label: 'Editorial Calendar', icon: Calendar },
    {
      id: 'ai_studio',
      label: 'SmartNewsroom AI',
      icon: Sparkles,
      highlight: true,
      tag: 'Gemini 3.8',
    },
    { id: 'transcription', label: 'Transcription Studio', icon: Mic },
    { id: 'translation', label: 'Translation Studio', icon: Languages, tag: 'Ndebele/Shona' },
    { id: 'multimedia', label: 'Multimedia Library', icon: Film },
    { id: 'publishing', label: 'Publishing Centre', icon: Send },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'settings', label: 'Org Settings', icon: Settings },
    { id: 'security', label: 'Security & Audit', icon: ShieldCheck },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col bg-[#14243A] text-slate-100 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="border-b border-slate-700/60 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-900/40">
              <span className="font-serif text-2xl font-bold tracking-tight">S</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-lg font-bold tracking-tight text-white">
                  SmartNewsroom
                </span>
                <span className="rounded-md bg-teal-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-teal-300">
                  ZIM
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400">
                Bulawayo Pilot • ZMDTP
              </p>
            </div>
          </div>

          {/* Active Organisation Pill */}
          <div className="mt-3.5 flex items-center justify-between rounded-lg bg-slate-800/80 px-3 py-2 border border-slate-700/60">
            <div className="truncate">
              <p className="text-[10px] uppercase tracking-wider text-slate-400">Active Newsroom</p>
              <p className="truncate text-xs font-semibold text-teal-400">{currentOrg.name}</p>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" title="Online & Isolated" />
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Editorial Workflow
          </div>
          {navItems.slice(0, 6).map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-slate-950">
                    {item.badge}
                  </span>
                )}
                {item.count !== undefined && !item.badge && (
                  <span className="text-[11px] text-slate-400">{item.count}</span>
                )}
              </button>
            );
          })}

          <div className="pt-4 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            AI & Production Studios
          </div>
          {navItems.slice(6, 11).map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-sm'
                    : item.highlight
                    ? 'bg-gradient-to-r from-teal-950/60 to-slate-800 text-teal-300 hover:text-white'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 ${
                      isActive ? 'text-white' : item.highlight ? 'text-teal-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.tag && (
                  <span className="rounded bg-teal-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-teal-300">
                    {item.tag}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-4 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Management & Governance
          </div>
          {navItems.slice(11).map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}

          <div className="pt-4 px-1">
            <button
              onClick={() => {
                if (window.confirm('Log out of SmartNewsroom Zimbabwe?')) {
                  logout();
                }
              }}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition"
            >
              <div className="flex items-center gap-3">
                <LogOut className="h-4 w-4 text-rose-400" />
                <span>Sign Out</span>
              </div>
            </button>
          </div>
        </div>

        {/* Footer info: CSZ Initiative */}
        <div className="border-t border-slate-700/60 p-3.5 text-center">
          <p className="text-[11px] font-semibold text-slate-300">
            Computer Society of Zimbabwe (CSZ)
          </p>
          <p className="text-[10px] text-slate-400">
            Zimbabwe Media Digital Transformation
          </p>
        </div>
      </aside>
    </>
  );
};
