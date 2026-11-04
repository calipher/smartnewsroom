import React, { useState, useEffect } from 'react';
import {
  FileText,
  Save,
  Send,
  Sparkles,
  History,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  ArrowLeft,
  Image,
  Paperclip,
  Check,
  Copy,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useNewsroom } from '../contexts/NewsroomContext';
import { Story, StoryStatus } from '../types';

interface ArticleEditorPageProps {
  storyId?: string;
  onBackToStories: () => void;
}

export const ArticleEditorPage: React.FC<ArticleEditorPageProps> = ({
  storyId,
  onBackToStories,
}) => {
  const {
    stories,
    departments,
    currentUser,
    currentOrg,
    updateStory,
    transitionStoryStatus,
    addEditorialComment,
    saveStoryVersion,
    generateAI,
    hasPermission,
  } = useNewsroom();

  // Find targeted story or default to first one
  const targetStory = stories.find((s) => s.id === storyId) || stories[0];

  const [activeStoryId, setActiveStoryId] = useState<string>(targetStory?.id || '');
  const story = stories.find((s) => s.id === activeStoryId) || targetStory;

  // Local editor states
  const [title, setTitle] = useState(story?.title || '');
  const [summary, setSummary] = useState(story?.summary || '');
  const [content, setContent] = useState(story?.content || '');
  const [category, setCategory] = useState(story?.category || 'News');
  const [featuredImageUrl, setFeaturedImageUrl] = useState(story?.featuredImageUrl || '');
  const [editorialInstructions, setEditorialInstructions] = useState(story?.editorialInstructions || '');
  const [newCommentText, setNewCommentText] = useState('');
  const [isRevisionComment, setIsRevisionComment] = useState(false);

  // AI Assistant Drawer state
  const [showAIDrawer, setShowAIDrawer] = useState(false);
  const [aiMode, setAIMode] = useState<'improve' | 'headline' | 'outline' | 'verify' | 'summary'>('improve');
  const [aiPrompt, setAIPrompt] = useState('');
  const [aiTone, setAITone] = useState('Professional news reporting');
  const [aiResult, setAIResult] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);

  // Version history drawer
  const [showVersionDrawer, setShowVersionDrawer] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'dirty'>('saved');

  // Sync when active story changes
  useEffect(() => {
    if (story) {
      setTitle(story.title);
      setSummary(story.summary);
      setContent(story.content);
      setCategory(story.category);
      setFeaturedImageUrl(story.featuredImageUrl || '');
      setEditorialInstructions(story.editorialInstructions || '');
      setSaveStatus('saved');
    }
  }, [activeStoryId]);

  // Word count & reading time calculation
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readingTimeMinutes = Math.ceil(words / 200);

  // Autosave handler
  const handleSave = () => {
    if (!story) return;
    setSaveStatus('saving');
    updateStory(story.id, {
      title,
      summary,
      content,
      category,
      featuredImageUrl,
      editorialInstructions,
    });
    saveStoryVersion(story.id);
    setTimeout(() => {
      setSaveStatus('saved');
    }, 600);
  };

  // Submit to editorial desk
  const handleSubmitForReview = () => {
    if (!story) return;
    handleSave();
    transitionStoryStatus(story.id, 'submitted', 'Journalist completed draft and filed for review');
    alert(`"${title}" submitted to the editorial desk for review!`);
  };

  // Editorial approval
  const handleApprove = () => {
    if (!story) return;
    handleSave();
    transitionStoryStatus(story.id, 'approved', 'Approved by supervising editor');
  };

  // Request revision
  const handleRequestRevision = () => {
    if (!story) return;
    const note = prompt('Enter specific instructions for the journalist to amend:');
    if (note) {
      addEditorialComment(story.id, note, true);
      transitionStoryStatus(story.id, 'revision_required', note);
    }
  };

  // Run AI Editorial Assistant
  const handleRunAI = async () => {
    setIsAILoading(true);
    try {
      let promptText = '';
      if (aiMode === 'improve') {
        promptText = `Improve the grammar, journalistic clarity, and readability of this article draft for a Zimbabwean news publication. Do not alter verified facts or invent quotes. Flag any stylistic issues:\n\n${content}`;
      } else if (aiMode === 'headline') {
        promptText = `Generate 5 strong headline options (News Lead, Short, SEO, Social, and Radio Bulletin) based on this story:\nTITLE: ${title}\nSUMMARY: ${summary}\nBODY:\n${content.slice(0, 1500)}`;
      } else if (aiMode === 'outline') {
        promptText = `Create a structured 5-part journalistic reporting outline and interview source checklist for the story topic: "${title}". Include relevant Zimbabwean angles for Bulawayo/Matabeleland.`;
      } else if (aiMode === 'verify') {
        promptText = `Conduct an editorial fact-check and verification audit on the following draft. Explicitly identify:
1. Factual statements requiring official corroboration (e.g. monetary figures in ZWG/USD, government stats, tender bids).
2. Missing sources or unquoted institutions.
3. Potential legal risks under Zimbabwean media regulations.
DRAFT:\n${content}`;
      } else if (aiMode === 'summary') {
        promptText = `Generate an executive news summary (2 sentences) and 4 bullet points highlighting the key facts from this article:\n${content}`;
      }

      if (aiPrompt.trim()) {
        promptText += `\nAdditional journalist instructions: ${aiPrompt}`;
      }

      const response = await generateAI({
        prompt: promptText,
        tone: aiTone,
        taskType: `Article Editor - ${aiMode}`,
        context: `Story Title: ${title}\nCategory: ${category}\nNewsroom: ${currentOrg.name}`,
      });

      setAIResult(response);
    } catch (e: any) {
      alert('AI Assistant notice: ' + (e?.message || 'Error executing AI assistance.'));
    } finally {
      setIsAILoading(false);
    }
  };

  // Add Editorial Comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !story) return;
    addEditorialComment(story.id, newCommentText.trim(), isRevisionComment);
    setNewCommentText('');
    setIsRevisionComment(false);
  };

  if (!story) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-sm font-semibold text-slate-700">No story selected.</p>
        <button
          onClick={onBackToStories}
          className="mt-3 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white"
        >
          Return to Story Desk
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 bg-white p-4 rounded-xl shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToStories}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
            title="Back to Stories"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-slate-900">Article Workspace</span>
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
              <span className="text-[11px] text-slate-400">
                {saveStatus === 'saved' ? '● Saved' : saveStatus === 'saving' ? 'Saving...' : 'Unsaved changes'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Reporter: <strong>{story.assignedToUserName || story.authorName}</strong> • Desk: {category}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Version History Button */}
          <button
            onClick={() => setShowVersionDrawer(!showVersionDrawer)}
            className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <History className="h-3.5 w-3.5" />
            <span>Versions ({story.versions?.length || 1})</span>
          </button>

          {/* AI Assistant Button */}
          <button
            onClick={() => setShowAIDrawer(!showAIDrawer)}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-teal-600 to-teal-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:from-teal-700 hover:to-teal-800"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>SmartNewsroom AI</span>
          </button>

          {/* Manual Save Button */}
          <button
            onClick={handleSave}
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Draft</span>
          </button>

          {/* Submit / Approve Workflow Buttons based on permissions */}
          {hasPermission('write_article') && (story.status === 'in_progress' || story.status === 'assigned' || story.status === 'revision_required') && (
            <button
              onClick={handleSubmitForReview}
              className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Submit for Review</span>
            </button>
          )}

          {hasPermission('approve_story') && (story.status === 'submitted' || story.status === 'under_review') && (
            <>
              <button
                onClick={handleRequestRevision}
                className="flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Request Revision</span>
              </button>
              <button
                onClick={handleApprove}
                className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Approve Article</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* REVISION REQUEST ALERT BANNER */}
      {story.status === 'revision_required' && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-900 text-xs">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Editorial Revision Required</p>
            <p className="mt-0.5 text-rose-700">
              Please address the editor&apos;s feedback in the comment panel below. After making corrections, click &quot;Submit for Review&quot; above.
            </p>
          </div>
        </div>
      )}

      {/* Main Grid: Editor & Side Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Main Canvas (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
            {/* Headline input */}
            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Article Title / Lead Headline
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setSaveStatus('dirty');
                }}
                placeholder="Enter compelling journalistic headline..."
                className="mt-1 w-full font-serif text-xl sm:text-2xl font-bold text-slate-900 border-none px-0 py-1 focus:outline-hidden focus:ring-0 placeholder:text-slate-300"
              />
            </div>

            {/* Summary Nut Graph */}
            <div className="border-t border-slate-100 pt-3">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Summary / Nut Graph
              </label>
              <textarea
                rows={2}
                value={summary}
                onChange={(e) => {
                  setSummary(e.target.value);
                  setSaveStatus('dirty');
                }}
                placeholder="Brief summary capturing the core who, what, where, when and why..."
                className="mt-1 w-full text-xs text-slate-700 border-none px-0 py-1 focus:outline-hidden focus:ring-0 placeholder:text-slate-300 italic"
              />
            </div>

            {/* Article Body */}
            <div className="border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between pb-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Article Body
                </label>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                  <span>
                    <strong>{words}</strong> words
                  </span>
                  <span>•</span>
                  <span>~{readingTimeMinutes} min read</span>
                </div>
              </div>

              <textarea
                rows={16}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setSaveStatus('dirty');
                }}
                placeholder="Write news story body here. Adhere to Zimbabwean Media Commission standards..."
                className="w-full font-sans text-sm text-slate-800 leading-relaxed border-none p-0 focus:outline-hidden focus:ring-0 placeholder:text-slate-300 resize-y"
              />
            </div>
          </div>

          {/* Editorial Instructions & Verification Warning */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 text-slate-800 font-bold">
              <ShieldAlert className="h-4 w-4 text-teal-600" />
              <span>Editorial Guidelines & Source Verification</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              {editorialInstructions ||
                'Ensure all monetary claims (ZWG and USD), legal case references, and municipal statistics are backed by corroborated documents before submitting.'}
            </p>
          </div>
        </div>

        {/* Right Sidebar: Meta & Editorial Comments (1 col) */}
        <div className="space-y-5">
          {/* Story Metadata Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3.5 text-xs">
            <h3 className="font-serif font-bold text-slate-900 border-b border-slate-100 pb-2">
              Story Attributes
            </h3>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                Category
              </span>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSaveStatus('dirty');
                }}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
              >
                <option value="News">News</option>
                <option value="Business">Business & Economy</option>
                <option value="Politics">Politics & Governance</option>
                <option value="Technology">Technology & Innovation</option>
                <option value="Health">Health</option>
                <option value="Sports">Sports</option>
                <option value="Community Affairs">Community Affairs</option>
                <option value="Investigations">Investigations</option>
                <option value="Entertainment">Entertainment</option>
              </select>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                Featured Image URL
              </span>
              <input
                type="text"
                value={featuredImageUrl}
                onChange={(e) => {
                  setFeaturedImageUrl(e.target.value);
                  setSaveStatus('dirty');
                }}
                placeholder="https://..."
                className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
              />
              {featuredImageUrl && (
                <div className="mt-2 h-28 w-full overflow-hidden rounded-lg bg-slate-100">
                  <img
                    src={featuredImageUrl}
                    alt="Featured preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-2 flex justify-between text-[11px] text-slate-500">
              <span>Deadline:</span>
              <span className="font-semibold text-slate-800">
                {new Date(story.deadline).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Editorial Comments & Revision Requests */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-teal-600" />
                <h3 className="font-serif font-bold text-slate-900 text-xs">
                  Editorial Comments ({story.comments?.length || 0})
                </h3>
              </div>
            </div>

            <div className="mt-3 max-h-64 overflow-y-auto space-y-2.5 pr-1">
              {(!story.comments || story.comments.length === 0) ? (
                <p className="py-4 text-center text-xs text-slate-400 italic">
                  No editorial comments logged yet.
                </p>
              ) : (
                story.comments.map((comm) => (
                  <div
                    key={comm.id}
                    className={`rounded-xl p-3 text-xs ${
                      comm.isRevisionRequest
                        ? 'border border-rose-200 bg-rose-50 text-rose-950'
                        : 'border border-slate-100 bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                      <span className="font-bold text-slate-800">
                        {comm.authorName} ({comm.authorRole.replace(/_/g, ' ')})
                      </span>
                      <span>
                        {new Date(comm.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="leading-relaxed">{comm.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="mt-3 border-t border-slate-100 pt-3 space-y-2">
              <textarea
                rows={2}
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Add editorial feedback or query..."
                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-teal-500 focus:outline-hidden"
              />
              <div className="flex items-center justify-between">
                {hasPermission('approve_story') && (
                  <label className="flex items-center gap-1.5 text-[11px] text-rose-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isRevisionComment}
                      onChange={(e) => setIsRevisionComment(e.target.checked)}
                      className="rounded text-rose-600"
                    />
                    <span>Mark as Revision Request</span>
                  </label>
                )}
                <button
                  type="submit"
                  className="ml-auto rounded-lg bg-teal-600 px-3 py-1 text-xs font-semibold text-white hover:bg-teal-700"
                >
                  Post Comment
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* AI ASSISTANT SLIDE-OVER DRAWER */}
      {showAIDrawer && (
        <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-white shadow-2xl border-l border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-slate-900 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-teal-400" />
              <div>
                <h3 className="font-serif font-bold text-sm">SmartNewsroom AI Assistant</h3>
                <p className="text-[10px] text-teal-300">Powered by Gemini 3.8 Flash • Non-destructive</p>
              </div>
            </div>
            <button
              onClick={() => setShowAIDrawer(false)}
              className="rounded-lg p-1 text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Mode Selector */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1 rounded-xl bg-slate-100 p-1 text-[11px] font-semibold text-slate-600">
              <button
                onClick={() => setAIMode('improve')}
                className={`rounded-lg py-1.5 ${aiMode === 'improve' ? 'bg-white text-teal-700 shadow-2xs' : ''}`}
              >
                Improve
              </button>
              <button
                onClick={() => setAIMode('headline')}
                className={`rounded-lg py-1.5 ${aiMode === 'headline' ? 'bg-white text-teal-700 shadow-2xs' : ''}`}
              >
                Headlines
              </button>
              <button
                onClick={() => setAIMode('outline')}
                className={`rounded-lg py-1.5 ${aiMode === 'outline' ? 'bg-white text-teal-700 shadow-2xs' : ''}`}
              >
                Outline
              </button>
              <button
                onClick={() => setAIMode('verify')}
                className={`rounded-lg py-1.5 ${aiMode === 'verify' ? 'bg-white text-teal-700 shadow-2xs' : ''}`}
              >
                Verify
              </button>
              <button
                onClick={() => setAIMode('summary')}
                className={`rounded-lg py-1.5 ${aiMode === 'summary' ? 'bg-white text-teal-700 shadow-2xs' : ''}`}
              >
                Summary
              </button>
            </div>

            {/* Tone Selector */}
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400">Journalistic Tone</label>
              <select
                value={aiTone}
                onChange={(e) => setAITone(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden"
              >
                <option value="Professional news reporting">Professional news reporting (Neutral, precise)</option>
                <option value="Investigative journalism">Investigative journalism (Skeptical, detailed)</option>
                <option value="Feature writing">Feature writing (Narrative, human interest)</option>
                <option value="Broadcast news">Broadcast news (Punchy, short sentences)</option>
                <option value="Community reporting">Community reporting (Accessible, civic-oriented)</option>
              </select>
            </div>

            {/* Optional Custom Prompt */}
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400">Custom Guidance (Optional)</label>
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAIPrompt(e.target.value)}
                placeholder="e.g. Focus on Bulawayo residents' reaction..."
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden"
              />
            </div>

            {/* Trigger Button */}
            <button
              onClick={handleRunAI}
              disabled={isAILoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              <span>{isAILoading ? 'AI Analyzing with Gemini...' : `Run ${aiMode.toUpperCase()} Assistant`}</span>
            </button>

            {/* AI Output Card */}
            {aiResult && (
              <div className="rounded-xl border border-teal-200 bg-teal-50/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-900">AI Assistant Suggestions</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(aiResult);
                        alert('Copied to clipboard!');
                      }}
                      className="rounded p-1 text-teal-700 hover:bg-teal-100"
                      title="Copy to clipboard"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    {aiMode === 'improve' && (
                      <button
                        onClick={() => {
                          if (window.confirm('Append AI improved text to current article content?')) {
                            setContent((prev) => `${prev}\n\n---\n[AI SUGGESTED REVISION]\n${aiResult}`);
                            setSaveStatus('dirty');
                          }
                        }}
                        className="rounded bg-teal-700 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-teal-800"
                      >
                        Insert Below
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto whitespace-pre-wrap text-xs text-slate-800 leading-relaxed font-sans bg-white p-3 rounded-lg border border-slate-200">
                  {aiResult}
                </div>

                <p className="text-[10px] text-teal-800 italic">
                  Note: AI does not automatically overwrite your original text. Review suggestions critically before publishing.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VERSION HISTORY DRAWER */}
      {showVersionDrawer && (
        <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl border-l border-slate-200 p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-serif font-bold text-slate-900">Version History</h3>
            <button onClick={() => setShowVersionDrawer(false)} className="text-slate-400 hover:text-slate-700">
              ✕
            </button>
          </div>

          <div className="mt-4 flex-1 overflow-y-auto space-y-3">
            {story.versions?.map((ver, idx) => (
              <div key={ver.id} className="rounded-xl border border-slate-200 p-3 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>Version {ver.versionNumber}</span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(ver.savedAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Saved by {ver.savedByUserName}</p>
                <p className="font-semibold text-slate-800 line-clamp-1">{ver.title}</p>
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      if (window.confirm(`Revert article editor to Version ${ver.versionNumber}?`)) {
                        setTitle(ver.title);
                        setSummary(ver.summary);
                        setContent(ver.content);
                        setSaveStatus('dirty');
                        setShowVersionDrawer(false);
                      }
                    }}
                    className="text-[11px] font-semibold text-teal-600 hover:underline"
                  >
                    Revert to This Version
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
