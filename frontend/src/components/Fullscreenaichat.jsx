// src/components/FullscreenAIChat.jsx
// Full-page AI chat modal + AI Insights Dashboard + Inline Chart Generation
// Now uses the real FinScopeAI orb component

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { sendMessage } from '../services/claudeAI';
import FinScopeAI from './FinScopeAI';

/* ═══════════════════════════════════════════
   MINI ORB WRAPPER
   Scales the full FinScopeAI orb to any size
   ═══════════════════════════════════════════ */
const MiniOrb = ({ size = 40 }) => {
    // The FinScopeAI component renders at ~400px, we scale it down
    const scale = size / 400;
    return (
        <div className="fsc-real-orb" style={{
            width: size, height: size, minWidth: size,
            overflow: 'hidden', borderRadius: '50%',
            position: 'relative',
        }}>
            <div style={{
                transform: `scale(${scale})`,
                transformOrigin: 'center center',
                width: 400, height: 400,
                position: 'absolute',
                top: '50%', left: '50%',
                marginTop: -200, marginLeft: -200,
                pointerEvents: 'none',
            }}>
                <FinScopeAI />
            </div>
        </div>
    );
};


/* ═══════════════════════════════════════════
   INLINE CHART COMPONENTS
   ═══════════════════════════════════════════ */
const CHART_COLORS = {
    Groceries: '#3b82f6', Subscriptions: '#8b5cf6', Shopping: '#a78bfa',
    Transport: '#06b6d4', Dining: '#f59e0b', Bills: '#ef4444',
    Health: '#10b981', Entertainment: '#ec4899', Education: '#f97316', Other: '#6b7280',
};
const FALLBACK_COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981', '#ec4899', '#f97316', '#a78bfa', '#6b7280'];

const InlineDonutChart = ({ data, total }) => {
    const [hovered, setHovered] = useState(null);
    const r = 38, circ = 2 * Math.PI * r;
    let offset = -circ * 0.25;
    return (
        <div className="fsc-chart-donut-wrap">
            <svg viewBox="0 0 120 120" className="fsc-chart-donut-svg">
                {data.map((seg, i) => {
                    const pct = seg.amount / total; const dash = pct * circ; const gap = circ - dash; const cur = offset; offset += dash;
                    const color = CHART_COLORS[seg.name] || FALLBACK_COLORS[i % FALLBACK_COLORS.length];
                    const isHov = hovered === seg.name;
                    return (<circle key={seg.name} cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth={isHov ? 12 : 8}
                                    strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-cur} strokeLinecap="round"
                                    style={{ transition: 'stroke-width 0.2s', cursor: 'pointer', filter: isHov ? `drop-shadow(0 0 6px ${color})` : 'none' }}
                                    onMouseEnter={() => setHovered(seg.name)} onMouseLeave={() => setHovered(null)} />);
                })}
                <text x="60" y="56" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="800" fontFamily="system-ui">
                    {hovered ? `${((data.find(d => d.name === hovered)?.amount / total) * 100).toFixed(0)}%` : `$${total >= 1000 ? (total / 1000).toFixed(1) + 'k' : total.toFixed(0)}`}
                </text>
                <text x="60" y="70" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="system-ui">{hovered || 'total spent'}</text>
            </svg>
            <div className="fsc-chart-legend">
                {data.map((seg, i) => {
                    const color = CHART_COLORS[seg.name] || FALLBACK_COLORS[i % FALLBACK_COLORS.length];
                    return (<div key={seg.name} className={`fsc-legend-row ${hovered === seg.name ? 'hovered' : ''}`}
                                 onMouseEnter={() => setHovered(seg.name)} onMouseLeave={() => setHovered(null)}>
                        <span className="fsc-legend-dot" style={{ background: color }} /><span className="fsc-legend-name">{seg.name}</span>
                        <span className="fsc-legend-val">${seg.amount.toFixed(2)}</span><span className="fsc-legend-pct">{((seg.amount / total) * 100).toFixed(0)}%</span>
                    </div>);
                })}
            </div>
        </div>
    );
};

