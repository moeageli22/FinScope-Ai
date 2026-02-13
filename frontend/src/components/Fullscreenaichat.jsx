// src/components/FullscreenAIChat.jsx
// Full-page AI chat modal + AI Insights Dashboard for Practice Mode

import React, { useState, useEffect, useRef } from 'react';
import { sendMessage } from '../services/claudeAI.js';

/* ═══════════════════════════════════════════
   FULLSCREEN AI CHAT MODAL
   ═══════════════════════════════════════════ */
const FullscreenAIChat = ({ open, onClose, transactions, balance, totalSpent, startingBalance }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatRef = useRef(null);
    const inputRef = useRef(null);

    // Initialize with welcome message
    useEffect(() => {
        if (open && messages.length === 0) {
            const hasData = transactions.length > 0;
            const welcome = hasData
                ? `Hey there! 👋 I can see you've made ${transactions.length} transaction${transactions.length !== 1 ? 's' : ''} totaling $${totalSpent.toFixed(2)}. Ask me anything about your spending — I can analyze patterns, suggest savings, or give you a full financial breakdown!`
                : `Hey there! 👋 I'm your AI financial assistant powered by Claude. Start adding some expenses in Practice Mode, then come chat with me for personalized insights and money-saving tips!`;
            setMessages([{ id: 1, role: 'ai', text: welcome }]);
        }
    }, [open]);

    // Auto-scroll on new messages
    useEffect(() => {
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, [messages, isTyping]);

    // Focus input when opened
    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 300);
    }, [open]);

    // Escape to close
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        if (open) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [open, onClose]);

    const handleSend = async (text) => {
        if (!text?.trim() || isTyping) return;
        const msg = text.trim();
        setInput('');
        setMessages(p => [...p, { id: Date.now(), role: 'user', text: msg }]);
        setIsTyping(true);

        try {
            const sessionData = { transactions, balance, totalSpent, startingBalance };
            const response = await sendMessage(msg, sessionData);
            setMessages(p => [...p, { id: Date.now() + 1, role: 'ai', text: response }]);
        } catch (err) {
            setMessages(p => [...p, { id: Date.now() + 1, role: 'ai', text: '⚠️ Something went wrong. Please check your API key in .env and try again.' }]);
        }
        setIsTyping(false);
    };

    const suggestions = [
        { emoji: '📊', label: 'Full spending analysis', prompt: 'Give me a detailed analysis of all my spending. What patterns do you see? What should I change?' },
        { emoji: '💰', label: 'How to save money', prompt: 'Based on my actual spending, give me 3 specific and actionable tips to save money.' },
        { emoji: '📋', label: 'Budget breakdown', prompt: 'Compare my spending to the 50/30/20 budget rule. How am I doing in each category?' },
        { emoji: '⚠️', label: 'Red flags', prompt: 'Are there any spending red flags or areas where I\'m overspending? Be specific.' },
        { emoji: '🎯', label: 'Savings goal plan', prompt: 'Help me create a realistic savings goal based on my current spending habits.' },
        { emoji: '🧠', label: 'Financial habits', prompt: 'What financial habits should I build or break based on my spending data?' },
    ];

    if (!open) return null;

    return (
        <div className="fsc-overlay" onClick={onClose}>
            <div className="fsc-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="fsc-header">
                    <div className="fsc-header-left">
                        <div className="fsc-orb">
                            <div className="fsc-orb-eyes">
                                <div className="fsc-eye" />
                                <div className="fsc-eye" />
                            </div>
                        </div>
                        <div>
                            <h2 className="fsc-title">FinScope AI</h2>
                            <span className="fsc-subtitle">Your personal finance assistant</span>
                        </div>
                        <span className="fsc-live-badge">
                            <span className="fsc-live-dot" />
                            LIVE AI
                        </span>
                    </div>
                    <button className="fsc-close" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Stats bar */}
                {transactions.length > 0 && (
                    <div className="fsc-stats-bar">
                        <div className="fsc-stat"><span className="fsc-stat-label">Balance</span><span className="fsc-stat-val">${balance.toFixed(2)}</span></div>
                        <div className="fsc-stat-sep" />
                        <div className="fsc-stat"><span className="fsc-stat-label">Spent</span><span className="fsc-stat-val fsc-stat-red">${totalSpent.toFixed(2)}</span></div>
                        <div className="fsc-stat-sep" />
                        <div className="fsc-stat"><span className="fsc-stat-label">Transactions</span><span className="fsc-stat-val">{transactions.length}</span></div>
                        <div className="fsc-stat-sep" />
                        <div className="fsc-stat"><span className="fsc-stat-label">Budget Used</span><span className="fsc-stat-val">{startingBalance > 0 ? ((totalSpent / startingBalance) * 100).toFixed(0) : 0}%</span></div>
                    </div>
                )}

                {/* Messages */}
                <div className="fsc-messages" ref={chatRef}>
                    {messages.map(m => (
                        <div key={m.id} className={`fsc-msg ${m.role}`}>
                            {m.role === 'ai' && (
                                <div className="fsc-msg-orb">
                                    <div className="fsc-orb sm">
                                        <div className="fsc-orb-eyes"><div className="fsc-eye" /><div className="fsc-eye" /></div>
                                    </div>
                                </div>
                            )}
                            <div className={`fsc-bubble ${m.role}`}>
                                {m.text.split('\n').map((line, i) => (
                                    <span key={i}>{line}<br /></span>
                                ))}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="fsc-msg ai">
                            <div className="fsc-msg-orb">
                                <div className="fsc-orb sm"><div className="fsc-orb-eyes"><div className="fsc-eye" /><div className="fsc-eye" /></div></div>
                            </div>
                            <div className="fsc-bubble ai fsc-typing">
                                <span className="fsc-dot" /><span className="fsc-dot" /><span className="fsc-dot" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Suggestions */}
                {messages.length <= 2 && (
                    <div className="fsc-suggestions">
                        {suggestions.map((s, i) => (
                            <button key={i} className="fsc-suggestion" onClick={() => handleSend(s.prompt)} disabled={isTyping}>
                                <span className="fsc-sug-emoji">{s.emoji}</span>
                                <span>{s.label}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Input */}
                <div className="fsc-input-area">
                    <input
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend(input)}
                        placeholder="Ask anything about your finances..."
                        disabled={isTyping}
                        className="fsc-input"
                    />
                    <button className="fsc-send-btn" onClick={() => handleSend(input)} disabled={!input.trim() || isTyping}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════
   AI INSIGHTS DASHBOARD
   Auto-generates insights after each expense
   ═══════════════════════════════════════════ */
const AIInsightsDashboard = ({ transactions, balance, totalSpent, startingBalance, onOpenChat }) => {
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastTxnCount, setLastTxnCount] = useState(0);

    // Generate insights when transactions change (every 2 new transactions or first one)
    useEffect(() => {
        const shouldGenerate = transactions.length > 0 &&
            (transactions.length === 1 || transactions.length >= lastTxnCount + 2);

        if (!shouldGenerate) return;

        const generateInsights = async () => {
            setLoading(true);
            setLastTxnCount(transactions.length);
            try {
                const sessionData = { transactions, balance, totalSpent, startingBalance };
                const response = await sendMessage(
                    `Based on my spending data, generate exactly 3 short insights. For each insight, use this format on a separate line:
[emoji] [Title]: [One sentence insight]

Example format:
💡 Smart Saver: You're keeping dining costs under control at only 15% of your budget.
⚠️ Watch Out: Subscription costs are adding up fast at $45.97 total.
🎯 Goal Tip: Try to keep your next purchase under $20 to stay on track.

Be specific with my actual numbers. Keep each insight to ONE short sentence.`,
                    sessionData
                );
                // Parse response into insight cards
                const lines = response.split('\n').filter(l => l.trim().length > 5);
                const parsed = lines.slice(0, 3).map((line, i) => {
                    const emojiMatch = line.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F?)/u);
                    const emoji = emojiMatch ? emojiMatch[0] : ['💡', '⚠️', '🎯'][i];
                    const textPart = line.replace(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F?)\s*/u, '');
                    const colonIdx = textPart.indexOf(':');
                    const title = colonIdx > 0 ? textPart.slice(0, colonIdx).trim() : `Insight ${i + 1}`;
                    const body = colonIdx > 0 ? textPart.slice(colonIdx + 1).trim() : textPart.trim();
                    const type = emoji.includes('⚠') || emoji.includes('🔴') ? 'warning' : emoji.includes('🎯') || emoji.includes('✅') ? 'goal' : 'tip';
                    return { id: Date.now() + i, emoji, title, body, type };
                });
                if (parsed.length > 0) setInsights(parsed);
            } catch (err) {
                // Silently fail — insights are supplemental
                console.log('Insights generation skipped:', err.message);
            }
            setLoading(false);
        };
        generateInsights();
    }, [transactions.length]);

    if (transactions.length === 0 && insights.length === 0) return null;

    return (
        <div className="pm-insights-dash">
            <div className="pm-insights-header">
                <div className="pm-insights-orb">
                    <div className="fsc-orb sm"><div className="fsc-orb-eyes"><div className="fsc-eye" /><div className="fsc-eye" /></div></div>
                </div>
                <div>
                    <h3 className="pm-insights-title">AI Insights</h3>
                    <span className="pm-insights-sub">Powered by Claude</span>
                </div>
                {loading && <span className="pm-insights-loading">Analyzing...</span>}
            </div>

            <div className="pm-insights-cards">
                {insights.length > 0 ? insights.map(ins => (
                    <div key={ins.id} className={`pm-insight-card pm-insight-card--${ins.type}`}>
                        <span className="pm-insight-emoji">{ins.emoji}</span>
                        <div className="pm-insight-text">
                            <span className="pm-insight-title">{ins.title}</span>
                            <span className="pm-insight-body">{ins.body}</span>
                        </div>
                    </div>
                )) : (
                    <div className="pm-insight-card pm-insight-card--tip">
                        <span className="pm-insight-emoji">✨</span>
                        <div className="pm-insight-text">
                            <span className="pm-insight-title">Getting Started</span>
                            <span className="pm-insight-body">Add more expenses and I'll generate personalized financial insights for you.</span>
                        </div>
                    </div>
                )}
            </div>

            <button className="pm-insights-chat-btn" onClick={onOpenChat}>
                <div className="fsc-orb xs"><div className="fsc-orb-eyes"><div className="fsc-eye" /><div className="fsc-eye" /></div></div>
                <span>Chat with AI for deeper insights</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
        </div>
    );
};

export { FullscreenAIChat, AIInsightsDashboard };
export default FullscreenAIChat;