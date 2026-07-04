import React, { useState, useRef } from 'react';
import { Home, Edit3, Image as ImageIcon, Settings, MessageSquare, Sparkles, Languages, Download } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
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
  const [aspectRatio, setAspectRatio] = useState('1:1'); // '1:1' | '16:9'
  const [fontFamily, setFontFamily] = useState('Georgia, serif');
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');
  
  const canvasRef = useRef(null);

  const handleApiKeyChange = (e) => {
    setApiKey(e.target.value);
    localStorage.setItem('openai_api_key', e.target.value);
  };

  const handleTranslate = async () => {
    if (!koreanText) return;
    setIsTranslating(true);
    
    try {
      if (mode === 'ai') {
        if (!apiKey) {
          alert("AI 글 생성 기능을 사용하려면 OpenAI API Key를 아래 설정에 입력해주세요.");
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
          setEnglishText("AI API 에러: 키가 올바르지 않거나 한도를 초과했습니다.");
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
        
        <a href="#" className="nav-item active">
          <Home size={28} />
          <span>Home</span>
        </a>
        <a href="#" className="nav-item">
          <Edit3 size={28} />
          <span>Drafts</span>
        </a>
        <a href="#" className="nav-item">
          <ImageIcon size={28} />
          <span>Backgrounds</span>
        </a>
        <a href="#" className="nav-item">
          <Settings size={28} />
          <span>Settings</span>
        </a>
      </nav>

      <main className="main-content">
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
                      background: bg.type === 'image' ? `#2a2a35 url('${bg.value}') center/cover no-repeat` : bg.value,
                      border: bgStyle === bg.id ? '3px solid var(--accent-color)' : '2px solid transparent',
                      boxSizing: 'border-box'
                    }}
                  >
                    {/* If image fails, at least show some text or it's a gray circle */}
                  </button>
                ))}
              </div>
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

            {mode === 'ai' && (
              <div className="input-group" style={{ marginTop: '32px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Settings size={16} /> AI 설정 (OpenAI API Key)
                </label>
                <input 
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={handleApiKeyChange}
                  style={{
                    backgroundColor: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '14px',
                    color: 'var(--text-primary)'
                  }}
                />
                <small style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '12px' }}>
                  입력하신 키는 브라우저에만 저장되며 외부로 전송되지 않습니다.
                </small>
              </div>
            )}

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
            <div className="canvas-wrapper">
              <div 
                className={`canvas-bg ${aspectRatio === '16:9' ? 'ratio-16-9' : ''}`} 
                ref={canvasRef}
                style={{
                  background: currentBgObj.type === 'image' ? `linear-gradient(${currentBgObj.overlay}, ${currentBgObj.overlay}), url('${currentBgObj.value}') center/cover no-repeat` : currentBgObj.value,
                }}
              >
                <div 
                  className="canvas-text" 
                  style={{ 
                    whiteSpace: 'pre-wrap', 
                    fontFamily: fontFamily,
                    color: currentBgObj.textColor,
                    textShadow: currentBgObj.textShadow
                  }}
                >
                  {englishText || 'Your text will appear here...'}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
