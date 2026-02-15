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
    const [amount, setAmount] = useState('');
    const [source, setSource] = useState('');
    const [showToast, setShowToast] = useState(false);
    const isDeposit = type === 'deposit';
    const numAmount = parseFloat(amount) || 0;
    const overLimit = isDeposit && numAmount > DEPOSIT_LIMIT;
    const isValid = numAmount > 0 && (isDeposit ? !overLimit : numAmount <= balance);
    const presets = isDeposit ? [500, 1000, 2000, 5000] : [50, 100, 500, 1000];

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
                        <div><h3 className="dr-modal-title">{isDeposit ? 'Deposit Money' : 'Withdraw Money'}</h3><p className="dr-modal-sub">{isDeposit ? `Max $${DEPOSIT_LIMIT.toLocaleString()}` : 'Take money out'}</p></div>
                        <button className="dr-modal-close" onClick={onClose}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
                    </div>
                    <div className="dr-modal-body">
                        <div className="dr-modal-field">
                            <label className="dr-field-label">Amount</label>
                            <div className={`dr-amount-input-wrap ${overLimit ? 'dr-input-over-limit' : ''}`}>
                                <span className="dr-currency-symbol">$</span>
                                <input type="number" className="dr-amount-input" placeholder="0.00" value={amount} onChange={e => handleAmountChange(e.target.value)} min="0.01" step="0.01" autoFocus />
                            </div>
                            {overLimit && <span className="dr-field-error">🚫 Max deposit is $15,000,000 — you're not Elon Musk!</span>}
                            {!isDeposit && numAmount > balance && <span className="dr-field-error">Exceeds balance (${balance.toFixed(2)})</span>}
                        </div>
                        <div className="dr-presets">{presets.map(p => (<button key={p} className={`dr-preset-btn ${numAmount === p ? 'active' : ''}`} onClick={() => setAmount(String(p))}>${p.toLocaleString()}</button>))}</div>
                        <div className="dr-modal-field">
                            <label className="dr-field-label">{isDeposit ? 'Source (optional)' : 'Reason (optional)'}</label>
                            <input type="text" className="dr-text-input" placeholder={isDeposit ? 'e.g. Salary, Freelance...' : 'e.g. ATM, Transfer...'} value={source} onChange={e => setSource(e.target.value)} />
                        </div>
                    </div>
                    <div className="dr-modal-footer">
                        <button className="dr-modal-cancel" onClick={onClose}>Cancel</button>
                        <button className={`dr-modal-confirm ${isDeposit ? 'green' : 'orange'}`} disabled={!isValid} onClick={() => onConfirm(numAmount, source)}>{isDeposit ? 'Deposit' : 'Withdraw'} ${numAmount > 0 ? numAmount.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}</button>
                    </div>
                </div>
            </div>
        </>
    );
};

