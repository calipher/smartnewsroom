import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Centralized Gemini Model Configuration
const AI_CONFIG = {
  defaultTextModel: 'gemini-3.8-flash',
  transcribeModel: 'gemini-3.5-transcribe',
  liveModel: 'gemini-3.8-flash',
};

// Initialize GoogleGenAI SDK server-side with telemetry header
const getGenAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Health & Config endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: 'ok',
    appName: 'SmartNewsroom Zimbabwe',
    initiative: 'Zimbabwe Media Digital Transformation Programme (ZMDTP)',
    pilotCity: 'Bulawayo',
    model: AI_CONFIG.defaultTextModel,
    hasApiKey: hasKey,
    timezone: 'Africa/Harare',
    timestamp: new Date().toISOString(),
  });
});

// Dedicated AI Assistant endpoint
app.post('/api/gemini/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt, systemInstruction, tone, taskType, context, temperature } = req.body;

    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const ai = getGenAIClient();
    if (!ai) {
      // Fallback response with notice if key is pending
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check Settings > Secrets.',
        fallbackNotice: true,
      });
      return;
    }

    const journalismSystemPrompt = `You are the AI Assistant for SMARTNEWSROOM ZIMBABWE, a professional editorial platform developed under the Zimbabwe Media Digital Transformation Programme (ZMDTP) piloted in Bulawayo, Zimbabwe.
Tone requested: ${tone || 'Professional news reporting'}.
Task: ${taskType || 'Editorial assistance'}.

CRITICAL JOURNALISTIC STANDARDS:
1. Strict adherence to facts: NEVER invent quotes, sources, statistics, events, or unverified claims.
2. If facts or key figures are missing or unverified, explicitly flag them in a dedicated "[VERIFICATION REQUIRED / MISSING FACTS]" section.
3. Be culturally and contextually accurate for Zimbabwe: recognize Zimbabwean institutions (e.g., Parliament of Zimbabwe, Reserve Bank of Zimbabwe, ZETDC, Bulawayo City Council, NUST, UZ, ZBC, ZMC), Zimbabwean currency (ZWG, USD), provinces (Bulawayo, Harare, Matabeleland North/South, Midlands, Manicaland, etc.), and multilingual context (English, isiNdebele, Shona).
4. For broadcast news, write for the ear (short sentences, phonetic cues if helpful).
5. For investigative reporting, focus on documented chronologies, audit trails, and corroborating sources.
${systemInstruction ? `\nAdditional editorial guidelines:\n${systemInstruction}` : ''}`;

    const contents = context
      ? `CONTEXT / SOURCE MATERIAL:\n${context}\n\nUSER REQUEST / PROMPT:\n${prompt}`
      : prompt;

    const response = await ai.models.generateContent({
      model: AI_CONFIG.defaultTextModel,
      contents,
      config: {
        systemInstruction: journalismSystemPrompt,
      },
    });

    const outputText = response.text || '';
    res.json({ text: outputText, model: AI_CONFIG.defaultTextModel });
  } catch (error: any) {
    console.error('Gemini generate error:', error);
    res.status(500).json({
      error: error?.message || 'Error generating editorial content from Gemini',
    });
  }
});

