import os from 'os';
import { SYSTEM_PROMPTS } from './prompts';

let loadedLlama = null;
let loadedModel = null;
let loadedModelPath = null;

async function getLocalModel(modelPath, forceCpu = false) {
  if (loadedModel && loadedModelPath === modelPath && !forceCpu) {
    return loadedModel;
  }

  console.log(`[Local LLM] Loading GGUF model: ${modelPath} (CPU Mode: ${forceCpu})`);
  const { getLlama } = await import('node-llama-cpp');

  if (!loadedLlama) {
    loadedLlama = await getLlama();
  }

  // Unload previous model if switching
  if (loadedModel) {
    try {
      if (typeof loadedModel.dispose === 'function') await loadedModel.dispose();
    } catch (e) {}
    loadedModel = null;
  }

  loadedModel = await loadedLlama.loadModel({
    modelPath: modelPath,
    gpu: forceCpu ? false : 'auto',
  });
  loadedModelPath = modelPath;

  return loadedModel;
}

export async function unloadLocalModel() {
  if (loadedModel) {
    try {
      if (typeof loadedModel.dispose === 'function') {
        await loadedModel.dispose();
      }
    } catch (e) {
      console.warn('Failed to dispose loadedModel:', e);
    }
  }
  loadedModel = null;
  loadedModelPath = null;
  console.log('[Local LLM] Model explicitly unloaded from memory.');
}

const getPersonaInstruction = (persona) => {
  if (!persona) return '';
  return `Persona / Brand Voice:\n${persona}\n\n`;
};

const getSafeThreads = () => {
  const cpus = os.cpus()?.length || 4;
  return Math.max(2, Math.floor(cpus / 2));
};

export const runLocalAiPipeline = async (userPrompt, config) => {
  const { targetSNS, persona, localModelPath } = config;
  const personaInstruction = getPersonaInstruction(persona);

  if (!localModelPath) {
    throw new Error('Local GGUF model path is required.');
  }
  const fs = await import('fs');
  if (!fs.existsSync(localModelPath)) {
    throw new Error(`Model file not found at: ${localModelPath}`);
  }

  console.log(`[Local LLM] Running local inference pipeline for SNS: ${targetSNS}...`);
  let model = await getLocalModel(localModelPath);
  const { LlamaChatSession } = await import('node-llama-cpp');
  let context = null;

  try {
    try {
      context = await model.createContext({
        contextSize: 2048,
        threads: getSafeThreads(),
      });
    } catch (vramErr) {
      console.warn('[Local LLM] VRAM context creation failed, falling back to CPU mode:', vramErr.message);
      model = await getLocalModel(localModelPath, true);
      context = await model.createContext({
        contextSize: 1024,
        threads: getSafeThreads(),
      });
    }

    const session = new LlamaChatSession({
      contextSequence: context.getSequence()
    });

    const formattedPrompt = `You are an elite bilingual social media copywriter.
Write a highly engaging, natural, and professional social media post in English for ${targetSNS.toUpperCase()} based on the following Korean topic/content.

Rules:
- Output ONLY the final post text. Do NOT include any introductory phrases, explanations, analysis, metadata, or titles.
- Start with a strong hook to grab attention.
- Keep it punchy, engaging, and value-packed.
${targetSNS === 'x' ? '- Must be strictly under 280 characters. Do NOT use hashtags (#).' : ''}
${targetSNS === 'linkedin' ? '- Use professional formatting and relevant hashtags at the bottom.' : ''}
${targetSNS === 'instagram' ? '- Use appropriate emojis and hashtags at the bottom.' : ''}
${personaInstruction ? `- Style constraint: ${personaInstruction}` : ''}

Original Korean Content:
"${userPrompt}"

Final English Post:`;

    const responseText = await session.prompt(formattedPrompt);
    return responseText;
  } finally {
    if (context) {
      try {
        await context.dispose();
      } catch (e) {
        console.warn('[Local LLM] Failed to dispose context:', e);
      }
    }
  }
};

export const runLocalCommitCraftPipeline = async (commits, config) => {
  const { repoName, persona, localModelPath } = config;
  const personaInstruction = getPersonaInstruction(persona);

  if (!localModelPath) {
    throw new Error('Local GGUF model path is required.');
  }
  const fs = await import('fs');
  if (!fs.existsSync(localModelPath)) {
    throw new Error(`Model file not found at: ${localModelPath}`);
  }

  console.log(`[Local LLM] Running local inference pipeline for CommitCraft (Repo: ${repoName})...`);
  let model = await getLocalModel(localModelPath);
  const { LlamaChatSession } = await import('node-llama-cpp');
  let context = null;

  try {
    try {
      context = await model.createContext({
        contextSize: 2048,
        threads: getSafeThreads(),
      });
    } catch (vramErr) {
      console.warn('[Local LLM] VRAM context creation failed, falling back to CPU mode:', vramErr.message);
      model = await getLocalModel(localModelPath, true);
      context = await model.createContext({
        contextSize: 1024,
        threads: getSafeThreads(),
      });
    }

    const session = new LlamaChatSession({
      contextSequence: context.getSequence()
    });

    const commitSummary = commits.map(c => `- ${c.message} (${c.hash ? c.hash.substring(0, 7) : 'no hash'})`).join('\n');
    const prompt = `Repository: ${repoName || 'unnamed-repo'}\n\nCommits:\n${commitSummary}\n\n`;

    const formattedPrompt = `${SYSTEM_PROMPTS.COMMIT_CRAFT}\n\n${personaInstruction}${prompt}`;
    const responseText = await session.prompt(formattedPrompt);
    return responseText;
  } finally {
    if (context) {
      try {
        await context.dispose();
      } catch (e) {
        console.warn('[Local LLM] Failed to dispose context:', e);
      }
    }
  }
};
