import React from 'react';
import './Home.css';
import FinScopeAI from '../components/FinScopeAI.jsx';
import AIChatDemo from './AIChatDemo.jsx';
import FeaturesSection from './FeaturesSection.jsx';
import DashboardPreview from './DashboardPreview.jsx';
import ChartsInsights from './ChartsInsights.jsx';
// Import the logo image - make sure this path matches where you save the logo
import logoImage from '../assets/finscope-logo.png';

function Home() {
    return (
        <div className="home-container">
            {/* Header */}
            <header className="home-header">
                <div className="logo">
                    <div className="logo-icon">
                        <img src={logoImage} alt="FinScope AI Logo" />
                    </div>
                    <span className="logo-text">
                        FinScope <span className="ai-text">AI</span>
                    </span>
                </div>

                {/* Navigation Links */}
                <nav className="nav-links">
                    <a href="#home" className="nav-link active">Home</a>
                    <a href="#about" className="nav-link">About</a>
                    <a href="#features" className="nav-link">Features</a>
                    <a href="#practice" className="nav-link">Try Practice Mode</a>
                    <a href="#contact" className="nav-link">Contact</a>
                </nav>

                <div className="nav-buttons">
                    <button className="btn-sign-in">Sign In</button>
                    <button className="btn-get-started">Get Started</button>
                </div>
            </header>

            {/* Main Content */}
            <main className="home-main">
                <div className="badge">
                    <span className="sparkle-icon">✨</span>
                    <span>AI-Powered Banking Platform</span>
                </div>

                <h1 className="main-heading">
                    Welcome to<br />
                    <span className="highlight">FinScope AI</span>
                </h1>

                <p className="main-description">
                    Experience the future of banking with artificial intelligence. Smart insights,<br />
                    predictive analytics, and seamless financial management.
                </p>

                <div className="cta-buttons">
                    <button className="btn-primary">Start Your Journey</button>
                    <button className="btn-secondary">Sign In</button>
                </div>

                {/* AI Orb - Center Component */}
                <div className="ai-orb-container">
                    <FinScopeAI />
                </div>

                {/* Feature Cards */}
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon analytics-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                            </svg>
                        </div>
                        <h3>Smart Analytics</h3>
                        <p>AI-powered insights that predict spending patterns and optimize your financial decisions.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon security-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                        </div>
                        <h3>Bank-Level Security</h3>
                        <p>Military-grade encryption and real-time fraud detection keep your money safe 24/7.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon transactions-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                            </svg>
                        </div>
                        <h3>Instant Transactions</h3>
                        <p>Lightning-fast transfers and payments powered by next-gen infrastructure.</p>
                    </div>
                </div>
            </main>

            {/* AI Chat Demo Section */}
            <AIChatDemo />

            {/* Features Transformation Section */}
            <FeaturesSection />

            {/* Dashboard Preview Section */}
            <DashboardPreview />

            {/* Charts & Insights Section */}
            <ChartsInsights />
        </div>
    );
}

export default Home;