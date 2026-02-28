// src/components/FullscreenAIChat.jsx
// Full rewrite — inline styles only, no CSS file dependency
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendMessage } from '../services/claudeAI';
import FinScopeAI from './FinScopeAI';

/* ─────────────────────────────────────────
   MINI ORB  (scales FinScopeAI to any size)
───────────────────────────────────────── */
const MiniOrb = ({ size = 40 }) => (
    <div style={{ width:size, height:size, minWidth:size, borderRadius:'50%', overflow:'hidden', position:'relative', flexShrink:0 }}>
        <div style={{
            transform:`scale(${size/400})`, transformOrigin:'center center',
            width:400, height:400, position:'absolute',
            top:'50%', left:'50%', marginTop:-200, marginLeft:-200, pointerEvents:'none',
        }}>
            <FinScopeAI />
        </div>
    </div>
);

/* ─────────────────────────────────────────
   CHART COLOURS
───────────────────────────────────────── */
const CAT_COLORS = {Groceries:'#3b82f6',Subscriptions:'#8b5cf6',Shopping:'#a78bfa',Transport:'#06b6d4',Dining:'#f59e0b',Bills:'#ef4444',Health:'#10b981',Entertainment:'#ec4899',Education:'#f97316',Other:'#6b7280'};
const FALLBACK   = ['#3b82f6','#8b5cf6','#06b6d4','#f59e0b','#ef4444','#10b981','#ec4899','#f97316','#a78bfa','#6b7280'];
const catColor   = (name, i) => CAT_COLORS[name] || FALLBACK[i % FALLBACK.length];

