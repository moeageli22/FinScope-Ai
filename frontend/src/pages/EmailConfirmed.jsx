import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../config/supabase';
import FinScopeAI from '../components/FinScopeAI.jsx';
import './EmailConfirmed.css';

const EmailConfirmed = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('verifying'); // verifying, success, error

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                // Get token from URL
                const token = searchParams.get('token');
                const type = searchParams.get('type');

                if (type === 'signup' && token) {
                    // Verify the token
                    const { data, error } = await supabase.auth.verifyOtp({
                        token_hash: token,
                        type: 'signup'
                    });

                    if (error) {
                        console.error('Verification error:', error);
                        setStatus('error');
                    } else {
                        setStatus('success');
                        // Redirect to login after 3 seconds
                        setTimeout(() => {
                            navigate('/login');
                        }, 3000);
                    }
                } else {
                    setStatus('error');
                }
            } catch (error) {
                console.error('Unexpected error:', error);
                setStatus('error');
            }
        };

        verifyEmail();
    }, [searchParams, navigate]);

    return (
        <div className="email-confirmed-page">
            <div className="email-confirmed-container">
                <div className="email-confirmed-logo">
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
                        <h1>Your Email Has Been Verified! ✓</h1>
                        <p className="success-message">
                            Welcome to <strong>FinScope AI</strong>! Your account is now active.
                        </p>
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
                        <p className="error-message">
                            We couldn't verify your email address. The link may have expired or is invalid.
                        </p>
                        <div className="error-actions">
                            <button
                                className="btn-try-again"
                                onClick={() => navigate('/register')}
                            >
                                Register Again
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

export default EmailConfirmed;