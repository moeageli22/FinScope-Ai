import React, { useState, useEffect, useRef } from 'react';
import './LiveExchangeSection.css';

/* ─── Static ticker data (duplicated for seamless loop) ─── */
const TICKER_DATA = [
    { from: '🇬🇧', to: '🇺🇸', pair: 'GBP/USD', rate: '1.2684', change: '+0.32', up: true },
    { from: '🇪🇺', to: '🇺🇸', pair: 'EUR/USD', rate: '1.0847', change: '-0.15', up: false },
    { from: '🇺🇸', to: '🇯🇵', pair: 'USD/JPY', rate: '149.52', change: '+0.48', up: true },
    { from: '🇬🇧', to: '🇪🇺', pair: 'GBP/EUR', rate: '1.1693', change: '+0.18', up: true },
    { from: '🇦🇺', to: '🇺🇸', pair: 'AUD/USD', rate: '0.6524', change: '-0.22', up: false },
    { from: '🇺🇸', to: '🇨🇦', pair: 'USD/CAD', rate: '1.3641', change: '+0.09', up: true },
    { from: '🇺🇸', to: '🇨🇭', pair: 'USD/CHF', rate: '0.9012', change: '-0.11', up: false },
    { from: '🇳🇿', to: '🇺🇸', pair: 'NZD/USD', rate: '0.6118', change: '+0.07', up: true },
    { from: '🇬🇧', to: '🇦🇪', pair: 'GBP/AED', rate: '4.6572', change: '+0.28', up: true },
    { from: '🇺🇸', to: '🇮🇳', pair: 'USD/INR', rate: '83.47', change: '+0.03', up: true },
    { from: '🇺🇸', to: '🇰🇷', pair: 'USD/KRW', rate: '1328.5', change: '-0.34', up: false },
    { from: '🇪🇺', to: '🇬🇧', pair: 'EUR/GBP', rate: '0.8551', change: '-0.12', up: false },
];

/* ─── Live rates in the demo panel ─── */
const DEMO_PAIRS = [
    { from: '🇬🇧', to: '🇺🇸', pair: 'GBP/USD', base: 1.2684, change: '+0.32', up: true },
    { from: '🇪🇺', to: '🇺🇸', pair: 'EUR/USD', base: 1.0847, change: '-0.15', up: false },
    { from: '🇺🇸', to: '🇯🇵', pair: 'USD/JPY', base: 149.52, change: '+0.48', up: true },
    { from: '🇬🇧', to: '🇪🇺', pair: 'GBP/EUR', base: 1.1693, change: '+0.18', up: true },
    { from: '🇦🇺', to: '🇺🇸', pair: 'AUD/USD', base: 0.6524, change: '-0.22', up: false },
];

const STEPS = [
    {
        icon: '📡',
        color: 'c1',
        num: 'Step 01',
        name: 'Live market data — always fresh',
        desc: 'We pull real-time forex rates every few seconds from global financial markets. No stale numbers — every rate you see is live.',
    },
    {
        icon: '📊',
        color: 'c2',
        num: 'Step 02',
        name: 'Pick your currency pair',
        desc: 'Browse 50+ currencies from major pairs like GBP/USD to exotic ones like KWD/BDT. Search by name or code in seconds.',
    },
    {
        icon: '📈',
        color: 'c3',
        num: 'Step 03',
        name: 'Analyse with interactive charts',
        desc: 'View rate history from 12 hours to 10 years. Hover over any point to see exact rates, spot trends, and time your transactions.',
    },
    {
        icon: '💱',
        color: 'c4',
        num: 'Step 04',
        name: 'Convert with mid-market rates',
        desc: 'Type any amount and get instant conversions using the fairest possible mid-market rate — the same one used between banks.',
    },
];

const FEATURES = [
    { icon: '⚡', cls: 'fi1', fc: 'fc1', name: 'Real-Time Rates', desc: 'Rates update every few seconds from live global forex feeds, not delayed snapshots.' },
    { icon: '🌍', cls: 'fi2', fc: 'fc2', name: '50+ Currencies', desc: 'From USD to YER, covering every major, minor, and emerging-market currency pair.' },
    { icon: '📉', cls: 'fi3', fc: 'fc3', name: 'Historical Charts', desc: 'Interactive sparkline & full charts from 12H to 10Y with hover tooltips and trend indicators.' },
    { icon: '🔄', cls: 'fi4', fc: 'fc4', name: 'Instant Converter', desc: 'Type an amount, pick two currencies — get mid-market conversion with bid/ask spread shown.' },
];

