'use client';

import React, { useState } from 'react';
import { useUIStore } from '../../store/useUIStore';
import { translations } from '../../lib/translations';
import { ForceGraph } from './ForceGraph';
import { Brain, Send, Database, Sparkles, RefreshCw, FileText, Loader2, ArrowRight } from 'lucide-react';

const DEFAULT_STORY_KO = `김선우는 2024년까지 카카오에서 개발자로 근무했다. 2025년 3월에 카카오를 퇴사한 후 1인 AI 스타트업인 '포스티파이(Postify)'를 서울에서 창업했다. 2026년 2월, 포스티파이는 구글 딥마인드(Google DeepMind)와 AI 인프라 부문 파트너십을 체결하며 기술력을 입증했다.`;

const DEFAULT_STORY_EN = `Sinae Cho worked as an AI researcher at Google Brain until 2024. In March 2025, she left Google and founded 'Postify-AI', a privacy-first local workflow software. In February 2026, Postify-AI announced a strategic partnership with OpenAI to integrate advanced reasoning models.`;

export const MvpPanel = () => {
  const { lang, aiProvider, apiKey, geminiKey, showToast } = useUIStore();
  
  const isKo = lang === 'ko';
  const defaultStory = isKo ? DEFAULT_STORY_KO : DEFAULT_STORY_EN;

  const [inputText, setInputText] = useState(defaultStory);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [highlightedNodeIds, setHighlightedNodeIds] = useState([]);
  
  const [chatHistory, setChatHistory] = useState([]);
  const [queryText, setQueryText] = useState('');
  
  const [loadingExtract, setLoadingExtract] = useState(false);
  const [loadingQuery, setLoadingQuery] = useState(false);

  // Extract Temporal Knowledge Graph
  const handleExtract = async () => {
    if (!inputText.trim()) {
      showToast(isKo ? '텍스트를 입력해 주세요.' : 'Please enter some text.', 'error');
      return;
    }

    setLoadingExtract(true);
    setHighlightedNodeIds([]);
    setChatHistory([]);

    try {
      const response = await fetch('/api/mvp/day1/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          provider: aiProvider,
          apiKey,
          geminiKey
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to extract graph');
      }

      const data = await response.json();
      
      if (!data.nodes || data.nodes.length === 0) {
        showToast(isKo ? '추출된 노드가 없습니다. 텍스트를 자세히 적어주세요.' : 'No nodes extracted. Please write a longer story.', 'error');
      } else {
        setGraphData(data);
        showToast(isKo ? '지식 그래프 추출 성공! 🧠' : 'Knowledge graph extracted successfully! 🧠', 'success');
        
        // Auto-welcome message
        setChatHistory([
          {
            role: 'assistant',
            content: isKo 
              ? '텍스트 분석이 완료되었습니다! 시각화된 그래프를 바탕으로 질문해 주세요. (예: "김선우는 언제 카카오에서 나왔나요?")'
              : 'Analysis complete! Ask me questions about the temporal relationships in the graph. (e.g. "When did Sinae leave Google?")'
          }
        ]);
      }
    } catch (error) {
      console.error(error);
      showToast(error.message || 'API Error', 'error');
    } finally {
      setLoadingExtract(false);
    }
  };

  // Chat Query Graph
  const handleSendQuery = async (e) => {
    if (e) e.preventDefault();
    if (!queryText.trim()) return;
    if (!graphData.nodes || graphData.nodes.length === 0) {
      showToast(isKo ? '지식 그래프를 먼저 추출해 주세요.' : 'Please extract the knowledge graph first.', 'error');
      return;
    }

    const currentQuery = queryText;
    setQueryText('');
    setChatHistory(prev => [...prev, { role: 'user', content: currentQuery }]);
    setLoadingQuery(true);

    try {
      const response = await fetch('/api/mvp/day1/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: currentQuery,
          graph: graphData,
          provider: aiProvider,
          apiKey,
          geminiKey
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to query graph');
      }

      const data = await response.json();
      
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.answer }]);
      
      if (data.highlightedNodeIds && data.highlightedNodeIds.length > 0) {
        setHighlightedNodeIds(data.highlightedNodeIds);
      }
    } catch (error) {
      console.error(error);
      showToast(error.message || 'API Error', 'error');
    } finally {
      setLoadingQuery(false);
    }
  };

  return (
    <div className="flex-1 bg-[var(--bg-color)] overflow-hidden w-full h-full flex flex-col p-6 font-sans">
      
      {/* Premium Glassmorphic Header */}
      <header className="mb-6 flex items-center justify-between bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-lg">
            <Brain size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-extrabold tracking-widest px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400">DAY 1 MVP</span>
              <h2 className="text-[17px] font-bold text-[var(--text-primary)] tracking-tight">Temporal Knowledge Graph Explorer</h2>
            </div>
            <p className="text-[var(--text-secondary)] text-[12px] mt-0.5">
              {isKo 
                ? '입력된 텍스트를 시간에 따른 지식 그래프로 변환하고, 관련 맥락을 추론하여 실시간 대화합니다.'
                : 'Transforms texts into temporal knowledge graphs and reasons over events and shifting relations.'}
            </p>
          </div>
        </div>

        {/* Selected Provider Status Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-[var(--text-secondary)]">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          <span className="font-semibold uppercase tracking-wider">{aiProvider} Mode</span>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-hidden">
        
        {/* Column 1: Text Input (Span 3) */}
        <div className="lg:col-span-3 flex flex-col bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-5 gap-4 min-h-0 overflow-hidden">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-color)]">
            <FileText size={16} className="text-violet-400" />
            <h3 className="text-[13px] font-bold text-white uppercase tracking-wider">Source Material</h3>
          </div>
          
          <div className="flex-1 flex flex-col min-h-0">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isKo ? '여기에 시간 순서가 포함된 스토리를 적어보세요...' : 'Write or paste a story with dates or sequence of events...'}
              className="w-full flex-1 bg-black/30 border border-[var(--border-color)] hover:border-white/10 rounded-xl p-4 text-[13px] text-white/90 leading-relaxed outline-none focus:border-violet-500/50 transition-all resize-none custom-scrollbar"
            />
          </div>

          <button
            onClick={handleExtract}
            disabled={loadingExtract}
            className="w-full py-3.5 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg disabled:opacity-50 transition-all cursor-pointer select-none"
          >
            {loadingExtract ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{isKo ? '지식 추출 중...' : 'Extracting...'}</span>
              </>
            ) : (
              <>
                <RefreshCw size={14} />
                <span>{isKo ? '지식 그래프 추출' : 'Extract Knowledge Graph'}</span>
              </>
            )}
          </button>
        </div>

        {/* Column 2: ForceGraph Canvas Visualizer (Span 5) */}
        <div className="lg:col-span-5 flex flex-col relative bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-5 gap-4 min-h-0">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-2">
              <Database size={16} className="text-cyan-400" />
              <h3 className="text-[13px] font-bold text-white uppercase tracking-wider">Dynamic Memory Graph</h3>
            </div>
            {graphData.nodes.length > 0 && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/60">
                {graphData.nodes.length} Nodes • {graphData.links.length} Links
              </span>
            )}
          </div>
          
          <div className="flex-1 min-h-0 relative">
            {graphData.nodes.length > 0 ? (
              <ForceGraph graphData={graphData} highlightedNodeIds={highlightedNodeIds} />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-white/20 mb-4 animate-pulse">
                  <Database size={28} />
                </div>
                <h4 className="text-[14px] font-bold text-white/60 mb-1">
                  {isKo ? '대기 중인 지식 네트워크' : 'Knowledge Network Awaiting Data'}
                </h4>
                <p className="text-[12px] text-white/30 max-w-xs leading-relaxed">
                  {isKo 
                    ? '왼쪽 패널에 텍스트를 붙여넣고 지식 그래프 추출을 시작하면 여기에 실시간 물리 시각화가 그려집니다.'
                    : 'Paste a story on the left and click Extract to generate an interactive physics-directed graph.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Chat Assistant Panel (Span 4) */}
        <div className="lg:col-span-4 flex flex-col bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-5 gap-4 min-h-0 overflow-hidden">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-color)]">
            <Sparkles size={16} className="text-indigo-400" />
            <h3 className="text-[13px] font-bold text-white uppercase tracking-wider">Temporal QA Assistant</h3>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar min-h-0 p-1">
            {chatHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <Sparkles size={24} className="text-white/10 mb-2" />
                <p className="text-[11px] text-white/30 max-w-xs">
                  {isKo 
                    ? '지식 그래프를 추출하면 AI 에이전트와 관계 지식을 탐구할 수 있는 채팅이 활성화됩니다.'
                    : 'Extract the knowledge graph first to enable chatbot reasoning.'}
                </p>
              </div>
            ) : (
              chatHistory.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[9px] font-bold tracking-wider text-white/30 uppercase">
                    {msg.role === 'user' ? (isKo ? '나' : 'User') : (isKo ? 'AI 에이전트' : 'AI Agent')}
                  </span>
                  <div 
                    className={`max-w-[90%] p-3.5 rounded-2xl text-[12.5px] leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {loadingQuery && (
              <div className="flex items-center gap-2 text-white/40 text-[11px] font-medium pl-1 animate-pulse">
                <Loader2 size={12} className="animate-spin text-indigo-400" />
                <span>{isKo ? '답변을 생성하며 지식을 매색하는 중...' : 'Reasoning over graph database...'}</span>
              </div>
            )}
          </div>

          {/* Chat Form Input */}
          <form onSubmit={handleSendQuery} className="flex gap-2">
            <input
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder={isKo ? '예: 김선우가 퇴사한 일자와 설립한 회사는?' : 'e.g. When did Sinae leave Google and what did she build?'}
              disabled={loadingQuery || graphData.nodes.length === 0}
              className="flex-1 bg-black/30 border border-[var(--border-color)] hover:border-white/10 focus:border-indigo-500/50 rounded-xl px-4 py-3.5 text-[13px] text-white/90 outline-none transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loadingQuery || !queryText.trim() || graphData.nodes.length === 0}
              className="w-12 h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center disabled:opacity-40 transition-all cursor-pointer"
            >
              <Send size={16} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
