import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import FinScopeAI from '../components/FinScopeAI.jsx';
import { supabase } from '../config/supabase';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [activeTab, setActiveTab] = useState('signin');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

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

            if (event === 'SIGNED_IN' && session) {
                setMessage({
                    type: 'success',
                    text: 'Login successful! Redirecting to dashboard...'
                });
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1500);
            }

            if (event === 'SIGNED_OUT') {
                setMessage({ type: '', text: '' });
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

        // Clear errors and messages when user types
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: ''
            });
        }
        setMessage({ type: '', text: '' });
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            });

            if (error) {
                console.error('Login error:', error);

                // Handle specific error cases
                if (error.message.includes('Email not confirmed')) {
                    setMessage({
                        type: 'warning',
                        text: 'Please verify your email address. Check your inbox for the verification link.'
                    });
                } else if (error.message.includes('Invalid login credentials')) {
                    setMessage({
                        type: 'error',
                        text: 'Invalid email or password. Please try again.'
                    });
                } else {
                    setMessage({
                        type: 'error',
                        text: error.message || 'An error occurred during login.'
                    });
                }
                setLoading(false);
                return;
            }

            if (data.user) {
                console.log('User logged in:', data.user);
                setMessage({
                    type: 'success',
                    text: '✓ Login successful! Redirecting...'
                });

                // Redirect will be handled by the auth state change listener
            }

        } catch (error) {
            console.error('Unexpected error:', error);
            setMessage({
                type: 'error',
                text: 'An unexpected error occurred. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSignUpClick = () => {
        navigate('/register');
    };

    const handleBackClick = () => {
        navigate('/');
    };

    return (
        <div className="login-page">
            {/* Back Button */}
            <button className="back-button" onClick={handleBackClick}>
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
                    >
                        Sign In
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'signup' ? 'active' : ''}`}
                        onClick={handleSignUpClick}
                    >
                        Sign Up
                    </button>
                </div>

                {/* Message Alert */}
                {message.text && (
                    <div className={`message-alert ${message.type}`}>
                        <div className="message-icon">
                            {message.type === 'success' && (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                            )}
                            {message.type === 'error' && (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                            )}
                            {message.type === 'warning' && (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                    <line x1="12" y1="9" x2="12" y2="13" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                            )}
                        </div>
                        <p>{message.text}</p>
                    </div>
                )}

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
                                onClick={() => navigate('/forgot-password')}
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
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading}
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
                        By continuing, you agree to FinScope AI's <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;