// Transcription Studio API endpoint
app.post('/api/gemini/transcribe', async (req: Request, res: Response): Promise<void> => {
  try {
    const { audioBase64, mimeType = 'audio/mp3', language = 'en', interviewTitle, notes } = req.body;

    const ai = getGenAIClient();
    if (!ai) {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check Settings > Secrets.',
      });
      return;
    }

    const languageLabel =
      language === 'nd' ? 'isiNdebele' : language === 'sn' ? 'Shona' : 'English (with potential Zimbabwean accents/vernacular)';

    const transcriptionPrompt = `You are the specialized audio transcription engine for SmartNewsroom Zimbabwe.
Interview Title: "${interviewTitle || 'Field Interview'}"
Primary spoken language: ${languageLabel}
Notes/Context: ${notes || 'Journalism interview / news field recording'}

INSTRUCTIONS:
1. Transcribe the audio accurately into standard broadcast format with timestamps and clear speaker labels (e.g. "[00:00] Journalist:", "[00:15] Respondent:").
2. Correctly capture Zimbabwean names, locations (e.g., Makokoba, Mzilikazi, Bulawayo CBD, Cowdray Park, Harare, Hwange), and local phrases in ${languageLabel}.
3. If any section is unclear or noisy, tag it with "[inaudible 00:00]".
4. Append an "Editorial Briefing Summary" at the bottom highlighting key quotes, verified figures, and suggested story angles for the reporter.
5. Note that human language review is always recommended before final publishing.`;

    if (audioBase64) {
      // Direct multimodal transcription using @google/genai
      const audioPart = {
        inlineData: {
          mimeType,
          data: audioBase64,
        },
      };

      const response = await ai.models.generateContent({
        model: AI_CONFIG.defaultTextModel, // 3.8 flash supports rich audio inputs
        contents: { parts: [audioPart, { text: transcriptionPrompt }] },
      });

      res.json({
        transcript: response.text,
        language: languageLabel,
        title: interviewTitle,
      });
    } else {
      // If client sent audio notes/synthetic interview recording description
      const response = await ai.models.generateContent({
        model: AI_CONFIG.defaultTextModel,
        contents: `${transcriptionPrompt}\n\nAudio sample notes & field context provided: ${notes || 'Interview with Zimbabwean SME entrepreneur regarding recent digital payments and local economic opportunities in Bulawayo.'}`,
      });

      res.json({
        transcript: response.text,
        language: languageLabel,
        title: interviewTitle,
      });
    }
  } catch (error: any) {
    console.error('Gemini transcription error:', error);
    res.status(500).json({
      error: error?.message || 'Error processing transcription',
    });
  }
});

// Translation Studio API endpoint
app.post('/api/gemini/translate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, sourceLang = 'en', targetLang = 'nd', contentType = 'article' } = req.body;

    if (!text) {
      res.status(400).json({ error: 'Text is required for translation' });
      return;
    }

    const ai = getGenAIClient();
    if (!ai) {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check Settings > Secrets.',
      });
      return;
    }

    const langMap: Record<string, string> = {
      en: 'English',
      nd: 'isiNdebele (Northern Ndebele, official Zimbabwean dialect used in Bulawayo & Matabeleland)',
      sn: 'Shona (chiShona, standard Zimbabwean journalistic register)',
      kal: 'Kalanga',
      ton: 'Tonga',
    };

    const sourceName = langMap[sourceLang] || sourceLang;
    const targetName = langMap[targetLang] || targetLang;

    const translatePrompt = `You are the lead language and cultural translator for SMARTNEWSROOM ZIMBABWE.
Translate the following ${contentType} from ${sourceName} into ${targetName}.

RULES:
1. Maintain high journalistic register appropriate for ${contentType} (radio bulletin, newspaper article, headline, or social update).
2. Retain official acronyms (e.g., ZWG, ZBC, ZMC, RBZ, CSZ, NUST) with proper context if translated.
3. Respect culturally authentic syntax and respect honorifics common in Zimbabwe.
4. Output your response formatted as:
---TRANSLATION---
[Your full translation here]
---VOCABULARY & CULTURAL NOTES---
[Brief notes on key terms adapted for local clarity, dialect differences, or recommended human review points]`;

    const response = await ai.models.generateContent({
      model: AI_CONFIG.defaultTextModel,
      contents: `${translatePrompt}\n\nCONTENT TO TRANSLATE:\n${text}`,
    });

    const rawOutput = response.text || '';
    const parts = rawOutput.split('---VOCABULARY & CULTURAL NOTES---');
    const translatedText = parts[0]?.replace('---TRANSLATION---', '').trim() || rawOutput;
    const notes = parts[1]?.trim() || 'Please verify local colloquialisms with a native language editor prior to broadcast.';

    res.json({
      translation: translatedText,
      notes,
      sourceLang,
      targetLang,
      model: AI_CONFIG.defaultTextModel,
    });
  } catch (error: any) {
    console.error('Gemini translate error:', error);
    res.status(500).json({
      error: error?.message || 'Error processing translation',
    });
  }
});

// Setup dev server with Vite middlewares OR serve static bundle in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SmartNewsroom Zimbabwe] Server running on http://0.0.0.0:${PORT} in ${isProduction ? 'production' : 'development'} mode`);
  });
}

startServer();
