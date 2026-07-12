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
  if (aiProvider === 'local') {
    return { provider: 'local', apiKey, geminiKey };
  }

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
  const { koreanText, persona, setIsTranslating, clearEnglishText, setEnglishText, clearKoreanTranslation, setKoreanTranslation } = useEditorStore.getState();
  const { apiKey, geminiKey, aiProvider, localModelPath, localApiUrl } = useUIStore.getState();

  if (!koreanText) return;

  setIsTranslating(true);
  clearEnglishText();
  clearKoreanTranslation();

  try {
    const resolved = resolveProviderConfig({ aiProvider, apiKey, geminiKey });

    if (resolved.provider === 'local') {
      if (!localModelPath) {
        throw new Error('로컬 GGUF 모델 파일 경로가 설정되어 있지 않습니다. CONFIG 메뉴에서 활성 모델을 선택하거나 로드해 주세요.');
      }
      try {
        const checkUrl = `${localApiUrl || ''}/api/local/exists?path=${encodeURIComponent(localModelPath)}`;
        const existsRes = await fetch(checkUrl);
        if (existsRes.ok) {
          const existsData = await existsRes.json();
          if (!existsData.exists) {
            throw new Error(`지정된 경로에 로컬 모델 파일이 없습니다: ${localModelPath}. CONFIG 메뉴에서 경로를 검증해 주세요.`);
          }
        }
      } catch (err) {
        // Fallback to native fetch checks if api fails
      }
    }

    const targetUrl = resolved.provider === 'local' && localApiUrl
      ? `${localApiUrl}/api/generate`
      : '/api/generate';

    const response = await fetch(targetUrl, {
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
        localModelPath,
        persona,
        action
      })
    });

    if (!response.ok) {
      throw new Error(await parseErrorResponse(response));
    }

    const data = await response.json();
    setEnglishText(data?.text || '');
    setKoreanTranslation(data?.translation || '');
  } catch (error) {
    console.error('Translation stream error:', error);
    setEnglishText(`${errorLabel}: ${error.message}`);
    setKoreanTranslation('');
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
