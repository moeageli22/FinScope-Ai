import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import FinScopeAI from '../components/FinScopeAI.jsx';

const Register = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;

    const [formData, setFormData] = useState({
        // Step 1: Personal Information
        firstName: '',
        middleName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        nationality: '',

        // Step 2: Contact Information
        email: '',
        phone: '',
        streetAddress: '',
        city: '',
        stateProvince: '',
        postalCode: '',
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
        securityQuestion: '',
        securityAnswer: '',
        agreeTerms: false,
        agreePrivacy: false,
        agreeMarketing: false
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
            if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
            if (!formData.gender) newErrors.gender = 'Gender is required';
            if (!formData.nationality) newErrors.nationality = 'Nationality is required';

            // Age validation (must be 18+)
            if (formData.dateOfBirth) {
                const today = new Date();
                const birthDate = new Date(formData.dateOfBirth);
                const age = today.getFullYear() - birthDate.getFullYear();
                if (age < 18) {
                    newErrors.dateOfBirth = 'You must be at least 18 years old';
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

            // Address fields are now optional - no validation needed
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

            if (!formData.securityQuestion) newErrors.securityQuestion = 'Security question is required';
            if (!formData.securityAnswer) newErrors.securityAnswer = 'Security answer is required';

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

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateStep(currentStep)) {
            // Here you would make an API call to register the user
            console.log('Registration submitted:', formData);
            alert('Registration successful! (Demo)');
            navigate('/login');
        }
    };

    const handleBackToLogin = () => {
        navigate('/login');
    };

    const securityQuestions = [
        "What was the name of your first pet?",
        "What city were you born in?",
        "What is your mother's maiden name?",
        "What was the name of your first school?",
        "What is your favorite book?",
        "What was your childhood nickname?",
        "What is the name of your favorite teacher?",
        "What street did you grow up on?"
    ];

    return (
        <div className="register-page">
            {/* Back Button */}
            <button className="back-button" onClick={handleBackToLogin}>
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
                                    <label htmlFor="firstName">First Name *</label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="John"
                                        className={errors.firstName ? 'error' : ''}
                                    />
                                    {errors.firstName && <span className="error-message">{errors.firstName}</span>}
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
                                    />
                                </div>
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
                                />
                                {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="dateOfBirth">Date of Birth *</label>
                                    <input
                                        type="date"
                                        id="dateOfBirth"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleChange}
                                        className={errors.dateOfBirth ? 'error' : ''}
                                    />
                                    {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="gender">Gender *</label>
                                    <select
                                        id="gender"
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className={errors.gender ? 'error' : ''}
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="non-binary">Non-Binary</option>
                                        <option value="prefer-not-to-say">Prefer not to say</option>
                                    </select>
                                    {errors.gender && <span className="error-message">{errors.gender}</span>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="nationality">Nationality *</label>
                                <input
                                    type="text"
                                    id="nationality"
                                    name="nationality"
                                    value={formData.nationality}
                                    onChange={handleChange}
                                    placeholder="e.g., American, British, Canadian"
                                    className={errors.nationality ? 'error' : ''}
                                />
                                {errors.nationality && <span className="error-message">{errors.nationality}</span>}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Contact Information */}
                    {currentStep === 2 && (
                        <div className="form-step">
                            <h2 className="step-title">Contact Information</h2>

                            <div className="form-group">
                                <label htmlFor="email">Email Address *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="john.doe@example.com"
                                    className={errors.email ? 'error' : ''}
                                />
                                {errors.email && <span className="error-message">{errors.email}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone">Phone Number *</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+1 (555) 123-4567"
                                    className={errors.phone ? 'error' : ''}
                                />
                                {errors.phone && <span className="error-message">{errors.phone}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="streetAddress">Street Address</label>
                                <input
                                    type="text"
                                    id="streetAddress"
                                    name="streetAddress"
                                    value={formData.streetAddress}
                                    onChange={handleChange}
                                    placeholder="123 Main Street, Apt 4B"
                                    className={errors.streetAddress ? 'error' : ''}
                                />
                                {errors.streetAddress && <span className="error-message">{errors.streetAddress}</span>}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="city">City</label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="New York"
                                        className={errors.city ? 'error' : ''}
                                    />
                                    {errors.city && <span className="error-message">{errors.city}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="stateProvince">State/Province</label>
                                    <input
                                        type="text"
                                        id="stateProvince"
                                        name="stateProvince"
                                        value={formData.stateProvince}
                                        onChange={handleChange}
                                        placeholder="NY"
                                        className={errors.stateProvince ? 'error' : ''}
                                    />
                                    {errors.stateProvince && <span className="error-message">{errors.stateProvince}</span>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="postalCode">Postal Code</label>
                                    <input
                                        type="text"
                                        id="postalCode"
                                        name="postalCode"
                                        value={formData.postalCode}
                                        onChange={handleChange}
                                        placeholder="10001"
                                        className={errors.postalCode ? 'error' : ''}
                                    />
                                    {errors.postalCode && <span className="error-message">{errors.postalCode}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="country">Country</label>
                                    <input
                                        type="text"
                                        id="country"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        placeholder="United States"
                                        className={errors.country ? 'error' : ''}
                                    />
                                    {errors.country && <span className="error-message">{errors.country}</span>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Employment Information */}
                    {currentStep === 3 && (
                        <div className="form-step">
                            <h2 className="step-title">Employment Information</h2>

                            <div className="form-group">
                                <label htmlFor="employmentStatus">Employment Status *</label>
                                <select
                                    id="employmentStatus"
                                    name="employmentStatus"
                                    value={formData.employmentStatus}
                                    onChange={handleChange}
                                    className={errors.employmentStatus ? 'error' : ''}
                                >
                                    <option value="">Select Employment Status</option>
                                    <option value="employed">Employed</option>
                                    <option value="self-employed">Self-Employed</option>
                                    <option value="unemployed">Unemployed</option>
                                    <option value="student">Student</option>
                                    <option value="retired">Retired</option>
                                </select>
                                {errors.employmentStatus && <span className="error-message">{errors.employmentStatus}</span>}
                            </div>

                            {(formData.employmentStatus === 'employed' || formData.employmentStatus === 'self-employed') && (
                                <>
                                    <div className="form-group">
                                        <label htmlFor="employerName">Employer Name *</label>
                                        <input
                                            type="text"
                                            id="employerName"
                                            name="employerName"
                                            value={formData.employerName}
                                            onChange={handleChange}
                                            placeholder="Company Name"
                                            className={errors.employerName ? 'error' : ''}
                                        />
                                        {errors.employerName && <span className="error-message">{errors.employerName}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="occupation">Occupation *</label>
                                        <input
                                            type="text"
                                            id="occupation"
                                            name="occupation"
                                            value={formData.occupation}
                                            onChange={handleChange}
                                            placeholder="Software Engineer"
                                            className={errors.occupation ? 'error' : ''}
                                        />
                                        {errors.occupation && <span className="error-message">{errors.occupation}</span>}
                                    </div>
                                </>
                            )}

                            <div className="form-group">
                                <label htmlFor="annualIncome">Annual Income *</label>
                                <select
                                    id="annualIncome"
                                    name="annualIncome"
                                    value={formData.annualIncome}
                                    onChange={handleChange}
                                    className={errors.annualIncome ? 'error' : ''}
                                >
                                    <option value="">Select Income Range</option>
                                    <option value="0-25000">$0 - $25,000</option>
                                    <option value="25000-50000">$25,000 - $50,000</option>
                                    <option value="50000-75000">$50,000 - $75,000</option>
                                    <option value="75000-100000">$75,000 - $100,000</option>
                                    <option value="100000-150000">$100,000 - $150,000</option>
                                    <option value="150000+">$150,000+</option>
                                </select>
                                {errors.annualIncome && <span className="error-message">{errors.annualIncome}</span>}
                            </div>
                        </div>
                    )}

                    {/* Step 4: Account Setup */}
                    {currentStep === 4 && (
                        <div className="form-step">
                            <h2 className="step-title">Account Setup</h2>

                            <div className="form-group">
                                <label htmlFor="username">Username *</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Choose a unique username"
                                    className={errors.username ? 'error' : ''}
                                />
                                {errors.username && <span className="error-message">{errors.username}</span>}
                            </div>

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
                                <small className="field-help">Must be at least 8 characters with uppercase, lowercase, number, and special character</small>
                                {errors.password && <span className="error-message">{errors.password}</span>}
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
                                        placeholder="Re-enter your password"
                                        className={errors.confirmPassword ? 'error' : ''}
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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

                            <div className="security-questions-section">
                                <h3 className="subsection-title">Security Question</h3>
                                <p className="subsection-description">This question will help verify your identity if you forget your password.</p>

                                <div className="form-group">
                                    <label htmlFor="securityQuestion">Security Question *</label>
                                    <select
                                        id="securityQuestion"
                                        name="securityQuestion"
                                        value={formData.securityQuestion}
                                        onChange={handleChange}
                                        className={errors.securityQuestion ? 'error' : ''}
                                    >
                                        <option value="">Select a question</option>
                                        {securityQuestions.map((q, i) => (
                                            <option key={i} value={q}>{q}</option>
                                        ))}
                                    </select>
                                    {errors.securityQuestion && <span className="error-message">{errors.securityQuestion}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="securityAnswer">Answer *</label>
                                    <input
                                        type="text"
                                        id="securityAnswer"
                                        name="securityAnswer"
                                        value={formData.securityAnswer}
                                        onChange={handleChange}
                                        placeholder="Your answer"
                                        className={errors.securityAnswer ? 'error' : ''}
                                    />
                                    {errors.securityAnswer && <span className="error-message">{errors.securityAnswer}</span>}
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
                                    />
                                    <label htmlFor="agreeTerms">
                                        I agree to the <a href="#terms" target="_blank">Terms of Service</a> *
                                    </label>
                                </div>
                                {errors.agreeTerms && <span className="error-message">{errors.agreeTerms}</span>}

                                <div className="checkbox-group">
                                    <input
                                        type="checkbox"
                                        id="agreePrivacy"
                                        name="agreePrivacy"
                                        checked={formData.agreePrivacy}
                                        onChange={handleChange}
                                        className={errors.agreePrivacy ? 'error' : ''}
                                    />
                                    <label htmlFor="agreePrivacy">
                                        I agree to the <a href="#privacy" target="_blank">Privacy Policy</a> *
                                    </label>
                                </div>
                                {errors.agreePrivacy && <span className="error-message">{errors.agreePrivacy}</span>}

                                <div className="checkbox-group">
                                    <input
                                        type="checkbox"
                                        id="agreeMarketing"
                                        name="agreeMarketing"
                                        checked={formData.agreeMarketing}
                                        onChange={handleChange}
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
                            <button type="button" className="btn-previous" onClick={handlePrevious}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M19 12H5M12 19l-7-7 7-7" />
                                </svg>
                                Previous
                            </button>
                        )}

                        {currentStep < totalSteps ? (
                            <button type="button" className="btn-next" onClick={handleNext}>
                                Next
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </button>
                        ) : (
                            <button type="submit" className="btn-submit">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                Create Account
                            </button>
                        )}
                    </div>
                </form>

                {/* Already Have Account */}
                <p className="login-link">
                    Already have an account? <button onClick={handleBackToLogin}>Sign in</button>
                </p>
            </div>
        </div>
    );
};

export default Register;