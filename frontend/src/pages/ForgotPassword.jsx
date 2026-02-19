import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { supabase } from '../config/supabase';
import './ForgotPassword.css';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email input, 2: Code sent success
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setInterval(() => setResendCooldown(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [resendCooldown]);

    const sendResetCode = async (emailAddress) => {
        // Look up the user ID from their email
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('email', emailAddress)
            .single();

        if (profileError || !profile) {
            // Don't reveal if email exists — just silently succeed
            console.warn('User not found for email:', emailAddress);
            return null; // null = "pretend success"
        }

        const { error: fnError } = await supabase.functions.invoke('send-reset-code', {
            body: {
                email: emailAddress,
                userId: profile.id,
            }
        });

        return fnError;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) { setError('Email is required'); return; }
        if (!/\S+@\S+\.\S+/.test(email)) { setError('Please enter a valid email address'); return; }

        setLoading(true);
        setError('');

        try {
            const fnError = await sendResetCode(email);

            if (fnError) {
                console.error('Send reset code error:', fnError);
                // Still show success to avoid email enumeration
            }

            setStep(2);
            setResendCooldown(60);
        } catch (err) {
            console.error('Unexpected error:', err);
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0 || loading) return;
        setLoading(true);
        try {
            await sendResetCode(email);
            setResendCooldown(60);
        } catch (err) {
            console.error('Resend error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleContinueToReset = () => {
        navigate('/reset-password', { state: { email } });
    };

    return (
        <div className="forgot-password-page">
            <button className="back-button" onClick={() => navigate('/login')} disabled={loading}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to Login
            </button>

            <div className="forgot-password-container">
                {step === 1 ? (
                    <>
                        <div className="forgot-password-header">
                            <div className="forgot-password-logo-wrapper">
                                <DotLottieReact
                                    src="https://lottie.host/2e4ec950-754d-41a9-afa4-4f8547f03d6d/EUGeRQqAmF.lottie"
                                    loop
                                    autoplay
                                    style={{ width: '200px', height: '200px' }}
                                />
                            </div>
                            <h1 className="forgot-password-title">Forgot Your Password?</h1>
                            <p className="forgot-password-tagline">
                                Enter your email and we'll send you a 6-digit reset code.
                            </p>
                        </div>

                        <form className="forgot-password-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                    placeholder="you@example.com"
                                    className={error ? 'error' : ''}
                                    disabled={loading}
                                />
                                {error && <span className="error-message">{error}</span>}
                            </div>

                            <button type="submit" className="btn-reset-password" disabled={loading}>
                                {loading
                                    ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}><span className="spinner" /> Sending...</span>
                                    : 'Send Reset Code'
                                }
                            </button>

                            <button type="button" className="btn-back-login" onClick={() => navigate('/login')} disabled={loading}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M19 12H5M12 19l-7-7 7-7" />
                                </svg>
                                Back to Sign In
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="success-container">
                        <div className="success-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                            </svg>
                        </div>
                        <h2 className="success-title">Check Your Email</h2>
                        <p className="success-message">
                            We've sent a 6-digit reset code to<br />
                            <strong>{email}</strong>
                        </p>
                        <p className="success-note">
                            The code expires in 10 minutes. Check your spam folder if you don't see it.
                        </p>

                        <div className="success-actions">
                            <button className="btn-reset-password" onClick={handleContinueToReset}>
                                Enter Reset Code
                            </button>
                            <button
                                className="btn-resend"
                                onClick={handleResend}
                                disabled={loading || resendCooldown > 0}
                            >
                                {loading ? 'Sending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                            </button>
                            <button className="btn-back-login" onClick={() => navigate('/login')} disabled={loading}>
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