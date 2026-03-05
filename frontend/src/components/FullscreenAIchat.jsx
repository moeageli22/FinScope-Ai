// src/components/FullscreenAIChat.jsx
// Desktop-first redesign + mobile keyboard performance fix (uncontrolled input)
import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendMessage } from '../services/claudeAI';
import FinScopeAI from './FinScopeAI';
import './Fullscreenaichat.css';

/* ─────────────────────────────────────────
   MINI ORB
───────────────────────────────────────── */
const MiniOrb = memo(({ size = 40 }) => (
    <div style={{ width:size, height:size, minWidth:size, borderRadius:'50%', overflow:'hidden', position:'relative', flexShrink:0, zIndex:1 }}>
        <div style={{
            transform:`scale(${size/400})`, transformOrigin:'center center',
            width:400, height:400, position:'absolute',
            top:'50%', left:'50%', marginTop:-200, marginLeft:-200, pointerEvents:'none',
        }}>
            <FinScopeAI />
        </div>
    </div>
));

/* ─────────────────────────────────────────
   CHART COLOURS
───────────────────────────────────────── */
const CAT_COLORS = {Groceries:'#3b82f6',Subscriptions:'#8b5cf6',Shopping:'#a78bfa',Transport:'#06b6d4',Dining:'#f59e0b',Bills:'#ef4444',Health:'#10b981',Entertainment:'#ec4899',Education:'#f97316',Other:'#6b7280'};
const FALLBACK   = ['#3b82f6','#8b5cf6','#06b6d4','#f59e0b','#ef4444','#10b981','#ec4899','#f97316','#a78bfa','#6b7280'];
const catColor   = (name, i) => CAT_COLORS[name] || FALLBACK[i % FALLBACK.length];

