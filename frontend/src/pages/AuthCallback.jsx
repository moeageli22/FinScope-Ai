import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import FinScopeAI from '../components/FinScopeAI.jsx';
import './EmailConfirmed.css';

const AuthCallback = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        handleAuthCallback();
    }, []);

    useEffect(() => {
        if (status === 'success' && countdown > 0) {
            const timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        navigate('/login');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [status, countdown, navigate]);

    const handleAuthCallback = async () => {
        try {
            console.log('=== Auth Callback ===');
            console.log('URL:', window.location.href);

            const params = new URLSearchParams(window.location.search);

            // Check for errors in URL first (expired/invalid links)
            const urlError = params.get('error');
            const urlErrorCode = params.get('error_code');
            if (urlError || urlErrorCode) {
                console.error('URL error:', urlError, urlErrorCode);
                setStatus('error');
                return;
            }

            // Exchange PKCE code for session
            const code = params.get('code');
            if (code) {
                console.log('Exchanging PKCE code...');
                const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(window.location.href);
                if (exchangeError) {
                    console.error('Code exchange error:', exchangeError);
                    setStatus('error');
                    return;
                }
                console.log('Code exchanged successfully');
            }

            // Listen for auth state change to determine type of callback
            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
                console.log('Auth event:', event, '| Has session:', !!session);

                if (event === 'PASSWORD_RECOVERY') {
                    // Password reset - go to reset form (session stays active)
                    console.log('PASSWORD_RECOVERY - navigating to /reset-password');
                    subscription.unsubscribe();
                    navigate('/reset-password');
                    return;
                }

                if (event === 'SIGNED_IN' && session) {
                    const type = params.get('type');
                    if (type === 'recovery') {
                        console.log('Recovery SIGNED_IN - navigating to /reset-password');
                        subscription.unsubscribe();
                        navigate('/reset-password');
                        return;
                    }

                    // Email confirmation flow
                    console.log('Email confirmed for:', session.user.email);
                    subscription.unsubscribe();
                    await supabase.auth.signOut();
                    setStatus('success');
                }
            });

            // Fallback: check existing session after a short wait
            setTimeout(async () => {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    console.log('Fallback session found, treating as email confirmation');
                    setStatus(prev => {
                        if (prev === 'verifying') {
                            supabase.auth.signOut();
                            return 'success';
                        }
                        return prev;
                    });
                } else {
                    setStatus(prev => prev === 'verifying' ? 'error' : prev);
                }
            }, 5000);

        } catch (error) {
            console.error('Unexpected error during auth callback:', error);
            setStatus('error');
        }
    };

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
                        <h1>Verifying...</h1>
                        <p>Please wait while we process your link.</p>
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
                        <p className="success-message">
                            Welcome to <strong>FinScope AI</strong>! Your account is now active.
                        </p>
                        <p className="redirect-message">
                            Redirecting you to login in {countdown} seconds...
                        </p>
                        <button className="btn-continue" onClick={() => navigate('/login')}>
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
                        <h1>Link Expired or Invalid</h1>
                        <p className="error-message">
                            This link has expired or is no longer valid.
                        </p>
                        <div className="error-actions">
                            <button className="btn-try-again" onClick={() => navigate('/forgot-password')}>
                                Reset Password Again
                            </button>
                            <button className="btn-contact" onClick={() => navigate('/')}>
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

export default AuthCallback;