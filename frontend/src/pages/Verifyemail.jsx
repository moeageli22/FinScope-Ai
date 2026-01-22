import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../config/supabase.js';
import FinScopeAI from '../components/FinScopeAI.jsx';
import './Verifyemail.css';

const VerifyEmail = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('verifying'); // verifying, success, error, expired
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const token = searchParams.get('token');

                if (!token) {
                    setStatus('error');
                    setMessage('Invalid verification link. No token provided.');
                    return;
                }

                // Check if token exists and is valid
                const { data: tokenData, error: tokenError } = await supabase
                    .from('email_verification_tokens')
                    .select('*')
                    .eq('token', token)
                    .eq('verified', false)
                    .single();

                if (tokenError || !tokenData) {
                    setStatus('error');
                    setMessage('Invalid or already used verification link.');
                    return;
                }

                // Check if token is expired
                const expiresAt = new Date(tokenData.expires_at);
                if (expiresAt < new Date()) {
                    setStatus('expired');
                    setMessage('This verification link has expired. Please request a new one.');
                    return;
                }

                // Mark token as verified
                const { error: updateError } = await supabase
                    .from('email_verification_tokens')
                    .update({ verified: true })
                    .eq('id', tokenData.id);

                if (updateError) {
                    setStatus('error');
                    setMessage('Failed to verify email. Please try again.');
                    return;
                }

                // Update user's email_confirmed_at in auth.users (if using Supabase auth)
                // This is automatically handled by Supabase when using their email confirmation flow
                // But we can also mark the user as verified in our system

                setStatus('success');
                setMessage('Your email has been successfully verified!');

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 3000);

            } catch (error) {
                console.error('Verification error:', error);
                setStatus('error');
                setMessage('An unexpected error occurred. Please try again.');
            }
        };

        verifyEmail();
    }, [searchParams, navigate]);

    const handleResendVerification = async () => {
        // Implement resend logic here
        // This would require knowing the user's email
        // You might want to navigate back to a page where they can request a new link
        navigate('/register');
    };

    return (
        <div className="verify-email-page">
            <div className="verify-email-container">
                <div className="verify-email-logo">
                    <FinScopeAI />
                </div>

                {status === 'verifying' && (
                    <div className="verification-content">
                        <div className="verification-spinner">
                            <div className="spinner-ring"></div>
                        </div>
                        <h1>Verifying Your Email...</h1>
                        <p>Please wait while we confirm your email address.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="verification-content success">
                        <div className="success-checkmark">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                        </div>
                        <h1>Email Verified! ✓</h1>
                        <p className="success-message">{message}</p>
                        <p className="redirect-message">
                            Redirecting you to login in a few seconds...
                        </p>
                        <button
                            className="btn-continue"
                            onClick={() => navigate('/login')}
                        >
                            Continue to Login
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="verification-content error">
                        <div className="error-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                        </div>
                        <h1>Verification Failed</h1>
                        <p className="error-message">{message}</p>
                        <div className="error-actions">
                            <button
                                className="btn-try-again"
                                onClick={handleResendVerification}
                            >
                                Request New Link
                            </button>
                            <button
                                className="btn-contact"
                                onClick={() => navigate('/')}
                            >
                                Back to Home
                            </button>
                        </div>
                    </div>
                )}

                {status === 'expired' && (
                    <div className="verification-content expired">
                        <div className="expired-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                        </div>
                        <h1>Link Expired</h1>
                        <p className="error-message">{message}</p>
                        <div className="error-actions">
                            <button
                                className="btn-try-again"
                                onClick={handleResendVerification}
                            >
                                Request New Link
                            </button>
                            <button
                                className="btn-contact"
                                onClick={() => navigate('/')}
                            >
                                Back to Home
                            </button>
                        </div>
                    </div>
                )}

                <div className="finscope-info">
                    <h3>What's Next?</h3>
                    <div className="info-cards">
                        <div className="info-card">
                            <div className="info-icon">📊</div>
                            <h4>Smart Analytics</h4>
                            <p>AI-powered insights for your finances</p>
                        </div>
                        <div className="info-card">
                            <div className="info-icon">🤖</div>
                            <h4>AI Assistant</h4>
                            <p>24/7 personalized financial guidance</p>
                        </div>
                        <div className="info-card">
                            <div className="info-icon">🔒</div>
                            <h4>Bank-Level Security</h4>
                            <p>Your data is always protected</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;