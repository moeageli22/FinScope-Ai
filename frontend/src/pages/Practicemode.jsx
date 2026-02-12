import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import FinScopeAI from '../components/FinScopeAI';
import UserMenu from '../components/UserMenu';
import './Dashboard-Enhanced.css';
import './PracticeMode.css';

// Import brand logos — place these in src/assets/logos/
import spotifyLogo from '../assets/logos/spotify.png';
import netflixLogo from '../assets/logos/netflix.png';
import coffeeLogo from '../assets/logos/coffee.png';
import electronicsLogo from '../assets/logos/electronics.png';
import amazonLogo from '../assets/logos/amazon.png';
import disneyLogo from '../assets/logos/disneylogo.webp';
import starbucksLogo from '../assets/logos/starbucks.png';
import appleLogo from '../assets/logos/apple.jpg';
import uberLogo from '../assets/logos/uber.webp';
import ubereatsLogo from '../assets/logos/uberr.webp';
import youtubeLogo from '../assets/logos/youtube.jpg';
import nikeLogo from '../assets/logos/nike.webp';

/* ═══════════════════════════════════════════
   EXPENSE ITEMS WITH BRAND LOGOS
   Add logo: importedLogo once you have the image
   Until then, fallbackEmoji is shown
   ═══════════════════════════════════════════ */
const EXPENSE_ITEMS = [
    // Subscriptions
    { id: 'spotify', name: 'Spotify', logo: spotifyLogo, fallbackEmoji: '🎵', category: 'Subscriptions', placeholder: '9.99' },
    { id: 'netflix', name: 'Netflix', logo: netflixLogo, fallbackEmoji: '🎬', category: 'Subscriptions', placeholder: '15.99' },
    { id: 'disneyplus', name: 'Disney+', logo: disneyLogo, fallbackEmoji: '🏰', category: 'Subscriptions', placeholder: '13.99' },
    { id: 'youtube', name: 'YouTube Premium', logo: youtubeLogo, fallbackEmoji: '▶️', category: 'Subscriptions', placeholder: '13.99' },
    { id: 'apple', name: 'Apple Music / iCloud', logo: appleLogo, fallbackEmoji: '🍎', category: 'Subscriptions', placeholder: '10.99' },
    { id: 'gym', name: 'Gym Membership', logo: null, fallbackEmoji: '💪', category: 'Subscriptions', placeholder: '40.00' },
    // Shopping
    { id: 'amazon', name: 'Amazon', logo: amazonLogo, fallbackEmoji: '📦', category: 'Shopping', placeholder: '29.99' },
    { id: 'electronics', name: 'Electronics', logo: electronicsLogo, fallbackEmoji: '🖥️', category: 'Shopping', placeholder: '99.99' },
    { id: 'nike', name: 'Nike / Clothing', logo: nikeLogo, fallbackEmoji: '👟', category: 'Shopping', placeholder: '75.00' },
    // Dining
    { id: 'coffee', name: 'Coffee Shop', logo: coffeeLogo, fallbackEmoji: '☕', category: 'Dining', placeholder: '5.50' },
    { id: 'starbucks', name: 'Starbucks', logo: starbucksLogo, fallbackEmoji: '☕', category: 'Dining', placeholder: '6.50' },
    { id: 'ubereats', name: 'Uber Eats', logo: ubereatsLogo, fallbackEmoji: '🍔', category: 'Dining', placeholder: '25.00' },
    // Transport
    { id: 'uber', name: 'Uber / Lyft', logo: uberLogo, fallbackEmoji: '🚗', category: 'Transport', placeholder: '18.00' },
    { id: 'gas', name: 'Gas / Petrol', logo: null, fallbackEmoji: '⛽', category: 'Transport', placeholder: '55.00' },
    // Bills
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

/* ═══════════════════════════════════════════
   CUSTOM EXPENSE CATEGORIES
   ═══════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════
   WELCOME ORB
   ═══════════════════════════════════════════ */
const WelcomeOrb = ({ size = 100 }) => (
    <div className="pm-welcome-orb" style={{ width: size, height: size }}>
        <div className="pm-welcome-orb-inner">
            <div className="pm-welcome-orb-eye" />
            <div className="pm-welcome-orb-eye" />
        </div>
        <div className="pm-welcome-orb-shine" />
    </div>
);

/* ═══════════════════════════════════════════
   WELCOME SCREEN
   ═══════════════════════════════════════════ */
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
                        <div className="pm-feat"><span className="pm-feat-dot" />Chat with AI for insights</div>
                    </div>
                </div>

                <button className="pm-start-btn" onClick={() => onStart(selectedBalance)}>
                    Start Practicing
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </button>
                <p className="pm-disclaimer">All data is session-only and will be cleared when you leave</p>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════
   BRAND EXPENSE CARDS
   ═══════════════════════════════════════════ */
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
                                    <div className="pm-brand-logo-wrap">
                                        <img src={item.logo} alt={item.name} className="pm-brand-logo" />
                                    </div>
                                ) : (
                                    <div className="pm-brand-emoji-wrap">
                                        <span className="pm-brand-emoji">{item.fallbackEmoji}</span>
                                    </div>
                                )}
                                <div className="pm-brand-info">
                                    <span className="pm-brand-name">{item.name}</span>
                                    <span className="pm-brand-cat">{item.category}</span>
                                </div>
                            </div>
                            <div className="pm-brand-input-row">
                                <div className={`pm-brand-input-wrap ${isOverBudget ? 'error' : ''}`}>
                                    <span className="pm-brand-currency">$</span>
                                    <input
                                        type="number"
                                        className="pm-brand-input"
                                        placeholder={item.placeholder}
                                        value={amounts[item.id] || ''}
                                        onChange={e => setAmounts(prev => ({ ...prev, [item.id]: e.target.value }))}
                                        onKeyDown={e => e.key === 'Enter' && isValid && handleAdd(item)}
                                        min="0.01" step="0.01"
                                    />
                                </div>
                                <button className={`pm-brand-add-btn ${isSuccess ? 'success' : ''}`} onClick={() => handleAdd(item)} disabled={!isValid || isAdding}>
                                    {isSuccess ? (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                                    ) : (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
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

/* ═══════════════════════════════════════════
   CUSTOM EXPENSE FORM
   ═══════════════════════════════════════════ */
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
                <div className="pm-custom-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                </div>
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
                        {showSuccess ? (<><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>Added!</>) : isAdding ? ('Adding...') : (<><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>Add Expense</>)}
                    </button>
                </div>
            </form>
        </div>
    );
};

