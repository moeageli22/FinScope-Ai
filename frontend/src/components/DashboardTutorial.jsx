import React, { useState, useEffect, useCallback, useRef } from 'react';
import FinScopeAI from './FinScopeAI';
import './DashboardTutorial.css';

/* ─────────────────────────────────────────────
   MINI ORB - lightweight animated avatar
   Matches FinScopeAI look without the full component
   ───────────────────────────────────────────── */
const MiniOrb = ({ size = 28 }) => (
    <div className="mini-orb" style={{ width: size, height: size }}>
        <div className="mini-orb-inner">
            <div className="mini-orb-eye mini-orb-eye-l" />
            <div className="mini-orb-eye mini-orb-eye-r" />
        </div>
        <div className="mini-orb-shine" />
    </div>
);


/* ─────────────────────────────────────────────
   STEP VISUAL COMPONENTS
   ───────────────────────────────────────────── */

// Step 1: Demo Mode - Animated balance counter
const DemoModeVisual = () => {
    const [balance, setBalance] = useState(0);
    const targetBalance = 25000;

    useEffect(() => {
        let frame;
        const start = performance.now();
        const duration = 2000;
        const animate = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setBalance(Math.floor(eased * targetBalance));
            if (progress < 1) frame = requestAnimationFrame(animate);
        };
        frame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame);
    }, []);

    return (
        <div className="demo-visual">
            <div className="demo-wallet">
                <div className="demo-wallet-header">
                    <div className="demo-wallet-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                            <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                            <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" />
                        </svg>
                    </div>
                    <span className="demo-wallet-label">Virtual Wallet</span>
                    <span className="demo-wallet-badge">DEMO</span>
                </div>
                <div className="demo-wallet-balance">
                    <span className="demo-currency">£</span>
                    <span className="demo-amount">{balance.toLocaleString()}</span>
                    <span className="demo-decimals">.00</span>
                </div>
                <div className="demo-wallet-actions">
                    <div className="demo-action-chip"><div className="demo-chip-dot demo-chip-green" />Risk-Free</div>
                    <div className="demo-action-chip"><div className="demo-chip-dot demo-chip-blue" />Resettable</div>
                    <div className="demo-action-chip"><div className="demo-chip-dot demo-chip-purple" />Realistic</div>
                </div>
            </div>
            <div className="demo-floating-cards">
                <div className="demo-float-card demo-float-1"><span>🛒</span> Groceries <span className="demo-float-amount">-£42.50</span></div>
                <div className="demo-float-card demo-float-2"><span>💼</span> Salary <span className="demo-float-amount demo-float-income">+£3,200</span></div>
                <div className="demo-float-card demo-float-3"><span>☕</span> Coffee <span className="demo-float-amount">-£4.80</span></div>
            </div>
        </div>
    );
};

// Step 2: Transactions
const TransactionsVisual = () => {
    const [visibleItems, setVisibleItems] = useState(0);
    const transactions = [
        { icon: '💼', name: 'Monthly Salary', amount: '+£3,200.00', type: 'income', cat: 'Income' },
        { icon: '🏠', name: 'Rent Payment', amount: '-£950.00', type: 'expense', cat: 'Housing' },
        { icon: '🛒', name: 'Tesco Groceries', amount: '-£67.40', type: 'expense', cat: 'Food' },
        { icon: '💪', name: 'Gym Membership', amount: '-£29.99', type: 'expense', cat: 'Health' },
        { icon: '📱', name: 'Freelance Work', amount: '+£450.00', type: 'income', cat: 'Income' },
    ];

    useEffect(() => {
        const timers = transactions.map((_, i) =>
            setTimeout(() => setVisibleItems(i + 1), 300 + i * 400)
        );
        return () => timers.forEach(clearTimeout);
    }, []);

    return (
        <div className="txn-visual">
            <div className="txn-feed">
                {transactions.map((txn, i) => (
                    <div key={i} className={`txn-row ${i < visibleItems ? 'txn-visible' : ''}`}>
                        <div className="txn-icon">{txn.icon}</div>
                        <div className="txn-details">
                            <span className="txn-name">{txn.name}</span>
                            <span className="txn-cat">{txn.cat}</span>
                        </div>
                        <div className={`txn-amount ${txn.type}`}>{txn.amount}</div>
                    </div>
                ))}
            </div>
            <div className="txn-auto-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                Auto-categorised by AI
            </div>
        </div>
    );
};

