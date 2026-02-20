import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import UserMenu from '../components/UserMenu.jsx';
import FinScopeAI from '../components/FinScopeAI';
import AIAssistant from '../components/AIAssistant';
import DashboardTutorial from '../components/DashboardTutorial';
import { FullscreenAIChat, AIInsightsDashboard } from '../components/FullscreenAIchat.jsx';
import { useCurrency, CURRENCIES } from '../contexts/CurrencyContext.jsx';
import {
    initUserFinance, getUserFinance, addTransaction,
    getTransactions, getMonthlySummaries, getCategorySummary, deleteTransaction
} from '../services/financeService';
import { sendMessage } from '../services/claudeAI';
import './Dashboard-Enhanced.css';
import './DashboardReal.css';

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
/* ═══ FINSCOPE AI TOAST ═══ */
const FinScopeToast = ({ visible, onDone }) => {
    useEffect(() => {
        if (visible) { const t = setTimeout(onDone, 3800); return () => clearTimeout(t); }
    }, [visible, onDone]);
    if (!visible) return null;
    return (
        <div className="fst-overlay">
            <div className="fst-card">
                <div className="fst-orb-wrap">
                    <div className="fst-orb">
                        <div className="fst-eyes">
                            <div className="fst-eye" />
                            <div className="fst-eye" />
                        </div>
                        <div className="fst-orb-shine" />
                    </div>
                    <div className="fst-orb-glow" />
                </div>
                <div className="fst-bubble">
                    <div className="fst-bubble-tail" />
                    <p className="fst-msg">You're not Elon Musk, buddy 😅</p>
                    <span className="fst-sub">Max deposit is $15,000,000</span>
                </div>
            </div>
        </div>
    );
};

const DEPOSIT_LIMIT = 15_000_000;

