import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import FinScopeAI from '../components/FinScopeAI.jsx';
import { supabase } from '../config/supabase';
import { useToast } from '../components/Toast';

const Register = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 3; // Reduced from 4 to 3 steps
    const [loading, setLoading] = useState(false);
    const [registrationComplete, setRegistrationComplete] = useState(false);

    const [formData, setFormData] = useState({
        // Step 1: Personal Information
        firstName: '',
        lastName: '',
        birthDay: '',
        birthMonth: '',
        birthYear: '',

        // Step 2: Contact & Location
        email: '',
        city: '',
        country: '',

        // Step 3: Account Setup
        password: '',
        confirmPassword: '',
        agreeTerms: false,
        agreePrivacy: false,
        agreeMarketing: false
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Generate arrays for date dropdowns
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = [
        { value: '01', label: 'January' },
        { value: '02', label: 'February' },
        { value: '03', label: 'March' },
        { value: '04', label: 'April' },
        { value: '05', label: 'May' },
        { value: '06', label: 'June' },
        { value: '07', label: 'July' },
        { value: '08', label: 'August' },
        { value: '09', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' }
    ];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    const validateStep = (step) => {
        const newErrors = {};

        if (step === 1) {
            if (!formData.firstName) newErrors.firstName = 'First name is required';
            if (!formData.lastName) newErrors.lastName = 'Last name is required';
            if (!formData.birthDay) newErrors.birthDay = 'Day is required';
            if (!formData.birthMonth) newErrors.birthMonth = 'Month is required';
            if (!formData.birthYear) newErrors.birthYear = 'Year is required';

            // Age validation (must be 18+)
            if (formData.birthDay && formData.birthMonth && formData.birthYear) {
                const birthDate = new Date(formData.birthYear, formData.birthMonth - 1, formData.birthDay);
                const today = new Date();
                const age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();

                if (age < 18 || (age === 18 && monthDiff < 0) ||
                    (age === 18 && monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    newErrors.birthYear = 'You must be at least 18 years old';
                }
            }
        }

        if (step === 2) {
            if (!formData.email) {
                newErrors.email = 'Email is required';
            } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
                newErrors.email = 'Email is invalid';
            }
            if (!formData.city) newErrors.city = 'City is required';
            if (!formData.country) newErrors.country = 'Country is required';
        }

        if (step === 3) {
            if (!formData.password) {
                newErrors.password = 'Password is required';
            } else if (formData.password.length < 8) {
                newErrors.password = 'Password must be at least 8 characters';
            } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
                newErrors.password = 'Password must contain uppercase, lowercase, and number';
            }

            if (!formData.confirmPassword) {
                newErrors.confirmPassword = 'Please confirm your password';
            } else if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }

            if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the Terms of Service';
            if (!formData.agreePrivacy) newErrors.agreePrivacy = 'You must agree to the Privacy Policy';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(currentStep + 1);
        } else {
            addToast('Please fix the errors before continuing', 'error');
        }
    };

    const handlePrevious = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateStep(currentStep)) {
            addToast('Please fix the errors in the form', 'error');
            return;
        }

        setLoading(true);

        try {
            console.log('=== Registration Started ===');
            console.log('Email:', formData.email);

            // Combine date of birth
            const dateOfBirth = `${formData.birthYear}-${formData.birthMonth.padStart(2, '0')}-${formData.birthDay.toString().padStart(2, '0')}`;

            // Create full name
            const fullName = `${formData.firstName} ${formData.lastName}`.trim();

            // Step 1: Sign up with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                        full_name: fullName,
                        date_of_birth: dateOfBirth,
                        city: formData.city,
                        country: formData.country,
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback`
                }
            });

            if (authError) {
                console.error('❌ Auth error:', authError);

                if (authError.message.includes('already registered') ||
                    authError.message.includes('User already registered') ||
                    authError.message.includes('already been registered')) {
                    setErrors({ email: 'This email is already registered' });
                    addToast('This email is already registered', 'error');
                } else {
                    setErrors({ general: authError.message });
                    addToast(authError.message, 'error');
                }
                setLoading(false);
                return;
            }

            console.log('✅ Registration successful:', authData);

            // Step 2: Create user profile
            if (authData.user) {
                console.log('Creating user profile for ID:', authData.user.id);

                const { error: profileError } = await supabase
                    .from('user_profiles')
                    .insert({
                        id: authData.user.id,
                        email: formData.email,
                        full_name: fullName,
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                        date_of_birth: dateOfBirth,
                        city: formData.city,
                        country: formData.country,
                        marketing_consent: formData.agreeMarketing,
                        created_at: new Date().toISOString()
                    });

                if (profileError) {
                    console.error('⚠️ Profile creation error:', profileError);
                } else {
                    console.log('✅ User profile created successfully');
                }

                // Initialize user finances
                try {
                    await supabase.from('user_finances').insert({
                        user_id: authData.user.id,
                        balance: 0,
                        total_income: 0,
                        total_expenses: 0,
                        created_at: new Date().toISOString()
                    });
                    console.log('✅ User finances initialized');
                } catch (financeError) {
                    console.error('⚠️ Finance init error:', financeError);
                }
            }

            console.log('✅ Registration complete - showing success screen');
            setRegistrationComplete(true);
            addToast('Registration successful! Check your email to verify your account.', 'success');

        } catch (error) {
            console.error('❌ Unexpected error:', error);
            setErrors({ general: 'An unexpected error occurred. Please try again.' });
            addToast('An unexpected error occurred. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLogin = () => {
        navigate('/login');
    };

    // Success Screen
    if (registrationComplete) {
        return (
            <div className="register-page">
                <div className="register-container">
                    <div className="success-screen">
                        <div className="success-icon-large">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                        </div>
                        <h2 className="success-title">Check Your Email! 📧</h2>
                        <p className="success-message">
                            We've sent a verification email to<br />
                            <strong>{formData.email}</strong>
                        </p>
                        <p className="success-instructions">
                            Please click the confirmation link in the email to activate your account.
                            You won't be able to sign in until you verify your email.
                        </p>
                        <p className="success-note">
                            Didn't receive the email? Check your spam folder.
                        </p>
                        <button
                            className="btn-back-to-login"
                            onClick={handleBackToLogin}
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="register-page">
            {/* Back Button */}
            <button className="back-button" onClick={handleBackToLogin} disabled={loading}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to Login
            </button>

            <div className="register-container">
                {/* Header */}
                <div className="register-header">
                    <div className="register-logo-wrapper">
                        <FinScopeAI />
                    </div>
                    <h1 className="register-title">
                        Create Your <span className="ai-gradient">FinScope AI</span> Account
                    </h1>
                    <p className="register-tagline">Start your journey to smarter financial management</p>
                </div>

                {/* Error Message */}
                {errors.general && (
                    <div className="error-alert">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <p>{errors.general}</p>
                    </div>
                )}

                {/* Progress Bar */}
                <div className="progress-bar">
                    <div className="progress-steps">
                        {[1, 2, 3].map((step) => (
                            <div key={step} className={`progress-step ${currentStep >= step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}>
                                <div className="step-circle">
                                    {currentStep > step ? (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    ) : (
                                        step
                                    )}
                                </div>
                                <span className="step-label">
                                    {step === 1 && 'Personal'}
                                    {step === 2 && 'Contact'}
                                    {step === 3 && 'Security'}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="progress-line">
                        <div
                            className="progress-line-fill"
                            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Form */}
                <form className="register-form" onSubmit={handleSubmit}>
                    {/* STEP 1: Personal Information */}
                    {currentStep === 1 && (
                        <div className="form-step">
                            <h2 className="step-title">Personal Information</h2>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="firstName">First Name *</label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="John"
                                        className={errors.firstName ? 'error' : ''}
                                        disabled={loading}
                                    />
                                    {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="lastName">Last Name *</label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="Doe"
                                        className={errors.lastName ? 'error' : ''}
                                        disabled={loading}
                                    />
                                    {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Date of Birth *</label>
                                <div className="date-picker-row">
                                    <select
                                        name="birthDay"
                                        value={formData.birthDay}
                                        onChange={handleChange}
                                        className={`date-select ${errors.birthDay ? 'error' : ''}`}
                                        disabled={loading}
                                    >
                                        <option value="">Day</option>
                                        {days.map(day => (
                                            <option key={day} value={day}>{day}</option>
                                        ))}
                                    </select>

                                    <select
                                        name="birthMonth"
                                        value={formData.birthMonth}
                                        onChange={handleChange}
                                        className={`date-select ${errors.birthMonth ? 'error' : ''}`}
                                        disabled={loading}
                                    >
                                        <option value="">Month</option>
                                        {months.map(month => (
                                            <option key={month.value} value={month.value}>{month.label}</option>
                                        ))}
                                    </select>

                                    <select
                                        name="birthYear"
                                        value={formData.birthYear}
                                        onChange={handleChange}
                                        className={`date-select ${errors.birthYear ? 'error' : ''}`}
                                        disabled={loading}
                                    >
                                        <option value="">Year</option>
                                        {years.map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                                {errors.birthYear && <span className="error-message">{errors.birthYear}</span>}
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Contact & Location */}
                    {currentStep === 2 && (
                        <div className="form-step">
                            <h2 className="step-title">Contact & Location</h2>

                            <div className="form-group">
                                <label htmlFor="email">Email Address *</label>
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

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="city">City *</label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="London"
                                        className={errors.city ? 'error' : ''}
                                        disabled={loading}
                                    />
                                    {errors.city && <span className="error-message">{errors.city}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="country">Country *</label>
                                    <input
                                        type="text"
                                        id="country"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        placeholder="United Kingdom"
                                        className={errors.country ? 'error' : ''}
                                        disabled={loading}
                                    />
                                    {errors.country && <span className="error-message">{errors.country}</span>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Account Setup & Security */}
                    {currentStep === 3 && (
                        <div className="form-step">
                            <h2 className="step-title">Account Security</h2>

                            <div className="form-group">
                                <label htmlFor="password">Password *</label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Create a strong password"
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

                                <div className="password-requirements">
                                    <h4>Password must contain:</h4>
                                    <div className="requirement-list">
                                        <div className={`requirement ${formData.password.length >= 8 ? 'met' : ''}`}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                            <span>At least 8 characters</span>
                                        </div>
                                        <div className={`requirement ${/[A-Z]/.test(formData.password) ? 'met' : ''}`}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                            <span>One uppercase letter</span>
                                        </div>
                                        <div className={`requirement ${/[a-z]/.test(formData.password) ? 'met' : ''}`}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                            <span>One lowercase letter</span>
                                        </div>
                                        <div className={`requirement ${/\d/.test(formData.password) ? 'met' : ''}`}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                            <span>One number</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm Password *</label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Confirm your password"
                                        className={errors.confirmPassword ? 'error' : ''}
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        disabled={loading}
                                    >
                                        {showConfirmPassword ? (
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
                                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                            </div>

                            <div className="agreements-section">
                                <div className={`checkbox-group ${errors.agreeTerms ? 'error' : ''}`}>
                                    <input
                                        type="checkbox"
                                        id="agreeTerms"
                                        name="agreeTerms"
                                        checked={formData.agreeTerms}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                    <label htmlFor="agreeTerms">
                                        I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>
                                    </label>
                                </div>

                                <div className={`checkbox-group ${errors.agreePrivacy ? 'error' : ''}`}>
                                    <input
                                        type="checkbox"
                                        id="agreePrivacy"
                                        name="agreePrivacy"
                                        checked={formData.agreePrivacy}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                    <label htmlFor="agreePrivacy">
                                        I agree to the <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                                    </label>
                                </div>

                                <div className="checkbox-group">
                                    <input
                                        type="checkbox"
                                        id="agreeMarketing"
                                        name="agreeMarketing"
                                        checked={formData.agreeMarketing}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                    <label htmlFor="agreeMarketing">
                                        I want to receive updates and tips (Optional)
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="form-navigation">
                        {currentStep > 1 && (
                            <button
                                type="button"
                                className="btn-previous"
                                onClick={handlePrevious}
                                disabled={loading}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M19 12H5M12 19l-7-7 7-7" />
                                </svg>
                                Previous
                            </button>
                        )}

                        {currentStep < totalSteps ? (
                            <button
                                type="button"
                                className="btn-next"
                                onClick={handleNext}
                                disabled={loading}
                            >
                                Next
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className="btn-submit"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        Create Account
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                            <polyline points="22 4 12 14.01 9 11.01" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Login Link */}
                    <p className="login-link">
                        Already have an account? <button type="button" onClick={handleBackToLogin} disabled={loading}>Sign in</button>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;