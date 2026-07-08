import { runAiPipeline, runTranslationPipeline } from '../../../engines/ai/pipeline';

export const runtime = 'edge';

const ALLOWED_ACTIONS = new Set(['generate', 'translate']);
const ALLOWED_PROVIDERS = new Set(['openai', 'gemini']);
const ALLOWED_TARGETS = new Set(['x', 'linkedin', 'instagram']);

const jsonError = (message, status = 400, code = 'BAD_REQUEST') => (
  Response.json({ error: { code, message } }, { status })
);

export async function POST(req) {
  try {
    let body;

    try {
      body = await req.json();
    } catch {
      return jsonError('Invalid JSON body.', 400, 'INVALID_JSON');
    }

    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    const provider = body.provider || 'openai';
    const targetSNS = body.targetSNS || 'x';
    const apiKey = typeof body.apiKey === 'string' ? body.apiKey.trim() : '';
    const geminiKey = typeof body.geminiKey === 'string' ? body.geminiKey.trim() : '';
    const persona = typeof body.persona === 'string' ? body.persona.trim() : '';
    const action = body.action || 'generate';

    if (!prompt) {
      return jsonError('Prompt is required.', 400, 'MISSING_PROMPT');
    }

    if (!ALLOWED_ACTIONS.has(action)) {
      return jsonError('Unsupported generation action.', 400, 'INVALID_ACTION');
    }

    if (!ALLOWED_PROVIDERS.has(provider)) {
      return jsonError('Unsupported AI provider.', 400, 'INVALID_PROVIDER');
    }

    if (!ALLOWED_TARGETS.has(targetSNS)) {
      return jsonError('Unsupported target SNS.', 400, 'INVALID_TARGET');
    }

    if (action === 'translate') {
      const result = await runTranslationPipeline(prompt, { provider, targetSNS, apiKey, geminiKey, persona });
      return Response.json({ text: result });
    } else {
      const result = await runAiPipeline(prompt, { provider, targetSNS, apiKey, geminiKey, persona });
      return Response.json({ text: result });
    }
  } catch (error) {
    return jsonError(error.message || 'AI request failed.', 500, 'AI_PIPELINE_ERROR');
  }
}
