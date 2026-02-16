import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import FinScopeAI from '../components/FinScopeAI.jsx';
import './AboutSection.css';

const AboutSection = () => {
    const navigate = useNavigate();
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

    const features = [
        {
            number: '1',
            title: 'Automated Insights',
            description: 'Get instant notifications about unusual spending, upcoming bills, and money-saving opportunities.',
            color: '#06b6d4',
            delay: 0.1
        },
        {
            number: '2',
            title: 'Smart Budgeting',
            description: 'AI learns your spending habits and creates personalized budgets that actually work for your lifestyle.',
            color: '#3b82f6',
            delay: 0.2
        },
        {
            number: '3',
            title: 'Investment Guidance',
            description: 'Receive AI-powered investment recommendations tailored to your risk profile and financial goals.',
            color: '#8b5cf6',
            delay: 0.3
        },
        {
            number: '4',
            title: 'Fraud Detection',
            description: 'Advanced AI monitors every transaction in real-time to detect and prevent fraudulent activity instantly.',
            color: '#06b6d4',
            delay: 0.4
        },
        {
            number: '5',
            title: 'Financial Coaching',
            description: 'Get personalized advice on improving credit scores, reducing debt, and building long-term wealth.',
            color: '#a855f7',
            delay: 0.5
        },
        {
            number: '6',
            title: '24/7 Availability',
            description: 'Your AI assistant never sleeps. Get help with banking tasks anytime, anywhere, instantly.',
            color: '#3b82f6',
            delay: 0.6
        }
    ];

    // Navigation handlers
    const handleGetStarted = () => {
        navigate('/register');
    };

    const handleLearnMore = () => {
        // Scroll to features section
        const featuresSection = document.getElementById('features');
        if (featuresSection) {
            featuresSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section className="about-section" ref={sectionRef}>
            <div className="about-container">
                {/* Header */}
                <div className={`about-header ${isVisible ? 'fade-in' : ''}`}>
                    <div className="about-badge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                        </svg>
                        <span>About FinScope AI</span>
                    </div>

                    <h2>
                        How FinScope AI<br />
                        <span className="gradient-text">Transforms Your Banking</span>
                    </h2>
                </div>

                {/* Main Content Grid */}
                <div className="about-content-grid">
                    {/* Left Side - AI Animation */}
                    <div className={`about-visual ${isVisible ? 'slide-in-left' : ''}`}>
                        <div className="ai-animation-wrapper">
                            <FinScopeAI />
                        </div>

                        <div className="visual-features">
                            <div className="visual-feature">
                                <div className="visual-feature-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <div className="visual-feature-text">
                                    <h4>AI-Powered Intelligence</h4>
                                    <p>Advanced machine learning algorithms</p>
                                </div>
                            </div>

                            <div className="visual-feature">
                                <div className="visual-feature-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    </svg>
                                </div>
                                <div className="visual-feature-text">
                                    <h4>Bank-Level Security</h4>
                                    <p>Military-grade encryption & protection</p>
                                </div>
                            </div>

                            <div className="visual-feature">
                                <div className="visual-feature-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div className="visual-feature-text">
                                    <h4>Real-Time Analytics</h4>
                                    <p>Instant insights at your fingertips</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Descriptionn */}
                    <div className={`about-description ${isVisible ? 'slide-in-right' : ''}`}>
                        <div className="description-content">
                            <h3>Welcome to the Future of Personal Finance</h3>
                            <p className="lead-text">
                                FinScope AI is revolutionizing how people manage their money by combining cutting-edge artificial intelligence with intuitive design and powerful financial tools.
                            </p>

                            <div className="description-text">
                                <p>
                                    The platform uses advanced machine learning algorithms to analyze your spending patterns, predict future expenses, and provide personalized recommendations that help you achieve your financial goals faster.
                                </p>

                                <p>
                                    Unlike traditional banking apps that simply track transactions, FinScope AI actively works to improve your financial health. Our intelligent assistant learns from your habits, understands your lifestyle, and adapts to your unique needs.
                                </p>

                                <p>
                                    Whether you're saving for a dream vacation, planning for retirement, or simply trying to spend less on dining out, FinScope AI provides the insights and guidance you need to make smarter financial decisions every day.
                                </p>
                            </div>

                            <div className="cta-group">
                                <button className="btn-about-primary" onClick={handleGetStarted}>
                                    Get Started Free
                                </button>
                                <button className="btn-about-secondary" onClick={handleLearnMore}>
                                    Learn More
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="about-features-title">
                    <h3>Powerful Features Designed for You</h3>
                    <p>Discover how FinScope AI makes managing your finances effortless</p>
                </div>

                <div className="about-features-grid">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className={`about-feature-card ${isVisible ? 'slide-up' : ''}`}
                            style={{
                                animationDelay: `${feature.delay + 0.3}s`
                            }}
                        >
                            <div className="about-feature-number" style={{
                                background: `linear-gradient(135deg, ${feature.color}, ${feature.color}dd)`,
                                boxShadow: `0 4px 20px ${feature.color}40`
                            }}>
                                {feature.number}
                            </div>
                            <div className="about-feature-content">
                                <h4>{feature.title}</h4>
                                <p>{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AboutSection;