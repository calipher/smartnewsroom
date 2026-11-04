import React from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Calendar,
  Send,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Eye,
  Edit3,
} from 'lucide-react';
import { useNewsroom } from '../contexts/NewsroomContext';

interface DashboardPageProps {
  onNavigateTab: (tab: string) => void;
  onSelectStory: (storyId: string) => void;
  onOpenNewStory: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateTab,
  onSelectStory,
  onOpenNewStory,
}) => {
  const { currentOrg, currentUser, stories, departments, auditLogs, hasPermission } = useNewsroom();

  const isEditorOrAdmin =
    currentUser.role === 'platform_admin' ||
    currentUser.role === 'org_admin' ||
    currentUser.role === 'editor_in_chief' ||
    currentUser.role === 'section_editor';

  // Computed live metrics from stored stories
  const totalStories = stories.length;
  const draftStories = stories.filter((s) => s.status === 'in_progress' || s.status === 'proposed').length;
  const underReviewStories = stories.filter((s) => s.status === 'submitted' || s.status === 'under_review').length;
  const revisionRequiredStories = stories.filter((s) => s.status === 'revision_required').length;
  const approvedStories = stories.filter((s) => s.status === 'approved' || s.status === 'scheduled').length;
  const publishedStories = stories.filter((s) => s.status === 'published').length;

  const now = new Date();
  const overdueStories = stories.filter((s) => {
    return (
      s.status !== 'published' &&
      s.status !== 'archived' &&
      new Date(s.deadline) < now
    );
  }).length;

  // Journalist specific metrics
  const myAssignments = stories.filter((s) => s.assignedToUserId === currentUser.id);
  const myPendingSubmissions = myAssignments.filter((s) => s.status === 'submitted' || s.status === 'under_review').length;
  const myApprovedArticles = myAssignments.filter((s) => s.status === 'approved' || s.status === 'published').length;
  const myRevisionRequests = myAssignments.filter((s) => s.status === 'revision_required');

  // Category distribution
  const categoryCounts: Record<string, number> = {};
  stories.forEach((s) => {
    categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
  });

  // Department distribution
  const deptCounts: Record<string, number> = {};
  stories.forEach((s) => {
    const dept = departments.find((d) => d.id === s.departmentId);
    const deptName = dept ? dept.name : 'General';
    deptCounts[deptName] = (deptCounts[deptName] || 0) + 1;
  });

  // Recent submissions
  const recentSubmissions = [...stories]
    .filter((s) => s.status === 'submitted' || s.status === 'under_review' || s.status === 'revision_required')
    .slice(0, 5);

  // Upcoming deadlines (next 7 days)
  const upcomingDeadlines = [...stories]
    .filter((s) => s.status !== 'published' && s.status !== 'archived')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#14243A] via-slate-800 to-[#14243A] p-6 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-teal-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-teal-300">
                Bulawayo Digital Transformation Hub
              </span>
              <span className="text-xs text-slate-400">• ZMDTP / CSZ</span>
            </div>
            <h1 className="mt-2 font-serif text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Welcome back, {currentUser.name}
            </h1>
            <p className="mt-1 text-xs text-slate-300 max-w-2xl leading-relaxed">
              Managing editorial operations for <strong>{currentOrg.name}</strong>. Real-time newsroom telemetry, automated speech-to-text, and assistive AI under ethical journalism standards.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {hasPermission('assign_story') && (
              <button
                onClick={onOpenNewStory}
                className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-500 transition"
              >
                <Edit3 className="h-4 w-4" />
                <span>New Story Assignment</span>
              </button>
            )}
            <button
              onClick={() => onNavigateTab('ai_studio')}
              className="flex items-center gap-1.5 rounded-lg border border-teal-400/40 bg-teal-500/10 px-4 py-2 text-xs font-semibold text-teal-300 hover:bg-teal-500/20 transition"
            >
              <Sparkles className="h-4 w-4 text-teal-400" />
              <span>Launch AI Studio</span>
            </button>
          </div>
        </div>

        {/* Ambient subtle background grid */}
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* REVISION ALERT for Reporters */}
      {!isEditorOrAdmin && myRevisionRequests.length > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-bold">Action Required: {myRevisionRequests.length} Article Revisions Requested</p>
              <p className="text-[11px] text-amber-700">
                Editors have requested amendments on: {myRevisionRequests.map((r) => r.title).join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectStory(myRevisionRequests[0].id)}
            className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
          >
            Open First Revision
          </button>
        </div>
      )}

      {/* KPI METRICS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isEditorOrAdmin ? (
          <>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Total Stories</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                  <FileText className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">{totalStories}</p>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-teal-700 font-medium">
                <TrendingUp className="h-3 w-3" />
                <span>Across {departments.length} departments</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Awaiting Review</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Clock className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold text-amber-600">{underReviewStories}</p>
              <div className="mt-1 text-[11px] text-slate-500">
                {revisionRequiredStories > 0 ? `${revisionRequiredStories} in revision` : 'Ready for editor review'}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Approved & Ready</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold text-emerald-600">{approvedStories}</p>
              <div className="mt-1 text-[11px] text-slate-500">
                Ready for publication schedule
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Published Live</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Send className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold text-blue-600">{publishedStories}</p>
              <div className="mt-1 text-[11px] text-slate-500">
                Web, Broadcast & Socials
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">My Assignments</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                  <FileText className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">{myAssignments.length}</p>
              <div className="mt-1 text-[11px] text-teal-700 font-medium">
                Active reporting desk
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Pending Review</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Clock className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold text-amber-600">{myPendingSubmissions}</p>
              <div className="mt-1 text-[11px] text-slate-500">
                With section editors
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Revisions Needed</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                  <AlertTriangle className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold text-rose-600">{myRevisionRequests.length}</p>
              <div className="mt-1 text-[11px] text-rose-600 font-medium">
                Immediate action
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Approved / Published</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold text-emerald-600">{myApprovedArticles}</p>
              <div className="mt-1 text-[11px] text-slate-500">
                Cleared by newsdesk
              </div>
            </div>
          </>
        )}
      </div>

      {/* SECOND ROW: Workflow Distribution & Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Story Status Pipeline */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-serif text-sm font-bold text-slate-900">Editorial Pipeline</h2>
            <button
              onClick={() => onNavigateTab('stories')}
              className="flex items-center gap-1 text-[11px] font-semibold text-teal-600 hover:text-teal-700"
            >
              <span>Kanban Board</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {[
              { label: 'Proposed / Pitches', count: stories.filter((s) => s.status === 'proposed').length, color: 'bg-slate-400' },
              { label: 'Assigned to Reporters', count: stories.filter((s) => s.status === 'assigned').length, color: 'bg-sky-500' },
              { label: 'In Progress (Filing)', count: draftStories, color: 'bg-indigo-500' },
              { label: 'Awaiting Editor Review', count: underReviewStories, color: 'bg-amber-500' },
              { label: 'Revision Required', count: revisionRequiredStories, color: 'bg-rose-500' },
              { label: 'Approved & Scheduled', count: approvedStories, color: 'bg-emerald-500' },
              { label: 'Published Content', count: publishedStories, color: 'bg-teal-600' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1">
                  <span>{stat.label}</span>
                  <span className="font-bold text-slate-900">{stat.count}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full ${stat.color} transition-all duration-500`}
                    style={{
                      width: `${totalStories > 0 ? (stat.count / totalStories) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-600 border border-slate-100">
            <strong>Bulawayo Pilot SLA:</strong> Breaking news target turnaround is &lt; 45 mins; in-depth investigative turnaround is &lt; 5 days.
          </div>
        </div>

        {/* Stories by Department */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-serif text-sm font-bold text-slate-900">Stories by Department</h2>
            <button
              onClick={() => onNavigateTab('newsroom')}
              className="text-[11px] font-semibold text-teal-600 hover:text-teal-700"
            >
              View All
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {departments.map((dept) => {
              const count = deptCounts[dept.name] || 0;
              const target = dept.storyTargetMonthly || 15;
              const pct = Math.min(100, Math.round((count / target) * 100));

              return (
                <div key={dept.id} className="py-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{dept.name}</span>
                    <span className="text-slate-500">
                      <strong>{count}</strong> / {target} target
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 w-8 text-right">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Editorial Deadlines */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-serif text-sm font-bold text-slate-900">Upcoming Deadlines</h2>
            <button
              onClick={() => onNavigateTab('calendar')}
              className="flex items-center gap-1 text-[11px] font-semibold text-teal-600 hover:text-teal-700"
            >
              <span>Calendar</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="mt-3 space-y-2.5">
            {upcomingDeadlines.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">No pending deadlines</p>
            ) : (
              upcomingDeadlines.map((story) => {
                const deadlineDate = new Date(story.deadline);
                const isOverdue = deadlineDate < now;
                return (
                  <div
                    key={story.id}
                    onClick={() => onSelectStory(story.id)}
                    className="group cursor-pointer rounded-xl border border-slate-100 p-2.5 transition hover:border-teal-200 hover:bg-slate-50/70"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-900 group-hover:text-teal-700 line-clamp-1">
                        {story.title}
                      </p>
                      <span
                        className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold ${
                          isOverdue
                            ? 'bg-rose-100 text-rose-700 animate-pulse'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isOverdue ? 'OVERDUE' : 'DUE'}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Reporter: {story.assignedToUserName || story.authorName}</span>
                      <span>
                        {deadlineDate.toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* THIRD ROW: Submissions Awaiting Action & Newsroom Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submissions awaiting review */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-serif text-sm font-bold text-slate-900">Recent Submissions for Review</h2>
              <p className="text-[11px] text-slate-500">
                Articles and reports filed by journalists awaiting desk clearance
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('stories')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700"
            >
              Full Desk Queue
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-2">Story Headline</th>
                  <th className="pb-2">Reporter</th>
                  <th className="pb-2">Category</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No submissions awaiting review
                    </td>
                  </tr>
                ) : (
                  recentSubmissions.map((story) => (
                    <tr key={story.id} className="hover:bg-slate-50/60">
                      <td className="py-3 pr-3 font-semibold text-slate-900 max-w-xs">
                        <span className="line-clamp-1">{story.title}</span>
                      </td>
                      <td className="py-3 pr-3 text-slate-600 whitespace-nowrap">{story.authorName}</td>
                      <td className="py-3 pr-3">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                          {story.category}
                        </span>
                      </td>
                      <td className="py-3 pr-3 whitespace-nowrap">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                            story.status === 'revision_required'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {story.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => onSelectStory(story.id)}
                          className="inline-flex items-center gap-1 rounded bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-100"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Newsroom Activity / Audit Stream */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-serif text-sm font-bold text-slate-900">Latest Newsroom Activity</h2>
            <button
              onClick={() => onNavigateTab('security')}
              className="text-[11px] font-semibold text-teal-600 hover:text-teal-700"
            >
              Audit Log
            </button>
          </div>

          <div className="mt-3 space-y-3">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-start gap-2.5 text-xs">
                <span className="h-2 w-2 rounded-full bg-teal-500 shrink-0 mt-1.5" />
                <div className="flex-1">
                  <p className="font-medium text-slate-900">
                    <strong className="text-teal-900">{log.userName}</strong>: {log.details}
                  </p>
                  <span className="text-[10px] text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                    {log.action}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
