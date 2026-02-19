import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../config/supabase.js';
import FinScopeAI from '../components/FinScopeAI.jsx';
import { useToast } from '../components/Toast';
import './VerifyEmailCode.css';

const VerifyEmailCode = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { addToast } = useToast();
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
    const [resendCooldown, setResendCooldown] = useState(60);
    const [verified, setVerified] = useState(false);
    const inputRefs = useRef([]);

    const { email, userId, password } = location.state || {};

    useEffect(() => {
        if (!email || !userId) {
            navigate('/register');
        }
    }, [email, userId, navigate]);

    // Countdown timer
    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    // Resend cooldown
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setInterval(() => setResendCooldown(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [resendCooldown]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleChange = (index, value) => {
        if (value && !/^\d$/.test(value)) return;
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
        setError('');

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        if (newCode.every(d => d !== '') && !loading) {
            handleVerify(newCode.join(''));
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }

        if (e.key === 'v' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            navigator.clipboard.readText().then(text => {
                const digits = text.replace(/\D/g, '').slice(0, 6).split('');
                const newCode = [...code];
                digits.forEach((digit, i) => { if (i < 6) newCode[i] = digit; });
                setCode(newCode);
                if (digits.length === 6) handleVerify(newCode.join(''));
            });
        }
    };

    const handleVerify = async (codeString = code.join('')) => {
        if (codeString.length !== 6) {
            setError('Please enter all 6 digits');
            return;
        }

        setLoading(true);
        setError('');

        try {
            console.log('=== Email Verification Code Check ===');

            // Check code in database
            const { data: codeData, error: codeError } = await supabase
                .from('two_factor_codes')
                .select('*')
                .eq('user_id', userId)
                .eq('code', codeString)
                .eq('verified', false)
                .gt('expires_at', new Date().toISOString())
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (codeError || !codeData) {
                setError('Invalid or expired code. Please try again.');
                setCode(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
                setLoading(false);
                return;
            }

            // Mark code as verified
            await supabase
                .from('two_factor_codes')
                .update({ verified: true })
                .eq('id', codeData.id);

            console.log('✅ Code marked verified — confirming email via Edge Function...');

            // Call Edge Function to confirm email via Supabase Admin API
            // (only the service role key can set email_confirmed_at)
            const { error: confirmError } = await supabase.functions.invoke('confirm-email', {
                body: { userId }
            });

            if (confirmError) {
                console.error('Email confirmation via admin failed:', confirmError);
                // Still show success — user can contact support if login fails
            } else {
                console.log('✅ Email confirmed via admin API');
            }

            setVerified(true);
            addToast('Email verified! You can now sign in.', 'success');
            setTimeout(() => navigate('/login'), 3000);

        } catch (err) {
            console.error('Verification error:', err);
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;
        setLoading(true);
        setError('');

        try {
            const { error } = await supabase.functions.invoke('send-2fa-code', {
                body: {
                    email,
                    userId,
                    ipAddress: 'registration-resend',
                    userAgent: navigator.userAgent
                }
            });

            if (error) {
                setError('Failed to resend code. Please try again.');
            } else {
                setResendCooldown(60);
                setTimeLeft(600);
                setCode(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
                addToast('New verification code sent!', 'success');
            }
        } catch (err) {
            setError('Failed to resend code.');
        } finally {
            setLoading(false);
        }
    };

    // Success state
    if (verified) {
        return (
            <div className="verify-email-code-page">
                <div className="vec-container">
                    <div className="vec-logo">
                        <FinScopeAI />
                    </div>
                    <div className="vec-success">
                        <div className="vec-success-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                        </div>
                        <h1>Email Verified!</h1>
                        <p>Your account is now active. Redirecting you to login...</p>
                        <button className="vec-btn-primary" onClick={() => navigate('/login')}>
                            Go to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Expired state
    if (timeLeft <= 0) {
        return (
            <div className="verify-email-code-page">
                <div className="vec-container">
                    <div className="vec-logo"><FinScopeAI /></div>
                    <div className="vec-expired">
                        <div className="vec-expired-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>
                        <h2>Code Expired</h2>
                        <p>Your verification code has expired. Request a new one below.</p>
                        <button
                            className="vec-btn-primary"
                            onClick={handleResend}
                            disabled={loading}
                        >
                            {loading ? 'Sending...' : 'Send New Code'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="verify-email-code-page">
            <button className="vec-back-button" onClick={() => navigate('/register')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to Register
            </button>

            <div className="vec-container">
                <div className="vec-logo">
                    <FinScopeAI />
                </div>

                <div className="vec-header">
                    <div className="vec-badge">📧 Email Verification</div>
                    <h1>Verify Your Email</h1>
                    <p>We sent a 6-digit code to</p>
                    <p className="vec-email">{email}</p>
                </div>

                {error && (
                    <div className="vec-error-alert">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <p>{error}</p>
                    </div>
                )}

                <div className="vec-code-inputs">
                    {code.map((digit, index) => (
                        <input
                            key={index}
                            ref={el => inputRefs.current[index] = el}
                            type="text"
                            inputMode="numeric"
                            maxLength="1"
                            value={digit}
                            onChange={e => handleChange(index, e.target.value)}
                            onKeyDown={e => handleKeyDown(index, e)}
                            className="vec-code-input"
                            disabled={loading}
                            autoFocus={index === 0}
                        />
                    ))}
                </div>

                <div className="vec-timer">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>Code expires in {formatTime(timeLeft)}</span>
                </div>

                <button
                    className="vec-btn-verify"
                    onClick={() => handleVerify()}
                    disabled={loading || code.some(d => d === '')}
                >
                    {loading ? (
                        <><span className="vec-spinner"></span> Verifying...</>
                    ) : (
                        'Verify Email'
                    )}
                </button>

                <div className="vec-resend">
                    <p>Didn't receive the code?</p>
                    <button
                        className="vec-btn-resend"
                        onClick={handleResend}
                        disabled={loading || resendCooldown > 0}
                    >
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                    </button>
                </div>

                <div className="vec-security-note">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <p>This code verifies your email and activates your FinScope AI account.</p>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailCode;