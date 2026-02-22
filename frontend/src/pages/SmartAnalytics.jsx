// SmartAnalytics.jsx
// FinScope AI — Smart Analytics Intelligence
// AI-powered heatmaps, pattern detection, behavioral scoring, and deep insights

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { getTransactions, getUserFinance } from '../services/financeService';
import { sendMessage } from '../services/claudeAI';
import './SmartAnalytics.css';

/* ═══════════════════════════════════════════
   SVG ICONS — No emojis
   ═══════════════════════════════════════════ */
const Icons = {
    brain: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2C8.1 2 7 3.1 7 4.5c0 .4.1.8.2 1.1C5.9 6.1 5 7.4 5 9c0 1.1.4 2.1 1 2.9-.6.8-1 1.8-1 2.9 0 1.6.9 2.9 2.2 3.5-.1.3-.2.7-.2 1.1 0 1.4 1.1 2.5 2.5 2.5H15c2.8 0 5-2.2 5-5 0-.6-.1-1.1-.3-1.6.8-.7 1.3-1.8 1.3-3 0-1.1-.4-2.1-1-2.9.6-.8 1-1.8 1-2.9 0-1.6-.9-2.9-2.2-3.5C18.4 2.5 17.3 2 16 2H9.5z"/></svg>,
    dna: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 15c6.667-6 13.333 0 20-6"/><path d="M9 22c1.8-2 2.5-4 2.8-6"/><path d="M15 2c-1.8 2-2.5 4-2.8 6"/><path d="m17 6-2.5-2.5"/><path d="m14 8-1-1"/><path d="m7 18 2.5 2.5"/><path d="m3.5 14.5.5.5"/><path d="m6 12 1 1"/></svg>,
    bolt: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    robot: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><circle cx="8" cy="15" r="1" fill="currentColor" stroke="none"/><circle cx="16" cy="15" r="1" fill="currentColor" stroke="none"/><path d="M8 19h8"/></svg>,
    clock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    calendar: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    wave: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12c1-4 3-6 5-6s4 4 6 4 4-6 6-6"/></svg>,
    trophy: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>,
    bulb: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>,
    target: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    money: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    warning: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    chartUp: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
    chartDown: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>,
    chartBar: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>,
    back: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
    sparkles: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>,
    heatmap: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="4" height="4" rx="1"/><rect x="10" y="3" width="4" height="4" rx="1"/><rect x="17" y="3" width="4" height="4" rx="1"/><rect x="3" y="10" width="4" height="4" rx="1"/><rect x="10" y="10" width="4" height="4" rx="1"/><rect x="17" y="10" width="4" height="4" rx="1"/><rect x="3" y="17" width="4" height="4" rx="1"/><rect x="10" y="17" width="4" height="4" rx="1"/><rect x="17" y="17" width="4" height="4" rx="1"/></svg>,
    arrow: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
    close: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>,
};

/* ═══════════════════════════════════════════
   FINSCOPE AI ORB — Real orb, scaled to fit
   Embeds the actual FinScopeAI component logic
   inline so no external import needed.
   size prop controls the rendered pixel size.
   ═══════════════════════════════════════════ */
