import React, { useState, useEffect, useCallback } from 'react';
import FinScopeAI from './FinScopeAI';
import './DashboardTutorial.css';

const DashboardTutorial = ({ onComplete, onSkip }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [animKey, setAnimKey] = useState(0);

    const tutorialSteps = [
        {
            id: 'welcome',
            title: 'Welcome to FinScope AI! 👋',
            description: 'Your intelligent financial companion is ready to help you master your money. Let me give you a quick tour of everything you can do.',
            highlight: null,
            animation: 'fadeIn'
        },
        {
            id: 'demo-mode',
            title: 'Start with Demo Mode 🎮',
            description: 'Try FinScope risk-free! Choose a virtual balance and simulate real financial scenarios without using actual money.',
            highlight: 'demo-setup',
            animation: 'slideIn',
            features: [
                '💰 Choose £1K – £1M virtual balance',
                '📊 Realistic transaction simulation',
                '🔄 Reset anytime you want',
                '🎯 Perfect for learning'
            ]
        },
        {
            id: 'transactions',
            title: 'Track Every Penny 💸',
            description: 'Add income and expenses easily. Our smart categorisation helps you understand exactly where your money goes.',
            highlight: 'add-transaction',
            animation: 'slideIn',
            features: [
                '➕ Quick-add transactions',
                '🏷️ Auto-categorisation',
                '📝 Custom descriptions',
                '📅 Date tracking'
            ]
        },
        {
            id: 'analytics',
            title: 'Beautiful Insights 📈',
            description: 'Watch your financial story unfold through stunning charts and real-time analytics, all in one place.',
            highlight: 'charts',
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
            description: 'Chat with FinScope AI for personalised insights, smart suggestions, and financial guidance tailored just for you.',
            highlight: 'ai-chat',
            animation: 'pulse',
            features: [
                '💬 Natural conversation',
                '🧠 Smart predictions',
                '💡 Personalised tips',
                '🎯 Goal tracking'
            ]
        },
        {
            id: 'ready',
            title: "You're All Set! 🚀",
            description: 'Start your financial journey now. You can always re-open this tutorial from the header.',
            highlight: null,
            animation: 'celebrate'
        }
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
        if (isLastStep) {
            localStorage.setItem('finscope_tutorial_completed', 'true');
            onComplete();
        } else {
            goToStep(currentStep + 1);
        }
    }, [isLastStep, currentStep, goToStep, onComplete]);

    const handlePrevious = useCallback(() => {
        if (!isFirstStep) {
            goToStep(currentStep - 1);
        }
    }, [isFirstStep, currentStep, goToStep]);

    const handleSkipTutorial = useCallback(() => {
        localStorage.setItem('finscope_tutorial_completed', 'true');
        onSkip();
    }, [onSkip]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight' || e.key === 'Enter') {
                handleNext();
            } else if (e.key === 'ArrowLeft') {
                handlePrevious();
            } else if (e.key === 'Escape') {
                handleSkipTutorial();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNext, handlePrevious, handleSkipTutorial]);

    return (
        <div className="tutorial-overlay" role="dialog" aria-modal="true" aria-label="Dashboard tutorial">
            <div className="tutorial-background" />

            <div className="tutorial-modal">
                {/* Progress Bar */}
                <div className="tutorial-progress" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={tutorialSteps.length}>
                    {tutorialSteps.map((_, index) => (
                        <div
                            key={index}
                            className={`progress-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                        />
                    ))}
                </div>

                {/* Skip Button */}
                <button className="tutorial-skip" onClick={handleSkipTutorial} aria-label="Skip tutorial">
                    Skip
                </button>

                {/* Content Container */}
                <div className="tutorial-content" key={animKey}>
                    {/* AI Orb */}
                    <div className={`tutorial-orb ${currentStepData.animation}`}>
                        <FinScopeAI />
                    </div>

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
                                        style={{ animationDelay: `${0.2 + index * 0.08}s` }}
                                    >
                                        {feature}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Celebration for last step */}
                        {isLastStep && (
                            <div className="tutorial-celebration">
                                <span className="celebration-emoji">🎉</span>
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
                        disabled={isFirstStep}
                        aria-label="Previous step"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>

                    <button
                        className="btn-tutorial-nav btn-next"
                        onClick={handleNext}
                        aria-label={isLastStep ? 'Get started' : 'Next step'}
                    >
                        {isLastStep ? 'Get Started' : 'Next'}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Keyboard Hint */}
                <div className="tutorial-hint">
                    Use arrow keys to navigate · Esc to skip
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