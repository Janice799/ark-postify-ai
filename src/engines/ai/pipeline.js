import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { SYSTEM_PROMPTS } from './prompts';

const OPENAI_MODEL = 'gpt-4o-mini';
const GEMINI_MODEL = 'gemini-1.5-flash';

const getPersonaInstruction = (persona) => {
  if (!persona) return '';
  return `Persona / Brand Voice:\n${persona}\n\n`;
};

export const getModel = (provider, apiKey, geminiKey) => {
  if (provider === 'gemini') {
    const resolvedKey = geminiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!resolvedKey) {
      throw new Error('Gemini API key is required.');
    }

    const google = createGoogleGenerativeAI({
      apiKey: resolvedKey,
    });
    return google(GEMINI_MODEL);
  }

  const resolvedKey = apiKey || process.env.OPENAI_API_KEY;
  if (!resolvedKey) {
    throw new Error('OpenAI API key is required.');
  }

  const customOpenAI = createOpenAI({
    apiKey: resolvedKey,
  });
  return customOpenAI(OPENAI_MODEL);
};

export const runAiPipeline = async (userPrompt, config) => {
  const { provider, targetSNS, apiKey, geminiKey, persona } = config;
  const model = getModel(provider, apiKey, geminiKey);
  const personaInstruction = getPersonaInstruction(persona);

  // Node 1: Analyzer (Extract Intent & Context)
  const { text: analysis } = await generateText({
    model,
    system: SYSTEM_PROMPTS.ANALYZER,
    prompt: `${personaInstruction}${userPrompt}`,
  });

  // Node 2: Hook Generator (Brainstorm Angles)
  const { text: hooks } = await generateText({
    model,
    system: SYSTEM_PROMPTS.HOOK_GENERATOR,
    prompt: analysis,
  });

  // Node 3: Composer (Final Assembly)
  const { text } = await generateText({
    model,
    system: SYSTEM_PROMPTS.getComposerPrompt(
      targetSNS,
      persona ? `Persona / Brand Voice:\n${persona}\n` : ''
    ),
    prompt: `${personaInstruction}[Analysis]\n${analysis}\n\n[Hooks]\n${hooks}\n\n[Original Text]\n${userPrompt}\n\nWrite the final post:`
  });

  return text;
};

export const runTranslationPipeline = async (userPrompt, config) => {
  if (!userPrompt) return '';
  
  // Split by newlines to preserve paragraphs and avoid 414 URL too long errors for long posts
  const paragraphs = userPrompt.split('\n');
  
  const translatedParagraphs = await Promise.all(
    paragraphs.map(async (paragraph) => {
      if (!paragraph.trim()) return '';
      
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ko&tl=en&dt=t&q=${encodeURIComponent(paragraph)}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Google Translate API HTTP error: ${response.status}`);
      }
      
      const data = await response.json();
      if (!data || !data[0]) {
        throw new Error('Failed to parse Google Translate response.');
      }
      
      return data[0].map(item => item[0]).join('');
    })
  );
  
  return translatedParagraphs.join('\n');
};

export const translateEnglishToKorean = async (englishText) => {
  if (!englishText) return '';
  const paragraphs = englishText.split('\n');
  const translatedParagraphs = await Promise.all(
    paragraphs.map(async (paragraph) => {
      if (!paragraph.trim()) return '';
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodeURIComponent(paragraph)}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Google Translate API HTTP error: ${response.status}`);
      }
      const data = await response.json();
      if (!data || !data[0]) {
        throw new Error('Failed to parse Google Translate response.');
      }
      return data[0].map(item => item[0]).join('');
    })
  );
  return translatedParagraphs.join('\n');
};

export const runCommitCraftPipeline = async (commits, config) => {
  const { provider, apiKey, geminiKey, repoName, persona } = config;
  const model = getModel(provider, apiKey, geminiKey);
  const personaInstruction = getPersonaInstruction(persona);

  const commitSummary = commits.map(c => `- ${c.message} (${c.hash ? c.hash.substring(0, 7) : 'no hash'})`).join('\n');
  const prompt = `Repository: ${repoName || 'unnamed-repo'}\n\nCommits:\n${commitSummary}\n\n`;

  const { text } = await generateText({
    model,
    system: SYSTEM_PROMPTS.COMMIT_CRAFT,
    prompt: `${personaInstruction}${prompt}`,
  });

  return text;
};