/* ═══ BRAND EXPENSE SECTION ═══ */
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
            setAddingId(null); setSuccessId(item.id); setAmounts(prev => ({ ...prev, [item.id]: '' }));
            setTimeout(() => setSuccessId(null), 1500);
        }, 300);
    };
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
                                <div className={`pm-brand-input-wrap ${isOverBudget ? 'error' : ''}`}><span className="pm-brand-currency">$</span><input type="number" className="pm-brand-input" placeholder={item.placeholder} value={amounts[item.id] || ''} onChange={e => setAmounts(prev => ({ ...prev, [item.id]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && isValid && handleAdd(item)} min="0.01" step="0.01" /></div>
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
const CustomExpenseForm = ({ balance, onAddExpense }) => {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Other');
    const [isAdding, setIsAdding] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const selectedCat = CUSTOM_CATEGORIES.find(c => c.value === category);
    const numAmount = parseFloat(amount) || 0;
    const isOverBudget = numAmount > balance;
    const isValid = name.trim() && numAmount > 0 && !isOverBudget;
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
                    <div className="pm-custom-field pm-custom-field-amount"><label className="pm-field-label">Amount</label><div className="pm-input-wrap pm-input-amount-wrap"><span className="pm-input-currency">$</span><input type="number" className="pm-custom-input pm-amount-input" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} min="0.01" step="0.01" /></div>{isOverBudget && <span className="pm-field-error">Exceeds balance</span>}</div>
                </div>
                <div className="pm-custom-field"><label className="pm-field-label">Category</label><div className="pm-category-pills">{CUSTOM_CATEGORIES.map(cat => (<button key={cat.value} type="button" className={`pm-cat-pill ${category === cat.value ? 'active' : ''}`} onClick={() => setCategory(cat.value)}><span>{cat.emoji}</span><span>{cat.label}</span></button>))}</div></div>
                <div className="pm-custom-footer"><button type="submit" className={`pm-custom-submit ${isAdding ? 'adding' : ''} ${showSuccess ? 'success' : ''}`} disabled={!isValid || isAdding}>{showSuccess ? <>✓ Added!</> : <>+ Add Expense</>}</button></div>
            </form>
        </div>
    );
};

/* ═══ SPENDING TREND CHART ═══ */
const SpendingTrendChart = ({ transactions }) => {
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
                <div className="pm-trend-stat"><span className="pm-trend-stat-label">Total Spent</span><span className="pm-trend-stat-val">${running.toFixed(2)}</span></div>
                <div className="pm-trend-stat"><span className="pm-trend-stat-label">Avg / Txn</span><span className="pm-trend-stat-val">${(running / n).toFixed(2)}</span></div>
                <div className="pm-trend-stat"><span className="pm-trend-stat-label">Largest</span><span className="pm-trend-stat-val pm-trend-stat-val--red">${Math.max(...expenses.map(t => t.amount)).toFixed(2)}</span></div>
            </div>
            <div className="pm-trend-svg-wrap">
                <svg viewBox={`0 0 ${W} ${H}`} className="pm-trend-svg" style={{ display: 'block', width: '100%' }}>
                    <defs><linearGradient id="drFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" /><stop offset="100%" stopColor="#3b82f6" stopOpacity="0" /></linearGradient></defs>
                    <path d={areaPath} fill="url(#drFill)" /><polyline points={linePts} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    {points.map((p, i) => (<g key={i} onMouseEnter={() => setTooltip({ i, x: xOf(i), y: yOf(p.cumulative), ...p })} onMouseLeave={() => setTooltip(null)} style={{ cursor: 'pointer' }}><circle cx={xOf(i)} cy={yOf(p.cumulative)} r="10" fill="transparent" /><circle cx={xOf(i)} cy={yOf(p.cumulative)} r={tooltip?.i === i ? 5 : 3.5} fill={tooltip?.i === i ? '#fff' : '#3b82f6'} stroke={tooltip?.i === i ? '#3b82f6' : '#1e3a8a'} strokeWidth="2" /></g>))}
                </svg>
                {tooltip && (<div className="pm-trend-tooltip" style={{ left: `${(tooltip.x / W) * 100}%`, top: `${(tooltip.y / H) * 100}%` }}><div className="pm-tt-name">{tooltip.name}</div><div className="pm-tt-row"><span>Amount</span><span className="pm-tt-red">-${tooltip.amount.toFixed(2)}</span></div><div className="pm-tt-row"><span>Total</span><span>${tooltip.cumulative.toFixed(2)}</span></div><div className="pm-tt-cat">{tooltip.category}</div></div>)}
            </div>
        </div>
    );
};

/* ═══ SPENDING BY CATEGORY CHART ═══ */
const SpendingByCategoryChart = ({ transactions }) => {
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
                    <div className="pm-donut-center">{hovered ? (<><span className="pm-donut-center-pct" style={{ color: colors[hovered] }}>{((totals[hovered] / total) * 100).toFixed(0)}%</span><span className="pm-donut-center-label">{hovered}</span></>) : (<><span className="pm-donut-center-total">${total >= 1000 ? `${(total / 1000).toFixed(1)}k` : total.toFixed(0)}</span><span className="pm-donut-center-label">total</span></>)}</div>
                </div>
                <div className="pm-donut-legend">
                    {segs.map(([cat, amt]) => (<div key={cat} className={`pm-legend-item ${hovered === cat ? 'hovered' : ''}`} onMouseEnter={() => setHovered(cat)} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}><span className="pm-legend-dot" style={{ background: colors[cat] || '#666' }} /><span className="pm-legend-name">{cat}</span><div className="pm-legend-right"><span className="pm-legend-pct">{((amt / total) * 100).toFixed(0)}%</span><span className="pm-legend-amt">${amt.toFixed(2)}</span></div></div>))}
                    <div className="pm-legend-total-row"><span>Total</span><span className="pm-legend-total-val">${total.toFixed(2)}</span></div>
                </div>
            </div>
        </div>
    );
};

