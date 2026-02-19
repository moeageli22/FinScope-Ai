import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../config/supabase';
import './ResetPassword.css';

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || '';

    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1); // 1: code+password, 2: success
    const [timeLeft, setTimeLeft] = useState(600);
    const inputRefs = useRef([]);

    useEffect(() => {
        if (!email) navigate('/forgot-password');
    }, [email, navigate]);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
        return () => clearInterval(t);
    }, [timeLeft]);

    const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    const handleCodeChange = (index, value) => {
        if (value && !/^\d$/.test(value)) return;
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
        setError('');
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
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
                digits.forEach((d, i) => { if (i < 6) newCode[i] = d; });
                setCode(newCode);
            });
        }
    };

    const validatePassword = () => {
        if (newPassword.length < 8) return 'Password must be at least 8 characters';
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) return 'Password must contain uppercase, lowercase, and a number';
        if (newPassword !== confirmPassword) return 'Passwords do not match';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const codeString = code.join('');

        if (codeString.length !== 6) { setError('Please enter all 6 digits of your reset code'); return; }

        const pwError = validatePassword();
        if (pwError) { setError(pwError); return; }

        setLoading(true);
        setError('');

        try {
            // Step 1: Look up userId from email
            const { data: profile, error: profileError } = await supabase
                .from('user_profiles')
                .select('id')
                .eq('email', email)
                .single();

            if (profileError || !profile) {
                setError('Account not found. Please try again.');
                setLoading(false);
                return;
            }

            // Step 2: Verify reset code
            const { data: codeData, error: codeError } = await supabase
                .from('password_reset_codes')
                .select('*')
                .eq('user_id', profile.id)
                .eq('code', codeString)
                .eq('used', false)
                .gt('expires_at', new Date().toISOString())
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (codeError || !codeData) {
                setError('Invalid or expired code. Please request a new one.');
                setCode(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
                setLoading(false);
                return;
            }

            // Step 3: Call Edge Function to update password via admin API
            const { error: resetError } = await supabase.functions.invoke('reset-password', {
                body: { userId: profile.id, newPassword, codeId: codeData.id }
            });

            if (resetError) {
                setError('Failed to reset password. Please try again.');
                setLoading(false);
                return;
            }

            setStep(2);
        } catch (err) {
            console.error('Reset error:', err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (step === 2) {
        return (
            <div className="reset-password-page">
                <div className="rp-container">
                    <div className="rp-success-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    </div>
                    <h1>Password Reset!</h1>
                    <p>Your password has been successfully updated. You can now sign in with your new password.</p>
                    <button className="rp-btn-primary" onClick={() => navigate('/login')}>
                        Go to Sign In
                    </button>
                </div>
            </div>
        );
    }

    if (timeLeft <= 0) {
        return (
            <div className="reset-password-page">
                <div className="rp-container">
                    <div className="rp-expired-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>
                    <h1>Code Expired</h1>
                    <p>Your reset code has expired. Please request a new one.</p>
                    <button className="rp-btn-primary" onClick={() => navigate('/forgot-password')}>
                        Request New Code
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="reset-password-page">
            <button className="rp-back-button" onClick={() => navigate('/forgot-password')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back
            </button>

            <div className="rp-container">
                <div className="rp-header">
                    <div className="rp-badge">🔑 Password Reset</div>
                    <h1>Reset Your Password</h1>
                    <p>Enter the 6-digit code sent to</p>
                    <p className="rp-email">{email}</p>
                </div>

                {error && (
                    <div className="rp-error-alert">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Code inputs */}
                    <label className="rp-label">Reset Code</label>
                    <div className="rp-code-inputs">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                ref={el => inputRefs.current[index] = el}
                                type="text"
                                inputMode="numeric"
                                maxLength="1"
                                value={digit}
                                onChange={e => handleCodeChange(index, e.target.value)}
                                onKeyDown={e => handleKeyDown(index, e)}
                                className="rp-code-input"
                                disabled={loading}
                                autoFocus={index === 0}
                            />
                        ))}
                    </div>

                    <div className="rp-timer">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>Code expires in {formatTime(timeLeft)}</span>
                    </div>

                    {/* New Password */}
                    <div className="rp-form-group">
                        <label className="rp-label">New Password</label>
                        <div className="rp-password-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={e => { setNewPassword(e.target.value); setError(''); }}
                                placeholder="Create a strong password"
                                className="rp-input"
                                disabled={loading}
                            />
                            <button type="button" className="rp-toggle-password" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword
                                    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                }
                            </button>
                        </div>
                        <div className="rp-requirements">
                            <div className={`rp-req ${newPassword.length >= 8 ? 'met' : ''}`}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                                At least 8 characters
                            </div>
                            <div className={`rp-req ${/[A-Z]/.test(newPassword) ? 'met' : ''}`}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                                One uppercase letter
                            </div>
                            <div className={`rp-req ${/[a-z]/.test(newPassword) ? 'met' : ''}`}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                                One lowercase letter
                            </div>
                            <div className={`rp-req ${/\d/.test(newPassword) ? 'met' : ''}`}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                                One number
                            </div>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="rp-form-group">
                        <label className="rp-label">Confirm New Password</label>
                        <div className="rp-password-wrapper">
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                                placeholder="Confirm your password"
                                className="rp-input"
                                disabled={loading}
                            />
                            <button type="button" className="rp-toggle-password" onClick={() => setShowConfirm(!showConfirm)}>
                                {showConfirm
                                    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                }
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="rp-btn-primary" disabled={loading || code.some(d => d === '')}>
                        {loading ? <><span className="rp-spinner"></span> Resetting...</> : 'Reset Password'}
                    </button>
                </form>

                <div className="rp-resend">
                    <p>Didn't get the code? <button className="rp-resend-link" onClick={() => navigate('/forgot-password')}>Request a new one</button></p>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;