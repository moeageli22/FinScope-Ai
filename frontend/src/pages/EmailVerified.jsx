// frontend/src/pages/EmailVerified.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useToast } from '../components/Toast';
import './EmailVerified.css';

const EmailVerified = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        verifyEmail();
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

    const verifyEmail = async () => {
        const token = searchParams.get('token');

        if (!token) {
            setStatus('error');
            addToast('Invalid verification link', 'error');
            return;
        }

        try {
            // Verify token
            const { data, error } = await supabase
                .from('email_verification_tokens')
                .select('user_id, expires_at')
                .eq('token', token)
                .single();

            if (error || !data) {
                setStatus('error');
                addToast('Invalid or expired verification link', 'error');
                return;
            }

            // Check if expired
            if (new Date(data.expires_at) < new Date()) {
                setStatus('error');
                addToast('Verification link has expired', 'error');
                return;
            }

            // Update user email verification status
            const { error: updateError } = await supabase.auth.admin.updateUserById(
                data.user_id,
                { email_confirmed_at: new Date().toISOString() }
            );

            if (updateError) {
                setStatus('error');
                addToast('Failed to verify email', 'error');
                return;
            }

            // Delete token
            await supabase
                .from('email_verification_tokens')
                .delete()
                .eq('token', token);

            setStatus('success');
            addToast('Email verified successfully!', 'success');

        } catch (error) {
            console.error('Verification error:', error);
            setStatus('error');
            addToast('An error occurred during verification', 'error');
        }
    };

    return (
        <div className="email-verified-page">
            <div className="verification-container">
                {status === 'verifying' && (
                    <>
                        <div className="loading-spinner"></div>
                        <h1>Verifying your email...</h1>
                        <p>Please wait while we verify your email address.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="success-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                        </div>
                        <h1>Email Verified!</h1>
                        <p>Your email has been successfully verified.</p>
                        <p className="redirect-text">
                            Redirecting to login in {countdown} seconds...
                        </p>
                        <button
                            className="btn-primary"
                            onClick={() => navigate('/login')}
                        >
                            Go to Login Now
                        </button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="error-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>
                        <h1>Verification Failed</h1>
                        <p>We couldn't verify your email address.</p>
                        <div className="error-actions">
                            <button
                                className="btn-primary"
                                onClick={() => navigate('/login')}
                            >
                                Back to Login
                            </button>
                            <button
                                className="btn-secondary"
                                onClick={() => navigate('/register')}
                            >
                                Create New Account
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default EmailVerified;