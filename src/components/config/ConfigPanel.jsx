import { useUIStore } from '../../store/useUIStore';
import { translations } from '../../lib/translations';
import { Bot, Key, Shield } from 'lucide-react';

export const ConfigPanel = () => {
  const { apiKey, setApiKey, geminiKey, setGeminiKey, aiProvider, setAiProvider, lang, localModelPath, setLocalModelPath } = useUIStore();
  const t = translations[lang || 'en'].config;

  return (
    <div className="flex-1 bg-[var(--bg-panel)] overflow-y-auto p-12 custom-scrollbar w-full h-full flex flex-col">
      <div className="max-w-[800px] mx-auto w-full flex-1 flex flex-col">
        <header className="mb-10 pb-6 border-b border-[var(--border-color)]">
          <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2 tracking-tight">{t.title}</h2>
          <p className="text-[var(--text-secondary)] text-[14px]">{t.subtitle}</p>
        </header>

        <div className="flex flex-col gap-8">
          
          {/* AI Provider Selection */}
          <section className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)]">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="text-[18px] font-semibold text-[var(--text-primary)]">{t.aiConfig}</h3>
                <p className="text-[13px] text-[var(--text-secondary)] mt-1">
                  {lang === 'en' ? 'Select the AI engine for generating your English posts.' : '영문 포스트를 생성할 AI 엔진을 선택해 주세요.'}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setAiProvider('openai')}
                className={`flex-1 py-4 rounded-xl border-2 transition-all ${aiProvider === 'openai' ? 'border-[var(--text-primary)] bg-[rgba(255,255,255,0.05)] shadow-md' : 'border-[var(--glass-border)] hover:border-[var(--text-secondary)]'}`}
              >
                <div className="font-bold text-[var(--text-primary)] mb-1">OpenAI</div>
                <div className="text-[12px] text-[var(--text-secondary)]">GPT-4o-mini</div>
              </button>
              <button 
                onClick={() => setAiProvider('gemini')}
                className={`flex-1 py-4 rounded-xl border-2 transition-all ${aiProvider === 'gemini' ? 'border-[var(--text-primary)] bg-[rgba(255,255,255,0.05)] shadow-md' : 'border-[var(--glass-border)] hover:border-[var(--text-secondary)]'}`}
              >
                <div className="font-bold text-[var(--text-primary)] mb-1">{lang === 'en' ? 'Google' : '구글'}</div>
                <div className="text-[12px] text-[var(--text-secondary)]">Gemini 1.5 Flash</div>
              </button>
              <button 
                onClick={() => setAiProvider('local')}
                className={`flex-1 py-4 rounded-xl border-2 transition-all ${aiProvider === 'local' ? 'border-[var(--text-primary)] bg-[rgba(255,255,255,0.05)] shadow-md' : 'border-[var(--glass-border)] hover:border-[var(--text-secondary)]'}`}
              >
                <div className="font-bold text-[var(--text-primary)] mb-1">{lang === 'en' ? 'Local LLM' : '로컬 LLM'}</div>
                <div className="text-[12px] text-[var(--text-secondary)]">Llama Node (GGUF)</div>
              </button>
            </div>
          </section>

          {/* API Key / Local Model Configuration */}
          {aiProvider === 'local' ? (
            <section className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-8 shadow-sm transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)]">
                  <Key size={20} />
                </div>
                <div>
                  <h3 className="text-[18px] font-semibold text-[var(--text-primary)]">
                    Local GGUF Model Path
                  </h3>
                  <p className="text-[13px] text-[var(--text-secondary)] mt-1">
                    {lang === 'en' ? 'Absolute path to your local GGUF model file.' : '로컬 컴퓨터에 저장된 GGUF 모델 파일의 절대 경로를 입력해 주세요.'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <input 
                  type="text"
                  placeholder="e.g. /Users/username/models/gemma-4-coding-q8.gguf"
                  value={localModelPath || ''}
                  onChange={(e) => setLocalModelPath(e.target.value)}
                  className="w-full bg-[rgba(0,0,0,0.3)] border border-[var(--border-color)] rounded-xl p-4 text-[15px] font-mono text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)] transition-all shadow-inner"
                />
                
                <div className="flex items-start gap-2 bg-[rgba(255,255,255,0.03)] p-4 rounded-xl border border-[var(--border-color)]">
                  <Shield size={16} className="text-[var(--text-secondary)] mt-0.5" />
                  <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                    {lang === 'en' ? (
                      <>
                        The local GGUF model is loaded dynamically using <strong>node-llama-cpp</strong>. 
                        No external API keys are required, and the model runs fully offline on your own hardware (requires running locally).
                      </>
                    ) : (
                      <>
                        로컬 GGUF 모델은 <strong>node-llama-cpp</strong>를 통해 메모리에 동적으로 적재됩니다. 
                        외부 API 키가 필요 없으며, 자체 하드웨어 리소스를 사용하여 100% 오프라인 상태로 로컬 서버에서 가동됩니다.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </section>
          ) : (
            <section className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-8 shadow-sm transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)]">
                  <Key size={20} />
                </div>
                <div>
                  <h3 className="text-[18px] font-semibold text-[var(--text-primary)]">
                    {aiProvider === 'openai' ? 'OpenAI API Key' : 'Google Gemini API Key'}
                  </h3>
                  <p className="text-[13px] text-[var(--text-secondary)] mt-1">
                    {lang === 'en' ? 'Required for generating AI posts.' : 'AI 포스트를 생성하기 위해 필요합니다.'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {aiProvider === 'openai' ? (
                  <input 
                    type="password"
                    placeholder="sk-proj-..."
                    value={apiKey || ''}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-[rgba(0,0,0,0.3)] border border-[var(--border-color)] rounded-xl p-4 text-[15px] font-mono tracking-wider text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)] transition-all shadow-inner"
                  />
                ) : (
                  <input 
                    type="password"
                    placeholder="AIzaSy..."
                    value={geminiKey || ''}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    className="w-full bg-[rgba(0,0,0,0.3)] border border-[var(--border-color)] rounded-xl p-4 text-[15px] font-mono tracking-wider text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)] transition-all shadow-inner"
                  />
                )}
                
                <div className="flex items-start gap-2 bg-[rgba(255,255,255,0.03)] p-4 rounded-xl border border-[var(--border-color)]">
                  <Shield size={16} className="text-[var(--text-secondary)] mt-0.5" />
                  <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                    {lang === 'en' ? (
                      <>
                        Your API key is securely stored in your browser&apos;s local storage (Zustand persist). 
                        It is never saved to a database and is only transmitted securely to the server to execute the AI pipeline.
                      </>
                    ) : (
                      <>
                        입력하신 API 키는 브라우저의 로컬 스토리지에 안전하게 보관됩니다. 
                        외부 서버 데이터베이스에 저장되지 않으며, AI 파이프라인 처리를 위해서만 암호화된 방식으로 서버에 전송됩니다.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
};