/* ═══ RECENT TRANSACTIONS ═══ */
const RecentTransactions = ({ transactions }) => (
    <div className="pm-txns">
        <div className="pm-txns-header"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg><span>Recent Transactions</span></div>
        <div className="pm-txns-list">
            {transactions.length === 0 ? (<div className="pm-txns-empty"><span>No transactions yet</span><span className="pm-txns-sub">Deposit money and add expenses</span></div>
            ) : transactions.slice(0, 12).map((t, i) => (
                <div key={t.id || i} className="pm-txn-row">
                    {t.logo && logoMap[t.logo] ? <img src={logoMap[t.logo]} alt={t.name} className="pm-txn-logo" /> : <span className="pm-txn-emoji">{t.emoji || (t.type === 'deposit' ? '💰' : '💳')}</span>}
                    <div className="pm-txn-info"><span className="pm-txn-name">{t.name}</span><span className="pm-txn-cat">{t.category}{t.created_at ? ` · ${new Date(t.created_at).toLocaleDateString()}` : ''}</span></div>
                    <span className="pm-txn-amt" style={{ color: t.type === 'deposit' ? '#10b981' : '#ef4444' }}>{t.type === 'deposit' ? '+' : '-'}${t.amount.toFixed(2)}</span>
                </div>
            ))}
        </div>
    </div>
);

