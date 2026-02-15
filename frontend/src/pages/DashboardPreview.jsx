import React, { useState, useEffect, useRef } from 'react';
import './DashboardPreview.css';

const DashboardPreview = () => {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.2 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []);

    return (
        <section className="dashboard-preview-section" ref={sectionRef}>
            <div className="dashboard-preview-container">
                {/* Header */}
                <div className={`dashboard-preview-header ${isVisible ? 'fade-in' : ''}`}>
                    <div className="header-badge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <line x1="3" y1="9" x2="21" y2="9" />
                            <line x1="9" y1="21" x2="9" y2="9" />
                        </svg>
                        <span>Powerful Dashboard</span>
                    </div>

                    <h2>
                        Your Financial Life<br />
                        <span className="gradient-text">At a Glance</span>
                    </h2>

                    <p className="dashboard-subtitle">
                        Beautiful, intuitive dashboards with real-time insights and actionable intelligence
                    </p>
                </div>

                {/* Dashboard Cards */}
                <div className="dashboard-cards-grid">
                    {/* Balance Card */}
                    <div className={`dashboard-card balance-card ${isVisible ? 'slide-up' : ''}`} style={{ animationDelay: '0.1s' }}>
                        <div className="card-header">
                            <div className="card-icon balance-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                </svg>
                            </div>
                            <div className="card-trend positive">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                                    <polyline points="17 6 23 6 23 12" />
                                </svg>
                            </div>
                        </div>
                        <div className="card-content">
                            <div className="card-label">Total Balance</div>
                            <div className="card-value">$24,850</div>
                            <div className="card-change positive">+12.5% this month</div>
                        </div>
                    </div>

                    {/* Spending Card */}
                    <div className={`dashboard-card spending-card ${isVisible ? 'slide-up' : ''}`} style={{ animationDelay: '0.2s' }}>
                        <div className="card-header">
                            <div className="card-icon spending-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                                    <line x1="1" y1="10" x2="23" y2="10" />
                                </svg>
                            </div>
                            <div className="card-trend negative">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                                    <polyline points="17 18 23 18 23 12" />
                                </svg>
                            </div>
                        </div>
                        <div className="card-content">
                            <div className="card-label">Monthly Spending</div>
                            <div className="card-value">$3,240</div>
                            <div className="card-change warning">+5.2% from last month</div>
                        </div>
                    </div>

                    {/* Savings Goal Card */}
                    <div className={`dashboard-card savings-card ${isVisible ? 'slide-up' : ''}`} style={{ animationDelay: '0.3s' }}>
                        <div className="card-header">
                            <div className="card-icon savings-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                            </div>
                            <div className="card-trend positive">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                                    <polyline points="17 6 23 6 23 12" />
                                </svg>
                            </div>
                        </div>
                        <div className="card-content">
                            <div className="card-label">Savings Goal</div>
                            <div className="card-value">68%</div>
                            <div className="card-change info">On track to goal</div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity Section */}
                <div className={`recent-activity-section ${isVisible ? 'fade-in-up' : ''}`} style={{ animationDelay: '0.4s' }}>
                    <h3 className="activity-title">Recent Activity</h3>

                    <div className="activity-list">
                        <div className="activity-item">
                            <div className="activity-icon grocery-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="9" cy="21" r="1" />
                                    <circle cx="20" cy="21" r="1" />
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                </svg>
                            </div>
                            <div className="activity-details">
                                <div className="activity-name">Grocery Store</div>
                                <div className="activity-category">Shopping</div>
                            </div>
                            <div className="activity-amount negative">-$87.50</div>
                        </div>

                        <div className="activity-item">
                            <div className="activity-icon salary-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </div>
                            <div className="activity-details">
                                <div className="activity-name">Salary Deposit</div>
                                <div className="activity-category">Income</div>
                            </div>
                            <div className="activity-amount positive">+$3,500</div>
                        </div>

                        <div className="activity-item">
                            <div className="activity-icon coffee-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                                    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                                    <line x1="6" y1="1" x2="6" y2="4" />
                                    <line x1="10" y1="1" x2="10" y2="4" />
                                    <line x1="14" y1="1" x2="14" y2="4" />
                                </svg>
                            </div>
                            <div className="activity-details">
                                <div className="activity-name">Coffee Shop</div>
                                <div className="activity-category">Dining</div>
                            </div>
                            <div className="activity-amount negative">-$4.80</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DashboardPreview;