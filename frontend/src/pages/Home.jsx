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
import { supabase } from '../config/supabase';

function Home() {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('home');
    const [showExchange, setShowExchange] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

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

    // Smooth scroll function
    const scrollToSection = (e, sectionId) => {
        e.preventDefault();

        if (sectionId === 'exchange') {
            setShowExchange(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setShowExchange(false);

        const element = document.getElementById(sectionId);
        if (element) {
            const headerOffset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    // Track active section on scroll
    useEffect(() => {
        if (showExchange) return;

        const handleScroll = () => {
            const sections = ['home', 'about', 'features', 'contact'];
            const scrollPosition = window.scrollY + 150;

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const offsetTop = element.offsetTop;
                    const offsetHeight = element.offsetHeight;

                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveSection(section);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
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
                                setTimeout(() => scrollToSection(e, 'about'), 100);
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
                                setTimeout(() => scrollToSection(e, 'features'), 100);
                            }}
                        >
                            Features
                        </a>
                        <a
                            href="#exchange"
                            className="nav-link active"
                            onClick={(e) => scrollToSection(e, 'exchange')}
                        >
                            Live Exchange
                        </a>
                        <a
                            href="#contact"
                            className="nav-link"
                            onClick={(e) => {
                                e.preventDefault();
                                setShowExchange(false);
                                setTimeout(() => scrollToSection(e, 'contact'), 100);
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
                        onClick={(e) => scrollToSection(e, 'home')}
                    >
                        Home
                    </a>
                    <a
                        href="#about"
                        className={`nav-link ${activeSection === 'about' ? 'active' : ''}`}
                        onClick={(e) => scrollToSection(e, 'about')}
                    >
                        About
                    </a>
                    <a
                        href="#features"
                        className={`nav-link ${activeSection === 'features' ? 'active' : ''}`}
                        onClick={(e) => scrollToSection(e, 'features')}
                    >
                        Features
                    </a>
                    <a
                        href="#exchange"
                        className="nav-link"
                        onClick={(e) => scrollToSection(e, 'exchange')}
                    >
                        Live Exchange
                    </a>
                    <a
                        href="#contact"
                        className={`nav-link ${activeSection === 'contact' ? 'active' : ''}`}
                        onClick={(e) => scrollToSection(e, 'contact')}
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