/* ═══ MONTHLY SUMMARY ═══ */
const MonthlySummaryCard = ({ summaries }) => {
    if (!summaries || summaries.length === 0) return null;
    const current = summaries[0]; const previous = summaries[1];
    const changePercent = previous && previous.totalExpenses > 0 ? (((current.totalExpenses - previous.totalExpenses) / previous.totalExpenses) * 100).toFixed(0) : null;
    return (
        <div className="dr-monthly-summary">
            <div className="dr-monthly-header"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg><span>Monthly Overview — {current.month}</span></div>
            <div className="dr-monthly-stats">
                <div className="dr-mstat"><span className="dr-mstat-label">Deposited</span><span className="dr-mstat-val green">${current.totalDeposits.toFixed(2)}</span></div>
                <div className="dr-mstat"><span className="dr-mstat-label">Spent</span><span className="dr-mstat-val red">${current.totalExpenses.toFixed(2)}</span></div>
                <div className="dr-mstat"><span className="dr-mstat-label">Net</span><span className="dr-mstat-val" style={{ color: current.saved >= 0 ? '#10b981' : '#ef4444' }}>${current.saved.toFixed(2)}</span></div>
                <div className="dr-mstat"><span className="dr-mstat-label">Transactions</span><span className="dr-mstat-val">{current.transactionCount}</span></div>
            </div>
            {changePercent !== null && <div className="dr-monthly-change" style={{ color: Number(changePercent) <= 0 ? '#10b981' : '#ef4444' }}>{Number(changePercent) <= 0 ? '↓' : '↑'} {Math.abs(Number(changePercent))}% {Number(changePercent) <= 0 ? 'less' : 'more'} spending than {previous.month}</div>}
            {current.topCategory && <div className="dr-monthly-top">Top category: <strong>{current.topCategory[0]}</strong> — ${current.topCategory[1].toFixed(2)}</div>}
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
const StatementsTab = ({ transactions, balance, totalIncome, totalExpenses }) => {
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
        const logo = '/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAHNAh0DASIAAhEBAxEB/8QAHAABAAEFAQEAAAAAAAAAAAAAAAMCBAUGBwEI/8QAThAAAQMDAgIFCQQFCAkEAwEAAQACAwQFEQYhEjEHE0FRYRQiMnGBkaGxwSNCUnIVM2Ky0SQ0Q3SCksLwFiU2RFNjc6LhVmST8SY1lHX/xAAbAQEAAgMBAQAAAAAAAAAAAAAAAQIDBAUGB//EADgRAAIBAgQDBQcDBAMAAwAAAAABAgMRBBIhMQVBURMiYXHRBjKBkaGx8BQjwTNC4fEVUmIWQ1P/2gAMAwEAAhEDEQA/APjJERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREARVMa55wxpce4DKuRba7h4nU74298nmfNSot7Ii6LRFeCgIGZKukjHjLxfu5UjaKix592gB7mxvP0VuzkLox6LI+SW3tuw//AJ3L0UdtOzbtk/1dyt2UvD5r1GZGNRbJQ6PuNe0PopGSsPJzopGj91Tu6PtTgnFLAR3+UMaPiQr/AKSu1dRZTtYdTVEW0jQOpzyooj6qhh+RVD9DagZ6UNOD3eUM/in6Sv8A9H8h2sOprKLYDo6/Y2poXflqIz9Vb1Gl9QQDL7TVOHexnH8sqjoVVvF/IspxfMy9jpY9SaVktUMLP0tbyZacgYM0ZPnNPiFHrRtPZ7fR6ap2xumhAmrZQBkyuHo57gFfdHFX+hr3Tx3KOro2OL+J8gDIx5p9LIz8eeFg9Z3SG6XaaWF0zmiV+HSOaQRnbGANltzyrD5v7tvgWuYJERc8BERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREARF6xrnuDWtLnE4AA3KA8VcMUs8gjhjfI88mtGSVkXW6CiAdc5i2QjIp4jl/9o8m/PwUct1mEZhomNo4TzEXpO/M7mVl7NR9928OZW99iptsbFvcKuKlH4B58n90cvaQvDUWyAYpqJ87xykqH7f3R9SVjjvzRR2iXur+SbdS9ddK7hLY5zCw/dhaGD4K0e98juJ73OPeTlT26grLjUtpqKnknld2NHL19wWbdbLLZc/pmpNdVj/dKR/mtPc9/wBApUZ1FdvTxIuloYGlpqiqlEVLBLPIeTY2lx9wWZZpmWAE3e40VsxuWSSccn9xuSlVqmu6g0tsihtVMduClbwud+Z/MlYF7nPcXOcXOO5JOSVP7cfH6IjvPwNjE2kbeOFlLWXmQc3yP6iM+oDJVLtV1MW1ttttt4HIx04c8f2nZWuonbzXu6eX5cZFz1NiobjqrUFxbSwXKslmfvhspY0DvwMAKPVdlvtnkYLs6V4k9F5eXAnu3TQlxrrZqGGooKKStlILTDG0lxB7sLqWvrJddSU1LLd6222GlH2jvK5h1me7A2+K3qVK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';

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
                    <span className="st-sum-val green">+${totalIn.toFixed(2)}</span>
                </div>
                <div className="st-sum-card st-sum-expense">
                    <span className="st-sum-icon">💸</span>
                    <span className="st-sum-label">Spent</span>
                    <span className="st-sum-val red">-${totalSpent.toFixed(2)}</span>
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
                                            <span className="st-cat-amt">${amt.toFixed(2)}</span>
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
                                <span className={`st-td-amt ${t.type === 'deposit' ? 'st-green' : 'st-red'}`}>{t.type === 'deposit' ? '+' : '-'}${t.amount.toFixed(2)}</span>
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
    const chartsRef = useRef(null);
    const menuRef = useRef(null);

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
            const done = localStorage.getItem('finscope_tutorial_completed');
            const seen = sessionStorage.getItem('dashboard_visited');
            if (!done && !seen) { const t = setTimeout(() => setShowTutorial(true), 1500); sessionStorage.setItem('dashboard_visited', 'true'); return () => clearTimeout(t); }
        }
    }, [user, loading]);

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
            // Delete all transactions
            const { error: txnError } = await supabase
                .from('user_transactions')
                .delete()
                .eq('user_id', user.id);
            if (txnError) throw txnError;
            // Reset finance profile
            const { error: finError } = await supabase
                .from('user_finances')
                .update({ balance: 0, total_income: 0, total_expenses: 0, updated_at: new Date().toISOString() })
                .eq('user_id', user.id);
            if (finError) throw finError;
            // Reset local state
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

    if (loading) return (<div className="dashboard-loading"><div className="loading-orb"><FinScopeAI /></div><p className="loading-text">Loading your dashboard...</p></div>);
    if (!user) { navigate('/login'); return null; }

    return (
        <div className="dashboard dr-has-mobile-nav">
            {showTutorial && <DashboardTutorial onComplete={() => setShowTutorial(false)} onSkip={() => setShowTutorial(false)} />}

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
                                <div><span className="dr-balance-label">Total Balance</span><span className="dr-balance-amount">${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                                <div className="dr-balance-actions">
                                    <button className="dr-action-btn dr-deposit" onClick={() => setMoneyModal('deposit')}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12l7-7 7 7" /></svg>Deposit</button>
                                    <button className="dr-action-btn dr-withdraw" onClick={() => setMoneyModal('withdraw')} disabled={balance <= 0}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 19V5M5 12l7 7 7-7" /></svg>Withdraw</button>
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
                        <MonthlySummaryCard summaries={monthlySummaries} />
                        <div className="pm-charts-row" ref={chartsRef}><SpendingTrendChart transactions={transactions} /><SpendingByCategoryChart transactions={transactions} /></div>
                        <div className="dr-bottom-grid">
                            <div className="dr-bottom-left"><AIInsightsDashboard transactions={expenseTransactions.map(t => ({ ...t, amount: t.amount }))} balance={balance} totalSpent={totalExpenses} startingBalance={totalIncome || balance + totalExpenses} onOpenChat={() => setShowFullChat(true)} /></div>
                            <div className="dr-bottom-right"><RecentTransactions transactions={transactions} /></div>
                        </div>
                        {/* Mobile quick-access buttons */}
                        <div className="dr-mobile-quick-row mobile-only">
                            <button className="dr-mobile-quick-btn" onClick={() => setMobilePanelOpen('insights')}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 14v-4m0-4h.01"/></svg><span>AI Insights</span></button>
                            <button className="dr-mobile-quick-btn" onClick={() => setMobilePanelOpen('txns')}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg><span>Transactions</span></button>
                        </div>
                    </>)}

                    {/* ═══ EXPENSES TAB ═══ */}
                    {activeTab === 'expenses' && (<><BrandExpenseSection balance={balance} onAddExpense={handleAddExpense} /><CustomExpenseForm balance={balance} onAddExpense={handleAddExpense} /></>)}

                    {/* ═══ STATEMENTS TAB ═══ */}
                    {activeTab === 'statements' && <StatementsTab transactions={transactions} balance={balance} totalIncome={totalIncome} totalExpenses={totalExpenses} />}

                    {/* ═══ ANALYTICS TAB ═══ */}
                    {activeTab === 'analytics' && (<>
                        <div className="pm-charts-row"><SpendingTrendChart transactions={transactions} /><SpendingByCategoryChart transactions={transactions} /></div>
                        <MonthlySummaryCard summaries={monthlySummaries} />
                        {monthlySummaries.length > 1 && (
                            <div className="dr-multi-month">
                                <div className="dr-monthly-header"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg><span>Monthly Comparison</span></div>
                                <div className="dr-month-bars">{monthlySummaries.filter(s => s.transactionCount > 0).map((s, i) => { const maxExp = Math.max(...monthlySummaries.map(m => m.totalExpenses), 1); return (<div key={i} className="dr-month-bar-row"><span className="dr-month-label">{s.month.split(' ')[0].substring(0, 3)}</span><div className="dr-month-bar-track"><div className="dr-month-bar-fill" style={{ width: `${(s.totalExpenses / maxExp) * 100}%`, background: i === 0 ? 'linear-gradient(90deg, #3b82f6, #8b5cf6)' : 'rgba(255,255,255,0.15)' }} /></div><span className="dr-month-val">${s.totalExpenses.toFixed(0)}</span></div>); })}</div>
                            </div>
                        )}
                        <RecentTransactions transactions={transactions} />
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