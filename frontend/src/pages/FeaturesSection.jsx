import React, { useState, useEffect, useRef } from 'react';
import './FeaturesSection.css';

const FeaturesSection = () => {
    const [isVisible, setIsVisible] = useState(true); // Start visible
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 } // Lower threshold for better mobile detection
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

    return (
        <section className="features-section" ref={sectionRef}>
            <div className="features-container">
                {/* Header */}
                <div className={`features-header ${isVisible ? 'fade-in' : ''}`}>
                    <h2>
                        How FinScope AI<br />
                        <span className="gradient-text">Transforms Your Banking</span>
                    </h2>
                </div>

                {/* Features Grid */}
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className={`feature-card ${isVisible ? 'slide-up' : ''}`}
                            style={{
                                animationDelay: `${feature.delay}s`
                            }}
                        >
                            <div className="feature-number" style={{
                                background: `linear-gradient(135deg, ${feature.color}, ${feature.color}dd)`,
                                boxShadow: `0 4px 20px ${feature.color}40`
                            }}>
                                {feature.number}
                            </div>
                            <div className="feature-content">
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;