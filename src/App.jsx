import React, { useState, useRef, useEffect } from 'react';
import { Home, Edit3, Image as ImageIcon, Settings, MessageSquare, Sparkles, Languages, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import './App.css';
import { BACKGROUND_CATEGORIES } from './backgroundData';
function App() {
  const [mode, setMode] = useState('manual'); // 'manual' | 'ai'
  const [koreanText, setKoreanText] = useState('');
  const [englishText, setEnglishText] = useState('Be honest, what do you need right now?');
  const [isTranslating, setIsTranslating] = useState(false);
  const [bgStyle, setBgStyle] = useState('paper');
  const [activeCategory, setActiveCategory] = useState('Colors');
  const [activeView, setActiveView] = useState('home');
  const [aspectRatio, setAspectRatio] = useState('1:1'); // '1:1' | '16:9'
  const [fontFamily, setFontFamily] = useState('Georgia, serif');
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');
  const [aiProvider, setAiProvider] = useState(localStorage.getItem('ai_provider') || 'openai');
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [bgBlur, setBgBlur] = useState(0);
  const [bgOpacity, setBgOpacity] = useState(30);
  const [useGlassmorphism, setUseGlassmorphism] = useState(false);
  
  const canvasRef = useRef(null);

  useEffect(() => {
    let foundBg = null;
    for (const category of Object.values(BACKGROUND_CATEGORIES)) {
      const found = category.find(b => b.id === bgStyle);
      if (found) {
        foundBg = found;
        break;
      }
    }
    if (foundBg && foundBg.type === 'image') {
      const match = foundBg.overlay.match(/rgba\(0,\s*0,\s*0,\s*([0-9.]+)\)/);
      if (match) {
        setBgOpacity(Math.round(parseFloat(match[1]) * 100));
      } else {
        setBgOpacity(30);
      }
      setBgBlur(0);
      setUseGlassmorphism(false);
    } else {
      setBgOpacity(0);
    }
  }, [bgStyle]);

  const handleApiKeyChange = (e) => {
    setApiKey(e.target.value);
    localStorage.setItem('openai_api_key', e.target.value);
  };

  const handleGeminiKeyChange = (e) => {
    setGeminiKey(e.target.value);
    localStorage.setItem('gemini_api_key', e.target.value);
  };

  const handleProviderChange = (e) => {
    setAiProvider(e.target.value);
    localStorage.setItem('ai_provider', e.target.value);
  };

  const handleTranslate = async () => {
    if (!koreanText) return;
    setIsTranslating(true);
    
    try {
      if (mode === 'ai') {
        if (aiProvider === 'openai') {
          if (!apiKey) {
            alert("AI 글 생성 기능을 사용하려면 OpenAI API Key를 설정 탭에 입력해주세요.");
            setIsTranslating(false);
            return;
          }

          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: 'gpt-3.5-turbo',
              messages: [
                { role: 'system', content: 'You are an expert social media manager. Create an engaging, viral X (Twitter) post in English based on the following user input. Keep it under 280 characters. Output ONLY the English text.' },
                { role: 'user', content: koreanText }
              ]
            })
          });
          const data = await response.json();
          if (data.choices && data.choices[0]) {
            setEnglishText(data.choices[0].message.content);
          } else {
            setEnglishText("OpenAI API 에러: 키가 올바르지 않거나 한도를 초과했습니다.");
          }
        } else if (aiProvider === 'gemini') {
          if (!geminiKey) {
            alert("AI 글 생성 기능을 사용하려면 Google Gemini API Key를 설정 탭에 입력해주세요.");
            setIsTranslating(false);
            return;
          }

          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    { text: "You are an expert social media manager. Create an engaging, viral X (Twitter) post in English based on the following user input. Keep it under 280 characters. Output ONLY the English text.\n\nInput: " + koreanText }
                  ]
                }
              ]
            })
          });
          const data = await response.json();
          if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
            setEnglishText(data.candidates[0].content.parts[0].text.trim());
          } else {
            setEnglishText("Gemini API 에러: 키가 올바르지 않거나 요청이 거부되었습니다.");
          }
        }
      } else {
        // Using a free translation API (MyMemory) for real translation
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(koreanText)}&langpair=ko|en`);
        const data = await response.json();
        
        if (data && data.responseData && data.responseData.translatedText) {
          setEnglishText(data.responseData.translatedText);
        } else {
          setEnglishText("Translation failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Translation error:", error);
      setEnglishText("Error occurred during translation.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleDownload = async () => {
    if (!canvasRef.current) return;
    const canvasElement = canvasRef.current;
    
    try {
      const canvas = await html2canvas(canvasElement, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: null
      });
      
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = `x-post-${Date.now()}.png`;
      link.click();
    } catch (err) {
      console.error('Failed to download image', err);
    }
  };

  // Find active background data
  let currentBgObj = null;
  for (const category of Object.values(BACKGROUND_CATEGORIES)) {
    const found = category.find(b => b.id === bgStyle);
    if (found) {
      currentBgObj = found;
      break;
    }
  }
  if (!currentBgObj) currentBgObj = BACKGROUND_CATEGORIES['Colors'][0];

  return (
    <div className={`app-container ${aspectRatio === '16:9' ? 'ratio-16-9-mode' : ''}`}>
      {/* Sidebar */}
      <nav className="sidebar">
        <div className="logo-container">
          <MessageSquare size={32} color="var(--text-primary)" fill="var(--text-primary)" />
          <span>Maker</span>
        </div>
        
        <a href="#" className={`nav-item ${activeView === 'home' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveView('home'); }}>
          <Home size={28} />
          <span>Home</span>
        </a>
        <a href="#" className={`nav-item ${activeView === 'drafts' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveView('drafts'); }}>
          <Edit3 size={28} />
          <span>Drafts</span>
        </a>
        <a href="#" className={`nav-item ${activeView === 'backgrounds' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveView('backgrounds'); }}>
          <ImageIcon size={28} />
          <span>Backgrounds</span>
        </a>
        <a href="#" className={`nav-item ${activeView === 'settings' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveView('settings'); }}>
          <Settings size={28} />
          <span>Settings</span>
        </a>
      </nav>

      <main className="main-content">
        {activeView === 'home' && (
          <>
        {/* Editor Panel */}
        <section className="editor-panel">
          <header className="panel-header">
            <h2>Create Post</h2>
          </header>
          <div className="editor-content">
            
            <div className="mode-selector">
              <button 
                className={`mode-btn ${mode === 'manual' ? 'active' : ''}`}
                onClick={() => setMode('manual')}
              >
                <Edit3 size={18} />
                직접 쓰기
              </button>
              <button 
                className={`mode-btn ${mode === 'ai' ? 'active' : ''}`}
                onClick={() => setMode('ai')}
              >
                <Sparkles size={18} />
                AI가 쓰기
              </button>
            </div>

            <div className="input-group">
              <label>
                {mode === 'ai' ? '어떤 주제로 글을 작성할까요?' : '한국어로 입력하세요'}
              </label>
              <textarea 
                placeholder={mode === 'ai' ? '예: 아침 일찍 일어나서 운동하는 것의 장점...' : '여기에 글을 작성하세요...'}
                value={koreanText}
                onChange={(e) => setKoreanText(e.target.value)}
                rows={4}
              />
            </div>

            <button 
              className="action-btn translate-btn" 
              onClick={handleTranslate}
              disabled={isTranslating || !koreanText}
            >
              <Languages size={20} />
              {isTranslating ? '번역 중...' : (mode === 'ai' ? 'AI 글 생성 및 영문 변환' : '영문 번역하기')}
            </button>

            <div className="input-group" style={{ marginTop: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label style={{ margin: 0 }}>영문 결과 (수정 가능)</label>
                <span style={{ 
                  fontSize: '13px', 
                  fontWeight: '600',
                  color: englishText.length > 280 ? '#f4212e' : 'var(--text-secondary)' 
                }}>
                  {englishText.length} / 280
                </span>
              </div>
              <textarea 
                className="english-textarea"
                placeholder="영문 변환 결과가 여기에 표시됩니다."
                value={englishText}
                onChange={(e) => setEnglishText(e.target.value)}
                rows={4}
              />
            </div>

            <div className="input-group" style={{ marginTop: '16px' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>배경 스타일 선택</span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>총 50종</span>
              </label>

              {/* Tabs */}
              <div className="category-tabs" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                {Object.keys(BACKGROUND_CATEGORIES).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: 'none',
                      backgroundColor: activeCategory === cat ? 'var(--accent-color)' : 'var(--glass-bg)',
                      color: activeCategory === cat ? '#fff' : 'var(--text-primary)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      fontSize: '14px',
                      fontWeight: activeCategory === cat ? 'bold' : 'normal',
                      transition: 'all 0.2s'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Grid */}
              <div className="bg-options" style={{ flexWrap: 'wrap', maxHeight: '180px', overflowY: 'auto', paddingBottom: '10px' }}>
                {BACKGROUND_CATEGORIES[activeCategory].map((bg) => (
                  <button 
                    key={bg.id}
                    className={`bg-option-btn ${bgStyle === bg.id ? 'selected' : ''}`}
                    onClick={() => setBgStyle(bg.id)}
                    title={bg.title}
                    style={{
                      background: bg.type === 'image' ? `url('${bg.value}') center/cover no-repeat` : bg.value,
                      border: bgStyle === bg.id ? '3px solid var(--accent-color)' : '2px solid transparent',
                      boxSizing: 'border-box'
                    }}
                  />
                ))}
              </div>

              {/* Contrast & Readability Controls */}
              {currentBgObj.type === 'image' && (
                <div className="contrast-controls" style={{ 
                  marginTop: '16px', 
                  padding: '16px', 
                  backgroundColor: 'var(--glass-bg)', 
                  borderRadius: '12px', 
                  border: '1px solid var(--glass-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>배경 대비 및 가독성 설정</h4>
                  
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <span>배경 어둡기 (오버레이)</span>
                      <span>{bgOpacity}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="90" 
                      value={bgOpacity} 
                      onChange={(e) => setBgOpacity(parseInt(e.target.value))}
                      style={{ width: '100%', height: '6px', borderRadius: '3px', accentColor: 'var(--accent-color)', cursor: 'pointer' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <span>배경 흐림 (Blur)</span>
                      <span>{bgBlur}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="20" 
                      value={bgBlur} 
                      onChange={(e) => setBgBlur(parseInt(e.target.value))}
                      style={{ width: '100%', height: '6px', borderRadius: '3px', accentColor: 'var(--accent-color)', cursor: 'pointer' }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', paddingTop: '8px', borderTop: '1px solid var(--glass-border)' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>글래스모피즘 카드 박스</span>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={useGlassmorphism} 
                        onChange={(e) => setUseGlassmorphism(e.target.checked)}
                      />
                      <span className="slider" />
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
              <div className="input-group" style={{ flex: 1, marginTop: 0 }}>
                <label>이미지 비율</label>
                <div className="mode-selector" style={{ marginBottom: 0 }}>
                  <button 
                    className={`mode-btn ${aspectRatio === '1:1' ? 'active' : ''}`}
                    onClick={() => setAspectRatio('1:1')}
                  >
                    1:1
                  </button>
                  <button 
                    className={`mode-btn ${aspectRatio === '16:9' ? 'active' : ''}`}
                    onClick={() => setAspectRatio('16:9')}
                  >
                    16:9
                  </button>
                </div>
              </div>

              <div className="input-group" style={{ flex: 1, marginTop: 0 }}>
                <label>폰트 스타일</label>
                <select 
                  value={fontFamily} 
                  onChange={(e) => setFontFamily(e.target.value)}
                  style={{
                    backgroundColor: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    padding: '13px',
                    fontSize: '15px',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    cursor: 'pointer',
                    height: '100%'
                  }}
                >
                  <option value="Georgia, serif">Classic Serif</option>
                  <option value="'Playfair Display', serif">Elegant Serif</option>
                  <option value="'Inter', sans-serif">Modern Sans</option>
                  <option value="'Caveat', cursive">Handwriting</option>
                  <option value="'Roboto Mono', monospace">Monospace</option>
                </select>
              </div>
            </div>

          </div>
        </section>

        {/* Preview Panel */}
        <section className="preview-panel">
          <header className="panel-header" style={{ borderLeft: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Preview</h2>
            <button className="action-btn download-btn" onClick={handleDownload}>
              <Download size={18} />
              다운로드
            </button>
          </header>
          <div className="preview-container">
            <div className="canvas-wrapper" style={{ borderRadius: '8px', overflow: 'hidden' }}>
              <div 
                className={`canvas-bg ${aspectRatio === '16:9' ? 'ratio-16-9' : ''}`} 
                ref={canvasRef}
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  background: currentBgObj.type === 'color' ? currentBgObj.value : '#000',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {/* Background image layer with blur */}
                {currentBgObj.type === 'image' && (
                  <div style={{
                    position: 'absolute',
                    top: -10, // Slight overflow to prevent border artifacts from blur
                    left: -10,
                    right: -10,
                    bottom: -10,
                    background: `url('${currentBgObj.value}') center/cover no-repeat`,
                    filter: `blur(${bgBlur}px)`,
                    zIndex: 1
                  }} />
                )}

                {/* Dark overlay layer */}
                {currentBgObj.type === 'image' && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: `rgba(0, 0, 0, ${bgOpacity / 100})`,
                    zIndex: 2
                  }} />
                )}

                {/* Text content container */}
                <div 
                  style={{
                    position: 'relative',
                    zIndex: 3,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px',
                    boxSizing: 'border-box'
                  }}
                >
                  <div 
                    className={`canvas-text ${useGlassmorphism ? 'glassmorphism-card' : ''}`} 
                    style={{ 
                      whiteSpace: 'pre-wrap', 
                      fontFamily: fontFamily,
                      color: useGlassmorphism ? '#ffffff' : currentBgObj.textColor,
                      textShadow: useGlassmorphism ? 'none' : (currentBgObj.textShadow !== 'none' ? `0 2px 12px rgba(0,0,0,${Math.max(0.3, (bgOpacity / 100) * 1.5)})` : 'none'),
                      width: useGlassmorphism ? '85%' : '100%',
                      padding: useGlassmorphism ? '24px 30px' : '0',
                      boxSizing: 'border-box',
                      textAlign: 'center'
                    }}
                  >
                    {englishText || 'Your text will appear here...'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        </>
        )}

        {activeView === 'drafts' && (
          <section className="view-panel" style={{ width: '100%', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            <Edit3 size={64} style={{ marginBottom: '24px', opacity: 0.5 }} />
            <h2>No Drafts Yet</h2>
            <p style={{ marginTop: '8px' }}>Save your posts here to work on them later.</p>
          </section>
        )}

        {activeView === 'backgrounds' && (
          <section className="view-panel" style={{ width: '100%', padding: '40px', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '32px' }}>Background Gallery</h2>
            {Object.keys(BACKGROUND_CATEGORIES).map(cat => (
              <div key={cat} style={{ marginBottom: '40px' }}>
                <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>{cat}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '16px' }}>
                  {BACKGROUND_CATEGORIES[cat].map(bg => (
                    <div 
                      key={bg.id} 
                      title={bg.title}
                      style={{
                        aspectRatio: '1',
                        borderRadius: '8px',
                        background: bg.type === 'image' ? `url('${bg.value}') center/cover no-repeat` : bg.value,
                        cursor: 'pointer',
                        border: bgStyle === bg.id ? '3px solid var(--accent-color)' : '1px solid var(--border-color)',
                        boxSizing: 'border-box'
                      }}
                      onClick={() => {
                        setBgStyle(bg.id);
                        setActiveCategory(cat);
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {activeView === 'settings' && (
          <section className="view-panel" style={{ width: '100%', padding: '40px' }}>
            <h2 style={{ marginBottom: '32px' }}>Settings</h2>
            
            <div className="settings-card" style={{ backgroundColor: 'var(--glass-bg)', padding: '32px', borderRadius: '16px', border: '1px solid var(--glass-border)', maxWidth: '600px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                <Settings size={28} color="var(--accent-color)" /> 
                <h3 style={{ margin: 0, fontSize: '22px' }}>AI Configuration</h3>
              </div>
              
              <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--glass-border)' }}>
                <label style={{ display: 'block', marginBottom: '12px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Select AI Provider</label>
                <select 
                  value={aiProvider}
                  onChange={handleProviderChange}
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '10px',
                    padding: '14px',
                    fontSize: '16px',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="openai">OpenAI (ChatGPT-3.5)</option>
                  <option value="gemini">Google Gemini (Gemini 1.5 Flash)</option>
                </select>
              </div>

              {aiProvider === 'openai' && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'var(--text-primary)' }}>OpenAI API Key</label>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14px', lineHeight: '1.5' }}>
                    Required for the "AI Writer" feature using ChatGPT. Your key is stored securely in your browser's local storage.
                  </p>
                  <input 
                    type="password"
                    placeholder="sk-..."
                    value={apiKey}
                    onChange={handleApiKeyChange}
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(0,0,0,0.2)',
                      border: '1px solid var(--accent-color)',
                      borderRadius: '8px',
                      padding: '14px',
                      fontSize: '15px',
                      color: 'var(--text-primary)',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}

              {aiProvider === 'gemini' && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Google Gemini API Key</label>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14px', lineHeight: '1.5' }}>
                    Required for the "AI Writer" feature using Gemini. You can get a free key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-color)' }}>Google AI Studio</a>.
                  </p>
                  <input 
                    type="password"
                    placeholder="AIzaSy..."
                    value={geminiKey}
                    onChange={handleGeminiKeyChange}
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(0,0,0,0.2)',
                      border: '1px solid var(--accent-color)',
                      borderRadius: '8px',
                      padding: '14px',
                      fontSize: '15px',
                      color: 'var(--text-primary)',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
