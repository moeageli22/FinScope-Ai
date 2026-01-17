import React from 'react';
import './Footer.css';
import FinScopeAI from '../components/FinScopeAI.jsx';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-container">
                {/* Top Section */}
                <div className="footer-top">
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <div className="footer-logo-icon">
                                <FinScopeAI />
                            </div>
                            <span className="footer-logo-text">
                                FinScope <span className="ai-text">AI</span>
                            </span>
                        </div>

                        <p className="footer-tagline">
                            Your intelligent banking companion for smarter financial decisions.
                        </p>
                    </div>

                    <div className="footer-links">
                        <div className="footer-column">
                            <h4>Product</h4>
                            <ul>
                                <li><a href="#features">Features</a></li>
                                <li><a href="#about">About</a></li>
                                <li><a href="#practice">Practice Mode</a></li>
                            </ul>
                        </div>

                        <div className="footer-column">
                            <h4>Company</h4>
                            <ul>
                                <li><a href="#about">About Us</a></li>
                                <li><a href="#contact">Contact</a></li>
                            </ul>
                        </div>

                        <div className="footer-column">
                            <h4>Legal</h4>
                            <ul>
                                <li><a href="#privacy">Privacy Policy</a></li>
                                <li><a href="#terms">Terms of Service</a></li>
                                <li><a href="#cookies">Cookie Policy</a></li>
                                <li><a href="#security">Security</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="footer-divider"></div>

                {/* Bottom Section */}
                <div className="footer-bottom">
                    <div className="footer-copyright">
                        <p>© {currentYear} FinScope AI. All rights reserved.</p>
                        <p className="footer-creator">
                            Created by <span className="creator-name">Mohammed Ageli</span> -
                            London South Bank University
                        </p>
                    </div>

                    <div className="footer-contact-mini">
                        <a href="mailto:mohammadmunir2004@gmail.com" className="footer-email">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                            </svg>
                            Personal Email
                        </a>
                        <a href="mailto:Finscopeai@gmail.com" className="footer-email">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
                            </svg>
                            Business Email
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;