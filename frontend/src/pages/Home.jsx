import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Home.css';
import FinScopeAI from '../components/FinScopeAI.jsx';
import AIChatDemo from './AIChatDemo.jsx';
import AboutSection from './AboutSection.jsx';
import DashboardPreview from './DashboardPreview.jsx';
import ChartsInsights from "./ChartsInsights.jsx";
import ContactSection from './ContactSection.jsx';
import Footer from './Footer.jsx';
import CookieBanner from './CookieBanner.jsx';
import LiveExchange from './LiveExchange.jsx';
import UserMenu from '../components/UserMenu.jsx';
import DashboardTutorial from '../components/DashboardTutorial.jsx';
import { supabase } from '../config/supabase';

function Home() {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeSection, setActiveSection] = useState('home');
    const [showExchange, setShowExchange] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showTutorial, setShowTutorial] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Auto-open exchange if navigated here with state { showExchange: true }
    useEffect(() => {
        if (location.state?.showExchange) {
            setShowExchange(true);
            setActiveSection('exchange');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            // Clear the state so refresh doesn't re-trigger
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

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

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (mobileMenuOpen && !e.target.closest('.mobile-menu-btn') && !e.target.closest('.mobile-menu-dropdown')) {
                setMobileMenuOpen(false);
            }
        };

        if (mobileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
            // Prevent body scroll on mobile when menu is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
            document.body.style.overflow = '';
        };
    }, [mobileMenuOpen]);

    // Navigation handlers for authentication
    const handleSignIn = () => {
        setMobileMenuOpen(false);
        navigate('/login');
    };

    const handleGetStarted = () => {
        setMobileMenuOpen(false);
        navigate('/register');
    };

    const handleDashboard = () => {
        setMobileMenuOpen(false);
        navigate('/dashboard');
    };

    // Handle mobile menu navigation
    const handleMobileNav = (section) => {
        setMobileMenuOpen(false);

        if (section === 'home') {
            setShowExchange(false);
            setActiveSection('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (section === 'exchange') {
            setShowExchange(true);
            setActiveSection('exchange');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            setShowExchange(false);
            setActiveSection(section);
            setTimeout(() => {
                const element = document.getElementById(section);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        }
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
                        {/* Mobile Hamburger Menu */}
                        <button
                            className={`mobile-menu-btn ${mobileMenuOpen ? 'open' : ''}`}
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            type="button"
                        >
                            <div className="menu-dots">
                                <span className="menu-dot"></span>
                                <span className="menu-dot"></span>
                                <span className="menu-dot"></span>
                            </div>
                        </button>

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
                                        <span>Dashboard</span>
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

                {/* Mobile Menu Backdrop */}
                <div
                    className={`mobile-menu-backdrop ${mobileMenuOpen ? 'show' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                />

                {/* Mobile Menu Dropdown */}
                <div className={`mobile-menu-dropdown ${mobileMenuOpen ? 'show' : ''}`}>
                    <div className="mobile-menu-header">
                        <h3 className="mobile-menu-title">Navigation</h3>
                    </div>

                    <div className="mobile-menu-items">
                        <button
                            className={`mobile-menu-item ${activeSection === 'home' ? 'active' : ''}`}
                            onClick={() => handleMobileNav('home')}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                            <span>Home</span>
                        </button>

                        <button
                            className={`mobile-menu-item ${activeSection === 'about' ? 'active' : ''}`}
                            onClick={() => handleMobileNav('about')}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                            <span>About</span>
                        </button>

                        <button
                            className={`mobile-menu-item ${activeSection === 'features' ? 'active' : ''}`}
                            onClick={() => handleMobileNav('features')}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                            </svg>
                            <span>Features</span>
                        </button>

                        <button
                            className={`mobile-menu-item ${activeSection === 'exchange' ? 'active' : ''}`}
                            onClick={() => handleMobileNav('exchange')}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="1" x2="12" y2="23" />
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                            <span>Live Exchange</span>
                        </button>

                        <button
                            className={`mobile-menu-item ${activeSection === 'contact' ? 'active' : ''}`}
                            onClick={() => handleMobileNav('contact')}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            <span>Contact</span>
                        </button>
                    </div>

                    {!isAuthenticated && (
                        <div className="mobile-menu-auth">
                            <button className="mobile-menu-auth-btn primary" onClick={handleGetStarted}>
                                Get Started
                            </button>
                            <button className="mobile-menu-auth-btn secondary" onClick={handleSignIn}>
                                Sign In
                            </button>
                        </div>
                    )}
                </div>

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
                    {/* Mobile Hamburger Menu */}
                    <button
                        className={`mobile-menu-btn ${mobileMenuOpen ? 'open' : ''}`}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        type="button"
                    >
                        <div className="menu-dots">
                            <span className="menu-dot"></span>
                            <span className="menu-dot"></span>
                            <span className="menu-dot"></span>
                        </div>
                    </button>

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
                                    <span>Dashboard</span>
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

            {/* Mobile Menu Backdrop */}
            <div
                className={`mobile-menu-backdrop ${mobileMenuOpen ? 'show' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
            />

            {/* Mobile Menu Dropdown */}
            <div className={`mobile-menu-dropdown ${mobileMenuOpen ? 'show' : ''}`}>
                <div className="mobile-menu-header">
                    <h3 className="mobile-menu-title">Navigation</h3>
                </div>

                <div className="mobile-menu-items">
                    <button
                        className={`mobile-menu-item ${activeSection === 'home' ? 'active' : ''}`}
                        onClick={() => handleMobileNav('home')}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                        <span>Home</span>
                    </button>

                    <button
                        className={`mobile-menu-item ${activeSection === 'about' ? 'active' : ''}`}
                        onClick={() => handleMobileNav('about')}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                        <span>About</span>
                    </button>

                    <button
                        className={`mobile-menu-item ${activeSection === 'features' ? 'active' : ''}`}
                        onClick={() => handleMobileNav('features')}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                        </svg>
                        <span>Features</span>
                    </button>

                    <button
                        className={`mobile-menu-item ${activeSection === 'exchange' ? 'active' : ''}`}
                        onClick={() => handleMobileNav('exchange')}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="1" x2="12" y2="23" />
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                        <span>Live Exchange</span>
                    </button>

                    <button
                        className={`mobile-menu-item ${activeSection === 'contact' ? 'active' : ''}`}
                        onClick={() => handleMobileNav('contact')}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        <span>Contact</span>
                    </button>
                </div>

                {!isAuthenticated && (
                    <div className="mobile-menu-auth">
                        <button className="mobile-menu-auth-btn primary" onClick={handleGetStarted}>
                            Get Started
                        </button>
                        <button className="mobile-menu-auth-btn secondary" onClick={handleSignIn}>
                            Sign In
                        </button>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <main className="home-main" id="home">

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