import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../config/supabase.js';
import FinScopeAI from '../components/FinScopeAI.jsx';
import './Verify2FA.css';

const Verify2FA = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
    const [resendCooldown, setResendCooldown] = useState(0);
    const inputRefs = useRef([]);

    const { email, userId, password } = location.state || {};

    useEffect(() => {
        if (!email || !userId) {
            navigate('/login');
        }
    }, [email, userId, navigate]);

    // Countdown timer
    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown <= 0) return;

        const timer = setInterval(() => {
            setResendCooldown((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [resendCooldown]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleChange = (index, value) => {
        // Only allow numbers
        if (value && !/^\d$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
        setError('');

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all fields are filled
        if (newCode.every(digit => digit !== '') && !loading) {
            handleVerify(newCode.join(''));
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }

        // Handle paste
        if (e.key === 'v' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            navigator.clipboard.readText().then(text => {
                const digits = text.replace(/\D/g, '').slice(0, 6).split('');
                const newCode = [...code];
                digits.forEach((digit, i) => {
                    if (i < 6) newCode[i] = digit;
                });
                setCode(newCode);

                if (digits.length === 6) {
                    handleVerify(newCode.join(''));
                }
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
            // Verify the code from database
            const { data: codeData, error: codeError } = await supabase
                .from('two_factor_codes')
                .select('*')
                .eq('user_id', userId)
                .eq('code', codeString)
                .eq('used', false)  // ✅ Changed from 'verified' to 'used'
                .gt('expires_at', new Date().toISOString())
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (codeError || !codeData) {
                console.error('Code verification error:', codeError);
                setError('Invalid or expired code. Please try again.');
                setCode(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
                setLoading(false);
                return;
            }

            // Mark code as used
            const { error: updateError } = await supabase
                .from('two_factor_codes')
                .update({ used: true })  // ✅ Changed from 'verified' to 'used'
                .eq('id', codeData.id);

            if (updateError) {
                console.error('Error updating code status:', updateError);
                setError('An error occurred. Please try again.');
                setLoading(false);
                return;
            }

            // Now sign in the user
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (signInError) {
                console.error('Sign in error:', signInError);
                setError('Authentication failed. Please try logging in again.');
                setLoading(false);
                return;
            }

            // Log successful login
            await supabase.from('login_attempts').insert({
                email: email,
                success: true,
                ip_address: await getIPAddress(),
            });

            // Success - redirect to dashboard
            navigate('/dashboard');

        } catch (error) {
            console.error('Verification error:', error);
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
                    email: email,
                    userId: userId,
                    ipAddress: await getIPAddress(),
                    userAgent: navigator.userAgent
                }
            });

            if (error) {
                console.error('Resend error:', error);
                setError('Failed to resend code. Please try again.');
            } else {
                setResendCooldown(60); // 60 second cooldown
                setTimeLeft(600); // Reset timer
                setCode(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        } catch (error) {
            console.error('Resend exception:', error);
            setError('Failed to resend code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getIPAddress = async () => {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch {
            return 'Unknown';
        }
    };

    if (timeLeft <= 0) {
        return (
            <div className="verify-2fa-page">
                <div className="verify-2fa-container">
                    <div className="verify-logo-wrapper">
                        <FinScopeAI />
                    </div>

                    <div className="expired-state">
                        <div className="expired-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>
                        <h2>Code Expired</h2>
                        <p>Your verification code has expired. Please return to the login page and try again.</p>
                        <button
                            className="btn-back-to-login"
                            onClick={() => navigate('/login')}
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="verify-2fa-page">
            <button className="back-button" onClick={() => navigate('/login')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to Login
            </button>

            <div className="verify-2fa-container">
                <div className="verify-logo-wrapper">
                    <FinScopeAI />
                </div>

                <div className="verify-header">
                    <h1>Enter Verification Code</h1>
                    <p>We've sent a 6-digit code to</p>
                    <p className="email-display">{email}</p>
                </div>

                {error && (
                    <div className="error-alert">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <p>{error}</p>
                    </div>
                )}

                <div className="code-input-container">
                    {code.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => (inputRefs.current[index] = el)}
                            type="text"
                            inputMode="numeric"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className="code-input"
                            disabled={loading}
                            autoFocus={index === 0}
                        />
                    ))}
                </div>

                <div className="timer-display">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>Code expires in {formatTime(timeLeft)}</span>
                </div>

                <button
                    onClick={() => handleVerify()}
                    className="btn-verify"
                    disabled={loading || code.some(d => d === '')}
                >
                    {loading ? (
                        <>
                            <span className="spinner"></span>
                            Verifying...
                        </>
                    ) : (
                        'Verify Code'
                    )}
                </button>

                <div className="resend-section">
                    <p>Didn't receive the code?</p>
                    <button
                        onClick={handleResend}
                        className="btn-resend"
                        disabled={loading || resendCooldown > 0}
                    >
                        {resendCooldown > 0
                            ? `Resend in ${resendCooldown}s`
                            : 'Resend Code'}
                    </button>
                </div>

                <div className="security-note">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <p>Never share this code with anyone. FinScope AI will never ask for your verification code.</p>
                </div>
            </div>
        </div>
    );
};

export default Verify2FA;