import React, { useState } from 'react';
import {
  Film,
  Image as ImageIcon,
  Mic,
  FileText,
  Upload,
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  Plus,
  Play,
  Pause,
  X,
  Tag,
} from 'lucide-react';
import { useNewsroom } from '../contexts/NewsroomContext';
import { MediaAsset } from '../types';

export const MultimediaLibraryPage: React.FC = () => {
  const { mediaAssets, departments, stories, currentOrg, currentUser, addMediaAsset, deleteMediaAsset, hasPermission } =
    useNewsroom();

  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('all');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);

  // Upload Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<MediaAsset['type']>('image');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || '');
  const [storyId, setStoryId] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Filtering
  const filteredAssets = mediaAssets.filter((asset) => {
    if (activeTypeFilter !== 'all' && asset.type !== activeTypeFilter) return false;
    if (selectedDeptFilter !== 'all' && asset.departmentId !== selectedDeptFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        asset.name.toLowerCase().includes(q) ||
        asset.description.toLowerCase().includes(q) ||
        asset.tags.some((t) => t.toLowerCase().includes(q)) ||
        asset.uploadedByUserName.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please provide a file name');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    addMediaAsset({
      name: name.trim(),
      type,
      url:
        url.trim() ||
        (type === 'image'
          ? 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80'
          : 'https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3'),
      size: '2.4 MB',
      departmentId,
      storyId: storyId || undefined,
      uploadedByUserId: currentUser.id,
      uploadedByUserName: currentUser.name,
      description: description.trim(),
      tags: tags.length > 0 ? tags : [type, 'SmartNewsroom'],
    });

    setShowUploadModal(false);
    setName('');
    setUrl('');
    setDescription('');
    setTagsInput('');
  };

  const getTypeIcon = (t: MediaAsset['type']) => {
    switch (t) {
      case 'image':
      case 'graphic':
        return <ImageIcon className="h-4 w-4 text-emerald-600" />;
      case 'audio':
        return <Mic className="h-4 w-4 text-indigo-600" />;
      case 'video':
        return <Film className="h-4 w-4 text-rose-600" />;
      case 'document':
      case 'subtitle':
        return <FileText className="h-4 w-4 text-amber-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white">
              <Film className="h-4 w-4" />
            </span>
            <h1 className="font-serif text-2xl font-bold text-slate-900">
              Multimedia Library
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Centralized repository for broadcast audio, b-roll video, high-res photography, and verified source documents for{' '}
            <strong>{currentOrg.name}</strong>.
          </p>
        </div>

        {hasPermission('upload_media') && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Upload Asset</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
        {/* Type pills */}
        <div className="flex flex-wrap items-center gap-1">
          {[
            { id: 'all', label: 'All Assets' },
            { id: 'image', label: 'Images' },
            { id: 'audio', label: 'Audio & Interviews' },
            { id: 'video', label: 'Video Packages' },
            { id: 'document', label: 'Documents & PDFs' },
            { id: 'graphic', label: 'Graphics' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTypeFilter(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTypeFilter === tab.id
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Dept Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-hidden"
            />
          </div>

          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredAssets.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <Film className="mx-auto h-10 w-10 text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-slate-600">No media assets found</p>
            <p className="text-[11px] mt-1">Upload a recording or image to start building the newsroom library.</p>
          </div>
        ) : (
          filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs hover:border-teal-300 transition group"
            >
              {/* Media Thumbnail or Type Placeholder */}
              <div
                onClick={() => setPreviewAsset(asset)}
                className="relative h-40 w-full bg-slate-100 cursor-pointer overflow-hidden flex items-center justify-center"
              >
                {asset.type === 'image' || asset.type === 'graphic' ? (
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 shadow-2xs">
                      {getTypeIcon(asset.type)}
                    </div>
                    <span className="mt-2 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      {asset.type}
                    </span>
                    {asset.duration && (
                      <span className="text-[10px] text-slate-500 font-medium">
                        Duration: {asset.duration}
                      </span>
                    )}
                  </div>
                )}

                <div className="absolute top-2 left-2 flex items-center gap-1 rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
                  {getTypeIcon(asset.type)}
                  <span className="capitalize">{asset.type}</span>
                </div>
              </div>

              {/* Asset Info */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3
                    onClick={() => setPreviewAsset(asset)}
                    className="font-bold text-xs text-slate-900 line-clamp-1 hover:text-teal-700 cursor-pointer"
                  >
                    {asset.name}
                  </h3>
                  <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {asset.description}
                  </p>

                  {/* Tags */}
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {asset.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-600"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer metadata */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span>By {asset.uploadedByUserName}</span>
                  <span>{asset.size}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setPreviewAsset(asset)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:text-teal-800"
                >
                  <Eye className="h-3 w-3" />
                  <span>Preview</span>
                </button>

                <div className="flex items-center gap-1">
                  <a
                    href={asset.url}
                    download={asset.name}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-slate-400 hover:text-slate-700"
                    title="Download Asset"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </a>
                  {hasPermission('upload_media') && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete ${asset.name} from newsroom media library?`)) {
                          deleteMediaAsset(asset.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600"
                      title="Delete Asset"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Asset Preview Modal */}
      {previewAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-serif text-sm font-bold text-slate-900">{previewAsset.name}</h3>
                <p className="text-[11px] text-slate-500">
                  Uploaded by {previewAsset.uploadedByUserName} • {previewAsset.size}
                </p>
              </div>
              <button
                onClick={() => setPreviewAsset(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="my-4 flex items-center justify-center rounded-xl bg-slate-900 p-2 min-h-64">
              {previewAsset.type === 'image' || previewAsset.type === 'graphic' ? (
                <img
                  src={previewAsset.url}
                  alt={previewAsset.name}
                  className="max-h-96 rounded-lg object-contain"
                />
              ) : previewAsset.type === 'audio' ? (
                <div className="w-full p-6 text-center text-white space-y-4">
                  <Mic className="mx-auto h-12 w-12 text-teal-400" />
                  <p className="font-semibold text-sm">{previewAsset.name}</p>
                  <audio controls className="w-full">
                    <source src={previewAsset.url} type="audio/mp3" />
                    Your browser does not support audio playback.
                  </audio>
                </div>
              ) : (
                <div className="p-8 text-center text-white">
                  <FileText className="mx-auto h-12 w-12 text-teal-400 mb-2" />
                  <p className="text-xs">{previewAsset.description}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500">Tags: {previewAsset.tags.join(', ')}</span>
              <a
                href={previewAsset.url}
                download={previewAsset.name}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download High-Res</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Upload Asset Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-slate-900">Upload Media Asset</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700">File Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Belmont_Factory_Floor_Interview.wav"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Asset Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900 focus:outline-hidden"
                  >
                    <option value="image">Image / Photo</option>
                    <option value="audio">Audio / Interview</option>
                    <option value="video">Video Package</option>
                    <option value="document">Document / PDF</option>
                    <option value="graphic">Infographic</option>
                    <option value="subtitle">Subtitle SRT</option>
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
                  Asset Media URL (or CDN link)
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://... (defaults to sample asset if left blank)"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Context, camera notes, speaker names..."
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Tags (Comma-separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Bulawayo, Industry, Audio, ZMDTP"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-teal-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-700"
                >
                  Register Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