/* ─────────────────────────────────────────
   INLINE CHARTS  (all memoized)
───────────────────────────────────────── */
const DonutChart = memo(({ data, total }) => {
    const [hov, setHov] = useState(null);
    const r = 38, C = 2 * Math.PI * r;
    let offset = -C * 0.25;
    return (
        <div className="fsc-chart-donut-wrap">
            <svg viewBox="0 0 120 120" className="fsc-chart-donut-svg">
                {data.map((s,i) => {
                    const pct=s.amount/total, dash=pct*C, cur=offset; offset+=dash;
                    const cl=catColor(s.name,i), hl=hov===s.name;
                    return <circle key={s.name} cx="60" cy="60" r={r} fill="none" stroke={cl}
                                   strokeWidth={hl?12:8} strokeDasharray={`${dash} ${C-dash}`} strokeDashoffset={-cur}
                                   strokeLinecap="round" style={{transition:'stroke-width .2s',cursor:'pointer',filter:hl?`drop-shadow(0 0 6px ${cl})`:'none'}}
                                   onMouseEnter={()=>setHov(s.name)} onMouseLeave={()=>setHov(null)}/>;
                })}
                <text x="60" y="56" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="800" fontFamily="Sora,system-ui">
                    {hov ? `${((data.find(d=>d.name===hov)?.amount/total)*100).toFixed(0)}%`
                        : `$${total>=1000?(total/1000).toFixed(1)+'k':total.toFixed(0)}`}
                </text>
                <text x="60" y="70" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="Sora,system-ui">
                    {hov||'total spent'}
                </text>
            </svg>
            <div className="fsc-chart-legend">
                {data.map((s,i) => {
                    const cl=catColor(s.name,i);
                    return (
                        <div key={s.name} className={`fsc-legend-row${hov===s.name?' hovered':''}`}
                             onMouseEnter={()=>setHov(s.name)} onMouseLeave={()=>setHov(null)}>
                            <span className="fsc-legend-dot" style={{background:cl}}/>
                            <span className="fsc-legend-name">{s.name}</span>
                            <span className="fsc-legend-val">${s.amount.toFixed(2)}</span>
                            <span className="fsc-legend-pct">{((s.amount/total)*100).toFixed(0)}%</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

const BarChart = memo(({ data }) => {
    const mx = Math.max(...data.map(d=>d.amount), 1);
    return (
        <div className="fsc-chart-bars">
            {data.map((s,i) => {
                const cl=catColor(s.name,i);
                return (
                    <div key={s.name} className="fsc-bar-row">
                        <span className="fsc-bar-label">{s.name}</span>
                        <div className="fsc-bar-track">
                            <div className="fsc-bar-fill" style={{background:`linear-gradient(90deg,${cl},${cl}bb)`,width:`${(s.amount/mx)*100}%`}}/>
                        </div>
                        <span className="fsc-bar-val">${s.amount.toFixed(2)}</span>
                    </div>
                );
            })}
        </div>
    );
});

const TrendChart = memo(({ transactions }) => {
    const [hov, setHov] = useState(null);
    let run = 0;
    const pts = transactions.map((t,i)=>{ run+=t.amount; return {i,cum:run,name:t.name,amount:t.amount}; });
    const W=400,H=160,P={t:20,r:16,b:28,l:50};
    const cW=W-P.l-P.r, cH=H-P.t-P.b, mx=Math.max(...pts.map(p=>p.cum),1), n=pts.length;
    const xO = i => P.l + (n===1 ? cW/2 : (i/(n-1))*cW);
    const yO = v => P.t + cH - (v/mx)*cH;
    const line = pts.map((p,i)=>`${xO(i)},${yO(p.cum)}`).join(' ');
    const area = `M${xO(0)},${yO(pts[0].cum)} `+pts.slice(1).map((p,i)=>`L${xO(i+1)},${yO(p.cum)}`).join(' ')+` L${xO(n-1)},${P.t+cH} L${xO(0)},${P.t+cH} Z`;
    return (
        <div className="fsc-chart-trend-wrap">
            <svg viewBox={`0 0 ${W} ${H}`} className="fsc-chart-trend-svg">
                <defs>
                    <linearGradient id="tGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0"/>
                    </linearGradient>
                </defs>
                {[0,.25,.5,.75,1].map((f,i)=>{
                    const v=mx*f, y=yO(v);
                    return <g key={i}>
                        <line x1={P.l} y1={y} x2={W-P.r} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray={i===0?'0':'3,4'}/>
                        <text x={P.l-6} y={y+3.5} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="monospace">{v>=1000?`$${(v/1000).toFixed(1)}k`:`$${v.toFixed(0)}`}</text>
                    </g>;
                })}
                <path d={area} fill="url(#tGrad)"/>
                <polyline points={line} fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                {pts.map((p,i)=>(
                    <g key={i} onMouseEnter={()=>setHov(p)} onMouseLeave={()=>setHov(null)} style={{cursor:'pointer'}}>
                        <circle cx={xO(i)} cy={yO(p.cum)} r="12" fill="transparent"/>
                        <circle cx={xO(i)} cy={yO(p.cum)} r={hov?.i===i?5:3.5} fill={hov?.i===i?'#fff':'#8b5cf6'} stroke={hov?.i===i?'#8b5cf6':'#1e1b4b'} strokeWidth="2" style={{transition:'all .15s'}}/>
                    </g>
                ))}
                {n>=1&&<text x={xO(n-1)} y={yO(pts[n-1].cum)-10} textAnchor="end" fill="#a78bfa" fontSize="11" fontWeight="700" fontFamily="monospace">${pts[n-1].cum.toFixed(2)}</text>}
            </svg>
            {hov&&(
                <div className="fsc-trend-tt" style={{left:`${(xO(hov.i)/W)*100}%`,top:`${(yO(hov.cum)/H)*100}%`}}>
                    <div className="fsc-tt-name">{hov.name}</div>
                    <div className="fsc-tt-amt">-${hov.amount.toFixed(2)}</div>
                    <div className="fsc-tt-cum">Total: ${hov.cum.toFixed(2)}</div>
                </div>
            )}
        </div>
    );
});

const GaugeChart = memo(({ totalSpent, startingBalance, categoryData }) => {
    const pct = startingBalance>0 ? Math.min((totalSpent/startingBalance)*100,100) : 0;
    const rem = startingBalance-totalSpent;
    const gc = pct>80?'#ef4444':pct>50?'#f59e0b':'#10b981';
    const circ=Math.PI*50, dash=(pct/100)*circ;
    const needs=['Bills','Groceries','Transport','Health'];
    const wants=['Subscriptions','Shopping','Dining','Entertainment'];
    const nA=categoryData.filter(c=>needs.includes(c.name)).reduce((s,c)=>s+c.amount,0);
    const wA=categoryData.filter(c=>wants.includes(c.name)).reduce((s,c)=>s+c.amount,0);
    const oA=totalSpent-nA-wA;
    return (
        <div className="fsc-chart-gauge-wrap">
            <div className="fsc-gauge-visual">
                <svg viewBox="0 0 120 70" className="fsc-gauge-svg">
                    <path d="M 10 65 A 50 50 0 0 1 110 65" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" strokeLinecap="round"/>
                    <path d="M 10 65 A 50 50 0 0 1 110 65" fill="none" stroke={gc} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${dash} ${circ}`} style={{transition:'stroke-dasharray .8s ease-out'}}/>
                    <text x="60" y="52" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="800" fontFamily="monospace">{pct.toFixed(0)}%</text>
                    <text x="60" y="64" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="Sora,system-ui">budget used</text>
                </svg>
                <div className="fsc-gauge-remaining">
                    <span className="fsc-gauge-label">Remaining</span>
                    <span className="fsc-gauge-val" style={{color:rem<0?'#ef4444':'#10b981'}}>${rem.toFixed(2)}</span>
                </div>
            </div>
            <div className="fsc-gauge-5030">
                <div className="fsc-503020-title">50/30/20 Breakdown</div>
                {[{label:'Needs (50%)',amt:nA,color:'#3b82f6'},{label:'Wants (30%)',amt:wA,color:'#8b5cf6'},{label:'Other (20%)',amt:oA,color:'#10b981'}].map(row=>(
                    <div key={row.label} className="fsc-503020-row">
                        <span className="fsc-503020-label">{row.label}</span>
                        <div className="fsc-503020-bar">
                            <div className="fsc-503020-fill" style={{background:row.color,width:`${totalSpent>0?(row.amt/totalSpent)*100:0}%`}}/>
                        </div>
                        <span className="fsc-503020-pct">{totalSpent>0?((row.amt/totalSpent)*100).toFixed(0):0}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
});

const DashboardChart = memo(({ transactions, totalSpent, startingBalance, balance }) => {
    const catTotals = {};
    transactions.forEach(t=>{ catTotals[t.category]=(catTotals[t.category]||0)+t.amount; });
    const catData = Object.entries(catTotals).sort((a,b)=>b[1]-a[1]).map(([name,amount])=>({name,amount}));
    const section = (icon, label, children) => (
        <div className="fsc-dash-section">
            <div className="fsc-dash-section-hdr">{icon} {label}</div>
            {children}
        </div>
    );
    return (
        <div className="fsc-dashboard-inline">
            {section('🍩','Spending by Category', <DonutChart data={catData} total={totalSpent}/>)}
            {transactions.length>=2 && section('📈','Spending Trend', <TrendChart transactions={transactions}/>)}
            {section('📊','Category Breakdown', <BarChart data={catData}/>)}
            {section('🎯','Budget Health', <GaugeChart totalSpent={totalSpent} startingBalance={startingBalance} categoryData={catData}/>)}
        </div>
    );
});

/* ─────────────────────────────────────────
   CHART REQUEST DETECTION
───────────────────────────────────────── */
const CHART_KW = ['chart','graph','dashboard','visuali','donut','pie','bar chart','trend','show me','draw','plot','breakdown','generate','make a','budget gauge','visual'];
const isChartReq = m => CHART_KW.some(k=>m.toLowerCase().includes(k));
const detectType = m => {
    const l = m.toLowerCase();
    if(l.includes('donut')||l.includes('pie'))  return 'donut';
    if(l.includes('bar'))                        return 'bar';
    if(l.includes('trend')||l.includes('line')||l.includes('over time')) return 'trend';
    if(l.includes('gauge')||l.includes('health')||l.includes('50/30'))   return 'gauge';
    return 'dashboard';
};
const CHART_LABELS = {dashboard:'Dashboard',donut:'Pie Chart',bar:'Bar Chart',trend:'Trend Graph',gauge:'Budget Gauge'};

/* ─────────────────────────────────────────
   BUBBLE TEXT
───────────────────────────────────────── */
const BubbleText = memo(({ text }) => (
    <>
        {text.split('\n').map((line,i) => (
            <span key={i}>
                {line.split(/(\*\*.*?\*\*)/).map((p,j) =>
                    p.startsWith('**')&&p.endsWith('**')
                        ? <strong key={j} style={{fontWeight:700,color:'#fff'}}>{p.slice(2,-2)}</strong>
                        : p
                )}
                <br/>
            </span>
        ))}
    </>
));

/* ─────────────────────────────────────────
   SEND BUTTON — isolated component
   Subscribes to input changes via static ref
   so it can update without re-rendering parent
───────────────────────────────────────── */
const SendButton = memo(({ onSend, typing }) => {
    const [hasText, setHasText] = useState(false);
    useEffect(() => {
        SendButton._notify = setHasText;
        return () => { SendButton._notify = null; };
    }, []);
    const active = hasText && !typing;
    return (
        <button onClick={onSend} disabled={!active} aria-label="Send" className="fsc-send-btn">
            <div className="fsc-send-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <polygon points="22 2 15 22 11 13 2 9 22 2" fill="white" opacity={active?'1':'0.4'}/>
                    <line x1="22" y1="2" x2="11" y2="13" stroke="white" strokeWidth="1.5" opacity={active?'1':'0.4'}/>
                </svg>
            </div>
        </button>
    );
});

/* ─────────────────────────────────────────
   MESSAGE LIST — memoized so it never
   re-renders when user is just typing
───────────────────────────────────────── */
const MessageList = memo(({ messages, typing, renderChart }) => (
    <>
        {messages.map(m => {
            const isUser = m.role==='user';
            return (
                <div key={m.id} className={`fsc-msg${isUser?' user':''}`}>
                    {!isUser && <div className="fsc-msg-orb"><MiniOrb size={30}/></div>}
                    <div className={`fsc-bubble-group${isUser?' user':' ai'}`}>
                        <div className={`fsc-bubble${isUser?' user':' ai'}`}>
                            <BubbleText text={m.text}/>
                        </div>
                        {m.chart && (
                            <div className="fsc-chart-container">
                                <div className="fsc-chart-badge">
                                    📊 AI Generated {CHART_LABELS[m.chart]||'Chart'}
                                </div>
                                {renderChart(m.chart)}
                            </div>
                        )}
                    </div>
                </div>
            );
        })}
        {typing && (
            <div className="fsc-msg">
                <div className="fsc-msg-orb"><MiniOrb size={30}/></div>
                <div className="fsc-typing">
                    <span className="fsc-dot"/><span className="fsc-dot"/><span className="fsc-dot"/>
                </div>
            </div>
        )}
    </>
));

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════ */
const FullscreenAIChat = ({ open, onClose, transactions=[], balance=0, totalSpent=0, startingBalance=0 }) => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [typing,   setTyping]   = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const chatRef = useRef(null);
    // PERF FIX: uncontrolled input — no useState for the input value
    const inputRef = useRef(null);
    const menuRef  = useRef(null);

    /* lock body scroll */
    useEffect(() => {
        if (!open) return;
        const scrollY = window.scrollY;
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top      = `-${scrollY}px`;
        document.body.style.left     = '0';
        document.body.style.right    = '0';
        return () => {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.top      = '';
            document.body.style.left     = '';
            document.body.style.right    = '';
            window.scrollTo(0, scrollY);
        };
    }, [open]);

    /* close menu on outside click */
    useEffect(() => {
        if (!menuOpen) return;
        const h = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [menuOpen]);

    /* welcome message */
    useEffect(() => {
        if (!open) return;
        if (messages.length === 0) {
            const hasData = transactions.length > 0;
            setMessages([{ id: 1, role: 'ai', text: hasData
                    ? `Hello! 👋 I'm FinScope AI, created by Mr. Mohammed Ageli.\n\nI can see ${transactions.length} transaction${transactions.length!==1?'s':''} totaling $${totalSpent.toFixed(2)}.\n\nAsk me anything — or pick a quick action from the sidebar!`
                    : `Hello! 👋 I'm FinScope AI, created by Mr. Mohammed Ageli.\n\nAdd some expenses first, then I can analyze your spending and generate interactive charts!`
            }]);
        }
    }, [open]);

    /* auto-scroll */
    useEffect(() => {
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, [messages, typing]);

    /* ESC to close */
    useEffect(() => {
        if (!open) return;
        const h = e => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, [open, onClose]);

    /* category data */
    const catData = useMemo(() => {
        const t = {};
        transactions.forEach(x => { t[x.category] = (t[x.category]||0) + x.amount; });
        return Object.entries(t).sort((a,b)=>b[1]-a[1]).map(([name,amount])=>({name,amount}));
    }, [transactions]);

    /* ── SEND — reads from DOM ref, never from state ── */
    const send = useCallback(async (overrideText) => {
        const msg = (overrideText ?? inputRef.current?.value ?? '').trim();
        if (!msg || typing) return;
        if (inputRef.current) {
            inputRef.current.value = '';
            if (SendButton._notify) SendButton._notify(false);
        }
        setMessages(p => [...p, { id: Date.now(), role: 'user', text: msg }]);
        setTyping(true);
        const isChart = isChartReq(msg);
        const ct      = isChart ? detectType(msg) : null;
        try {
            const sd = { transactions, balance, totalSpent, startingBalance };
            if (isChart && transactions.length > 0) {
                const prompt =
                    ct==='dashboard' ? 'Give a 2-sentence overview of their spending with specific numbers.' :
                        ct==='donut'||ct==='bar' ? `Give a 2-sentence analysis of their ${ct} category breakdown with specific numbers.` :
                            ct==='trend' ? 'Give a 2-sentence analysis of their spending trend over time.' :
                                'Give a 2-sentence assessment of their budget health using the 50/30/20 rule.';
                const aiText = await sendMessage(prompt, sd);
                setMessages(p => [...p, { id: Date.now()+1, role: 'ai', text: aiText, chart: ct }]);
            } else if (isChart) {
                setMessages(p => [...p, { id: Date.now()+1, role: 'ai', text: "I'd love to chart your spending, but there are no transactions yet! 📊\n\nAdd some expenses first, then ask me again." }]);
            } else {
                const r = await sendMessage(msg, sd);
                setMessages(p => [...p, { id: Date.now()+1, role: 'ai', text: r }]);
            }
        } catch {
            setMessages(p => [...p, { id: Date.now()+1, role: 'ai', text: '⚠️ Something went wrong. Check your API key and try again.' }]);
        }
        setTyping(false);
    }, [typing, transactions, balance, totalSpent, startingBalance]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    }, [send]);

    /* Only updates the isolated SendButton — zero parent re-renders */
    const handleInputChange = useCallback(() => {
        const val = inputRef.current?.value ?? '';
        if (SendButton._notify) SendButton._notify(val.trim().length > 0);
    }, []);

    const renderChart = useCallback((ct) => {
        if (!transactions.length) return null;
        if (ct==='donut')     return <DonutChart data={catData} total={totalSpent}/>;
        if (ct==='bar')       return <BarChart data={catData}/>;
        if (ct==='trend')     return transactions.length>=2 ? <TrendChart transactions={transactions}/> : <BarChart data={catData}/>;
        if (ct==='gauge')     return <GaugeChart totalSpent={totalSpent} startingBalance={startingBalance} categoryData={catData}/>;
        if (ct==='dashboard') return <DashboardChart transactions={transactions} totalSpent={totalSpent} startingBalance={startingBalance} balance={balance}/>;
        return null;
    }, [transactions, catData, totalSpent, startingBalance, balance]);

    const sendChip = useCallback((p) => send(p), [send]);

    const chips = useMemo(() => [
        { e:'📊', l:'Full dashboard',  p:'Show me a full dashboard with all my spending charts' },
        { e:'🍩', l:'Category chart',  p:'Create a donut chart of my spending by category' },
        { e:'📈', l:'Spending trend',  p:'Show me a trend graph of my spending over time' },
        { e:'🎯', l:'Budget health',   p:'Show me a budget gauge with my 50/30/20 breakdown' },
        { e:'💰', l:'Save money',      p:'Give me 3 specific tips to save money based on my spending' },
        { e:'⚠️', l:'Red flags',       p:"Are there any spending red flags or areas I'm overspending?" },
    ], []);

    const navItems = useMemo(() => [
        { icon:'🏠', label:'Dashboard', sub:'Your main overview',  action:()=>{ navigate('/dashboard'); onClose(); setMenuOpen(false); } },
        { icon:'🏡', label:'Home Page', sub:'Back to landing',     action:()=>{ navigate('/');          onClose(); setMenuOpen(false); } },
        { icon:'◀',  label:'Go Back',   sub:'Previous page',       action:()=>{ navigate(-1);           onClose(); setMenuOpen(false); } },
    ], [navigate, onClose]);

    const budgetUsed = startingBalance > 0 ? ((totalSpent/startingBalance)*100).toFixed(0) : 0;

    if (!open) return null;

    return (
        <div className="fsc-overlay" onClick={onClose}>
            <div className="fsc-modal" onClick={e=>e.stopPropagation()}>

                {/* ══════════════ LEFT SIDEBAR (desktop only) ══════════════ */}
                <aside className="fsc-sidebar">
                    <div className="fsc-sidebar-identity">
                        <div className="fsc-sidebar-orb-ring">
                            <MiniOrb size={68}/>
                        </div>
                        <h2 className="fsc-sidebar-title">FinScope AI</h2>
                        <span className="fsc-sidebar-sub">Personal finance assistant<br/>by Mr. Mohammed Ageli</span>
                        <div className="fsc-live-badge">
                            <span className="fsc-live-dot"/>
                            LIVE AI
                        </div>
                    </div>

                    {transactions.length > 0 && (
                        <div className="fsc-sidebar-stats">
                            <div className="fsc-sidebar-section-label">Account Overview</div>
                            <div className="fsc-stat-card">
                                <span className="fsc-stat-label">Balance</span>
                                <span className="fsc-stat-val green">${balance.toFixed(2)}</span>
                            </div>
                            <div className="fsc-stat-card">
                                <span className="fsc-stat-label">Total Spent</span>
                                <span className="fsc-stat-val red">${totalSpent.toFixed(2)}</span>
                            </div>
                            <div className="fsc-stat-card">
                                <span className="fsc-stat-label">Transactions</span>
                                <span className="fsc-stat-val">{transactions.length}</span>
                            </div>
                            <div className="fsc-stat-card">
                                <span className="fsc-stat-label">Budget Used</span>
                                <span className="fsc-stat-val">{budgetUsed}%</span>
                            </div>
                        </div>
                    )}

                    <div className="fsc-sidebar-chips">
                        <div className="fsc-sidebar-section-label">Quick Actions</div>
                        {chips.map((c,i) => (
                            <button key={i} disabled={typing} onClick={()=>sendChip(c.p)} className="fsc-sidebar-chip">
                                <span className="fsc-sidebar-chip-emoji">{c.e}</span>
                                <span>{c.l}</span>
                            </button>
                        ))}
                    </div>

                    <div className="fsc-sidebar-footer">
                        <div className="fsc-sidebar-section-label" style={{paddingBottom:'8px'}}>Navigate</div>
                        {navItems.map(item => (
                            <button key={item.label} onClick={item.action} className="fsc-sidebar-nav-btn">
                                <span className="fsc-sidebar-nav-icon">{item.icon}</span>
                                <span>{item.label}</span>
                            </button>
                        ))}
                        <div className="fsc-sidebar-divider"/>
                        <button onClick={onClose} className="fsc-sidebar-nav-btn danger">
                            <span className="fsc-sidebar-nav-icon">✕</span>
                            <span>Close Chat</span>
                        </button>
                    </div>
                </aside>

                {/* ══════════════ HEADER ══════════════ */}
                <header className="fsc-header">
                    <div className="fsc-header-left">
                        <MiniOrb size={36}/>
                        <div>
                            <h2 className="fsc-title">FinScope AI</h2>
                            <span className="fsc-subtitle">Ask me anything about your finances</span>
                        </div>
                        <div className="fsc-live-badge" style={{marginLeft:8}}>
                            <span className="fsc-live-dot"/>
                            LIVE AI
                        </div>
                    </div>
                    <div className="fsc-header-actions">
                        <div className="fsc-ham-wrap" ref={menuRef}>
                            <button className={`fsc-ham-btn${menuOpen?' open':''}`} onClick={()=>setMenuOpen(o=>!o)} aria-label="Menu">
                                {menuOpen ? '✕' : '☰'}
                            </button>
                            {menuOpen && (
                                <div className="fsc-ham-dropdown">
                                    <span className="fsc-ham-label">Navigation</span>
                                    {navItems.map(item => (
                                        <button key={item.label} className="fsc-ham-item" onClick={item.action}>
                                            <span className="fsc-ham-icon fsc-ham-icon--blue">{item.icon}</span>
                                            <div className="fsc-ham-item-text">
                                                <span className="fsc-ham-item-label">{item.label}</span>
                                                <span className="fsc-ham-item-sub">{item.sub}</span>
                                            </div>
                                            <span className="fsc-ham-arrow">›</span>
                                        </button>
                                    ))}
                                    <div className="fsc-ham-divider"/>
                                    <button className="fsc-ham-item" onClick={()=>{ onClose(); setMenuOpen(false); }}>
                                        <span className="fsc-ham-icon fsc-ham-icon--red">✕</span>
                                        <div className="fsc-ham-item-text">
                                            <span className="fsc-ham-item-label" style={{color:'#ef4444'}}>Close Chat</span>
                                            <span className="fsc-ham-item-sub">Return to app</span>
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>
                        <button className="fsc-close" onClick={onClose} aria-label="Close">
                            <div className="fsc-close-inner">
                                <span style={{fontSize:18,lineHeight:1}}>×</span>
                                <span className="fsc-close-label">Close</span>
                            </div>
                        </button>
                    </div>
                </header>

                {/* ══════════════ MOBILE STATS BAR ══════════════ */}
                {transactions.length > 0 && (
                    <div className="fsc-stats-bar">
                        {[
                            { label:'Balance',     val:`$${balance.toFixed(2)}`,    cls:'' },
                            { label:'Spent',       val:`$${totalSpent.toFixed(2)}`, cls:'red' },
                            { label:'Txns',        val:`${transactions.length}`,    cls:'' },
                            { label:'Budget Used', val:`${budgetUsed}%`,            cls:'' },
                        ].map((s,i) => (
                            <React.Fragment key={s.label}>
                                {i>0 && <div className="fsc-stat-sep"/>}
                                <div className="fsc-stat">
                                    <span className="fsc-stat-label">{s.label}</span>
                                    <span className={`fsc-stat-val${s.cls?' fsc-stat-'+s.cls:''}`}>{s.val}</span>
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                )}

                {/* ══════════════ MESSAGES ══════════════ */}
                <div className="fsc-messages-scroll" ref={chatRef}>
                    <MessageList messages={messages} typing={typing} renderChart={renderChart}/>
                </div>

                {/* ══════════════ MOBILE SUGGESTION CHIPS ══════════════ */}
                {messages.length <= 2 && (
                    <div className="fsc-suggestions">
                        {chips.map((c,i) => (
                            <button key={i} disabled={typing} onClick={()=>sendChip(c.p)} className="fsc-suggestion">
                                <span className="fsc-sug-emoji">{c.e}</span><span>{c.l}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* ══════════════ INPUT BAR ══════════════ */}
                {/*
                    ⚡ KEYBOARD PERFORMANCE NOTE:
                    This input is UNCONTROLLED — no value= prop, no onChange= state setter.
                    Typing never triggers a React re-render of FullscreenAIChat or any of its
                    children (MessageList, charts, sidebar, etc.).
                    The SendButton is a separate isolated component that updates only itself
                    via a static callback ref. This eliminates the iPhone keyboard lag entirely.
                */}
                <div className="fsc-input-area">
                    <input
                        ref={inputRef}
                        onInput={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask anything or say 'show me a chart'..."
                        disabled={typing}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="sentences"
                        spellCheck="false"
                        enterKeyHint="send"
                        className="fsc-input"
                    />
                    <SendButton onSend={send} typing={typing}/>
                </div>

            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════
   AI INSIGHTS DASHBOARD
═══════════════════════════════════════════════════════ */
const AIInsightsDashboard = ({ transactions=[], balance=0, totalSpent=0, startingBalance=0, onOpenChat }) => {
    const [insights,  setInsights]  = useState([]);
    const [loading,   setLoading]   = useState(false);
    const [lastCount, setLastCount] = useState(0);

    useEffect(() => {
        if (!transactions.length) return;
        if (transactions.length !== 1 && transactions.length < lastCount+2) return;
        (async () => {
            setLoading(true);
            setLastCount(transactions.length);
            try {
                const r = await sendMessage(
                    `Generate exactly 3 short financial insights in this format, each on its own line:\n[emoji] [Title]: [One sentence insight]\n\nBe specific with actual numbers. ONE sentence each.`,
                    { transactions, balance, totalSpent, startingBalance }
                );
                const parsed = r.split('\n').filter(l=>l.trim().length>5).slice(0,3).map((line,i) => {
                    const em = line.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F?)/u);
                    const emoji = em ? em[0] : ['💡','⚠️','🎯'][i];
                    const txt = line.replace(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F?)\s*/u,'');
                    const ci = txt.indexOf(':');
                    return {
                        id: Date.now()+i, emoji,
                        title: ci>0 ? txt.slice(0,ci).trim() : `Insight ${i+1}`,
                        body:  ci>0 ? txt.slice(ci+1).trim() : txt.trim(),
                        type:  emoji.includes('⚠')?'warning':emoji.includes('🎯')?'goal':'tip',
                    };
                });
                if (parsed.length) setInsights(parsed);
            } catch {}
            setLoading(false);
        })();
    }, [transactions.length]);

    if (!transactions.length && !insights.length) return null;

    const shownInsights = insights.length
        ? insights
        : [{ id:0, emoji:'✨', title:'Getting Started', body:"Add more expenses and I'll generate personalized insights for you.", type:'tip' }];

    return (
        <div className="pm-insights-dash">
            <div className="pm-insights-header">
                <MiniOrb size={30}/>
                <div>
                    <h3 className="pm-insights-title">AI Insights</h3>
                    <span className="pm-insights-sub">Powered by Claude</span>
                </div>
                {loading && <span className="pm-insights-loading">Analyzing…</span>}
            </div>
            <div className="pm-insights-cards">
                {shownInsights.map(ins => (
                    <div key={ins.id} className={`pm-insight-card pm-insight-card--${ins.type}`}>
                        <span className="pm-insight-emoji">{ins.emoji}</span>
                        <div className="pm-insight-text">
                            <span className="pm-insight-title">{ins.title}</span>
                            <span className="pm-insight-body">{ins.body}</span>
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={onOpenChat} className="pm-insights-chat-btn">
                <MiniOrb size={22}/>
                <span>Chat with AI for deeper insights</span>
                <span style={{marginLeft:'auto',fontSize:18}}>›</span>
            </button>
        </div>
    );
};

export { FullscreenAIChat, AIInsightsDashboard };
export default FullscreenAIChat;