/* ═══════════════════════════════════════════
   MINI AI CHAT
   ═══════════════════════════════════════════ */
const MiniAIChat = ({ transactions, balance, totalSpent, startingBalance }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatRef = useRef(null);

    useEffect(() => {
        setMessages([{ id: 1, role: 'ai', text: `Welcome to Practice Mode! 🎮 You're starting with $${startingBalance.toLocaleString()} in virtual money. Try adding some expenses and I'll help you analyze your spending!` }]);
    }, [startingBalance]);

    useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [messages, isTyping]);

    const generateResponse = (userMsg) => {
        const lower = userMsg.toLowerCase();
        const catTotals = {};
        transactions.forEach(t => { catTotals[t.category] = (catTotals[t.category] || 0) + t.amount; });
        const sorted = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);

        if (lower.includes('how much') || lower.includes('total') || lower.includes('spent')) {
            if (transactions.length === 0) return "You haven't made any purchases yet! Try adding some expenses above.";
            return `You've spent $${totalSpent.toFixed(2)} so far. Remaining: $${balance.toFixed(2)}. ${sorted.length > 0 ? `Top category: ${sorted[0][0]} ($${sorted[0][1].toFixed(2)}).` : ''}`;
        }
        if (lower.includes('biggest') || lower.includes('most') || lower.includes('expensive')) {
            if (transactions.length === 0) return "No transactions yet!";
            const biggest = [...transactions].sort((a, b) => b.amount - a.amount)[0];
            return `Your biggest expense is "${biggest.name}" at $${biggest.amount.toFixed(2)} (${biggest.category}).`;
        }
        if (lower.includes('categor') || lower.includes('breakdown')) {
            if (transactions.length === 0) return "No spending data yet. Add some expenses and I'll break them down!";
            return `Breakdown:\n${sorted.map(([cat, amt]) => `• ${cat}: $${amt.toFixed(2)}`).join('\n')}\n\nTotal: $${totalSpent.toFixed(2)}`;
        }
        if (lower.includes('budget') || lower.includes('save') || lower.includes('tip')) {
            const pct = startingBalance > 0 ? ((totalSpent / startingBalance) * 100).toFixed(0) : 0;
            return `You've used ${pct}% of your budget. ${pct > 70 ? "⚠️ Watch out!" : pct > 40 ? "Doing okay — keep an eye on spending." : "Great job! 👏"}`;
        }
        return `Try asking:\n• "How much did I spend?"\n• "What was my biggest expense?"\n• "Category breakdown"\n• "Budgeting tips"`;
    };

    const handleSend = () => {
        if (!input.trim()) return;
        const userMsg = { id: Date.now(), role: 'user', text: input.trim() };
        setMessages(p => [...p, userMsg]); setInput(''); setIsTyping(true);
        setTimeout(() => { setMessages(p => [...p, { id: Date.now() + 1, role: 'ai', text: generateResponse(userMsg.text) }]); setIsTyping(false); }, 800 + Math.random() * 600);
    };

    return (
        <div className="pm-chat">
            <div className="pm-chat-header"><div className="pm-mini-orb"><div className="pm-mini-orb-eyes"><div className="pm-eye" /><div className="pm-eye" /></div></div><span>AI Assistant</span></div>
            <div className="pm-chat-messages" ref={chatRef}>
                {messages.map(m => (
                    <div key={m.id} className={`pm-msg ${m.role}`}>
                        {m.role === 'ai' && <div className="pm-msg-orb"><div className="pm-mini-orb sm"><div className="pm-mini-orb-eyes"><div className="pm-eye" /><div className="pm-eye" /></div></div></div>}
                        <div className={`pm-msg-bubble ${m.role}`}>{m.text.split('\n').map((l, i) => <span key={i}>{l}<br /></span>)}</div>
                    </div>
                ))}
                {isTyping && (<div className="pm-msg ai"><div className="pm-msg-orb"><div className="pm-mini-orb sm"><div className="pm-mini-orb-eyes"><div className="pm-eye" /><div className="pm-eye" /></div></div></div><div className="pm-msg-bubble ai pm-typing"><span className="pm-dot" /><span className="pm-dot" /><span className="pm-dot" /></div></div>)}
            </div>
            <div className="pm-chat-input">
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Ask about your spending..." />
                <button className="pm-send" onClick={handleSend} disabled={!input.trim()}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg></button>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════
   RECENT TRANSACTIONS
   ═══════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════
   SPENDING CHARTS
   ═══════════════════════════════════════════ */
const SpendingTrendChart = ({ transactions }) => {
    if (transactions.length === 0) return (<div className="pm-chart-card"><div className="pm-chart-hdr"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg><span>Spending Trend</span></div><div className="pm-chart-empty"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg><span>No spending data yet</span><span className="sub">Your spending trend will appear here</span></div></div>);
    let running = 0;
    const data = transactions.map(t => (running += t.amount, running));
    const max = Math.max(...data, 1), w = 100, h = 60;
    const pts = data.map((v, i) => `${data.length === 1 ? w / 2 : (i / (data.length - 1)) * w},${h - (v / max) * (h - 5)}`);
    return (<div className="pm-chart-card"><div className="pm-chart-hdr"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg><span>Spending Trend</span></div><div className="pm-chart-area"><svg viewBox={`-2 -2 ${w + 4} ${h + 4}`} preserveAspectRatio="none" className="pm-trend-svg"><defs><linearGradient id="pmFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" /><stop offset="100%" stopColor="#3b82f6" stopOpacity="0" /></linearGradient></defs><polygon points={`0,${h} ${pts.join(' ')} ${w},${h}`} fill="url(#pmFill)" /><polyline points={pts.join(' ')} fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></div></div>);
};

const SpendingByCategoryChart = ({ transactions }) => {
    const colors = { Groceries: '#3b82f6', Subscriptions: '#8b5cf6', Shopping: '#a78bfa', Transport: '#06b6d4', Dining: '#f59e0b', Bills: '#ef4444', Health: '#10b981', Entertainment: '#ec4899', Education: '#f97316', Other: '#6b7280' };
    if (transactions.length === 0) return (<div className="pm-chart-card"><div className="pm-chart-hdr"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg><span>Spending by Category</span></div><div className="pm-chart-empty"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg><span>No data yet</span><span className="sub">Add expenses to see the breakdown</span></div></div>);
    const totals = {};
    transactions.forEach(t => { totals[t.category] = (totals[t.category] || 0) + t.amount; });
    const total = Object.values(totals).reduce((a, b) => a + b, 0);
    const segs = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    const r = 36, circ = 2 * Math.PI * r;
    let off = 0;
    return (<div className="pm-chart-card"><div className="pm-chart-hdr"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg><span>Spending by Category</span></div><div className="pm-donut-area"><svg viewBox="0 0 100 100" className="pm-donut">{segs.map(([cat, amt]) => { const pct = amt / total, dash = pct * circ, gap = circ - dash, cur = off; off += pct * circ; return <circle key={cat} cx="50" cy="50" r={r} fill="none" stroke={colors[cat] || '#666'} strokeWidth="8" strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-cur} transform="rotate(-90 50 50)" strokeLinecap="round" className="pm-donut-seg" />; })}</svg><div className="pm-donut-legend">{segs.map(([cat, amt]) => (<div key={cat} className="pm-legend-item"><span className="pm-legend-dot" style={{ background: colors[cat] || '#666' }} /><span>{cat}</span><span className="pm-legend-amt">${amt.toFixed(2)}</span></div>))}</div></div></div>);
};

