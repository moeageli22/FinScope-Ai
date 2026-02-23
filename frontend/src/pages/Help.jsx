import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FinScopeAI from '../components/FinScopeAI.jsx';
import './Help.css';

const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY;

const HELP_SYSTEM_PROMPT = `You are FinScope AI, the friendly support assistant for the FinScope AI financial management app. Answer user questions helpfully and concisely.

FinScope AI features include:
- Dashboard with balance tracking, deposits/withdrawals (max $15M per deposit), and currency conversion (150+ currencies with live rates updated every 4s)
- Expense tracking: brand grid (Spotify, Netflix, Amazon, Uber, Starbucks, etc.) and custom expenses with categories (Groceries, Shopping, Dining, Transport, Bills, Subscriptions, Health, Entertainment, Education, Other)
- Analytics tab: Spending Trend chart, Category donut chart, Monthly Comparison
- Smart Analytics page (/analytics): Day x Hour heatmap, Monthly calendar heatmap, Spending DNA radar chart (8 axes: Needs/Diversity/Consistency/Lifestyle/Savings/Frequency/Control/Value), 14-day velocity chart, Anomaly detection (Z-score greater than 1.5), AI Deep Analysis (4 types)
- Statements tab: download CSV or PDF bank-style statements by month/year
- Practice Mode (/practice): virtual sandbox with chosen starting balance (1k/5k/10k), session-only data, built-in Mini AI Chat
- AI Chat (fullscreen): powered by Claude Haiku, has full context of user transactions/balance
- Currency picker on balance card: stored in USD, converted live; up/down arrows show rate direction
- Erase All Data: available in User Menu and hamburger menu, requires typing "delete" to confirm
- Tutorial: accessible from header button, per-user completion tracking

Keep responses under 3 sentences for simple questions. Use a warm, helpful tone with occasional emojis. If unsure, suggest checking the relevant dashboard tab.`;

const faqs = [
    {
        category: 'Dashboard & Balance',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
        color: '#3b82f6',
        questions: [
            { q: 'How do I deposit or withdraw money?', a: 'On the Dashboard, click the "Deposit" or "Withdraw" buttons on your balance card. Deposits support up to $15,000,000 per transaction. Withdrawals cannot exceed your current balance. You can use preset amounts or enter a custom value.' },
            { q: 'Why does my balance show in a different currency?', a: "Your balance is stored in USD. If you've selected a different currency using the currency picker on the balance card, your balance converts in real-time using live exchange rates updated every 4 seconds. The arrows show rate direction changes." },
            { q: 'What does the savings percentage mean?', a: "Savings % = (Total Income − Total Expenses) ÷ Total Income × 100. It shows how much of your deposited money you've kept. A higher percentage means you're spending less of what you bring in." },
        ],
    },
    {
        category: 'Adding & Tracking Expenses',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
        color: '#06b6d4',
        questions: [
            { q: 'How do I add a brand expense like Spotify or Netflix?', a: "Go to Dashboard → Add Expenses tab. You'll see a brand grid grouped by category tabs. Enter the amount next to the brand and hit the + button or press Enter." },
            { q: "What if the expense I want isn't in the brand list?", a: 'Scroll down past the brand grid to the "Add Custom Expense" form. Enter a name, amount, and pick a category from the pill selector — Groceries, Shopping, Dining, Transport, Bills, Health, Entertainment, Education, or Other.' },
            { q: 'Can I delete a transaction I added by mistake?', a: 'Individual deletion isn\'t currently in the UI. You can erase all data via User Menu → "Erase All Data" which resets your balance and all transactions. This requires typing "delete" to confirm and is permanent.' },
        ],
    },
    {
        category: 'Analytics & Charts',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
        color: '#8b5cf6',
        questions: [
            { q: 'What does the Spending Trend chart show?', a: 'The chart plots your cumulative expenses over time. Each point is a transaction — hovering shows the name, amount, and running total. Stats above show total spent, average per transaction, and your largest single expense.' },
            { q: 'What is Smart Analytics and how is it different from the Dashboard?', a: 'Smart Analytics (/analytics) is the AI intelligence layer. It shows a Day × Hour heatmap, monthly calendar, Spending DNA radar chart (8 behavioral axes), a 14-day velocity chart, anomaly detection, and Claude AI deep analysis with 4 analysis types.' },
            { q: 'How does anomaly detection work?', a: 'The detector calculates the average and standard deviation per spending category. Any transaction with a Z-score above 1.5 is flagged as unusual — for example, if you normally spend $6 on coffee but charged $40.' },
        ],
    },
    {
        category: 'Statements & Reports',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>,
        color: '#10b981',
        questions: [
            { q: 'How do I download a statement?', a: 'Go to Dashboard → Statements tab. Select a month and year, then click "CSV" for a spreadsheet or "PDF" for a formatted bank-style statement generated with jsPDF + html2canvas.' },
            { q: 'What does the PDF statement include?', a: 'Opening and closing balance, total deposits and withdrawals, a full transaction table with running balance, and a category spending breakdown — styled like a real bank statement.' },
            { q: 'Why is the Download button greyed out?', a: "CSV and PDF buttons disable when there are no transactions in the selected month. Switch to a month where you've logged transactions and the buttons will activate." },
        ],
    },
    {
        category: 'Live Exchange & Currency',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
        color: '#f59e0b',
        questions: [
            { q: 'How do I change my display currency?', a: 'On the balance card, click the currency flag/code button. A searchable dropdown lists 150+ currencies — select any and your balance, income, and expenses display in that currency using live rates. Data is always stored in USD.' },
            { q: 'Where can I see live exchange rates?', a: "Click \"View today's rates\" below your balance card, or navigate to Live Exchange from the home page nav. Rates refresh every 10 minutes with micro-fluctuations every 4 seconds." },
        ],
    },
    {
        category: 'Practice Mode',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
        color: '#a855f7',
        questions: [
            { q: 'What is Practice Mode?', a: 'Practice Mode (/practice) is a sandbox with virtual money — no real data is affected. Choose a starting balance ($1k / $5k / $10k), add simulated expenses, and use the AI assistant. Data is session-only and clears when you leave.' },
            { q: 'Can I use the AI assistant in Practice Mode?', a: "Yes! Practice Mode has a built-in Mini AI Chat powered by Claude. Quick-action buttons appear after your first transaction, and there's also a full-screen AI Chat button." },
        ],
    },
    {
        category: 'AI Assistant',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
        color: '#ec4899',
        questions: [
            { q: 'What can I ask the AI assistant?', a: 'The AI has full context of your transactions, balance, income, and expenses. Ask things like "Where am I overspending?", "How can I save more?", "Forecast my spending", or "What\'s my biggest category?" — Claude gives personalized, data-backed answers.' },
            { q: "The AI chat isn't responding — what should I check?", a: "AI features require a valid Claude API key set as VITE_CLAUDE_API_KEY in your .env file. A 429 error means you've hit the rate limit — wait a moment and try again." },
        ],
    },
];

