import React, { useState } from 'react';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import { useNewsroom } from '../../contexts/NewsroomContext';
import { StoryFormat, StoryPriority, StoryStatus } from '../../types';

interface NewStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (storyId: string) => void;
}

export const NewStoryModal: React.FC<NewStoryModalProps> = ({ isOpen, onClose, onCreated }) => {
  const { departments, allUsers, currentOrg, currentUser, createStory, generateAI } = useNewsroom();

  const orgUsers = allUsers.filter((u) => u.organizationId === currentOrg.id);

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('News');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || '');
  const [assignedToUserId, setAssignedToUserId] = useState(currentUser.id);
  const [assignedEditorId, setAssignedEditorId] = useState(currentUser.id);
  const [format, setFormat] = useState<StoryFormat>('news_article');
  const [priority, setPriority] = useState<StoryPriority>('normal');
  const [status, setStatus] = useState<StoryStatus>('proposed');
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 48 * 3600 * 1000).toISOString().slice(0, 16)
  );
  const [editorialInstructions, setEditorialInstructions] = useState('');
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);

  if (!isOpen) return null;

  const categories = [
    'News',
    'Politics',
    'Business',
    'Sports',
    'Technology',
    'Health',
    'Education',
    'Community Affairs',
    'Investigations',
    'Entertainment',
    'Arts & Culture',
  ];

  const formats: { value: StoryFormat; label: string }[] = [
    { value: 'news_article', label: 'News Article (Print/Online)' },
    { value: 'radio_bulletin', label: 'Radio Bulletin' },
    { value: 'tv_report', label: 'Television Report' },
    { value: 'feature_article', label: 'Feature Article' },
    { value: 'investigative_report', label: 'Investigative Report' },
    { value: 'interview', label: 'Interview' },
    { value: 'opinion_piece', label: 'Opinion Piece' },
    { value: 'podcast', label: 'Podcast' },
    { value: 'multimedia_story', label: 'Multimedia Story' },
  ];

  const handleAIBriefSuggest = async () => {
    if (!title.trim()) {
      alert('Please enter a story title or topic first so the AI assistant can suggest angles.');
      return;
    }
    setIsGeneratingBrief(true);
    try {
      const prompt = `Based on the story title: "${title}" in the context of Zimbabwean journalism (${currentOrg.city || 'Bulawayo'}), generate a concise 2-sentence summary and 3 practical editorial instructions/reporting angles for the assigned reporter. Note any specific Zimbabwean entities that should be verified.`;
      const result = await generateAI({
        prompt,
        taskType: 'Editorial Assignment Brief',
      });

      setSummary(result.split('\n')[0]?.replace('Summary:', '').trim() || title);
      setEditorialInstructions((prev) => (prev ? `${prev}\n\n${result}` : result));
    } catch (e: any) {
      alert('AI Assistant notice: ' + (e?.message || 'Failed to generate brief.'));
    } finally {
      setIsGeneratingBrief(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please provide a story title');
      return;
    }

    const assignedUser = orgUsers.find((u) => u.id === assignedToUserId);
    const assignedEditor = orgUsers.find((u) => u.id === assignedEditorId);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newStory = createStory({
      title: title.trim(),
      summary: summary.trim() || title.trim(),
      content: content.trim() || `Draft article for ${title.trim()}...`,
      category,
      departmentId: departmentId || departments[0]?.id || 'dept_news',
      authorId: currentUser.id,
      authorName: currentUser.name,
      assignedToUserId,
      assignedToUserName: assignedUser?.name,
      assignedEditorId,
      assignedEditorName: assignedEditor?.name,
      format,
      priority,
      status,
      deadline: new Date(deadline).toISOString(),
      featuredImageUrl:
        featuredImageUrl ||
        'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
      tags: tags.length > 0 ? tags : [category, 'Zimbabwe'],
      editorialInstructions,
      publishDestinations: ['Website', 'WhatsApp Channel'],
    });

    onClose();
    if (onCreated) onCreated(newStory.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative my-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-slate-900">Create Story Assignment</h3>
            <p className="text-xs text-slate-500">
              Newsroom: <span className="font-semibold text-teal-700">{currentOrg.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Title */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Story Title / Working Headline *</label>
              <button
                type="button"
                onClick={handleAIBriefSuggest}
                disabled={isGeneratingBrief}
                className="flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:text-teal-800 disabled:opacity-50"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{isGeneratingBrief ? 'AI Generating Angles...' : 'AI Suggest Brief'}</span>
              </button>
            </div>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Bulawayo Solar Farm Construction Milestone Ahead of Schedule..."
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
            />
          </div>

          {/* Grid row: Category, Department, Format */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Department</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Story Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as StoryFormat)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden"
              >
                {formats.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid row: Assigned Journalist, Assigned Editor, Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Assign To (Reporter)</label>
              <select
                value={assignedToUserId}
                onChange={(e) => setAssignedToUserId(e.target.value)}
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
              <label className="text-xs font-semibold text-slate-700">Supervising Editor</label>
              <select
                value={assignedEditorId}
                onChange={(e) => setAssignedEditorId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden"
              >
                {orgUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as StoryPriority)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden"
              >
                <option value="urgent">🔴 Urgent / Breaking</option>
                <option value="high">🟠 High Priority</option>
                <option value="normal">🟢 Normal Priority</option>
                <option value="low">⚪ Low / Background</option>
              </select>
            </div>
          </div>

          {/* Grid row: Initial Status, Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Initial Workflow Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StoryStatus)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden"
              >
                <option value="proposed">Proposed (Pitch stage)</option>
                <option value="assigned">Assigned (To reporter)</option>
                <option value="in_progress">In Progress (Active reporting)</option>
                <option value="submitted">Submitted (Ready for review)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Filing Deadline (Harare Time)</label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Story Summary */}
          <div>
            <label className="text-xs font-semibold text-slate-700">Story Summary / Nut Graph</label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief summary explaining what happened, why it matters and who is impacted..."
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden"
            />
          </div>

          {/* Editorial Instructions */}
          <div>
            <label className="text-xs font-semibold text-slate-700">
              Editorial Instructions & Sources to Contact
            </label>
            <textarea
              rows={3}
              value={editorialInstructions}
              onChange={(e) => setEditorialInstructions(e.target.value)}
              placeholder="e.g. Ensure you interview Bulawayo City Council engineers and local ward councillors. Verify budget figures..."
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-semibold text-slate-700">Tags (Comma-separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Bulawayo, Economy, ZWG, Energy, Climate"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden"
            />
          </div>

          {/* Ethical Warning Banner */}
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-2.5 text-amber-900 border border-amber-200/60 text-[11px]">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <span>
              <strong>Journalism Standards:</strong> All assignments are subject to the Zimbabwe Media Commission (ZMC) ethical code. Do not upload classified source identities to external networks.
            </span>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-teal-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-700"
            >
              Assign Story
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
