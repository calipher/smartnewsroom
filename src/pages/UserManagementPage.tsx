import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Building,
  Plus,
  X,
  Edit2,
  Lock,
} from 'lucide-react';
import { useNewsroom } from '../contexts/NewsroomContext';
import { User, UserRole } from '../types';

export const UserManagementPage: React.FC = () => {
  const { allUsers, departments, currentOrg, currentUser, hasPermission } = useNewsroom();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+263 77 ');
  const [role, setRole] = useState<UserRole>('journalist');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || '');

  // Filter users for active organization
  const orgUsers = allUsers.filter(
    (u) =>
      u.organizationId === currentOrg.id ||
      currentUser.role === 'platform_admin'
  );

  const filteredUsers = orgUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    alert(`User invitation sent to ${email} for role: ${role.replace(/_/g, ' ')}. Account provisioned.`);
    setShowInviteModal(false);
    setName('');
    setEmail('');
  };

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'platform_admin':
        return <span className="rounded bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800">PLATFORM ADMIN</span>;
      case 'org_admin':
        return <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">ORG ADMIN</span>;
      case 'editor_in_chief':
        return <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">EDITOR-IN-CHIEF</span>;
      case 'section_editor':
        return <span className="rounded bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-800">SECTION EDITOR</span>;
      case 'journalist':
        return <span className="rounded bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800">JOURNALIST</span>;
      case 'multimedia_producer':
        return <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">PRODUCER</span>;
      case 'viewer':
        return <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">OBSERVER</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white">
              <Users className="h-4 w-4" />
            </span>
            <h1 className="font-serif text-2xl font-bold text-slate-900">
              Newsroom Staff & User Management
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Role-based access permissions, newsroom staff registry, and desk allocation for{' '}
            <strong>{currentOrg.name}</strong>.
          </p>
        </div>

        {hasPermission('manage_users') && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 transition"
          >
            <UserPlus className="h-4 w-4" />
            <span>Invite Journalist / Editor</span>
          </button>
        )}
      </div>

      {/* Role Hierarchy Reference Callout */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-center text-xs shadow-2xs">
        <div className="p-2 rounded-lg bg-slate-50">
          <p className="font-bold text-slate-900 text-[11px]">Platform Admin</p>
          <p className="text-[10px] text-slate-500">CSZ Governance</p>
        </div>
        <div className="p-2 rounded-lg bg-slate-50">
          <p className="font-bold text-slate-900 text-[11px]">Org Admin</p>
          <p className="text-[10px] text-slate-500">Managing Director</p>
        </div>
        <div className="p-2 rounded-lg bg-slate-50">
          <p className="font-bold text-slate-900 text-[11px]">Editor-in-Chief</p>
          <p className="text-[10px] text-slate-500">Approvals & Lead</p>
        </div>
        <div className="p-2 rounded-lg bg-slate-50">
          <p className="font-bold text-slate-900 text-[11px]">Section Editor</p>
          <p className="text-[10px] text-slate-500">Desk Supervisor</p>
        </div>
        <div className="p-2 rounded-lg bg-slate-50">
          <p className="font-bold text-slate-900 text-[11px]">Journalist</p>
          <p className="text-[10px] text-slate-500">Field Reporter</p>
        </div>
        <div className="p-2 rounded-lg bg-slate-50">
          <p className="font-bold text-slate-900 text-[11px]">Multimedia</p>
          <p className="text-[10px] text-slate-500">Audio/Video</p>
        </div>
        <div className="p-2 rounded-lg bg-slate-50">
          <p className="font-bold text-slate-900 text-[11px]">Observer</p>
          <p className="text-[10px] text-slate-500">Read-Only</p>
        </div>
      </div>

      {/* User Directory Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <input
            type="text"
            placeholder="Search team members by name or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-72 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:outline-hidden"
          />
          <span className="text-xs text-slate-500">
            Total Staff: <strong>{filteredUsers.length}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Team Member</th>
                <th className="px-4 py-3">Role & Permissions</th>
                <th className="px-4 py-3">Department Desk</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => {
                const dept = departments.find((d) => d.id === user.departmentId);
                return (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            user.avatarUrl ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80'
                          }
                          alt={user.name}
                          className="h-8 w-8 rounded-full object-cover ring-2 ring-slate-100"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{user.name}</p>
                          <p className="text-[11px] text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{getRoleBadge(user.role)}</td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {dept?.name || 'General Desk'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap font-mono text-[11px]">
                      {user.phone || '+263 77 000 0000'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Active</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {hasPermission('manage_users') && (
                        <button
                          onClick={() => alert(`Editing permissions for ${user.name}`)}
                          className="rounded-lg p-1 text-slate-400 hover:text-teal-700"
                          title="Edit Permissions"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-slate-900">
                Register Newsroom Journalist
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sifiso Ncube"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Official Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="s.ncube@byodigital.co.zw"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Newsroom Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900 focus:outline-hidden"
                  >
                    <option value="journalist">Journalist / Reporter</option>
                    <option value="section_editor">Section Editor</option>
                    <option value="multimedia_producer">Multimedia Producer</option>
                    <option value="editor_in_chief">Editor-in-Chief</option>
                    <option value="org_admin">Organisation Administrator</option>
                    <option value="viewer">Read-only Observer</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Department</label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900 focus:outline-hidden"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Zimbabwe Phone Number (+263)
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-hidden font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-teal-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-700"
                >
                  Issue Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
