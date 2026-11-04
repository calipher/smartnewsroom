import React, { useState } from 'react';
import {
  Send,
  Globe,
  Radio,
  Tv,
  MessageCircle,
  Share2,
  CheckCircle2,
  Clock,
  Eye,
  Calendar,
  AlertCircle,
  ExternalLink,
  Smartphone,
  Monitor,
  X,
} from 'lucide-react';
import { useNewsroom } from '../contexts/NewsroomContext';
import { Story } from '../types';

export const PublishingCentrePage: React.FC = () => {
  const { stories, currentOrg, currentUser, transitionStoryStatus, hasPermission } = useNewsroom();

  const [activeTab, setActiveTab] = useState<'approved' | 'scheduled' | 'published'>('approved');
  const [previewStory, setPreviewStory] = useState<Story | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop' | 'radio_rundown'>('mobile');

  // Filter queues
  const approvedQueue = stories.filter((s) => s.status === 'approved');
  const scheduledQueue = stories.filter((s) => s.status === 'scheduled');
  const publishedQueue = stories.filter((s) => s.status === 'published');

  const handlePublishNow = (story: Story) => {
    if (!hasPermission('publish_story')) {
      alert('Only authorized Editors-in-Chief or Organisation Administrators can publish live.');
      return;
    }

    if (window.confirm(`Publish "${story.title}" live across all configured news channels?`)) {
      transitionStoryStatus(story.id, 'published', 'Published live by editor');
      alert(`Story published live! Broadcast feeds and website cache refreshed.`);
    }
  };

  const getDestinationIcon = (dest: string) => {
    switch (dest.toLowerCase()) {
      case 'website':
        return <Globe className="h-3.5 w-3.5 text-blue-600" />;
      case 'radio bulletin':
        return <Radio className="h-3.5 w-3.5 text-indigo-600" />;
      case 'tv report':
      case 'television report':
        return <Tv className="h-3.5 w-3.5 text-rose-600" />;
      case 'whatsapp channel':
      case 'whatsapp':
        return <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />;
      default:
        return <Share2 className="h-3.5 w-3.5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white">
              <Send className="h-4 w-4" />
            </span>
            <h1 className="font-serif text-2xl font-bold text-slate-900">
              Newsroom Publishing Centre
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Multi-channel distribution desk for <strong>{currentOrg.name}</strong>. Website CMS syndication, radio bulletin rundowns, and WhatsApp broadcast feeds.
          </p>
        </div>

        {/* Tab Filter */}
        <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
          <button
            onClick={() => setActiveTab('approved')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'approved' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Approved Queue ({approvedQueue.length})
          </button>
          <button
            onClick={() => setActiveTab('scheduled')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'scheduled' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Scheduled ({scheduledQueue.length})
          </button>
          <button
            onClick={() => setActiveTab('published')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'published' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Published Live ({publishedQueue.length})
          </button>
        </div>
      </div>

      {/* WordPress & CMS Integration Architecture Callout */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 to-[#14243A] p-5 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded bg-teal-500/20 px-2 py-0.5 text-[10px] font-bold text-teal-300">
                DISTRIBUTION ARCHITECTURE
              </span>
              <span className="text-xs text-slate-400">REST API & Webhooks</span>
            </div>
            <h3 className="font-serif text-base font-bold text-white">
              Headless WordPress & Multi-Destination Hub
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              When content is cleared by an Editor-in-Chief, SmartNewsroom pushes structured JSON payloads with featured imagery, tags, and bilingual subtitles to connected web endpoints, radio automation systems, and community WhatsApp channels.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 border border-slate-700">
              WordPress API: Ready
            </span>
            <span className="rounded-lg bg-teal-500/20 px-3 py-2 text-xs font-semibold text-teal-300 border border-teal-500/30">
              Broadcast XML: Online
            </span>
          </div>
        </div>
      </div>

      {/* Story Queue Cards */}
      <div className="space-y-4">
        {activeTab === 'approved' && (
          <>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Stories Cleared for Final Transmission / Web Push
            </div>
            {approvedQueue.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
                <CheckCircle2 className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-600">No stories in approved queue</p>
                <p className="text-[11px] mt-1">Review and approve stories on the Story Management board.</p>
              </div>
            ) : (
              approvedQueue.map((story) => (
                <div
                  key={story.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-teal-300 transition"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                        {story.category}
                      </span>
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        CLEARED FOR PUBLISH
                      </span>
                    </div>
                    <h3 className="font-serif text-sm font-bold text-slate-900">{story.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{story.summary}</p>
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
                      <span>Reporter: {story.assignedToUserName || story.authorName}</span>
                      <span>•</span>
                      <span>{story.wordCount} words</span>
                      <span>•</span>
                      <div className="flex items-center gap-1 font-medium text-slate-600">
                        <span>Destinations:</span>
                        {(story.publishDestinations || ['Website', 'WhatsApp Channel']).map((d) => (
                          <span
                            key={d}
                            className="flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px]"
                          >
                            {getDestinationIcon(d)}
                            <span>{d}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Publishing Actions */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      onClick={() => setPreviewStory(story)}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Preview Distribution</span>
                    </button>
                    {hasPermission('publish_story') && (
                      <button
                        onClick={() => handlePublishNow(story)}
                        className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-700"
                      >
                        <Send className="h-4 w-4" />
                        <span>Publish Live Now</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'scheduled' && (
          <>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Scheduled Timed Releases
            </div>
            {scheduledQueue.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
                <Clock className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-600">No scheduled stories</p>
              </div>
            ) : (
              scheduledQueue.map((story) => (
                <div
                  key={story.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                        {story.category}
                      </span>
                      <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Scheduled for: {story.scheduledPublishDate ? new Date(story.scheduledPublishDate).toLocaleString('en-GB') : 'Tomorrow 07:00'}</span>
                      </span>
                    </div>
                    <h3 className="font-serif text-sm font-bold text-slate-900">{story.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{story.summary}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewStory(story)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Preview
                    </button>
                    {hasPermission('publish_story') && (
                      <button
                        onClick={() => handlePublishNow(story)}
                        className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
                      >
                        Publish Early
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'published' && (
          <>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Publication History & Archive
            </div>
            <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
              {publishedQueue.map((story) => (
                <div key={story.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                        {story.category}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Published:{' '}
                        {story.publishedAt
                          ? new Date(story.publishedAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Recent'}
                      </span>
                    </div>
                    <h4 className="font-serif text-xs font-bold text-slate-900 line-clamp-1">{story.title}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{story.summary}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setPreviewStory(story)}
                      className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Live Preview</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Multi-Destination Preview Modal */}
      {previewStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-serif text-sm font-bold text-slate-900">
                  Simulated Multi-Destination Preview
                </h3>
                <p className="text-[11px] text-slate-500">
                  Preview layout as rendered across different Zimbabwean consumption channels
                </p>
              </div>

              {/* Device Selector */}
              <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition ${
                    previewDevice === 'mobile' ? 'bg-white shadow-2xs font-bold text-teal-800' : 'text-slate-600'
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>Mobile Web</span>
                </button>
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition ${
                    previewDevice === 'desktop' ? 'bg-white shadow-2xs font-bold text-teal-800' : 'text-slate-600'
                  }`}
                >
                  <Monitor className="h-3.5 w-3.5" />
                  <span>Portal / CMS</span>
                </button>
                <button
                  onClick={() => setPreviewDevice('radio_rundown')}
                  className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition ${
                    previewDevice === 'radio_rundown' ? 'bg-white shadow-2xs font-bold text-teal-800' : 'text-slate-600'
                  }`}
                >
                  <Radio className="h-3.5 w-3.5" />
                  <span>Radio Rundown</span>
                </button>
              </div>

              <button
                onClick={() => setPreviewStory(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Simulated Canvas */}
            <div className="mt-4 flex-1 overflow-y-auto p-4 bg-slate-50 rounded-xl flex items-center justify-center">
              {previewDevice === 'mobile' ? (
                <div className="w-80 rounded-3xl border-4 border-slate-800 bg-white p-4 shadow-xl text-slate-900 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-serif font-bold text-xs text-teal-800">
                      {currentOrg.name}
                    </span>
                    <span className="text-[10px] text-slate-400">Bulawayo</span>
                  </div>
                  {previewStory.featuredImageUrl && (
                    <img
                      src={previewStory.featuredImageUrl}
                      alt="Story"
                      className="h-36 w-full rounded-lg object-cover"
                    />
                  )}
                  <h4 className="font-serif text-sm font-bold leading-tight">
                    {previewStory.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 italic">
                    By {previewStory.authorName} • {previewStory.category}
                  </p>
                  <p className="text-xs text-slate-700 leading-relaxed font-sans line-clamp-6">
                    {previewStory.content}
                  </p>
                </div>
              ) : previewDevice === 'desktop' ? (
                <div className="w-full max-w-xl bg-white p-6 rounded-xl shadow-xs border border-slate-200 space-y-3">
                  <span className="rounded bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                    {previewStory.category}
                  </span>
                  <h2 className="font-serif text-lg font-bold text-slate-900">
                    {previewStory.title}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Published by {currentOrg.name} • Reported by {previewStory.authorName}
                  </p>
                  <div className="border-t border-slate-100 pt-3 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto font-sans">
                    {previewStory.content}
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-xl bg-slate-900 text-slate-100 p-6 rounded-xl font-mono text-xs space-y-3 border border-slate-700">
                  <div className="flex items-center justify-between text-teal-400 font-bold border-b border-slate-800 pb-2">
                    <span>BROADCAST RUNDOWN / TELEPROMPTER</span>
                    <span>EST TIME: ~{Math.ceil(previewStory.wordCount / 130)} MIN</span>
                  </div>
                  <p className="text-amber-400 font-bold">
                    [SLUG: {previewStory.category.toUpperCase()} / {previewStory.id}]
                  </p>
                  <p className="text-white text-sm font-bold uppercase leading-snug">
                    {previewStory.title}
                  </p>
                  <div className="text-slate-300 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {previewStory.content}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setPreviewStory(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600"
              >
                Close Preview
              </button>
              {hasPermission('publish_story') && previewStory.status !== 'published' && (
                <button
                  onClick={() => {
                    handlePublishNow(previewStory);
                    setPreviewStory(null);
                  }}
                  className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700"
                >
                  Publish Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