const InlineBarChart = ({ data }) => {
    const maxVal = Math.max(...data.map(d => d.amount), 1);
    return (
        <div className="fsc-chart-bars">
            {data.map((seg, i) => {
                const color = CHART_COLORS[seg.name] || FALLBACK_COLORS[i % FALLBACK_COLORS.length];
                return (<div key={seg.name} className="fsc-bar-row">
                    <span className="fsc-bar-label">{seg.name}</span>
                    <div className="fsc-bar-track"><div className="fsc-bar-fill" style={{ width: `${(seg.amount / maxVal) * 100}%`, background: `linear-gradient(90deg, ${color}, ${color}bb)` }} /></div>
                    <span className="fsc-bar-val">${seg.amount.toFixed(2)}</span>
                </div>);
            })}
        </div>
    );
};

const InlineTrendChart = ({ transactions }) => {
    const [hovered, setHovered] = useState(null);
    let running = 0;
    const pts = transactions.map((t, i) => { running += t.amount; return { i, cum: running, name: t.name, amount: t.amount }; });
    const W = 400, H = 160, P = { t: 20, r: 16, b: 28, l: 50 };
    const cW = W - P.l - P.r, cH = H - P.t - P.b;
    const maxV = Math.max(...pts.map(p => p.cum), 1); const n = pts.length;
    const xOf = i => P.l + (n === 1 ? cW / 2 : (i / (n - 1)) * cW);
    const yOf = v => P.t + cH - (v / maxV) * cH;
    const line = pts.map((p, i) => `${xOf(i)},${yOf(p.cum)}`).join(' ');
    const area = `M${xOf(0)},${yOf(pts[0].cum)} ` + pts.slice(1).map((p, i) => `L${xOf(i + 1)},${yOf(p.cum)}`).join(' ') + ` L${xOf(n - 1)},${P.t + cH} L${xOf(0)},${P.t + cH} Z`;
    return (
        <div className="fsc-chart-trend-wrap">
            <svg viewBox={`0 0 ${W} ${H}`} className="fsc-chart-trend-svg">
                <defs><linearGradient id="fscTrendFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" /><stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" /></linearGradient></defs>
                {[0, 0.25, 0.5, 0.75, 1].map((f, i) => { const val = maxV * f, y = yOf(val); return (<g key={i}><line x1={P.l} y1={y} x2={W - P.r} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray={i === 0 ? '0' : '3,4'} /><text x={P.l - 6} y={y + 3.5} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="system-ui">{val >= 1000 ? `$${(val / 1000).toFixed(1)}k` : `$${val.toFixed(0)}`}</text></g>); })}
                <path d={area} fill="url(#fscTrendFill)" /><polyline points={line} fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {pts.map((p, i) => (<g key={i} onMouseEnter={() => setHovered(p)} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}><circle cx={xOf(i)} cy={yOf(p.cum)} r="12" fill="transparent" /><circle cx={xOf(i)} cy={yOf(p.cum)} r={hovered?.i === i ? 5 : 3.5} fill={hovered?.i === i ? '#fff' : '#8b5cf6'} stroke={hovered?.i === i ? '#8b5cf6' : '#1e1b4b'} strokeWidth="2" style={{ transition: 'all 0.15s' }} /></g>))}
                {n >= 1 && <text x={xOf(n - 1)} y={yOf(pts[n - 1].cum) - 10} textAnchor="end" fill="#a78bfa" fontSize="11" fontWeight="700" fontFamily="system-ui">${pts[n - 1].cum.toFixed(2)}</text>}
            </svg>
            {hovered && (<div className="fsc-trend-tt" style={{ left: `${(xOf(hovered.i) / W) * 100}%`, top: `${(yOf(hovered.cum) / H) * 100}%` }}><div className="fsc-tt-name">{hovered.name}</div><div className="fsc-tt-amt">-${hovered.amount.toFixed(2)}</div><div className="fsc-tt-cum">Total: ${hovered.cum.toFixed(2)}</div></div>)}
        </div>
    );
};

