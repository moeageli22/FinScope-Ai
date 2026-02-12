import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import UserMenu from '../components/UserMenu';
import FinScopeAI from '../components/FinScopeAI';
import AIAssistant from '../components/AIAssistant';
import DashboardTutorial from '../components/DashboardTutorial';
import './Dashboard-Enhanced.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAIAssistant, setShowAIAssistant] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);

    useEffect(() => { checkUser(); }, []);

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
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) { setLoading(false); navigate('/login'); return; }
            setUser(user);
            try {
                const { data: profileData } = await supabase.from('user_profiles').select('*').eq('id', user.id).single();
                if (profileData) setProfile(profileData);
            } catch (e) { /* non-critical */ }
            setLoading(false);
        } catch (error) { setLoading(false); navigate('/login'); }
    };

    const handleLeave = () => navigate('/');
    const openAIAssistant = () => setShowAIAssistant(true);
    const closeAIAssistant = () => setShowAIAssistant(false);
    const restartTutorial = () => setShowTutorial(true);

    const getUserDisplayName = () => {
        if (profile?.first_name && profile?.last_name) return `${profile.first_name} ${profile.last_name}`;
        if (profile?.username) return profile.username;
        if (user?.email) return user.email.split('@')[0];
        return 'User';
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-orb"><FinScopeAI /></div>
                <p className="loading-text">Loading your dashboard...</p>
            </div>
        );
    }

    if (!user) { navigate('/login'); return null; }

    return (
        <div className="dashboard">
            {showTutorial && (
                <DashboardTutorial onComplete={() => setShowTutorial(false)} onSkip={() => setShowTutorial(false)} />
            )}

            {/* Header */}
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
                        <button className="btn-tutorial" onClick={restartTutorial}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
                            <span>Tutorial</span>
                        </button>
                        <button className="btn-ai-assistant" onClick={openAIAssistant}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                            <span>Ask FinScope AI</span>
                        </button>
                        <button className="btn-leave" onClick={handleLeave}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                            <span>Home</span>
                        </button>
                        <UserMenu />
                    </div>

                    <button className="mobile-menu-toggle mobile-only" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {mobileMenuOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
                        </svg>
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div className="mobile-menu">
                        <button className="mobile-menu-item" onClick={() => { restartTutorial(); setMobileMenuOpen(false); }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
                            <span>Tutorial</span>
                        </button>
                        <button className="mobile-menu-item" onClick={() => { openAIAssistant(); setMobileMenuOpen(false); }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                            <span>Ask FinScope AI</span>
                        </button>
                        <button className="mobile-menu-item" onClick={() => { navigate('/practice'); setMobileMenuOpen(false); }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                            <span>Practice Mode</span>
                        </button>
                        <button className="mobile-menu-item" onClick={() => { handleLeave(); setMobileMenuOpen(false); }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
                            <span>Home</span>
                        </button>
                        <div className="mobile-menu-divider"></div>
                        <UserMenu />
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="dashboard-main">
                <div className="dashboard-container">

                    {/* ═══ PRACTICE MODE CTA BANNER ═══ */}
                    <div className="practice-cta-banner" onClick={() => navigate('/practice')}>
                        <div className="practice-cta-left">
                            <div className="practice-cta-orb">
                                <div className="practice-cta-orb-inner">
                                    <div className="pcta-eye" />
                                    <div className="pcta-eye" />
                                </div>
                                <div className="practice-cta-orb-shine" />
                            </div>
                            <div className="practice-cta-text">
                                <div className="practice-cta-badge-row">
                                    <span className="practice-cta-badge">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                        </svg>
                                        NEW
                                    </span>
                                </div>
                                <h3 className="practice-cta-title">Try Practice Mode</h3>
                                <p className="practice-cta-desc">
                                    Learn to manage money with virtual funds — simulate purchases, track spending, and get AI insights. No real money at risk!
                                </p>
                            </div>
                        </div>
                        <button className="practice-cta-btn" onClick={(e) => { e.stopPropagation(); navigate('/practice'); }}>
                            Start Practicing
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="stats-row">
                        <div className="stat-card balance">
                            <div className="stat-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                            </div>
                            <div className="stat-content">
                                <div className="stat-label">Total Balance</div>
                                <div className="stat-value">$0.00</div>
                                <div className="stat-change positive">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                                    +0% from last month
                                </div>
                            </div>
                        </div>
                        <div className="stat-card spending">
                            <div className="stat-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                            </div>
                            <div className="stat-content">
                                <div className="stat-label">Monthly Spending</div>
                                <div className="stat-value">$0.00</div>
                                <div className="stat-change negative">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></svg>
                                    -0% from last month
                                </div>
                            </div>
                        </div>
                        <div className="stat-card savings">
                            <div className="stat-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                            </div>
                            <div className="stat-content">
                                <div className="stat-label">Savings Goal</div>
                                <div className="stat-value">$0.00</div>
                                <div className="stat-change neutral">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                                    +0% progress
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="charts-row">
                        <div className="chart-card spending-trend">
                            <div className="chart-header"><h3>Spending Trend</h3></div>
                            <div className="chart-content">
                                <div className="empty-chart">
                                    <svg viewBox="0 0 600 250" className="line-chart-svg" preserveAspectRatio="none">
                                        <defs>
                                            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" /><stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" /></linearGradient>
                                            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" /><stop offset="100%" stopColor="#0a0e27" stopOpacity="0" /></linearGradient>
                                        </defs>
                                        <path d="M 20 200 Q 120 180, 180 150 T 340 120 T 500 80 L 580 60" stroke="url(#lineGradient)" strokeWidth="3" fill="none" strokeLinecap="round" />
                                        <path d="M 20 200 Q 120 180, 180 150 T 340 120 T 500 80 L 580 60 L 580 250 L 20 250 Z" fill="url(#areaGradient)" />
                                    </svg>
                                    <div className="chart-labels"><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span></div>
                                </div>
                            </div>
                        </div>
                        <div className="chart-card spending-category">
                            <div className="chart-header"><h3>Spending by Category</h3></div>
                            <div className="chart-content">
                                <div className="donut-chart-container">
                                    <svg viewBox="0 0 200 200" className="donut-svg">
                                        <circle cx="100" cy="100" r="70" fill="none" stroke="#3b82f6" strokeWidth="25" strokeDasharray="138 440" transform="rotate(-90 100 100)" />
                                        <circle cx="100" cy="100" r="70" fill="none" stroke="#8b5cf6" strokeWidth="25" strokeDasharray="110 440" strokeDashoffset="-138" transform="rotate(-90 100 100)" />
                                        <circle cx="100" cy="100" r="70" fill="none" stroke="#06b6d4" strokeWidth="25" strokeDasharray="88 440" strokeDashoffset="-248" transform="rotate(-90 100 100)" />
                                        <circle cx="100" cy="100" r="70" fill="none" stroke="#a78bfa" strokeWidth="25" strokeDasharray="104 440" strokeDashoffset="-336" transform="rotate(-90 100 100)" />
                                    </svg>
                                </div>
                                <div className="category-legend">
                                    <div className="legend-row">
                                        <div className="legend-item"><span className="legend-dot food"></span><span>Food & Dining</span></div>
                                        <div className="legend-item"><span className="legend-dot transport"></span><span>Transport</span></div>
                                    </div>
                                    <div className="legend-row">
                                        <div className="legend-item"><span className="legend-dot shopping"></span><span>Shopping</span></div>
                                        <div className="legend-item"><span className="legend-dot bills"></span><span>Bills & Utilities</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row */}
                    <div className="bottom-row">
                        <div className="transactions-card">
                            <div className="section-header"><h3>Recent Transactions</h3></div>
                            <div className="transactions-list">
                                <div className="empty-state">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                                    <p>No transactions yet</p>
                                    <span>Your recent transactions will appear here</span>
                                </div>
                            </div>
                            <button className="view-all-btn">View All Transactions</button>
                        </div>
                        <div className="insights-card">
                            <div className="section-header">
                                <div className="ai-badge"><FinScopeAI /></div>
                                <h3>AI Insights</h3>
                            </div>
                            <div className="insights-list">
                                <div className="insight-item smart-tip"><h4>Smart Savings Tip</h4><p>Connect your accounts to receive personalized financial insights and recommendations.</p></div>
                                <div className="insight-item goal-progress"><h4>Goal Progress</h4><p>Set up your savings goals to track your progress and stay motivated.</p></div>
                                <div className="insight-item reminder"><h4>Bill Reminder</h4><p>Add your bills to get timely reminders and never miss a payment.</p></div>
                            </div>
                            <button className="insights-btn" onClick={openAIAssistant}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                                Ask FinScope AI
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <button className="floating-ai-btn mobile-only" onClick={openAIAssistant}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            </button>
            {showAIAssistant && <AIAssistant onClose={closeAIAssistant} user={user} />}
        </div>
    );
};

export default Dashboard;