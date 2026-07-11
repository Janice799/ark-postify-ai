import { SYSTEM_PROMPTS } from './prompts';

let loadedLlama = null;
let loadedModel = null;
let loadedModelPath = null;
let loadedSession = null;

async function getLocalModelAndSession(modelPath) {
  if (loadedModel && loadedModelPath === modelPath) {
    return loadedSession;
  }
  
  console.log(`[Local LLM] Loading GGUF model: ${modelPath}`);
  const { getLlama, LlamaChatSession } = await import('node-llama-cpp');
  
  if (!loadedLlama) {
    loadedLlama = await getLlama();
  }
  
  loadedModel = await loadedLlama.loadModel({
    modelPath: modelPath
  });
  
  const context = await loadedModel.createContext();
  loadedSession = new LlamaChatSession({
    contextSequence: context.getSequence()
  });
  loadedModelPath = modelPath;
  
  return loadedSession;
}

const getPersonaInstruction = (persona) => {
  if (!persona) return '';
  return `Persona / Brand Voice:\n${persona}\n\n`;
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
  const session = await getLocalModelAndSession(localModelPath);
  
  const composerPrompt = SYSTEM_PROMPTS.getComposerPrompt(
    targetSNS,
    persona ? `Persona / Brand Voice:\n${persona}\n` : ''
  );
  
  const formattedPrompt = `You are a world-class, top-tier bilingual social media copywriter.
${composerPrompt}

${personaInstruction}Original Korean Content:
"${userPrompt}"

Write the final post in English. Output ONLY the post body text. Do NOT include any introductory sentences, explanations, analysis, or headings:`;
  const responseText = await session.prompt(formattedPrompt);
  return responseText;
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
  const session = await getLocalModelAndSession(localModelPath);

  const commitSummary = commits.map(c => `- ${c.message} (${c.hash ? c.hash.substring(0, 7) : 'no hash'})`).join('\n');
  const prompt = `Repository: ${repoName || 'unnamed-repo'}\n\nCommits:\n${commitSummary}\n\n`;

  const formattedPrompt = `${SYSTEM_PROMPTS.COMMIT_CRAFT}\n\n${personaInstruction}${prompt}`;
  const responseText = await session.prompt(formattedPrompt);
  return responseText;
};
