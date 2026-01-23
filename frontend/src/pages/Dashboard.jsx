import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import UserMenu from '../components/UserMenu';
import FinScopeAI from '../components/FinScopeAI';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                navigate('/login');
                return;
            }

            setUser(user);
            setLoading(false);
        } catch (error) {
            console.error('Error checking user:', error);
            navigate('/login');
        }
    };

    const handleLeave = () => {
        // Just navigate to home without signing out
        navigate('/');
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            {/* Header */}
            <header className="dashboard-header">
                <div className="dashboard-header-left">
                    <div className="dashboard-logo">
                        <FinScopeAI />
                    </div>
                </div>

                <div className="dashboard-header-right">
                    <button className="btn-leave" onClick={handleLeave}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                        Leave
                    </button>
                    <UserMenu />
                </div>
            </header>

            {/* Main Content */}
            <main className="dashboard-main">
                <div className="dashboard-container">
                    {/* Welcome Section */}
                    <div className="welcome-section">
                        <h1>Welcome Back!</h1>
                        <p>Here's your financial overview</p>
                    </div>

                    {/* Quick Actions Grid */}
                    <div className="quick-actions-grid">
                        <button className="action-card" onClick={() => navigate('/')}>
                            <div className="action-icon home-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                    <polyline points="9 22 9 12 15 12 15 22" />
                                </svg>
                            </div>
                            <div className="action-content">
                                <h3>Home</h3>
                                <p>Return to homepage</p>
                            </div>
                        </button>

                        <button className="action-card" onClick={() => alert('Transactions feature coming soon!')}>
                            <div className="action-icon transactions-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="1" x2="12" y2="23" />
                                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                </svg>
                            </div>
                            <div className="action-content">
                                <h3>Transactions</h3>
                                <p>View your transactions</p>
                            </div>
                        </button>

                        <button className="action-card" onClick={() => alert('Analytics feature coming soon!')}>
                            <div className="action-icon analytics-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="20" x2="18" y2="10" />
                                    <line x1="12" y1="20" x2="12" y2="4" />
                                    <line x1="6" y1="20" x2="6" y2="14" />
                                </svg>
                            </div>
                            <div className="action-content">
                                <h3>Analytics</h3>
                                <p>View spending insights</p>
                            </div>
                        </button>

                        <button className="action-card" onClick={() => alert('Settings feature coming soon!')}>
                            <div className="action-icon settings-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="3" />
                                    <path d="M12 1v6m0 6v6m-6-6h6m6 0h-6" />
                                </svg>
                            </div>
                            <div className="action-content">
                                <h3>Settings</h3>
                                <p>Manage your account</p>
                            </div>
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon balance-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                                    <line x1="1" y1="10" x2="23" y2="10" />
                                </svg>
                            </div>
                            <div className="stat-content">
                                <p className="stat-label">Total Balance</p>
                                <h2 className="stat-value">$0.00</h2>
                                <p className="stat-change positive">+0% this month</p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon spending-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                                </svg>
                            </div>
                            <div className="stat-content">
                                <p className="stat-label">Monthly Spending</p>
                                <h2 className="stat-value">$0.00</h2>
                                <p className="stat-change neutral">0% from last month</p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon savings-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                                    <polyline points="17 6 23 6 23 12" />
                                </svg>
                            </div>
                            <div className="stat-content">
                                <p className="stat-label">Savings Goal</p>
                                <h2 className="stat-value">0%</h2>
                                <p className="stat-change info">Not set</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;