import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  Sparkles,
  Users,
  Filter,
} from 'lucide-react';
import { useNewsroom } from '../contexts/NewsroomContext';

export const AnalyticsPage: React.FC = () => {
  const {
    stories,
    departments,
    allUsers,
    currentOrg,
    auditLogs,
    transcripts,
    translations,
  } = useNewsroom();

  const [dateRange, setDateRange] = useState<'7days' | '30days' | 'all'>('30days');
  const [selectedDept, setSelectedDept] = useState('all');

  const orgUsers = allUsers.filter((u) => u.organizationId === currentOrg.id);

  // Filtered stories for analytics
  const filteredStories = stories.filter((s) => {
    if (selectedDept !== 'all' && s.departmentId !== selectedDept) return false;
    return true;
  });

  // Derived metrics from actual data
  const totalStories = filteredStories.length;
  const publishedStories = filteredStories.filter((s) => s.status === 'published').length;
  const approvedStories = filteredStories.filter((s) => s.status === 'approved' || s.status === 'scheduled').length;
  const revisionStories = filteredStories.filter((s) => s.status === 'revision_required').length;
  const underReviewStories = filteredStories.filter((s) => s.status === 'under_review' || s.status === 'submitted').length;

  const approvalRate = totalStories > 0 ? Math.round(((approvedStories + publishedStories) / totalStories) * 100) : 0;

  // AI tool usage from audit logs
  const aiAuditLogs = auditLogs.filter((a) => a.entityType === 'ai' || a.action.includes('AI'));
  const totalAIUsage = aiAuditLogs.length;

  // Department distribution
  const deptBreakdown: Record<string, { total: number; published: number; inProgress: number }> = {};
  departments.forEach((d) => {
    deptBreakdown[d.name] = { total: 0, published: 0, inProgress: 0 };
  });

  filteredStories.forEach((s) => {
    const d = departments.find((dept) => dept.id === s.departmentId);
    const dName = d ? d.name : 'General';
    if (!deptBreakdown[dName]) {
      deptBreakdown[dName] = { total: 0, published: 0, inProgress: 0 };
    }
    deptBreakdown[dName].total += 1;
    if (s.status === 'published') deptBreakdown[dName].published += 1;
    if (s.status === 'in_progress' || s.status === 'submitted') deptBreakdown[dName].inProgress += 1;
  });

  // Category distribution
  const categoryCounts: Record<string, number> = {};
  filteredStories.forEach((s) => {
    categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
  });

  // Journalist productivity
  const journalistStats: Record<string, { name: string; total: number; published: number; words: number }> = {};
  orgUsers.forEach((u) => {
    journalistStats[u.id] = { name: u.name, total: 0, published: 0, words: 0 };
  });

  filteredStories.forEach((s) => {
    const authorId = s.assignedToUserId || s.authorId;
    if (journalistStats[authorId]) {
      journalistStats[authorId].total += 1;
      if (s.status === 'published') journalistStats[authorId].published += 1;
      journalistStats[authorId].words += s.wordCount || 0;
    }
  });

  // CSV Report Generator
  const handleExportCSV = () => {
    const headers = ['Story ID', 'Title', 'Category', 'Reporter', 'Status', 'Priority', 'Word Count', 'Deadline'];
    const rows = filteredStories.map((s) => [
      s.id,
      `"${s.title.replace(/"/g, '""')}"`,
      s.category,
      `"${s.assignedToUserName || s.authorName}"`,
      s.status,
      s.priority,
      s.wordCount,
      s.deadline,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SmartNewsroom_${currentOrg.id}_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white">
              <BarChart3 className="h-4 w-4" />
            </span>
            <h1 className="font-serif text-2xl font-bold text-slate-900">
              Newsroom Analytics & Performance
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Real-time editorial throughput, approval metrics, and AI utilization telemetry for{' '}
            <strong>{currentOrg.name}</strong>.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Desks</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* Top Telemetry KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Stories Processed</span>
          <p className="mt-2 text-3xl font-bold text-slate-900">{totalStories}</p>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-teal-700 font-semibold">
            <TrendingUp className="h-3 w-3" />
            <span>{publishedStories} cleared & published</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Editorial Approval Rate</span>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{approvalRate}%</p>
          <div className="mt-1 text-[11px] text-slate-400">
            {revisionStories} returned for revision
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">AI Assistant Calls</span>
          <p className="mt-2 text-3xl font-bold text-indigo-600">{totalAIUsage}</p>
          <div className="mt-1 text-[11px] text-slate-400">
            Across outlines, fact audits & headlines
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Audio Transcripts & Transl.</span>
          <p className="mt-2 text-3xl font-bold text-teal-700">
            {transcripts.length + translations.length}
          </p>
          <div className="mt-1 text-[11px] text-slate-400">
            isiNdebele, Shona & English
          </div>
        </div>
      </div>

      {/* Department Breakdown & Story Category Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Throughput Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <h2 className="font-serif text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Department Productivity & Story Filing
          </h2>

          <div className="mt-4 space-y-4">
            {Object.entries(deptBreakdown).map(([deptName, counts]) => {
              const max = Math.max(1, ...Object.values(deptBreakdown).map((c) => c.total));
              const pct = Math.round((counts.total / max) * 100);

              return (
                <div key={deptName}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800">{deptName}</span>
                    <span className="text-slate-500">
                      <strong>{counts.total}</strong> stories ({counts.published} published)
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden flex">
                    <div
                      className="bg-teal-600 h-full"
                      style={{ width: `${(counts.published / (counts.total || 1)) * pct}%` }}
                      title="Published"
                    />
                    <div
                      className="bg-amber-400 h-full"
                      style={{
                        width: `${((counts.total - counts.published) / (counts.total || 1)) * pct}%`,
                      }}
                      title="In Progress"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <h2 className="font-serif text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Stories by Beat & Category
          </h2>

          <div className="mt-4 space-y-3">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = totalStories > 0 ? Math.round((count / totalStories) * 100) : 0;
              return (
                <div key={cat} className="flex items-center justify-between py-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-teal-500" />
                    <span className="font-medium text-slate-800">{cat}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">{count}</span>
                    <span className="text-[10px] text-slate-400 w-10 text-right">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Journalist Productivity Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
        <h2 className="font-serif text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Journalist Assignment & Filing Metrics
        </h2>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="pb-2">Journalist</th>
                <th className="pb-2">Total Assigned</th>
                <th className="pb-2">Published</th>
                <th className="pb-2">Total Words Filed</th>
                <th className="pb-2">Filing Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(journalistStats)
                .filter(([_, s]) => s.total > 0)
                .map(([id, stat]) => (
                  <tr key={id} className="hover:bg-slate-50/70">
                    <td className="py-3 font-semibold text-slate-900">{stat.name}</td>
                    <td className="py-3 font-bold text-slate-700">{stat.total} stories</td>
                    <td className="py-3 font-bold text-teal-700">{stat.published} published</td>
                    <td className="py-3 text-slate-600">{stat.words.toLocaleString()} words</td>
                    <td className="py-3">
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        Active Contributor
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
