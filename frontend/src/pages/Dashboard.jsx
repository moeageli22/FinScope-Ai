import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import UserMenu from '../components/UserMenu';
import FinScopeAI from '../components/FinScopeAI';
import AIAssistant from '../components/AIAssistant';
import DashboardTutorial from '../components/DashboardTutorial';
import { FullscreenAIChat, AIInsightsDashboard } from '../components/FullscreenAIChat';
import {
    initUserFinance, getUserFinance, addTransaction,
    getTransactions, getMonthlySummaries, getCategorySummary, deleteTransaction
} from '../services/financeService';
import { sendMessage } from '../services/claudeAI';
import './Dashboard-Enhanced.css';
import './DashboardReal.css';

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

const logoMap = {
    spotify: spotifyLogo, netflix: netflixLogo, coffee: coffeeLogo, electronics: electronicsLogo,
    amazon: amazonLogo, disneyplus: disneyLogo, starbucks: starbucksLogo, apple: appleLogo,
    uber: uberLogo, ubereats: ubereatsLogo, youtube: youtubeLogo, nike: nikeLogo,
};

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
    { id: 'coffee', name: 'Coffee Shop', logo: coffeeLogo, fallbackEmoji: '☕', category: 'Dining', placeholder: '5.50' },
    { id: 'starbucks', name: 'Starbucks', logo: starbucksLogo, fallbackEmoji: '☕', category: 'Dining', placeholder: '6.50' },
    { id: 'ubereats', name: 'Uber Eats', logo: ubereatsLogo, fallbackEmoji: '🍔', category: 'Dining', placeholder: '25.00' },
    { id: 'uber', name: 'Uber / Lyft', logo: uberLogo, fallbackEmoji: '🚗', category: 'Transport', placeholder: '18.00' },
    { id: 'gas', name: 'Gas / Petrol', logo: null, fallbackEmoji: '⛽', category: 'Transport', placeholder: '55.00' },
    { id: 'electricity', name: 'Electricity', logo: null, fallbackEmoji: '⚡', category: 'Bills', placeholder: '95.00' },
    { id: 'internet', name: 'Internet / WiFi', logo: null, fallbackEmoji: '🌐', category: 'Bills', placeholder: '60.00' },
    { id: 'phone', name: 'Phone Bill', logo: null, fallbackEmoji: '📱', category: 'Bills', placeholder: '45.00' },
    { id: 'rent', name: 'Rent / Mortgage', logo: null, fallbackEmoji: '🏠', category: 'Bills', placeholder: '1200.00' },
];

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

