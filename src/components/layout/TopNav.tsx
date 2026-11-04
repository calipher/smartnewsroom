import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  Check,
  Building,
  UserCheck,
  RotateCcw,
  Plus,
  HelpCircle,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import { useNewsroom } from '../../contexts/NewsroomContext';
import { UserRole } from '../../types';

interface TopNavProps {
  onToggleSidebar: () => void;
  onOpenNewStoryModal: () => void;
  onSelectStory?: (storyId: string) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onToggleSidebar,
  onOpenNewStoryModal,
  onSelectStory,
}) => {
  const {
    currentOrg,
    currentUser,
    logout,
    allOrganizations,
    switchOrganization,
    switchUserRole,
    notifications,
    unreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead,
    stories,
    resetDemoData,
    hasPermission,
  } = useNewsroom();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Africa/Harare local formatted date
  const nowInHarare = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Harare',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    weekday: 'short',
  }).format(new Date());

  // Search filter
  const searchResults = searchQuery.trim()
    ? stories.filter(
        (s) =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.authorName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const rolesList: { role: UserRole; label: string; desc: string }[] = [
    { role: 'platform_admin', label: 'Platform Administrator', desc: 'CSZ Lead - System & Multi-Org Gov' },
    { role: 'org_admin', label: 'Organisation Administrator', desc: 'Managing Director - Org & Depts' },
    { role: 'editor_in_chief', label: 'Editor-in-Chief', desc: 'Approvals, Schedules & Newsroom Lead' },
    { role: 'section_editor', label: 'Section Editor', desc: 'Desk Assignments & Submissions Review' },
    { role: 'journalist', label: 'Journalist / Reporter', desc: 'Writing, AI Assistant & Submissions' },
    { role: 'multimedia_producer', label: 'Multimedia Producer', desc: 'Audio, Video, Subtitles & Podcast' },
    { role: 'viewer', label: 'Read-only Observer', desc: 'Board Auditor / Read-only Access' },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 flex flex-col border-b border-slate-200 bg-white shadow-xs">
        {/* Top Demo Bar / Role Selector Banner */}
        <div className="flex flex-wrap items-center justify-between border-b border-teal-800/10 bg-gradient-to-r from-slate-900 via-[#14243A] to-slate-900 px-4 py-1.5 text-xs text-white">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="rounded bg-teal-500/20 px-2 py-0.5 text-[10px] font-bold tracking-wide text-teal-300">
              DEMO MODE
            </span>
            <span className="hidden sm:inline text-[11px] text-slate-300">
              Active Role: <strong className="text-teal-300 capitalize">{currentUser.role.replace(/_/g, ' ')}</strong> ({currentUser.name})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Switch Role Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowRoleDropdown(!showRoleDropdown);
                  setShowOrgDropdown(false);
                }}
                className="flex items-center gap-1.5 rounded bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition"
              >
                <UserCheck className="h-3 w-3 text-teal-400" />
                <span>Switch Role</span>
                <span className="text-[10px] text-teal-400">▾</span>
              </button>

              {showRoleDropdown && (
                <div className="absolute right-0 top-full mt-1 w-64 rounded-xl border border-slate-200 bg-white p-1 text-slate-800 shadow-xl z-50">
                  <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100">
                    Demonstration Roles
                  </div>
                  {rolesList.map((r) => (
                    <button
                      key={r.role}
                      onClick={() => {
                        switchUserRole(r.role);
                        setShowRoleDropdown(false);
                      }}
                      className={`flex w-full flex-col rounded-lg px-3 py-1.5 text-left transition ${
                        currentUser.role === r.role
                          ? 'bg-teal-50 text-teal-900 font-semibold'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs">{r.label}</span>
                        {currentUser.role === r.role && <Check className="h-3.5 w-3.5 text-teal-600" />}
                      </div>
                      <span className="text-[10px] text-slate-600">{r.desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reset Demo Data Button */}
            <button
              onClick={() => {
                if (window.confirm('Reset all demo data back to initial Zimbabwean pilot state?')) {
                  resetDemoData();
                }
              }}
              title="Reset sample newsroom data"
              className="flex items-center gap-1 rounded bg-slate-800/80 px-2 py-1 text-[11px] font-medium text-slate-300 hover:bg-slate-700 hover:text-rose-300 transition"
            >
              <RotateCcw className="h-3 w-3" />
              <span className="hidden md:inline">Reset Data</span>
            </button>
          </div>
        </div>

        {/* Main Header Row */}
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Toggle */}
            <button
              onClick={onToggleSidebar}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Toggle navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Organisation Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowOrgDropdown(!showOrgDropdown);
                  setShowRoleDropdown(false);
                }}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-left transition hover:bg-slate-100"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded bg-[#14243A] text-white">
                  <Building className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">{currentOrg.name}</span>
                    <span className="text-[10px] text-slate-600">▾</span>
                  </div>
                  <span className="text-[10px] text-slate-600 capitalize">
                    {currentOrg.type.replace(/_/g, ' ')} • {currentOrg.city}
                  </span>
                </div>
              </button>

              {showOrgDropdown && (
                <div className="absolute left-0 top-full mt-1.5 w-72 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100">
                    Switch Media Organisation
                  </div>
                  {allOrganizations.map((org) => (
                    <button
                      key={org.id}
                      onClick={() => {
                        switchOrganization(org.id);
                        setShowOrgDropdown(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition ${
                        currentOrg.id === org.id
                          ? 'bg-teal-50 text-teal-900 font-semibold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-medium">{org.name}</p>
                        <p className="text-[10px] text-slate-600">{org.province} • {org.type.replace(/_/g, ' ')}</p>
                      </div>
                      {currentOrg.id === org.id && <Check className="h-4 w-4 text-teal-600" />}
                    </button>
                  ))}
                  <div className="p-2 border-t border-slate-100 text-[10px] text-slate-600 italic">
                    Strict isolation: One newsroom cannot view another&apos;s unpublished stories or internal documents.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center Search Bar */}
          <div className="relative mx-4 hidden max-w-md flex-1 md:block">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search stories, topics, reporters (e.g., Belmont, NUST, Luveve)..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && searchQuery.trim() && (
              <div className="absolute left-0 right-0 top-full mt-1 max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50">
                <div className="flex items-center justify-between px-2 pb-1 text-[10px] font-bold uppercase text-slate-600">
                  <span>Results ({searchResults.length})</span>
                  <button onClick={() => setShowSearchResults(false)} className="text-slate-600 hover:text-slate-900">
                    ✕
                  </button>
                </div>
                {searchResults.length === 0 ? (
                  <p className="p-3 text-center text-xs text-slate-600">No matching stories found</p>
                ) : (
                  searchResults.map((story) => (
                    <button
                      key={story.id}
                      onClick={() => {
                        if (onSelectStory) onSelectStory(story.id);
                        setShowSearchResults(false);
                        setSearchQuery('');
                      }}
                      className="flex w-full flex-col rounded-lg p-2 text-left hover:bg-slate-50 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-900 line-clamp-1">{story.title}</span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-600 capitalize">
                          {story.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-600">
                        {story.category} • {story.authorName} • {story.wordCount} words
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Right Actions: Date, Notification, Help, New Story */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Current Harare Date */}
            <div className="hidden lg:block text-right">
              <p className="text-xs font-semibold text-slate-800">{nowInHarare}</p>
              <p className="text-[10px] text-slate-600">Harare / Bulawayo (CAT)</p>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                aria-label="View notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white shadow-xl z-50">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <span className="text-xs font-bold text-slate-900">Notifications</span>
                    {unreadNotificationsCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[11px] font-medium text-teal-600 hover:text-teal-700"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-center text-xs text-slate-600">No notifications yet</p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => markNotificationRead(notif.id)}
                          className={`p-3 text-left transition hover:bg-slate-50 cursor-pointer ${
                            !notif.read ? 'bg-teal-50/40' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-semibold text-slate-900">{notif.title}</p>
                            {!notif.read && <span className="h-2 w-2 rounded-full bg-teal-500 shrink-0 mt-1" />}
                          </div>
                          <p className="mt-0.5 text-xs text-slate-600">{notif.message}</p>
                          <p className="mt-1 text-[10px] text-slate-600">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Help / Program Guide Modal trigger */}
            <button
              onClick={() => setShowHelpModal(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
              title="About ZMDTP & SmartNewsroom Zimbabwe"
            >
              <HelpCircle className="h-5 w-5" />
            </button>

            {/* Action Button: Create Story Assignment */}
            {hasPermission('assign_story') && (
              <button
                onClick={onOpenNewStoryModal}
                className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 transition"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Story</span>
              </button>
            )}

            {/* User Avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <img
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80'}
                alt={currentUser.name}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-teal-500/30"
              />
              <div className="hidden xl:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight">{currentUser.name}</p>
                <p className="text-[10px] text-slate-600 capitalize">{currentUser.role.replace(/_/g, ' ')}</p>
              </div>
              <button
                onClick={() => {
                  if (window.confirm('Log out of SmartNewsroom Zimbabwe?')) {
                    logout();
                  }
                }}
                className="ml-1 rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                title="Sign Out / Lock Newsroom"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Program Information Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 text-white font-serif font-bold text-2xl">
                S
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900">SmartNewsroom Zimbabwe</h3>
                <p className="text-xs text-teal-700 font-medium">
                  Zimbabwe Media Digital Transformation Programme (ZMDTP)
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                <strong>SMARTNEWSROOM ZIMBABWE</strong> is an integrated digital platform proposed by the{' '}
                <strong></strong> to modernize editorial workflows and empower journalists with advanced AI capabilities.
              </p>
              <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                <p className="font-semibold text-slate-800">Bulawayo Pilot Deployment</p>
                <p className="text-[11px] text-slate-600">
                  Piloted initially in Bulawayo across digital, print, and community broadcast newsrooms before scaling nationally to media houses across Zimbabwe.
                </p>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                <li>Strict multi-tenant organisation isolation</li>
                <li>8-stage editorial review workflow & audit trail</li>
                <li>AI assistant for fact-checking, outlines, and headline generation</li>
                <li>Multilingual studio supporting English, isiNdebele, and Shona</li>
                <li>Audio transcription for newsroom field interviews</li>
              </ul>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700"
              >
                Close Briefing
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