/* ── Mini FinScope Orb (lightweight, no orbit icons) ── */
const MiniOrb = () => (
    <div className="help-mini-orb">
        <div className="help-mini-orb-inner">
            <div className="help-mini-eye" />
            <div className="help-mini-eye" />
        </div>
        <div className="help-mini-orb-shine" />
    </div>
);

/* ── AI Chat ── */
const HelpAIChat = () => {
    const [messages, setMessages] = useState([
        { role: 'ai', text: "Hi! I'm FinScope AI 👋 Ask me anything about the app — deposits, analytics, statements, Practice Mode, or any feature you need help with." }
    ]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const chatHistoryRef = useRef([]);

    // Scroll only the chat container, not the whole page
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }, [messages, typing]);

    const sendMsg = async (text) => {
        if (!text.trim() || typing) return;
        setInput('');

        setMessages(prev => [...prev, { role: 'user', text }]);
        chatHistoryRef.current = [...chatHistoryRef.current, { role: 'user', content: text }];
        setTyping(true);

        try {
            if (!CLAUDE_API_KEY || CLAUDE_API_KEY === 'your-api-key-here') throw new Error('NO_KEY');

            const res = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': CLAUDE_API_KEY,
                    'anthropic-version': '2023-06-01',
                    'anthropic-dangerous-direct-browser-access': 'true',
                },
                body: JSON.stringify({
                    model: 'claude-haiku-4-5-20251001',
                    max_tokens: 400,
                    system: HELP_SYSTEM_PROMPT,
                    messages: chatHistoryRef.current,
                }),
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const reply = data.content?.filter(b => b.type === 'text').map(b => b.text).join('\n')
                || "I couldn't generate a response. Try again!";

            chatHistoryRef.current = [...chatHistoryRef.current, { role: 'assistant', content: reply }];
            setMessages(prev => [...prev, { role: 'ai', text: reply }]);
        } catch (err) {
            const fallback = err.message === 'NO_KEY'
                ? "AI chat needs a VITE_CLAUDE_API_KEY in your .env file. Browse the FAQ below for answers in the meantime!"
                : "Couldn't reach the AI right now. Check your API key in .env or try again in a moment.";
            setMessages(prev => [...prev, { role: 'ai', text: fallback }]);
        }
        setTyping(false);
    };

    const quickQuestions = [
        "How do I deposit money?",
        "What is Practice Mode?",
        "How do I download a statement?",
        "What is Spending DNA?",
    ];

    return (
        <div className="help-ai-section">
            <div className="help-ai-header">
                <div className="help-ai-orb-wrap">
                    <div className="help-ai-orb-scale">
                        <FinScopeAI />
                    </div>
                </div>
                <div>
                    <h2 className="help-ai-title">Ask FinScope AI</h2>
                    <p className="help-ai-subtitle">Powered by Claude · get instant answers</p>
                </div>
                <div className="help-ai-live-badge">
                    <span className="help-ai-live-dot" />
                    LIVE AI
                </div>
            </div>

            <div className="help-chat-window">
                {/* Attach ref to the scrollable container, not the end sentinel */}
                <div className="help-chat-messages" ref={messagesContainerRef}>
                    {messages.map((msg, i) => (
                        <div key={i} className={`help-chat-msg help-chat-msg--${msg.role}`}>
                            {msg.role === 'ai' && <MiniOrb />}
                            <div className={`help-chat-bubble help-chat-bubble--${msg.role}`}>
                                {msg.text.split('\n').map((line, j) => (
                                    <span key={j}>
                                        {line.split(/(\*\*.*?\*\*)/).map((part, k) =>
                                            part.startsWith('**') && part.endsWith('**')
                                                ? <strong key={k}>{part.slice(2, -2)}</strong>
                                                : part
                                        )}
                                        {j < msg.text.split('\n').length - 1 && <br />}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                    {typing && (
                        <div className="help-chat-msg help-chat-msg--ai">
                            <MiniOrb />
                            <div className="help-chat-bubble help-chat-bubble--ai help-chat-typing">
                                <span className="help-typing-dot" />
                                <span className="help-typing-dot" />
                                <span className="help-typing-dot" />
                            </div>
                        </div>
                    )}
                    {/* Invisible anchor at the bottom — no longer used for scrollIntoView */}
                    <div ref={messagesEndRef} />
                </div>

                {messages.length <= 1 && (
                    <div className="help-quick-btns">
                        {quickQuestions.map((q, i) => (
                            <button key={i} className="help-quick-btn" onClick={() => sendMsg(q)}>
                                {q}
                            </button>
                        ))}
                    </div>
                )}

                <div className="help-chat-input-row">
                    <input
                        className="help-chat-input"
                        placeholder="Ask about any feature…"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendMsg(input)}
                        disabled={typing}
                    />
                    <button
                        className="help-chat-send"
                        onClick={() => sendMsg(input)}
                        disabled={!input.trim() || typing}
                        aria-label="Send message"
                    >
                        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
                            <line x1="22" y1="2" x2="11" y2="13"/>
                            <polygon points="22 2 15 22 11 13 2 9 22 2" fill="currentColor" stroke="none"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ── Main ── */
export default function Help() {
    const navigate = useNavigate();
    const [openFaq, setOpenFaq] = useState(null);
    const [search, setSearch] = useState('');

    const toggleFaq = (key) => setOpenFaq(openFaq === key ? null : key);

    const filteredFaqs = search.trim()
        ? faqs.map(cat => ({
            ...cat,
            questions: cat.questions.filter(
                q => q.q.toLowerCase().includes(search.toLowerCase()) ||
                    q.a.toLowerCase().includes(search.toLowerCase())
            ),
        })).filter(cat => cat.questions.length > 0)
        : faqs;

    return (
        <div className="help-page">
            <button className="help-back" onClick={() => navigate(-1)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Back
            </button>

            {/* Hero */}
            <div className="help-hero">
                <div className="help-hero-glow"/>
                <div className="help-hero-glow help-hero-glow--right"/>
                <div className="help-hero-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    Help & Support
                </div>
                <h1 className="help-hero-title">How can we help?</h1>
                <p className="help-hero-sub">Chat with FinScope AI or browse the FAQ below.</p>

                <div className="help-search-wrap">
                    <svg className="help-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input
                        className="help-search"
                        placeholder="Search questions, features…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button className="help-search-clear" onClick={() => setSearch('')}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                    )}
                </div>
            </div>

            <div className="help-body">

                {/* AI Chat — top of body */}
                <HelpAIChat />

                {/* FAQ */}
                <section className="help-faq-section">
                    <h2 className="help-section-title">
                        {search ? `Results for "${search}"` : 'Frequently Asked Questions'}
                    </h2>

                    {filteredFaqs.length === 0 && (
                        <div className="help-no-results">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
                                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            </svg>
                            <p>No results for "{search}"</p>
                            <button onClick={() => setSearch('')}>Clear search</button>
                        </div>
                    )}

                    {filteredFaqs.map((cat) => (
                        <div key={cat.category} className="help-faq-group">
                            <div className="help-faq-cat-header" style={{ '--cat-color': cat.color }}>
                                <span className="help-faq-cat-icon">{cat.icon}</span>
                                <span className="help-faq-cat-name">{cat.category}</span>
                            </div>
                            {cat.questions.map((item, qi) => {
                                const key = `${cat.category}-${qi}`;
                                const isOpen = openFaq === key;
                                return (
                                    <div key={key} className={`help-faq-item ${isOpen ? 'open' : ''}`}>
                                        <button className="help-faq-q" onClick={() => toggleFaq(key)}>
                                            <span>{item.q}</span>
                                            <svg className="help-faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                                <polyline points="6 9 12 15 18 9"/>
                                            </svg>
                                        </button>
                                        {isOpen && (
                                            <div className="help-faq-a">
                                                <p>{item.a}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </section>

            </div>
        </div>
    );
}