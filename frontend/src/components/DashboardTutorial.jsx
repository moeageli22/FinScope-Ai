import React, { useState, useEffect } from 'react';
import FinScopeAI from './FinScopeAI';
import './DashboardTutorial.css';

const DashboardTutorial = ({ onComplete, onSkip }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [showOrb, setShowOrb] = useState(true);

    const tutorialSteps = [
        {
            id: 'welcome',
            title: 'Welcome to FinScope AI! 👋',
            description: 'Your intelligent financial companion is ready to help you master your money. Let me show you around!',
            highlight: null,
            orbPosition: 'center',
            animation: 'fadeIn'
        },
        {
            id: 'demo-mode',
            title: 'Start with Demo Mode 🎮',
            description: 'Try FinScope risk-free! Choose a virtual balance and simulate real financial scenarios without using actual money.',
            highlight: 'demo-setup',
            orbPosition: 'left',
            animation: 'slideIn',
            features: [
                '💰 Choose £1K - £1M virtual balance',
                '📊 Realistic transaction simulation',
                '🔄 Reset anytime you want',
                '🎯 Perfect for learning'
            ]
        },
        {
            id: 'transactions',
            title: 'Track Every Penny 💸',
            description: 'Add income and expenses easily. Our smart categorization helps you understand where your money goes.',
            highlight: 'add-transaction',
            orbPosition: 'right',
            animation: 'slideIn',
            features: [
                '➕ Quick-add transactions',
                '🏷️ Auto-categorization',
                '📝 Custom descriptions',
                '📅 Date tracking'
            ]
        },
        {
            id: 'analytics',
            title: 'Beautiful Insights 📈',
            description: 'Watch your financial story unfold through stunning charts and real-time analytics.',
            highlight: 'charts',
            orbPosition: 'bottom',
            animation: 'slideUp',
            features: [
                '📊 Spending trends over time',
                '🎨 Category breakdowns',
                '💹 Income vs Expenses',
                '📉 Budget tracking'
            ]
        },
        {
            id: 'ai-assistant',
            title: 'Meet Your AI Advisor 🤖',
            description: 'Chat with FinScope AI for personalized insights, smart suggestions, and financial guidance.',
            highlight: 'ai-chat',
            orbPosition: 'center',
            animation: 'pulse',
            features: [
                '💬 Natural conversation',
                '🧠 Smart predictions',
                '💡 Personalized tips',
                '🎯 Goal tracking'
            ]
        },
        {
            id: 'ready',
            title: 'You\'re All Set! 🚀',
            description: 'Start your financial journey now. Remember, you can always access this tutorial from Settings.',
            highlight: null,
            orbPosition: 'center',
            animation: 'celebrate'
        }
    ];

    const currentStepData = tutorialSteps[currentStep];
    const isLastStep = currentStep === tutorialSteps.length - 1;

    useEffect(() => {
        setIsAnimating(true);
        const timer = setTimeout(() => setIsAnimating(false), 600);
        return () => clearTimeout(timer);
    }, [currentStep]);

    const handleNext = () => {
        if (isLastStep) {
            handleComplete();
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleComplete = () => {
        // Mark tutorial as completed
        localStorage.setItem('finscope_tutorial_completed', 'true');
        onComplete();
    };

    const handleSkipTutorial = () => {
        localStorage.setItem('finscope_tutorial_completed', 'true');
        onSkip();
    };

    return (
        <div className="tutorial-overlay">
            <div className="tutorial-background" />

            {/* Tutorial Modal */}
            <div className={`tutorial-modal ${isAnimating ? 'animating' : ''} ${currentStepData.animation}`}>
                {/* Progress Bar */}
                <div className="tutorial-progress">
                    {tutorialSteps.map((_, index) => (
                        <div
                            key={index}
                            className={`progress-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                        />
                    ))}
                </div>

                {/* Skip Button */}
                <button className="tutorial-skip" onClick={handleSkipTutorial}>
                    Skip Tutorial
                </button>

                {/* Content Container */}
                <div className="tutorial-content">
                    {/* AI Orb Animation */}
                    {showOrb && (
                        <div className={`tutorial-orb orb-${currentStepData.orbPosition} ${currentStepData.animation}`}>
                            <FinScopeAI />
                        </div>
                    )}

                    {/* Step Content */}
                    <div className="tutorial-text">
                        <div className="tutorial-step-number">
                            Step {currentStep + 1} of {tutorialSteps.length}
                        </div>

                        <h2 className="tutorial-title">
                            {currentStepData.title}
                        </h2>

                        <p className="tutorial-description">
                            {currentStepData.description}
                        </p>

                        {/* Feature List */}
                        {currentStepData.features && (
                            <div className="tutorial-features">
                                {currentStepData.features.map((feature, index) => (
                                    <div
                                        key={index}
                                        className="feature-item"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        {feature}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Special Content for Last Step */}
                        {isLastStep && (
                            <div className="tutorial-celebration">
                                <div className="celebration-emoji">🎉</div>
                                <div className="celebration-text">
                                    You're ready to take control of your finances!
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <div className="tutorial-navigation">
                    <button
                        className="btn-tutorial-nav btn-previous"
                        onClick={handlePrevious}
                        disabled={currentStep === 0}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Previous
                    </button>

                    <button
                        className="btn-tutorial-nav btn-next"
                        onClick={handleNext}
                    >
                        {isLastStep ? (
                            <>
                                Get Started
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </>
                        ) : (
                            <>
                                Next
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>

                {/* Keyboard Hint */}
                <div className="tutorial-hint">
                    Use arrow keys or click to navigate
                </div>
            </div>

            {/* Highlight Overlay */}
            {currentStepData.highlight && (
                <div className={`tutorial-highlight highlight-${currentStepData.highlight}`}>
                    <div className="highlight-pulse" />
                </div>
            )}
        </div>
    );
};

export default DashboardTutorial;