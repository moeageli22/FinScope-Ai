import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import FinScopeAI from '../components/FinScopeAI';
import UserMenu from '../components/UserMenu.jsx';
import { sendMessage, generateSessionAnalysis } from '../services/claudeAI';
import { FullscreenAIChat, AIInsightsDashboard } from '../components/FullscreenAIchat.jsx';
import './Dashboard-Enhanced.css';
import './PracticeMode.css';
import '../components/FullscreenAIChat.css';

// Import brand logos
import spotifyLogo from '../assets/logos/spotify.png';
import netflixLogo from '../assets/logos/netflix.png';
import coffeeLogo from '../assets/logos/coffee.png';
import electronicsLogo from '../assets/logos/electronics.png';
import amazonLogo from '../assets/logos/amazon.png';
import disneyLogo from '../assets/logos/disneylogo.webp';
import starbucksLogo from '../assets/logos/starbucks.png';
import appleLogo from '../assets/logos/apple.jpg';
import ubereatsLogo from '../assets/logos/uber.webp';
import uberLogo from '../assets/logos/uberr.webp';
import youtubeLogo from '../assets/logos/youtube.jpg';
import nikeLogo from '../assets/logos/nike.webp';

const EXPENSE_ITEMS = [
    { id: 'spotify', name: 'Spotify', logo: spotifyLogo, fallbackEmoji: '🎵', category: 'Subscriptions', placeholder: '9.99' },
    { id: 'netflix', name: 'Netflix', logo: netflixLogo, fallbackEmoji: '🎬', category: 'Subscriptions', placeholder: '15.99' },
    { id: 'disneyplus', name: 'Disney+', logo: disneyLogo, fallbackEmoji: '🏰', category: 'Subscriptions', placeholder: '13.99' },
    { id: 'youtube', name: 'YouTube Premium', logo: youtubeLogo, fallbackEmoji: '▶️', category: 'Subscriptions', placeholder: '13.99' },
    { id: 'apple', name: 'Apple Music / iCloud', logo: appleLogo, fallbackEmoji: '🍎', category: 'Subscriptions', placeholder: '10.99' },
    { id: 'gym', name: 'Gym Membership', logo: null, fallbackEmoji: '💪', category: 'Subscriptions', placeholder: '40.00' },
    { id: 'amazon', name: 'Amazon', logo: amazonLogo, fallbackEmoji: '📦', category: 'Shopping', placeholder: '29.99' },
    { id: 'electronics', name: 'Electronics', logo: electronicsLogo, fallbackEmoji: '🖥️', category: 'Shopping', placeholder: '99.99' },
    { id: 'nike', name: 'Nike / Clothing', logo: nikeLogo, fallbackEmoji: '👟', category: 'Shopping', placeholder: '75.00' },
    { id: 'coffee', name: 'Coffee', logo: coffeeLogo, fallbackEmoji: '☕', category: 'Dining', placeholder: '5.50' },
    { id: 'starbucks', name: 'Starbucks', logo: starbucksLogo, fallbackEmoji: '☕', category: 'Dining', placeholder: '6.50' },
    { id: 'ubereats', name: 'Uber Eats', logo: ubereatsLogo, fallbackEmoji: '🍔', category: 'Dining', placeholder: '25.00' },
    { id: 'uber', name: 'Uber / Lyft', logo: uberLogo, fallbackEmoji: '🚗', category: 'Transport', placeholder: '18.00' },
    { id: 'gas', name: 'Gas / Petrol', logo: null, fallbackEmoji: '⛽', category: 'Transport', placeholder: '55.00' },
    { id: 'electricity', name: 'Electricity', logo: null, fallbackEmoji: '⚡', category: 'Bills', placeholder: '95.00' },
    { id: 'internet', name: 'Internet / WiFi', logo: null, fallbackEmoji: '🌐', category: 'Bills', placeholder: '60.00' },
    { id: 'phone', name: 'Phone Bill', logo: null, fallbackEmoji: '📱', category: 'Bills', placeholder: '45.00' },
    { id: 'rent', name: 'Rent / Mortgage', logo: null, fallbackEmoji: '🏠', category: 'Bills', placeholder: '1200.00' },
];

const logoMap = {
    spotify: spotifyLogo, netflix: netflixLogo, coffee: coffeeLogo, electronics: electronicsLogo,
    amazon: amazonLogo, disneyplus: disneyLogo, starbucks: starbucksLogo, apple: appleLogo,
    uber: uberLogo, ubereats: ubereatsLogo, youtube: youtubeLogo, nike: nikeLogo,
};

const CUSTOM_CATEGORIES = [
    { value: 'Groceries', label: 'Groceries', emoji: '🛒' },
    { value: 'Shopping', label: 'Shopping', emoji: '🛍️' },
    { value: 'Dining', label: 'Dining', emoji: '🍽️' },
    { value: 'Transport', label: 'Transport', emoji: '🚗' },
    { value: 'Bills', label: 'Bills', emoji: '⚡' },
    { value: 'Subscriptions', label: 'Subscriptions', emoji: '🎬' },
    { value: 'Health', label: 'Health', emoji: '🏥' },
    { value: 'Entertainment', label: 'Entertainment', emoji: '🎮' },
    { value: 'Education', label: 'Education', emoji: '📚' },
    { value: 'Other', label: 'Other', emoji: '📝' },
];

/* ═══ WELCOME ORB ═══ */
const WelcomeOrb = ({ size = 100 }) => (
    <div className="pm-welcome-orb" style={{ width: size, height: size }}>
        <div className="pm-welcome-orb-inner">
            <div className="pm-welcome-orb-eye" />
            <div className="pm-welcome-orb-eye" />
        </div>
        <div className="pm-welcome-orb-shine" />
    </div>
);

