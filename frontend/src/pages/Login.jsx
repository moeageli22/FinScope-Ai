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
    const [activeTab, setActiveTab] = useState('signin'); // 'signin' or 'signup'
    const [errors, setErrors] = useState({});

    // ✅ Test Supabase connection
    useEffect(() => {
        const testConnection = async () => {
            console.log('🔄 Testing Supabase connection...');
            const { data, error } = await supabase.auth.getSession();
            if (error) {
                console.log('❌ Supabase Error:', error);
            } else {
                console.log('✅ Supabase Connected Successfully!', data);
            }
        };
        testConnection();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear error when user starts typing
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: ''
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

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            // Here you would typically make an API call to authenticate
            console.log('Login submitted:', formData);
            alert('Sign in successful! (Demo)');
            // Navigate to dashboard or home
            // navigate('/dashboard');
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
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
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
                    <button type="submit" className="btn-sign-in-primary">
                        Sign In
                    </button>

                    {/* Sign Up Link */}
                    <p className="signup-link">
                        Don't have an account? <button type="button" onClick={handleSignUpClick}>Sign up</button>
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