const MoneyModal = ({ type, onClose, onConfirm, balance }) => {
    const { currency, fmt } = useCurrency();
    const [amount, setAmount] = useState('');
    const [source, setSource] = useState('');
    const [showToast, setShowToast] = useState(false);
    const isDeposit = type === 'deposit';
    const numAmount = parseFloat(amount) || 0;
    const overLimit = isDeposit && numAmount > DEPOSIT_LIMIT;
    const isValid = numAmount > 0 && (isDeposit ? !overLimit : numAmount <= balance);
    const presets = isDeposit ? [500, 1000, 2000, 5000] : [50, 100, 500, 1000];
    const sym = currency?.symbol || '$';

    const handleAmountChange = (val) => {
        setAmount(val);
        const n = parseFloat(val) || 0;
        if (isDeposit && n > DEPOSIT_LIMIT) setShowToast(true);
    };

    return (
        <>
            <FinScopeToast visible={showToast} onDone={() => setShowToast(false)} />
            <div className="dr-modal-overlay" onClick={onClose}>
                <div className="dr-modal" onClick={e => e.stopPropagation()}>
                    <div className="dr-modal-header">
                        <div className={`dr-modal-icon ${isDeposit ? 'green' : 'orange'}`}>
                            {isDeposit ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7-7 7 7" /></svg>
                                : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5M5 12l7 7 7-7" /></svg>}
                        </div>
                        <div><h3 className="dr-modal-title">{isDeposit ? 'Deposit Money' : 'Withdraw Money'}</h3><p className="dr-modal-sub">{isDeposit ? `Max ${fmt(DEPOSIT_LIMIT, { decimals: 0 })}` : 'Take money out'}</p></div>
                        <button className="dr-modal-close" onClick={onClose}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
                    </div>
                    <div className="dr-modal-body">
                        <div className="dr-modal-field">
                            <label className="dr-field-label">Amount</label>
                            <div className={`dr-amount-input-wrap ${overLimit ? 'dr-input-over-limit' : ''}`}>
                                <span className="dr-currency-symbol">{sym}</span>
                                <input type="number" className="dr-amount-input" placeholder="0.00" value={amount} onChange={e => handleAmountChange(e.target.value)} min="0.01" step="0.01" autoFocus />
                            </div>
                            {overLimit && <span className="dr-field-error">🚫 Max deposit is {fmt(DEPOSIT_LIMIT, { decimals: 0 })} — you're not Elon Musk!</span>}
                            {!isDeposit && numAmount > balance && <span className="dr-field-error">Exceeds balance ({fmt(balance)})</span>}
                        </div>
                        <div className="dr-presets">{presets.map(p => (<button key={p} className={`dr-preset-btn ${numAmount === p ? 'active' : ''}`} onClick={() => setAmount(String(p))}>{fmt(p, { decimals: 0 })}</button>))}</div>
                        <div className="dr-modal-field">
                            <label className="dr-field-label">{isDeposit ? 'Source (optional)' : 'Reason (optional)'}</label>
                            <input type="text" className="dr-text-input" placeholder={isDeposit ? 'e.g. Salary, Freelance...' : 'e.g. ATM, Transfer...'} value={source} onChange={e => setSource(e.target.value)} />
                        </div>
                    </div>
                    <div className="dr-modal-footer">
                        <button className="dr-modal-cancel" onClick={onClose}>Cancel</button>
                        <button className={`dr-modal-confirm ${isDeposit ? 'green' : 'orange'}`} disabled={!isValid} onClick={() => onConfirm(numAmount, source)}>{isDeposit ? 'Deposit' : 'Withdraw'} {fmt(numAmount)}</button>
                    </div>
                </div>
            </div>
        </>
    );
};

/* ═══ BRAND EXPENSE SECTION ═══ */
const BrandExpenseSection = ({ balance, onAddExpense, fmt, currency }) => {
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
            setAddingId(null); setSuccessId(item.id); setAmounts(prev => ({ ...prev, [item.id]: '' }));
            setTimeout(() => setSuccessId(null), 1500);
        }, 300);
    };
    const sym = currency?.symbol || '$';
    return (
        <div className="pm-brand-section">
            <div className="pm-brand-header"><div className="pm-brand-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg></div><div><h3 className="pm-brand-title">Add Expense</h3><p className="pm-brand-sub">Track your daily spending</p></div></div>
            <div className="pm-brand-tabs">{categories.map(tab => (<button key={tab} className={`pm-brand-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>{tab}</button>))}</div>
            <div className="pm-brand-grid">
                {filteredItems.map(item => {
                    const numAmount = parseFloat(amounts[item.id]) || 0;
                    const isOverBudget = numAmount > balance;
                    const isValid = numAmount > 0 && !isOverBudget;
                    return (
                        <div key={item.id} className={`pm-brand-card ${addingId === item.id ? 'adding' : ''} ${successId === item.id ? 'success' : ''}`}>
                            <div className="pm-brand-card-top">
                                {item.logo ? <div className="pm-brand-logo-wrap"><img src={item.logo} alt={item.name} className="pm-brand-logo" /></div> : <div className="pm-brand-emoji-wrap"><span className="pm-brand-emoji">{item.fallbackEmoji}</span></div>}
                                <div className="pm-brand-info"><span className="pm-brand-name">{item.name}</span><span className="pm-brand-cat">{item.category}</span></div>
                            </div>
                            <div className="pm-brand-input-row">
                                <div className={`pm-brand-input-wrap ${isOverBudget ? 'error' : ''}`}><span className="pm-brand-currency">{sym}</span><input type="number" className="pm-brand-input" placeholder={item.placeholder} value={amounts[item.id] || ''} onChange={e => setAmounts(prev => ({ ...prev, [item.id]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && isValid && handleAdd(item)} min="0.01" step="0.01" /></div>
                                <button className={`pm-brand-add-btn ${successId === item.id ? 'success' : ''} ${addingId === item.id ? 'loading' : ''}`} onClick={() => handleAdd(item)} disabled={!isValid || addingId === item.id}>{successId === item.id ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8"><polyline points="20 6 9 17 4 12"/></svg> : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}</button>
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
const CustomExpenseForm = ({ balance, onAddExpense, fmt, currency }) => {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Other');
    const [isAdding, setIsAdding] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const selectedCat = CUSTOM_CATEGORIES.find(c => c.value === category);
    const numAmount = parseFloat(amount) || 0;
    const isOverBudget = numAmount > balance;
    const isValid = name.trim() && numAmount > 0 && !isOverBudget;
    const sym = currency?.symbol || '$';
    const handleSubmit = (e) => {
        e.preventDefault(); if (!isValid) return;
        setIsAdding(true);
        setTimeout(() => { onAddExpense({ name: name.trim(), amount: numAmount, emoji: selectedCat?.emoji || '📝', category, type: 'expense' }); setIsAdding(false); setShowSuccess(true); setName(''); setAmount(''); setTimeout(() => setShowSuccess(false), 2000); }, 300);
    };
    return (
        <div className="pm-custom-expense">
            <div className="pm-custom-header"><div className="pm-custom-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg></div><div><h3 className="pm-custom-title">Add Custom Expense</h3><p className="pm-custom-sub">Track anything else</p></div></div>
            <form className="pm-custom-form" onSubmit={handleSubmit}>
                <div className="pm-custom-row">
                    <div className="pm-custom-field pm-custom-field-name"><label className="pm-field-label">What did you buy?</label><div className="pm-input-wrap"><span className="pm-input-emoji">{selectedCat?.emoji || '📝'}</span><input type="text" className="pm-custom-input" placeholder="e.g. Gym, Uber ride..." value={name} onChange={e => setName(e.target.value)} maxLength={50} /></div></div>
                    <div className="pm-custom-field pm-custom-field-amount"><label className="pm-field-label">Amount</label><div className="pm-input-wrap pm-input-amount-wrap"><span className="pm-input-currency">{sym}</span><input type="number" className="pm-custom-input pm-amount-input" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} min="0.01" step="0.01" /></div>{isOverBudget && <span className="pm-field-error">Exceeds balance</span>}</div>
                </div>
                <div className="pm-custom-field"><label className="pm-field-label">Category</label><div className="pm-category-pills">{CUSTOM_CATEGORIES.map(cat => (<button key={cat.value} type="button" className={`pm-cat-pill ${category === cat.value ? 'active' : ''}`} onClick={() => setCategory(cat.value)}><span>{cat.emoji}</span><span>{cat.label}</span></button>))}</div></div>
                <div className="pm-custom-footer"><button type="submit" className={`pm-custom-submit ${isAdding ? 'adding' : ''} ${showSuccess ? 'success' : ''}`} disabled={!isValid || isAdding}>{showSuccess ? <>✓ Added!</> : <>+ Add Expense</>}</button></div>
            </form>
        </div>
    );
};

/* ═══ SPENDING TREND CHART ═══ */
const SpendingTrendChart = ({ transactions, fmt }) => {
    const [tooltip, setTooltip] = useState(null);
    const expenses = transactions.filter(t => t.type === 'expense');
    if (expenses.length === 0) return (<div className="pm-chart-card"><div className="pm-chart-hdr"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg><span>Spending Trend</span></div><div className="pm-chart-empty"><span>No spending data yet</span><span className="sub">Add expenses to see your trend</span></div></div>);
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
                <div className="pm-trend-stat"><span className="pm-trend-stat-label">Total Spent</span><span className="pm-trend-stat-val">{fmt(running)}</span></div>
                <div className="pm-trend-stat"><span className="pm-trend-stat-label">Avg / Txn</span><span className="pm-trend-stat-val">{fmt(running / n)}</span></div>
                <div className="pm-trend-stat"><span className="pm-trend-stat-label">Largest</span><span className="pm-trend-stat-val pm-trend-stat-val--red">{fmt(Math.max(...expenses.map(t => t.amount)))}</span></div>
            </div>
            <div className="pm-trend-svg-wrap">
                <svg viewBox={`0 0 ${W} ${H}`} className="pm-trend-svg" style={{ display: 'block', width: '100%' }}>
                    <defs><linearGradient id="drFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" /><stop offset="100%" stopColor="#3b82f6" stopOpacity="0" /></linearGradient></defs>
                    <path d={areaPath} fill="url(#drFill)" /><polyline points={linePts} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    {points.map((p, i) => (<g key={i} onMouseEnter={() => setTooltip({ i, x: xOf(i), y: yOf(p.cumulative), ...p })} onMouseLeave={() => setTooltip(null)} style={{ cursor: 'pointer' }}><circle cx={xOf(i)} cy={yOf(p.cumulative)} r="10" fill="transparent" /><circle cx={xOf(i)} cy={yOf(p.cumulative)} r={tooltip?.i === i ? 5 : 3.5} fill={tooltip?.i === i ? '#fff' : '#3b82f6'} stroke={tooltip?.i === i ? '#3b82f6' : '#1e3a8a'} strokeWidth="2" /></g>))}
                </svg>
                {tooltip && (<div className="pm-trend-tooltip" style={{ left: `${(tooltip.x / W) * 100}%`, top: `${(tooltip.y / H) * 100}%` }}><div className="pm-tt-name">{tooltip.name}</div><div className="pm-tt-row"><span>Amount</span><span className="pm-tt-red">-{fmt(tooltip.amount)}</span></div><div className="pm-tt-row"><span>Total</span><span>{fmt(tooltip.cumulative)}</span></div><div className="pm-tt-cat">{tooltip.category}</div></div>)}
            </div>
        </div>
    );
};

/* ═══ SPENDING BY CATEGORY CHART ═══ */
const SpendingByCategoryChart = ({ transactions, fmt }) => {
    const [hovered, setHovered] = useState(null);
    const colors = { Groceries: '#3b82f6', Subscriptions: '#8b5cf6', Shopping: '#a78bfa', Transport: '#06b6d4', Dining: '#f59e0b', Bills: '#ef4444', Health: '#10b981', Entertainment: '#ec4899', Education: '#f97316', Other: '#6b7280' };
    const expenses = transactions.filter(t => t.type === 'expense');
    if (expenses.length === 0) return (<div className="pm-chart-card"><div className="pm-chart-hdr"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg><span>By Category</span></div><div className="pm-chart-empty"><span>No data yet</span></div></div>);
    const totals = {}; expenses.forEach(t => { totals[t.category] = (totals[t.category] || 0) + t.amount; });
    const total = Object.values(totals).reduce((a, b) => a + b, 0);
    const segs = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    const r = 34, circ = 2 * Math.PI * r; let off = -circ * 0.25;
    return (
        <div className="pm-chart-card pm-chart-card--cat">
            <div className="pm-chart-hdr"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg><span>By Category</span></div>
            <div className="pm-donut-area">
                <div className="pm-donut-wrap">
                    <svg viewBox="0 0 100 100" className="pm-donut">{segs.map(([cat, amt]) => { const pct = amt / total; const dash = pct * circ; const gap = circ - dash; const cur = off; off += pct * circ; return (<circle key={cat} cx="50" cy="50" r={r} fill="none" stroke={colors[cat] || '#666'} strokeWidth={hovered === cat ? 10 : 7} strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-cur} strokeLinecap="round" className="pm-donut-seg" style={{ filter: hovered === cat ? `drop-shadow(0 0 6px ${colors[cat]})` : 'none' }} onMouseEnter={() => setHovered(cat)} onMouseLeave={() => setHovered(null)} />); })}</svg>
                    <div className="pm-donut-center">{hovered ? (<><span className="pm-donut-center-pct" style={{ color: colors[hovered] }}>{((totals[hovered] / total) * 100).toFixed(0)}%</span><span className="pm-donut-center-label">{hovered}</span></>) : (<><span className="pm-donut-center-total">{fmt(total, { decimals: 0 })}</span><span className="pm-donut-center-label">total</span></>)}</div>
                </div>
                <div className="pm-donut-legend">
                    {segs.map(([cat, amt]) => (<div key={cat} className={`pm-legend-item ${hovered === cat ? 'hovered' : ''}`} onMouseEnter={() => setHovered(cat)} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}><span className="pm-legend-dot" style={{ background: colors[cat] || '#666' }} /><span className="pm-legend-name">{cat}</span><div className="pm-legend-right"><span className="pm-legend-pct">{((amt / total) * 100).toFixed(0)}%</span><span className="pm-legend-amt">{fmt(amt)}</span></div></div>))}
                    <div className="pm-legend-total-row"><span>Total</span><span className="pm-legend-total-val">{fmt(total)}</span></div>
                </div>
            </div>
        </div>
    );
};

/* ═══ RECENT TRANSACTIONS ═══ */
const RecentTransactions = ({ transactions, fmt }) => (
    <div className="pm-txns">
        <div className="pm-txns-header"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg><span>Recent Transactions</span></div>
        <div className="pm-txns-list">
            {transactions.length === 0 ? (<div className="pm-txns-empty"><span>No transactions yet</span><span className="pm-txns-sub">Deposit money and add expenses</span></div>
            ) : transactions.slice(0, 12).map((t, i) => (
                <div key={t.id || i} className="pm-txn-row">
                    {t.logo && logoMap[t.logo] ? <img src={logoMap[t.logo]} alt={t.name} className="pm-txn-logo" /> : <span className="pm-txn-emoji">{t.emoji || (t.type === 'deposit' ? '💰' : '💳')}</span>}
                    <div className="pm-txn-info"><span className="pm-txn-name">{t.name}</span><span className="pm-txn-cat">{t.category}{t.created_at ? ` · ${new Date(t.created_at).toLocaleDateString()}` : ''}</span></div>
                    <span className="pm-txn-amt" style={{ color: t.type === 'deposit' ? '#10b981' : '#ef4444' }}>{t.type === 'deposit' ? '+' : '-'}{fmt(t.amount)}</span>
                </div>
            ))}
        </div>
    </div>
);

/* ═══ MONTHLY SUMMARY ═══ */
const MonthlySummaryCard = ({ summaries, fmt }) => {
    if (!summaries || summaries.length === 0) return null;
    const current = summaries[0]; const previous = summaries[1];
    const changePercent = previous && previous.totalExpenses > 0 ? (((current.totalExpenses - previous.totalExpenses) / previous.totalExpenses) * 100).toFixed(0) : null;
    return (
        <div className="dr-monthly-summary">
            <div className="dr-monthly-header"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg><span>Monthly Overview — {current.month}</span></div>
            <div className="dr-monthly-stats">
                <div className="dr-mstat"><span className="dr-mstat-label">Deposited</span><span className="dr-mstat-val green">{fmt(current.totalDeposits)}</span></div>
                <div className="dr-mstat"><span className="dr-mstat-label">Spent</span><span className="dr-mstat-val red">{fmt(current.totalExpenses)}</span></div>
                <div className="dr-mstat"><span className="dr-mstat-label">Net</span><span className="dr-mstat-val" style={{ color: current.saved >= 0 ? '#10b981' : '#ef4444' }}>{fmt(current.saved)}</span></div>
                <div className="dr-mstat"><span className="dr-mstat-label">Transactions</span><span className="dr-mstat-val">{current.transactionCount}</span></div>
            </div>
            {changePercent !== null && <div className="dr-monthly-change" style={{ color: Number(changePercent) <= 0 ? '#10b981' : '#ef4444' }}>{Number(changePercent) <= 0 ? '↓' : '↑'} {Math.abs(Number(changePercent))}% {Number(changePercent) <= 0 ? 'less' : 'more'} spending than {previous.month}</div>}
            {current.topCategory && <div className="dr-monthly-top">Top category: <strong>{current.topCategory[0]}</strong> — {fmt(current.topCategory[1])}</div>}
        </div>
    );
};

/* ═══ MOBILE SLIDE-UP PANEL ═══ */
const MobilePanel = ({ open, onClose, title, icon, children }) => {
    if (!open) return null;
    return (
        <div className="dr-mpanel-overlay" onClick={onClose}>
            <div className="dr-mpanel" onClick={e => e.stopPropagation()}>
                <div className="dr-mpanel-handle" />
                <div className="dr-mpanel-header">
                    <div className="dr-mpanel-title-row">{icon}<span className="dr-mpanel-title">{title}</span></div>
                    <button className="dr-mpanel-close" onClick={onClose}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
                </div>
                <div className="dr-mpanel-body">{children}</div>
            </div>
        </div>
    );
};

/* ═══ ERASE ALL DATA MODAL ═══ */
const EraseDataModal = ({ onClose, onConfirmed }) => {
    const [step, setStep] = useState(1); // 1 = confirm, 2 = type "delete"
    const [typed, setTyped] = useState('');
    const [shaking, setShaking] = useState(false);
    const isMatch = typed.trim().toLowerCase() === 'delete';

    const handleYes = () => setStep(2);

    const handleDelete = () => {
        if (!isMatch) {
            setShaking(true);
            setTimeout(() => setShaking(false), 500);
            return;
        }
        onConfirmed();
    };

    return (
        <div className="dr-modal-overlay" onClick={onClose}>
            <div className={`dr-modal dr-erase-modal ${shaking ? 'shake' : ''}`} onClick={e => e.stopPropagation()}>
                <div className="dr-modal-header">
                    <div className="dr-modal-icon" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </div>
                    <div>
                        <h3 className="dr-modal-title">{step === 1 ? 'Erase All Data' : 'Final Confirmation'}</h3>
                        <p className="dr-modal-sub">{step === 1 ? 'This will delete all your transactions' : 'This action cannot be undone'}</p>
                    </div>
                    <button className="dr-modal-close" onClick={onClose}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
                </div>

                <div className="dr-modal-body">
                    {step === 1 ? (
                        <div className="dr-erase-warning">
                            <div className="dr-erase-warning-icon">⚠️</div>
                            <p className="dr-erase-warning-text">
                                This will permanently delete <strong>all transactions, balance history,</strong> and <strong>financial data</strong>. Your account will be reset to zero.
                            </p>
                            <p className="dr-erase-warning-sub">Are you sure you want to continue?</p>
                        </div>
                    ) : (
                        <div className="dr-erase-confirm-step">
                            <div className="dr-erase-confirm-msg">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                <p>Type <strong className="dr-erase-keyword">"delete"</strong> below to confirm.</p>
                            </div>
                            <div className={`dr-amount-input-wrap dr-erase-input-wrap ${typed.length > 0 && !isMatch ? 'error' : ''} ${isMatch ? 'success' : ''}`}>
                                <input
                                    type="text"
                                    className="dr-amount-input"
                                    style={{ fontSize: '18px', letterSpacing: '0.05em' }}
                                    placeholder="Type delete here..."
                                    value={typed}
                                    onChange={e => setTyped(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleDelete()}
                                    autoFocus
                                    autoComplete="off"
                                    spellCheck={false}
                                />
                                {isMatch && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
                            </div>
                            {typed.length > 0 && !isMatch && (
                                <span className="dr-field-error">Please type exactly: delete</span>
                            )}
                        </div>
                    )}
                </div>

                <div className="dr-modal-footer">
                    <button className="dr-modal-cancel" onClick={onClose}>Cancel</button>
                    {step === 1 ? (
                        <button className="dr-modal-confirm dr-erase-yes-btn" onClick={handleYes}>
                            Yes, Continue
                        </button>
                    ) : (
                        <button className="dr-modal-confirm dr-erase-final-btn" disabled={!isMatch} onClick={handleDelete}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                            Delete Everything
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};


/* ═══════════════════════════════════════════════════════════
   STATEMENTS TAB
   ═══════════════════════════════════════════════════════════ */
const StatementsTab = ({ transactions, balance, totalIncome, totalExpenses, fmt, currency }) => {
    const now = new Date();
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
    const [downloading, setDownloading] = useState(null);

    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const years = Array.from({ length: 3 }, (_, i) => now.getFullYear() + i);

    // Filter transactions for selected month
    const monthTxns = transactions.filter(t => {
        const d = new Date(t.created_at);
        return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
    });

    const monthExpenses = monthTxns.filter(t => t.type === 'expense');
    const monthDeposits = monthTxns.filter(t => t.type === 'deposit');
    const totalSpent = monthExpenses.reduce((s, t) => s + t.amount, 0);
    const totalIn = monthDeposits.reduce((s, t) => s + t.amount, 0);
    const net = totalIn - totalSpent;

    // Category breakdown
    const catTotals = {};
    monthExpenses.forEach(t => { catTotals[t.category] = (catTotals[t.category] || 0) + t.amount; });
    const categories = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
    const catColors = { Groceries:'#3b82f6', Subscriptions:'#8b5cf6', Shopping:'#a78bfa', Transport:'#06b6d4', Dining:'#f59e0b', Bills:'#ef4444', Health:'#10b981', Entertainment:'#ec4899', Education:'#f97316', Other:'#6b7280' };

    // CSV download
    const downloadCSV = () => {
        setDownloading('csv');
        const rows = [
            ['Date','Name','Category','Type','Amount'],
            ...monthTxns.map(t => [
                new Date(t.created_at).toLocaleDateString(),
                t.name,
                t.category,
                t.type,
                (t.type === 'deposit' ? '+' : '-') + t.amount.toFixed(2)
            ])
        ];
        const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `statement_${months[selectedMonth]}_${selectedYear}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        setTimeout(() => setDownloading(null), 1500);
    };

    // PDF download (Choice Bank Style Statement)
    const downloadPDF = () => {
        setDownloading('pdf');
        const logo = '/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/wAARCAHNAh0DASIAAhEBAxEB/8QAHAABAAEFAQEAAAAAAAAAAAAAAAMCBAUGBwEI/8QAThAAAQMDAgIFCQQFCAkEAwEAAQACAwQFEQYhEjEHE0FRYRQiMnGBkaGxwSNCUnIVM2Ky0SQ0Q3SCksLwFiU2RFNjc6LhVmST8SY1lHX/xAAbAQEAAgMBAQAAAAAAAAAAAAAAAQIDBAUGB//EADgRAAIBAgQDBQcDBAMAAwAAAAABAgMRBBIhMQVBURMiYXHRBjKBkaGx8BQjwTNC4fEVUmIWQ1P/2gAMAwEAAhEDEQA/APjJERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREARVMa55wxpce4DKuRba7h4nU74298nmfNSot7Ii6LRFeCgIGZKukjHjLxfu5UjaKix592gB7mxvP0VuzkLox6LI+SW3tuw//AJ3L0UdtOzbtk/1dyt2UvD5r1GZGNRbJQ6PuNe0PopGSsPJzopGj91Tu6PtTgnFLAR3+UMaPiQr/AKSu1dRZTtYdTVEW0jQOpzyooj6qhh+RVD9DagZ6UNOD3eUM/in6Sv8A9H8h2sOprKLYDo6/Y2poXflqIz9Vb1Gl9QQDL7TVOHexnH8sqjoVVvF/IspxfMy9jpY9SaVktUMLP0tbyZacgYM0ZPnNPiFHrRtPZ7fR6ap2xumhAmrZQBkyuHo57gFfdHFX+hr3Tx3KOro2OL+J8gDIx5p9LIz8eeFg9Z3SG6XaaWF0zmiV+HSOaQRnbGANltzyrD5v7tvgWuYJERc8BERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREARF6xrnuDWtLnE4AA3KA8VcMUs8gjhjfI88mtGSVkXW6CiAdc5i2QjIp4jl/9o8m/PwUct1mEZhomNo4TzEXpO/M7mVl7NR9928OZW99iptsbFvcKuKlH4B58n90cvaQvDUWyAYpqJ87xykqH7f3R9SVjjvzRR2iXur+SbdS9ddK7hLY5zCw/dhaGD4K0e98juJ73OPeTlT26grLjUtpqKnknld2MTV671uM6+pFx1NiobjqrUFxbSwXKslmfvhspY0DvwMAKPVdlvtnkYLs6V4k9F5eXAnu3TQlxrrZqGGooKKStlILTDG0lxB7sLqWvrJddSU1LLd6220FNR U7JYjKw9JIOVV4rk4UKt4A3UjipWlROKlaVW0qNpUbSo2lROKraVA8qVpVPipaUyOaVWQpUlRNKlaVDIpaVtO9Q1TtPcmvRbiOdlqe4KEqhlJVJKRQPKjaVSSg3VJKRSOKg55VJKjaVSSkaRSJKRSJKR1KjaVSSkaRSJKRSJKR1KjaVSSkaRSJKRSJKR1KjaVSSkaRSJKRSJKR1KjaVSSkaRSJKRSJKR1KjaVSSkaRSJKRSJKR1KjaVSSkaRSJKRSJKR1KjaVSSkaRSJKRSJKR1KjaVSSkaRSJKRSJKR1KjaVSSkaRSJKRSJKR1KjaVSSkaRSJKRSJKR1KjaVSSkaRSJKRSJKR1KjaVSSkaRSJKRSJKR1KjaVSSkaRSJKRSJKR1Kp//Z';

        // Calculate opening balance for the month (balance at start of selected month)
        const monthStart = new Date(selectedYear, selectedMonth, 1);
        const prevTxns = transactions.filter(t => new Date(t.created_at) < monthStart);
        let openingBal = 0;
        prevTxns.forEach(t => {
            if(t.type==='deposit') openingBal += t.amount;
            else openingBal -= t.amount;
        });

        // Build transaction rows with running balance
        let rb = openingBal;
        const rows = monthTxns.map(t => {
            const w = t.type==='expense'?t.amount.toFixed(2):'';
            const d = t.type==='deposit'?t.amount.toFixed(2):'';
            if(t.type==='deposit') rb += t.amount;
            else rb -= t.amount;
            const dt = new Date(t.created_at);
            return '<tr><td>'+months[dt.getMonth()].substring(0,3)+' '+ dt.getDate()+'</td><td>'+t.name+'</td><td class="amt">'+w+'</td><td class="amt">'+d+'</td><td class="amt">'+rb.toFixed(2)+'</td></tr>';
        }).join('');

        const html='<!DOCTYPE html><html><head><meta charset="UTF-8"><title>FinScope AI Statement</title><style>@page{margin:0.5in}*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:10px;color:#000;padding:40px;line-height:1.3}.hdr{display:flex;justify-content:space-between;margin-bottom:25px}.logo-area{display:flex;gap:12px;align-items:center}.logo{width:50px;height:50px;object-fit:contain;display:block;background:#f8f8f8;border-radius:8px;padding:2px}.co h1{font-size:14px;font-weight:700;margin-bottom:5px}.co p{font-size:8px;margin:1px 0}.acct{text-align:right;font-size:9px}.acct .num{font-size:10px;font-weight:700;margin-top:4px}.svc{background:#f5f5f5;border:1px solid #000;padding:10px;margin:15px 0}.svc h3{font-size:9px;font-weight:700;text-transform:uppercase;border-bottom:1px solid #000;margin-bottom:6px;padding-bottom:3px}.svc-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px 10px;font-size:8px}.svc-item{display:flex;justify-content:space-between}.div{border-top:2px solid #000;margin:15px 0}.sum h2{font-size:11px;font-weight:700;margin-bottom:10px}.sum-grid{display:grid;grid-template-columns:180px 1fr;gap:6px 20px;font-size:9px}.sum-grid div:nth-child(even){text-align:right}.close{margin-top:10px;padding-top:8px;border-top:2px solid #000;font-weight:700}.txn{margin-top:20px}.txn h2{font-size:11px;font-weight:700;margin-bottom:12px}table{width:100%;border-collapse:collapse;font-size:9px}thead{border-top:2px solid #000;border-bottom:2px solid #000}th{padding:6px 4px;text-align:left;font-weight:700}td{padding:5px 4px;border-bottom:1px solid #ddd}.amt{text-align:right;font-family:"Courier New",monospace}.tot{border-top:2px solid #000;font-weight:700}.tot td{padding-top:8px}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body><div class="hdr"><div class="logo-area"><img src="data:image/png;base64,'+logo+'" alt="FinScope AI" class="logo" onerror="this.style.display=\'none\'"><div class="co"><h1>FinScope AI</h1><p>Smart Financial Management</p><p>P.O. Box 000000</p><p>Virtual Banking, WA 00000-0000</p></div></div><div class="acct"><p>'+new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})+'</p><p>Primary Account <span class="num">Practice Mode</span></p></div></div><div class="svc"><h3>CUSTOMER SERVICE INFORMATION</h3><div class="svc-grid"><div class="svc-item"><span>Website:</span><span>www.finscope-ai.com</span></div><div class="svc-item"><span>Service Number:</span><span>1-800-FINSCOPE</span></div><div class="svc-item"><span>Practice Mode:</span><span>Educational Use Only</span></div><div class="svc-item"><span>Contact:</span><span>Available 24/7</span></div></div></div><div class="div"></div><div class="sum"><h2>Account Summary</h2><div class="sum-grid"><div>Opening Balance</div><div>$'+openingBal.toFixed(2)+'</div><div>Withdrawals</div><div>$'+totalSpent.toFixed(2)+'</div><div>Deposits</div><div>$'+totalIn.toFixed(2)+'</div></div><div class="close"><div class="sum-grid"><div>Closing Balance on '+months[selectedMonth]+' '+new Date(selectedYear,selectedMonth+1,0).getDate()+', '+selectedYear+'</div><div>$'+rb.toFixed(2)+'</div></div></div></div><div class="div"></div><div class="txn"><h2>Your Transaction Details</h2><table><thead><tr><th style="width:60px">Date</th><th>Details</th><th style="width:80px;text-align:right">Withdrawals</th><th style="width:80px;text-align:right">Deposits</th><th style="width:80px;text-align:right">Balance</th></tr></thead><tbody>'+rows+(rows?'<tr class="tot"><td colspan="2">Closing Balance</td><td class="amt"></td><td class="amt"></td><td class="amt">$'+rb.toFixed(2)+'</td></tr>':'<tr><td colspan="5" style="text-align:center;padding:20px">No transactions</td></tr>')+'</tbody></table></div></body></html>';

        const w=window.open('','_blank');
        w.document.write(html);
        w.document.close();
        w.focus();
        setTimeout(()=>{w.print();setTimeout(()=>setDownloading(null),1000)},500);
    };

    const hasData = monthTxns.length > 0;

    return (
        <div className="st-wrap">
            {/* Header */}
            <div className="st-header">
                <div className="st-header-left">
                    <div className="st-header-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg></div>
                    <div><h2 className="st-title">Statements</h2><p className="st-sub">View & download your monthly reports</p></div>
                </div>
                <div className="st-downloads">
                    <button className="st-dl-btn st-dl-csv" onClick={downloadCSV} disabled={!hasData || downloading === 'csv'}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        {downloading === 'csv' ? 'Downloading…' : 'CSV'}
                    </button>
                    <button className="st-dl-btn st-dl-pdf" onClick={downloadPDF} disabled={!hasData || downloading === 'pdf'}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        {downloading === 'pdf' ? 'Opening…' : 'PDF'}
                    </button>
                </div>
            </div>

            {/* Month / Year Picker */}
            <div className="st-picker">
                <div className="st-picker-label">Select Period</div>
                <div className="st-picker-row">
                    <div className="st-months">
                        {months.map((m, i) => (
                            <button key={i} className={`st-month-btn ${selectedMonth === i ? 'active' : ''}`} onClick={() => setSelectedMonth(i)}>{m.slice(0,3)}</button>
                        ))}
                    </div>
                    <div className="st-years">
                        {years.map(y => (
                            <button key={y} className={`st-year-btn ${selectedYear === y ? 'active' : ''}`} onClick={() => setSelectedYear(y)}>{y}</button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="st-summary-row">
                <div className="st-sum-card st-sum-income">
                    <span className="st-sum-icon">💰</span>
                    <span className="st-sum-label">Income</span>
                    <span className="st-sum-val green">+{fmt(totalIn)}</span>
                </div>
                <div className="st-sum-card st-sum-expense">
                    <span className="st-sum-icon">💸</span>
                    <span className="st-sum-label">Spent</span>
                    <span className="st-sum-val red">-{fmt(totalSpent)}</span>
                </div>
                <div className="st-sum-card st-sum-net">
                    <span className="st-sum-icon">{net >= 0 ? '📈' : '📉'}</span>
                    <span className="st-sum-label">Net</span>
                    <span className="st-sum-val" style={{ color: net >= 0 ? '#10b981' : '#ef4444' }}>{net >= 0 ? '+' : '-'}${Math.abs(net).toFixed(2)}</span>
                </div>
                <div className="st-sum-card">
                    <span className="st-sum-icon">🔢</span>
                    <span className="st-sum-label">Transactions</span>
                    <span className="st-sum-val">{monthTxns.length}</span>
                </div>
            </div>

            {!hasData ? (
                <div className="st-empty">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <p>No transactions for {months[selectedMonth]} {selectedYear}</p>
                    <span>Try selecting a different month</span>
                </div>
            ) : (<>
                {/* Category Breakdown */}
                {categories.length > 0 && (
                    <div className="st-categories">
                        <div className="st-section-title"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>Spending by Category</div>
                        <div className="st-cat-list">
                            {categories.map(([cat, amt]) => {
                                const pct = totalSpent > 0 ? (amt / totalSpent) * 100 : 0;
                                return (
                                    <div key={cat} className="st-cat-row">
                                        <div className="st-cat-info">
                                            <span className="st-cat-dot" style={{ background: catColors[cat] || '#6b7280' }} />
                                            <span className="st-cat-name">{cat}</span>
                                        </div>
                                        <div className="st-cat-bar-wrap">
                                            <div className="st-cat-bar" style={{ width: `${pct}%`, background: catColors[cat] || '#6b7280' }} />
                                        </div>
                                        <div className="st-cat-right">
                                            <span className="st-cat-pct">{pct.toFixed(0)}%</span>
                                            <span className="st-cat-amt">{fmt(amt)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Full Transaction List */}
                <div className="st-txn-table">
                    <div className="st-section-title"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>All Transactions — {months[selectedMonth]} {selectedYear}</div>
                    <div className="st-table-head">
                        <span>Date</span><span>Description</span><span>Category</span><span>Amount</span>
                    </div>
                    <div className="st-table-body">
                        {monthTxns.map((t, i) => (
                            <div key={t.id || i} className="st-table-row">
                                <span className="st-td-date">{new Date(t.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric' })}</span>
                                <span className="st-td-name">{t.name}</span>
                                <span className="st-td-cat"><span className="st-cat-badge" style={{ background: (catColors[t.category] || '#6b7280') + '22', color: catColors[t.category] || '#6b7280' }}>{t.category}</span></span>
                                <span className={`st-td-amt ${t.type === 'deposit' ? 'st-green' : 'st-red'}`}>{t.type === 'deposit' ? '+' : '-'}{fmt(t.amount)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </>)}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════
   MAIN DASHBOARD COMPONENT
   ═══════════════════════════════════════════════════════════ */
const Dashboard = () => {
    const navigate = useNavigate();
    const { currency, setCurrency, fmt } = useCurrency();
    const [currencyPickerOpen, setCurrencyPickerOpen] = useState(false);
    const [currencySearch, setCurrencySearch] = useState('');
    // ─── FIX: removed dropdownPos state and currencyBtnRef ───
    const currencyPickerRef = useRef(null);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showTutorial, setShowTutorial] = useState(false);
    const [showFullChat, setShowFullChat] = useState(false);
    const [showAIAssistant, setShowAIAssistant] = useState(false);
    const [balance, setBalance] = useState(0);
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [monthlySummaries, setMonthlySummaries] = useState([]);
    const [moneyModal, setMoneyModal] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileNav, setMobileNav] = useState('home');
    const [mobilePanelOpen, setMobilePanelOpen] = useState(null);
    const [showEraseModal, setShowEraseModal] = useState(false);
    const [exchangeRates, setExchangeRates] = useState({});
    const [exchangeLoading, setExchangeLoading] = useState(false);
    const [exchangeLastUpdated, setExchangeLastUpdated] = useState(null);
    const [rateDirection, setRateDirection] = useState(null); // 'up' | 'down' | null
    const [rateFlash, setRateFlash] = useState(false);
    const prevRateRef = useRef(null);
    const chartsRef = useRef(null);
    const menuRef = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (currencyPickerRef.current && !currencyPickerRef.current.contains(e.target)) setCurrencyPickerOpen(false); };
        if (currencyPickerOpen) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [currencyPickerOpen]);

    useEffect(() => {
        const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
        if (menuOpen) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [menuOpen]);

    useEffect(() => {
        if (showFullChat) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [showFullChat]);

    useEffect(() => { checkUser(); }, []);
    useEffect(() => { if (user) loadFinancialData(); }, [user]);

    useEffect(() => {
        if (!loading && user) {
            // Use user-specific key so each new account gets the tutorial on first login
            const userTutorialKey = `finscope_tutorial_completed_${user.id}`;
            const done = localStorage.getItem(userTutorialKey);
            if (!done) {
                const t = setTimeout(() => setShowTutorial(true), 1500);
                return () => clearTimeout(t);
            }
        }
    }, [user, loading]);

    // ─── Real-time exchange rates ───
    useEffect(() => {
        let baseRates = {};      // real rates from API
        let tickInterval = null;

        // Fetch real rates from API (updates once per day on free tier)
        const fetchRates = async () => {
            setExchangeLoading(true);
            try {
                const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
                if (!res.ok) throw new Error('rate fetch failed');
                const data = await res.json();
                baseRates = data.rates || {};
                setExchangeRates({ ...baseRates });
                setExchangeLastUpdated(new Date());
            } catch (e) {
                console.warn('Exchange rate fetch error:', e);
            } finally {
                setExchangeLoading(false);
            }
        };

        // Tick: apply tiny realistic micro-fluctuation every 4s to simulate live feed
        const tick = () => {
            if (!baseRates || Object.keys(baseRates).length === 0) return;
            setExchangeRates(prev => {
                const next = { ...prev };
                // Fluctuate all rates slightly — ±0.03% per tick (realistic forex spread)
                Object.keys(next).forEach(code => {
                    const base = baseRates[code];
                    if (!base) return;
                    const drift = 1 + (Math.random() - 0.5) * 0.0006;
                    next[code] = base * drift;
                });
                return next;
            });
            setExchangeLastUpdated(new Date());
        };

        fetchRates().then(() => {
            // Start ticking every 4 seconds after initial load
            tickInterval = setInterval(tick, 4000);
        });

        // Refetch real rates every 10 minutes
        const refetchInterval = setInterval(fetchRates, 10 * 60 * 1000);

        return () => {
            clearInterval(tickInterval);
            clearInterval(refetchInterval);
        };
    }, []);

    const checkUser = async () => {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error || !user) { setLoading(false); navigate('/login'); return; }
            setUser(user);
            try { const { data } = await supabase.from('user_profiles').select('*').eq('id', user.id).single(); if (data) setProfile(data); } catch (e) {}
            setLoading(false);
        } catch { setLoading(false); navigate('/login'); }
    };

    const loadFinancialData = async () => {
        if (!user) return;
        try {
            const finance = await getUserFinance(user.id);
            setBalance(finance.balance || 0); setTotalIncome(finance.total_income || 0); setTotalExpenses(finance.total_expenses || 0);
            const txns = await getTransactions(user.id, { limit: 50 }); setTransactions(txns);
            const summaries = await getMonthlySummaries(user.id, 3); setMonthlySummaries(summaries);
        } catch (err) { console.error('Error loading financial data:', err); }
    };

    const handleDeposit = async (amount, source) => {
        try { const result = await addTransaction(user.id, { name: source || 'Deposit', amount, type: 'deposit', category: 'Income', emoji: '💰' }); setBalance(result.newBalance); setTotalIncome(result.newIncome); setMoneyModal(null); await loadFinancialData(); } catch (err) { alert('Failed to deposit.'); }
    };
    const handleWithdraw = async (amount, reason) => {
        try { const result = await addTransaction(user.id, { name: reason || 'Withdrawal', amount, type: 'withdrawal', category: 'Withdrawal', emoji: '🏧' }); setBalance(result.newBalance); setMoneyModal(null); await loadFinancialData(); } catch (err) { alert('Failed to withdraw.'); }
    };
    const handleAddExpense = async (expense) => {
        try { const result = await addTransaction(user.id, { name: expense.name, amount: expense.amount, type: 'expense', category: expense.category, emoji: expense.emoji, logo: expense.logo }); setBalance(result.newBalance); setTotalExpenses(result.newExpenses); await loadFinancialData(); } catch (err) { alert('Failed to add expense.'); }
    };

    const handleEraseAllData = async () => {
        try {
            const { error: txnError } = await supabase
                .from('user_transactions')
                .delete()
                .eq('user_id', user.id);
            if (txnError) throw txnError;
            const { error: finError } = await supabase
                .from('user_finances')
                .update({ balance: 0, total_income: 0, total_expenses: 0, updated_at: new Date().toISOString() })
                .eq('user_id', user.id);
            if (finError) throw finError;
            setBalance(0); setTotalIncome(0); setTotalExpenses(0);
            setTransactions([]); setMonthlySummaries([]);
            setShowEraseModal(false);
            setMenuOpen(false);
        } catch (err) {
            console.error('Erase error:', err);
            alert('Something went wrong. Please try again.');
        }
    };

    const getUserDisplayName = () => {
        if (profile?.first_name && profile?.last_name) return `${profile.first_name} ${profile.last_name}`;
        if (profile?.username) return profile.username;
        if (user?.email) return user.email.split('@')[0];
        return 'User';
    };

    const handleMobileNav = (nav) => {
        setMobileNav(nav);
        if (nav === 'ai') { setShowFullChat(true); return; }
        if (nav === 'home') setActiveTab('overview');
        if (nav === 'expenses') setActiveTab('expenses');
        if (nav === 'analytics') setActiveTab('analytics');
        if (nav === 'statements') setActiveTab('statements');
    };
    const handleDesktopTab = (tab) => {
        setActiveTab(tab);
        if (tab === 'overview') setMobileNav('home');
        if (tab === 'expenses') setMobileNav('expenses');
        if (tab === 'analytics') setMobileNav('analytics');
        if (tab === 'statements') setMobileNav('statements');
    };

    const savings = totalIncome - totalExpenses;
    const savingsPct = totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(0) : 0;
    const expenseTransactions = transactions.filter(t => t.type === 'expense');

    // ─── Live currency conversion (balances stored in USD) ───
    const isBaseCurrency = currency.code === 'USD';
    const liveRate = exchangeRates[currency.code] || null;
    const convertedBalance   = (!isBaseCurrency && liveRate) ? balance * liveRate : null;
    const convertedIncome    = (!isBaseCurrency && liveRate) ? totalIncome * liveRate : null;
    const convertedExpenses  = (!isBaseCurrency && liveRate) ? totalExpenses * liveRate : null;
    const fmtConverted = (val) => {
        if (val === null) return null;
        return `${currency.symbol}${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };
    const lastUpdatedStr = exchangeLastUpdated
        ? exchangeLastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        : null;

    // ─── Detect rate direction + flash on change ───
    useEffect(() => {
        if (!liveRate) return;
        if (prevRateRef.current !== null) {
            const dir = liveRate > prevRateRef.current ? 'up' : liveRate < prevRateRef.current ? 'down' : null;
            if (dir) {
                setRateDirection(dir);
                setRateFlash(true);
                const t = setTimeout(() => setRateFlash(false), 800);
                return () => clearTimeout(t);
            }
        }
        prevRateRef.current = liveRate;
    }, [liveRate]);

    if (loading) return (<div className="dashboard-loading"><div className="loading-orb"><FinScopeAI /></div><p className="loading-text">Loading your dashboard...</p></div>);
    if (!user) { navigate('/login'); return null; }

    return (
        <div className="dashboard dr-has-mobile-nav">
            {showTutorial && <DashboardTutorial tutorialKey={`finscope_tutorial_completed_${user?.id}`} onComplete={() => setShowTutorial(false)} onSkip={() => setShowTutorial(false)} />}

            {/* ═══ HEADER ═══ */}
            <header className="dashboard-header">
                <div className="dashboard-header-content">
                    <div className="dashboard-header-left">
                        <div className="dashboard-logo"><FinScopeAI /></div>
                        <div className="welcome-text"><h1>Welcome, <span className="username">{getUserDisplayName()}</span></h1><p>Your financial overview</p></div>
                    </div>
                    <div className="dashboard-header-right">
                        <button className="btn-tutorial desktop-only" onClick={() => setShowTutorial(true)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg><span>Tutorial</span></button>
                        <button className="pm-fab-chat desktop-only" onClick={() => setShowFullChat(true)}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Chat with AI</button>
                        <button className="btn-leave desktop-only" onClick={() => navigate('/')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg><span>Home</span></button>
                        <div className="desktop-only"><UserMenu onEraseData={() => setShowEraseModal(true)} /></div>

                        {/* ═══ HAMBURGER (desktop) / AVATAR PILL (mobile) ═══ */}
                        <div className="dr-hamburger-wrap mobile-only" ref={menuRef}>
                            <button className={`dr-hamburger-btn desktop-only ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
                                {menuOpen ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                    : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>}
                            </button>
                            <button className={`dr-avatar-pill mobile-only ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
                                <span className="dr-avatar-circle">
                                    {getUserDisplayName().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                                </span>
                                <svg className="dr-avatar-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9"/>
                                </svg>
                            </button>
                            {menuOpen && (
                                <div className="dr-ham-dropdown">
                                    <div className="dr-ham-section-label">Navigation</div>
                                    <button className="dr-ham-item" onClick={() => { handleDesktopTab('overview'); setMenuOpen(false); }}><span className="dr-ham-icon" style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg></span><div className="dr-ham-text"><span className="dr-ham-label">Overview</span><span className="dr-ham-sub">Balance & summary</span></div></button>
                                    <button className="dr-ham-item" onClick={() => { handleDesktopTab('expenses'); setMenuOpen(false); }}><span className="dr-ham-icon" style={{ background: 'rgba(6,182,212,0.12)', color: '#06b6d4' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg></span><div className="dr-ham-text"><span className="dr-ham-label">Expenses</span><span className="dr-ham-sub">Add & track spending</span></div></button>
                                    <button className="dr-ham-item" onClick={() => { handleDesktopTab('analytics'); setMenuOpen(false); }}><span className="dr-ham-icon" style={{ background: 'rgba(139,92,246,0.12)', color: '#8b5cf6' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg></span><div className="dr-ham-text"><span className="dr-ham-label">Analytics</span><span className="dr-ham-sub">Charts & trends</span></div></button>
                                    <button className="dr-ham-item" onClick={() => { handleDesktopTab('statements'); setMenuOpen(false); }}><span className="dr-ham-icon" style={{ background: 'rgba(6,182,212,0.12)', color: '#06b6d4' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg></span><div className="dr-ham-text"><span className="dr-ham-label">Statements</span><span className="dr-ham-sub">Download reports</span></div></button>
                                    <button className="dr-ham-item" onClick={() => { setShowFullChat(true); setMenuOpen(false); }}><span className="dr-ham-icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span><div className="dr-ham-text"><span className="dr-ham-label">AI Chat</span><span className="dr-ham-sub">Financial assistant</span></div></button>
                                    <div className="dr-ham-divider" />
                                    <div className="dr-ham-section-label">Quick Actions</div>
                                    <button className="dr-ham-item" onClick={() => { navigate('/practice'); setMenuOpen(false); }}><span className="dr-ham-icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg></span><div className="dr-ham-text"><span className="dr-ham-label">Practice Mode</span><span className="dr-ham-sub">Learn with virtual money</span></div></button>
                                    <button className="dr-ham-item" onClick={() => { setShowTutorial(true); setMenuOpen(false); }}><span className="dr-ham-icon" style={{ background: 'rgba(236,72,153,0.12)', color: '#ec4899' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg></span><div className="dr-ham-text"><span className="dr-ham-label">Tutorial</span><span className="dr-ham-sub">Learn the dashboard</span></div></button>
                                    <button className="dr-ham-item" onClick={() => { navigate('/'); setMenuOpen(false); }}><span className="dr-ham-icon" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg></span><div className="dr-ham-text"><span className="dr-ham-label">Home</span><span className="dr-ham-sub">Back to landing</span></div></button>
                                    <div className="dr-ham-divider" />
                                    <div className="dr-ham-section-label">Danger Zone</div>
                                    <button className="dr-ham-item dr-ham-item--danger" onClick={() => { setShowEraseModal(true); setMenuOpen(false); }}><span className="dr-ham-icon" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></span><div className="dr-ham-text"><span className="dr-ham-label" style={{ color: '#ef4444' }}>Erase All Data</span><span className="dr-ham-sub">Delete all transactions & reset</span></div></button>
                                    <div className="dr-ham-divider" />
                                    <div className="dr-ham-user-section"><UserMenu onEraseData={() => { setMenuOpen(false); setShowEraseModal(true); }} /></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* ═══ MAIN CONTENT ═══ */}
            <main className="dashboard-main">
                <div className="dashboard-container">
                    {/* Balance Card */}
                    <div className="dr-balance-row">
                        <div className="dr-balance-card">
                            <div className="dr-balance-top-row">
                                <div className="dr-balance-left">
                                    <span className="dr-balance-label">Total Balance</span>
                                    <span className="dr-balance-amount">{fmt(balance)}</span>

                                    {/* ── Live conversion strip ── */}
                                    {!isBaseCurrency && (
                                        <div className="dr-conversion-strip">
                                            {exchangeLoading && !liveRate ? (
                                                <span className="dr-conv-skeleton">
                                                    <span className="dr-conv-skeleton-bar" />
                                                </span>
                                            ) : liveRate ? (
                                                <>
                                                    <div className="dr-conv-main">
                                                        <span className="dr-conv-approx">≈</span>
                                                        <span className={`dr-conv-amount ${rateFlash ? `dr-conv-flash-${rateDirection}` : ''}`}>
                                                            {fmtConverted(convertedBalance)}
                                                        </span>
                                                        <span className="dr-conv-code">{currency.code}</span>
                                                        <span className={`dr-conv-dir-arrow ${rateDirection === 'up' ? 'dr-arrow-up' : rateDirection === 'down' ? 'dr-arrow-down' : ''}`}>
                                                            {rateDirection === 'up' ? '▲' : rateDirection === 'down' ? '▼' : ''}
                                                        </span>
                                                        <span className="dr-conv-live-badge">
                                                            <span className="dr-conv-live-dot" />
                                                            LIVE
                                                        </span>
                                                    </div>
                                                    <div className="dr-conv-meta">
                                                        <span className={`dr-conv-rate ${rateFlash ? `dr-rate-flash-${rateDirection}` : ''}`}>
                                                            1 USD = {liveRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {currency.code}
                                                        </span>
                                                        {lastUpdatedStr && (
                                                            <span className="dr-conv-time">
                                                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                                                {lastUpdatedStr}
                                                            </span>
                                                        )}
                                                        <button
                                                            className="dr-conv-view-btn"
                                                            onClick={() => navigate('/', { state: { showExchange: true } })}
                                                            title="Open Live Exchange page"
                                                        >
                                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 16V4M7 4L3 8M7 4L11 8"/><path d="M17 8V20M17 20L21 16M17 20L13 16"/></svg>
                                                            View today's rates
                                                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <span className="dr-conv-error">Rate unavailable</span>
                                            )}
                                        </div>
                                    )}
                                    {isBaseCurrency && (
                                        <button
                                            className="dr-conv-view-btn dr-conv-view-btn--standalone"
                                            onClick={() => navigate('/', { state: { showExchange: true } })}
                                        >
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 16V4M7 4L3 8M7 4L11 8"/><path d="M17 8V20M17 20L21 16M17 20L13 16"/></svg>
                                            View today's rates
                                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                                        </button>
                                    )}
                                </div>
                                <div className="dr-balance-actions">
                                    {/* Currency Picker — FIX: position:absolute, no JS coords, font-size 16px on input */}
                                    <div className="dr-currency-picker" ref={currencyPickerRef}>
                                        <button className="dr-currency-btn" onClick={() => {
                                            setCurrencyPickerOpen(o => !o);
                                            setCurrencySearch('');
                                        }} title="Change currency">
                                            <span className="dr-currency-flag">{currency.flag}</span>
                                            <span className="dr-currency-code">{currency.code}</span>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                                        </button>
                                        {currencyPickerOpen && (
                                            <div className="dr-currency-dropdown">
                                                <div className="dr-currency-search-wrap">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                                                    <input
                                                        className="dr-currency-search"
                                                        placeholder="Search currency..."
                                                        value={currencySearch}
                                                        onChange={e => setCurrencySearch(e.target.value)}
                                                        autoFocus
                                                    />
                                                </div>
                                                <div className="dr-currency-list">
                                                    {CURRENCIES.filter(c =>
                                                        c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
                                                        c.name.toLowerCase().includes(currencySearch.toLowerCase())
                                                    ).map(c => (
                                                        <button
                                                            key={c.code}
                                                            className={`dr-currency-option ${currency.code === c.code ? 'active' : ''}`}
                                                            onClick={() => { setCurrency(c); setCurrencyPickerOpen(false); }}
                                                        >
                                                            <span className="dr-currency-option-flag">{c.flag}</span>
                                                            <span className="dr-currency-option-code">{c.code}</span>
                                                            <span className="dr-currency-option-name">{c.name}</span>
                                                            <span className="dr-currency-option-symbol">{c.symbol}</span>
                                                            {currency.code === c.code && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <button className="dr-action-btn dr-deposit" onClick={() => setMoneyModal('deposit')}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12l7-7 7 7" /></svg>Deposit</button>
                                    <button className="dr-action-btn dr-withdraw" onClick={() => setMoneyModal('withdraw')} disabled={balance <= 0}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 19V5M5 12l7 7 7-7" /></svg>Withdraw</button>
                                </div>
                            </div>
                            <div className="dr-balance-stats">
                                <div className="dr-bstat">
                                    <span className="dr-bstat-label">Total Income</span>
                                    <span className="dr-bstat-val green">+{fmt(totalIncome)}</span>
                                    {convertedIncome !== null && <span className="dr-bstat-converted">≈ {fmtConverted(convertedIncome)}</span>}
                                </div>
                                <div className="dr-bstat-sep" />
                                <div className="dr-bstat">
                                    <span className="dr-bstat-label">Total Expenses</span>
                                    <span className="dr-bstat-val red">-{fmt(totalExpenses)}</span>
                                    {convertedExpenses !== null && <span className="dr-bstat-converted">≈ {fmtConverted(convertedExpenses)}</span>}
                                </div>
                                <div className="dr-bstat-sep" />
                                <div className="dr-bstat"><span className="dr-bstat-label">Savings</span><span className="dr-bstat-val" style={{ color: savings >= 0 ? '#10b981' : '#ef4444' }}>{savingsPct}%</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Tabs */}
                    <div className="dr-tabs dr-desktop-tabs">
                        <button className={`dr-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => handleDesktopTab('overview')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>Overview</button>
                        <button className={`dr-tab ${activeTab === 'expenses' ? 'active' : ''}`} onClick={() => handleDesktopTab('expenses')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>Add Expenses</button>
                        <button className={`dr-tab ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => handleDesktopTab('analytics')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>Analytics</button>
                        <button className={`dr-tab ${activeTab === 'statements' ? 'active' : ''}`} onClick={() => handleDesktopTab('statements')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>Statements</button>
                    </div>

                    {/* ═══ OVERVIEW TAB ═══ */}
                    {activeTab === 'overview' && (<>
                        <div className="practice-cta-banner" onClick={() => navigate('/practice')}>
                            <div className="practice-cta-left">
                                <div className="practice-cta-orb"><div className="practice-cta-orb-inner"><div className="pcta-eye" /><div className="pcta-eye" /></div><div className="practice-cta-orb-shine" /></div>
                                <div className="practice-cta-text"><div className="practice-cta-badge-row"><span className="practice-cta-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>SANDBOX</span></div><h3 className="practice-cta-title">Try Practice Mode</h3><p className="practice-cta-desc">Practice managing money with virtual funds!</p></div>
                            </div>
                            <button className="practice-cta-btn" onClick={(e) => { e.stopPropagation(); navigate('/practice'); }}>Start Practicing<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg></button>
                        </div>
                        <MonthlySummaryCard summaries={monthlySummaries} fmt={fmt} />
                        <div className="pm-charts-row" ref={chartsRef}><SpendingTrendChart transactions={transactions} fmt={fmt} /><SpendingByCategoryChart transactions={transactions} fmt={fmt} /></div>
                        <div className="dr-bottom-grid">
                            <div className="dr-bottom-left"><AIInsightsDashboard transactions={expenseTransactions.map(t => ({ ...t, amount: t.amount }))} balance={balance} totalSpent={totalExpenses} startingBalance={totalIncome || balance + totalExpenses} onOpenChat={() => setShowFullChat(true)} /></div>
                            <div className="dr-bottom-right"><RecentTransactions transactions={transactions} fmt={fmt} /></div>
                        </div>
                        {/* Mobile quick-access buttons */}
                        <div className="dr-mobile-quick-row mobile-only">
                            <button className="dr-mobile-quick-btn" onClick={() => setMobilePanelOpen('insights')}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 14v-4m0-4h.01"/></svg><span>AI Insights</span></button>
                            <button className="dr-mobile-quick-btn" onClick={() => setMobilePanelOpen('txns')}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg><span>Transactions</span></button>
                        </div>
                    </>)}

                    {/* ═══ EXPENSES TAB ═══ */}
                    {activeTab === 'expenses' && (<><BrandExpenseSection balance={balance} onAddExpense={handleAddExpense} fmt={fmt} currency={currency} /><CustomExpenseForm balance={balance} onAddExpense={handleAddExpense} fmt={fmt} currency={currency} /></>)}

                    {/* ═══ STATEMENTS TAB ═══ */}
                    {activeTab === 'statements' && <StatementsTab transactions={transactions} balance={balance} totalIncome={totalIncome} totalExpenses={totalExpenses} fmt={fmt} currency={currency} />}

                    {/* ═══ ANALYTICS TAB ═══ */}
                    {activeTab === 'analytics' && (<>
                        <div className="pm-charts-row"><SpendingTrendChart transactions={transactions} fmt={fmt} /><SpendingByCategoryChart transactions={transactions} fmt={fmt} /></div>
                        <MonthlySummaryCard summaries={monthlySummaries} fmt={fmt} />
                        {monthlySummaries.length > 1 && (
                            <div className="dr-multi-month">
                                <div className="dr-monthly-header"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg><span>Monthly Comparison</span></div>
                                <div className="dr-month-bars">{monthlySummaries.filter(s => s.transactionCount > 0).map((s, i) => { const maxExp = Math.max(...monthlySummaries.map(m => m.totalExpenses), 1); return (<div key={i} className="dr-month-bar-row"><span className="dr-month-label">{s.month.split(' ')[0].substring(0, 3)}</span><div className="dr-month-bar-track"><div className="dr-month-bar-fill" style={{ width: `${(s.totalExpenses / maxExp) * 100}%`, background: i === 0 ? 'linear-gradient(90deg, #3b82f6, #8b5cf6)' : 'rgba(255,255,255,0.15)' }} /></div><span className="dr-month-val">{fmt(s.totalExpenses, { decimals: 0 })}</span></div>); })}</div>
                            </div>
                        )}
                        <RecentTransactions transactions={transactions} fmt={fmt} />
                    </>)}
                </div>
            </main>

            {/* ═══ MOBILE BOTTOM NAVIGATION ═══ */}
            <nav className="dr-mobile-bottom-nav mobile-only">
                <button className={`dr-bnav-item ${mobileNav === 'home' ? 'active' : ''}`} onClick={() => handleMobileNav('home')}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg><span>Home</span></button>
                <button className={`dr-bnav-item ${mobileNav === 'expenses' ? 'active' : ''}`} onClick={() => handleMobileNav('expenses')}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg><span>Expenses</span></button>
                <button className={`dr-bnav-item dr-bnav-ai ${mobileNav === 'ai' ? 'active' : ''}`} onClick={() => handleMobileNav('ai')}><div className="dr-bnav-ai-orb"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div><span>AI Chat</span></button>
                <button className={`dr-bnav-item ${mobileNav === 'analytics' ? 'active' : ''}`} onClick={() => handleMobileNav('analytics')}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg><span>Analytics</span></button>
                <button className={`dr-bnav-item ${mobileNav === 'statements' ? 'active' : ''}`} onClick={() => handleMobileNav('statements')}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg><span>Statements</span></button>
            </nav>

            {/* ═══ MOBILE PANELS ═══ */}
            <MobilePanel open={mobilePanelOpen === 'insights'} onClose={() => setMobilePanelOpen(null)} title="AI Insights" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 14v-4m0-4h.01"/></svg>}>
                <AIInsightsDashboard transactions={expenseTransactions.map(t => ({ ...t, amount: t.amount }))} balance={balance} totalSpent={totalExpenses} startingBalance={totalIncome || balance + totalExpenses} onOpenChat={() => { setMobilePanelOpen(null); setShowFullChat(true); }} />
            </MobilePanel>
            <MobilePanel open={mobilePanelOpen === 'txns'} onClose={() => setMobilePanelOpen(null)} title="Recent Transactions" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>}>
                <RecentTransactions transactions={transactions} />
            </MobilePanel>

            {/* ═══ MODALS ═══ */}
            {moneyModal && <MoneyModal type={moneyModal} balance={balance} onClose={() => setMoneyModal(null)} onConfirm={moneyModal === 'deposit' ? handleDeposit : handleWithdraw} />}
            {showEraseModal && <EraseDataModal onClose={() => setShowEraseModal(false)} onConfirmed={handleEraseAllData} />}
            {showAIAssistant && <AIAssistant onClose={() => setShowAIAssistant(false)} user={user} />}

            {/* ═══ FULLSCREEN AI CHAT (desktop + mobile) ═══ */}
            <FullscreenAIChat open={showFullChat} onClose={() => { setShowFullChat(false); if (mobileNav === 'ai') setMobileNav('home'); }} transactions={expenseTransactions.map(t => ({ ...t, amount: t.amount }))} balance={balance} totalSpent={totalExpenses} startingBalance={totalIncome || balance + totalExpenses} />
        </div>
    );
};

export default Dashboard;