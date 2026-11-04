import React, { useState } from 'react';
import {
  Sparkles,
  FileText,
  Type,
  HelpCircle,
  Share2,
  Search,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  Send,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { useNewsroom } from '../contexts/NewsroomContext';

interface AIAssistantPageProps {
  onOpenArticleEditorWithContent?: (title: string, content: string, category: string) => void;
}

export const AIAssistantPage: React.FC<AIAssistantPageProps> = ({
  onOpenArticleEditorWithContent,
}) => {
  const { currentOrg, generateAI, createStory, currentUser } = useNewsroom();

  const [activeTool, setActiveTool] = useState<
    'article' | 'headlines' | 'interview' | 'summarize' | 'social' | 'research'
  >('article');

  // Input States
  const [prompt, setPrompt] = useState('');
  const [contextText, setContextText] = useState('');
  const [tone, setTone] = useState('Professional news reporting');
  const [articleTask, setArticleTask] = useState<'draft' | 'outline' | 'grammar' | 'missing_facts'>('draft');

  // Interview Generator specific
  const [interviewSubject, setInterviewSubject] = useState('Town Clerk, Bulawayo City Council');
  const [interviewTopic, setInterviewTopic] = useState('Luveve-Egodini Water Distribution Upgrades & Capital Budget');
  const [interviewPurpose, setInterviewPurpose] = useState('Hold municipal authorities accountable for non-revenue water losses and billing discrepancies.');
  const [interviewAudience, setInterviewAudience] = useState('Bulawayo residents, ratepayers, and civic stakeholders');

  // Social Repurposing specific
  const [socialPlatforms, setSocialPlatforms] = useState<string[]>([
    'X (Twitter)',
    'Facebook',
    'WhatsApp News Channel',
    'LinkedIn',
    'Broadcast 30s Script',
  ]);

  // Output States
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Quick Demo Presets
  const demoPresets = [
    {
      label: 'Bulawayo SEZ Factory Investment',
      topic: 'Umvumila Special Economic Zone progress in Bulawayo',
      context: 'Eight manufacturing consortia signed preliminary MOUs with ZIDA in late 2025. Earthworks have commenced on two textile units, with total projected foreign direct investment valued at US$34 million. Local engineering firms in Belmont are supplying structural steel.',
      subject: 'Regional Director, Zimbabwe Investment and Development Agency (ZIDA)',
    },
    {
      label: 'NUST Climate AI Agriculture Pilot',
      topic: 'National University of Science & Technology AI crop moisture prediction',
      context: 'NUST computer science researchers deployed IoT soil probes and satellite canopy analytics across 40 smallholder plots in Umguza and Matobo. The algorithm alerts farmers 30 days before acute moisture stress to initiate targeted drip irrigation.',
      subject: 'Dr. Khanyisile Moyo, Lead AI Researcher at NUST',
    },
    {
      label: 'RBZ Structured Currency ZWG Stability',
      topic: 'Evaluating ZWG electronic payment adoption among Bulawayo informal traders',
      context: 'A survey across Renkini Bus Terminus and flea markets reveals 68% of stallholders now accept electronic swipe payments, up from 34%. However, wholesale restocking in USD remains a key challenge for small retailers.',
      subject: 'Governor / Monetary Policy Committee Representative, Reserve Bank of Zimbabwe',
    },
  ];

  const handleApplyPreset = (preset: (typeof demoPresets)[0]) => {
    setPrompt(preset.topic);
    setContextText(preset.context);
    setInterviewSubject(preset.subject);
    setInterviewTopic(preset.topic);
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setOutput('');
    setCopied(false);

    try {
      let finalPrompt = '';

      if (activeTool === 'article') {
        finalPrompt = `Execute the journalistic task: "${articleTask.toUpperCase()}".
Topic: ${prompt || 'Reporting assignment for Zimbabwean media'}
Instructions:
- Adhere to Zimbabwean Media Commission journalistic ethics.
- Tone: ${tone}.
- Under no circumstances invent quotes, statistics, or sources.
- If information is missing or unverified, explicitly add a "[VERIFICATION REQUIRED / MISSING FACTS]" section.`;
      } else if (activeTool === 'headlines') {
        finalPrompt = `Generate 5 distinct journalistic headlines for this story:
1. Lead Newspaper Headline (Authoritative, punchy)
2. Short / Mobile App Headline (Under 8 words)
3. SEO Headline (Optimized for search engines with location tags)
4. Social Media Headline (Engaging, curiosity-piquing)
5. Radio Bulletin Headline (Written for broadcast delivery)

Story Content:
${contextText || prompt}`;
      } else if (activeTool === 'interview') {
        finalPrompt = `You are a senior investigative journalist preparing an in-depth interview.
Interview Subject: ${interviewSubject}
Topic: ${interviewTopic}
Purpose: ${interviewPurpose}
Target Audience: ${interviewAudience}

Generate a comprehensive interview roadmap:
1. Rapport-Building Opening Questions (Establish foundational facts)
2. Accountability & Investigative Probes (Probe specific performance metrics, budgets, and public commitments)
3. Tough Follow-up Questions (Anticipate defensive answers and press for verification)
4. Public Interest / Community Impact Questions`;
      } else if (activeTool === 'summarize') {
        finalPrompt = `Summarise the provided journalistic material.
Output should include:
- Executive 2-sentence nut graph
- Key findings and confirmed facts (bullet points)
- Important dates and named entities (individuals and institutions)
- Angles and leads requiring independent follow-up

Content to summarize:
${contextText || prompt}`;
      } else if (activeTool === 'social') {
        finalPrompt = `Repurpose the following news story into tailored social media dispatches for Zimbabwean audiences:
1. X (Twitter): 1-2 concise tweets with relevant hashtags (#Bulawayo #Zimbabwe #Economy).
2. Facebook: Engaging 3-paragraph news post with discussion question for followers.
3. WhatsApp News Channel: Clean bulleted broadcast update formatted with bold text and emojis for mobile reading.
4. LinkedIn: Business-oriented news analysis highlighting policy and economic takeaways.
5. 30-Second Radio / Video Script: Voiceover script with sound cue markers.

Story Content:
${contextText || prompt}`;
      } else if (activeTool === 'research') {
        finalPrompt = `You are an investigative research analyst for SmartNewsroom Zimbabwe.
Analyze the following document/source notes:
1. Executive Summary of claims made.
2. Timeline of events extracted from the material.
3. Key individuals, public officials, and commercial entities identified.
4. Potential red flags, inconsistencies, or claims requiring corroborating evidence.
5. Specific public records to check (e.g., PRAZ tenders, deeds registry, corporate filings).

Document Material:
${contextText || prompt}`;
      }

      const result = await generateAI({
        prompt: finalPrompt,
        context: contextText,
        tone,
        taskType: `SmartNewsroom AI - ${activeTool}`,
      });

      setOutput(result);
    } catch (err: any) {
      setOutput(`Error generating response: ${err?.message || 'Server connection failed'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePitchFromOutput = () => {
    if (!output.trim()) return;
    const workingTitle = prompt.slice(0, 80) || `${activeTool.toUpperCase()} AI Draft`;
    createStory({
      title: workingTitle,
      summary: output.slice(0, 200) + '...',
      content: output,
      category: 'News',
      departmentId: 'dept_news',
      authorId: currentUser.id,
      authorName: currentUser.name,
      format: 'news_article',
      priority: 'normal',
      status: 'proposed',
      deadline: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
      tags: ['AI Generated', 'SmartNewsroom', 'Draft'],
    });
    alert(`Story pitch "${workingTitle}" saved to Story Management!`);
  };

  const handleOpenInEditor = () => {
    if (onOpenArticleEditorWithContent) {
      const workingTitle = prompt.slice(0, 80) || 'AI Generated News Article';
      onOpenArticleEditorWithContent(workingTitle, output, 'News');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            <h1 className="font-serif text-2xl font-bold text-slate-900">
              SmartNewsroom AI Assistant
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Powered by Google Gemini 3.8. Fact-anchored editorial intelligence for Zimbabwean journalism.
          </p>
        </div>

        {/* Demo Presets Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Sample Beats:
          </span>
          {demoPresets.map((p) => (
            <button
              key={p.label}
              onClick={() => handleApplyPreset(p)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-teal-500 hover:text-teal-700 transition"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Flagship Tool Tabs */}
      <div className="flex overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xs">
        {[
          { id: 'article', label: 'AI Article Assistant', icon: FileText },
          { id: 'headlines', label: 'Headline Generator', icon: Type },
          { id: 'interview', label: 'Interview Questions', icon: HelpCircle },
          { id: 'summarize', label: 'Article Summariser', icon: BookOpen },
          { id: 'social', label: 'Social Repurposer', icon: Share2 },
          { id: 'research', label: 'Research & Documents', icon: Search },
        ].map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => {
                setActiveTool(tool.id as any);
                setOutput('');
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition ${
                isActive
                  ? 'bg-[#14243A] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
              <span>{tool.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Two-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Input Panel */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-serif text-sm font-bold text-slate-900">
              Tool Parameters & Inputs
            </h2>
            <button
              onClick={() => {
                setPrompt('');
                setContextText('');
                setOutput('');
              }}
              className="text-[11px] text-slate-400 hover:text-slate-700 flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Clear</span>
            </button>
          </div>

          {/* Contextual form fields based on activeTool */}
          {activeTool === 'article' && (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-700">Specific Article Task</label>
                <div className="mt-1.5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-medium">
                  {[
                    { id: 'draft', label: 'Draft News Article' },
                    { id: 'outline', label: 'Article Outline' },
                    { id: 'grammar', label: 'Improve Grammar' },
                    { id: 'missing_facts', label: 'Check Missing Facts' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setArticleTask(t.id as any)}
                      className={`rounded-lg border px-2 py-1.5 text-center transition ${
                        articleTask === t.id
                          ? 'border-teal-600 bg-teal-50 text-teal-800 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Journalistic Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden"
                >
                  <option value="Professional news reporting">Professional news reporting (Neutral & authoritative)</option>
                  <option value="Investigative journalism">Investigative journalism (Skeptical & rigorous)</option>
                  <option value="Feature writing">Feature writing (Narrative & human interest)</option>
                  <option value="Broadcast news">Broadcast news (Short, direct for radio/TV ear)</option>
                  <option value="Community reporting">Community reporting (Grassroots civic clarity)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Story Topic / Core Angle *</label>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. NUST AI Agriculture Lab drought warning system in Umguza..."
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Reporter Field Notes / Raw Background Material
                </label>
                <textarea
                  rows={6}
                  value={contextText}
                  onChange={(e) => setContextText(e.target.value)}
                  placeholder="Paste quotes, bullet points, official statistics or interview excerpts..."
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden"
                />
              </div>
            </>
          )}

          {activeTool === 'interview' && (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-700">Interview Subject & Title</label>
                <input
                  type="text"
                  value={interviewSubject}
                  onChange={(e) => setInterviewSubject(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Interview Topic</label>
                <input
                  type="text"
                  value={interviewTopic}
                  onChange={(e) => setInterviewTopic(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Journalistic Purpose / Investigation Focus</label>
                <textarea
                  rows={3}
                  value={interviewPurpose}
                  onChange={(e) => setInterviewPurpose(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Target Audience</label>
                <input
                  type="text"
                  value={interviewAudience}
                  onChange={(e) => setInterviewAudience(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden"
                />
              </div>
            </>
          )}

          {(activeTool === 'headlines' || activeTool === 'summarize' || activeTool === 'social' || activeTool === 'research') && (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-700">
                  {activeTool === 'headlines' ? 'Article Text or Draft' : activeTool === 'summarize' ? 'Article or Document Text' : activeTool === 'social' ? 'Story Draft for Social Repurposing' : 'Research Notes or Government Document Text'} *
                </label>
                <textarea
                  rows={10}
                  value={contextText || prompt}
                  onChange={(e) => {
                    setContextText(e.target.value);
                    setPrompt(e.target.value);
                  }}
                  placeholder="Paste article text or source material here..."
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-hidden font-sans"
                />
              </div>

              {activeTool === 'social' && (
                <div className="rounded-lg bg-slate-50 p-3 text-[11px] text-slate-600 border border-slate-100">
                  Generates optimized formats for X (Twitter), Facebook news feeds, WhatsApp News Channels (Bulawayo community preferred), LinkedIn, and a 30-second broadcast voiceover script.
                </div>
              )}
            </>
          )}

          {/* Ethics Notice */}
          <div className="flex items-start gap-2 rounded-xl bg-teal-50 p-3 text-[11px] text-teal-900 border border-teal-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-teal-600 mt-0.5" />
            <span>
              <strong>Editorial Verification Safeguard:</strong> SmartNewsroom AI will never fabricate sources, uncorroborated quotes, or stats. Unverified claims will be flagged for independent reporting checks.
            </span>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 disabled:opacity-50 transition"
          >
            <Sparkles className="h-4 w-4" />
            <span>{isLoading ? 'Processing with Gemini 3.8...' : `Generate with AI (${activeTool.toUpperCase()})`}</span>
          </button>
        </div>

        {/* Right Output Panel */}
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-sm font-bold text-slate-900">AI Assistant Generation</h2>
              {output && (
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  Ready
                </span>
              )}
            </div>

            {output && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(output);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleCreatePitchFromOutput}
                  className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-medium text-white hover:bg-slate-900"
                >
                  Save as Pitch
                </button>
                {onOpenArticleEditorWithContent && (
                  <button
                    onClick={handleOpenInEditor}
                    className="rounded-lg bg-teal-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-teal-700"
                  >
                    Send to Editor
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
                <p className="text-xs font-semibold text-slate-700">
                  Gemini 3.8 is processing editorial request...
                </p>
                <p className="text-[11px] text-slate-400">
                  Structuring facts, formatting register, and checking verification standards
                </p>
              </div>
            ) : !output ? (
              <div className="flex flex-col items-center justify-center py-24 text-center text-slate-400">
                <Sparkles className="h-10 w-10 text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-600">AI output will appear here</p>
                <p className="text-[11px] max-w-sm mt-1">
                  Choose an assistant tool, provide context or pick a Zimbabwean beat preset, then click generate.
                </p>
              </div>
            ) : (
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 whitespace-pre-wrap font-sans text-xs text-slate-800 leading-relaxed max-h-[560px] overflow-y-auto">
                {output}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
