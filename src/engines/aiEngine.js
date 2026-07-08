import { useEditorStore } from '../store/useEditorStore';
import { useUIStore } from '../store/useUIStore';

const parseErrorResponse = async (response) => {
  const fallback = `API Error: ${response.status}`;
  const text = await response.text();

  if (!text) return fallback;

  try {
    const data = JSON.parse(text);
    return data?.error?.message || data?.message || fallback;
  } catch {
    return text;
  }
};

const resolveProviderConfig = ({ aiProvider, apiKey, geminiKey }) => {
  const hasOpenAI = Boolean(apiKey?.trim());
  const hasGemini = Boolean(geminiKey?.trim());

  if (aiProvider === 'gemini' && hasGemini) {
    return { provider: 'gemini', apiKey, geminiKey };
  }

  if (aiProvider === 'openai' && hasOpenAI) {
    return { provider: 'openai', apiKey, geminiKey };
  }

  if (hasOpenAI) {
    return { provider: 'openai', apiKey, geminiKey };
  }

  if (hasGemini) {
    return { provider: 'gemini', apiKey, geminiKey };
  }

  // Fall back to OpenAI so the server can still use configured environment keys.
  return { provider: 'openai', apiKey, geminiKey };
};

const runGenerationRequest = async ({ action = 'generate', errorLabel }) => {
  const { koreanText, persona, setIsTranslating, clearEnglishText, setEnglishText } = useEditorStore.getState();
  const { apiKey, geminiKey, aiProvider } = useUIStore.getState();

  if (!koreanText) return;

  setIsTranslating(true);
  clearEnglishText();

  try {
    const resolved = resolveProviderConfig({ aiProvider, apiKey, geminiKey });

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: koreanText,
        provider: resolved.provider,
        targetSNS: useEditorStore.getState().targetSNS,
        apiKey: resolved.apiKey,
        geminiKey: resolved.geminiKey,
        persona,
        action
      })
    });

    if (!response.ok) {
      throw new Error(await parseErrorResponse(response));
    }

    const data = await response.json();
    setEnglishText(data?.text || '');
  } catch (error) {
    console.error('Translation stream error:', error);
    setEnglishText(`${errorLabel}: ${error.message}`);
  } finally {
    setIsTranslating(false);
  }
};

export const generateXPost = () => runGenerationRequest({
  action: 'generate',
  errorLabel: 'AI API 에러',
});

export const generateManualTranslation = () => runGenerationRequest({
  action: 'translate',
  errorLabel: 'AI 번역 에러',
});
