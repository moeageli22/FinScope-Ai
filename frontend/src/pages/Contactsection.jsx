import React, { useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import './ContactSection.css';
import ownerImage from '../assets/owner.jpg';

const ContactSection = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            console.log('Submitting form data:', formData);

            const response = await fetch('http://localhost:5173/api/send-contact-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    message: formData.message
                })
            });

            console.log('Response status:', response.status);

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Server did not return JSON response');
            }

            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok && data.success) {
                setSubmitStatus('success');
                setShowSuccessModal(true);
                setFormData({ name: '', email: '', message: '' });

                // Auto-close modal after 5 seconds
                setTimeout(() => {
                    setShowSuccessModal(false);
                }, 5000);
            } else {
                setSubmitStatus('error');
                console.error('Error sending email:', data.error || 'Unknown error');
            }
        } catch (error) {
            setSubmitStatus('error');
            console.error('Error submitting form:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeSuccessModal = () => {
        setShowSuccessModal(false);
    };

    return (
        <section className="contact-section">
            <div className="contact-container">
                <div className="contact-header">
                    <h2>Get in Touch</h2>
                    <p>Have questions? We'd love to hear from you.</p>
                </div>

                <div className="contact-content">
                    {/* Contact Info & Owner Section */}
                    <div className="contact-info-wrapper">
                        {/* Owner Card */}
                        <div className="owner-card">
                            <div className="owner-badge">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                                <span>Project Owner</span>
                            </div>

                            <div className="owner-image-wrapper">
                                <div className="owner-image-border">
                                    <img
                                        src={ownerImage}
                                        alt="Mohammed Ageli - Project Owner"
                                        className="owner-image"
                                    />
                                </div>
                            </div>

                            <div className="owner-info">
                                <h3>Mohammed Ageli</h3>
                                <p className="owner-title">Project Creator & Developer</p>
                                <p className="owner-university">London South Bank University</p>
                            </div>

                            <div className="owner-contact">
                                <a href="mailto:mohammadmunir2004@gmail.com" className="owner-email">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                    mohammadmunir2004@gmail.com
                                </a>

                                <a
                                    href="https://www.linkedin.com/in/mohammed-ageli-153346218/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="owner-linkedin"
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                    </svg>
                                    Connect on LinkedIn
                                </a>
                            </div>
                        </div>

                        {/* Contact Cards */}
                        <div className="contact-info-cards">
                            <div className="contact-info-card">
                                <div className="contact-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                        <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
                                    </svg>
                                </div>
                                <div className="contact-info-content">
                                    <h4>Business Email</h4>
                                    <a href="mailto:Finscopeai@gmail.com">Finscopeai@gmail.com</a>
                                </div>
                            </div>

                            <div className="contact-info-card">
                                <div className="contact-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                </div>
                                <div className="contact-info-content">
                                    <h4>Location</h4>
                                    <p>London, United Kingdom</p>
                                </div>
                            </div>

                            <div className="contact-info-card">
                                <div className="contact-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                </div>
                                <div className="contact-info-content">
                                    <h4>Response Time</h4>
                                    <p>Within 24-48 hours</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="contact-form-wrapper">
                        <div className="contact-form-header">
                            <h3>Send us a Message</h3>
                            <p>Fill out the form below and we'll get back to you as soon as possible.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="contact-form">
                            <div className="form-group">
                                <label htmlFor="name">Your Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Your Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="message">Your Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Tell us what you're thinking..."
                                    rows="6"
                                    required
                                ></textarea>
                            </div>

                            <button type="submit" className="submit-button" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <svg className="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                                            <path d="M12 2 A10 10 0 0 1 22 12" strokeLinecap="round" />
                                        </svg>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="22" y1="2" x2="11" y2="13" />
                                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                        </svg>
                                        Send Message
                                    </>
                                )}
                            </button>

                            {submitStatus === 'error' && (
                                <div className="submit-message error">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="15" y1="9" x2="9" y2="15" />
                                        <line x1="9" y1="9" x2="15" y2="15" />
                                    </svg>
                                    Something went wrong. Please try again or email us directly.
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>

            {/* Success Modal with Lottie Animation */}
            {showSuccessModal && (
                <div className="success-modal-overlay" onClick={closeSuccessModal}>
                    <div className="success-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="success-modal-close" onClick={closeSuccessModal}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>

                        <div className="success-animation">
                            <DotLottieReact
                                src="https://lottie.host/d45eb88a-85ee-468a-a030-5c186f2b9198/OvlJlYU07r.lottie"
                                loop={false}
                                autoplay
                                style={{ width: '200px', height: '200px' }}
                            />
                        </div>

                        <div className="success-modal-content">
                            <h2 className="success-modal-title">
                                Thank You for Contacting Us! 🎉
                            </h2>
                            <p className="success-modal-message">
                                Your message has been successfully received and we're excited to connect with you!
                            </p>

                            <div className="success-modal-details">
                                <div className="success-detail-item">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    <span>Confirmation email sent to your inbox</span>
                                </div>
                                <div className="success-detail-item">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    <span>We'll respond within 24-48 hours</span>
                                </div>
                                <div className="success-detail-item">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                    </svg>
                                    <span>Need urgent help? Call us directly</span>
                                </div>
                            </div>

                            <button className="success-modal-button" onClick={closeSuccessModal}>
                                Got It!
                            </button>

                            <p className="success-modal-footer">
                                This modal will close automatically in a few seconds
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default ContactSection;