/* ─────────────────────────────────────────
   INLINE CHARTS
───────────────────────────────────────── */
const DonutChart = ({ data, total }) => {
    const [hov, setHov] = useState(null);
    const r = 38, C = 2 * Math.PI * r;
    let offset = -C * 0.25;
    return (
        <div style={{display:'flex',gap:16,padding:16,alignItems:'center',flexWrap:'wrap'}}>
            <svg viewBox="0 0 120 120" style={{width:120,height:120,flexShrink:0}}>
                {data.map((s,i) => {
                    const pct=s.amount/total, dash=pct*C, cur=offset; offset+=dash;
                    const cl=catColor(s.name,i), hl=hov===s.name;
                    return <circle key={s.name} cx="60" cy="60" r={r} fill="none" stroke={cl}
                                   strokeWidth={hl?12:8} strokeDasharray={`${dash} ${C-dash}`} strokeDashoffset={-cur}
                                   strokeLinecap="round" style={{transition:'stroke-width .2s',cursor:'pointer',filter:hl?`drop-shadow(0 0 6px ${cl})`:'none'}}
                                   onMouseEnter={()=>setHov(s.name)} onMouseLeave={()=>setHov(null)}/>;
                })}
                <text x="60" y="56" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="800" fontFamily="system-ui">
                    {hov ? `${((data.find(d=>d.name===hov)?.amount/total)*100).toFixed(0)}%`
                        : `$${total>=1000?(total/1000).toFixed(1)+'k':total.toFixed(0)}`}
                </text>
                <text x="60" y="70" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="system-ui">
                    {hov||'total spent'}
                </text>
            </svg>
            <div style={{flex:1,display:'flex',flexDirection:'column',gap:6,minWidth:130}}>
                {data.map((s,i) => {
                    const cl=catColor(s.name,i);
                    return (
                        <div key={s.name} style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',padding:'3px 6px',borderRadius:8,background:hov===s.name?'rgba(255,255,255,0.06)':'transparent'}}
                             onMouseEnter={()=>setHov(s.name)} onMouseLeave={()=>setHov(null)}>
                            <span style={{width:8,height:8,borderRadius:'50%',background:cl,flexShrink:0}}/>
                            <span style={{fontSize:12,fontWeight:600,color:'rgba(255,255,255,0.7)',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontFamily:'system-ui'}}>{s.name}</span>
                            <span style={{fontSize:12,fontWeight:700,color:'#fff',fontFamily:'system-ui'}}>${s.amount.toFixed(2)}</span>
                            <span style={{fontSize:10,color:'rgba(255,255,255,0.35)',width:28,textAlign:'right',fontFamily:'system-ui'}}>{((s.amount/total)*100).toFixed(0)}%</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const BarChart = ({ data }) => {
    const mx = Math.max(...data.map(d=>d.amount), 1);
    return (
        <div style={{display:'flex',flexDirection:'column',gap:8,padding:14}}>
            {data.map((s,i) => {
                const cl=catColor(s.name,i);
                return (
                    <div key={s.name} style={{display:'flex',alignItems:'center',gap:10}}>
                        <span style={{fontSize:11,fontWeight:600,color:'rgba(255,255,255,0.55)',width:80,flexShrink:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontFamily:'system-ui'}}>{s.name}</span>
                        <div style={{flex:1,height:8,background:'rgba(255,255,255,0.06)',borderRadius:8,overflow:'hidden'}}>
                            <div style={{height:'100%',borderRadius:8,background:`linear-gradient(90deg,${cl},${cl}bb)`,width:`${(s.amount/mx)*100}%`,transition:'width .6s'}}/>
                        </div>
                        <span style={{fontSize:12,fontWeight:700,color:'rgba(255,255,255,0.75)',width:58,textAlign:'right',flexShrink:0,fontFamily:'system-ui'}}>${s.amount.toFixed(2)}</span>
                    </div>
                );
            })}
        </div>
    );
};

const TrendChart = ({ transactions }) => {
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
        <div style={{padding:'14px 10px 10px',position:'relative'}}>
            <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',display:'block'}}>
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
                        <text x={P.l-6} y={y+3.5} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="system-ui">{v>=1000?`$${(v/1000).toFixed(1)}k`:`$${v.toFixed(0)}`}</text>
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
                {n>=1&&<text x={xO(n-1)} y={yO(pts[n-1].cum)-10} textAnchor="end" fill="#a78bfa" fontSize="11" fontWeight="700" fontFamily="system-ui">${pts[n-1].cum.toFixed(2)}</text>}
            </svg>
            {hov&&(
                <div style={{position:'absolute',left:`${(xO(hov.i)/W)*100}%`,top:`${(yO(hov.cum)/H)*100}%`,transform:'translate(-50%,-110%)',background:'rgba(8,10,30,0.95)',border:'1px solid rgba(139,92,246,0.35)',borderRadius:10,padding:'8px 12px',pointerEvents:'none',minWidth:110,zIndex:5}}>
                    <div style={{fontSize:11,fontWeight:700,color:'#fff',marginBottom:3,fontFamily:'system-ui'}}>{hov.name}</div>
                    <div style={{fontSize:12,fontWeight:700,color:'#ef4444',fontFamily:'system-ui'}}>-${hov.amount.toFixed(2)}</div>
                    <div style={{fontSize:11,color:'rgba(255,255,255,0.5)',fontFamily:'system-ui'}}>Total: ${hov.cum.toFixed(2)}</div>
                </div>
            )}
        </div>
    );
};

const GaugeChart = ({ totalSpent, startingBalance, categoryData }) => {
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
        <div style={{display:'flex',gap:16,padding:14,flexWrap:'wrap'}}>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
                <svg viewBox="0 0 120 70" style={{width:130,height:80}}>
                    <path d="M 10 65 A 50 50 0 0 1 110 65" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" strokeLinecap="round"/>
                    <path d="M 10 65 A 50 50 0 0 1 110 65" fill="none" stroke={gc} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${dash} ${circ}`} style={{transition:'stroke-dasharray .8s ease-out'}}/>
                    <text x="60" y="52" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="800" fontFamily="system-ui">{pct.toFixed(0)}%</text>
                    <text x="60" y="64" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="system-ui">budget used</text>
                </svg>
                <div style={{textAlign:'center'}}>
                    <span style={{fontSize:10,color:'rgba(255,255,255,0.35)',display:'block',fontFamily:'system-ui'}}>Remaining</span>
                    <span style={{fontSize:18,fontWeight:800,color:rem<0?'#ef4444':'#10b981',display:'block',fontFamily:'system-ui'}}>${rem.toFixed(2)}</span>
                </div>
            </div>
            <div style={{flex:1,minWidth:140,display:'flex',flexDirection:'column',gap:8}}>
                <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.35)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:4,fontFamily:'system-ui'}}>50/30/20 Breakdown</div>
                {[{label:'Needs (50%)',amt:nA,color:'#3b82f6'},{label:'Wants (30%)',amt:wA,color:'#8b5cf6'},{label:'Other (20%)',amt:oA,color:'#10b981'}].map(row=>(
                    <div key={row.label} style={{display:'flex',alignItems:'center',gap:8}}>
                        <span style={{fontSize:11,fontWeight:600,color:'rgba(255,255,255,0.55)',width:90,flexShrink:0,fontFamily:'system-ui'}}>{row.label}</span>
                        <div style={{flex:1,height:6,background:'rgba(255,255,255,0.06)',borderRadius:6,overflow:'hidden'}}>
                            <div style={{height:'100%',borderRadius:6,background:row.color,width:`${totalSpent>0?(row.amt/totalSpent)*100:0}%`,transition:'width .6s'}}/>
                        </div>
                        <span style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.5)',width:28,textAlign:'right',fontFamily:'system-ui'}}>{totalSpent>0?((row.amt/totalSpent)*100).toFixed(0):0}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const DashboardChart = ({ transactions, totalSpent, startingBalance, balance }) => {
    const catTotals = {};
    transactions.forEach(t=>{ catTotals[t.category]=(catTotals[t.category]||0)+t.amount; });
    const catData = Object.entries(catTotals).sort((a,b)=>b[1]-a[1]).map(([name,amount])=>({name,amount}));
    const section = (icon, label, children) => (
        <div style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
            <div style={{display:'flex',alignItems:'center',gap:8,padding:'12px 14px 4px',fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.45)',textTransform:'uppercase',letterSpacing:'0.07em',fontFamily:'system-ui'}}>
                {icon} {label}
            </div>
            {children}
        </div>
    );
    return (
        <div>
            {section('🍩','Spending by Category', <DonutChart data={catData} total={totalSpent}/>)}
            {transactions.length>=2 && section('📈','Spending Trend', <TrendChart transactions={transactions}/>)}
            {section('📊','Category Breakdown', <BarChart data={catData}/>)}
            {section('🎯','Budget Health', <GaugeChart totalSpent={totalSpent} startingBalance={startingBalance} categoryData={catData}/>)}
        </div>
    );
};

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
   BUBBLE TEXT  (bold + newlines)
───────────────────────────────────────── */
const BubbleText = ({ text }) => (
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
);

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════ */
const FullscreenAIChat = ({ open, onClose, transactions=[], balance=0, totalSpent=0, startingBalance=0 }) => {
    const navigate = useNavigate();
    const [messages,  setMessages]  = useState([]);
    const [input,     setInput]     = useState('');
    const [typing,    setTyping]    = useState(false);
    const [menuOpen,  setMenuOpen]  = useState(false);
    const chatRef  = useRef(null);
    const inputRef = useRef(null);
    const menuRef  = useRef(null);

    /* lock body scroll — preserves scroll position */
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
                    ? `Hey! 👋 I can see ${transactions.length} transaction${transactions.length!==1?'s':''} totaling $${totalSpent.toFixed(2)}.\n\nAsk me anything — or tap a suggestion below!\n• "Show me a dashboard"\n• "Create a spending chart"\n• "Give me savings tips"`
                    : `Hey! 👋 I'm your AI financial assistant.\n\nAdd some expenses first, then I can analyze your spending and generate interactive charts!`
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

    /* send */
    const send = useCallback(async (text) => {
        if (!text?.trim() || typing) return;
        const msg = text.trim();
        setInput('');
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

    const renderChart = ct => {
        if (!transactions.length) return null;
        if (ct==='donut')     return <DonutChart data={catData} total={totalSpent}/>;
        if (ct==='bar')       return <BarChart data={catData}/>;
        if (ct==='trend')     return transactions.length>=2 ? <TrendChart transactions={transactions}/> : <BarChart data={catData}/>;
        if (ct==='gauge')     return <GaugeChart totalSpent={totalSpent} startingBalance={startingBalance} categoryData={catData}/>;
        if (ct==='dashboard') return <DashboardChart transactions={transactions} totalSpent={totalSpent} startingBalance={startingBalance} balance={balance}/>;
        return null;
    };

    const chips = [
        { e:'📊', l:'Full dashboard',  p:'Show me a full dashboard with all my spending charts' },
        { e:'🍩', l:'Category chart',  p:'Create a donut chart of my spending by category' },
        { e:'📈', l:'Spending trend',  p:'Show me a trend graph of my spending over time' },
        { e:'🎯', l:'Budget health',   p:'Show me a budget gauge with my 50/30/20 breakdown' },
        { e:'💰', l:'Save money',      p:'Give me 3 specific tips to save money based on my spending' },
        { e:'⚠️', l:'Red flags',       p:"Are there any spending red flags or areas I'm overspending?" },
    ];

    const navItems = [
        { icon:'🏠', label:'Dashboard',  sub:'Your main overview',  action:()=>{ navigate('/dashboard'); onClose(); setMenuOpen(false); } },
        { icon:'🏡', label:'Home Page',  sub:'Back to landing',     action:()=>{ navigate('/');          onClose(); setMenuOpen(false); } },
        { icon:'◀',  label:'Go Back',    sub:'Previous page',       action:()=>{ navigate(-1);           onClose(); setMenuOpen(false); } },
    ];

    if (!open) return null;

    /* ── style tokens ── */
    const fnt = "'DM Sans','Inter',system-ui,sans-serif";

    return (
        <>
            {/* keyframes injected once */}
            <style>{`
        @keyframes fsc-up      { from{transform:translateY(50px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes fsc-pulse   { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes fsc-bounce  { 0%,60%,100%{transform:translateY(0);opacity:.4} 30%{transform:translateY(-6px);opacity:1} }
        @keyframes fsc-msg-in  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fsc-drop-in { from{opacity:0;transform:translateY(-8px) scale(.97)} to{opacity:1;transform:scale(1)} }
        .fsc-scrollbar::-webkit-scrollbar{width:4px}
        .fsc-scrollbar::-webkit-scrollbar-track{background:transparent}
        .fsc-scrollbar::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:4px}
        .fsc-hidden-scroll::-webkit-scrollbar{display:none}
      `}</style>

            {/* OVERLAY */}
            <div
                onClick={onClose}
                style={{
                    position:'fixed', inset:0, zIndex:99999,
                    background:'rgba(0,0,0,0.8)', backdropFilter:'blur(18px)',
                    display:'flex', alignItems:'flex-end', justifyContent:'center',
                    touchAction:'none', overscrollBehavior:'none',
                }}
            >
                {/* MODAL */}
                <div
                    onClick={e=>e.stopPropagation()}
                    style={{
                        width:'100%', maxWidth:720, height:'100dvh',
                        background:'linear-gradient(170deg,#08091e 0%,#0d1030 60%,#08091e 100%)',
                        display:'flex', flexDirection:'column', overflow:'hidden',
                        animation:'fsc-up .4s cubic-bezier(.22,1,.36,1)',
                        boxShadow:'0 -24px 80px rgba(0,0,0,0.6)',
                        borderTop:'1px solid rgba(99,102,241,0.2)',
                        touchAction:'auto', overscrollBehavior:'contain',
                    }}
                >

                    {/* ══════════════ HEADER ══════════════ */}
                    <div style={{
                        display:'flex', alignItems:'center', justifyContent:'space-between',
                        padding:'14px 16px', gap:12, flexShrink:0,
                        background:'rgba(4,6,20,0.98)',
                        borderBottom:'1px solid rgba(255,255,255,0.07)',
                    }}>

                        {/* LEFT: orb + title + live badge */}
                        <div style={{ display:'flex', alignItems:'center', gap:10, flex:1, minWidth:0 }}>
                            <MiniOrb size={42}/>
                            <div style={{ display:'flex', flexDirection:'column', minWidth:0 }}>
                                <h2 style={{ margin:0, fontSize:16, fontWeight:800, color:'#fff', letterSpacing:'-0.02em', lineHeight:1.1, fontFamily:fnt }}>FinScope AI</h2>
                                <span style={{ fontSize:11, color:'rgba(255,255,255,0.38)', fontFamily:fnt, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>Your personal finance assistant</span>
                            </div>
                            {/* LIVE badge — hidden on very small screens, but stays in flex flow */}
                            <span style={{ display:'inline-flex', alignItems:'center', gap:5, background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.35)', color:'#10b981', fontSize:9, fontWeight:800, letterSpacing:'0.1em', padding:'4px 8px', borderRadius:6, textTransform:'uppercase', flexShrink:0, fontFamily:fnt }}>
                <span style={{ width:5, height:5, borderRadius:'50%', background:'#10b981', animation:'fsc-pulse 1.6s ease-in-out infinite' }}/>
                LIVE AI
              </span>
                        </div>

                        {/* RIGHT: menu + close — never overlap each other */}
                        <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>

                            {/* ── MENU BUTTON ── */}
                            <div style={{ position:'relative' }} ref={menuRef}>
                                <button
                                    onClick={() => setMenuOpen(o=>!o)}
                                    aria-label="Menu"
                                    style={{
                                        width:42, height:42, borderRadius:12, border:'1.5px solid rgba(255,255,255,0.22)',
                                        background: menuOpen ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.08)',
                                        color:'#fff', fontSize:20, cursor:'pointer',
                                        display:'flex', alignItems:'center', justifyContent:'center',
                                        flexShrink:0, fontFamily:'system-ui', transition:'background .2s,border-color .2s',
                                    }}
                                >
                                    {menuOpen ? '✕' : '☰'}
                                </button>

                                {/* DROPDOWN */}
                                {menuOpen && (
                                    <div style={{
                                        position:'absolute', top:'calc(100% + 8px)', right:0, width:264,
                                        background:'rgba(5,8,28,0.99)', border:'1px solid rgba(99,102,241,0.25)',
                                        borderRadius:18, padding:8, boxShadow:'0 20px 60px rgba(0,0,0,0.65)',
                                        zIndex:1000, animation:'fsc-drop-in .2s ease-out',
                                    }}>
                                        <span style={{ display:'block', fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.1em', padding:'8px 12px 6px', fontFamily:fnt }}>Navigation</span>
                                        {navItems.map(item => (
                                            <button key={item.label} onClick={item.action} style={{
                                                display:'flex', alignItems:'center', gap:12, width:'100%', padding:'11px 12px',
                                                background:'transparent', border:'none', borderRadius:12, cursor:'pointer',
                                                color:'rgba(255,255,255,0.85)', fontFamily:fnt, transition:'background .15s',
                                            }}
                                                    onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.06)'}
                                                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                                            >
                                                <span style={{ width:34, height:34, borderRadius:10, background:'rgba(99,102,241,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>{item.icon}</span>
                                                <div style={{ display:'flex', flexDirection:'column', gap:2, textAlign:'left' }}>
                                                    <span style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.9)', fontFamily:fnt }}>{item.label}</span>
                                                    <span style={{ fontSize:10, color:'rgba(255,255,255,0.35)', fontFamily:fnt }}>{item.sub}</span>
                                                </div>
                                                <span style={{ marginLeft:'auto', color:'rgba(255,255,255,0.25)', fontSize:18 }}>›</span>
                                            </button>
                                        ))}
                                        <div style={{ height:1, background:'rgba(255,255,255,0.07)', margin:'6px 8px' }}/>
                                        <button onClick={()=>{ onClose(); setMenuOpen(false); }} style={{
                                            display:'flex', alignItems:'center', gap:12, width:'100%', padding:'11px 12px',
                                            background:'rgba(239,68,68,0.06)', border:'none', borderRadius:12, cursor:'pointer',
                                            fontFamily:fnt, transition:'background .15s',
                                        }}
                                                onMouseEnter={e=>e.currentTarget.style.background='rgba(239,68,68,0.14)'}
                                                onMouseLeave={e=>e.currentTarget.style.background='rgba(239,68,68,0.06)'}
                                        >
                                            <span style={{ width:34, height:34, borderRadius:10, background:'rgba(239,68,68,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>✕</span>
                                            <div style={{ display:'flex', flexDirection:'column', gap:2, textAlign:'left' }}>
                                                <span style={{ fontSize:13, fontWeight:700, color:'#ef4444', fontFamily:fnt }}>Close Chat</span>
                                                <span style={{ fontSize:10, color:'rgba(255,255,255,0.35)', fontFamily:fnt }}>Return to app</span>
                                            </div>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* ── CLOSE BUTTON — red pill ── */}
                            <button
                                onClick={onClose}
                                aria-label="Close"
                                style={{
                                    display:'flex', alignItems:'center', gap:6,
                                    padding:'0 16px', height:42, borderRadius:100,
                                    background:'rgba(239,68,68,0.14)', border:'1.5px solid rgba(239,68,68,0.4)',
                                    color:'#ff8080', fontSize:13, fontWeight:700, cursor:'pointer',
                                    whiteSpace:'nowrap', flexShrink:0, fontFamily:fnt, transition:'all .2s',
                                }}
                                onMouseEnter={e=>{ e.currentTarget.style.background='rgba(239,68,68,0.25)'; e.currentTarget.style.color='#ff5555'; }}
                                onMouseLeave={e=>{ e.currentTarget.style.background='rgba(239,68,68,0.14)'; e.currentTarget.style.color='#ff8080'; }}
                            >
                                <span style={{ fontSize:18, lineHeight:1, marginTop:-1 }}>×</span>
                                <span>Close</span>
                            </button>

                        </div>
                    </div>{/* /HEADER */}

                    {/* ══════════════ STATS BAR ══════════════ */}
                    {transactions.length > 0 && (
                        <div className="fsc-hidden-scroll" style={{ display:'flex', alignItems:'center', padding:'10px 16px', background:'rgba(255,255,255,0.02)', borderBottom:'1px solid rgba(255,255,255,0.05)', flexShrink:0, overflowX:'auto' }}>
                            {[
                                { label:'Balance',     val:`$${balance.toFixed(2)}`,                                                color:'#fff'     },
                                { label:'Spent',       val:`$${totalSpent.toFixed(2)}`,                                            color:'#ef4444'  },
                                { label:'Txns',        val:`${transactions.length}`,                                               color:'#fff'     },
                                { label:'Budget Used', val:`${startingBalance>0?((totalSpent/startingBalance)*100).toFixed(0):0}%`,color:'#fff'     },
                            ].map((s,i) => (
                                <React.Fragment key={s.label}>
                                    {i>0 && <div style={{ width:1, height:28, background:'rgba(255,255,255,0.07)', flexShrink:0 }}/>}
                                    <div style={{ display:'flex', flexDirection:'column', gap:2, padding:'0 14px', flexShrink:0 }}>
                                        <span style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.08em', fontFamily:fnt }}>{s.label}</span>
                                        <span style={{ fontSize:13, fontWeight:800, color:s.color, fontFamily:fnt }}>{s.val}</span>
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>
                    )}

                    {/* ══════════════ MESSAGES ══════════════ */}
                    <div
                        className="fsc-scrollbar"
                        ref={chatRef}
                        style={{ flex:1, overflowY:'auto', overflowX:'hidden', padding:'16px 14px 8px', display:'flex', flexDirection:'column', gap:14, minHeight:0 }}
                    >
                        {messages.map(m => {
                            const isUser = m.role==='user';
                            return (
                                <div key={m.id} style={{ display:'flex', alignItems:'flex-end', gap:10, flexDirection:isUser?'row-reverse':'row', animation:'fsc-msg-in .3s ease-out' }}>
                                    {!isUser && <MiniOrb size={30}/>}
                                    <div style={{ display:'flex', flexDirection:'column', gap:6, maxWidth:'84%', alignItems:isUser?'flex-end':'flex-start' }}>
                                        <div style={{
                                            padding:'11px 14px', wordBreak:'break-word', whiteSpace:'pre-wrap', fontSize:14, lineHeight:1.55, fontFamily:fnt,
                                            ...(isUser
                                                    ? { background:'linear-gradient(135deg,#3b82f6,#6366f1)', color:'#fff', borderRadius:'20px 20px 6px 20px', boxShadow:'0 4px 20px rgba(59,130,246,0.3)' }
                                                    : { background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.9)', borderRadius:'20px 20px 20px 6px' }
                                            ),
                                        }}>
                                            <BubbleText text={m.text}/>
                                        </div>
                                        {m.chart && (
                                            <div style={{ width:'100%', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, overflow:'hidden' }}>
                                                <div style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 14px', fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.4)', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)', textTransform:'uppercase', letterSpacing:'0.07em', fontFamily:fnt }}>
                                                    📊 AI Generated {CHART_LABELS[m.chart]||'Chart'}
                                                </div>
                                                {renderChart(m.chart)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Typing dots */}
                        {typing && (
                            <div style={{ display:'flex', alignItems:'flex-end', gap:10 }}>
                                <MiniOrb size={30}/>
                                <div style={{ display:'flex', alignItems:'center', gap:5, padding:'14px 18px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'20px 20px 20px 6px' }}>
                                    {[0, 0.15, 0.3].map((d,i) => (
                                        <span key={i} style={{ width:7, height:7, borderRadius:'50%', background:'rgba(255,255,255,0.5)', display:'inline-block', animation:`fsc-bounce 1.2s ease-in-out ${d}s infinite` }}/>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>{/* /MESSAGES */}

                    {/* ══════════════ SUGGESTION CHIPS ══════════════ */}
                    {messages.length <= 2 && (
                        <div className="fsc-hidden-scroll" style={{ display:'flex', gap:8, padding:'8px 14px 4px', overflowX:'auto', flexShrink:0 }}>
                            {chips.map((c,i) => (
                                <button key={i} disabled={typing} onClick={()=>send(c.p)}
                                        style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:24, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.75)', fontSize:12, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0, fontFamily:fnt, transition:'all .2s' }}
                                        onMouseEnter={e=>{ e.currentTarget.style.background='rgba(99,102,241,0.15)'; e.currentTarget.style.borderColor='rgba(99,102,241,0.4)'; e.currentTarget.style.color='#a5b4fc'; }}
                                        onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.12)'; e.currentTarget.style.color='rgba(255,255,255,0.75)'; }}
                                >
                                    <span style={{fontSize:14}}>{c.e}</span><span>{c.l}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* ══════════════ INPUT BAR ══════════════ */}
                    <div style={{
                        display:'flex', alignItems:'center', gap:10, padding:'12px 14px',
                        paddingBottom:'max(14px, env(safe-area-inset-bottom, 14px))',
                        borderTop:'1px solid rgba(255,255,255,0.07)',
                        background:'rgba(4,6,20,0.98)', flexShrink:0,
                    }}>
                        <input
                            ref={inputRef}
                            value={input}
                            onChange={e=>setInput(e.target.value)}
                            onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send(input)}
                            placeholder="Ask anything or say 'show me a chart'..."
                            disabled={typing}
                            autoComplete="off"
                            enterKeyHint="send"
                            style={{
                                flex:1, minHeight:46, padding:'12px 16px',
                                background:'rgba(255,255,255,0.08)', border:'1.5px solid rgba(255,255,255,0.14)',
                                borderRadius:24, color:'#fff', fontSize:16, outline:'none',
                                fontFamily:fnt, transition:'border-color .2s, background .2s',
                                WebkitAppearance:'none',
                            }}
                            onFocus={e=>{ e.target.style.borderColor='rgba(99,102,241,0.55)'; e.target.style.background='rgba(255,255,255,0.1)'; }}
                            onBlur={e=>{  e.target.style.borderColor='rgba(255,255,255,0.14)'; e.target.style.background='rgba(255,255,255,0.08)'; }}
                        />

                        {/* SEND BUTTON */}
                        {(() => {
                            const active = !!input.trim() && !typing;
                            return (
                                <button
                                    onClick={()=>send(input)}
                                    disabled={!active}
                                    aria-label="Send"
                                    style={{
                                        width:48, height:48, minWidth:48, borderRadius:'50%',
                                        border: active ? 'none' : '1.5px solid rgba(255,255,255,0.12)',
                                        cursor: active ? 'pointer' : 'default',
                                        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                                        background: active
                                            ? 'linear-gradient(135deg,#3b82f6 0%,#6366f1 50%,#8b5cf6 100%)'
                                            : 'rgba(255,255,255,0.07)',
                                        boxShadow: active ? '0 4px 22px rgba(59,130,246,0.55)' : 'none',
                                        opacity: active ? 1 : 0.45,
                                        transition:'all .25s',
                                    }}
                                    onMouseEnter={e=>{ if(active){ e.currentTarget.style.transform='scale(1.1) translateY(-1px)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(59,130,246,0.65)'; }}}
                                    onMouseLeave={e=>{ e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=active?'0 4px 22px rgba(59,130,246,0.55)':'none'; }}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <polygon points="22 2 15 22 11 13 2 9 22 2" fill="white" opacity={active?'1':'0.4'}/>
                                        <line x1="22" y1="2" x2="11" y2="13" stroke="white" strokeWidth="1.5" opacity={active?'1':'0.4'}/>
                                    </svg>
                                </button>
                            );
                        })()}
                    </div>{/* /INPUT BAR */}

                </div>{/* /MODAL */}
            </div>{/* /OVERLAY */}
        </>
    );
};

/* ═══════════════════════════════════════════════════════
   AI INSIGHTS DASHBOARD
═══════════════════════════════════════════════════════ */
const AIInsightsDashboard = ({ transactions=[], balance=0, totalSpent=0, startingBalance=0, onOpenChat }) => {
    const [insights,   setInsights]   = useState([]);
    const [loading,    setLoading]    = useState(false);
    const [lastCount,  setLastCount]  = useState(0);
    const fnt = "'DM Sans','Inter',system-ui,sans-serif";

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

    const TC = { tip:'rgba(59,130,246,0.08)',   warning:'rgba(245,158,11,0.08)',  goal:'rgba(16,185,129,0.08)' };
    const TB = { tip:'rgba(59,130,246,0.18)',   warning:'rgba(245,158,11,0.18)',  goal:'rgba(16,185,129,0.18)' };

    const shownInsights = insights.length
        ? insights
        : [{ id:0, emoji:'✨', title:'Getting Started', body:"Add more expenses and I'll generate personalized insights for you.", type:'tip' }];

    return (
        <div style={{ background:'linear-gradient(135deg,rgba(15,23,42,.7),rgba(30,35,70,.5))', border:'1px solid rgba(99,102,241,.15)', borderRadius:20, padding:20, display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <MiniOrb size={30}/>
                <div>
                    <h3 style={{ fontSize:15, fontWeight:700, color:'#fff', margin:'0 0 2px', fontFamily:fnt }}>AI Insights</h3>
                    <span style={{ fontSize:11, color:'rgba(255,255,255,0.35)', fontFamily:fnt }}>Powered by Claude</span>
                </div>
                {loading && <span style={{ marginLeft:'auto', fontSize:11, color:'rgba(255,255,255,.35)', fontStyle:'italic', fontFamily:fnt }}>Analyzing…</span>}
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {shownInsights.map(ins => (
                    <div key={ins.id} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'12px 14px', borderRadius:14, border:`1px solid ${TB[ins.type]}`, background:TC[ins.type] }}>
                        <span style={{ fontSize:22, lineHeight:1, marginTop:1, flexShrink:0 }}>{ins.emoji}</span>
                        <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                            <span style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,.9)', fontFamily:fnt }}>{ins.title}</span>
                            <span style={{ fontSize:12, color:'rgba(255,255,255,.55)', lineHeight:1.45, fontFamily:fnt }}>{ins.body}</span>
                        </div>
                    </div>
                ))}
            </div>

            <button onClick={onOpenChat} style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', background:'linear-gradient(135deg,rgba(59,130,246,.1),rgba(99,102,241,.1))', border:'1px solid rgba(99,102,241,.25)', borderRadius:14, color:'rgba(255,255,255,.8)', fontSize:13, fontWeight:700, cursor:'pointer', width:'100%', justifyContent:'center', fontFamily:fnt }}>
                <MiniOrb size={22}/>
                <span>Chat with AI for deeper insights</span>
                <span style={{ marginLeft:'auto', fontSize:18 }}>›</span>
            </button>
        </div>
    );
};

export { FullscreenAIChat, AIInsightsDashboard };
export default FullscreenAIChat;