const MiniAIFace = ({ size = 36, animated = true, className = '' }) => {
    const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
    const [isBlinking, setIsBlinking] = useState(false);
    const [wavePhase, setWavePhase] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    // The real FinScopeAI always renders at 400×400 internally.
    // We scale it down to `size` pixels via CSS transform.
    const NATIVE = 400;
    const scale = size / NATIVE;

    useEffect(() => {
        if (!animated) return;
        const waveAnim = setInterval(() => {
            setWavePhase(prev => (prev + 0.015) % (Math.PI * 2));
        }, 50);
        return () => clearInterval(waveAnim);
    }, [animated]);

    useEffect(() => {
        if (!animated) return;
        const lookAround = setInterval(() => {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 8 + 2;
            setEyePosition({ x: Math.cos(angle) * distance, y: Math.sin(angle) * distance });
        }, 1200);
        const blink = setInterval(() => {
            setIsBlinking(true);
            setTimeout(() => setIsBlinking(false), 100);
        }, 3000);
        const doubleBlink = setInterval(() => {
            setIsBlinking(true);
            setTimeout(() => {
                setIsBlinking(false);
                setTimeout(() => { setIsBlinking(true); setTimeout(() => setIsBlinking(false), 100); }, 120);
            }, 100);
        }, 10000);
        return () => { clearInterval(lookAround); clearInterval(blink); clearInterval(doubleBlink); };
    }, [animated]);

    const generateWavePoints = (count, radius, offset, intensity, frequency) => {
        const points = [];
        for (let i = 0; i <= count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const wave1 = Math.sin(angle * frequency + wavePhase + offset) * intensity;
            const wave2 = Math.cos(angle * (frequency * 0.7) - wavePhase * 0.8 + offset) * (intensity * 0.5);
            const wave3 = Math.sin(angle * (frequency * 1.5) + wavePhase * 1.2 + offset) * (intensity * 0.3);
            const r = radius + wave1 + wave2 + wave3;
            points.push(`${200 + Math.cos(angle) * r},${200 + Math.sin(angle) * r}`);
        }
        return points.join(' ');
    };

    const orbW = 280, orbH = 280;
    const eyeH = isBlinking ? 4 : 72;

    return (
        <div
            className={`sa-mini-face ${className}`}
            style={{
                width: size, height: size, flexShrink: 0, position: 'relative',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}
        >
            {/* Scale wrapper: native 400×400 shrunk to `size` */}
            <div style={{
                width: NATIVE, height: NATIVE,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                position: 'absolute', top: 0, left: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                pointerEvents: animated ? 'auto' : 'none',
            }}>
                {/* Orbiting fintech icons — only on larger sizes */}
                {size >= 80 && (
                    <div className="sa-face-orbit">
                        {[
                            { type:'dollar', angle:0 }, { type:'bitcoin', angle:45 }, { type:'euro', angle:90 },
                            { type:'chartup', angle:135 }, { type:'pound', angle:180 }, { type:'yen', angle:225 },
                            { type:'chartbar', angle:270 }, { type:'wallet', angle:315 },
                        ].map((icon, i) => (
                            <div key={i} className="sa-face-orbit-icon"
                                 style={{ '--icon-angle': `${icon.angle}deg`, '--icon-delay': `${i * -2.5}s` }}>
                                {icon.type === 'dollar' && <span className="sa-face-symbol">$</span>}
                                {icon.type === 'euro' && <span className="sa-face-symbol">€</span>}
                                {icon.type === 'pound' && <span className="sa-face-symbol">£</span>}
                                {icon.type === 'yen' && <span className="sa-face-symbol">¥</span>}
                                {icon.type === 'chartup' && <svg className="sa-face-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>}
                                {icon.type === 'chartbar' && <svg className="sa-face-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>}
                                {icon.type === 'wallet' && <svg className="sa-face-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"/></svg>}
                                {icon.type === 'bitcoin' && <svg className="sa-face-svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12.5 8.8v-3h-1v3h1zm0 5.9v-3h-1v3h1zm2.5-5.4c0-.7-.1-1.2-.4-1.6-.3-.4-.7-.6-1.3-.7V5H12v2h-1V5h-1.3v2H8v1.3h.7c.4 0 .6.2.6.6v6.2c0 .4-.2.6-.6.6H8V17h1.7v2H11v-2h1v2h1.3v-2c.6-.1 1.1-.3 1.5-.6.4-.4.6-.9.7-1.6 0-.5-.1-1-.4-1.4-.2-.4-.6-.7-1.1-.8.4-.1.7-.4 1-.8.2-.4.4-.8.4-1.3zm-2 .9c0 .4-.1.7-.3.8-.2.2-.5.2-.9.2h-.8V9h.8c.4 0 .7.1.9.3.2.2.3.4.3.9zm.3 4.1c-.2.2-.6.3-1 .3h-1.3v-2.4h1.3c.4 0 .8.1 1 .3.2.2.3.5.3 1 0 .4-.1.7-.3.8z"/></svg>}
                            </div>
                        ))}
                    </div>
                )}

                {/* Orbiting particles */}
                {size >= 60 && (
                    <div className="sa-face-particles">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="sa-face-particle"
                                 style={{ '--orbit-delay': `${i * -1.5}s`, '--orbit-size': `${4 + (i % 3) * 2}px` }} />
                        ))}
                    </div>
                )}

                {/* Animated wave rings */}
                {size >= 40 && (
                    <svg className="sa-face-wave" viewBox="0 0 400 400" style={{ width: 400, height: 400, position: 'absolute', pointerEvents: 'none', zIndex: 1 }}>
                        <defs>
                            <linearGradient id="saFaceWG1" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4"/>
                                <stop offset="50%" stopColor="#6366f1" stopOpacity="0.3"/>
                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2"/>
                            </linearGradient>
                            <linearGradient id="saFaceWG2" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.5"/>
                                <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.25"/>
                            </linearGradient>
                            <linearGradient id="saFaceWG3" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.6"/>
                                <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0.3"/>
                            </linearGradient>
                            <filter id="saFaceWGlow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="3" result="blur"/>
                                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                            </filter>
                        </defs>
                        <polygon points={generateWavePoints(120, 185, 0, 10, 3)} fill="none" stroke="url(#saFaceWG1)" strokeWidth="1.5" filter="url(#saFaceWGlow)"/>
                        <polygon points={generateWavePoints(100, 175, 1, 8, 4)} fill="none" stroke="url(#saFaceWG2)" strokeWidth="2" filter="url(#saFaceWGlow)"/>
                        <polygon points={generateWavePoints(80, 165, 2, 6, 5)} fill="none" stroke="url(#saFaceWG3)" strokeWidth="2.5" filter="url(#saFaceWGlow)"/>
                    </svg>
                )}

                {/* Main orb */}
                <div
                    className={`sa-face-orb ${isHovered ? 'sa-face-orb--hovered' : ''}`}
                    style={{ width: orbW, height: orbH }}
                    onMouseEnter={() => animated && setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div className="sa-face-reflect-1"/>
                    <div className="sa-face-reflect-2"/>
                    <div className="sa-face-reflect-3"/>
                    <div className="sa-face-eyes">
                        {[0, 1].map(i => (
                            <div key={i} className="sa-face-eye-wrap">
                                <div className="sa-face-eye" style={{
                                    height: eyeH,
                                    transform: `translate(${eyePosition.x}px, ${eyePosition.y}px)`,
                                }}/>
                            </div>
                        ))}
                    </div>
                    <div className="sa-face-bottom-glow"/>
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════
   UTILITY
   ═══════════════════════════════════════════ */
const COLORS = {
    Groceries: '#3b82f6', Subscriptions: '#8b5cf6', Shopping: '#a78bfa',
    Transport: '#06b6d4', Dining: '#f59e0b', Bills: '#ef4444',
    Health: '#10b981', Entertainment: '#ec4899', Education: '#f97316', Other: '#6b7280',
};
const getCatColor = (cat, idx = 0) => COLORS[cat] || Object.values(COLORS)[idx % Object.values(COLORS).length];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/* ═══════════════════════════════════════════
   RADAR CHART
   ═══════════════════════════════════════════ */
const RadarChart = ({ data, labels, color = '#8b5cf6' }) => {
    const [hovered, setHovered] = useState(null);
    const size = 220, cx = 110, cy = 110, r = 80, n = labels.length;
    const pts = labels.map((_, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        return { ax: cx + r * Math.cos(angle), ay: cy + r * Math.sin(angle),
            vx: cx + r * data[i] * Math.cos(angle), vy: cy + r * data[i] * Math.sin(angle),
            lx: cx + (r + 22) * Math.cos(angle), ly: cy + (r + 22) * Math.sin(angle) };
    });
    const rings = [0.25, 0.5, 0.75, 1].map(f =>
        labels.map((_, i) => {
            const a = (i / n) * 2 * Math.PI - Math.PI / 2;
            return `${cx + r * f * Math.cos(a)},${cy + r * f * Math.sin(a)}`;
        }).join(' ')
    );
    return (
        <svg viewBox={`0 0 ${size} ${size}`} className="sa-radar-svg">
            {rings.map((ring, i) => <polygon key={i} points={ring} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />)}
            {pts.map((p, i) => <line key={i} x1={cx} y1={cy} x2={p.ax} y2={p.ay} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />)}
            <polygon points={pts.map(p => `${p.vx},${p.vy}`).join(' ')} fill={`${color}22`} stroke={color} strokeWidth="2" strokeLinejoin="round" />
            {pts.map((p, i) => (
                <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}>
                    <circle cx={p.vx} cy={p.vy} r={hovered === i ? 6 : 4} fill={color} stroke="#0c1130" strokeWidth="2" />
                </g>
            ))}
            {pts.map((p, i) => (
                <text key={i} x={p.lx} y={p.ly} textAnchor="middle" dominantBaseline="middle"
                      fill={hovered === i ? '#fff' : 'rgba(255,255,255,0.5)'} fontSize="9" fontWeight="600" fontFamily="system-ui">
                    {labels[i]}
                </text>
            ))}
            {hovered !== null && <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="18" fontWeight="800" fontFamily="system-ui">{(data[hovered] * 100).toFixed(0)}%</text>}
        </svg>
    );
};

/* ═══════════════════════════════════════════
   SPENDING HEATMAP
   ═══════════════════════════════════════════ */
const SpendingHeatmap = ({ transactions }) => {
    const [hoveredCell, setHoveredCell] = useState(null);
    const grid = Array.from({ length: 7 }, () => Array(24).fill(0));
    const countGrid = Array.from({ length: 7 }, () => Array(24).fill(0));
    transactions.forEach(t => {
        const d = new Date(t.created_at);
        grid[d.getDay()][d.getHours()] += t.amount;
        countGrid[d.getDay()][d.getHours()]++;
    });
    const maxVal = Math.max(...grid.flat(), 1);
    const getColor = (val) => {
        if (val === 0) return 'rgba(255,255,255,0.03)';
        const i = val / maxVal;
        if (i < 0.25) return `rgba(59,130,246,${0.2 + i * 0.4})`;
        if (i < 0.6) return `rgba(139,92,246,${0.4 + i * 0.3})`;
        return `rgba(239,68,68,${0.5 + i * 0.5})`;
    };
    const visibleHours = Array.from({ length: 18 }, (_, i) => i + 6);
    return (
        <div className="sa-heatmap-wrap">
            <div className="sa-heatmap-grid">
                <div className="sa-heatmap-corner" />
                {visibleHours.map(h => <div key={h} className="sa-heatmap-hour-label">{h === 12 ? '12p' : h < 12 ? `${h}a` : `${h-12}p`}</div>)}
                {DAYS.map((day, di) => (
                    <React.Fragment key={di}>
                        <div className="sa-heatmap-day-label">{day}</div>
                        {visibleHours.map(h => {
                            const val = grid[di][h], count = countGrid[di][h];
                            const isHov = hoveredCell?.day === di && hoveredCell?.hour === h;
                            return (
                                <div key={h} className={`sa-heatmap-cell ${isHov ? 'hov' : ''}`}
                                     style={{ background: getColor(val), boxShadow: isHov ? `0 0 10px ${getColor(val)}` : 'none' }}
                                     onMouseEnter={() => setHoveredCell({ day: di, hour: h, val, count })}
                                     onMouseLeave={() => setHoveredCell(null)} />
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>
            {hoveredCell && (
                <div className="sa-heatmap-tooltip">
                    <strong>{DAYS[hoveredCell.day]}, {hoveredCell.hour < 12 ? `${hoveredCell.hour}am` : `${hoveredCell.hour - 12 || 12}pm`}</strong>
                    <div>${hoveredCell.val.toFixed(2)} · {hoveredCell.count} txn{hoveredCell.count !== 1 ? 's' : ''}</div>
                </div>
            )}
            <div className="sa-heatmap-legend">
                <span>Low</span><div className="sa-heatmap-gradient" /><span>High</span>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════
   MONTHLY CALENDAR HEATMAP
   ═══════════════════════════════════════════ */
const MonthlyCalendarHeatmap = ({ transactions }) => {
    const now = new Date();
    const year = now.getFullYear(), month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const dailySpend = {};
    transactions.forEach(t => {
        const d = new Date(t.created_at);
        if (d.getFullYear() === year && d.getMonth() === month)
            dailySpend[d.getDate()] = (dailySpend[d.getDate()] || 0) + t.amount;
    });
    const maxDay = Math.max(...Object.values(dailySpend), 1);
    const [hovered, setHovered] = useState(null);
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    const getCalColor = (i) => {
        if (i === 0) return 'rgba(255,255,255,0.03)';
        if (i < 0.3) return `rgba(16,185,129,${0.3+i})`;
        if (i < 0.7) return `rgba(245,158,11,${0.4+i*0.4})`;
        return `rgba(239,68,68,${0.5+i*0.5})`;
    };
    return (
        <div className="sa-cal-wrap">
            <div className="sa-cal-header-row">{DAYS.map(d => <div key={d} className="sa-cal-day-name">{d[0]}</div>)}</div>
            <div className="sa-cal-grid">
                {cells.map((day, i) => {
                    if (!day) return <div key={`e-${i}`} className="sa-cal-empty" />;
                    const amt = dailySpend[day] || 0;
                    return (
                        <div key={day} className={`sa-cal-cell ${day === now.getDate() ? 'today' : ''} ${hovered === day ? 'hov' : ''}`}
                             style={{ background: getCalColor(amt / maxDay) }}
                             onMouseEnter={() => setHovered(day)} onMouseLeave={() => setHovered(null)}>
                            <span className="sa-cal-day-num">{day}</span>
                            {amt > 0 && <span className="sa-cal-amt">${amt >= 100 ? `${(amt/1000).toFixed(1)}k` : amt.toFixed(0)}</span>}
                        </div>
                    );
                })}
            </div>
            {hovered && <div className="sa-cal-tooltip">{MONTHS[month]} {hovered}: {dailySpend[hovered] ? `$${dailySpend[hovered].toFixed(2)} spent` : 'No spending'}</div>}
        </div>
    );
};

/* ═══════════════════════════════════════════
   HEALTH SCORE RING
   ═══════════════════════════════════════════ */
const HealthScoreRing = ({ score, label, color }) => {
    const r = 36, circ = 2 * Math.PI * r, dash = (score / 100) * circ;
    return (
        <div className="sa-health-ring-wrap">
            <svg viewBox="0 0 90 90" className="sa-health-ring-svg">
                <circle cx="45" cy="45" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle cx="45" cy="45" r={r} fill="none" stroke={color} strokeWidth="8"
                        strokeDasharray={`${dash} ${circ}`} strokeDashoffset={circ * 0.25}
                        strokeLinecap="round" style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.22,1,0.36,1)' }} />
                <text x="45" y="42" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="800" fontFamily="system-ui">{score}</text>
                <text x="45" y="54" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="7" fontFamily="system-ui">/100</text>
            </svg>
            <span className="sa-health-ring-label">{label}</span>
        </div>
    );
};

/* ═══════════════════════════════════════════
   VELOCITY CHART
   ═══════════════════════════════════════════ */
const VelocityChart = ({ transactions }) => {
    const now = new Date(), days = 14;
    const buckets = Array.from({ length: days }, (_, i) => {
        const d = new Date(now); d.setDate(d.getDate() - (days - 1 - i));
        return { date: d, label: `${d.getMonth()+1}/${d.getDate()}`, amount: 0, count: 0 };
    });
    transactions.forEach(t => {
        const td = new Date(t.created_at);
        buckets.forEach(b => { if (td.toDateString() === b.date.toDateString()) { b.amount += t.amount; b.count++; } });
    });
    const maxAmt = Math.max(...buckets.map(b => b.amount), 1);
    const W = 500, H = 120, PL = 10, PR = 10, PT = 16, PB = 24;
    const cW = W - PL - PR, cH = H - PT - PB;
    const xOf = i => PL + (i / (days - 1)) * cW;
    const yOf = v => PT + cH - (v / maxAmt) * cH;
    const line = buckets.map((b, i) => `${xOf(i)},${yOf(b.amount)}`).join(' ');
    const area = `M${xOf(0)},${yOf(buckets[0].amount)} ` + buckets.slice(1).map((b, i) => `L${xOf(i+1)},${yOf(b.amount)}`).join(' ') + ` L${xOf(days-1)},${PT+cH} L${xOf(0)},${PT+cH} Z`;
    const [hov, setHov] = useState(null);
    const avgDaily = buckets.reduce((s, b) => s + b.amount, 0) / days;
    return (
        <div className="sa-velocity-wrap">
            <svg viewBox={`0 0 ${W} ${H}`} className="sa-velocity-svg">
                <defs><linearGradient id="velFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4"/><stop offset="100%" stopColor="#06b6d4" stopOpacity="0"/></linearGradient></defs>
                <line x1={PL} y1={yOf(avgDaily)} x2={W-PR} y2={yOf(avgDaily)} stroke="rgba(245,158,11,0.4)" strokeWidth="1" strokeDasharray="4,3"/>
                <text x={W-PR+2} y={yOf(avgDaily)+3} fill="rgba(245,158,11,0.6)" fontSize="8" fontFamily="system-ui">avg</text>
                <path d={area} fill="url(#velFill)"/>
                <polyline points={line} fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                {buckets.map((b, i) => (
                    <g key={i} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} style={{ cursor: 'pointer' }}>
                        <rect x={xOf(i)-8} y={PT} width={16} height={cH} fill="transparent"/>
                        {b.amount > 0 && <circle cx={xOf(i)} cy={yOf(b.amount)} r={hov===i?5:3} fill={hov===i?'#fff':'#06b6d4'} stroke="#06b6d4" strokeWidth="2"/>}
                        {(i%3===0||i===days-1) && <text x={xOf(i)} y={H-2} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="8" fontFamily="system-ui">{b.label}</text>}
                    </g>
                ))}
            </svg>
            {hov !== null && buckets[hov].amount > 0 && (
                <div className="sa-vel-tooltip" style={{ left: `${(xOf(hov)/W)*100}%` }}>
                    <div className="sa-vel-tt-date">{buckets[hov].label}</div>
                    <div className="sa-vel-tt-amt">${buckets[hov].amount.toFixed(2)}</div>
                    <div className="sa-vel-tt-count">{buckets[hov].count} txn{buckets[hov].count!==1?'s':''}</div>
                </div>
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════
   CATEGORY FLOW
   ═══════════════════════════════════════════ */
const CategoryFlow = ({ transactions, totalSpent }) => {
    const catTotals = {};
    transactions.forEach(t => { catTotals[t.category] = (catTotals[t.category] || 0) + t.amount; });
    const sorted = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
    const [hov, setHov] = useState(null);
    return (
        <div className="sa-flow-wrap">
            {sorted.map(([cat, amt], i) => {
                const pct = totalSpent > 0 ? (amt / totalSpent) * 100 : 0;
                const color = getCatColor(cat, i), isHov = hov === cat;
                return (
                    <div key={cat} className={`sa-flow-row ${isHov ? 'hov' : ''}`} onMouseEnter={() => setHov(cat)} onMouseLeave={() => setHov(null)}>
                        <div className="sa-flow-label-col"><span className="sa-flow-dot" style={{ background: color }}/><span className="sa-flow-name">{cat}</span></div>
                        <div className="sa-flow-track">
                            <div className="sa-flow-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg,${color}cc,${color}66)`, boxShadow: isHov ? `0 0 16px ${color}66` : 'none' }}/>
                            <div className="sa-flow-segments">{Array.from({ length: Math.floor(pct/5) }).map((_,j) => <div key={j} className="sa-flow-tick" style={{ left:`${(j+1)*5}%` }}/>)}</div>
                        </div>
                        <div className="sa-flow-right"><span className="sa-flow-pct">{pct.toFixed(1)}%</span><span className="sa-flow-amt">${amt.toFixed(2)}</span></div>
                    </div>
                );
            })}
        </div>
    );
};

/* ═══════════════════════════════════════════
   ANOMALY DETECTOR
   ═══════════════════════════════════════════ */
const AnomalyList = ({ transactions }) => {
    const catAmounts = {};
    transactions.forEach(t => { if (!catAmounts[t.category]) catAmounts[t.category] = []; catAmounts[t.category].push(t.amount); });
    const anomalies = [];
    transactions.forEach(t => {
        const amts = catAmounts[t.category];
        if (!amts || amts.length < 2) return;
        const avg = amts.reduce((a,b)=>a+b,0)/amts.length;
        const stdDev = Math.sqrt(amts.reduce((a,b)=>a+(b-avg)**2,0)/amts.length);
        const zScore = stdDev > 0 ? (t.amount-avg)/stdDev : 0;
        if (zScore > 1.5) anomalies.push({ ...t, zScore, avg, deviation: ((t.amount-avg)/avg*100).toFixed(0) });
    });
    anomalies.sort((a,b) => b.zScore-a.zScore);
    if (anomalies.length === 0) return (
        <div className="sa-anomaly-empty">
            <div className="sa-anomaly-check">{Icons.check}</div>
            <p>No anomalies detected — your spending looks consistent!</p>
        </div>
    );
    return (
        <div className="sa-anomaly-list">
            {anomalies.slice(0,5).map((t,i) => (
                <div key={i} className="sa-anomaly-row">
                    <div className="sa-anomaly-icon-wrap" style={{ background: `rgba(239,68,68,${Math.min(0.3+t.zScore*0.1,0.9)})` }}><span className="sa-anomaly-icon-svg">{Icons.bolt}</span></div>
                    <div className="sa-anomaly-info"><span className="sa-anomaly-name">{t.name}</span><span className="sa-anomaly-cat">{t.category} · avg ${t.avg.toFixed(2)}</span></div>
                    <div className="sa-anomaly-right"><span className="sa-anomaly-amt">${t.amount.toFixed(2)}</span><span className="sa-anomaly-dev">+{t.deviation}% avg</span></div>
                </div>
            ))}
        </div>
    );
};

/* ═══════════════════════════════════════════
   AI DEEP ANALYSIS PANEL
   ═══════════════════════════════════════════ */
const AIDeepAnalysis = ({ transactions, balance, totalSpent, startingBalance }) => {
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [activeType, setActiveType] = useState(null);

    const types = [
        { id:'pattern', label:'Behavior Patterns', icon: Icons.brain, color:'#8b5cf6', prompt:`Analyze my spending behavior patterns in depth. Identify: 1) My dominant spending personality type, 2) Psychological patterns like stress or reward spending, 3) Weekly behavioral cycles, 4) Three specific behavioral changes I could make. Be specific with actual numbers.` },
        { id:'forecast', label:'30-Day Forecast', icon: Icons.sparkles, color:'#06b6d4', prompt:`Based on my spending history, forecast my finances for the next 30 days. Include: 1) Projected total spend if I continue current habits, 2) Which categories will grow vs shrink, 3) Best vs worst-case balance scenario, 4) One key action to improve my 30-day outlook. Use actual numbers.` },
        { id:'optimize', label:'Optimization Plan', icon: Icons.bolt, color:'#f59e0b', prompt:`Create a specific spending optimization plan. Include: 1) The single biggest money leak and exactly how much I'd save monthly, 2) A "quick win" I can do today, 3) A 3-week challenge to reduce my biggest expense category, 4) Estimated monthly savings if I follow your plan. Be specific with dollar amounts.` },
        { id:'compare', label:'Benchmark Analysis', icon: Icons.chartBar, color:'#10b981', prompt:`Compare my spending to the 50/30/20 rule: 1) How does each category compare to what's "normal"? 2) Which categories am I overspending vs underspending? 3) What's my financial health grade (A-F) and why? 4) What one change would improve my grade most?` },
    ];

    const run = async (t) => {
        setActiveType(t.id); setLoading(true); setAnalysis(null);
        try {
            const result = await sendMessage(t.prompt, { transactions, balance, totalSpent, startingBalance });
            setAnalysis({ text: result, id: t.id, icon: t.icon, color: t.color });
        } catch {
            setAnalysis({ text: 'Analysis failed. Please check your connection and try again.', id: t.id, icon: t.icon, color: '#ef4444' });
        }
        setLoading(false);
    };

    return (
        <div className="sa-ai-panel">
            <div className="sa-ai-type-grid">
                {types.map(t => (
                    <button key={t.id} className={`sa-ai-type-btn ${activeType === t.id ? 'active' : ''}`}
                            style={activeType === t.id ? { borderColor:`${t.color}55`, background:`${t.color}15` } : {}}
                            onClick={() => run(t)} disabled={loading}>
                        <span className="sa-ai-type-icon" style={{ color: t.color }}>{t.icon}</span>
                        <span>{t.label}</span>
                    </button>
                ))}
            </div>

            {loading && (
                <div className="sa-ai-loading">
                    <div className="sa-ai-face-loading">
                        <MiniAIFace size={68} animated={true} />
                        <div className="sa-ai-face-ring sa-air-1"/>
                        <div className="sa-ai-face-ring sa-air-2"/>
                    </div>
                    <p className="sa-ai-loading-text">Analyzing your financial data...</p>
                    <div className="sa-ai-dots"><span/><span/><span/></div>
                </div>
            )}

            {analysis && !loading && (
                <div className="sa-ai-result">
                    <div className="sa-ai-result-header" style={{ borderColor:`${analysis.color}33`, background:`${analysis.color}10` }}>
                        <span className="sa-ai-result-icon" style={{ color: analysis.color }}>{analysis.icon}</span>
                        <span className="sa-ai-result-label">AI Analysis Complete</span>
                        <MiniAIFace size={30} animated={false} />
                        <button className="sa-ai-result-close" onClick={() => { setAnalysis(null); setActiveType(null); }}>{Icons.close}</button>
                    </div>
                    <div className="sa-ai-result-text">
                        {analysis.text.split('\n').map((line, i) => (
                            <span key={i}>
                {line.split(/(\*\*.*?\*\*)/).map((p, j) => p.startsWith('**') && p.endsWith('**') ? <strong key={j}>{p.slice(2,-2)}</strong> : p)}
                                {i < analysis.text.split('\n').length - 1 && <br />}
              </span>
                        ))}
                    </div>
                </div>
            )}

            {!loading && !analysis && (
                <div className="sa-ai-placeholder">
                    <MiniAIFace size={76} animated={true} />
                    <p>Select an analysis type above to get AI-powered deep insights about your spending patterns.</p>
                </div>
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════
   COMPUTE HELPERS
   ═══════════════════════════════════════════ */
const computeDNA = (transactions, totalSpent, balance, startingBalance) => {
    if (!transactions.length) return Array(8).fill(0.3);
    const ct = {}; transactions.forEach(t => { ct[t.category] = (ct[t.category]||0)+t.amount; });
    const bp = startingBalance > 0 ? totalSpent/startingBalance : 0;
    const needsTotal = ['Bills','Groceries','Transport','Health'].reduce((s,c)=>s+(ct[c]||0),0);
    const dai = {}; transactions.forEach(t => { const d=new Date(t.created_at).toDateString(); dai[d]=(dai[d]||0)+t.amount; });
    const vals=Object.values(dai), avg=vals.reduce((a,b)=>a+b,0)/(vals.length||1);
    const stdDev=Math.sqrt(vals.reduce((a,b)=>a+(b-avg)**2,0)/(vals.length||1));
    const wantsTotal=['Dining','Entertainment','Shopping','Subscriptions'].reduce((s,c)=>s+(ct[c]||0),0);
    const avgTxn=totalSpent/transactions.length;
    return [
        Math.min((needsTotal/totalSpent)/0.5,1)||0.3,
        Math.min(Object.keys(ct).length/8,1),
        Math.max(0,1-stdDev/(avg||1)),
        Math.min((wantsTotal/totalSpent)/0.3,1)||0.2,
        Math.max(0,1-bp),
        Math.min(transactions.length/20,1),
        Math.max(0,1-bp*0.5),
        Math.max(0,1-(avgTxn-15)/200),
    ].map(v=>Math.max(0.1,Math.min(1,v)));
};

const computeHealthScores = (transactions, totalSpent, balance, startingBalance) => {
    if (!transactions.length) return { budget:70, diversification:60, consistency:65, savings:55 };
    const bp = startingBalance>0 ? totalSpent/startingBalance : 0;
    const ct={}; transactions.forEach(t=>{ct[t.category]=(ct[t.category]||0)+t.amount;});
    const dai={}; transactions.forEach(t=>{const d=new Date(t.created_at).toDateString();dai[d]=(dai[d]||0)+t.amount;});
    const vals=Object.values(dai),avg=vals.reduce((a,b)=>a+b,0)/(vals.length||1);
    const stdDev=Math.sqrt(vals.reduce((a,b)=>a+(b-avg)**2,0)/(vals.length||1));
    return {
        budget: Math.round(Math.max(20,100-bp*100)),
        diversification: Math.round(Math.min(100,Object.keys(ct).length*12)),
        consistency: Math.round(Math.max(20,100-(stdDev/avg)*50)),
        savings: Math.round(Math.max(10,(1-bp)*100)),
    };
};

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
const SmartAnalytics = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [balance, setBalance] = useState(0);
    const [totalSpent, setTotalSpent] = useState(0);
    const [startingBalance, setStartingBalance] = useState(0);
    const [activeSection, setActiveSection] = useState('heatmap');

    useEffect(() => {
        const init = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error || !user) { navigate('/login'); return; }
            setUser(user);
            const finance = await getUserFinance(user.id);
            setBalance(finance.balance||0); setTotalSpent(finance.total_expenses||0);
            setStartingBalance((finance.total_income||0)+(finance.balance||0));
            const txns = await getTransactions(user.id, { limit: 200 });
            setTransactions(txns.filter(t=>t.type==='expense'));
            setLoading(false);
        };
        init();
    }, []);

    const expenseTransactions = useMemo(() => transactions.filter(t=>t.type!=='deposit'), [transactions]);
    const dnaScores = useMemo(() => computeDNA(expenseTransactions,totalSpent,balance,startingBalance), [expenseTransactions,totalSpent,balance,startingBalance]);
    const healthScores = useMemo(() => computeHealthScores(expenseTransactions,totalSpent,balance,startingBalance), [expenseTransactions,totalSpent,balance,startingBalance]);
    const overallScore = Math.round((healthScores.budget+healthScores.diversification+healthScores.consistency+healthScores.savings)/4);
    const scoreColor = overallScore>=75?'#10b981':overallScore>=50?'#f59e0b':'#ef4444';
    const scoreLabel = overallScore>=85?'Excellent':overallScore>=70?'Good':overallScore>=55?'Fair':'Needs Work';

    const navSections = [
        { id:'heatmap', icon: Icons.heatmap, label:'Heatmaps' },
        { id:'dna', icon: Icons.dna, label:'DNA' },
        { id:'velocity', icon: Icons.bolt, label:'Velocity' },
        { id:'anomalies', icon: Icons.search, label:'Anomalies' },
        { id:'ai', icon: Icons.robot, label:'AI' },
    ];

    if (loading) return (
        <div className="sa-loading-screen">
            <div className="sa-loading-face-wrap">
                <MiniAIFace size={96} animated={true}/>
                <div className="sa-loading-ring sa-lr-1"/><div className="sa-loading-ring sa-lr-2"/><div className="sa-loading-ring sa-lr-3"/>
            </div>
            <p className="sa-loading-text">Analyzing your financial intelligence...</p>
        </div>
    );

    const hasData = expenseTransactions.length > 0;

    return (
        <div className="sa-page">
            {/* ── HEADER ── */}
            <header className="sa-header">
                <button className="sa-back-btn" onClick={() => navigate('/dashboard')}>
                    <span className="sa-back-icon">{Icons.back}</span>
                    <span className="sa-back-label">Dashboard</span>
                </button>

                <div className="sa-header-center">
                    <div className="sa-header-face">
                        <MiniAIFace size={42} animated={true}/>
                    </div>
                    <div>
                        <h1 className="sa-title">Smart Analytics</h1>
                        <p className="sa-subtitle">Intelligence Layer · Claude AI</p>
                    </div>
                </div>

                <div className="sa-header-score">
                    <div className="sa-score-ring-mini">
                        <svg viewBox="0 0 60 60">
                            <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6"/>
                            <circle cx="30" cy="30" r="24" fill="none" stroke={scoreColor} strokeWidth="6"
                                    strokeDasharray={`${(overallScore/100)*2*Math.PI*24} ${2*Math.PI*24}`}
                                    strokeDashoffset={2*Math.PI*24*0.25} strokeLinecap="round"/>
                            <text x="30" y="34" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="800" fontFamily="system-ui">{overallScore}</text>
                        </svg>
                    </div>
                    <div>
                        <span className="sa-score-label">Financial IQ</span>
                        <span className="sa-score-grade" style={{ color: scoreColor }}>{scoreLabel}</span>
                    </div>
                </div>
            </header>

            {/* ── STATS STRIP ── */}
            <div className="sa-stats-strip">
                {[
                    { label:'Analyzed', val: expenseTransactions.length },
                    { label:'Total Spent', val:`$${totalSpent.toFixed(0)}` },
                    { label:'Categories', val: new Set(expenseTransactions.map(t=>t.category)).size },
                    { label:'Avg Txn', val: expenseTransactions.length>0?`$${(totalSpent/expenseTransactions.length).toFixed(0)}`:'$0' },
                ].map((s,i) => (
                    <React.Fragment key={s.label}>
                        {i>0 && <div className="sa-stat-sep"/>}
                        <div className="sa-stat-pill">
                            <span className="sa-stat-pill-label">{s.label}</span>
                            <span className="sa-stat-pill-val">{s.val}</span>
                        </div>
                    </React.Fragment>
                ))}
            </div>

            {/* ── HEALTH RINGS ── */}
            <div className="sa-health-row">
                <div className="sa-health-card">
                    <HealthScoreRing score={healthScores.budget} label="Budget Control" color={healthScores.budget>=70?'#10b981':healthScores.budget>=50?'#f59e0b':'#ef4444'}/>
                    <HealthScoreRing score={healthScores.diversification} label="Diversification" color="#3b82f6"/>
                    <HealthScoreRing score={healthScores.consistency} label="Consistency" color="#8b5cf6"/>
                    <HealthScoreRing score={healthScores.savings} label="Savings Rate" color="#06b6d4"/>
                </div>
            </div>

            {/* ── DESKTOP SECTION NAV ── */}
            <nav className="sa-section-nav">
                {navSections.map(s => (
                    <button key={s.id} className={`sa-nav-btn ${activeSection===s.id?'active':''}`} onClick={() => setActiveSection(s.id)}>
                        <span className="sa-nav-icon">{s.icon}</span>
                        <span>{s.label}</span>
                    </button>
                ))}
            </nav>

            {/* ── CONTENT ── */}
            <div className="sa-content">

                {/* HEATMAPS */}
                {activeSection==='heatmap' && (
                    <div className="sa-section">
                        <div className="sa-section-grid sa-section-grid--2">
                            <div className="sa-card">
                                <div className="sa-card-header">
                                    <div className="sa-card-icon-wrap">{Icons.clock}</div>
                                    <div><h3 className="sa-card-title">Day × Hour Heatmap</h3><p className="sa-card-sub">When do you spend most?</p></div>
                                </div>
                                {hasData ? <SpendingHeatmap transactions={expenseTransactions}/> : <div className="sa-no-data">Add expenses to see your heatmap</div>}
                            </div>
                            <div className="sa-card">
                                <div className="sa-card-header">
                                    <div className="sa-card-icon-wrap">{Icons.calendar}</div>
                                    <div><h3 className="sa-card-title">Monthly Calendar</h3><p className="sa-card-sub">Daily spend intensity for {MONTHS[new Date().getMonth()]}</p></div>
                                </div>
                                {hasData ? <MonthlyCalendarHeatmap transactions={expenseTransactions}/> : <div className="sa-no-data">Add expenses to see calendar</div>}
                            </div>
                        </div>
                        <div className="sa-card">
                            <div className="sa-card-header">
                                <div className="sa-card-icon-wrap">{Icons.wave}</div>
                                <div><h3 className="sa-card-title">Category Flow Analysis</h3><p className="sa-card-sub">How your money flows across spending categories</p></div>
                            </div>
                            {hasData ? <CategoryFlow transactions={expenseTransactions} totalSpent={totalSpent}/> : <div className="sa-no-data">Add expenses to see flow</div>}
                        </div>
                    </div>
                )}

                {/* DNA */}
                {activeSection==='dna' && (
                    <div className="sa-section">
                        <div className="sa-section-grid sa-section-grid--2">
                            <div className="sa-card">
                                <div className="sa-card-header">
                                    <div className="sa-card-icon-wrap">{Icons.dna}</div>
                                    <div><h3 className="sa-card-title">Spending DNA Profile</h3><p className="sa-card-sub">Your unique financial behavioral fingerprint</p></div>
                                </div>
                                <RadarChart data={dnaScores} labels={['Needs','Diversity','Consistency','Lifestyle','Savings','Frequency','Control','Value']} color="#8b5cf6"/>
                                <div className="sa-dna-legend">
                                    {['Needs','Diversity','Consistency','Lifestyle','Savings','Frequency','Control','Value'].map((label,i) => (
                                        <div key={label} className="sa-dna-legend-row">
                                            <span className="sa-dna-legend-label">{label}</span>
                                            <div className="sa-dna-bar-track"><div className="sa-dna-bar-fill" style={{ width:`${dnaScores[i]*100}%`, background:'#8b5cf6' }}/></div>
                                            <span className="sa-dna-pct">{(dnaScores[i]*100).toFixed(0)}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="sa-card">
                                <div className="sa-card-header">
                                    <div className="sa-card-icon-wrap">{Icons.trophy}</div>
                                    <div><h3 className="sa-card-title">Behavioral Score Cards</h3><p className="sa-card-sub">How you score on key financial behaviors</p></div>
                                </div>
                                <div className="sa-behavior-cards">
                                    {[
                                        { label:'Budget Awareness', score:healthScores.budget, icon:Icons.bulb, desc:healthScores.budget>=70?'Staying within your means':'Try to reduce spending in key areas' },
                                        { label:'Spending Variety', score:healthScores.diversification, icon:Icons.target, desc:healthScores.diversification>=60?'Healthy spread across categories':'Consider tracking more categories' },
                                        { label:'Daily Rhythm', score:healthScores.consistency, icon:Icons.clock, desc:healthScores.consistency>=70?'Predictable, manageable patterns':'High variance in daily spending' },
                                        { label:'Savings Margin', score:healthScores.savings, icon:Icons.money, desc:healthScores.savings>=60?'Good buffer remaining':'Consider reducing discretionary spend' },
                                    ].map(({ label, score, icon, desc }) => {
                                        const color=score>=75?'#10b981':score>=50?'#f59e0b':'#ef4444';
                                        return (
                                            <div key={label} className="sa-behavior-card" style={{ borderColor:`${color}33` }}>
                                                <span className="sa-behavior-icon" style={{ color }}>{icon}</span>
                                                <div className="sa-behavior-info"><span className="sa-behavior-label">{label}</span><span className="sa-behavior-desc">{desc}</span></div>
                                                <div className="sa-behavior-score" style={{ color }}><span className="sa-behavior-val">{score}</span><span className="sa-behavior-denom">/100</span></div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* VELOCITY */}
                {activeSection==='velocity' && (
                    <div className="sa-section">
                        <div className="sa-card">
                            <div className="sa-card-header">
                                <div className="sa-card-icon-wrap" style={{ color:'#06b6d4' }}>{Icons.bolt}</div>
                                <div><h3 className="sa-card-title">Spending Velocity — Last 14 Days</h3><p className="sa-card-sub">Daily burn rate with average baseline</p></div>
                            </div>
                            {hasData ? <VelocityChart transactions={expenseTransactions}/> : <div className="sa-no-data">Add expenses to track velocity</div>}
                        </div>
                        {hasData && (() => {
                            const last7=expenseTransactions.filter(t=>{const d=new Date(t.created_at),c=new Date();c.setDate(c.getDate()-7);return d>=c;});
                            const prev7=expenseTransactions.filter(t=>{const d=new Date(t.created_at),s=new Date(),e=new Date();s.setDate(s.getDate()-14);e.setDate(e.getDate()-7);return d>=s&&d<e;});
                            const l7=last7.reduce((s,t)=>s+t.amount,0),p7=prev7.reduce((s,t)=>s+t.amount,0);
                            const change=p7>0?((l7-p7)/p7*100).toFixed(1):0;
                            const trend=Number(change)<0?'down':Number(change)>0?'up':'flat';
                            const days={}; expenseTransactions.slice(-20).forEach(t=>{const d=new Date(t.created_at).getDay();days[d]=(days[d]||0)+t.amount;});
                            const peakDay=Object.entries(days).sort((a,b)=>b[1]-a[1])[0];
                            return (
                                <div className="sa-section-grid sa-section-grid--3">
                                    {[
                                        { label:'This Week vs Last', val:`${trend==='down'?'↓':trend==='up'?'↑':'→'} ${Math.abs(Number(change))}%`, sub:trend==='down'?'Spending decreased':'Spending increased', color:trend==='down'?'#10b981':'#ef4444', icon:trend==='down'?Icons.chartDown:Icons.chartUp },
                                        { label:'Daily Average', val:`$${(totalSpent/Math.max(expenseTransactions.length,1)*1.2).toFixed(0)}`, sub:'Based on transaction frequency', color:'#3b82f6', icon:Icons.chartBar },
                                        { label:'Peak Spending Day', val:peakDay?DAYS[peakDay[0]]:'N/A', sub:'Highest-spend day of week', color:'#f59e0b', icon:Icons.calendar },
                                    ].map(card => (
                                        <div key={card.label} className="sa-velocity-stat-card">
                                            <span className="sa-vel-card-icon" style={{ color:card.color }}>{card.icon}</span>
                                            <span className="sa-vel-card-label">{card.label}</span>
                                            <span className="sa-vel-card-val" style={{ color:card.color }}>{card.val}</span>
                                            <span className="sa-vel-card-sub">{card.sub}</span>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>
                )}

                {/* ANOMALIES */}
                {activeSection==='anomalies' && (
                    <div className="sa-section">
                        <div className="sa-card">
                            <div className="sa-card-header">
                                <div className="sa-card-icon-wrap">{Icons.search}</div>
                                <div><h3 className="sa-card-title">Anomaly Detection</h3><p className="sa-card-sub">Unusual spends that deviate from your category averages</p></div>
                            </div>
                            {hasData ? <AnomalyList transactions={expenseTransactions}/> : <div className="sa-no-data">Add expenses to detect anomalies</div>}
                        </div>
                        {hasData && (() => {
                            const ct={}; expenseTransactions.forEach(t=>{ct[t.category]=(ct[t.category]||0)+t.amount;});
                            const sorted=Object.entries(ct).sort((a,b)=>b[1]-a[1]);
                            const top=sorted[0],least=sorted[sorted.length-1];
                            return (
                                <div className="sa-section-grid sa-section-grid--2">
                                    <div className="sa-card sa-card--warn">
                                        <div className="sa-card-header">
                                            <div className="sa-card-icon-wrap" style={{ color:'#f59e0b' }}>{Icons.warning}</div>
                                            <div><h3 className="sa-card-title">Highest Risk Category</h3><p className="sa-card-sub">Your biggest spending area to watch</p></div>
                                        </div>
                                        {top && <div className="sa-risk-display">
                                            <div className="sa-risk-cat-name" style={{ color:getCatColor(top[0]) }}>{top[0]}</div>
                                            <div className="sa-risk-amount">${top[1].toFixed(2)}</div>
                                            <div className="sa-risk-pct">{totalSpent>0?((top[1]/totalSpent)*100).toFixed(1):0}% of total</div>
                                            <div className="sa-risk-bar"><div className="sa-risk-bar-fill" style={{ width:`${Math.min((top[1]/totalSpent)*100,100)}%`, background:getCatColor(top[0]) }}/></div>
                                        </div>}
                                    </div>
                                    <div className="sa-card sa-card--good">
                                        <div className="sa-card-header">
                                            <div className="sa-card-icon-wrap" style={{ color:'#10b981' }}>{Icons.check}</div>
                                            <div><h3 className="sa-card-title">Best Controlled Category</h3><p className="sa-card-sub">Where you spend the least proportionally</p></div>
                                        </div>
                                        {least && <div className="sa-risk-display">
                                            <div className="sa-risk-cat-name" style={{ color:'#10b981' }}>{least[0]}</div>
                                            <div className="sa-risk-amount">${least[1].toFixed(2)}</div>
                                            <div className="sa-risk-pct">{totalSpent>0?((least[1]/totalSpent)*100).toFixed(1):0}% of total</div>
                                            <div className="sa-risk-bar"><div className="sa-risk-bar-fill" style={{ width:`${Math.min((least[1]/totalSpent)*100,100)}%`, background:'#10b981' }}/></div>
                                        </div>}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                )}

                {/* AI */}
                {activeSection==='ai' && (
                    <div className="sa-section">
                        <div className="sa-card">
                            <div className="sa-card-header">
                                <div className="sa-card-icon-wrap">{Icons.robot}</div>
                                <div><h3 className="sa-card-title">AI Deep Analysis</h3><p className="sa-card-sub">Claude analyzes your data with contextual financial intelligence</p></div>
                            </div>
                            {hasData
                                ? <AIDeepAnalysis transactions={expenseTransactions} balance={balance} totalSpent={totalSpent} startingBalance={startingBalance}/>
                                : <div className="sa-no-data">Add expenses to unlock AI analysis</div>}
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {!hasData && activeSection==='heatmap' && (
                    <div className="sa-empty-state">
                        <div className="sa-empty-face"><MiniAIFace size={84} animated={true}/></div>
                        <h2>No Transaction Data Yet</h2>
                        <p>Go to your dashboard and add some expenses. Once you do, this page will show you powerful analytics including heatmaps, spending DNA, anomaly detection, and AI-powered insights.</p>
                        <button className="sa-empty-btn" onClick={() => navigate('/dashboard')}>
                            Add Expenses <span className="sa-empty-btn-arrow">{Icons.arrow}</span>
                        </button>
                    </div>
                )}
            </div>

            {/* ── MOBILE BOTTOM NAV ── */}
            <nav className="sa-mobile-bottom-nav">
                {navSections.map(s => (
                    <button key={s.id} className={`sa-mbnav-item ${activeSection===s.id?'active':''}`} onClick={() => setActiveSection(s.id)}>
                        <span className="sa-mbnav-icon">{s.icon}</span>
                        <span className="sa-mbnav-label">{s.label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default SmartAnalytics;