/* ═══════════════════════════════════════════
   MAIN PRACTICE MODE PAGE
   ═══════════════════════════════════════════ */
const PracticeMode = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [started, setStarted] = useState(false);
    const [startingBalance, setStartingBalance] = useState(5000);
    const [balance, setBalance] = useState(5000);
    const [totalSpent, setTotalSpent] = useState(0);
    const [transactions, setTransactions] = useState([]);

    useEffect(() => { (async () => { const { data: { user } } = await supabase.auth.getUser(); if (!user) { navigate('/login'); return; } setUser(user); setLoading(false); })(); }, [navigate]);

    useEffect(() => { const saved = sessionStorage.getItem('finscope_practice'); if (saved) { try { const d = JSON.parse(saved); setStartingBalance(d.startingBalance); setBalance(d.balance); setTotalSpent(d.totalSpent); setTransactions(d.transactions); setStarted(true); } catch (e) {} } }, []);

    useEffect(() => { if (started) sessionStorage.setItem('finscope_practice', JSON.stringify({ startingBalance, balance, totalSpent, transactions })); }, [started, startingBalance, balance, totalSpent, transactions]);

    const handleStart = (amount) => { setStartingBalance(amount); setBalance(amount); setTotalSpent(0); setTransactions([]); setStarted(true); };
    const handleAddExpense = (exp) => { if (balance < exp.amount) return; setBalance(p => p - exp.amount); setTotalSpent(p => p + exp.amount); setTransactions(p => [...p, { ...exp, timestamp: new Date().toISOString() }]); };
    const handleReset = () => { setBalance(startingBalance); setTotalSpent(0); setTransactions([]); };
    const handleExit = () => { sessionStorage.removeItem('finscope_practice'); navigate('/dashboard'); };

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
                    <div className="dashboard-header-right desktop-only">
                        <button className="btn-leave" onClick={handleExit}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg><span>Exit Practice</span></button>
                        <UserMenu />
                    </div>
                </div>
            </header>

            <main className="dashboard-main">
                <div className="pm-layout">
                    <div className="pm-main">
                        {/* Balance */}
                        <div className="pm-balance-box">
                            <div className="pm-balance-top">
                                <div className="pm-balance-info">
                                    <div className="pm-balance-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg></div>
                                    <div><span className="pm-balance-label">Virtual Balance</span><span className="pm-balance-value">${balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
                                </div>
                                <button className="pm-reset-btn" onClick={handleReset}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>Reset</button>
                            </div>
                            <div className="pm-balance-stats">
                                <div className="pm-bstat"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /></svg><span className="pm-bstat-label">Total Spent</span><span className="pm-bstat-val red">-${totalSpent.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
                                <div className="pm-bstat"><span className="pm-bstat-label">Budget Used</span><span className="pm-bstat-val">{budgetPct}%</span></div>
                            </div>
                            <div className="pm-budget-bar"><div className="pm-budget-fill" style={{ width: `${Math.min(budgetPct, 100)}%`, background: budgetPct > 80 ? '#ef4444' : budgetPct > 50 ? '#f59e0b' : '#10b981' }} /></div>
                        </div>

                        <BrandExpenseSection balance={balance} onAddExpense={handleAddExpense} />
                        <CustomExpenseForm balance={balance} onAddExpense={handleAddExpense} />

                        <div className="pm-charts-row">
                            <SpendingTrendChart transactions={transactions} />
                            <SpendingByCategoryChart transactions={transactions} />
                        </div>
                    </div>

                    <div className="pm-sidebar">
                        <MiniAIChat transactions={transactions} balance={balance} totalSpent={totalSpent} startingBalance={startingBalance} />
                        <RecentTransactions transactions={transactions} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PracticeMode;