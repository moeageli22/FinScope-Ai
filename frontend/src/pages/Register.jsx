import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import FinScopeAI from '../components/FinScopeAI.jsx';
import { supabase } from '../config/supabase';

const Register = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;
    const [loading, setLoading] = useState(false);
    const [registrationComplete, setRegistrationComplete] = useState(false);

    const [formData, setFormData] = useState({
        // Step 1: Personal Information
        firstName: '',
        middleName: '',
        lastName: '',
        birthDay: '',
        birthMonth: '',
        birthYear: '',
        gender: '',
        nationality: '',

        // Step 2: Contact Information
        email: '',
        phone: '',
        city: '',
        country: '',

        // Step 3: Employment Information
        employmentStatus: '',
        employerName: '',
        occupation: '',
        annualIncome: '',

        // Step 4: Account Setup
        username: '',
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
            if (!formData.gender) newErrors.gender = 'Gender is required';
            if (!formData.nationality) newErrors.nationality = 'Nationality is required';

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

            if (!formData.phone) {
                newErrors.phone = 'Phone number is required';
            } else if (!/^\+?[\d\s\-()]+$/.test(formData.phone)) {
                newErrors.phone = 'Phone number is invalid';
            }

            if (!formData.city) newErrors.city = 'City is required';
            if (!formData.country) newErrors.country = 'Country is required';
        }

        if (step === 3) {
            if (!formData.employmentStatus) newErrors.employmentStatus = 'Employment status is required';

            if (formData.employmentStatus === 'employed' || formData.employmentStatus === 'self-employed') {
                if (!formData.employerName) newErrors.employerName = 'Employer name is required';
                if (!formData.occupation) newErrors.occupation = 'Occupation is required';
            }

            if (!formData.annualIncome) newErrors.annualIncome = 'Annual income is required';
        }

        if (step === 4) {
            if (!formData.username) {
                newErrors.username = 'Username is required';
            } else if (formData.username.length < 4) {
                newErrors.username = 'Username must be at least 4 characters';
            }

            if (!formData.password) {
                newErrors.password = 'Password is required';
            } else if (formData.password.length < 8) {
                newErrors.password = 'Password must be at least 8 characters';
            } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
                newErrors.password = 'Password must contain uppercase, lowercase, number, and special character';
            }

            if (formData.password !== formData.confirmPassword) {
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
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePrevious = () => {
        setCurrentStep(currentStep - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateStep(currentStep)) return;

        setLoading(true);

        try {
            // Combine date of birth
            const dateOfBirth = `${formData.birthYear}-${formData.birthMonth}-${formData.birthDay}`;

            // Step 1: Create auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        username: formData.username,
                        first_name: formData.firstName,
                        middle_name: formData.middleName,
                        last_name: formData.lastName,
                    },
                    emailRedirectTo: `${window.location.origin}/email-confirmed`
                }
            });

            if (authError) {
                console.error('Auth error:', authError);

                if (authError.message.includes('already registered')) {
                    setErrors({ email: 'This email is already registered' });
                } else {
                    setErrors({ general: authError.message });
                }
                setLoading(false);
                return;
            }

            // Step 2: Create user profile
            if (authData.user) {
                const { error: profileError } = await supabase
                    .from('user_profiles')
                    .update({
                        username: formData.username,
                        first_name: formData.firstName,
                        middle_name: formData.middleName,
                        last_name: formData.lastName,
                        date_of_birth: dateOfBirth,
                        gender: formData.gender,
                        nationality: formData.nationality,
                        phone: formData.phone,
                        city: formData.city,
                        country: formData.country,
                        employment_status: formData.employmentStatus,
                        employer_name: formData.employerName,
                        occupation: formData.occupation,
                        annual_income: formData.annualIncome
                    })
                    .eq('id', authData.user.id);

                if (profileError) {
                    console.error('Profile error:', profileError);
                }

                // Show success message
                setRegistrationComplete(true);
                setLoading(false);
            }

        } catch (error) {
            console.error('Unexpected error:', error);
            setErrors({ general: 'An unexpected error occurred. Please try again.' });
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
                        <h2 className="success-title">Check Your Email!</h2>
                        <p className="success-message">
                            We've sent a verification email to<br />
                            <strong>{formData.email}</strong>
                        </p>
                        <p className="success-instructions">
                            Please click the verification link in the email to activate your account.
                            The link will expire in 24 hours.
                        </p>
                        <p className="success-note">
                            Didn't receive the email? Check your spam folder or contact support.
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
                    <p className="register-tagline">Join thousands of users managing their finances smartly</p>
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
                        {[1, 2, 3, 4].map((step) => (
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
                                    {step === 3 && 'Employment'}
                                    {step === 4 && 'Account'}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="progress-line">
                        <div
                            className="progress-line-fill"
                            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Registration Form */}
                <form className="register-form" onSubmit={handleSubmit}>
                    {/* Step 1: Personal Information */}
                    {currentStep === 1 && (
                        <div className="form-step">
                            <h2 className="step-title">Personal Information</h2>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="firstName">
                                        First Name *
                                        {errors.firstName && <span className="inline-error">{errors.firstName}</span>}
                                    </label>
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
                                </div>

                                <div className="form-group">
                                    <label htmlFor="middleName">Middle Name (Optional)</label>
                                    <input
                                        type="text"
                                        id="middleName"
                                        name="middleName"
                                        value={formData.middleName}
                                        onChange={handleChange}
                                        placeholder="Michael"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="lastName">
                                    Last Name *
                                    {errors.lastName && <span className="inline-error">{errors.lastName}</span>}
                                </label>
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
                            </div>

                            <div className="form-group">
                                <label>
                                    Date of Birth *
                                    {(errors.birthDay || errors.birthMonth || errors.birthYear) && (
                                        <span className="inline-error">
                                            {errors.birthYear || errors.birthMonth || errors.birthDay}
                                        </span>
                                    )}
                                </label>
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
                                            <option key={day} value={day.toString().padStart(2, '0')}>
                                                {day}
                                            </option>
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
                                            <option key={month.value} value={month.value}>
                                                {month.label}
                                            </option>
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
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="gender">
                                        Gender *
                                        {errors.gender && <span className="inline-error">{errors.gender}</span>}
                                    </label>
                                    <select
                                        id="gender"
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className={errors.gender ? 'error' : ''}
                                        disabled={loading}
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="non-binary">Non-Binary</option>
                                        <option value="prefer-not-to-say">Prefer not to say</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="nationality">
                                        Nationality *
                                        {errors.nationality && <span className="inline-error">{errors.nationality}</span>}
                                    </label>
                                    <input
                                        type="text"
                                        id="nationality"
                                        name="nationality"
                                        value={formData.nationality}
                                        onChange={handleChange}
                                        placeholder="e.g., American, British"
                                        className={errors.nationality ? 'error' : ''}
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Contact Information */}
                    {currentStep === 2 && (
                        <div className="form-step">
                            <h2 className="step-title">Contact Information</h2>

                            <div className="form-group">
                                <label htmlFor="email">
                                    Email Address *
                                    {errors.email && <span className="inline-error">{errors.email}</span>}
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="john.doe@example.com"
                                    className={errors.email ? 'error' : ''}
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone">
                                    Phone Number *
                                    {errors.phone && <span className="inline-error">{errors.phone}</span>}
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+1 (555) 123-4567"
                                    className={errors.phone ? 'error' : ''}
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="city">
                                        City *
                                        {errors.city && <span className="inline-error">{errors.city}</span>}
                                    </label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="New York"
                                        className={errors.city ? 'error' : ''}
                                        disabled={loading}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="country">
                                        Country *
                                        {errors.country && <span className="inline-error">{errors.country}</span>}
                                    </label>
                                    <input
                                        type="text"
                                        id="country"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        placeholder="United States"
                                        className={errors.country ? 'error' : ''}
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Employment Information */}
                    {currentStep === 3 && (
                        <div className="form-step">
                            <h2 className="step-title">Employment Information</h2>

                            <div className="form-group">
                                <label htmlFor="employmentStatus">
                                    Employment Status *
                                    {errors.employmentStatus && <span className="inline-error">{errors.employmentStatus}</span>}
                                </label>
                                <select
                                    id="employmentStatus"
                                    name="employmentStatus"
                                    value={formData.employmentStatus}
                                    onChange={handleChange}
                                    className={errors.employmentStatus ? 'error' : ''}
                                    disabled={loading}
                                >
                                    <option value="">Select Employment Status</option>
                                    <option value="employed">Employed</option>
                                    <option value="self-employed">Self-Employed</option>
                                    <option value="unemployed">Unemployed</option>
                                    <option value="student">Student</option>
                                    <option value="retired">Retired</option>
                                </select>
                            </div>

                            {(formData.employmentStatus === 'employed' || formData.employmentStatus === 'self-employed') && (
                                <>
                                    <div className="form-group">
                                        <label htmlFor="employerName">
                                            Employer Name *
                                            {errors.employerName && <span className="inline-error">{errors.employerName}</span>}
                                        </label>
                                        <input
                                            type="text"
                                            id="employerName"
                                            name="employerName"
                                            value={formData.employerName}
                                            onChange={handleChange}
                                            placeholder="Company Name"
                                            className={errors.employerName ? 'error' : ''}
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="occupation">
                                            Occupation *
                                            {errors.occupation && <span className="inline-error">{errors.occupation}</span>}
                                        </label>
                                        <input
                                            type="text"
                                            id="occupation"
                                            name="occupation"
                                            value={formData.occupation}
                                            onChange={handleChange}
                                            placeholder="Software Engineer"
                                            className={errors.occupation ? 'error' : ''}
                                            disabled={loading}
                                        />
                                    </div>
                                </>
                            )}

                            <div className="form-group">
                                <label htmlFor="annualIncome">
                                    Annual Income *
                                    {errors.annualIncome && <span className="inline-error">{errors.annualIncome}</span>}
                                </label>
                                <select
                                    id="annualIncome"
                                    name="annualIncome"
                                    value={formData.annualIncome}
                                    onChange={handleChange}
                                    className={errors.annualIncome ? 'error' : ''}
                                    disabled={loading}
                                >
                                    <option value="">Select Income Range</option>
                                    <option value="0-25000">$0 - $25,000</option>
                                    <option value="25000-50000">$25,000 - $50,000</option>
                                    <option value="50000-75000">$50,000 - $75,000</option>
                                    <option value="75000-100000">$75,000 - $100,000</option>
                                    <option value="100000-150000">$100,000 - $150,000</option>
                                    <option value="150000+">$150,000+</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Account Setup */}
                    {currentStep === 4 && (
                        <div className="form-step">
                            <h2 className="step-title">Account Setup</h2>

                            <div className="form-group">
                                <label htmlFor="username">
                                    Username *
                                    {errors.username && <span className="inline-error">{errors.username}</span>}
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Choose a unique username"
                                    className={errors.username ? 'error' : ''}
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">
                                    Password *
                                    {errors.password && <span className="inline-error">{errors.password}</span>}
                                </label>
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
                                <small className="field-help">Must be at least 8 characters with uppercase, lowercase, number, and special character</small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">
                                    Confirm Password *
                                    {errors.confirmPassword && <span className="inline-error">{errors.confirmPassword}</span>}
                                </label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Re-enter your password"
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
                            </div>

                            <div className="agreements-section">
                                <div className="checkbox-group">
                                    <input
                                        type="checkbox"
                                        id="agreeTerms"
                                        name="agreeTerms"
                                        checked={formData.agreeTerms}
                                        onChange={handleChange}
                                        className={errors.agreeTerms ? 'error' : ''}
                                        disabled={loading}
                                    />
                                    <label htmlFor="agreeTerms">
                                        I agree to the <a href="#terms" target="_blank">Terms of Service</a> *
                                        {errors.agreeTerms && <span className="inline-error">{errors.agreeTerms}</span>}
                                    </label>
                                </div>

                                <div className="checkbox-group">
                                    <input
                                        type="checkbox"
                                        id="agreePrivacy"
                                        name="agreePrivacy"
                                        checked={formData.agreePrivacy}
                                        onChange={handleChange}
                                        className={errors.agreePrivacy ? 'error' : ''}
                                        disabled={loading}
                                    />
                                    <label htmlFor="agreePrivacy">
                                        I agree to the <a href="#privacy" target="_blank">Privacy Policy</a> *
                                        {errors.agreePrivacy && <span className="inline-error">{errors.agreePrivacy}</span>}
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
                                        I agree to receive marketing communications (Optional)
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
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        Create Account
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </form>

                {/* Already Have Account */}
                <p className="login-link">
                    Already have an account? <button onClick={handleBackToLogin} disabled={loading}>Sign in</button>
                </p>
            </div>
        </div>
    );
};

export default Register;