// Step 3: Analytics
const AnalyticsVisual = () => {
    const [chartProgress, setChartProgress] = useState(0);
    const barHeights = [35, 55, 45, 70, 60, 85, 75];
    const barLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const donutSegments = [
        { pct: 35, color: '#3b82f6', label: 'Housing' },
        { pct: 25, color: '#8b5cf6', label: 'Food' },
        { pct: 20, color: '#06b6d4', label: 'Transport' },
        { pct: 12, color: '#10b981', label: 'Fun' },
        { pct: 8, color: '#f59e0b', label: 'Other' },
    ];

    useEffect(() => {
        let frame;
        const start = performance.now();
        const duration = 1500;
        const animate = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setChartProgress(eased);
            if (progress < 1) frame = requestAnimationFrame(animate);
        };
        frame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame);
    }, []);

    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    let cumulativeOffset = 0;

    return (
        <div className="analytics-visual">
            <div className="analytics-header">
                <div className="analytics-stat">
                    <span className="analytics-stat-label">Income</span>
                    <span className="analytics-stat-value analytics-income">£3,650</span>
                </div>
                <div className="analytics-stat">
                    <span className="analytics-stat-label">Expenses</span>
                    <span className="analytics-stat-value analytics-expense">£1,890</span>
                </div>
                <div className="analytics-stat">
                    <span className="analytics-stat-label">Saved</span>
                    <span className="analytics-stat-value analytics-saved">£1,760</span>
                </div>
            </div>

            <div className="analytics-charts-row">
                <div className="analytics-bar-card">
                    <div className="chart-label">Weekly Spending</div>
                    <div className="bar-container">
                        {barHeights.map((h, i) => (
                            <div key={i} className="bar-col">
                                <div
                                    className="bar-fill"
                                    style={{
                                        height: `${h * chartProgress}%`,
                                        background: i === 5 ? 'linear-gradient(180deg, #8b5cf6, #6366f1)' : 'linear-gradient(180deg, #3b82f6, #2563eb)',
                                    }}
                                />
                                <span className="bar-label">{barLabels[i]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="analytics-donut-card">
                    <div className="chart-label">Categories</div>
                    <div className="donut-and-legend">
                        <svg viewBox="0 0 100 100" className="donut-svg" width="90" height="90">
                            {donutSegments.map((seg, i) => {
                                const dashLength = (seg.pct / 100) * circumference * chartProgress;
                                const gapLength = circumference - dashLength;
                                const offset = cumulativeOffset;
                                cumulativeOffset += (seg.pct / 100) * circumference;
                                return (
                                    <circle
                                        key={i}
                                        cx="50" cy="50" r={radius}
                                        fill="none"
                                        stroke={seg.color}
                                        strokeWidth="7"
                                        strokeDasharray={`${dashLength} ${gapLength}`}
                                        strokeDashoffset={-offset}
                                        strokeLinecap="round"
                                        style={{ transition: 'all 1.2s cubic-bezier(0.22, 1, 0.36, 1)', transitionDelay: `${i * 0.1}s` }}
                                    />
                                );
                            })}
                            <text x="50" y="47" textAnchor="middle" fill="white" fontSize="14" fontWeight="700">48%</text>
                            <text x="50" y="59" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7" fontWeight="500">saved</text>
                        </svg>
                        <div className="donut-legend">
                            {donutSegments.map((seg, i) => (
                                <div key={i} className="legend-item">
                                    <div className="legend-dot" style={{ background: seg.color }} />
                                    <span>{seg.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="analytics-trend">
                <svg viewBox="0 0 200 36" className="trend-svg">
                    <defs>
                        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path
                        d="M0,28 Q20,26 40,22 T80,16 T120,20 T160,10 T200,6"
                        fill="none" stroke="#3b82f6" strokeWidth="2"
                        strokeDasharray="300"
                        strokeDashoffset={300 - 300 * chartProgress}
                        style={{ transition: 'stroke-dashoffset 2s ease' }}
                    />
                    <path
                        d="M0,28 Q20,26 40,22 T80,16 T120,20 T160,10 T200,6 L200,36 L0,36 Z"
                        fill="url(#trendGrad)"
                        opacity={chartProgress}
                        style={{ transition: 'opacity 1s ease 0.5s' }}
                    />
                </svg>
                <div className="trend-label"><span className="trend-up">↑ 12%</span> savings this month</div>
            </div>
        </div>
    );
};

// Step 4: AI Chat
const AIChatVisual = () => {
    const [visibleMessages, setVisibleMessages] = useState(0);
    const [typing, setTyping] = useState(false);
    const chatRef = useRef(null);

    const messages = [
        { role: 'user', text: "How am I doing this month?" },
        { role: 'ai', text: "Great news! You've saved 48% of your income — £1,760. That's 12% above your target! 🎯" },
        { role: 'user', text: "Where can I cut back?" },
        { role: 'ai', text: "I noticed £86 on takeaway coffee. Switching to 3x/week saves £140/month. Want me to set an alert? ☕" },
        { role: 'user', text: "Yes! Any investment tips?" },
        { role: 'ai', text: "With your surplus, I'd suggest a diversified index fund. Your emergency fund covers 4 months — solid! 📈" },
    ];

    useEffect(() => {
        const timers = [];
        let delay = 600;

        messages.forEach((msg, i) => {
            if (msg.role === 'ai') {
                timers.push(setTimeout(() => setTyping(true), delay));
                delay += 1200;
                timers.push(setTimeout(() => {
                    setTyping(false);
                    setVisibleMessages(i + 1);
                }, delay));
                delay += 500;
            } else {
                timers.push(setTimeout(() => setVisibleMessages(i + 1), delay));
                delay += 800;
            }
        });

        return () => timers.forEach(clearTimeout);
    }, []);

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [visibleMessages, typing]);

    return (
        <div className="chat-visual">
            <div className="chat-window">
                <div className="chat-topbar">
                    <MiniOrb size={32} />
                    <div className="chat-topbar-info">
                        <span className="chat-topbar-name">FinScope AI</span>
                        <span className="chat-topbar-status"><span className="chat-status-dot" />Online</span>
                    </div>
                </div>

                <div className="chat-messages" ref={chatRef}>
                    {messages.slice(0, visibleMessages).map((msg, i) => (
                        <div key={i} className={`chat-msg chat-${msg.role}`}>
                            {msg.role === 'ai' && <MiniOrb size={22} />}
                            <div className={`chat-bubble chat-bubble-${msg.role}`}>{msg.text}</div>
                        </div>
                    ))}

                    {typing && (
                        <div className="chat-msg chat-ai">
                            <MiniOrb size={22} />
                            <div className="chat-bubble chat-bubble-ai chat-typing">
                                <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="chat-inputbar">
                    <div className="chat-input-placeholder">Ask FinScope anything...</div>
                    <div className="chat-send-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Step 5: Live Exchange
const LiveExchangeVisual = () => {
    const [visibleRows, setVisibleRows] = useState(0);
    const [rateFlicker, setRateFlicker] = useState({});

    const pairs = [
        { from: '🇬🇧', fromCode: 'GBP', to: '🇺🇸', toCode: 'USD', rate: '1.2684', change: '+0.32', positive: true },
        { from: '🇪🇺', fromCode: 'EUR', to: '🇺🇸', toCode: 'USD', rate: '1.0847', change: '-0.15', positive: false },
        { from: '🇺🇸', fromCode: 'USD', to: '🇯🇵', toCode: 'JPY', rate: '149.52', change: '+0.48', positive: true },
        { from: '🇬🇧', fromCode: 'GBP', to: '🇪🇺', toCode: 'EUR', rate: '1.1693', change: '+0.18', positive: true },
    ];

    const sparklines = [
        [4, 6, 5, 8, 7, 10, 9, 12, 11, 14],
        [10, 9, 11, 8, 7, 9, 6, 8, 5, 7],
        [3, 5, 4, 7, 9, 8, 11, 10, 13, 14],
        [6, 7, 5, 8, 9, 7, 10, 11, 9, 12],
    ];

    useEffect(() => {
        const timers = pairs.map((_, i) =>
            setTimeout(() => setVisibleRows(i + 1), 300 + i * 350)
        );
        return () => timers.forEach(clearTimeout);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            const idx = Math.floor(Math.random() * pairs.length);
            setRateFlicker(prev => ({ ...prev, [idx]: true }));
            setTimeout(() => setRateFlicker(prev => ({ ...prev, [idx]: false })), 600);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const renderSparkline = (data, positive) => {
        const w = 60, h = 20;
        const max = Math.max(...data);
        const min = Math.min(...data);
        const range = max - min || 1;
        const points = data.map((v, i) => {
            const x = (i / (data.length - 1)) * w;
            const y = h - ((v - min) / range) * h;
            return `${x},${y}`;
        }).join(' ');
        return (
            <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="exchange-sparkline">
                <polyline
                    points={points}
                    fill="none"
                    stroke={positive ? '#10b981' : '#ef4444'}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        );
    };

    return (
        <div className="exchange-visual">
            <div className="exchange-panel">
                <div className="exchange-panel-header">
                    <div className="exchange-panel-title">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="1" x2="12" y2="23" />
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                        <span>Live Exchange</span>
                    </div>
                    <div className="exchange-panel-live">
                        <span className="exchange-live-dot" />
                        <span>Live</span>
                    </div>
                </div>

                <div className="exchange-table-head">
                    <span className="exchange-th exchange-th-pair">Pair</span>
                    <span className="exchange-th">Rate</span>
                    <span className="exchange-th">24h</span>
                    <span className="exchange-th exchange-th-chart">Chart</span>
                </div>

                <div className="exchange-table-body">
                    {pairs.map((pair, i) => (
                        <div
                            key={i}
                            className={`exchange-row ${i < visibleRows ? 'exchange-row-visible' : ''} ${rateFlicker[i] ? 'exchange-row-flicker' : ''}`}
                        >
                            <div className="exchange-pair-cell">
                                <div className="exchange-flags">
                                    <span className="exchange-flag">{pair.from}</span>
                                    <span className="exchange-flag-sep">/</span>
                                    <span className="exchange-flag">{pair.to}</span>
                                </div>
                                <span className="exchange-pair-code">{pair.fromCode}/{pair.toCode}</span>
                            </div>
                            <div className={`exchange-rate-cell ${rateFlicker[i] ? (pair.positive ? 'rate-flash-green' : 'rate-flash-red') : ''}`}>
                                {pair.rate}
                            </div>
                            <div className={`exchange-change-cell ${pair.positive ? 'exchange-positive' : 'exchange-negative'}`}>
                                <span className="exchange-change-badge">
                                    {pair.positive ? '▲' : '▼'} {pair.change}%
                                </span>
                            </div>
                            <div className="exchange-chart-cell">
                                {renderSparkline(sparklines[i], pair.positive)}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="exchange-panel-footer">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M7 16V4M7 4L3 8M7 4L11 8" />
                        <path d="M17 8V20M17 20L21 16M17 20L13 16" />
                    </svg>
                    <span>50+ currencies · Real-time data · Charts & converter</span>
                </div>
            </div>
        </div>
    );
};

// Step 6: Ready
const ReadyVisual = () => {
    const [show, setShow] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setShow(true), 300);
        return () => clearTimeout(t);
    }, []);

    const features = [
        { icon: '🎮', label: 'Demo Mode', color: '#8b5cf6' },
        { icon: '💸', label: 'Transactions', color: '#3b82f6' },
        { icon: '📊', label: 'Analytics', color: '#06b6d4' },
        { icon: '🤖', label: 'AI Advisor', color: '#10b981' },
        { icon: '💱', label: 'Live Exchange', color: '#f59e0b' },
    ];

    return (
        <div className={`ready-visual ${show ? 'ready-show' : ''}`}>
            <div className="ready-badge">
                <div className="ready-badge-ring" />
                <span className="ready-badge-icon">🚀</span>
            </div>
            <div className="ready-features">
                {features.map((f, i) => (
                    <div key={i} className="ready-feature-pill"
                         style={{ borderColor: `${f.color}33`, background: `${f.color}0d`, animationDelay: `${0.4 + i * 0.15}s` }}>
                        <span>{f.icon}</span><span>{f.label}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                    </div>
                ))}
            </div>
        </div>
    );
};


/* ─────────────────────────────────────
   MAIN TUTORIAL COMPONENT
   ───────────────────────────────────── */

const DashboardTutorial = ({ onComplete, onSkip }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [animKey, setAnimKey] = useState(0);

    const tutorialSteps = [
        { id: 'welcome', title: 'Welcome to FinScope AI', subtitle: 'Your intelligent financial companion', description: 'Let me give you a quick tour of everything you can do. It only takes a minute.', visual: 'orb' },
        { id: 'demo-mode', title: 'Try Demo Mode', subtitle: 'Risk-free exploration', description: 'Start with a virtual balance and simulate real financial scenarios — no real money needed.', visual: 'demo' },
        { id: 'transactions', title: 'Track Every Penny', subtitle: 'Smart categorisation', description: 'Add income and expenses effortlessly. Our AI auto-categorises everything.', visual: 'transactions' },
        { id: 'analytics', title: 'Beautiful Insights', subtitle: 'Charts that tell your story', description: 'Watch your financial story unfold through stunning charts and real-time analytics.', visual: 'analytics' },
        { id: 'ai-assistant', title: 'Meet Your AI Advisor', subtitle: 'Like having a financial expert on call', description: 'Chat naturally with FinScope AI for personalised insights and guidance.', visual: 'chat' },
        { id: 'live-exchange', title: 'Live Currency Exchange', subtitle: 'Real-time market data at your fingertips', description: 'Track 50+ currencies with live rates, interactive charts, and a built-in converter — all updated in real time.', visual: 'exchange' },
        { id: 'ready', title: "You're All Set!", subtitle: 'Everything unlocked', description: 'Start your financial journey now. Re-open this tutorial anytime from the header.', visual: 'ready' },
    ];

    const currentStepData = tutorialSteps[currentStep];
    const isLastStep = currentStep === tutorialSteps.length - 1;
    const isFirstStep = currentStep === 0;

    const goToStep = useCallback((newStep) => {
        if (newStep >= 0 && newStep < tutorialSteps.length) {
            setCurrentStep(newStep);
            setAnimKey(prev => prev + 1);
        }
    }, [tutorialSteps.length]);

    const handleNext = useCallback(() => {
        if (isLastStep) { localStorage.setItem('finscope_tutorial_completed', 'true'); onComplete(); }
        else goToStep(currentStep + 1);
    }, [isLastStep, currentStep, goToStep, onComplete]);

    const handlePrevious = useCallback(() => {
        if (!isFirstStep) goToStep(currentStep - 1);
    }, [isFirstStep, currentStep, goToStep]);

    const handleSkipTutorial = useCallback(() => {
        localStorage.setItem('finscope_tutorial_completed', 'true');
        onSkip();
    }, [onSkip]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight' || e.key === 'Enter') handleNext();
            else if (e.key === 'ArrowLeft') handlePrevious();
            else if (e.key === 'Escape') handleSkipTutorial();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNext, handlePrevious, handleSkipTutorial]);

    const renderVisual = () => {
        switch (currentStepData.visual) {
            case 'orb': return <div className="tutorial-orb"><FinScopeAI /></div>;
            case 'demo': return <DemoModeVisual />;
            case 'transactions': return <TransactionsVisual />;
            case 'analytics': return <AnalyticsVisual />;
            case 'chat': return <AIChatVisual />;
            case 'exchange': return <LiveExchangeVisual />;
            case 'ready': return <ReadyVisual />;
            default: return null;
        }
    };

    return (
        <div className="tutorial-overlay" role="dialog" aria-modal="true" aria-label="Dashboard tutorial">
            <div className="tutorial-background" />
            <div className="tutorial-modal">
                <div className="tutorial-progress" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={tutorialSteps.length}>
                    {tutorialSteps.map((_, index) => (
                        <div key={index} className={`progress-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`} />
                    ))}
                </div>
                <button className="tutorial-skip" onClick={handleSkipTutorial} aria-label="Skip tutorial">Skip</button>

                <div className="tutorial-content" key={animKey}>
                    <div className="tutorial-visual-area">{renderVisual()}</div>
                    <div className="tutorial-text">
                        <div className="tutorial-step-number">Step {currentStep + 1} of {tutorialSteps.length}</div>
                        <h2 className="tutorial-title">{currentStepData.title}</h2>
                        <p className="tutorial-subtitle">{currentStepData.subtitle}</p>
                        <p className="tutorial-description">{currentStepData.description}</p>
                    </div>
                </div>

                <div className="tutorial-navigation">
                    <button className="btn-tutorial-nav btn-previous" onClick={handlePrevious} disabled={isFirstStep} aria-label="Previous step">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>Back
                    </button>
                    <button className="btn-tutorial-nav btn-next" onClick={handleNext} aria-label={isLastStep ? 'Get started' : 'Next step'}>
                        {isLastStep ? "Let's Go!" : 'Next'}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </button>
                </div>
                <div className="tutorial-hint">Use arrow keys to navigate · Esc to skip</div>
            </div>
        </div>
    );
};

export default DashboardTutorial;