const STATS = [
    { val: '50+', cls: 'sv1', label: 'Currencies Tracked' },
    { val: '3s', cls: 'sv2', label: 'Update Frequency' },
    { val: '10Y', cls: 'sv3', label: 'Historical Data' },
    { val: '0%', cls: 'sv4', label: 'Hidden Fees' },
];

export default function LiveExchangeSection({ onOpenExchange }) {
    const [rates, setRates] = useState(DEMO_PAIRS.map(p => p.base));
    const [flashClass, setFlashClass] = useState(DEMO_PAIRS.map(() => ''));
    const [activeRow, setActiveRow] = useState(0);
    const [convAmount] = useState('1,000');
    const intervalRef = useRef(null);

    /* Simulate live rate fluctuations */
    useEffect(() => {
        intervalRef.current = setInterval(() => {
            const idx = Math.floor(Math.random() * DEMO_PAIRS.length);
            const delta = (Math.random() - 0.5) * 0.002 * DEMO_PAIRS[idx].base;
            const isUp = delta >= 0;

            setRates(prev => {
                const next = [...prev];
                next[idx] = +(prev[idx] + delta).toFixed(prev[idx] > 10 ? 2 : 4);
                return next;
            });

            setFlashClass(prev => {
                const next = [...prev];
                next[idx] = isUp ? 'flash-g' : 'flash-r';
                return next;
            });

            setTimeout(() => {
                setFlashClass(prev => {
                    const next = [...prev];
                    next[idx] = '';
                    return next;
                });
            }, 500);
        }, 2200);

        return () => clearInterval(intervalRef.current);
    }, []);

    /* Auto-rotate active row */
    useEffect(() => {
        const t = setInterval(() => {
            setActiveRow(prev => (prev + 1) % DEMO_PAIRS.length);
        }, 3000);
        return () => clearInterval(t);
    }, []);

    /* Computed conversion — always GBP/USD style */
    const convRate = rates[0];
    const convResult = (1000 * convRate).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    /* Mini sparkline generator */
    const Sparkline = ({ positive }) => {
        const pts = Array.from({ length: 20 }, (_, i) => {
            const base = positive ? 0.4 + (i / 20) * 0.5 : 0.9 - (i / 20) * 0.5;
            return base + (Math.random() - 0.5) * 0.15;
        });
        const max = Math.max(...pts), min = Math.min(...pts);
        const norm = pts.map(p => (p - min) / (max - min || 1));
        const W = 90, H = 28;
        const d = norm.map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i / 19) * W} ${H - v * H}`).join(' ');
        return (
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
                <path d={d} fill="none" stroke={positive ? '#10b981' : '#ef4444'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    };

    return (
        <section className="les-wrapper" id="live-exchange-info">
            {/* Background */}
            <div className="les-bg"><div className="les-grid" /></div>

            <div className="les-container">
                {/* ── Header ── */}
                <div className="les-header">
                    <div className="les-eyebrow">
                        <span className="les-eyebrow-dot" />
                        Live Exchange
                    </div>
                    <h2 className="les-title">
                        Real-time currency data,<br />
                        <span className="les-title-grad">built for everyone</span>
                    </h2>
                    <p className="les-subtitle">
                        Track 50+ currencies with live bid/ask rates, interactive historical charts,
                        and an instant converter — all updating every few seconds.
                    </p>
                </div>

                {/* ── Ticker strip ── */}
                <div className="les-ticker-strip">
                    <div className="les-ticker-track">
                        {/* Duplicate for seamless scroll */}
                        {[...TICKER_DATA, ...TICKER_DATA].map((item, i) => (
                            <div className="les-ticker-card" key={i}>
                                <div className="les-ticker-flags">
                                    <span>{item.from}</span>
                                    <span>{item.to}</span>
                                </div>
                                <span className="les-ticker-pair">{item.pair}</span>
                                <span className="les-ticker-rate">{item.rate}</span>
                                <span className={`les-ticker-change ${item.up ? 'up' : 'down'}`}>
                                    {item.up ? '▲' : '▼'} {item.change}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Stats ── */}
                <div className="les-stats">
                    {STATS.map((s, i) => (
                        <div className="les-stat" key={i}>
                            <div className={`les-stat-val ${s.cls}`}>{s.val}</div>
                            <div className="les-stat-label">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* ── Body: Steps + Demo ── */}
                <div className="les-body">
                    {/* LEFT — steps */}
                    <div className="les-steps-wrap">
                        <div className="les-steps-title">How it works</div>
                        {STEPS.map((s, i) => (
                            <div className="les-step" key={i}>
                                <div className="les-step-icon-wrap">
                                    <div className={`les-step-icon ${s.color}`}>{s.icon}</div>
                                </div>
                                <div className="les-step-content">
                                    <div className="les-step-num">{s.num}</div>
                                    <div className="les-step-name">{s.name}</div>
                                    <div className="les-step-desc">{s.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* RIGHT — demo panel */}
                    <div className="les-demo-wrap">
                        <div className="les-demo-panel">
                            <div className="les-demo-header">
                                <div className="les-demo-title">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="12" y1="1" x2="12" y2="23" />
                                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                    </svg>
                                    Live Exchange Rates
                                </div>
                                <div className="les-demo-live">
                                    <span className="les-demo-live-dot" />
                                    LIVE
                                </div>
                            </div>

                            {/* Rate rows */}
                            <div className="les-demo-rates">
                                {DEMO_PAIRS.map((p, i) => (
                                    <div
                                        key={i}
                                        className={`les-demo-rate-row ${activeRow === i ? 'active' : ''}`}
                                        onMouseEnter={() => setActiveRow(i)}
                                    >
                                        <div className="les-demo-rate-flags">
                                            <span>{p.from}</span>
                                            <span>{p.to}</span>
                                        </div>
                                        <span className="les-demo-rate-pair">{p.pair}</span>
                                        <span className={`les-demo-rate-val ${flashClass[i]}`}>
                                            {rates[i].toFixed(rates[i] > 10 ? 2 : 4)}
                                        </span>
                                        <div className="les-demo-chart-inline">
                                            <Sparkline positive={p.up} />
                                        </div>
                                        <span className={`les-demo-rate-badge ${p.up ? 'pos' : 'neg'}`}>
                                            {p.up ? '▲' : '▼'} {p.change}%
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Mini converter */}
                            <div className="les-demo-converter">
                                <div className="les-demo-conv-input">
                                    <span className="les-demo-conv-cur">GBP</span>
                                    {convAmount}
                                </div>
                                <div className="les-demo-conv-arrow">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </div>
                                <div className="les-demo-conv-result">
                                    <span className="les-demo-conv-cur" style={{ color: 'rgba(16,185,129,0.6)' }}>USD</span>
                                    {convResult}
                                </div>
                            </div>

                            {/* Chart label */}
                            <div className="les-demo-chart-wrap">
                                <div className="les-demo-chart-label">GBP/USD — 30 Day Trend</div>
                                <TrendChart />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Feature pillars ── */}
                <div className="les-features">
                    {FEATURES.map((f, i) => (
                        <div className={`les-feat-card ${f.fc}`} key={i}>
                            <div className={`les-feat-icon ${f.cls}`}>{f.icon}</div>
                            <div className="les-feat-name">{f.name}</div>
                            <div className="les-feat-desc">{f.desc}</div>
                        </div>
                    ))}
                </div>

                {/* ── CTA ── */}
                <div className="les-cta">
                    <div className="les-cta-text">Ready to explore live rates?</div>
                    <div className="les-cta-sub">No account needed — open the exchange and start converting instantly.</div>
                    <button className="les-cta-btn" onClick={onOpenExchange}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M7 16V4M7 4L3 8M7 4L11 8" /><path d="M17 8V20M17 20L21 16M17 20L13 16" />
                        </svg>
                        Open Live Exchange
                    </button>
                </div>
            </div>
        </section>
    );
}

/* ── Static 30-day trend SVG chart ── */
function TrendChart() {
    const W = 600, H = 80;
    const raw = [
        62, 58, 64, 70, 67, 73, 69, 75, 72, 78, 74, 80, 77, 82, 79,
        85, 81, 87, 84, 90, 86, 91, 88, 93, 89, 94, 91, 96, 93, 97
    ];
    const max = Math.max(...raw), min = Math.min(...raw);
    const pts = raw.map((v, i) => [
        (i / (raw.length - 1)) * W,
        H - ((v - min) / (max - min)) * H
    ]);
    const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
    const area = `${line} L ${W} ${H} L 0 ${H} Z`;

    return (
        <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
            <defs>
                <linearGradient id="lesAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={area} fill="url(#lesAreaGrad)" />
            <path d={line} fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}