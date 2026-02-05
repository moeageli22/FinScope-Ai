import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import FinScopeAI from '../components/FinScopeAI.jsx';
import AIChatDemo from './AIChatDemo.jsx';
import AboutSection from './AboutSection.jsx';
import DashboardPreview from './DashboardPreview.jsx';
import ChartsInsights from './ChartsInsights.jsx';
import ContactSection from './ContactSection.jsx';
import Footer from './Footer.jsx';
import CookieBanner from './CookieBanner.jsx';
import LiveExchange from './LiveExchange.jsx';
import UserMenu from '../components/UserMenu.jsx';
import DashboardTutorial from '../components/DashboardTutorial.jsx';
import { supabase } from '../config/supabase';

function Home() {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('home');
    const [showExchange, setShowExchange] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showTutorial, setShowTutorial] = useState(false);

    // Check authentication status
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsAuthenticated(!!session);
            setLoading(false);
        };

        checkAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setIsAuthenticated(!!session);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Navigation handlers for authentication
    const handleSignIn = () => {
        navigate('/login');
    };

    const handleGetStarted = () => {
        navigate('/register');
    };

    const handleDashboard = () => {
        navigate('/dashboard');
    };

    // Track active section on scroll
    useEffect(() => {
        if (showExchange) {
            setActiveSection('exchange');
            return;
        }

        const handleScroll = () => {
            const scrollPosition = window.scrollY;

            // If near the top (first 200px), set home as active
            if (scrollPosition < 200) {
                setActiveSection('home');
                return;
            }

            // Check each section
            const sections = ['about', 'features', 'contact'];

            for (const sectionId of sections) {
                const element = document.getElementById(sectionId);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    const elementTop = rect.top + window.pageYOffset;
                    const elementBottom = elementTop + rect.height;

                    // If the section is in view (considering header offset)
                    if (scrollPosition + 150 >= elementTop && scrollPosition + 150 < elementBottom) {
                        setActiveSection(sectionId);
                        return;
                    }
                }
            }
        };

        // Add scroll listener
        window.addEventListener('scroll', handleScroll);

        // Call once on mount to set initial state
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, [showExchange]);

    // Show Live Exchange page
    if (showExchange) {
        return (
            <div className="home-container">
                <CookieBanner />

                {/* Header */}
                <header className="home-header">
                    <div className="logo" onClick={() => {
                        setShowExchange(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} style={{ cursor: 'pointer' }}>
                        <div className="logo-icon">
                            <FinScopeAI />
                        </div>
                        <span className="logo-text">
                            FinScope <span className="ai-text">AI</span>
                        </span>
                    </div>

                    <nav className="nav-links">
                        <a
                            href="#home"
                            className="nav-link"
                            onClick={(e) => {
                                e.preventDefault();
                                setShowExchange(false);
                                setActiveSection('home');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        >
                            Home
                        </a>
                        <a
                            href="#about"
                            className="nav-link"
                            onClick={(e) => {
                                e.preventDefault();
                                setShowExchange(false);
                                setActiveSection('about');
                                // Let the anchor link handle scrolling after page loads
                                setTimeout(() => {
                                    window.location.hash = 'about';
                                }, 100);
                            }}
                        >
                            About
                        </a>
                        <a
                            href="#features"
                            className="nav-link"
                            onClick={(e) => {
                                e.preventDefault();
                                setShowExchange(false);
                                setActiveSection('features');
                                setTimeout(() => {
                                    window.location.hash = 'features';
                                }, 100);
                            }}
                        >
                            Features
                        </a>
                        <a
                            href="#exchange"
                            className="nav-link active"
                            onClick={(e) => {
                                e.preventDefault();
                                setShowExchange(true);
                                setActiveSection('exchange');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        >
                            Live Exchange
                        </a>
                        <a
                            href="#contact"
                            className="nav-link"
                            onClick={(e) => {
                                e.preventDefault();
                                setShowExchange(false);
                                setActiveSection('contact');
                                setTimeout(() => {
                                    window.location.hash = 'contact';
                                }, 100);
                            }}
                        >
                            Contact
                        </a>
                    </nav>

                    <div className="nav-buttons">
                        {!loading && (
                            isAuthenticated ? (
                                <>
                                    <button className="btn-dashboard" onClick={handleDashboard}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="3" width="7" height="7" />
                                            <rect x="14" y="3" width="7" height="7" />
                                            <rect x="14" y="14" width="7" height="7" />
                                            <rect x="3" y="14" width="7" height="7" />
                                        </svg>
                                        Dashboard
                                    </button>
                                    <UserMenu />
                                </>
                            ) : (
                                <>
                                    <button className="btn-sign-in" onClick={handleSignIn}>Sign In</button>
                                    <button className="btn-get-started" onClick={handleGetStarted}>Get Started</button>
                                </>
                            )
                        )}
                    </div>
                </header>

                <LiveExchange />
                <Footer />
            </div>
        );
    }

    // Main landing page
    return (
        <div className="home-container">
            {/* Cookie Banner */}
            <CookieBanner />

            {/* Tutorial Overlay */}
            {showTutorial && (
                <DashboardTutorial
                    onComplete={() => setShowTutorial(false)}
                    onSkip={() => setShowTutorial(false)}
                />
            )}

            {/* Header */}
            <header className="home-header">
                <div className="logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ cursor: 'pointer' }}>
                    <div className="logo-icon">
                        <FinScopeAI />
                    </div>
                    <span className="logo-text">
                        FinScope <span className="ai-text">AI</span>
                    </span>
                </div>

                {/* Navigation Links */}
                <nav className="nav-links">
                    <a
                        href="#home"
                        className={`nav-link ${activeSection === 'home' ? 'active' : ''}`}
                        onClick={(e) => {
                            e.preventDefault();
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                            setActiveSection('home');
                        }}
                    >
                        Home
                    </a>
                    <a
                        href="#about"
                        className={`nav-link ${activeSection === 'about' ? 'active' : ''}`}
                    >
                        About
                    </a>
                    <a
                        href="#features"
                        className={`nav-link ${activeSection === 'features' ? 'active' : ''}`}
                    >
                        Features
                    </a>
                    <a
                        href="#exchange"
                        className={`nav-link ${activeSection === 'exchange' ? 'active' : ''}`}
                        onClick={(e) => {
                            e.preventDefault();
                            setShowExchange(true);
                            setActiveSection('exchange');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                    >
                        Live Exchange
                    </a>
                    <a
                        href="#contact"
                        className={`nav-link ${activeSection === 'contact' ? 'active' : ''}`}
                    >
                        Contact
                    </a>
                </nav>

                <div className="nav-buttons">
                    {!loading && (
                        isAuthenticated ? (
                            <>
                                <button className="btn-dashboard" onClick={handleDashboard}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="7" height="7" />
                                        <rect x="14" y="3" width="7" height="7" />
                                        <rect x="14" y="14" width="7" height="7" />
                                        <rect x="3" y="14" width="7" height="7" />
                                    </svg>
                                    Dashboard
                                </button>
                                <UserMenu />
                            </>
                        ) : (
                            <>
                                <button className="btn-sign-in" onClick={handleSignIn}>Sign In</button>
                                <button className="btn-get-started" onClick={handleGetStarted}>Get Started</button>
                            </>
                        )
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="home-main" id="home">
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
                    {isAuthenticated ? (
                        <button className="btn-primary" onClick={handleDashboard}>Go to Dashboard</button>
                    ) : (
                        <>
                            <button className="btn-primary" onClick={handleGetStarted}>Start Your Journey</button>
                            <button className="btn-secondary" onClick={handleSignIn}>Sign In</button>
                        </>
                    )}
                    <button className="btn-how-it-works" onClick={() => setShowTutorial(true)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polygon points="10 8 16 12 10 16 10 8" />
                        </svg>
                        How It Works
                    </button>
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

            {/* About Section */}
            <div id="about">
                <AboutSection />
            </div>

            {/* Dashboard Preview Section */}
            <DashboardPreview />

            {/* Charts & Insights Section */}
            <div id="features">
                <ChartsInsights />
            </div>

            {/* Contact Section */}
            <div id="contact">
                <ContactSection />
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
}

export default Home;