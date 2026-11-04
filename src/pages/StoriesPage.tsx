import React, { useState } from 'react';
import {
  FileText,
  LayoutGrid,
  List,
  Filter,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Send,
  RotateCcw,
} from 'lucide-react';
import { useNewsroom } from '../contexts/NewsroomContext';
import { Story, StoryStatus, StoryPriority, StoryFormat } from '../types';

interface StoriesPageProps {
  onSelectStory: (storyId: string) => void;
  onOpenNewStory: () => void;
  filterDepartmentId?: string;
}

export const StoriesPage: React.FC<StoriesPageProps> = ({
  onSelectStory,
  onOpenNewStory,
  filterDepartmentId,
}) => {
  const {
    stories,
    departments,
    allUsers,
    currentOrg,
    currentUser,
    transitionStoryStatus,
    deleteStory,
    hasPermission,
  } = useNewsroom();

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState(filterDepartmentId || 'all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState('all');

  // Kanban columns
  const kanbanColumns: { id: StoryStatus; title: string; color: string; badgeColor: string }[] = [
    { id: 'proposed', title: 'Pitches / Proposed', color: 'border-slate-300', badgeColor: 'bg-slate-100 text-slate-700' },
    { id: 'assigned', title: 'Assigned to Reporter', color: 'border-sky-300', badgeColor: 'bg-sky-100 text-sky-800' },
    { id: 'in_progress', title: 'In Progress (Writing)', color: 'border-indigo-300', badgeColor: 'bg-indigo-100 text-indigo-800' },
    { id: 'submitted', title: 'Submitted for Review', color: 'border-amber-300', badgeColor: 'bg-amber-100 text-amber-800' },
    { id: 'under_review', title: 'Under Editorial Review', color: 'border-amber-400', badgeColor: 'bg-amber-200 text-amber-900' },
    { id: 'revision_required', title: 'Revision Requested', color: 'border-rose-400', badgeColor: 'bg-rose-100 text-rose-800' },
    { id: 'approved', title: 'Approved by Editor', color: 'border-emerald-300', badgeColor: 'bg-emerald-100 text-emerald-800' },
    { id: 'scheduled', title: 'Scheduled for Publication', color: 'border-teal-400', badgeColor: 'bg-teal-100 text-teal-800' },
    { id: 'published', title: 'Published Live', color: 'border-teal-600', badgeColor: 'bg-teal-600 text-white' },
  ];

  // Filtering stories
  const filteredStories = stories.filter((story) => {
    if (selectedDept !== 'all' && story.departmentId !== selectedDept) return false;
    if (selectedPriority !== 'all' && story.priority !== selectedPriority) return false;
    if (selectedStatus !== 'all' && story.status !== selectedStatus) return false;
    if (selectedFormat !== 'all' && story.format !== selectedFormat) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        story.title.toLowerCase().includes(q) ||
        story.category.toLowerCase().includes(q) ||
        story.authorName.toLowerCase().includes(q) ||
        (story.assignedToUserName && story.assignedToUserName.toLowerCase().includes(q)) ||
        story.tags.some((t) => t.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const getPriorityBadge = (p: StoryPriority) => {
    switch (p) {
      case 'urgent':
        return <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-700">URGENT</span>;
      case 'high':
        return <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">HIGH</span>;
      case 'normal':
        return <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-medium text-emerald-700">NORMAL</span>;
      case 'low':
        return <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-600">LOW</span>;
    }
  };

  const getNextStatusAction = (currentStatus: StoryStatus) => {
    switch (currentStatus) {
      case 'proposed':
        return { next: 'assigned' as StoryStatus, label: 'Assign Story', can: hasPermission('assign_story') };
      case 'assigned':
        return { next: 'in_progress' as StoryStatus, label: 'Start Writing', can: hasPermission('write_article') };
      case 'in_progress':
        return { next: 'submitted' as StoryStatus, label: 'Submit for Review', can: hasPermission('submit_story') };
      case 'submitted':
        return { next: 'under_review' as StoryStatus, label: 'Begin Review', can: hasPermission('approve_story') };
      case 'under_review':
        return { next: 'approved' as StoryStatus, label: 'Approve Story', can: hasPermission('approve_story') };
      case 'revision_required':
        return { next: 'submitted' as StoryStatus, label: 'Resubmit', can: hasPermission('write_article') };
      case 'approved':
        return { next: 'scheduled' as StoryStatus, label: 'Schedule Release', can: hasPermission('publish_story') };
      case 'scheduled':
        return { next: 'published' as StoryStatus, label: 'Publish Live', can: hasPermission('publish_story') };
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-900">Story Management Desk</h1>
          <p className="text-xs text-slate-500">
            Multi-stage editorial tracking, assignment routing, and approvals for{' '}
            <strong>{currentOrg.name}</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === 'kanban' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Kanban Board</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === 'table' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>Table View</span>
            </button>
          </div>

          {hasPermission('assign_story') && (
            <button
              onClick={onOpenNewStory}
              className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 transition"
            >
              <Plus className="h-4 w-4" />
              <span>New Story</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search headline, reporter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden"
            >
              <option value="all">All Departments ({departments.length})</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">🔴 Urgent / Breaking</option>
              <option value="high">🟠 High Priority</option>
              <option value="normal">🟢 Normal</option>
              <option value="low">⚪ Low</option>
            </select>
          </div>

          {/* Format Filter */}
          <div>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden"
            >
              <option value="all">All Story Formats</option>
              <option value="news_article">News Article</option>
              <option value="radio_bulletin">Radio Bulletin</option>
              <option value="tv_report">Television Report</option>
              <option value="feature_article">Feature Article</option>
              <option value="investigative_report">Investigative Report</option>
              <option value="podcast">Podcast</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Showing <strong>{filteredStories.length}</strong> of {stories.length} stories
            </span>
            {(selectedDept !== 'all' || selectedPriority !== 'all' || selectedFormat !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedDept('all');
                  setSelectedPriority('all');
                  setSelectedFormat('all');
                  setSearchQuery('');
                }}
                className="text-[11px] font-semibold text-rose-600 hover:underline"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1">
          {kanbanColumns.map((col) => {
            const colStories = filteredStories.filter((s) => s.status === col.id);

            return (
              <div
                key={col.id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-slate-100/70 p-3 w-80 shrink-0"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{col.title}</span>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${col.badgeColor}`}>
                    {colStories.length}
                  </span>
                </div>

                {/* Column Story Cards */}
                <div className="mt-3 space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-320px)] pr-1">
                  {colStories.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                      No stories in this column
                    </div>
                  ) : (
                    colStories.map((story) => {
                      const nextAction = getNextStatusAction(story.status);
                      const dept = departments.find((d) => d.id === story.departmentId);

                      return (
                        <div
                          key={story.id}
                          className="group rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-teal-400 hover:shadow-xs transition"
                        >
                          {/* Card Category & Priority */}
                          <div className="flex items-center justify-between gap-1">
                            <span className="rounded bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                              {dept?.code || story.category}
                            </span>
                            {getPriorityBadge(story.priority)}
                          </div>

                          {/* Story Title */}
                          <h4
                            onClick={() => onSelectStory(story.id)}
                            className="mt-2 font-serif text-xs font-bold text-slate-900 line-clamp-2 hover:text-teal-700 cursor-pointer"
                          >
                            {story.title}
                          </h4>

                          {/* Summary snippet */}
                          <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {story.summary}
                          </p>

                          {/* Assignee & Deadline */}
                          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-500">
                            <span className="truncate max-w-[120px] font-medium text-slate-700">
                              ✍️ {story.assignedToUserName || story.authorName}
                            </span>
                            <span className="font-medium text-slate-500">
                              📅{' '}
                              {new Date(story.deadline).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                              })}
                            </span>
                          </div>

                          {/* Card Footer: Action button */}
                          <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                            <button
                              onClick={() => onSelectStory(story.id)}
                              className="text-[11px] font-semibold text-slate-600 hover:text-teal-700 flex items-center gap-1"
                            >
                              <Edit className="h-3 w-3" />
                              <span>Open Editor</span>
                            </button>

                            {nextAction && nextAction.can && (
                              <button
                                onClick={() => transitionStoryStatus(story.id, nextAction.next)}
                                className="flex items-center gap-1 rounded bg-teal-50 px-2 py-1 text-[10px] font-semibold text-teal-800 hover:bg-teal-100 transition"
                              >
                                <span>{nextAction.label}</span>
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            )}

                            {story.status === 'under_review' && hasPermission('request_revision') && (
                              <button
                                onClick={() => {
                                  const reason = prompt('Enter editorial revision request instructions for the journalist:');
                                  if (reason) {
                                    transitionStoryStatus(story.id, 'revision_required', reason);
                                  }
                                }}
                                className="rounded bg-rose-50 px-2 py-1 text-[10px] font-semibold text-rose-700 hover:bg-rose-100 transition"
                              >
                                Revise
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Title & Summary</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Reporter</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Deadline</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStories.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-xs text-slate-400">
                      No stories match your filters
                    </td>
                  </tr>
                ) : (
                  filteredStories.map((story) => {
                    const dept = departments.find((d) => d.id === story.departmentId);
                    const nextAction = getNextStatusAction(story.status);

                    return (
                      <tr key={story.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-4 py-3 max-w-sm">
                          <p
                            onClick={() => onSelectStory(story.id)}
                            className="font-semibold text-slate-900 hover:text-teal-700 cursor-pointer line-clamp-1"
                          >
                            {story.title}
                          </p>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{story.summary}</p>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                            {story.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                          {dept?.name || 'General'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-700 font-medium">
                          {story.assignedToUserName || story.authorName}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                              story.status === 'published'
                                ? 'bg-teal-100 text-teal-800'
                                : story.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : story.status === 'revision_required'
                                ? 'bg-rose-100 text-rose-800'
                                : story.status === 'submitted'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {story.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">{getPriorityBadge(story.priority)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-500 text-[11px]">
                          {new Date(story.deadline).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => onSelectStory(story.id)}
                              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-teal-700"
                              title="Open Article Editor"
                            >
                              <Edit className="h-4 w-4" />
                            </button>

                            {nextAction && nextAction.can && (
                              <button
                                onClick={() => transitionStoryStatus(story.id, nextAction.next)}
                                className="rounded bg-teal-50 px-2.5 py-1 text-[10px] font-semibold text-teal-800 hover:bg-teal-100"
                              >
                                {nextAction.label}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