/* ═══ WELCOME SCREEN ═══ */
const PracticeModeWelcome = ({ onStart }) => {
    const [selectedBalance, setSelectedBalance] = useState(5000);
    const [animateIn, setAnimateIn] = useState(false);
    useEffect(() => { setTimeout(() => setAnimateIn(true), 100); }, []);

    const options = [
        { amount: 1000, label: 'Student', desc: 'Starting small, learning big' },
        { amount: 5000, label: 'Starter', desc: 'Building your foundation' },
        { amount: 10000, label: 'Professional', desc: 'Managing larger sums' },
    ];

    return (
        <div className={`pm-welcome ${animateIn ? 'visible' : ''}`}>
            <div className="pm-welcome-bg" />
            <div className="pm-welcome-content">
                <div className="pm-orb-wrap"><WelcomeOrb size={100} /></div>
                <h1 className="pm-welcome-title">Welcome to Practice Mode</h1>
                <p className="pm-welcome-sub">Learn to manage money safely with virtual funds. No real money at risk!</p>
                <div className="pm-balance-card">
                    <div className="pm-balance-header">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                        <span>Choose Your Starting Balance</span>
                    </div>
                    <div className="pm-balance-options">
                        {options.map(o => (
                            <button key={o.amount} className={`pm-bal-btn ${selectedBalance === o.amount ? 'active' : ''}`} onClick={() => setSelectedBalance(o.amount)}>
                                <span className="pm-bal-amount">${o.amount.toLocaleString()}</span>
                                <span className="pm-bal-label">{o.label}</span>
                                <span className="pm-bal-desc">{o.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="pm-features-card">
                    <span className="pm-features-label">What you can do:</span>
                    <div className="pm-features-grid">
                        <div className="pm-feat"><span className="pm-feat-dot" />Simulate real purchases</div>
                        <div className="pm-feat"><span className="pm-feat-dot" />Track spending by category</div>
                        <div className="pm-feat"><span className="pm-feat-dot" />View spending trends</div>
                        <div className="pm-feat"><span className="pm-feat-dot" />Get AI-powered financial advice</div>
                    </div>
                </div>
                <button className="pm-start-btn" onClick={() => onStart(selectedBalance)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    Start Practicing
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
                <p className="pm-disclaimer">All data is session-only and will be cleared when you leave</p>
            </div>
        </div>
    );
};

/* ═══ BRAND EXPENSE CARDS ═══ */
const BrandExpenseSection = ({ balance, onAddExpense }) => {
    const [amounts, setAmounts] = useState({});
    const [addingId, setAddingId] = useState(null);
    const [successId, setSuccessId] = useState(null);
    const [activeTab, setActiveTab] = useState('All');

    const categories = ['All', ...new Set(EXPENSE_ITEMS.map(i => i.category))];
    const filteredItems = activeTab === 'All' ? EXPENSE_ITEMS : EXPENSE_ITEMS.filter(i => i.category === activeTab);

    const handleAdd = (item) => {
        const numAmount = parseFloat(amounts[item.id]);
        if (!numAmount || numAmount <= 0 || numAmount > balance) return;
        setAddingId(item.id);
        setTimeout(() => {
            onAddExpense({ name: item.name, amount: numAmount, emoji: item.fallbackEmoji || '💳', category: item.category, logo: item.logo ? item.id : null });
            setAddingId(null);
            setSuccessId(item.id);
            setAmounts(prev => ({ ...prev, [item.id]: '' }));
            setTimeout(() => setSuccessId(null), 1500);
        }, 300);
    };

    return (
        <div className="pm-brand-section">
            <div className="pm-brand-header">
                <div className="pm-brand-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                </div>
                <div>
                    <h3 className="pm-brand-title">Add Expense</h3>
                    <p className="pm-brand-sub">Enter what you spent on each service</p>
                </div>
            </div>
            <div className="pm-brand-tabs">
                {categories.map(tab => (
                    <button key={tab} className={`pm-brand-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>{tab}</button>
                ))}
            </div>
            <div className="pm-brand-grid">
                {filteredItems.map(item => {
                    const numAmount = parseFloat(amounts[item.id]) || 0;
                    const isOverBudget = numAmount > balance;
                    const isValid = numAmount > 0 && !isOverBudget;
                    const isAdding = addingId === item.id;
                    const isSuccess = successId === item.id;
                    return (
                        <div key={item.id} className={`pm-brand-card ${isAdding ? 'adding' : ''} ${isSuccess ? 'success' : ''}`}>
                            <div className="pm-brand-card-top">
                                {item.logo ? (
                                    <div className="pm-brand-logo-wrap"><img src={item.logo} alt={item.name} className="pm-brand-logo" /></div>
                                ) : (
                                    <div className="pm-brand-emoji-wrap"><span className="pm-brand-emoji">{item.fallbackEmoji}</span></div>
                                )}
                                <div className="pm-brand-info">
                                    <span className="pm-brand-name">{item.name}</span>
                                    <span className="pm-brand-cat">{item.category}</span>
                                </div>
                            </div>
                            <div className="pm-brand-input-row">
                                <div className={`pm-brand-input-wrap ${isOverBudget ? 'error' : ''}`}>
                                    <span className="pm-brand-currency">$</span>
                                    <input type="number" className="pm-brand-input" placeholder={item.placeholder} value={amounts[item.id] || ''} onChange={e => setAmounts(prev => ({ ...prev, [item.id]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && isValid && handleAdd(item)} min="0.01" step="0.01" />
                                </div>
                                <button className={`pm-brand-add-btn ${isSuccess ? 'success' : ''} ${isAdding ? 'loading' : ''}`} onClick={() => handleAdd(item)} disabled={!isValid || isAdding}>
                                    {isSuccess ? (
                                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                    ) : isAdding ? (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{animation:'pmSpin 0.7s linear infinite'}}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/></svg>
                                    ) : (
                                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                    )}
                                </button>
                            </div>
                            {isOverBudget && <span className="pm-brand-error">Exceeds balance</span>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/* ═══ CUSTOM EXPENSE FORM ═══ */
const CustomExpenseForm = ({ balance, onAddExpense }) => {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Other');
    const [isAdding, setIsAdding] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const selectedCat = CUSTOM_CATEGORIES.find(c => c.value === category);

    const handleSubmit = (e) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        if (!name.trim() || !numAmount || numAmount <= 0 || numAmount > balance) return;
        setIsAdding(true);
        setTimeout(() => {
            onAddExpense({ name: name.trim(), amount: numAmount, emoji: selectedCat?.emoji || '📝', category });
            setIsAdding(false);
            setShowSuccess(true);
            setName(''); setAmount('');
            setTimeout(() => setShowSuccess(false), 2000);
        }, 300);
    };

    const numAmount = parseFloat(amount) || 0;
    const isOverBudget = numAmount > balance;
    const isValid = name.trim() && numAmount > 0 && !isOverBudget;

    return (
        <div className="pm-custom-expense">
            <div className="pm-custom-header">
                <div className="pm-custom-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg></div>
                <div>
                    <h3 className="pm-custom-title">Add Custom Expense</h3>
                    <p className="pm-custom-sub">Track anything else you bought</p>
                </div>
            </div>
            <form className="pm-custom-form" onSubmit={handleSubmit}>
                <div className="pm-custom-row">
                    <div className="pm-custom-field pm-custom-field-name">
                        <label className="pm-field-label">What did you buy?</label>
                        <div className="pm-input-wrap">
                            <span className="pm-input-emoji">{selectedCat?.emoji || '📝'}</span>
                            <input type="text" className="pm-custom-input" placeholder="e.g. Gym membership, Uber ride..." value={name} onChange={e => setName(e.target.value)} maxLength={50} />
                        </div>
                    </div>
                    <div className="pm-custom-field pm-custom-field-amount">
                        <label className="pm-field-label">Amount</label>
                        <div className="pm-input-wrap pm-input-amount-wrap">
                            <span className="pm-input-currency">$</span>
                            <input type="number" className="pm-custom-input pm-amount-input" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} min="0.01" step="0.01" max={balance} />
                        </div>
                        {isOverBudget && <span className="pm-field-error">Exceeds balance</span>}
                    </div>
                </div>
                <div className="pm-custom-field">
                    <label className="pm-field-label">Category</label>
                    <div className="pm-category-pills">
                        {CUSTOM_CATEGORIES.map(cat => (
                            <button key={cat.value} type="button" className={`pm-cat-pill ${category === cat.value ? 'active' : ''}`} onClick={() => setCategory(cat.value)}>
                                <span>{cat.emoji}</span><span>{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="pm-custom-footer">
                    {numAmount > 0 && !isOverBudget && (
                        <div className="pm-custom-preview">Remaining after: <strong>${(balance - numAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></div>
                    )}
                    <button type="submit" className={`pm-custom-submit ${isAdding ? 'adding' : ''} ${showSuccess ? 'success' : ''}`} disabled={!isValid || isAdding}>
                        {showSuccess ? (
                            <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Added!</>
                        ) : isAdding ? (
                            <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{animation:'pmSpin 0.7s linear infinite'}}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/></svg> Adding...</>
                        ) : (
                            <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Expense</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

/* ═══ SESSION SUMMARY BANNER ═══ */
const SessionSummaryBanner = ({ transactions, totalSpent, startingBalance, balance, onViewTrends, onAskAI }) => {
    const [visible, setVisible] = useState(false);
    useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

    const budgetPct = startingBalance > 0 ? ((totalSpent / startingBalance) * 100) : 0;
    const topCat = (() => {
        const totals = {};
        transactions.forEach(t => { totals[t.category] = (totals[t.category] || 0) + t.amount; });
        return Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
    })();
    const statusColor = budgetPct > 80 ? '#ef4444' : budgetPct > 50 ? '#f59e0b' : '#10b981';
    const statusLabel = budgetPct > 80 ? 'High spend' : budgetPct > 50 ? 'Mid-range' : 'On track';
    const statusIcon = budgetPct > 80
        ? <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        : budgetPct > 50
            ? <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>
            : <><polyline points="20 6 9 17 4 12" /></>;

    return (
        <div className={`pm-summary-banner ${visible ? 'visible' : ''}`}>
            <div className="pm-summary-glow" style={{ background: `radial-gradient(ellipse at 50% 0%, ${statusColor}18, transparent 70%)` }} />
            <div className="pm-summary-left">
                <div className="pm-summary-icon" style={{ borderColor: `${statusColor}40`, background: `${statusColor}12` }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={statusColor} strokeWidth="2">{statusIcon}</svg>
                </div>
                <div className="pm-summary-text">
                    <div className="pm-summary-title">Session snapshot<span className="pm-summary-status-pill" style={{ background: `${statusColor}18`, border: `1px solid ${statusColor}40`, color: statusColor }}>{statusLabel}</span></div>
                    <div className="pm-summary-meta">
                        <span><strong>${totalSpent.toFixed(2)}</strong> spent across <strong>{transactions.length}</strong> transactions</span>
                        {topCat && <span className="pm-summary-sep">·</span>}
                        {topCat && <span>Top: <strong>{topCat[0]}</strong> (${topCat[1].toFixed(2)})</span>}
                    </div>
                </div>
            </div>
            <div className="pm-summary-actions">
                <button className="pm-summary-btn pm-summary-btn--outline" onClick={onViewTrends}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>View Trends
                </button>
                <button className="pm-summary-btn pm-summary-btn--primary" onClick={onAskAI}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>Ask AI for Insights
                </button>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════
   MINI AI CHAT — NOW POWERED BY CLAUDE API
   ═══════════════════════════════════════════ */
const MiniAIChat = ({ transactions, balance, totalSpent, startingBalance, externalPrompt, onExternalPromptHandled }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [apiAvailable, setApiAvailable] = useState(true);
    const chatRef = useRef(null);

    // Check if API key is configured
    useEffect(() => {
        const key = import.meta.env.VITE_CLAUDE_API_KEY;
        setApiAvailable(key && key !== 'your-api-key-here');
    }, []);

    useEffect(() => {
        const welcomeText = apiAvailable
            ? `Welcome to Practice Mode! 🎮 I'm powered by Claude AI and ready to give you real financial insights. You're starting with $${startingBalance.toLocaleString()} in virtual money.\n\nTry adding some expenses, then ask me anything like:\n• "How am I doing?"\n• "Where can I save money?"\n• "Analyze my spending"\n• "Give me budgeting tips"`
            : `Welcome to Practice Mode! 🎮 You're starting with $${startingBalance.toLocaleString()} in virtual money.\n\n⚠️ To unlock AI-powered insights, add your Claude API key to the .env file.\n\nI can still help with basic questions about your spending!`;
        setMessages([{ id: 1, role: 'ai', text: welcomeText }]);
    }, [startingBalance, apiAvailable]);

    useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [messages, isTyping]);

    // Handle external prompts (from "Ask AI for Insights" buttons)
    useEffect(() => {
        if (!externalPrompt) return;
        handleUserMessage(externalPrompt);
        onExternalPromptHandled?.();
    }, [externalPrompt]);

    // Fallback local responses when API is unavailable
    const generateLocalResponse = (userMsg) => {
        const lower = userMsg.toLowerCase();
        const catTotals = {};
        transactions.forEach(t => { catTotals[t.category] = (catTotals[t.category] || 0) + t.amount; });
        const sorted = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);

        if (lower.includes('how much') || lower.includes('total') || lower.includes('spent') || lower.includes('how am i')) {
            if (transactions.length === 0) return "You haven't made any purchases yet! Try adding some expenses above to get started. 🛒";
            const pct = startingBalance > 0 ? ((totalSpent / startingBalance) * 100).toFixed(0) : 0;
            return `You've spent $${totalSpent.toFixed(2)} so far (${pct}% of your budget). Remaining: $${balance.toFixed(2)}.\n\n${sorted.length > 0 ? `Top category: ${sorted[0][0]} ($${sorted[0][1].toFixed(2)}).` : ''}\n\n💡 Tip: Add your Claude API key to .env for personalized AI-powered financial advice!`;
        }
        if (lower.includes('biggest') || lower.includes('most') || lower.includes('expensive')) {
            if (transactions.length === 0) return "No transactions yet! Add some expenses to see your biggest spend.";
            const biggest = [...transactions].sort((a, b) => b.amount - a.amount)[0];
            return `Your biggest expense is "${biggest.name}" at $${biggest.amount.toFixed(2)} (${biggest.category}).`;
        }
        if (lower.includes('categor') || lower.includes('breakdown') || lower.includes('analyze') || lower.includes('analysis')) {
            if (transactions.length === 0) return "No spending data yet. Add some expenses and I'll break them down!";
            return `Spending Breakdown:\n${sorted.map(([cat, amt]) => `• ${cat}: $${amt.toFixed(2)} (${((amt / totalSpent) * 100).toFixed(0)}%)`).join('\n')}\n\nTotal: $${totalSpent.toFixed(2)}\n\n💡 Add your Claude API key to get personalized savings tips!`;
        }
        if (lower.includes('budget') || lower.includes('save') || lower.includes('tip') || lower.includes('advice')) {
            const pct = startingBalance > 0 ? ((totalSpent / startingBalance) * 100).toFixed(0) : 0;
            return `You've used ${pct}% of your budget. ${Number(pct) > 70 ? "⚠️ Watch your spending! Consider cutting non-essentials." : Number(pct) > 40 ? "You're doing okay — keep an eye on discretionary spending." : "Great job! 👏 You're well within budget."}\n\n💡 Add your Claude API key for detailed, personalized budgeting advice!`;
        }
        return `Try asking me:\n• "How much did I spend?"\n• "What was my biggest expense?"\n• "Category breakdown"\n• "Budgeting tips"\n\n💡 For smart AI-powered insights, add your Claude API key to the .env file!`;
    };

    const handleUserMessage = async (text) => {
        const userMsg = { id: Date.now(), role: 'user', text };
        setMessages(p => [...p, userMsg]);
        setIsTyping(true);

        if (apiAvailable) {
            try {
                const sessionData = { transactions, balance, totalSpent, startingBalance };
                const aiResponse = await sendMessage(text, sessionData);
                setMessages(p => [...p, { id: Date.now() + 1, role: 'ai', text: aiResponse }]);
            } catch (error) {
                let fallbackText;
                if (error.message === 'API_KEY_MISSING') {
                    fallbackText = '⚠️ API key not configured. Add your Claude API key to the .env file to enable AI insights.';
                    setApiAvailable(false);
                } else if (error.message?.startsWith('API_ERROR_')) {
                    const code = error.message.split('_')[2];
                    fallbackText = code === '401'
                        ? '⚠️ Invalid API key. Please check your VITE_CLAUDE_API_KEY in .env.'
                        : code === '429'
                            ? '⏳ Rate limited — too many requests. Wait a moment and try again.'
                            : `⚠️ API error (${code}). Falling back to local insights.\n\n${generateLocalResponse(text)}`;
                } else {
                    fallbackText = `⚠️ Couldn't reach the AI. Here's what I can tell you locally:\n\n${generateLocalResponse(text)}`;
                }
                setMessages(p => [...p, { id: Date.now() + 1, role: 'ai', text: fallbackText }]);
            }
        } else {
            // Use local fallback
            setTimeout(() => {
                setMessages(p => [...p, { id: Date.now() + 1, role: 'ai', text: generateLocalResponse(text) }]);
            }, 400 + Math.random() * 400);
        }

        setIsTyping(false);
    };

    const handleSend = () => {
        if (!input.trim() || isTyping) return;
        const text = input.trim();
        setInput('');
        handleUserMessage(text);
    };

    // Quick action buttons for common questions
    const quickActions = [
        { label: '📊 How am I doing?', prompt: 'How am I doing with my spending? Give me an overall assessment.' },
        { label: '💡 Savings tips', prompt: 'What are some specific ways I could save money based on my spending?' },
        { label: '📋 Full analysis', prompt: 'Give me a complete analysis of my spending with actionable advice.' },
    ];

    return (
        <div className="pm-chat">
            <div className="pm-chat-header">
                <div className="pm-mini-orb"><div className="pm-mini-orb-eyes"><div className="pm-eye" /><div className="pm-eye" /></div></div>
                <span>AI Assistant</span>
                {apiAvailable && <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>LIVE AI</span>}
            </div>
            <div className="pm-chat-messages" ref={chatRef}>
                {messages.map(m => (
                    <div key={m.id} className={`pm-msg ${m.role}`}>
                        {m.role === 'ai' && <div className="pm-msg-orb"><div className="pm-mini-orb sm"><div className="pm-mini-orb-eyes"><div className="pm-eye" /><div className="pm-eye" /></div></div></div>}
                        <div className={`pm-msg-bubble ${m.role}`}>{m.text.split('\n').map((l, i) => <span key={i}>{l.split(/(\*\*.*?\*\*)/).map((p, j) => p.startsWith('**') && p.endsWith('**') ? <strong key={j} style={{ fontWeight: 700, color: '#fff' }}>{p.slice(2, -2)}</strong> : p)}<br /></span>)}</div>
                    </div>
                ))}
                {isTyping && (
                    <div className="pm-msg ai">
                        <div className="pm-msg-orb"><div className="pm-mini-orb sm"><div className="pm-mini-orb-eyes"><div className="pm-eye" /><div className="pm-eye" /></div></div></div>
                        <div className="pm-msg-bubble ai pm-typing"><span className="pm-dot" /><span className="pm-dot" /><span className="pm-dot" /></div>
                    </div>
                )}
            </div>

            {/* Quick action buttons */}
            {transactions.length >= 1 && messages.length <= 3 && (
                <div className="pm-quick-actions">
                    {quickActions.map((qa, i) => (
                        <button key={i} className="pm-quick-btn" onClick={() => handleUserMessage(qa.prompt)} disabled={isTyping}>
                            {qa.label}
                        </button>
                    ))}
                </div>
            )}

            <div className="pm-chat-input">
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder={apiAvailable ? "Ask me anything about your finances..." : "Ask about your spending..."} disabled={isTyping} />
                <button className="pm-send" onClick={handleSend} disabled={!input.trim() || isTyping}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2" fill="currentColor" stroke="none"/></svg>
                </button>
            </div>
        </div>
    );
};

/* ═══ RECENT TRANSACTIONS ═══ */
const RecentTransactions = ({ transactions }) => (
    <div className="pm-txns">
        <div className="pm-txns-header"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg><span>Recent Transactions</span></div>
        <div className="pm-txns-list">
            {transactions.length === 0 ? (
                <div className="pm-txns-empty"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg><span>No transactions yet</span><span className="pm-txns-sub">Add expenses above to start tracking</span></div>
            ) : transactions.slice(-8).reverse().map((t, i) => (
                <div key={i} className="pm-txn-row">
                    {t.logo && logoMap[t.logo] ? (<img src={logoMap[t.logo]} alt={t.name} className="pm-txn-logo" />) : (<span className="pm-txn-emoji">{t.emoji || '💳'}</span>)}
                    <div className="pm-txn-info"><span className="pm-txn-name">{t.name}</span><span className="pm-txn-cat">{t.category}</span></div>
                    <span className="pm-txn-amt">-${t.amount.toFixed(2)}</span>
                </div>
            ))}
        </div>
    </div>
);

/* ═══ SPENDING CHARTS ═══ */
const SpendingTrendChart = ({ transactions }) => {
    const [tooltip, setTooltip] = useState(null);

    if (transactions.length === 0) return (
        <div className="pm-chart-card">
            <div className="pm-chart-hdr"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg><span>Spending Trend</span></div>
            <div className="pm-chart-empty"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg><span>No spending data yet</span><span className="sub">Add expenses to see your trend</span></div>
        </div>
    );

    let running = 0;
    const points = transactions.map((t, i) => { running += t.amount; return { index: i, amount: t.amount, cumulative: running, name: t.name, category: t.category }; });

    const W = 320, H = 140, PAD = { top: 16, right: 16, bottom: 28, left: 48 };
    const chartW = W - PAD.left - PAD.right;
    const chartH = H - PAD.top - PAD.bottom;
    const maxVal = Math.max(...points.map(p => p.cumulative), 1);
    const n = points.length;
    const xOf = i => PAD.left + (n === 1 ? chartW / 2 : (i / (n - 1)) * chartW);
    const yOf = v => PAD.top + chartH - (v / maxVal) * chartH;
    const linePts = points.map((p, i) => `${xOf(i)},${yOf(p.cumulative)}`).join(' ');
    const areaPath = `M${xOf(0)},${yOf(points[0].cumulative)} ` + points.slice(1).map((p, i) => `L${xOf(i + 1)},${yOf(p.cumulative)}`).join(' ') + ` L${xOf(n - 1)},${PAD.top + chartH} L${xOf(0)},${PAD.top + chartH} Z`;
    const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => ({ val: maxVal * f, y: yOf(maxVal * f) }));
    const latestPt = points[points.length - 1];
    const avgPerTxn = running / n;
    const biggestSingle = Math.max(...transactions.map(t => t.amount));

    return (
        <div className="pm-chart-card pm-chart-card--trend">
            <div className="pm-chart-hdr"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg><span>Spending Trend</span><span className="pm-chart-badge">{n} transaction{n !== 1 ? 's' : ''}</span></div>
            <div className="pm-trend-stats-row">
                <div className="pm-trend-stat"><span className="pm-trend-stat-label">Total Spent</span><span className="pm-trend-stat-val">${running.toFixed(2)}</span></div>
                <div className="pm-trend-stat"><span className="pm-trend-stat-label">Avg / Transaction</span><span className="pm-trend-stat-val">${avgPerTxn.toFixed(2)}</span></div>
                <div className="pm-trend-stat"><span className="pm-trend-stat-label">Largest Single</span><span className="pm-trend-stat-val pm-trend-stat-val--red">${biggestSingle.toFixed(2)}</span></div>
            </div>
            <div className="pm-trend-svg-wrap">
                <svg viewBox={`0 0 ${W} ${H}`} className="pm-trend-svg" style={{ display: 'block', width: '100%' }}>
                    <defs>
                        <linearGradient id="pmFill2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" /><stop offset="100%" stopColor="#3b82f6" stopOpacity="0" /></linearGradient>
                        <filter id="pmGlow"><feGaussianBlur stdDeviation="2" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                    </defs>
                    {yTicks.map(({ val, y }, i) => (<g key={i}><line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray={i === 0 ? '0' : '3,4'} /><text x={PAD.left - 6} y={y + 4} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="system-ui,sans-serif">{val >= 1000 ? `$${(val / 1000).toFixed(1)}k` : `$${val.toFixed(0)}`}</text></g>))}
                    {points.map((p, i) => (<text key={i} x={xOf(i)} y={H - 6} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="8" fontFamily="system-ui,sans-serif">{i + 1}</text>))}
                    <path d={areaPath} fill="url(#pmFill2)" />
                    <polyline points={linePts} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" filter="url(#pmGlow)" />
                    {points.map((p, i) => (<g key={i} onMouseEnter={() => setTooltip({ i, x: xOf(i), y: yOf(p.cumulative), ...p })} onMouseLeave={() => setTooltip(null)} style={{ cursor: 'pointer' }}><circle cx={xOf(i)} cy={yOf(p.cumulative)} r="10" fill="transparent" /><circle cx={xOf(i)} cy={yOf(p.cumulative)} r={tooltip?.i === i ? 5 : 3.5} fill={tooltip?.i === i ? '#fff' : '#3b82f6'} stroke={tooltip?.i === i ? '#3b82f6' : '#1e3a8a'} strokeWidth="2" style={{ transition: 'r 0.15s, fill 0.15s' }} /></g>))}
                    {n >= 1 && (<text x={Math.min(xOf(n - 1), W - PAD.right - 2)} y={yOf(latestPt.cumulative) - 8} textAnchor={n === 1 ? 'middle' : 'end'} fill="#60a5fa" fontSize="10" fontWeight="700" fontFamily="system-ui,sans-serif">${latestPt.cumulative.toFixed(2)}</text>)}
                </svg>
                {tooltip && (<div className="pm-trend-tooltip" style={{ left: `${(tooltip.x / W) * 100}%`, top: `${(tooltip.y / H) * 100}%` }}><div className="pm-tt-name">{tooltip.name}</div><div className="pm-tt-row"><span>This txn</span><span className="pm-tt-red">-${tooltip.amount.toFixed(2)}</span></div><div className="pm-tt-row"><span>Running total</span><span>${tooltip.cumulative.toFixed(2)}</span></div><div className="pm-tt-cat">{tooltip.category}</div></div>)}
            </div>
        </div>
    );
};

const SpendingByCategoryChart = ({ transactions }) => {
    const [hovered, setHovered] = useState(null);
    const colors = { Groceries: '#3b82f6', Subscriptions: '#8b5cf6', Shopping: '#a78bfa', Transport: '#06b6d4', Dining: '#f59e0b', Bills: '#ef4444', Health: '#10b981', Entertainment: '#ec4899', Education: '#f97316', Other: '#6b7280' };

    if (transactions.length === 0) return (
        <div className="pm-chart-card">
            <div className="pm-chart-hdr"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg><span>Spending by Category</span></div>
            <div className="pm-chart-empty"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg><span>No data yet</span><span className="sub">Add expenses to see the breakdown</span></div>
        </div>
    );

    const totals = {};
    transactions.forEach(t => { totals[t.category] = (totals[t.category] || 0) + t.amount; });
    const total = Object.values(totals).reduce((a, b) => a + b, 0);
    const segs = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    const r = 34, circ = 2 * Math.PI * r;
    let off = -circ * 0.25;

    return (
        <div className="pm-chart-card pm-chart-card--cat">
            <div className="pm-chart-hdr"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg><span>Spending by Category</span><span className="pm-chart-badge">{segs.length} categor{segs.length !== 1 ? 'ies' : 'y'}</span></div>
            <div className="pm-donut-area">
                <div className="pm-donut-wrap">
                    <svg viewBox="0 0 100 100" className="pm-donut">
                        {segs.map(([cat, amt]) => { const pct = amt / total; const dash = pct * circ; const gap = circ - dash; const cur = off; off += pct * circ; const isHov = hovered === cat; return (<circle key={cat} cx="50" cy="50" r={r} fill="none" stroke={colors[cat] || '#666'} strokeWidth={isHov ? 10 : 7} strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-cur} strokeLinecap="round" className="pm-donut-seg" style={{ filter: isHov ? `drop-shadow(0 0 6px ${colors[cat] || '#666'})` : 'none', transition: 'stroke-width 0.2s, filter 0.2s' }} onMouseEnter={() => setHovered(cat)} onMouseLeave={() => setHovered(null)} />); })}
                    </svg>
                    <div className="pm-donut-center">
                        {hovered ? (<><span className="pm-donut-center-pct" style={{ color: colors[hovered] || '#fff' }}>{((totals[hovered] / total) * 100).toFixed(0)}%</span><span className="pm-donut-center-label">{hovered}</span></>) : (<><span className="pm-donut-center-total">${total >= 1000 ? `${(total / 1000).toFixed(1)}k` : total.toFixed(0)}</span><span className="pm-donut-center-label">total</span></>)}
                    </div>
                </div>
                <div className="pm-donut-legend">
                    {segs.map(([cat, amt]) => { const pct = ((amt / total) * 100).toFixed(1); const isHov = hovered === cat; return (<div key={cat} className={`pm-legend-item ${isHov ? 'hovered' : ''}`} onMouseEnter={() => setHovered(cat)} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}><span className="pm-legend-dot" style={{ background: colors[cat] || '#666' }} /><span className="pm-legend-name">{cat}</span><div className="pm-legend-right"><span className="pm-legend-pct">{pct}%</span><span className="pm-legend-amt">${amt.toFixed(2)}</span></div></div>); })}
                    <div className="pm-legend-total-row"><span>Total</span><span className="pm-legend-total-val">${total.toFixed(2)}</span></div>
                </div>
            </div>
            <div className="pm-cat-bars">
                {segs.slice(0, 4).map(([cat, amt]) => (<div key={cat} className="pm-cat-bar-row" onMouseEnter={() => setHovered(cat)} onMouseLeave={() => setHovered(null)}><span className="pm-cat-bar-label">{cat}</span><div className="pm-cat-bar-track"><div className="pm-cat-bar-fill" style={{ width: `${(amt / segs[0][1]) * 100}%`, background: colors[cat] || '#666', opacity: hovered && hovered !== cat ? 0.35 : 1 }} /></div><span className="pm-cat-bar-val">${amt.toFixed(0)}</span></div>))}
            </div>
        </div>
    );
};

/* ═══ MAIN PRACTICE MODE PAGE ═══ */
const PracticeMode = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [started, setStarted] = useState(false);
    const [startingBalance, setStartingBalance] = useState(5000);
    const [balance, setBalance] = useState(5000);
    const [totalSpent, setTotalSpent] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [aiPromptTrigger, setAiPromptTrigger] = useState(null);
    const [showFullChat, setShowFullChat] = useState(false);
    const [activeMobilePanel, setActiveMobilePanel] = useState(null); // 'insights' | 'chat' | 'txns'
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const chartsRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuOpen]);

    const toggleMobilePanel = (panel) => {
        setActiveMobilePanel(prev => prev === panel ? null : panel);
    };
    const closeMobilePanel = () => setActiveMobilePanel(null);

    useEffect(() => { (async () => { const { data: { user } } = await supabase.auth.getUser(); if (!user) { navigate('/login'); return; } setUser(user); setLoading(false); })(); }, [navigate]);

    useEffect(() => { const saved = sessionStorage.getItem('finscope_practice'); if (saved) { try { const d = JSON.parse(saved); setStartingBalance(d.startingBalance); setBalance(d.balance); setTotalSpent(d.totalSpent); setTransactions(d.transactions); setStarted(true); } catch (e) {} } }, []);

    useEffect(() => { if (started) sessionStorage.setItem('finscope_practice', JSON.stringify({ startingBalance, balance, totalSpent, transactions })); }, [started, startingBalance, balance, totalSpent, transactions]);

    const handleStart = (amount) => { setStartingBalance(amount); setBalance(amount); setTotalSpent(0); setTransactions([]); setStarted(true); };
    const handleAddExpense = (exp) => { if (balance < exp.amount) return; setBalance(p => p - exp.amount); setTotalSpent(p => p + exp.amount); setTransactions(p => [...p, { ...exp, timestamp: new Date().toISOString() }]); };
    const handleReset = () => { setBalance(startingBalance); setTotalSpent(0); setTransactions([]); };
    const handleExit = () => { sessionStorage.removeItem('finscope_practice'); navigate('/dashboard'); };
    const handleViewTrends = () => { chartsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
    const handleAskAI = () => { setAiPromptTrigger(`Give me a full breakdown and insights on my spending. I started with $${startingBalance} and spent $${totalSpent.toFixed(2)} across ${transactions.length} transactions. What am I doing well? Where can I save? Give me specific, actionable advice.`); };

    const budgetPct = startingBalance > 0 ? ((totalSpent / startingBalance) * 100).toFixed(0) : 0;

    if (loading) return (<div className="dashboard-loading"><div className="loading-orb"><FinScopeAI /></div><p className="loading-text">Loading...</p></div>);
    if (!started) return (<div className="dashboard"><PracticeModeWelcome onStart={handleStart} /></div>);

    return (
        <div className="dashboard">
            <header className="dashboard-header pm-header">
                <div className="dashboard-header-content">
                    <div className="dashboard-header-left">
                        <div className="dashboard-logo"><FinScopeAI /></div>
                        <h1 className="pm-header-title">FinScope <span className="username">AI</span></h1>
                        <div className="pm-badge"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>Practice Mode</div>
                    </div>
                    <div className="dashboard-header-right">
                        {/* Desktop-only buttons */}
                        <button className="pm-fab-chat desktop-only" onClick={() => setShowFullChat(true)}>
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                            Chat with AI
                        </button>
                        <button className="btn-leave desktop-only" onClick={handleExit}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                            <span>Exit Practice</span>
                        </button>
                        <div className="desktop-only"><UserMenu /></div>

                        {/* ── Hamburger menu — always visible ── */}
                        <div className="pm-hamburger-wrap" ref={menuRef}>
                            <button
                                className={`pm-hamburger-btn ${menuOpen ? 'open' : ''}`}
                                onClick={() => setMenuOpen(o => !o)}
                                aria-label="Navigation menu"
                            >
                                {menuOpen ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2.5" strokeLinecap="round">
                                        <path d="M18 6L6 18M6 6l12 12"/>
                                    </svg>
                                ) : (
                                    <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
                                        <rect x="0" y="0"  width="20" height="2" rx="1" fill="rgba(255,255,255,0.85)"/>
                                        <rect x="0" y="7"  width="20" height="2" rx="1" fill="rgba(255,255,255,0.85)"/>
                                        <rect x="0" y="14" width="20" height="2" rx="1" fill="rgba(255,255,255,0.85)"/>
                                    </svg>
                                )}
                            </button>

                            {menuOpen && (
                                <div className="pm-ham-dropdown">
                                    <div className="pm-ham-dropdown-header">
                                        <span className="pm-ham-greet">Navigation</span>
                                    </div>

                                    <button className="pm-ham-item" onClick={() => { navigate('/dashboard'); setMenuOpen(false); }}>
                                        <span className="pm-ham-icon pm-ham-icon--blue">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                                        </span>
                                        <div className="pm-ham-item-text">
                                            <span className="pm-ham-item-label">Dashboard</span>
                                            <span className="pm-ham-item-sub">Your main overview</span>
                                        </div>
                                        <svg className="pm-ham-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                                    </button>

                                    <button className="pm-ham-item" onClick={() => { navigate('/'); setMenuOpen(false); }}>
                                        <span className="pm-ham-icon pm-ham-icon--cyan">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                                        </span>
                                        <div className="pm-ham-item-text">
                                            <span className="pm-ham-item-label">Home Page</span>
                                            <span className="pm-ham-item-sub">Back to landing</span>
                                        </div>
                                        <svg className="pm-ham-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                                    </button>

                                    <button className="pm-ham-item" onClick={() => { setShowFullChat(true); setMenuOpen(false); }}>
                                        <span className="pm-ham-icon pm-ham-icon--purple">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                        </span>
                                        <div className="pm-ham-item-text">
                                            <span className="pm-ham-item-label">AI Chat</span>
                                            <span className="pm-ham-item-sub">Full screen assistant</span>
                                        </div>
                                        <svg className="pm-ham-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                                    </button>

                                    <div className="pm-ham-divider" />

                                    <button className="pm-ham-item pm-ham-item--danger" onClick={() => { handleExit(); setMenuOpen(false); }}>
                                        <span className="pm-ham-icon pm-ham-icon--red">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                                        </span>
                                        <div className="pm-ham-item-text">
                                            <span className="pm-ham-item-label">Exit Practice</span>
                                            <span className="pm-ham-item-sub">End this session</span>
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="dashboard-main">
                <div className="pm-layout">
                    <div className="pm-main">
                        <div className="pm-balance-box">
                            <div className="pm-balance-top">
                                <div className="pm-balance-info">
                                    <div className="pm-balance-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg></div>
                                    <div><span className="pm-balance-label">Virtual Balance</span><span className="pm-balance-value">${balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
                                </div>
                                <button className="pm-reset-btn" onClick={handleReset}>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                                    Reset
                                </button>
                            </div>
                            <div className="pm-balance-stats">
                                <div className="pm-bstat"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /></svg><span className="pm-bstat-label">Total Spent</span><span className="pm-bstat-val red">-${totalSpent.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
                                <div className="pm-bstat"><span className="pm-bstat-label">Budget Used</span><span className="pm-bstat-val">{budgetPct}%</span></div>
                            </div>
                            <div className="pm-budget-bar"><div className="pm-budget-fill" style={{ width: `${Math.min(budgetPct, 100)}%`, background: budgetPct > 80 ? '#ef4444' : budgetPct > 50 ? '#f59e0b' : '#10b981' }} /></div>
                        </div>

                        <BrandExpenseSection balance={balance} onAddExpense={handleAddExpense} />
                        <CustomExpenseForm balance={balance} onAddExpense={handleAddExpense} />

                        <div className="pm-charts-row" ref={chartsRef}>
                            <SpendingTrendChart transactions={transactions} />
                            <SpendingByCategoryChart transactions={transactions} />
                        </div>
                    </div>

                    <div className="pm-sidebar">
                        <AIInsightsDashboard transactions={transactions} balance={balance} totalSpent={totalSpent} startingBalance={startingBalance} onOpenChat={() => setShowFullChat(true)} />
                        <MiniAIChat transactions={transactions} balance={balance} totalSpent={totalSpent} startingBalance={startingBalance} externalPrompt={aiPromptTrigger} onExternalPromptHandled={() => setAiPromptTrigger(null)} />
                        <RecentTransactions transactions={transactions} />
                    </div>
                </div>
            </main>

            <div className="pm-sticky-bar">
                <div className="pm-sticky-bar-inner">
                    <div className="pm-sticky-info">
                        {transactions.length > 0 ? (
                            <><span className="pm-sticky-spent">${totalSpent.toFixed(2)} spent</span><span className="pm-sticky-sep">·</span><span className="pm-sticky-txns">{transactions.length} transaction{transactions.length !== 1 ? 's' : ''}</span></>
                        ) : (
                            <span className="pm-sticky-hint">Add expenses above to get started</span>
                        )}
                    </div>
                    <div className="pm-sticky-actions">
                        <button className="pm-sticky-btn pm-sticky-btn--outline" onClick={handleViewTrends}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                            View Trends
                        </button>
                        <button className="pm-sticky-btn pm-sticky-btn--primary" onClick={() => setShowFullChat(true)}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                            Chat with AI
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Mobile panel backdrop ── */}
            <div
                className={`pm-panel-backdrop ${activeMobilePanel ? 'open' : ''}`}
                onClick={closeMobilePanel}
            />

            {/* ── Mobile slide-up panel ── */}
            <div className={`pm-mobile-panel ${activeMobilePanel ? 'open' : ''}`}>
                {activeMobilePanel === 'insights' && (
                    <AIInsightsDashboard
                        transactions={transactions}
                        balance={balance}
                        totalSpent={totalSpent}
                        startingBalance={startingBalance}
                        onOpenChat={() => { closeMobilePanel(); setShowFullChat(true); }}
                    />
                )}
                {activeMobilePanel === 'chat' && (
                    <MiniAIChat
                        transactions={transactions}
                        balance={balance}
                        totalSpent={totalSpent}
                        startingBalance={startingBalance}
                        externalPrompt={aiPromptTrigger}
                        onExternalPromptHandled={() => setAiPromptTrigger(null)}
                    />
                )}
                {activeMobilePanel === 'txns' && (
                    <RecentTransactions transactions={transactions} />
                )}
            </div>

            {/* ── Mobile bottom navigation ── */}
            <nav className="pm-mobile-nav">
                <div className="pm-mobile-nav-inner">
                    {/* Home / Expenses */}
                    <button
                        className={`pm-nav-btn ${!activeMobilePanel ? 'active' : ''}`}
                        onClick={closeMobilePanel}
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                        Home
                    </button>

                    {/* Transactions */}
                    <button
                        className={`pm-nav-btn ${activeMobilePanel === 'txns' ? 'active' : ''}`}
                        onClick={() => toggleMobilePanel('txns')}
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="1" x2="12" y2="23" />
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                        Txns
                        {transactions.length > 0 && (
                            <span style={{
                                position: 'absolute', top: 5, right: '18%',
                                background: '#8b5cf6', color: '#fff',
                                fontSize: 9, fontWeight: 800,
                                borderRadius: 10, padding: '1px 5px',
                                lineHeight: '14px'
                            }}>{transactions.length}</span>
                        )}
                    </button>

                    {/* AI Insights */}
                    <button
                        className={`pm-nav-btn ${activeMobilePanel === 'insights' ? 'active' : ''}`}
                        onClick={() => toggleMobilePanel('insights')}
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 8v4l3 3" />
                        </svg>
                        Insights
                    </button>

                    {/* AI Chat */}
                    <button
                        className={`pm-nav-btn nav-ai ${activeMobilePanel === 'chat' ? 'active' : ''}`}
                        onClick={() => toggleMobilePanel('chat')}
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        AI Chat
                    </button>

                    {/* Full AI Chat */}
                    <button
                        className="pm-nav-btn"
                        onClick={() => { closeMobilePanel(); setShowFullChat(true); }}
                        style={{ color: 'rgba(139,92,246,0.8)' }}
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                        Full AI
                    </button>
                </div>
            </nav>

            {/* Fullscreen AI Chat Modal */}
            <FullscreenAIChat
                open={showFullChat}
                onClose={() => setShowFullChat(false)}
                transactions={transactions}
                balance={balance}
                totalSpent={totalSpent}
                startingBalance={startingBalance}
            />
        </div>
    );
};

export default PracticeMode;