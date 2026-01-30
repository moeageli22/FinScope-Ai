import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import FinScopeAI from '../components/FinScopeAI.jsx';
import { supabase } from '../config/supabase';
import { useToast } from '../components/Toast';

const Login = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [activeTab, setActiveTab] = useState('signin');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Check if user is already logged in
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                navigate('/dashboard');
            }
        };
        checkSession();
    }, [navigate]);

    // Listen for auth state changes
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth event:', event);

            if (event === 'SIGNED_OUT') {
                // Clear any messages
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Clear errors when user types
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Helper function to get IP address
    const getIPAddress = async () => {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            console.error('Failed to get IP:', error);
            return 'Unknown';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            addToast('Please fix the errors in the form', 'error');
            return;
        }

        setLoading(true);

        try {
            console.log('=== Login Flow Started ===');
            console.log('Attempting to sign in with email:', formData.email);

            // Step 1: Verify credentials
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            });

            if (signInError) {
                console.error('Sign in error:', signInError);

                // Log failed attempt
                try {
                    await supabase.from('login_attempts').insert({
                        email: formData.email,
                        success: false,
                        ip_address: await getIPAddress(),
                    });
                } catch (logError) {
                    console.error('Failed to log attempt:', logError);
                }

                addToast('Invalid email or password', 'error');
                setLoading(false);
                return;
            }

            console.log('✅ Credentials verified successfully');
            console.log('User ID:', signInData.user.id);

            // Step 2: Sign out immediately (we'll re-authenticate after 2FA)
            await supabase.auth.signOut();
            console.log('✅ Signed out (temporary for 2FA flow)');

            // Step 3: Get IP address for security logging
            const ipAddress = await getIPAddress();
            console.log('IP Address:', ipAddress);

            // Step 4: Prepare 2FA request
            const requestBody = {
                email: formData.email,
                userId: signInData.user.id,
                ipAddress: ipAddress,
                userAgent: navigator.userAgent
            };

            console.log('Sending 2FA request with body:', {
                email: requestBody.email,
                userId: requestBody.userId,
                hasIpAddress: !!requestBody.ipAddress,
                hasUserAgent: !!requestBody.userAgent
            });

            // Step 5: Invoke 2FA function
            const { data: functionData, error: functionError } = await supabase.functions.invoke('send-2fa-code', {
                body: requestBody
            });

            console.log('2FA Function Response:', functionData);

            if (functionError) {
                console.error('❌ 2FA Function Error:', functionError);
                console.error('Error details:', JSON.stringify(functionError, null, 2));

                addToast('Failed to send verification code. Please try again.', 'error');
                setLoading(false);
                return;
            }

            // Check if function returned success
            if (functionData && !functionData.success) {
                console.error('❌ Function returned unsuccessful:', functionData);
                addToast(functionData.error || 'Failed to send verification code', 'error');
                setLoading(false);
                return;
            }

            console.log('✅ 2FA code sent successfully');

            // Show success message
            addToast('Verification code sent to your email', 'success');

            // Show warning if email wasn't sent (no API key configured)
            if (functionData?.warning) {
                console.warn('⚠️', functionData.warning);
                addToast('Email service not configured - Check console for code', 'warning', 10000);
                // For testing: show the code
                if (functionData.code) {
                    console.log('🔑 TEST CODE:', functionData.code);
                }
            }

            console.log('✅ Navigating to 2FA verification page');

            // Step 6: Navigate to 2FA verification page
            navigate('/verify-2fa', {
                state: {
                    email: formData.email,
                    userId: signInData.user.id,
                    password: formData.password
                }
            });

        } catch (error) {
            console.error('❌ Unexpected error in login flow:', error);
            console.error('Error type:', error.constructor.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);

            addToast('An unexpected error occurred. Please try again.', 'error');
            setLoading(false);
        }
    };

    const handleSignUpClick = () => {
        navigate('/register');
    };

    const handleBackClick = () => {
        navigate('/');
    };

    const handleForgotPassword = () => {
        navigate('/forgot-password');
    };

    return (
        <div className="login-page">
            {/* Back Button */}
            <button className="back-button" onClick={handleBackClick} disabled={loading}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back
            </button>

            <div className="login-container">
                {/* Logo and Title */}
                <div className="login-header">
                    <div className="login-logo-wrapper">
                        <FinScopeAI />
                    </div>
                    <h1 className="login-title">
                        FinScope <span className="ai-gradient">AI</span>
                    </h1>
                    <p className="login-tagline">Your intelligent banking companion</p>
                </div>

                {/* Tabs */}
                <div className="login-tabs">
                    <button
                        className={`tab-button ${activeTab === 'signin' ? 'active' : ''}`}
                        onClick={() => setActiveTab('signin')}
                        disabled={loading}
                    >
                        Sign In
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'signup' ? 'active' : ''}`}
                        onClick={handleSignUpClick}
                        disabled={loading}
                    >
                        Sign Up
                    </button>
                </div>

                {/* Login Form */}
                <form className="login-form" onSubmit={handleSubmit}>
                    {/* Email Field */}
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            className={errors.email ? 'error' : ''}
                            disabled={loading}
                            autoComplete="email"
                        />
                        {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>

                    {/* Password Field */}
                    <div className="form-group">
                        <div className="password-label-wrapper">
                            <label htmlFor="password">Password</label>
                            <button
                                type="button"
                                className="forgot-password-link"
                                onClick={handleForgotPassword}
                                disabled={loading}
                            >
                                Forgot Password?
                            </button>
                        </div>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className={errors.password ? 'error' : ''}
                                disabled={loading}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {errors.password && <span className="error-message">{errors.password}</span>}
                    </div>

                    {/* Sign In Button */}
                    <button
                        type="submit"
                        className="btn-sign-in-primary"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Signing In...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>

                    {/* Sign Up Link */}
                    <p className="signup-link">
                        Don't have an account? <button type="button" onClick={handleSignUpClick} disabled={loading}>Sign up</button>
                    </p>

                    {/* Terms & Privacy */}
                    <p className="terms-text">
                        By continuing, you agree to FinScope AI's <a href="/terms">Terms of Service</a> and <a href="/terms">Privacy Policy</a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;