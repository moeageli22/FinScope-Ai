import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { supabase } from '../config/supabase';
import './ForgotPassword.css';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email input, 2: Success
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    const sendResetEmail = async (emailAddress) => {
        // Use the current origin so it works both locally and when deployed
        const redirectUrl = `${window.location.origin}/reset-password`;
        console.log('Reset redirect URL:', redirectUrl);

        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
            emailAddress,
            { redirectTo: redirectUrl }
        );
        return resetError;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            setError('Email is required');
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const resetError = await sendResetEmail(email);

            if (resetError) {
                console.error('Reset error:', resetError);
                if (resetError.message.includes('rate limit') || resetError.status === 429) {
                    setError('Too many requests. Please wait a moment and try again.');
                    setLoading(false);
                    return;
                }
                // Still show success for other errors to avoid email enumeration
                console.warn('Reset error (showing success anyway):', resetError.message);
            }

            console.log('✅ Password reset email sent to:', email);
            setStep(2);
            startResendCooldown();

        } catch (err) {
            console.error('Unexpected error:', err);
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const startResendCooldown = () => {
        setResendCooldown(60);
        const interval = setInterval(() => {
            setResendCooldown(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleResend = async () => {
        if (resendCooldown > 0 || loading) return;

        setLoading(true);
        try {
            await sendResetEmail(email);
            startResendCooldown();
            console.log('✅ Reset email resent to:', email);
        } catch (err) {
            console.error('Resend error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLogin = () => {
        navigate('/login');
    };

    return (
        <div className="forgot-password-page">
            {/* Back Button */}
            <button className="back-button" onClick={handleBackToLogin} disabled={loading}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to Login
            </button>

            <div className="forgot-password-container">
                {step === 1 ? (
                    <>
                        {/* Header */}
                        <div className="forgot-password-header">
                            <div className="forgot-password-logo-wrapper">
                                <DotLottieReact
                                    src="https://lottie.host/2e4ec950-754d-41a9-afa4-4f8547f03d6d/EUGeRQqAmF.lottie"
                                    loop
                                    autoplay
                                    style={{ width: '200px', height: '200px' }}
                                />
                            </div>
                            <h1 className="forgot-password-title">
                                Forgot Your Password?
                            </h1>
                            <p className="forgot-password-tagline">
                                No worries! Enter your email and we'll send you reset instructions.
                            </p>
                        </div>

                        {/* Reset Form */}
                        <form className="forgot-password-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setError('');
                                    }}
                                    placeholder="you@example.com"
                                    className={error ? 'error' : ''}
                                    disabled={loading}
                                />
                                {error && <span className="error-message">{error}</span>}
                            </div>

                            <button
                                type="submit"
                                className="btn-reset-password"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                        <span className="spinner" />
                                        Sending...
                                    </span>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </button>

                            <button
                                type="button"
                                className="btn-back-login"
                                onClick={handleBackToLogin}
                                disabled={loading}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M19 12H5M12 19l-7-7 7-7" />
                                </svg>
                                Back to Sign In
                            </button>
                        </form>
                    </>
                ) : (
                    /* Success Message */
                    <div className="success-container">
                        <div className="success-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                        </div>
                        <h2 className="success-title">Check Your Email</h2>
                        <p className="success-message">
                            We've sent password reset instructions to<br />
                            <strong>{email}</strong>
                        </p>
                        <p className="success-note">
                            Didn't receive the email? Check your spam folder or try again.
                        </p>

                        <div className="success-actions">
                            <button
                                className="btn-resend"
                                onClick={handleResend}
                                disabled={loading || resendCooldown > 0}
                            >
                                {loading
                                    ? 'Sending...'
                                    : resendCooldown > 0
                                        ? `Resend in ${resendCooldown}s`
                                        : 'Resend Email'
                                }
                            </button>
                            <button
                                className="btn-back-login"
                                onClick={handleBackToLogin}
                                disabled={loading}
                            >
                                Back to Sign In
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;