import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Eye,
  AlertTriangle,
  FileCheck,
  Search,
  Filter,
  CheckCircle2,
  Database,
  Key,
} from 'lucide-react';
import { useNewsroom } from '../contexts/NewsroomContext';

export const AuditSecurityPage: React.FC = () => {
  const { auditLogs, currentOrg, currentUser } = useNewsroom();
  const [filterAction, setFilterAction] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = auditLogs.filter((log) => {
    if (filterAction !== 'all' && !log.action.includes(filterAction)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.userName.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.entityTitle.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getActionBadge = (action: string) => {
    if (action.includes('APPROVED')) {
      return <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">APPROVED</span>;
    }
    if (action.includes('REVISION')) {
      return <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800">REVISION REQUESTED</span>;
    }
    if (action.includes('AI')) {
      return <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-800">AI PROCESSED</span>;
    }
    if (action.includes('CREATE')) {
      return <span className="rounded bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-800">CREATED</span>;
    }
    if (action.includes('STATUS')) {
      return <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">STATUS TRANSITION</span>;
    }
    return <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">{action}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <h1 className="font-serif text-2xl font-bold text-slate-900">
              Security, Audit Trail & Source Integrity
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Immutable transaction logs, multi-tenant workspace isolation checks, and source confidentiality controls for{' '}
            <strong>{currentOrg.name}</strong>.
          </p>
        </div>
      </div>

      {/* Source Protection & Security Standards Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-4 space-y-2">
          <div className="flex items-center gap-2 text-teal-900 font-bold text-xs">
            <Lock className="h-4 w-4 text-teal-600" />
            <span>Multi-Tenant Data Isolation</span>
          </div>
          <p className="text-[11px] text-teal-800 leading-relaxed">
            Every story, transcript, and asset document is tagged with an organisation ID ({currentOrg.id}). Cross-tenant database queries are blocked by policy.
          </p>
        </div>

        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4 space-y-2">
          <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
            <Key className="h-4 w-4 text-indigo-600" />
            <span>Server-Side AI API Security</span>
          </div>
          <p className="text-[11px] text-indigo-800 leading-relaxed">
            Gemini API credentials never reach the browser bundle. All generation, transcription, and translation calls execute through protected backend proxy routes.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span>Whistleblower & Source Guard</span>
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            Journalists handling confidential source documents receive automated warnings. Source notes are never transmitted to third-party model training datasets.
          </p>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-sm font-bold text-slate-900">
              Immutable Newsroom Audit Trail
            </h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
              {filteredLogs.length} events logged
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter audit entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-900 focus:outline-hidden"
              />
            </div>

            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden"
            >
              <option value="all">All Action Types</option>
              <option value="APPROVED">Approvals</option>
              <option value="REVISION">Revisions</option>
              <option value="AI">AI Invocations</option>
              <option value="CREATE">Creation Events</option>
              <option value="STATUS">Status Changes</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Timestamp (CAT)</th>
                <th className="px-4 py-3">Staff Member</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Action Type</th>
                <th className="px-4 py-3">Entity Affected</th>
                <th className="px-4 py-3">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                    No matching audit records
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-bold text-slate-900">
                      {log.userName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600 capitalize text-[11px]">
                      {log.userRole.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{getActionBadge(log.action)}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800 max-w-xs truncate">
                      {log.entityTitle}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-[11px] max-w-md">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
