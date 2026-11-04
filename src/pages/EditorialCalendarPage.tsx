import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Filter,
  CheckCircle,
  AlertCircle,
  Users,
  X,
  FileText,
} from 'lucide-react';
import { useNewsroom } from '../contexts/NewsroomContext';
import { CalendarEvent, StoryPriority } from '../types';

export const EditorialCalendarPage: React.FC = () => {
  const { calendarEvents, stories, departments, allUsers, currentOrg, addCalendarEvent, hasPermission } =
    useNewsroom();

  const [currentDate, setCurrentDate] = useState(new Date('2026-11-03')); // Aligned with pilot timestamp
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');
  const [selectedUserFilter, setSelectedUserFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Event Form
  const [title, setTitle] = useState('');
  const [type, setType] = useState<CalendarEvent['type']>('deadline');
  const [eventDate, setEventDate] = useState('2026-11-05');
  const [eventTime, setEventTime] = useState('10:00');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || '');
  const [assignedUserId, setAssignedUserId] = useState(allUsers[0]?.id || '');
  const [priority, setPriority] = useState<StoryPriority>('high');
  const [description, setDescription] = useState('');

  const orgUsers = allUsers.filter((u) => u.organizationId === currentOrg.id);

  // Filter events
  const filteredEvents = calendarEvents.filter((event) => {
    if (selectedDeptFilter !== 'all' && event.departmentId !== selectedDeptFilter) return false;
    if (selectedUserFilter !== 'all' && event.assignedUserId !== selectedUserFilter) return false;
    return true;
  });

  // Month navigation
  const nextPeriod = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') next.setMonth(next.getMonth() + 1);
    else if (viewMode === 'week') next.setDate(next.getDate() + 7);
    else next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const prevPeriod = () => {
    const prev = new Date(currentDate);
    if (viewMode === 'month') prev.setMonth(prev.getMonth() - 1);
    else if (viewMode === 'week') prev.setDate(prev.getDate() - 7);
    else prev.setDate(prev.getDate() - 1);
    setCurrentDate(prev);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addCalendarEvent({
      title: title.trim(),
      type,
      date: eventDate,
      time: eventTime,
      departmentId,
      assignedUserId,
      priority,
      description: description.trim(),
    });

    setShowAddModal(false);
    setTitle('');
    setDescription('');
  };

  const getTypeBadge = (t: CalendarEvent['type']) => {
    switch (t) {
      case 'deadline':
        return <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold text-rose-700">DEADLINE</span>;
      case 'publication':
        return <span className="rounded bg-teal-50 px-1.5 py-0.5 text-[9px] font-bold text-teal-700">PUBLISH</span>;
      case 'editorial_meeting':
        return <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[9px] font-bold text-indigo-700">MEETING</span>;
      case 'special_event':
        return <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">EVENT</span>;
    }
  };

  // Calendar Day cell generator
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayIndex = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white">
              <CalendarIcon className="h-4 w-4" />
            </span>
            <h1 className="font-serif text-2xl font-bold text-slate-900">
              Editorial Calendar
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Publishing schedules, filing deadlines, and editorial morning conferences for{' '}
            <strong>{currentOrg.name}</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Toggle */}
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
            {(['month', 'week', 'day'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition ${
                  viewMode === mode ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {hasPermission('assign_story') && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Add Calendar Item</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation & Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            onClick={prevPeriod}
            className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-serif font-bold text-sm text-slate-900 min-w-36 text-center">
            {currentDate.toLocaleDateString('en-GB', {
              month: 'long',
              year: 'numeric',
            })}
          </span>
          <button
            onClick={nextPeriod}
            className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date('2026-11-03'))}
            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Today (Harare)
          </button>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2">
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Desks</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={selectedUserFilter}
            onChange={(e) => setSelectedUserFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Journalists</option>
            {orgUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* MONTH VIEW CALENDAR GRID */}
      {viewMode === 'month' && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500 py-2.5">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Month Cells Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 min-h-[500px]">
            {/* Empty slots before first day */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-slate-50/40 p-2" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNumber = i + 1;
              const dateString = `2026-11-${dayNumber < 10 ? `0${dayNumber}` : dayNumber}`;
              const isToday = dayNumber === 3; // Aligned with 3 Nov 2026 pilot date
              const dayEvents = filteredEvents.filter((e) => e.date === dateString);

              return (
                <div
                  key={dayNumber}
                  className={`p-2 transition ${isToday ? 'bg-teal-50/30 font-bold' : 'hover:bg-slate-50/50'}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                        isToday ? 'bg-teal-600 text-white' : 'text-slate-700'
                      }`}
                    >
                      {dayNumber}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-bold text-teal-700">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Day Events stack */}
                  <div className="mt-1.5 space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className="rounded-md border border-slate-200 bg-white p-1 text-[10px] shadow-2xs leading-tight"
                      >
                        <div className="flex items-center gap-1 font-semibold text-slate-800 line-clamp-1">
                          <span className="shrink-0">{event.time}</span>
                          <span>{event.title}</span>
                        </div>
                        <div className="mt-0.5">{getTypeBadge(event.type)}</div>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[9px] font-medium text-slate-400">
                        +{dayEvents.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WEEK & DAY VIEW LIST */}
      {(viewMode === 'week' || viewMode === 'day') && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs divide-y divide-slate-100">
          {filteredEvents.map((event) => (
            <div key={event.id} className="py-3.5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-bold text-xs">
                  <span>{event.date.split('-')[2]}</span>
                  <span className="text-[9px] uppercase font-medium">Nov</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900">{event.title}</h3>
                    {getTypeBadge(event.type)}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{event.description}</p>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{event.time} CAT (Harare)</span>
                    </span>
                    <span>•</span>
                    <span>Priority: {event.priority.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Calendar Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-slate-900">Add Calendar Entry</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700">Event / Deadline Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Morning Pitch Conference, Luveve Water Deadline..."
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900 focus:outline-hidden"
                  >
                    <option value="deadline">Filing Deadline</option>
                    <option value="publication">Publication Release</option>
                    <option value="editorial_meeting">Editorial Meeting</option>
                    <option value="special_event">Special Press Event</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900 focus:outline-hidden"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Date (YYYY-MM-DD)</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Time (CAT)</label>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:outline-hidden"
                  />
                </div>
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

              <div>
                <label className="text-xs font-semibold text-slate-700">Assigned Journalist / Leader</label>
                <select
                  value={assignedUserId}
                  onChange={(e) => setAssignedUserId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900 focus:outline-hidden"
                >
                  {orgUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
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
                  Schedule Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
