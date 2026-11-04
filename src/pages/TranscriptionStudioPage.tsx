import React, { useState } from 'react';
import {
  Mic,
  Upload,
  Play,
  Pause,
  Download,
  Save,
  Sparkles,
  FileText,
  Clock,
  Languages,
  AlertCircle,
  Check,
  RotateCcw,
  Film,
} from 'lucide-react';
import { useNewsroom } from '../contexts/NewsroomContext';

interface TranscriptionStudioPageProps {
  onSendToArticleEditor?: (title: string, content: string) => void;
}

export const TranscriptionStudioPage: React.FC<TranscriptionStudioPageProps> = ({
  onSendToArticleEditor,
}) => {
  const { currentOrg, currentUser, transcripts, addTranscript, addMediaAsset, transcribeAudioAI } =
    useNewsroom();

  const [interviewTitle, setInterviewTitle] = useState('BCC Engineering Press Briefing on Water Pipelines');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'nd' | 'sn'>('en');
  const [fieldNotes, setFieldNotes] = useState('Press briefing at Bulawayo City Hall. Town Clerk Christopher Dube details non-revenue water reductions in Luveve and Egodini.');
  const [selectedSampleAudio, setSelectedSampleAudio] = useState('Town_Clerk_Interview_Luveve_Water.wav');

  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentTranscript, setCurrentTranscript] = useState<string>('');
  const [summaryBrief, setSummaryBrief] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'new' | 'library'>('new');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Pre-loaded sample recordings from Bulawayo
  const sampleAudioRecordings = [
    {
      name: 'Town_Clerk_Interview_Luveve_Water.wav',
      title: 'BCC Town Clerk on Western Suburbs Water Overhaul',
      lang: 'en' as const,
      duration: '14:20',
      size: '18.2 MB',
      notes: 'Recorded in Bulawayo Council Chambers. Discussion of 14km ductile iron bypass mains.',
    },
    {
      name: 'Intwasa_Poet_Interview.mp3',
      title: 'Intwasa Poetry & Digital Arts Dialogue (isiNdebele)',
      lang: 'nd' as const,
      duration: '08:45',
      size: '10.4 MB',
      notes: 'Recorded at National Gallery of Zimbabwe, Bulawayo. Sithandazile Dube on Ndebele language tech.',
    },
    {
      name: 'NUST_AgriTech_Farmer_Feedback.m4a',
      title: 'Umguza Smallholder Farmers on IoT Soil Sensors (Shona/English)',
      lang: 'sn' as const,
      duration: '11:15',
      size: '12.8 MB',
      notes: 'Field interviews in Umguza irrigation scheme regarding early drought warning signals.',
    },
  ];

  const handleSelectSample = (sample: (typeof sampleAudioRecordings)[0]) => {
    setSelectedSampleAudio(sample.name);
    setInterviewTitle(sample.title);
    setSelectedLanguage(sample.lang);
    setFieldNotes(sample.notes);
  };

  const handleStartTranscription = async () => {
    setIsProcessing(true);
    setProgressPercent(15);
    setCurrentTranscript('');
    setSummaryBrief('');

    const interval = setInterval(() => {
      setProgressPercent((prev) => (prev < 85 ? prev + 15 : prev));
    }, 400);

    try {
      const result = await transcribeAudioAI({
        language: selectedLanguage,
        interviewTitle,
        notes: `${fieldNotes} (File: ${selectedSampleAudio})`,
      });

      clearInterval(interval);
      setProgressPercent(100);
      setCurrentTranscript(result.transcript);
      setSummaryBrief(result.summary || 'Transcription processed successfully');
    } catch (err: any) {
      clearInterval(interval);
      alert('Transcription Error: ' + (err?.message || 'Processing failed'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToLibrary = () => {
    if (!currentTranscript) return;
    addTranscript({
      title: interviewTitle,
      audioFileName: selectedSampleAudio,
      audioDuration: '12:00',
      language: selectedLanguage,
      content: currentTranscript,
      summary: summaryBrief,
      createdByUserId: currentUser.id,
      createdByName: currentUser.name,
    });

    // Also register in Multimedia Library as document
    addMediaAsset({
      name: `${selectedSampleAudio.split('.')[0]}_Transcript.txt`,
      type: 'document',
      url: '#',
      size: '24 KB',
      uploadedByUserId: currentUser.id,
      uploadedByUserName: currentUser.name,
      description: `Verbatim transcript for interview "${interviewTitle}"`,
      tags: ['Transcript', selectedLanguage === 'nd' ? 'isiNdebele' : selectedLanguage === 'sn' ? 'Shona' : 'English', 'Audio'],
    });

    alert('Transcript and documentation saved to Multimedia Library!');
  };

  const handleDownloadTxt = () => {
    if (!currentTranscript) return;
    const blob = new Blob([currentTranscript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${interviewTitle.replace(/\s+/g, '_')}_Transcript.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleConvertToStory = () => {
    if (!currentTranscript || !onSendToArticleEditor) return;
    onSendToArticleEditor(
      `Special Report: ${interviewTitle}`,
      `TRANSCRIPT SOURCE MATERIAL:\n${currentTranscript}\n\n---\nNEWS ARTICLE LEAD:\nBULAWAYO — In an exclusive interview, key stakeholders highlighted developments regarding ${interviewTitle}...`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white">
              <Mic className="h-4 w-4" />
            </span>
            <h1 className="font-serif text-2xl font-bold text-slate-900">
              Audio Transcription Studio
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Automated speech-to-text with Zimbabwean vernacular recognition (English, isiNdebele, Shona) for news field recordings.
          </p>
        </div>

        {/* Studio Tab Switcher */}
        <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
          <button
            onClick={() => setActiveTab('new')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'new' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            New Transcription
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'library' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Saved Transcripts ({transcripts.length})
          </button>
        </div>
      </div>

      {/* Accuracy & Human Review Notice */}
      <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4 border border-amber-200/70 text-xs text-amber-950">
        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Zimbabwean Local Language Accuracy Notice</p>
          <p className="mt-0.5 text-amber-800 leading-relaxed">
            While Gemini provides deep multilingual contextual understanding, phonetic dialects in isiNdebele and Shona, colloquial terminology, and noisy field audio require journalist manual review. Always verify sensitive quotes before publishing.
          </p>
        </div>
      </div>

      {activeTab === 'new' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel: Audio Selector & Parameters */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <h2 className="font-serif text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Audio File & Recording Setup
            </h2>

            {/* Pre-loaded Sample Interviews */}
            <div>
              <label className="text-xs font-semibold text-slate-700">
                Select Audio Recording (or Upload File)
              </label>
              <div className="mt-2 space-y-2">
                {sampleAudioRecordings.map((rec) => (
                  <div
                    key={rec.name}
                    onClick={() => handleSelectSample(rec)}
                    className={`cursor-pointer rounded-xl border p-3 text-xs transition ${
                      selectedSampleAudio === rec.name
                        ? 'border-teal-500 bg-teal-50/50 ring-1 ring-teal-500'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{rec.title}</span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                        {rec.duration}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-500">
                      <span>📁 {rec.name}</span>
                      <span>•</span>
                      <span>
                        Lang:{' '}
                        <strong>
                          {rec.lang === 'nd' ? 'isiNdebele' : rec.lang === 'sn' ? 'Shona' : 'English'}
                        </strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom file upload simulator */}
            <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center hover:bg-slate-50 transition cursor-pointer">
              <Upload className="mx-auto h-6 w-6 text-slate-400" />
              <p className="mt-1 text-xs font-semibold text-slate-700">
                Upload New Audio (MP3, WAV, M4A)
              </p>
              <p className="text-[10px] text-slate-400">Up to 50MB per newsroom recording</p>
            </div>

            {/* Interview Title */}
            <div>
              <label className="text-xs font-semibold text-slate-700">Interview Title / Slug</label>
              <input
                type="text"
                value={interviewTitle}
                onChange={(e) => setInterviewTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden"
              />
            </div>

            {/* Language Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-700">Primary Spoken Language</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as any)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden font-medium"
              >
                <option value="en">English (Official broadcast & news reporting)</option>
                <option value="nd">isiNdebele (Northern Ndebele, Bulawayo & Matabeleland)</option>
                <option value="sn">Shona (chiShona)</option>
              </select>
            </div>

            {/* Field Notes */}
            <div>
              <label className="text-xs font-semibold text-slate-700">
                Field Notes & Proper Names (Improves Accuracy)
              </label>
              <textarea
                rows={3}
                value={fieldNotes}
                onChange={(e) => setFieldNotes(e.target.value)}
                placeholder="List interviewees, municipal institutions or location names..."
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden"
              />
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartTranscription}
              disabled={isProcessing}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 disabled:opacity-50 transition"
            >
              <Mic className="h-4 w-4" />
              <span>{isProcessing ? 'Transcribing with Gemini...' : 'Start Audio Transcription'}</span>
            </button>

            {/* Progress Bar */}
            {isProcessing && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                  <span>Processing audio waveforms...</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-teal-500 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Resulting Transcript & Editorial Actions */}
          <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-serif text-sm font-bold text-slate-900">Verbatim Transcript</h2>
                <p className="text-[11px] text-slate-400">Editable timestamps and speaker segments</p>
              </div>

              {currentTranscript && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadTxt}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    title="Download as TXT"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">TXT</span>
                  </button>
                  <button
                    onClick={handleSaveToLibrary}
                    className="flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-900"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Save</span>
                  </button>
                  {onSendToArticleEditor && (
                    <button
                      onClick={handleConvertToStory}
                      className="flex items-center gap-1 rounded-lg bg-teal-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-teal-700"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Convert to Article</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 flex-1">
              {!currentTranscript && !isProcessing ? (
                <div className="flex flex-col items-center justify-center py-28 text-center text-slate-400">
                  <Mic className="h-10 w-10 text-slate-300 mb-2" />
                  <p className="text-xs font-semibold text-slate-600">No active transcript</p>
                  <p className="text-[11px] max-w-xs mt-1">
                    Select an audio file or sample on the left, then click &quot;Start Audio Transcription&quot;.
                  </p>
                </div>
              ) : isProcessing ? (
                <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
                  <p className="text-xs font-semibold text-slate-700">
                    Transcribing dialogue in {selectedLanguage === 'nd' ? 'isiNdebele' : selectedLanguage === 'sn' ? 'Shona' : 'English'}...
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Aligning timestamps and filtering background studio noise
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {summaryBrief && (
                    <div className="rounded-xl bg-teal-50/50 p-3 text-xs text-teal-900 border border-teal-200/60 font-medium">
                      {summaryBrief}
                    </div>
                  )}

                  <textarea
                    rows={18}
                    value={currentTranscript}
                    onChange={(e) => setCurrentTranscript(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-4 font-mono text-xs text-slate-800 leading-relaxed focus:border-teal-500 focus:outline-hidden resize-y"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* SAVED TRANSCRIPTS ARCHIVE */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {transcripts.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-serif font-bold text-slate-900 text-sm">{item.title}</h3>
                  <p className="text-[11px] text-slate-500">
                    Audio: {item.audioFileName} • Lang: {item.language.toUpperCase()}
                  </p>
                </div>
                <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700">
                  Transcribed
                </span>
              </div>

              <div className="max-h-40 overflow-y-auto rounded-lg bg-slate-50 p-3 font-mono text-[11px] text-slate-700 whitespace-pre-wrap border border-slate-100">
                {item.content.slice(0, 400)}...
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-[11px] text-slate-400">By {item.createdByName}</span>
                <button
                  onClick={() => {
                    setCurrentTranscript(item.content);
                    setInterviewTitle(item.title);
                    setActiveTab('new');
                  }}
                  className="font-semibold text-teal-600 hover:underline"
                >
                  Open in Workspace
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
