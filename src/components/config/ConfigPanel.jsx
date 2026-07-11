import { useUIStore } from '../../store/useUIStore';
import { translations } from '../../lib/translations';
import React, { useState, useEffect } from 'react';
import { Bot, Key, Shield, Search, Download, CheckCircle2, Loader, Folder, Cpu, AlertTriangle } from 'lucide-react';

export const ConfigPanel = () => {
  const { apiKey, setApiKey, geminiKey, setGeminiKey, aiProvider, setAiProvider, lang, localModelPath, setLocalModelPath, hfToken, setHfToken } = useUIStore();
  const t = translations[lang || 'en'].config;

  // HuggingFace & Local Models states
  const [hfSearchQuery, setHfSearchQuery] = useState('');
  const [hfModels, setHfModels] = useState([]);
  const [searchingHf, setSearchingHf] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [repoFiles, setRepoFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [installedModels, setInstalledModels] = useState([]);
  const [downloadingModels, setDownloadingModels] = useState([]);
  const [onlyCommercial, setOnlyCommercial] = useState(true);
  const [isLocalHost, setIsLocalHost] = useState(true);
  const [downloadError, setDownloadError] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLocalHost(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    }
  }, []);

  const isCommercialLicense = (license) => {
    const l = license.toLowerCase();
    if (l === 'unknown') return false;
    return l.includes('apache') || 
           l.includes('mit') || 
           l.includes('bsd') || 
           l.includes('gemma') || 
           l.includes('llama') || 
           l.includes('openrail') || 
           l.includes('cc-by-4.0') || 
           l.includes('cc-by-sa-4.0');
  };

  // Fetch installed and downloading models status
  const fetchLocalModelsStatus = async () => {
    try {
      const res = await fetch('/api/local/pull-status');
      if (res.ok) {
        const data = await res.json();
        setInstalledModels(data.installed || []);
        setDownloadingModels(data.pulling || []);
      }
    } catch (e) {
      console.warn('Failed to fetch local model status:', e);
    }
  };

  // Poll status every 2 seconds
  useEffect(() => {
    fetchLocalModelsStatus();
    const interval = setInterval(() => {
      fetchLocalModelsStatus();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchHf = async (e) => {
    if (e) e.preventDefault();
    if (!hfSearchQuery.trim()) return;
    setSearchingHf(true);
    setSelectedRepo(null);
    setRepoFiles([]);
    setDownloadError(null);
    try {
      const res = await fetch(`/api/local/hf-search?query=${encodeURIComponent(hfSearchQuery)}&token=${encodeURIComponent(hfToken || '')}`);
      if (res.ok) {
        const data = await res.json();
        setHfModels(data.models || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingHf(false);
    }
  };

  const handleSelectRepo = async (repoId) => {
    setSelectedRepo(repoId);
    setLoadingFiles(true);
    setDownloadError(null);
    try {
      const res = await fetch(`/api/local/hf-files?repoId=${encodeURIComponent(repoId)}&token=${encodeURIComponent(hfToken || '')}`);
      if (res.ok) {
        const data = await res.json();
        setRepoFiles(data.files || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleDownloadModel = async (repoId, fileName) => {
    const confirmed = window.confirm("이 모델의 라이선스와 원본 Base Model의 이용 조건을 확인했습니다.");
    if (!confirmed) return;

    setDownloadError(null);
    try {
      const res = await fetch('/api/local/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoId, fileName })
      });
      if (res.ok) {
        fetchLocalModelsStatus();
      } else {
        const data = await res.json();
        setDownloadError(data.error || 'Failed to start download');
      }
    } catch (err) {
      setDownloadError(err.message || 'Failed to start download');
    }
  };

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
                
                {/* Installed Local Models list */}
                {installedModels.length > 0 && (
                  <div className="bg-[rgba(255,255,255,0.02)] border border-[var(--border-color)] rounded-xl p-4">
                    <div className="text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 flex items-center gap-1.5 font-sans">
                      <Folder size={14} />
                      {lang === 'en' ? 'Downloaded GGUF Models' : '다운로드된 GGUF 모델'}
                    </div>
                    <div className="flex flex-col gap-2">
                      {installedModels.map(m => (
                        <button
                          key={m.name}
                          type="button"
                          onClick={() => setLocalModelPath(m.path)}
                          className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${localModelPath === m.path ? 'border-[var(--text-primary)] bg-[rgba(255,255,255,0.05)]' : 'border-[var(--border-color)] hover:border-[var(--text-secondary)] bg-transparent'}`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-mono text-[var(--text-primary)] truncate">{m.name}</p>
                            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{m.sizeGb} GB • Click to select</p>
                          </div>
                          {localModelPath === m.path && <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Downloading Status */}
                {downloadingModels.length > 0 && (
                  <div className="bg-[rgba(255,255,255,0.02)] border border-yellow-500/20 rounded-xl p-4 space-y-3">
                    <div className="text-[12px] font-bold text-yellow-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Loader className="animate-spin" size={14} />
                      {lang === 'en' ? 'Downloading Model...' : '모델 다운로드 중...'}
                    </div>
                    {downloadingModels.map(m => (
                      <div key={m.name} className="space-y-1">
                        <div className="flex justify-between text-[12px]">
                          <span className="text-[var(--text-primary)] truncate max-w-[80%] font-mono">{m.name}</span>
                          <span className="text-[var(--text-secondary)]">{m.progress}%</span>
                        </div>
                        <div className="w-full bg-[var(--border-color)] h-2 rounded-full overflow-hidden">
                          <div className="bg-yellow-500 h-full transition-all duration-300" style={{ width: `${m.progress}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* HuggingFace GGUF Search */}
                <div className="border border-[var(--border-color)] rounded-xl p-6 bg-black/20 flex flex-col gap-4">
                  <div className="text-[12px] font-bold text-[rgba(168,85,247,1)] uppercase tracking-wider mb-1 flex items-center gap-1.5 font-sans">
                    <Cpu size={14} />
                    HUGGINGFACE GGUF SEARCH
                  </div>

                  {!isLocalHost && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex gap-3 text-red-400">
                      <AlertTriangle className="flex-shrink-0 mt-0.5" size={18} />
                      <div className="text-[13px] leading-relaxed">
                        <strong>로컬 개발 환경(localhost) 구동이 필요합니다.</strong>
                        <p className="mt-1 opacity-90 text-[12px]">
                          GGUF 모델 다운로드 및 구동 기능은 로컬 PC에서 <strong>npm run dev (localhost:3000)</strong>를 실행하여 접속할 때만 작동합니다. Vercel 클라우드 배포판에서는 서버 용량 및 쓰기 불가능한 파일시스템 환경으로 인해 다운로드가 제한됩니다.
                        </p>
                      </div>
                    </div>
                  )}

                  {downloadError && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex gap-3 text-red-400">
                      <AlertTriangle className="flex-shrink-0 mt-0.5" size={18} />
                      <div className="text-[13px] leading-relaxed">
                        <strong>다운로드 오류:</strong>
                        <p className="mt-1 opacity-90 text-[12px] font-mono">{downloadError}</p>
                      </div>
                    </div>
                  )}

                  {/* HF Token (optional) */}
                  <input 
                    type="password"
                    placeholder={lang === 'en' ? 'HF Token (optional - for private models)' : 'HF Token (선택 사항 - 비공개 모델 용)'}
                    value={hfToken || ''}
                    onChange={(e) => setHfToken(e.target.value)}
                    className="w-full bg-[rgba(0,0,0,0.3)] border border-[var(--border-color)] rounded-xl p-4 text-[15px] font-sans text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)] transition-all shadow-inner"
                  />
                  
                  {/* Search models input + button */}
                  <form onSubmit={handleSearchHf} className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="Search models (e.g. qwen, llama)"
                      value={hfSearchQuery}
                      onChange={(e) => setHfSearchQuery(e.target.value)}
                      className="flex-1 bg-[rgba(0,0,0,0.3)] border border-[var(--border-color)] rounded-xl p-4 text-[15px] font-sans text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)] transition-all shadow-inner"
                    />
                    <button
                      type="submit"
                      disabled={searchingHf}
                      className="w-[56px] h-[56px] bg-[rgba(168,85,247,0.2)] hover:bg-[rgba(168,85,247,0.3)] text-[rgba(168,85,247,1)] border border-[rgba(168,85,247,0.4)] rounded-xl flex items-center justify-center disabled:opacity-50 transition-all"
                    >
                      {searchingHf ? <Loader className="animate-spin" size={20} /> : <Search size={20} />}
                    </button>
                  </form>

                  {/* License compliance filter checkbox */}
                  <label className="flex items-center justify-between p-4 bg-[rgba(0,0,0,0.2)] border border-[var(--border-color)] rounded-xl cursor-pointer hover:border-[var(--text-secondary)] transition-all">
                    <span className="text-[14px] font-medium text-[var(--text-primary)]">라이선스 메타데이터 기반 모델 필터</span>
                    <input 
                      type="checkbox"
                      checked={onlyCommercial}
                      onChange={(e) => setOnlyCommercial(e.target.checked)}
                      className="w-5 h-5 rounded border-[var(--border-color)] text-[rgba(168,85,247,1)] focus:ring-[rgba(168,85,247,1)] cursor-pointer"
                    />
                  </label>

                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed font-sans">
                    {lang === 'en' ? 
                      "Filters based on the license metadata shown on the model card. Please verify the original model card and license terms for final conditions." :
                      "모델 카드에 표시된 라이선스 메타데이터를 기준으로 필터링합니다. 최종 이용 조건은 원본 모델 카드와 라이선스를 확인해 주세요."
                    }
                  </p>

                  {/* Hugging Face Model Results */}
                  {hfModels.length > 0 && (
                    <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar border-t border-[var(--border-color)] pt-3 mt-1">
                      {hfModels
                        .filter(m => {
                          if (onlyCommercial) {
                            return isCommercialLicense(m.license);
                          }
                          return true;
                        })
                        .map(m => {
                          const isCommercial = isCommercialLicense(m.license);
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => handleSelectRepo(m.id)}
                              className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${selectedRepo === m.id ? 'border-[rgba(168,85,247,1)] bg-[rgba(255,255,255,0.03)]' : 'border-[var(--border-color)] hover:border-[var(--text-secondary)] bg-transparent'}`}
                            >
                              <div className="min-w-0 flex-1 mr-2">
                                <p className="text-[13px] text-[var(--text-primary)] font-semibold truncate font-mono">{m.id}</p>
                                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                                  {m.downloads.toLocaleString()} DLs • License: {m.license}
                                </p>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex-shrink-0 ${isCommercial ? 'border border-green-500/30 text-green-400 bg-green-500/10' : 'border border-red-500/30 text-red-400 bg-red-500/10'}`}>
                                {isCommercial ? '상업·파인튜닝 가능' : '상업 이용 제한'}
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  )}

                  {/* Hugging Face Repo Files */}
                  {selectedRepo && (
                    <div className="border-t border-[var(--border-color)] pt-4 mt-2 flex flex-col gap-3">
                      <div className="text-[12px] font-bold text-[var(--text-secondary)] truncate">
                        Files in {selectedRepo}:
                      </div>
                      {loadingFiles ? (
                        <div className="flex items-center gap-2 py-4 justify-center text-[var(--text-secondary)] text-[13px]">
                          <Loader className="animate-spin" size={14} />
                          <span>Fetching files...</span>
                        </div>
                      ) : repoFiles.length === 0 ? (
                        <div className="text-[12px] text-[var(--text-secondary)] text-center py-4">
                          No GGUF files found in this repository.
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                          {repoFiles.map(file => {
                            const isDownloaded = installedModels.some(m => m.name === file);
                            const isDownloading = downloadingModels.some(m => m.name === file);
                            const repoInfo = hfModels.find(m => m.id === selectedRepo);
                            const isCommercial = repoInfo ? isCommercialLicense(repoInfo.license) : true;
                            const isDownloadDisabled = !isCommercial || !isLocalHost;
                            
                            return (
                              <div key={file} className="flex items-center justify-between p-2.5 bg-black/10 border border-[var(--border-color)] rounded-lg">
                                <span className="text-[12px] font-mono text-[var(--text-primary)] truncate max-w-[70%]" title={file}>
                                  {file}
                                </span>
                                
                                {isDownloaded ? (
                                  <span className="text-[11px] font-bold text-green-400 flex items-center gap-1">
                                    <CheckCircle2 size={12} />
                                    Installed
                                  </span>
                                ) : isDownloading ? (
                                  <span className="text-[11px] font-bold text-yellow-500 flex items-center gap-1">
                                    <Loader className="animate-spin" size={12} />
                                    Downloading
                                  </span>
                                ) : isDownloadDisabled ? (
                                  <span className="text-[10px] font-semibold text-red-400/80 bg-red-950/30 border border-red-500/20 px-2 py-0.5 rounded">
                                    {!isLocalHost ? '로컬 한정' : '다운로드 제한'}
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadModel(selectedRepo, file)}
                                    className="px-2.5 py-1 border border-[var(--border-color)] hover:border-[var(--text-primary)] hover:bg-white/5 rounded text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium flex items-center gap-1 transition-all"
                                  >
                                    <Download size={10} />
                                    Download
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
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
