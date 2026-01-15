import React, { useState, useEffect, useRef } from 'react';
import './ChartsInsights.css';

const ChartsInsights = () => {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);
    const [hoveredCategory, setHoveredCategory] = useState(null);

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

    // Spending trend data
    const spendingData = [
        { month: 'Jan', amount: 3200 },
        { month: 'Feb', amount: 3800 },
        { month: 'Mar', amount: 4200 },
        { month: 'Apr', amount: 4800 },
        { month: 'May', amount: 5200 },
        { month: 'Jun', amount: 5800 }
    ];

    const maxAmount = Math.max(...spendingData.map(d => d.amount));

    // Category data
    const categoryData = [
        { name: 'Food', amount: 847, percentage: 35, color: '#3b82f6' },
        { name: 'Shopping', amount: 567, percentage: 23, color: '#8b5cf6' },
        { name: 'Transport', amount: 234, percentage: 10, color: '#06b6d4' },
        { name: 'Bills', amount: 592, percentage: 25, color: '#a855f7' }
    ];

    // Calculate total for donut chart
    const totalSpending = categoryData.reduce((sum, cat) => sum + cat.amount, 0);

    // Calculate donut segments
    let currentAngle = -90;
    const donutSegments = categoryData.map(cat => {
        const angle = (cat.percentage / 100) * 360;
        const segment = {
            ...cat,
            startAngle: currentAngle,
            endAngle: currentAngle + angle
        };
        currentAngle += angle;
        return segment;
    });

    return (
        <section className="charts-insights-section" ref={sectionRef}>
            <div className="charts-insights-container">
                {/* Section Header */}
                <div className={`charts-header ${isVisible ? 'fade-in' : ''}`}>
                    <h2>
                        Powerful Insights &<br />
                        <span className="gradient-text">Visual Analytics</span>
                    </h2>
                    <p className="charts-subtitle">
                        Track your spending patterns with beautiful, interactive charts that help you make better financial decisions
                    </p>
                </div>

                {/* Charts Grid */}
                <div className="charts-grid">
                    {/* Spending Trend Chart */}
                    <div className={`chart-card spending-trend-card ${isVisible ? 'slide-up' : ''}`} style={{ animationDelay: '0.1s' }}>
                        <div className="chart-card-header">
                            <div className="chart-title-wrapper">
                                <div className="chart-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="12" y1="20" x2="12" y2="10" />
                                        <line x1="18" y1="20" x2="18" y2="4" />
                                        <line x1="6" y1="20" x2="6" y2="16" />
                                    </svg>
                                </div>
                                <h3>Spending Trend</h3>
                            </div>
                        </div>

                        <div className="chart-content">
                            <div className="line-chart">
                                <div className="chart-y-axis">
                                    <span>6000</span>
                                    <span>4500</span>
                                    <span>3000</span>
                                    <span>1500</span>
                                    <span>0</span>
                                </div>

                                <div className="chart-area">
                                    <svg className="chart-svg" viewBox="0 0 600 300" preserveAspectRatio="none">
                                        {/* Grid lines */}
                                        <line x1="0" y1="75" x2="600" y2="75" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                                        <line x1="0" y1="150" x2="600" y2="150" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                                        <line x1="0" y1="225" x2="600" y2="225" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

                                        {/* Gradient fill */}
                                        <defs>
                                            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                                                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>

                                        {/* Area under line */}
                                        <path
                                            d={`M 0 ${300 - (spendingData[0].amount / maxAmount) * 300} ${spendingData.map((d, i) =>
                                                `L ${(i / (spendingData.length - 1)) * 600} ${300 - (d.amount / maxAmount) * 300}`
                                            ).join(' ')} L 600 300 L 0 300 Z`}
                                            fill="url(#lineGradient)"
                                            className="chart-area-fill"
                                        />

                                        {/* Line */}
                                        <path
                                            d={`M 0 ${300 - (spendingData[0].amount / maxAmount) * 300} ${spendingData.map((d, i) =>
                                                `L ${(i / (spendingData.length - 1)) * 600} ${300 - (d.amount / maxAmount) * 300}`
                                            ).join(' ')}`}
                                            fill="none"
                                            stroke="#3b82f6"
                                            strokeWidth="3"
                                            className="chart-line"
                                        />

                                        {/* Data points */}
                                        {spendingData.map((d, i) => (
                                            <circle
                                                key={i}
                                                cx={(i / (spendingData.length - 1)) * 600}
                                                cy={300 - (d.amount / maxAmount) * 300}
                                                r="6"
                                                fill="#3b82f6"
                                                className="chart-point"
                                            />
                                        ))}
                                    </svg>

                                    <div className="chart-x-axis">
                                        {spendingData.map((d, i) => (
                                            <span key={i}>{d.month}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Spending by Category */}
                    <div className={`chart-card category-chart-card ${isVisible ? 'slide-up' : ''}`} style={{ animationDelay: '0.2s' }}>
                        <div className="chart-card-header">
                            <div className="chart-title-wrapper">
                                <div className="chart-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                                        <path d="M22 12A10 10 0 0 0 12 2v10z" />
                                    </svg>
                                </div>
                                <h3>Spending by Category</h3>
                            </div>
                        </div>

                        <div className="chart-content category-content">
                            <div className="donut-chart">
                                <svg viewBox="0 0 200 200" className="donut-svg">
                                    {donutSegments.map((segment, index) => {
                                        const startAngle = (segment.startAngle * Math.PI) / 180;
                                        const endAngle = (segment.endAngle * Math.PI) / 180;
                                        const radius = 70;
                                        const innerRadius = 50;

                                        const x1 = 100 + radius * Math.cos(startAngle);
                                        const y1 = 100 + radius * Math.sin(startAngle);
                                        const x2 = 100 + radius * Math.cos(endAngle);
                                        const y2 = 100 + radius * Math.sin(endAngle);
                                        const x3 = 100 + innerRadius * Math.cos(endAngle);
                                        const y3 = 100 + innerRadius * Math.sin(endAngle);
                                        const x4 = 100 + innerRadius * Math.cos(startAngle);
                                        const y4 = 100 + innerRadius * Math.sin(startAngle);

                                        const largeArc = segment.percentage > 50 ? 1 : 0;

                                        const pathData = `
                                            M ${x1} ${y1}
                                            A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
                                            L ${x3} ${y3}
                                            A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
                                            Z
                                        `;

                                        return (
                                            <path
                                                key={index}
                                                d={pathData}
                                                fill={segment.color}
                                                className={`donut-segment ${hoveredCategory === segment.name ? 'hovered' : ''}`}
                                                onMouseEnter={() => setHoveredCategory(segment.name)}
                                                onMouseLeave={() => setHoveredCategory(null)}
                                            />
                                        );
                                    })}

                                    {/* Center circle */}
                                    <circle cx="100" cy="100" r="50" fill="rgba(10, 11, 30, 0.9)" />

                                    {/* Center text */}
                                    <text x="100" y="95" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="12">
                                        Total
                                    </text>
                                    <text x="100" y="110" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="bold">
                                        ${totalSpending}
                                    </text>
                                </svg>
                            </div>

                            <div className="category-legend">
                                {categoryData.map((cat, index) => (
                                    <div
                                        key={index}
                                        className={`legend-item ${hoveredCategory === cat.name ? 'hovered' : ''}`}
                                        onMouseEnter={() => setHoveredCategory(cat.name)}
                                        onMouseLeave={() => setHoveredCategory(null)}
                                    >
                                        <div className="legend-color" style={{ backgroundColor: cat.color }}></div>
                                        <div className="legend-info">
                                            <div className="legend-name">{cat.name}</div>
                                            <div className="legend-value">${cat.amount} spent</div>
                                        </div>
                                        <div className="legend-percentage">{cat.percentage}%</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Insights Cards */}
                <div className="ai-insights-grid">
                    <div className={`insight-card ${isVisible ? 'fade-in-up' : ''}`} style={{ animationDelay: '0.3s' }}>
                        <div className="insight-icon smart-tip">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                        </div>
                        <div className="insight-content">
                            <h4>Smart Savings Tip</h4>
                            <p>You're spending 15% more on dining this month. Consider setting a budget limit.</p>
                        </div>
                    </div>

                    <div className={`insight-card ${isVisible ? 'fade-in-up' : ''}`} style={{ animationDelay: '0.4s' }}>
                        <div className="insight-icon goal-progress">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <circle cx="12" cy="12" r="6" />
                                <circle cx="12" cy="12" r="2" />
                            </svg>
                        </div>
                        <div className="insight-content">
                            <h4>Goal Progress</h4>
                            <p>You're on track to reach your savings goal by next month. Keep it up!</p>
                        </div>
                    </div>

                    <div className={`insight-card ${isVisible ? 'fade-in-up' : ''}`} style={{ animationDelay: '0.5s' }}>
                        <div className="insight-icon bill-reminder">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                        </div>
                        <div className="insight-content">
                            <h4>Bill Reminder</h4>
                            <p>Your electricity bill of $85 is due in 3 days.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ChartsInsights;