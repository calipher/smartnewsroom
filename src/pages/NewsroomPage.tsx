import React, { useState } from 'react';
import {
  Building2,
  Users,
  Target,
  Plus,
  Edit2,
  FileText,
  TrendingUp,
  CheckCircle,
  X,
  Search,
} from 'lucide-react';
import { useNewsroom } from '../contexts/NewsroomContext';
import { Department } from '../types';

interface NewsroomPageProps {
  onSelectDepartmentStories?: (deptId: string) => void;
}

export const NewsroomPage: React.FC<NewsroomPageProps> = ({ onSelectDepartmentStories }) => {
  const {
    departments,
    allUsers,
    stories,
    currentOrg,
    currentUser,
    createDepartment,
    updateDepartment,
    hasPermission,
  } = useNewsroom();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [headUserId, setHeadUserId] = useState('');
  const [storyTargetMonthly, setStoryTargetMonthly] = useState(15);

  const orgUsers = allUsers.filter((u) => u.organizationId === currentOrg.id);

  const filteredDepts = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setName('');
    setCode('');
    setDescription('');
    setHeadUserId(orgUsers[0]?.id || '');
    setStoryTargetMonthly(15);
    setEditingDept(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setEditingDept(dept);
    setName(dept.name);
    setCode(dept.code);
    setDescription(dept.description);
    setHeadUserId(dept.headUserId);
    setStoryTargetMonthly(dept.storyTargetMonthly);
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      alert('Department name and code are required');
      return;
    }

    if (editingDept) {
      updateDepartment(editingDept.id, {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim(),
        headUserId,
        storyTargetMonthly,
      });
    } else {
      createDepartment({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim(),
        headUserId: headUserId || orgUsers[0]?.id || currentUser.id,
        storyTargetMonthly: Number(storyTargetMonthly) || 12,
      });
    }

    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-900">
            Newsroom Departments & Desks
          </h1>
          <p className="text-xs text-slate-500">
            Organizational structure, editorial desk heads, and monthly story output targets for{' '}
            <strong>{currentOrg.name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search desks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden"
            />
          </div>

          {hasPermission('create_department') && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Add Department</span>
            </button>
          )}
        </div>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDepts.map((dept) => {
          const deptStories = stories.filter((s) => s.departmentId === dept.id);
          const headUser = orgUsers.find((u) => u.id === dept.headUserId);
          const publishedCount = deptStories.filter((s) => s.status === 'published').length;
          const inProgressCount = deptStories.filter(
            (s) => s.status === 'in_progress' || s.status === 'submitted' || s.status === 'under_review'
          ).length;
          const targetMonthly = dept.storyTargetMonthly || 12;
          const progressPercent = Math.min(100, Math.round((publishedCount / targetMonthly) * 100));

          return (
            <div
              key={dept.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-teal-200 transition"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 font-bold text-teal-700 text-xs">
                      {dept.code}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{dept.name}</h3>
                      <p className="text-[11px] text-slate-500">Desk Code: {dept.code}</p>
                    </div>
                  </div>

                  {hasPermission('create_department') && (
                    <button
                      onClick={() => handleOpenEdit(dept)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      title="Edit Department"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <p className="mt-3 text-xs text-slate-600 line-clamp-2">
                  {dept.description || 'No description added for this newsroom desk.'}
                </p>

                {/* Desk Head */}
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 p-2 border border-slate-100">
                  <img
                    src={
                      headUser?.avatarUrl ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80'
                    }
                    alt={headUser?.name || 'Head'}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                  <div className="truncate">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                      Desk Head / Editor
                    </p>
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {headUser?.name || 'Unassigned'}
                    </p>
                  </div>
                </div>

                {/* Department Stats */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-slate-50 py-2 border border-slate-100">
                    <p className="text-[10px] text-slate-500 font-medium">Stories Active</p>
                    <p className="text-sm font-bold text-slate-800">{inProgressCount}</p>
                  </div>
                  <div className="rounded-lg bg-teal-50/50 py-2 border border-teal-100/50">
                    <p className="text-[10px] text-teal-700 font-medium">Published</p>
                    <p className="text-sm font-bold text-teal-800">{publishedCount}</p>
                  </div>
                </div>

                {/* Target Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Monthly Target ({targetMonthly})</span>
                    <span className="font-bold text-slate-700">{progressPercent}%</span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Department CTA */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Total: {deptStories.length} records</span>
                <button
                  onClick={() => {
                    if (onSelectDepartmentStories) onSelectDepartmentStories(dept.id);
                  }}
                  className="flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>View Desk Stories</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Department Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-slate-900">
                {editingDept ? 'Edit Newsroom Department' : 'Create Newsroom Department'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700">Department Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Investigations, Politics, Multimedia"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Desk Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="INV, POL, BIZ"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs uppercase text-slate-900 focus:border-teal-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Monthly Story Target</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={storyTargetMonthly}
                    onChange={(e) => setStoryTargetMonthly(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Department Head</label>
                <select
                  value={headUserId}
                  onChange={(e) => setHeadUserId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden"
                >
                  {orgUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role.replace(/_/g, ' ')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Desk Scope & Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Focus areas, beat specializations and reporting coverage..."
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-teal-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-700"
                >
                  {editingDept ? 'Save Changes' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