/* ═══ DEPOSIT / WITHDRAW MODAL ═══ */
const MoneyModal = ({ type, onClose, onConfirm, balance }) => {
    const [amount, setAmount] = useState('');
    const [source, setSource] = useState('');
    const isDeposit = type === 'deposit';
    const numAmount = parseFloat(amount) || 0;
    const isValid = numAmount > 0 && (isDeposit || numAmount <= balance);

    const presets = isDeposit
        ? [500, 1000, 2000, 5000]
        : [50, 100, 500, 1000];

    return (
        <div className="dr-modal-overlay" onClick={onClose}>
            <div className="dr-modal" onClick={e => e.stopPropagation()}>
                <div className="dr-modal-header">
                    <div className={`dr-modal-icon ${isDeposit ? 'green' : 'orange'}`}>
                        {isDeposit ? (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7-7 7 7" /></svg>
                        ) : (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5M5 12l7 7 7-7" /></svg>
                        )}
                    </div>
                    <div>
                        <h3 className="dr-modal-title">{isDeposit ? 'Deposit Money' : 'Withdraw Money'}</h3>
                        <p className="dr-modal-sub">{isDeposit ? 'Add funds to your account' : 'Take money out'}</p>
                    </div>
                    <button className="dr-modal-close" onClick={onClose}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="dr-modal-body">
                    <div className="dr-modal-field">
                        <label className="dr-field-label">Amount</label>
                        <div className="dr-amount-input-wrap">
                            <span className="dr-currency-symbol">$</span>
                            <input type="number" className="dr-amount-input" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} min="0.01" step="0.01" autoFocus />
                        </div>
                        {!isDeposit && numAmount > balance && <span className="dr-field-error">Exceeds your balance (${balance.toFixed(2)})</span>}
                    </div>

                    <div className="dr-presets">
                        {presets.map(p => (
                            <button key={p} className={`dr-preset-btn ${numAmount === p ? 'active' : ''}`} onClick={() => setAmount(String(p))}>${p.toLocaleString()}</button>
                        ))}
                    </div>

                    <div className="dr-modal-field">
                        <label className="dr-field-label">{isDeposit ? 'Source (optional)' : 'Reason (optional)'}</label>
                        <input type="text" className="dr-text-input" placeholder={isDeposit ? 'e.g. Salary, Freelance...' : 'e.g. ATM, Transfer...'} value={source} onChange={e => setSource(e.target.value)} />
                    </div>
                </div>

                <div className="dr-modal-footer">
                    <button className="dr-modal-cancel" onClick={onClose}>Cancel</button>
                    <button className={`dr-modal-confirm ${isDeposit ? 'green' : 'orange'}`} disabled={!isValid} onClick={() => onConfirm(numAmount, source)}>
                        {isDeposit ? 'Deposit' : 'Withdraw'} ${numAmount > 0 ? numAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ═══ BRAND EXPENSE SECTION (reused from practice mode) ═══ */
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
            onAddExpense({ name: item.name, amount: numAmount, emoji: item.fallbackEmoji || '💳', category: item.category, logo: item.logo ? item.id : null, type: 'expense' });
            setAddingId(null);
            setSuccessId(item.id);
            setAmounts(prev => ({ ...prev, [item.id]: '' }));
            setTimeout(() => setSuccessId(null), 1500);
        }, 300);
    };

    return (
        <div className="pm-brand-section">
            <div className="pm-brand-header">
                <div className="pm-brand-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg></div>
                <div><h3 className="pm-brand-title">Add Expense</h3><p className="pm-brand-sub">Track your daily spending</p></div>
            </div>
            <div className="pm-brand-tabs">
                {categories.map(tab => (<button key={tab} className={`pm-brand-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>{tab}</button>))}
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
                                {item.logo ? (<div className="pm-brand-logo-wrap"><img src={item.logo} alt={item.name} className="pm-brand-logo" /></div>) : (<div className="pm-brand-emoji-wrap"><span className="pm-brand-emoji">{item.fallbackEmoji}</span></div>)}
                                <div className="pm-brand-info"><span className="pm-brand-name">{item.name}</span><span className="pm-brand-cat">{item.category}</span></div>
                            </div>
                            <div className="pm-brand-input-row">
                                <div className={`pm-brand-input-wrap ${isOverBudget ? 'error' : ''}`}>
                                    <span className="pm-brand-currency">$</span>
                                    <input type="number" className="pm-brand-input" placeholder={item.placeholder} value={amounts[item.id] || ''} onChange={e => setAmounts(prev => ({ ...prev, [item.id]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && isValid && handleAdd(item)} min="0.01" step="0.01" />
                                </div>
                                <button className={`pm-brand-add-btn ${isSuccess ? 'success' : ''} ${isAdding ? 'loading' : ''}`} onClick={() => handleAdd(item)} disabled={!isValid || isAdding}>
                                    {isSuccess ? (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8"><polyline points="20 6 9 17 4 12"/></svg>) : isAdding ? (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{animation:'pmSpin 0.7s linear infinite'}}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/></svg>) : (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>)}
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
            onAddExpense({ name: name.trim(), amount: numAmount, emoji: selectedCat?.emoji || '📝', category, type: 'expense' });
            setIsAdding(false); setShowSuccess(true); setName(''); setAmount('');
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
                <div><h3 className="pm-custom-title">Add Custom Expense</h3><p className="pm-custom-sub">Track anything else you bought</p></div>
            </div>
            <form className="pm-custom-form" onSubmit={handleSubmit}>
                <div className="pm-custom-row">
                    <div className="pm-custom-field pm-custom-field-name">
                        <label className="pm-field-label">What did you buy?</label>
                        <div className="pm-input-wrap"><span className="pm-input-emoji">{selectedCat?.emoji || '📝'}</span><input type="text" className="pm-custom-input" placeholder="e.g. Gym, Uber ride..." value={name} onChange={e => setName(e.target.value)} maxLength={50} /></div>
                    </div>
                    <div className="pm-custom-field pm-custom-field-amount">
                        <label className="pm-field-label">Amount</label>
                        <div className="pm-input-wrap pm-input-amount-wrap"><span className="pm-input-currency">$</span><input type="number" className="pm-custom-input pm-amount-input" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} min="0.01" step="0.01" /></div>
                        {isOverBudget && <span className="pm-field-error">Exceeds balance</span>}
                    </div>
                </div>
                <div className="pm-custom-field">
                    <label className="pm-field-label">Category</label>
                    <div className="pm-category-pills">
                        {CUSTOM_CATEGORIES.map(cat => (<button key={cat.value} type="button" className={`pm-cat-pill ${category === cat.value ? 'active' : ''}`} onClick={() => setCategory(cat.value)}><span>{cat.emoji}</span><span>{cat.label}</span></button>))}
                    </div>
                </div>
                <div className="pm-custom-footer">
                    <button type="submit" className={`pm-custom-submit ${isAdding ? 'adding' : ''} ${showSuccess ? 'success' : ''}`} disabled={!isValid || isAdding}>
                        {showSuccess ? (<><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8"><polyline points="20 6 9 17 4 12"/></svg> Added!</>) : isAdding ? (<>Adding...</>) : (<><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Expense</>)}
                    </button>
                </div>
            </form>
        </div>
    );
};

/* ═══ SPENDING TREND CHART ═══ */
const SpendingTrendChart = ({ transactions }) => {
    const [tooltip, setTooltip] = useState(null);
    const expenses = transactions.filter(t => t.type === 'expense');

    if (expenses.length === 0) return (
        <div className="pm-chart-card"><div className="pm-chart-hdr"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg><span>Spending Trend</span></div><div className="pm-chart-empty"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg><span>No spending data yet</span><span className="sub">Add expenses to see your trend</span></div></div>
    );

    let running = 0;
    const points = expenses.map((t, i) => { running += t.amount; return { index: i, amount: t.amount, cumulative: running, name: t.name, category: t.category }; });
    const W = 320, H = 140, PAD = { top: 16, right: 16, bottom: 28, left: 48 };
    const chartW = W - PAD.left - PAD.right, chartH = H - PAD.top - PAD.bottom;
    const maxVal = Math.max(...points.map(p => p.cumulative), 1);
    const n = points.length;
    const xOf = i => PAD.left + (n === 1 ? chartW / 2 : (i / (n - 1)) * chartW);
    const yOf = v => PAD.top + chartH - (v / maxVal) * chartH;
    const linePts = points.map((p, i) => `${xOf(i)},${yOf(p.cumulative)}`).join(' ');
    const areaPath = `M${xOf(0)},${yOf(points[0].cumulative)} ` + points.slice(1).map((p, i) => `L${xOf(i + 1)},${yOf(p.cumulative)}`).join(' ') + ` L${xOf(n - 1)},${PAD.top + chartH} L${xOf(0)},${PAD.top + chartH} Z`;

    return (
        <div className="pm-chart-card pm-chart-card--trend">
            <div className="pm-chart-hdr"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg><span>Spending Trend</span><span className="pm-chart-badge">{n} expense{n !== 1 ? 's' : ''}</span></div>
            <div className="pm-trend-stats-row">
                <div className="pm-trend-stat"><span className="pm-trend-stat-label">Total Spent</span><span className="pm-trend-stat-val">${running.toFixed(2)}</span></div>
                <div className="pm-trend-stat"><span className="pm-trend-stat-label">Avg / Txn</span><span className="pm-trend-stat-val">${(running / n).toFixed(2)}</span></div>
                <div className="pm-trend-stat"><span className="pm-trend-stat-label">Largest</span><span className="pm-trend-stat-val pm-trend-stat-val--red">${Math.max(...expenses.map(t => t.amount)).toFixed(2)}</span></div>
            </div>
            <div className="pm-trend-svg-wrap">
                <svg viewBox={`0 0 ${W} ${H}`} className="pm-trend-svg" style={{ display: 'block', width: '100%' }}>
                    <defs><linearGradient id="drFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" /><stop offset="100%" stopColor="#3b82f6" stopOpacity="0" /></linearGradient></defs>
                    <path d={areaPath} fill="url(#drFill)" />
                    <polyline points={linePts} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    {points.map((p, i) => (<g key={i} onMouseEnter={() => setTooltip({ i, x: xOf(i), y: yOf(p.cumulative), ...p })} onMouseLeave={() => setTooltip(null)} style={{ cursor: 'pointer' }}><circle cx={xOf(i)} cy={yOf(p.cumulative)} r="10" fill="transparent" /><circle cx={xOf(i)} cy={yOf(p.cumulative)} r={tooltip?.i === i ? 5 : 3.5} fill={tooltip?.i === i ? '#fff' : '#3b82f6'} stroke={tooltip?.i === i ? '#3b82f6' : '#1e3a8a'} strokeWidth="2" /></g>))}
                </svg>
                {tooltip && (<div className="pm-trend-tooltip" style={{ left: `${(tooltip.x / W) * 100}%`, top: `${(tooltip.y / H) * 100}%` }}><div className="pm-tt-name">{tooltip.name}</div><div className="pm-tt-row"><span>Amount</span><span className="pm-tt-red">-${tooltip.amount.toFixed(2)}</span></div><div className="pm-tt-row"><span>Running total</span><span>${tooltip.cumulative.toFixed(2)}</span></div><div className="pm-tt-cat">{tooltip.category}</div></div>)}
            </div>
        </div>
    );
};

/* ═══ SPENDING BY CATEGORY CHART ═══ */
const SpendingByCategoryChart = ({ transactions }) => {
    const [hovered, setHovered] = useState(null);
    const colors = { Groceries: '#3b82f6', Subscriptions: '#8b5cf6', Shopping: '#a78bfa', Transport: '#06b6d4', Dining: '#f59e0b', Bills: '#ef4444', Health: '#10b981', Entertainment: '#ec4899', Education: '#f97316', Other: '#6b7280' };
    const expenses = transactions.filter(t => t.type === 'expense');

    if (expenses.length === 0) return (
        <div className="pm-chart-card"><div className="pm-chart-hdr"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg><span>By Category</span></div><div className="pm-chart-empty"><span>No data yet</span></div></div>
    );

    const totals = {};
    expenses.forEach(t => { totals[t.category] = (totals[t.category] || 0) + t.amount; });
    const total = Object.values(totals).reduce((a, b) => a + b, 0);
    const segs = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    const r = 34, circ = 2 * Math.PI * r;
    let off = -circ * 0.25;

    return (
        <div className="pm-chart-card pm-chart-card--cat">
            <div className="pm-chart-hdr"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg><span>By Category</span></div>
            <div className="pm-donut-area">
                <div className="pm-donut-wrap">
                    <svg viewBox="0 0 100 100" className="pm-donut">
                        {segs.map(([cat, amt]) => { const pct = amt / total; const dash = pct * circ; const gap = circ - dash; const cur = off; off += pct * circ; const isHov = hovered === cat; return (<circle key={cat} cx="50" cy="50" r={r} fill="none" stroke={colors[cat] || '#666'} strokeWidth={isHov ? 10 : 7} strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-cur} strokeLinecap="round" className="pm-donut-seg" style={{ filter: isHov ? `drop-shadow(0 0 6px ${colors[cat] || '#666'})` : 'none' }} onMouseEnter={() => setHovered(cat)} onMouseLeave={() => setHovered(null)} />); })}
                    </svg>
                    <div className="pm-donut-center">
                        {hovered ? (<><span className="pm-donut-center-pct" style={{ color: colors[hovered] || '#fff' }}>{((totals[hovered] / total) * 100).toFixed(0)}%</span><span className="pm-donut-center-label">{hovered}</span></>) : (<><span className="pm-donut-center-total">${total >= 1000 ? `${(total / 1000).toFixed(1)}k` : total.toFixed(0)}</span><span className="pm-donut-center-label">total</span></>)}
                    </div>
                </div>
                <div className="pm-donut-legend">
                    {segs.map(([cat, amt]) => (<div key={cat} className={`pm-legend-item ${hovered === cat ? 'hovered' : ''}`} onMouseEnter={() => setHovered(cat)} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}><span className="pm-legend-dot" style={{ background: colors[cat] || '#666' }} /><span className="pm-legend-name">{cat}</span><div className="pm-legend-right"><span className="pm-legend-pct">{((amt / total) * 100).toFixed(0)}%</span><span className="pm-legend-amt">${amt.toFixed(2)}</span></div></div>))}
                    <div className="pm-legend-total-row"><span>Total</span><span className="pm-legend-total-val">${total.toFixed(2)}</span></div>
                </div>
            </div>
        </div>
    );
};

/* ═══ RECENT TRANSACTIONS LIST ═══ */
const RecentTransactions = ({ transactions, onDelete }) => (
    <div className="pm-txns">
        <div className="pm-txns-header"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg><span>Recent Transactions</span></div>
        <div className="pm-txns-list">
            {transactions.length === 0 ? (
                <div className="pm-txns-empty"><span>No transactions yet</span><span className="pm-txns-sub">Deposit money and add expenses to start tracking</span></div>
            ) : transactions.slice(0, 10).map((t, i) => (
                <div key={t.id || i} className="pm-txn-row">
                    {t.logo && logoMap[t.logo] ? (<img src={logoMap[t.logo]} alt={t.name} className="pm-txn-logo" />) : (<span className="pm-txn-emoji">{t.emoji || (t.type === 'deposit' ? '💰' : '💳')}</span>)}
                    <div className="pm-txn-info"><span className="pm-txn-name">{t.name}</span><span className="pm-txn-cat">{t.category}{t.created_at ? ` · ${new Date(t.created_at).toLocaleDateString()}` : ''}</span></div>
                    <span className="pm-txn-amt" style={{ color: t.type === 'deposit' ? '#10b981' : '#ef4444' }}>{t.type === 'deposit' ? '+' : '-'}${t.amount.toFixed(2)}</span>
                </div>
            ))}
        </div>
    </div>
);

/* ═══ MONTHLY SUMMARY CARD ═══ */
const MonthlySummaryCard = ({ summaries }) => {
    if (!summaries || summaries.length === 0) return null;
    const current = summaries[0];
    const previous = summaries[1];
    const changePercent = previous && previous.totalExpenses > 0
        ? (((current.totalExpenses - previous.totalExpenses) / previous.totalExpenses) * 100).toFixed(0)
        : null;

    return (
        <div className="dr-monthly-summary">
            <div className="dr-monthly-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                <span>Monthly Overview — {current.month}</span>
            </div>
            <div className="dr-monthly-stats">
                <div className="dr-mstat"><span className="dr-mstat-label">Deposited</span><span className="dr-mstat-val green">${current.totalDeposits.toFixed(2)}</span></div>
                <div className="dr-mstat"><span className="dr-mstat-label">Spent</span><span className="dr-mstat-val red">${current.totalExpenses.toFixed(2)}</span></div>
                <div className="dr-mstat"><span className="dr-mstat-label">Net</span><span className="dr-mstat-val" style={{ color: current.saved >= 0 ? '#10b981' : '#ef4444' }}>${current.saved.toFixed(2)}</span></div>
                <div className="dr-mstat"><span className="dr-mstat-label">Transactions</span><span className="dr-mstat-val">{current.transactionCount}</span></div>
            </div>
            {changePercent !== null && (
                <div className="dr-monthly-change" style={{ color: Number(changePercent) <= 0 ? '#10b981' : '#ef4444' }}>
                    {Number(changePercent) <= 0 ? '↓' : '↑'} {Math.abs(Number(changePercent))}% {Number(changePercent) <= 0 ? 'less' : 'more'} spending than {previous.month}
                </div>
            )}
            {current.topCategory && (
                <div className="dr-monthly-top">Top category: <strong>{current.topCategory[0]}</strong> — ${current.topCategory[1].toFixed(2)}</div>
            )}
        </div>
    );
};


/* ═══════════════════════════════════════════
   MAIN DASHBOARD COMPONENT
   ═══════════════════════════════════════════ */
const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAIAssistant, setShowAIAssistant] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const [showFullChat, setShowFullChat] = useState(false);

    // Finance state (persisted in Supabase)
    const [balance, setBalance] = useState(0);
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [monthlySummaries, setMonthlySummaries] = useState([]);
    const [financeLoading, setFinanceLoading] = useState(true);

    // UI state
    const [moneyModal, setMoneyModal] = useState(null); // 'deposit' | 'withdraw' | null
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'expenses' | 'analytics'
    const chartsRef = useRef(null);

    // Load user
    useEffect(() => { checkUser(); }, []);

    // Load financial data when user is set
    useEffect(() => {
        if (user) loadFinancialData();
    }, [user]);

    // Tutorial trigger
    useEffect(() => {
        if (!loading && user) {
            const tutorialCompleted = localStorage.getItem('finscope_tutorial_completed');
            const hasSeenDashboard = sessionStorage.getItem('dashboard_visited');
            if (!tutorialCompleted && !hasSeenDashboard) {
                const timer = setTimeout(() => setShowTutorial(true), 1500);
                sessionStorage.setItem('dashboard_visited', 'true');
                return () => clearTimeout(timer);
            }
        }
    }, [user, loading]);

    const checkUser = async () => {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error || !user) { setLoading(false); navigate('/login'); return; }
            setUser(user);
            try {
                const { data: profileData } = await supabase.from('user_profiles').select('*').eq('id', user.id).single();
                if (profileData) setProfile(profileData);
            } catch (e) {}
            setLoading(false);
        } catch (error) { setLoading(false); navigate('/login'); }
    };

    const loadFinancialData = async () => {
        if (!user) return;
        setFinanceLoading(true);
        try {
            // Get or create finance profile
            const finance = await getUserFinance(user.id);
            setBalance(finance.balance || 0);
            setTotalIncome(finance.total_income || 0);
            setTotalExpenses(finance.total_expenses || 0);

            // Get recent transactions
            const txns = await getTransactions(user.id, { limit: 50 });
            setTransactions(txns);

            // Get monthly summaries
            const summaries = await getMonthlySummaries(user.id, 3);
            setMonthlySummaries(summaries);
        } catch (err) {
            console.error('Error loading financial data:', err);
        }
        setFinanceLoading(false);
    };

    const handleDeposit = async (amount, source) => {
        try {
            const result = await addTransaction(user.id, {
                name: source || 'Deposit',
                amount,
                type: 'deposit',
                category: 'Income',
                emoji: '💰',
            });
            setBalance(result.newBalance);
            setTotalIncome(result.newIncome);
            setMoneyModal(null);
            await loadFinancialData(); // Refresh
        } catch (err) {
            console.error('Deposit failed:', err);
            alert('Failed to deposit. Please try again.');
        }
    };

    const handleWithdraw = async (amount, reason) => {
        try {
            const result = await addTransaction(user.id, {
                name: reason || 'Withdrawal',
                amount,
                type: 'withdrawal',
                category: 'Withdrawal',
                emoji: '🏧',
            });
            setBalance(result.newBalance);
            setMoneyModal(null);
            await loadFinancialData();
        } catch (err) {
            console.error('Withdrawal failed:', err);
            alert('Failed to withdraw. Please try again.');
        }
    };

    const handleAddExpense = async (expense) => {
        try {
            const result = await addTransaction(user.id, {
                name: expense.name,
                amount: expense.amount,
                type: 'expense',
                category: expense.category,
                emoji: expense.emoji,
                logo: expense.logo,
            });
            setBalance(result.newBalance);
            setTotalExpenses(result.newExpenses);
            await loadFinancialData();
        } catch (err) {
            console.error('Expense failed:', err);
            alert('Failed to add expense. Please try again.');
        }
    };

    const getUserDisplayName = () => {
        if (profile?.first_name && profile?.last_name) return `${profile.first_name} ${profile.last_name}`;
        if (profile?.username) return profile.username;
        if (user?.email) return user.email.split('@')[0];
        return 'User';
    };

    const savings = totalIncome - totalExpenses;
    const savingsPct = totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(0) : 0;
    const expenseTransactions = transactions.filter(t => t.type === 'expense');

    if (loading) {
        return (<div className="dashboard-loading"><div className="loading-orb"><FinScopeAI /></div><p className="loading-text">Loading your dashboard...</p></div>);
    }
    if (!user) { navigate('/login'); return null; }

    return (
        <div className="dashboard">
            {showTutorial && <DashboardTutorial onComplete={() => setShowTutorial(false)} onSkip={() => setShowTutorial(false)} />}

            {/* ═══ HEADER ═══ */}
            <header className="dashboard-header">
                <div className="dashboard-header-content">
                    <div className="dashboard-header-left">
                        <div className="dashboard-logo"><FinScopeAI /></div>
                        <div className="welcome-text">
                            <h1>Welcome back, <span className="username">{getUserDisplayName()}</span></h1>
                            <p>Here's your financial overview</p>
                        </div>
                    </div>
                    <div className="dashboard-header-right desktop-only">
                        <button className="btn-tutorial" onClick={() => setShowTutorial(true)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg><span>Tutorial</span>
                        </button>
                        <button className="pm-fab-chat" onClick={() => setShowFullChat(true)}>
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                            Chat with AI
                        </button>
                        <button className="btn-leave" onClick={() => navigate('/')}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg><span>Home</span>
                        </button>
                        <UserMenu />
                    </div>
                    <button className="mobile-menu-toggle mobile-only" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{mobileMenuOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}</svg>
                    </button>
                </div>
                {mobileMenuOpen && (
                    <div className="mobile-menu">
                        <button className="mobile-menu-item" onClick={() => { setShowFullChat(true); setMobileMenuOpen(false); }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg><span>AI Chat</span>
                        </button>
                        <button className="mobile-menu-item" onClick={() => { navigate('/practice'); setMobileMenuOpen(false); }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg><span>Practice Mode</span>
                        </button>
                        <button className="mobile-menu-item" onClick={() => { navigate('/'); setMobileMenuOpen(false); }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg><span>Home</span>
                        </button>
                        <div className="mobile-menu-divider" />
                        <UserMenu />
                    </div>
                )}
            </header>

            {/* ═══ MAIN CONTENT ═══ */}
            <main className="dashboard-main">
                <div className="dashboard-container">

                    {/* ═══ BALANCE & ACTIONS ROW ═══ */}
                    <div className="dr-balance-row">
                        <div className="dr-balance-card">
                            <div className="dr-balance-top-row">
                                <div>
                                    <span className="dr-balance-label">Total Balance</span>
                                    <span className="dr-balance-amount">${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="dr-balance-actions">
                                    <button className="dr-action-btn dr-deposit" onClick={() => setMoneyModal('deposit')}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12l7-7 7 7" /></svg>
                                        Deposit
                                    </button>
                                    <button className="dr-action-btn dr-withdraw" onClick={() => setMoneyModal('withdraw')} disabled={balance <= 0}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 19V5M5 12l7 7 7-7" /></svg>
                                        Withdraw
                                    </button>
                                </div>
                            </div>
                            <div className="dr-balance-stats">
                                <div className="dr-bstat"><span className="dr-bstat-label">Total Income</span><span className="dr-bstat-val green">+${totalIncome.toFixed(2)}</span></div>
                                <div className="dr-bstat-sep" />
                                <div className="dr-bstat"><span className="dr-bstat-label">Total Expenses</span><span className="dr-bstat-val red">-${totalExpenses.toFixed(2)}</span></div>
                                <div className="dr-bstat-sep" />
                                <div className="dr-bstat"><span className="dr-bstat-label">Savings</span><span className="dr-bstat-val" style={{ color: savings >= 0 ? '#10b981' : '#ef4444' }}>{savingsPct}%</span></div>
                            </div>
                        </div>
                    </div>

                    {/* ═══ TAB NAVIGATION ═══ */}
                    <div className="dr-tabs">
                        <button className={`dr-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>Overview
                        </button>
                        <button className={`dr-tab ${activeTab === 'expenses' ? 'active' : ''}`} onClick={() => setActiveTab('expenses')}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>Add Expenses
                        </button>
                        <button className={`dr-tab ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>Analytics
                        </button>
                    </div>

                    {/* ═══ OVERVIEW TAB ═══ */}
                    {activeTab === 'overview' && (
                        <>
                            {/* Practice Mode CTA */}
                            <div className="practice-cta-banner" onClick={() => navigate('/practice')}>
                                <div className="practice-cta-left">
                                    <div className="practice-cta-orb"><div className="practice-cta-orb-inner"><div className="pcta-eye" /><div className="pcta-eye" /></div><div className="practice-cta-orb-shine" /></div>
                                    <div className="practice-cta-text">
                                        <div className="practice-cta-badge-row"><span className="practice-cta-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>SANDBOX</span></div>
                                        <h3 className="practice-cta-title">Try Practice Mode</h3>
                                        <p className="practice-cta-desc">Practice managing money with virtual funds — no real money at risk!</p>
                                    </div>
                                </div>
                                <button className="practice-cta-btn" onClick={(e) => { e.stopPropagation(); navigate('/practice'); }}>
                                    Start Practicing<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                </button>
                            </div>

                            {/* Monthly Summary */}
                            <MonthlySummaryCard summaries={monthlySummaries} />

                            {/* Charts */}
                            <div className="pm-charts-row" ref={chartsRef}>
                                <SpendingTrendChart transactions={transactions} />
                                <SpendingByCategoryChart transactions={transactions} />
                            </div>

                            {/* AI Insights + Recent Transactions */}
                            <div className="dr-bottom-grid">
                                <div className="dr-bottom-left">
                                    <AIInsightsDashboard
                                        transactions={expenseTransactions.map(t => ({ ...t, amount: t.amount }))}
                                        balance={balance}
                                        totalSpent={totalExpenses}
                                        startingBalance={totalIncome || balance + totalExpenses}
                                        onOpenChat={() => setShowFullChat(true)}
                                    />
                                </div>
                                <div className="dr-bottom-right">
                                    <RecentTransactions transactions={transactions} />
                                </div>
                            </div>
                        </>
                    )}

                    {/* ═══ EXPENSES TAB ═══ */}
                    {activeTab === 'expenses' && (
                        <>
                            <BrandExpenseSection balance={balance} onAddExpense={handleAddExpense} />
                            <CustomExpenseForm balance={balance} onAddExpense={handleAddExpense} />
                        </>
                    )}

                    {/* ═══ ANALYTICS TAB ═══ */}
                    {activeTab === 'analytics' && (
                        <>
                            <div className="pm-charts-row">
                                <SpendingTrendChart transactions={transactions} />
                                <SpendingByCategoryChart transactions={transactions} />
                            </div>
                            <MonthlySummaryCard summaries={monthlySummaries} />
                            {monthlySummaries.length > 1 && (
                                <div className="dr-multi-month">
                                    <div className="dr-monthly-header">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                                        <span>Monthly Comparison</span>
                                    </div>
                                    <div className="dr-month-bars">
                                        {monthlySummaries.filter(s => s.transactionCount > 0).map((s, i) => {
                                            const maxExp = Math.max(...monthlySummaries.map(m => m.totalExpenses), 1);
                                            return (
                                                <div key={i} className="dr-month-bar-row">
                                                    <span className="dr-month-label">{s.month.split(' ')[0].substring(0, 3)}</span>
                                                    <div className="dr-month-bar-track">
                                                        <div className="dr-month-bar-fill" style={{ width: `${(s.totalExpenses / maxExp) * 100}%`, background: i === 0 ? 'linear-gradient(90deg, #3b82f6, #8b5cf6)' : 'rgba(255,255,255,0.15)' }} />
                                                    </div>
                                                    <span className="dr-month-val">${s.totalExpenses.toFixed(0)}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            <RecentTransactions transactions={transactions} />
                        </>
                    )}
                </div>
            </main>

            {/* Floating AI button (mobile) */}
            <button className="floating-ai-btn mobile-only" onClick={() => setShowFullChat(true)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            </button>

            {/* Modals */}
            {moneyModal && (
                <MoneyModal
                    type={moneyModal}
                    balance={balance}
                    onClose={() => setMoneyModal(null)}
                    onConfirm={moneyModal === 'deposit' ? handleDeposit : handleWithdraw}
                />
            )}

            {showAIAssistant && <AIAssistant onClose={() => setShowAIAssistant(false)} user={user} />}

            <FullscreenAIChat
                open={showFullChat}
                onClose={() => setShowFullChat(false)}
                transactions={expenseTransactions.map(t => ({ ...t, amount: t.amount }))}
                balance={balance}
                totalSpent={totalExpenses}
                startingBalance={totalIncome || balance + totalExpenses}
            />
        </div>
    );
};

export default Dashboard;