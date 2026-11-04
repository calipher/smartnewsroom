import React, { useState } from 'react';
import {
  Languages,
  ArrowRightLeft,
  Copy,
  Check,
  Sparkles,
  Download,
  AlertCircle,
  FileText,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { useNewsroom } from '../contexts/NewsroomContext';

interface TranslationStudioPageProps {
  onSendToArticleEditor?: (title: string, content: string) => void;
}

export const TranslationStudioPage: React.FC<TranslationStudioPageProps> = ({
  onSendToArticleEditor,
}) => {
  const { currentOrg, currentUser, translations, addTranslation, translateAI } = useNewsroom();

  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('nd'); // Default to isiNdebele (Bulawayo pilot context)
  const [contentType, setContentType] = useState<'article' | 'headline' | 'social' | 'broadcast'>('article');

  const [inputText, setInputText] = useState(
    'BULAWAYO — Heavy engineering and manufacturing firms in Belmont have recorded an 18 percent rebound in production output following steady power supply allocations. City council engineers also announced that pipeline rehabilitation along Luveve and Egodini has curbed distribution water losses from 42 percent down to 26 percent.'
  );
  const [translatedText, setTranslatedText] = useState('');
  const [culturalNotes, setCulturalNotes] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Quick Preset Samples for Zimbabwean news
  const sampleTranslationPrompts = [
    {
      title: 'Bulawayo Water Pipeline Lead',
      source: 'en',
      target: 'nd',
      type: 'headline' as const,
      text: 'Bulawayo Water Distribution: Egodini & Luveve Pipeline Rehabilitation Timeline Revealed. City engineers cut water losses from 42% down to 26%.',
    },
    {
      title: 'Matabeleland Solar Energy Health Clinics',
      source: 'en',
      target: 'sn',
      type: 'article' as const,
      text: 'Twelve rural health clinics in Matabeleland North have achieved 100% clean power using hybrid solar-storage mini-grids, ensuring uninterrupted vaccine refrigeration and emergency maternity lighting.',
    },
    {
      title: 'Highlanders FC Youth Victory Bulletin',
      source: 'en',
      target: 'nd',
      type: 'broadcast' as const,
      text: 'Five young players from Highlanders Football Club academy have been selected for the Zimbabwe Under-20 national squad ahead of the COSAFA championship in Maputo.',
    },
  ];

  const handleApplySample = (sample: (typeof sampleTranslationPrompts)[0]) => {
    setSourceLang(sample.source);
    setTargetLang(sample.target);
    setContentType(sample.type);
    setInputText(sample.text);
    setTranslatedText('');
    setCulturalNotes('');
  };

  const handleSwapLanguages = () => {
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    if (translatedText) {
      setInputText(translatedText);
      setTranslatedText('');
    }
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setIsTranslating(true);
    setTranslatedText('');
    setCulturalNotes('');

    try {
      const result = await translateAI({
        text: inputText,
        sourceLang,
        targetLang,
        contentType,
      });

      setTranslatedText(result.translation);
      setCulturalNotes(result.notes);
    } catch (err: any) {
      alert('Translation Error: ' + (err?.message || 'Processing failed'));
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSaveTranslation = () => {
    if (!translatedText) return;
    addTranslation({
      title: `${contentType.toUpperCase()} Translation: ${inputText.slice(0, 40)}...`,
      sourceLang,
      targetLang,
      originalText: inputText,
      translatedText,
      notes: culturalNotes,
      contentType,
      createdByUserId: currentUser.id,
      createdByName: currentUser.name,
    });
    alert('Translation saved to Newsroom Language Archives!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white">
              <Languages className="h-4 w-4" />
            </span>
            <h1 className="font-serif text-2xl font-bold text-slate-900">
              Multilingual Translation Studio
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Side-by-side journalistic translation between English, isiNdebele (Northern Ndebele), and Shona (chiShona).
          </p>
        </div>

        {/* Quick Sample Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Presets:
          </span>
          {sampleTranslationPrompts.map((p) => (
            <button
              key={p.title}
              onClick={() => handleApplySample(p)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-teal-500 hover:text-teal-700 transition"
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* Human Review Disclaimer */}
      <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4 border border-amber-200/70 text-xs text-amber-950">
        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Human Language Review Recommendation</p>
          <p className="mt-0.5 text-amber-800 leading-relaxed">
            Machine translation provides a fast baseline, but cultural idioms, civic acronyms, and regional dialect differences in Zimbabwe (such as Bulawayo isiNdebele versus Zulu, or Karanga/Zezuru nuances in Shona) should be cross-checked by a language editor before print distribution or broadcast transmission.
          </p>
        </div>
      </div>

      {/* Control Bar: Language Selectors, Swap, Content Type */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Source Lang */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">From:</span>
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 focus:outline-hidden"
            >
              <option value="en">English</option>
              <option value="nd">isiNdebele (Northern Ndebele)</option>
              <option value="sn">Shona (chiShona)</option>
            </select>
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwapLanguages}
            className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 hover:text-teal-600"
            title="Swap Languages"
          >
            <ArrowRightLeft className="h-4 w-4" />
          </button>

          {/* Target Lang */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">To:</span>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-teal-800 focus:outline-hidden"
            >
              <option value="nd">isiNdebele (Northern Ndebele, Bulawayo)</option>
              <option value="sn">Shona (chiShona)</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* Content Type */}
          <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
            <span className="text-xs font-semibold text-slate-500">Format:</span>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as any)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden capitalize"
            >
              <option value="article">Full Article</option>
              <option value="headline">News Headline</option>
              <option value="social">Social Media Update</option>
              <option value="broadcast">Broadcast Radio Script</option>
            </select>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleTranslate}
          disabled={isTranslating}
          className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 disabled:opacity-50 transition"
        >
          <Sparkles className="h-4 w-4" />
          <span>{isTranslating ? 'Translating with Gemini...' : 'Translate Content'}</span>
        </button>
      </div>

      {/* Side-by-Side Translation Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Column */}
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                Source Content ({sourceLang === 'en' ? 'English' : sourceLang === 'nd' ? 'isiNdebele' : 'Shona'})
              </span>
            </div>
            <button
              onClick={() => setInputText('')}
              className="text-[11px] text-slate-400 hover:text-slate-700"
            >
              Clear
            </button>
          </div>

          <textarea
            rows={14}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter or paste text to translate..."
            className="mt-4 flex-1 w-full border-none p-0 text-xs text-slate-800 leading-relaxed focus:outline-hidden focus:ring-0 font-sans resize-y"
          />
        </div>

        {/* Translation Output Column */}
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                Translation ({targetLang === 'nd' ? 'isiNdebele' : targetLang === 'sn' ? 'Shona' : 'English'})
              </span>
              {translatedText && (
                <span className="rounded bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                  Ready
                </span>
              )}
            </div>

            {translatedText && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(translatedText);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  title="Copy Translation"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleSaveTranslation}
                  className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-900"
                >
                  Save
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 flex-1 flex flex-col justify-between">
            {isTranslating ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
                <p className="text-xs font-semibold text-slate-700">
                  Translating into {targetLang === 'nd' ? 'isiNdebele' : 'Shona'}...
                </p>
                <p className="text-[11px] text-slate-400">
                  Preserving journalistic register and Zimbabwean dialect nuance
                </p>
              </div>
            ) : !translatedText ? (
              <div className="flex flex-col items-center justify-center py-24 text-center text-slate-400">
                <Languages className="h-10 w-10 text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-600">Translation will appear here</p>
                <p className="text-[11px] max-w-xs mt-1">
                  Enter source material and click &quot;Translate Content&quot; above.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <textarea
                  rows={10}
                  value={translatedText}
                  onChange={(e) => setTranslatedText(e.target.value)}
                  className="w-full border-none p-0 text-xs text-slate-900 leading-relaxed focus:outline-hidden focus:ring-0 font-sans resize-y"
                />

                {culturalNotes && (
                  <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 text-xs space-y-1">
                    <p className="font-bold text-slate-800 text-[11px]">
                      Vernacular & Lexical Notes:
                    </p>
                    <p className="text-slate-600 text-[11px] leading-relaxed italic">
                      {culturalNotes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
