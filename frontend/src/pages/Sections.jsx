import React from 'react';
import './Sections.css';

export const AboutSection = () => {
    return (
        <section id="about" className="page-section about-section">
            <div className="section-container">
                <div className="section-header">
                    <h2>About FinScope AI</h2>
                    <p>Your intelligent financial companion</p>
                </div>
                <div className="section-content">
                    <div className="about-grid">
                        <div className="about-card">
                            <div className="about-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                                </svg>
                            </div>
                            <h3>AI-Powered Insights</h3>
                            <p>Get intelligent financial recommendations based on your spending patterns and goals.</p>
                        </div>
                        <div className="about-card">
                            <div className="about-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            </div>
                            <h3>Secure & Private</h3>
                            <p>Your financial data is encrypted and protected with industry-leading security standards.</p>
                        </div>
                        <div className="about-card">
                            <div className="about-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                                </svg>
                            </div>
                            <h3>Real-Time Tracking</h3>
                            <p>Monitor your finances in real-time with automated transaction tracking and categorization.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export const FeaturesSection = () => {
    return (
        <section id="features" className="page-section features-section">
            <div className="section-container">
                <div className="section-header">
                    <h2>Powerful Features</h2>
                    <p>Everything you need to manage your finances</p>
                </div>
                <div className="section-content">
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-number">01</div>
                            <h3>Smart Budgeting</h3>
                            <p>AI-powered budget recommendations that adapt to your lifestyle and financial goals.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-number">02</div>
                            <h3>Expense Analytics</h3>
                            <p>Visualize your spending patterns with detailed charts and insights.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-number">03</div>
                            <h3>Goal Tracking</h3>
                            <p>Set and achieve financial goals with personalized milestones and progress tracking.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-number">04</div>
                            <h3>Bill Reminders</h3>
                            <p>Never miss a payment with smart notifications and automatic bill tracking.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-number">05</div>
                            <h3>Multi-Account Support</h3>
                            <p>Connect and manage all your bank accounts and credit cards in one place.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-number">06</div>
                            <h3>Export Reports</h3>
                            <p>Generate comprehensive financial reports for tax season or personal review.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export const LiveExchangeSection = () => {
    return (
        <section id="live-exchange" className="page-section exchange-section">
            <div className="section-container">
                <div className="section-header">
                    <h2>Live Exchange Rates</h2>
                    <p>Real-time currency exchange rates</p>
                </div>
                <div className="section-content">
                    <div className="exchange-grid">
                        <div className="exchange-card">
                            <div className="currency-pair">
                                <span className="currency-flag">🇺🇸</span>
                                <span className="currency-code">USD/EUR</span>
                            </div>
                            <div className="exchange-rate">
                                <span className="rate">0.00</span>
                                <span className="change positive">+0%</span>
                            </div>
                        </div>
                        <div className="exchange-card">
                            <div className="currency-pair">
                                <span className="currency-flag">🇬🇧</span>
                                <span className="currency-code">GBP/USD</span>
                            </div>
                            <div className="exchange-rate">
                                <span className="rate">0.00</span>
                                <span className="change negative">-0%</span>
                            </div>
                        </div>
                        <div className="exchange-card">
                            <div className="currency-pair">
                                <span className="currency-flag">🇯🇵</span>
                                <span className="currency-code">JPY/USD</span>
                            </div>
                            <div className="exchange-rate">
                                <span className="rate">0.00</span>
                                <span className="change positive">+0%</span>
                            </div>
                        </div>
                        <div className="exchange-card">
                            <div className="currency-pair">
                                <span className="currency-flag">🇨🇭</span>
                                <span className="currency-code">CHF/USD</span>
                            </div>
                            <div className="exchange-rate">
                                <span className="rate">0.00</span>
                                <span className="change neutral">0%</span>
                            </div>
                        </div>
                    </div>
                    <p className="exchange-note">Exchange rates are updated in real-time. Data provided for informational purposes only.</p>
                </div>
            </div>
        </section>
    );
};

export const ContactSection = () => {
    return (
        <section id="contact" className="page-section contact-section">
            <div className="section-container">
                <div className="section-header">
                    <h2>Get in Touch</h2>
                    <p>We'd love to hear from you</p>
                </div>
                <div className="section-content">
                    <div className="contact-grid">
                        <div className="contact-info">
                            <div className="contact-card">
                                <div className="contact-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                </div>
                                <h3>Email</h3>
                                <p>support@finscope.ai</p>
                            </div>
                            <div className="contact-card">
                                <div className="contact-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                </div>
                                <h3>Location</h3>
                                <p>San Francisco, CA</p>
                            </div>
                            <div className="contact-card">
                                <div className="contact-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                    </svg>
                                </div>
                                <h3>Phone</h3>
                                <p>+1 (555) 123-4567</p>
                            </div>
                        </div>
                        <div className="contact-form">
                            <form>
                                <div className="form-group">
                                    <input type="text" placeholder="Your Name" className="form-input" />
                                </div>
                                <div className="form-group">
                                    <input type="email" placeholder="Your Email" className="form-input" />
                                </div>
                                <div className="form-group">
                                    <textarea placeholder="Your Message" className="form-textarea" rows="4"></textarea>
                                </div>
                                <button type="submit" className="form-submit">Send Message</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};