const InlineBudgetGauge = ({ totalSpent, startingBalance, categoryData }) => {
    const pct = startingBalance > 0 ? Math.min((totalSpent / startingBalance) * 100, 100) : 0;
    const remaining = startingBalance - totalSpent;
    const gaugeColor = pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#10b981';
    const circ = Math.PI * 50; const dashLen = (pct / 100) * circ;
    const needs = ['Bills', 'Groceries', 'Transport', 'Health'];
    const wants = ['Subscriptions', 'Shopping', 'Dining', 'Entertainment'];
    const needsAmt = categoryData.filter(c => needs.includes(c.name)).reduce((s, c) => s + c.amount, 0);
    const wantsAmt = categoryData.filter(c => wants.includes(c.name)).reduce((s, c) => s + c.amount, 0);
    const otherAmt = totalSpent - needsAmt - wantsAmt;
    return (
        <div className="fsc-chart-gauge-wrap">
            <div className="fsc-gauge-visual">
                <svg viewBox="0 0 120 70" className="fsc-gauge-svg">
                    <path d="M 10 65 A 50 50 0 0 1 110 65" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" strokeLinecap="round" />
                    <path d="M 10 65 A 50 50 0 0 1 110 65" fill="none" stroke={gaugeColor} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${dashLen} ${circ}`} style={{ transition: 'stroke-dasharray 0.8s ease-out' }} />
                    <text x="60" y="52" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="800" fontFamily="system-ui">{pct.toFixed(0)}%</text>
                    <text x="60" y="64" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="system-ui">budget used</text>
                </svg>
                <div className="fsc-gauge-remaining"><span className="fsc-gauge-label">Remaining</span><span className="fsc-gauge-val" style={{ color: remaining < 0 ? '#ef4444' : '#10b981' }}>${remaining.toFixed(2)}</span></div>
            </div>
            <div className="fsc-gauge-5030">
                <div className="fsc-503020-title">50/30/20 Rule Breakdown</div>
                {[{ label: 'Needs (50%)', amt: needsAmt, color: '#3b82f6' }, { label: 'Wants (30%)', amt: wantsAmt, color: '#8b5cf6' }, { label: 'Other (20%)', amt: otherAmt, color: '#10b981' }].map(row => (
                    <div key={row.label} className="fsc-503020-row"><span className="fsc-503020-label">{row.label}</span><div className="fsc-503020-bar"><div className="fsc-503020-fill" style={{ width: `${totalSpent > 0 ? (row.amt / totalSpent) * 100 : 0}%`, background: row.color }} /></div><span className="fsc-503020-pct">{totalSpent > 0 ? ((row.amt / totalSpent) * 100).toFixed(0) : 0}%</span></div>
                ))}
            </div>
        </div>
    );
};

const InlineDashboard = ({ transactions, totalSpent, startingBalance, balance }) => {
    const catTotals = {};
    transactions.forEach(t => { catTotals[t.category] = (catTotals[t.category] || 0) + t.amount; });
    const catData = Object.entries(catTotals).sort((a, b) => b[1] - a[1]).map(([name, amount]) => ({ name, amount }));
    return (
        <div className="fsc-dashboard-inline">
            <div className="fsc-dash-section"><div className="fsc-dash-section-hdr"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg><span>Spending by Category</span></div><InlineDonutChart data={catData} total={totalSpent} /></div>
            {transactions.length >= 2 && <div className="fsc-dash-section"><div className="fsc-dash-section-hdr"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg><span>Spending Trend</span></div><InlineTrendChart transactions={transactions} /></div>}
            <div className="fsc-dash-section"><div className="fsc-dash-section-hdr"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg><span>Category Breakdown</span></div><InlineBarChart data={catData} /></div>
            <div className="fsc-dash-section"><div className="fsc-dash-section-hdr"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg><span>Budget Health</span></div><InlineBudgetGauge totalSpent={totalSpent} startingBalance={startingBalance} categoryData={catData} /></div>
        </div>
    );
};


/* ═══════════════════════════════════════════
   CHART REQUEST DETECTOR
   ═══════════════════════════════════════════ */
const CHART_KEYWORDS = ['chart','graph','dashboard','visuali','diagram','donut','pie chart','bar chart','trend','show me','draw','plot','display','breakdown chart','spending chart','create a graph','generate a chart','make a chart','make a graph','make a dashboard','generate dashboard','show dashboard','budget gauge','visual'];
const detectChartRequest = (msg) => CHART_KEYWORDS.some(kw => msg.toLowerCase().includes(kw));
const detectChartType = (msg) => {
    const l = msg.toLowerCase();
    if (l.includes('donut') || l.includes('pie')) return 'donut';
    if (l.includes('bar')) return 'bar';
    if (l.includes('trend') || l.includes('line') || l.includes('over time')) return 'trend';
    if (l.includes('gauge') || l.includes('budget') || l.includes('50/30/20') || l.includes('health')) return 'gauge';
    return 'dashboard';
};


/* ═══════════════════════════════════════════
   FULLSCREEN AI CHAT MODAL
   Now uses the real FinScopeAI orb
   ═══════════════════════════════════════════ */
const FullscreenAIChat = ({ open, onClose, transactions, balance, totalSpent, startingBalance }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatRef = useRef(null);
    const inputRef = useRef(null);

    const categoryData = useMemo(() => {
        const totals = {};
        transactions.forEach(t => { totals[t.category] = (totals[t.category] || 0) + t.amount; });
        return Object.entries(totals).sort((a, b) => b[1] - a[1]).map(([name, amount]) => ({ name, amount }));
    }, [transactions]);

    useEffect(() => {
        if (open && messages.length === 0) {
            const hasData = transactions.length > 0;
            const welcome = hasData
                ? `Hey there! 👋 I can see you've made ${transactions.length} transaction${transactions.length !== 1 ? 's' : ''} totaling $${totalSpent.toFixed(2)}.\n\nAsk me anything — I can analyze spending, suggest savings, or generate charts and dashboards right here in the chat! Try:\n• "Show me a dashboard"\n• "Create a spending chart"\n• "Draw a trend graph"`
                : `Hey there! 👋 I'm your AI financial assistant powered by Claude. Start adding some expenses in Practice Mode, then come chat with me for personalized insights — I can even generate interactive charts for you!`;
            setMessages([{ id: 1, role: 'ai', text: welcome }]);
        }
    }, [open]);

    useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [messages, isTyping]);
    useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 300); }, [open]);
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        if (open) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [open, onClose]);

    const handleSend = async (text) => {
        if (!text?.trim() || isTyping) return;
        const msg = text.trim(); setInput('');
        setMessages(p => [...p, { id: Date.now(), role: 'user', text: msg }]);
        setIsTyping(true);
        const isChart = detectChartRequest(msg);
        const chartType = isChart ? detectChartType(msg) : null;
        try {
            const sessionData = { transactions, balance, totalSpent, startingBalance };
            if (isChart && transactions.length > 0) {
                const chartPrompt = chartType === 'dashboard'
                    ? `The user asked me to generate a full dashboard. I'm about to show them interactive charts. Give a brief 2-3 sentence overview of their spending that goes well with the visual charts. Reference specific numbers and categories.`
                    : chartType === 'donut' || chartType === 'bar'
                        ? `The user asked for a ${chartType} chart of their spending by category. I'm showing it now. Give a brief 2-sentence analysis of their category breakdown with specific numbers.`
                        : chartType === 'trend'
                            ? `The user asked for a spending trend chart. I'm showing it now. Give a brief 2-sentence analysis of how their spending has progressed over time.`
                            : `The user asked for a budget health gauge. I'm showing the 50/30/20 breakdown now. Give a brief 2-sentence assessment of their budget health.`;
                const aiText = await sendMessage(chartPrompt, sessionData);
                setMessages(p => [...p, { id: Date.now() + 1, role: 'ai', text: aiText, chart: chartType }]);
            } else if (isChart && transactions.length === 0) {
                setMessages(p => [...p, { id: Date.now() + 1, role: 'ai', text: "I'd love to generate charts for you, but you haven't made any transactions yet! 📊 Head back and add some expenses, then ask me again." }]);
            } else {
                const response = await sendMessage(msg, sessionData);
                setMessages(p => [...p, { id: Date.now() + 1, role: 'ai', text: response }]);
            }
        } catch (err) {
            setMessages(p => [...p, { id: Date.now() + 1, role: 'ai', text: '⚠️ Something went wrong. Please check your API key in .env and try again.' }]);
        }
        setIsTyping(false);
    };

    const suggestions = [
        { emoji: '📊', label: 'Generate dashboard', prompt: 'Show me a full dashboard with all my spending charts' },
        { emoji: '🍩', label: 'Category pie chart', prompt: 'Create a donut chart of my spending by category' },
        { emoji: '📈', label: 'Spending trend', prompt: 'Show me a trend graph of my spending over time' },
        { emoji: '🎯', label: 'Budget health', prompt: 'Show me a budget gauge with my 50/30/20 breakdown' },
        { emoji: '💰', label: 'Savings tips', prompt: 'Based on my actual spending, give me 3 specific tips to save money.' },
        { emoji: '⚠️', label: 'Red flags', prompt: 'Are there any spending red flags or areas where I\'m overspending?' },
    ];

    const renderChart = (chartType) => {
        if (transactions.length === 0) return null;
        switch (chartType) {
            case 'donut': return <InlineDonutChart data={categoryData} total={totalSpent} />;
            case 'bar': return <InlineBarChart data={categoryData} />;
            case 'trend': return transactions.length >= 2 ? <InlineTrendChart transactions={transactions} /> : <InlineBarChart data={categoryData} />;
            case 'gauge': return <InlineBudgetGauge totalSpent={totalSpent} startingBalance={startingBalance} categoryData={categoryData} />;
            case 'dashboard': return <InlineDashboard transactions={transactions} totalSpent={totalSpent} startingBalance={startingBalance} balance={balance} />;
            default: return null;
        }
    };

    if (!open) return null;

    return (
        <div className="fsc-overlay" onClick={onClose}>
            <div className="fsc-modal" onClick={e => e.stopPropagation()}>
                {/* ── Header with real FinScopeAI orb ── */}
                <div className="fsc-header">
                    <div className="fsc-header-left">
                        <MiniOrb size={44} />
                        <div><h2 className="fsc-title">FinScope AI</h2><span className="fsc-subtitle">Your personal finance assistant</span></div>
                        <span className="fsc-live-badge"><span className="fsc-live-dot" />LIVE AI</span>
                    </div>
                    <button className="fsc-close" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* ── Stats bar ── */}
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

                {/* ── Messages with real orb avatars ── */}
                <div className="fsc-messages" ref={chatRef}>
                    {messages.map(m => (
                        <div key={m.id} className={`fsc-msg ${m.role}`}>
                            {m.role === 'ai' && (
                                <div className="fsc-msg-orb"><MiniOrb size={30} /></div>
                            )}
                            <div className={`fsc-bubble-group ${m.role}`}>
                                <div className={`fsc-bubble ${m.role}`}>
                                    {m.text.split('\n').map((line, i) => (
                                        <span key={i}>
                                            {line.split(/(\*\*.*?\*\*)/).map((part, j) =>
                                                part.startsWith('**') && part.endsWith('**')
                                                    ? <strong key={j} style={{ fontWeight: 700, color: '#fff' }}>{part.slice(2, -2)}</strong>
                                                    : part
                                            )}
                                            <br />
                                        </span>
                                    ))}
                                </div>
                                {m.chart && (
                                    <div className="fsc-chart-container">
                                        <div className="fsc-chart-badge">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
                                            AI Generated {m.chart === 'dashboard' ? 'Dashboard' : m.chart === 'donut' ? 'Pie Chart' : m.chart === 'bar' ? 'Bar Chart' : m.chart === 'trend' ? 'Trend Graph' : 'Budget Gauge'}
                                        </div>
                                        {renderChart(m.chart)}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="fsc-msg ai">
                            <div className="fsc-msg-orb"><MiniOrb size={30} /></div>
                            <div className="fsc-bubble ai fsc-typing"><span className="fsc-dot" /><span className="fsc-dot" /><span className="fsc-dot" /></div>
                        </div>
                    )}
                </div>

                {/* ── Suggestions ── */}
                {messages.length <= 2 && (
                    <div className="fsc-suggestions">
                        {suggestions.map((s, i) => (
                            <button key={i} className="fsc-suggestion" onClick={() => handleSend(s.prompt)} disabled={isTyping}>
                                <span className="fsc-sug-emoji">{s.emoji}</span><span>{s.label}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* ── Input ── */}
                <div className="fsc-input-area">
                    <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                           onKeyDown={e => e.key === 'Enter' && handleSend(input)}
                           placeholder="Ask anything or say 'show me a chart'..."
                           disabled={isTyping} className="fsc-input" />
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
   ═══════════════════════════════════════════ */
const AIInsightsDashboard = ({ transactions, balance, totalSpent, startingBalance, onOpenChat }) => {
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastTxnCount, setLastTxnCount] = useState(0);

    useEffect(() => {
        const shouldGenerate = transactions.length > 0 && (transactions.length === 1 || transactions.length >= lastTxnCount + 2);
        if (!shouldGenerate) return;
        const generateInsights = async () => {
            setLoading(true); setLastTxnCount(transactions.length);
            try {
                const sessionData = { transactions, balance, totalSpent, startingBalance };
                const response = await sendMessage(
                    `Based on my spending data, generate exactly 3 short insights. For each insight, use this format on a separate line:\n[emoji] [Title]: [One sentence insight]\n\nExample format:\n💡 Smart Saver: You're keeping dining costs under control at only 15% of your budget.\n⚠️ Watch Out: Subscription costs are adding up fast at $45.97 total.\n🎯 Goal Tip: Try to keep your next purchase under $20 to stay on track.\n\nBe specific with my actual numbers. Keep each insight to ONE short sentence.`, sessionData);
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
            } catch (err) { console.log('Insights generation skipped:', err.message); }
            setLoading(false);
        };
        generateInsights();
    }, [transactions.length]);

    if (transactions.length === 0 && insights.length === 0) return null;

    return (
        <div className="pm-insights-dash">
            <div className="pm-insights-header">
                <MiniOrb size={30} />
                <div><h3 className="pm-insights-title">AI Insights</h3><span className="pm-insights-sub">Powered by Claude</span></div>
                {loading && <span className="pm-insights-loading">Analyzing...</span>}
            </div>
            <div className="pm-insights-cards">
                {insights.length > 0 ? insights.map(ins => (
                    <div key={ins.id} className={`pm-insight-card pm-insight-card--${ins.type}`}>
                        <span className="pm-insight-emoji">{ins.emoji}</span>
                        <div className="pm-insight-text"><span className="pm-insight-title">{ins.title}</span><span className="pm-insight-body">{ins.body}</span></div>
                    </div>
                )) : (
                    <div className="pm-insight-card pm-insight-card--tip">
                        <span className="pm-insight-emoji">✨</span>
                        <div className="pm-insight-text"><span className="pm-insight-title">Getting Started</span><span className="pm-insight-body">Add more expenses and I'll generate personalized financial insights for you.</span></div>
                    </div>
                )}
            </div>
            <button className="pm-insights-chat-btn" onClick={onOpenChat}>
                <MiniOrb size={22} />
                <span>Chat with AI for deeper insights</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
        </div>
    );
};

export { FullscreenAIChat, AIInsightsDashboard };
export default FullscreenAIChat;