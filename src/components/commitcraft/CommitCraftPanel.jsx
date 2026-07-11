'use client';
import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  Send, 
  Save, 
  RefreshCw, 
  Sparkles, 
  Copy, 
  Check, 
  GitFork, 
  AlertCircle, 
  Bot, 
  MessageSquare, 
  FolderPlus 
} from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import { useDraftStore } from '../../store/useDraftStore';
import { translations } from '../../lib/translations';
import { motion, AnimatePresence } from 'framer-motion';

export const CommitCraftPanel = () => {
  const { 
    lang, 
    showToast,
    commitCraftRepos,
    setCommitCraftRepos,
    commitCraftTelegramChatId,
    setCommitCraftTelegramChatId,
    commitCraftTelegramBotToken,
    setCommitCraftTelegramBotToken,
    commitCraftGithubToken,
    setCommitCraftGithubToken,
    commitCraftLogs,
    setCommitCraftLogs,
    geminiKey,
    apiKey,
    aiProvider,
    localModelPath,
    persona
  } = useUIStore();

  const { addDraft } = useDraftStore();
  const t = translations[lang || 'en'].commitcraft;

  // Local component states
  const [gitRepos, setGitRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [syncingCommits, setSyncingCommits] = useState(false);
  const [generatingPost, setGeneratingPost] = useState(false);
  const [sendingTelegram, setSendingTelegram] = useState(false);
  const [selectedCommits, setSelectedCommits] = useState(new Set());
  
  const [generatedTwitter, setGeneratedTwitter] = useState('');
  const [generatedLinkedin, setGeneratedLinkedin] = useState('');
  const [copiedTwitter, setCopiedTwitter] = useState(false);
  const [copiedLinkedin, setCopiedLinkedin] = useState(false);

  // Load repositories dynamically if token is present
  useEffect(() => {
    const fetchGitHubRepos = async (token) => {
      setLoadingRepos(true);
      try {
        const res = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
          headers: {
            Authorization: `token ${token.trim()}`
          }
        });
        if (!res.ok) {
          throw new Error('Failed to fetch repositories. Check your token.');
        }
        const data = await res.json();
        const repos = data.map(repo => ({
          id: repo.id,
          fullName: repo.full_name,
          name: repo.name,
          owner: repo.owner.login
        }));
        setGitRepos(repos);
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setLoadingRepos(false);
      }
    };

    if (commitCraftGithubToken) {
      fetchGitHubRepos(commitCraftGithubToken);
    }
  }, [commitCraftGithubToken, showToast]);

  const handleSaveConfig = (e) => {
    e.preventDefault();
    showToast(t.toastConfigSaved, 'success');
  };

  const testTelegramBot = async () => {
    if (!commitCraftTelegramBotToken || !commitCraftTelegramChatId) {
      showToast(lang === 'en' ? 'Telegram credentials are required.' : '텔레그램 봇 토큰과 채팅 ID가 필요합니다.', 'error');
      return;
    }
    try {
      const res = await fetch('/api/commitcraft/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: commitCraftTelegramBotToken,
          chatId: commitCraftTelegramChatId,
          message: '📬 <b>CommitCraft Devlog Test Notification</b>\n\nConnection established successfully! Ready to post devlogs.'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Telegram test failed.');
      showToast(t.toastTelegramTest, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const syncCommits = async () => {
    if (!selectedRepo || !commitCraftGithubToken) {
      showToast(lang === 'en' ? 'Select a repository first.' : '레포지토리를 먼저 선택해 주세요.', 'error');
      return;
    }
    setSyncingCommits(true);
    try {
      const res = await fetch(`https://api.github.com/repos/${selectedRepo}/commits?per_page=15`, {
        headers: {
          Authorization: `token ${commitCraftGithubToken.trim()}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch commits.');
      const data = await res.json();
      const parsedCommits = data.map(c => ({
        hash: c.sha,
        message: c.commit.message,
        author: c.commit.author.name,
        date: c.commit.author.date
      }));
      setCommitCraftLogs(parsedCommits);
      setSelectedCommits(new Set(parsedCommits.map(c => c.hash))); // Select all by default
      showToast(t.toastSyncSuccess, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSyncingCommits(false);
    }
  };

  const handleToggleCommit = (hash) => {
    const next = new Set(selectedCommits);
    if (next.has(hash)) {
      next.delete(hash);
    } else {
      next.add(hash);
    }
    setSelectedCommits(next);
  };

  const generateSocialPost = async () => {
    const activeCommits = commitCraftLogs.filter(c => selectedCommits.has(c.hash));
    if (activeCommits.length === 0) {
      showToast(lang === 'en' ? 'Select at least one commit.' : '최소 하나의 커밋을 선택해야 합니다.', 'error');
      return;
    }

    setGeneratingPost(true);
    try {
      const res = await fetch('/api/commitcraft/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commits: activeCommits,
          repoName: selectedRepo,
          provider: aiProvider,
          apiKey: apiKey,
          geminiKey: geminiKey,
          localModelPath: localModelPath,
          persona: persona
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Generation failed.');
      
      setGeneratedTwitter(data.twitter);
      setGeneratedLinkedin(data.linkedin);
      showToast(t.toastPostGenerated, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setGeneratingPost(false);
    }
  };

  const sendDraftToTelegram = async (content) => {
    if (!commitCraftTelegramBotToken || !commitCraftTelegramChatId) {
      showToast(lang === 'en' ? 'Configure Telegram first.' : '텔레그램 연동 설정을 먼저 완료해 주세요.', 'error');
      return;
    }
    setSendingTelegram(true);
    try {
      const formattedMessage = `🚀 <b>CommitCraft Devlog Draft</b>\n\n${content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}`;
      const res = await fetch('/api/commitcraft/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: commitCraftTelegramBotToken,
          chatId: commitCraftTelegramChatId,
          message: formattedMessage
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to send to Telegram.');
      showToast(lang === 'en' ? 'Draft sent to Telegram bot!' : '텔레그램 봇으로 초안이 전송되었습니다!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSendingTelegram(false);
    }
  };

  const handleCopyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'twitter') {
      setCopiedTwitter(true);
      setTimeout(() => setCopiedTwitter(false), 2000);
    } else {
      setCopiedLinkedin(true);
      setTimeout(() => setCopiedLinkedin(false), 2000);
    }
    showToast(translations[lang || 'en'].preview.toastCopied, 'success');
  };

  const handleSaveToDrafts = (text, snsType) => {
    // Save to the main postify-ai local drafts panel
    addDraft({
      koreanText: `[CommitCraft] Generated post for ${selectedRepo} (${snsType.toUpperCase()})`,
      englishText: text
    });
    showToast(translations[lang || 'en'].drafts.toastDraftSaved, 'success');
  };

  return (
    <div className="flex-1 bg-[var(--bg-panel)] overflow-y-auto p-8 custom-scrollbar w-full h-full">
      <div className="max-w-[1200px] mx-auto w-full">
        
        {/* Header */}
        <header className="mb-8 pb-6 border-b border-[var(--border-color)]">
          <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2 tracking-tight flex items-center gap-2">
            <GitBranch className="text-[var(--accent-color)]" size={32} />
            {t.title}
          </h2>
          <p className="text-[var(--text-secondary)] text-[14px]">{t.subtitle}</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Configurations */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Git Repository Integration */}
            <form onSubmit={handleSaveConfig} className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
                <GitFork size={20} />
                <span>{t.connectRepo}</span>
              </div>

              <div className="flex flex-col gap-3">
                <input 
                  type="password"
                  placeholder={t.tokenPlaceholder}
                  value={commitCraftGithubToken}
                  onChange={(e) => setCommitCraftGithubToken(e.target.value)}
                  className="w-full bg-[rgba(0,0,0,0.3)] border border-[var(--border-color)] rounded-xl p-3 text-[14px] font-mono text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)] transition-all"
                />

                <div className="relative">
                  <select
                    value={selectedRepo}
                    onChange={(e) => setSelectedRepo(e.target.value)}
                    disabled={loadingRepos || gitRepos.length === 0}
                    className="w-full bg-[rgba(0,0,0,0.3)] border border-[var(--border-color)] rounded-xl p-3 text-[14px] text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)] transition-all disabled:opacity-50 appearance-none"
                  >
                    <option value="" disabled>{gitRepos.length === 0 ? t.noCommits : t.selectRepoPlaceholder}</option>
                    {gitRepos.map(repo => (
                      <option key={repo.id} value={repo.fullName}>{repo.fullName}</option>
                    ))}
                  </select>
                  {loadingRepos && (
                    <div className="absolute right-3 top-3.5">
                      <RefreshCw className="animate-spin text-[var(--text-secondary)]" size={16} />
                    </div>
                  )}
                </div>
              </div>
            </form>

            {/* Telegram Integration */}
            <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
                <Bot size={20} />
                <span>{t.telegramConfig}</span>
              </div>

              <div className="flex flex-col gap-3">
                <input 
                  type="password"
                  placeholder={t.botToken}
                  value={commitCraftTelegramBotToken}
                  onChange={(e) => setCommitCraftTelegramBotToken(e.target.value)}
                  className="w-full bg-[rgba(0,0,0,0.3)] border border-[var(--border-color)] rounded-xl p-3 text-[14px] font-mono text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)] transition-all"
                />
                
                <input 
                  type="text"
                  placeholder={t.chatId}
                  value={commitCraftTelegramChatId}
                  onChange={(e) => setCommitCraftTelegramChatId(e.target.value)}
                  className="w-full bg-[rgba(0,0,0,0.3)] border border-[var(--border-color)] rounded-xl p-3 text-[14px] font-mono text-[var(--text-primary)] outline-none focus:border-[var(--text-primary)] transition-all"
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={testTelegramBot}
                    className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] hover:border-[var(--text-secondary)] transition-all text-[13px] text-[var(--text-secondary)] flex items-center justify-center gap-1.5 font-medium"
                  >
                    <Send size={14} />
                    {t.testBot}
                  </button>
                </div>
              </div>
            </div>

            {/* Config Info */}
            <div className="flex items-start gap-2 bg-[rgba(255,255,255,0.02)] p-4 rounded-xl border border-[var(--border-color)]">
              <AlertCircle size={16} className="text-[var(--text-secondary)] mt-0.5 flex-shrink-0" />
              <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
                {lang === 'en' ? 
                  "Input GitHub Token and select a repo to fetch commits. These credentials are saved securely inside your browser's LocalStorage." : 
                  "GitHub 토큰을 입력하고 레포지토리를 선택하면 최근 커밋 내역을 분석할 수 있습니다. 저장 정보는 브라우저의 로컬 스토리지에 안전하게 기록됩니다."}
              </p>
            </div>

          </div>

          {/* Right Column: Commits Sync and Generated Results */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Sync Controls & Commits List */}
            <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[var(--text-primary)]">{t.recentCommits}</span>
                <button
                  type="button"
                  onClick={syncCommits}
                  disabled={syncingCommits || !selectedRepo}
                  className="px-4 py-2 bg-[var(--text-primary)] text-[var(--bg-color)] rounded-xl text-[13px] font-semibold flex items-center gap-1.5 disabled:opacity-50 transition-opacity"
                >
                  <RefreshCw className={syncingCommits ? 'animate-spin' : ''} size={14} />
                  {t.syncCommits}
                </button>
              </div>

              <div className="max-h-[220px] overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-2">
                {commitCraftLogs.length === 0 ? (
                  <div className="text-center py-10 text-[var(--text-secondary)] text-[13px]">
                    {t.noCommits}
                  </div>
                ) : (
                  commitCraftLogs.map(commit => (
                    <label 
                      key={commit.hash}
                      className="flex items-center gap-3 p-3 bg-black/20 hover:bg-black/30 border border-[var(--border-color)] rounded-xl cursor-pointer transition-colors"
                    >
                      <input 
                        type="checkbox"
                        checked={selectedCommits.has(commit.hash)}
                        onChange={() => handleToggleCommit(commit.hash)}
                        className="rounded border-[var(--border-color)] text-[var(--accent-color)] focus:ring-[var(--accent-color)] w-4 h-4"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-[var(--text-primary)] font-medium truncate">{commit.message}</p>
                        <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                          {commit.hash.substring(0, 7)} • {commit.author} • {new Date(commit.date).toLocaleDateString()}
                        </p>
                      </div>
                    </label>
                  ))
                )}
              </div>

              {commitCraftLogs.length > 0 && (
                <button
                  type="button"
                  onClick={generateSocialPost}
                  disabled={generatingPost}
                  className="w-full py-3 bg-[var(--accent-color)] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity text-[14px]"
                >
                  <Sparkles size={16} />
                  {generatingPost ? (lang === 'en' ? 'Generating...' : '생성 중...') : t.generatePost}
                </button>
              )}
            </div>

            {/* Generated Results Panel */}
            <AnimatePresence>
              {(generatedTwitter || generatedLinkedin) && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="flex flex-col gap-6"
                >
                  {/* Twitter / X Post */}
                  {generatedTwitter && (
                    <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                      <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
                        <span className="font-bold text-[var(--text-primary)] text-[15px]">X (Twitter) Version</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyToClipboard(generatedTwitter, 'twitter')}
                            className="p-2 hover:bg-white/5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                            title="Copy to clipboard"
                          >
                            {copiedTwitter ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                          </button>
                          <button
                            onClick={() => sendDraftToTelegram(generatedTwitter)}
                            disabled={sendingTelegram}
                            className="p-2 hover:bg-white/5 rounded-lg text-[var(--text-secondary)] hover:text-sky-400 transition-colors"
                            title="Send to Telegram bot"
                          >
                            <Send size={16} />
                          </button>
                          <button
                            onClick={() => handleSaveToDrafts(generatedTwitter, 'x')}
                            className="p-2 hover:bg-white/5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors"
                            title="Save to Drafts Folder"
                          >
                            <FolderPlus size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="p-4 bg-black/35 border border-[var(--border-color)] rounded-xl font-mono text-[13px] text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                        {generatedTwitter}
                      </div>
                      <div className="flex justify-end text-[11px] text-[var(--text-secondary)]">
                        {generatedTwitter.length} / 280 characters
                      </div>
                    </div>
                  )}

                  {/* LinkedIn Post */}
                  {generatedLinkedin && (
                    <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                      <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
                        <span className="font-bold text-[var(--text-primary)] text-[15px]">LinkedIn Version</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyToClipboard(generatedLinkedin, 'linkedin')}
                            className="p-2 hover:bg-white/5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                            title="Copy to clipboard"
                          >
                            {copiedLinkedin ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                          </button>
                          <button
                            onClick={() => sendDraftToTelegram(generatedLinkedin)}
                            disabled={sendingTelegram}
                            className="p-2 hover:bg-white/5 rounded-lg text-[var(--text-secondary)] hover:text-sky-400 transition-colors"
                            title="Send to Telegram bot"
                          >
                            <Send size={16} />
                          </button>
                          <button
                            onClick={() => handleSaveToDrafts(generatedLinkedin, 'linkedin')}
                            className="p-2 hover:bg-white/5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors"
                            title="Save to Drafts Folder"
                          >
                            <FolderPlus size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="p-4 bg-black/35 border border-[var(--border-color)] rounded-xl text-[14px] text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                        {generatedLinkedin}
                      </div>
                    </div>
                  )}

                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>

      </div>
    </div>
  );
};
