import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useLanguage } from '../pages/LanguageContext';
import UserMenu from '../components/UserMenu';
import FinScopeAI from '../components/FinScopeAI';
import './Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const fileInputRef = useRef(null);
    const wallpaperInputRef = useRef(null);

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [toast, setToast] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [wallpaperUrl, setWallpaperUrl] = useState(null);

    // Card customization
    const [selectedCardType, setSelectedCardType] = useState('visa'); // visa, mastercard, or amex
    const [selectedCardTheme, setSelectedCardTheme] = useState('neon'); // neon, aurora, midnight, etc.

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        username: '',
        phone: '',
        date_of_birth: '',
        location: '',
        bio: '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    // Card themes - Modern Revolut-style
    const cardThemes = {
        neon: {
            name: 'Neon Purple',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            textColor: '#fff'
        },
        aurora: {
            name: 'Aurora Blue',
            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            textColor: '#fff'
        },
        midnight: {
            name: 'Midnight Black',
            gradient: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
            textColor: '#fff'
        },
        sunset: {
            name: 'Sunset Glow',
            gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            textColor: '#2c3e50'
        },
        ocean: {
            name: 'Deep Ocean',
            gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            textColor: '#fff'
        },
        emerald: {
            name: 'Emerald Forest',
            gradient: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)',
            textColor: '#fff'
        },
        rose: {
            name: 'Rose Gold',
            gradient: 'linear-gradient(135deg, #ed6ea0 0%, #ec8c69 100%)',
            textColor: '#fff'
        },
        cosmic: {
            name: 'Cosmic Night',
            gradient: 'linear-gradient(135deg, #000428 0%, #004e92 100%)',
            textColor: '#fff'
        },
    };

    // Predefined wallpapers
    const predefinedWallpapers = [
        { id: 'gradient-1', name: 'Midnight Ocean', gradient: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' },
        { id: 'gradient-2', name: 'Purple Dream', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
        { id: 'gradient-3', name: 'Sunset Bliss', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
        { id: 'gradient-4', name: 'Emerald City', gradient: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)' },
        { id: 'gradient-5', name: 'Royal Blue', gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' },
        { id: 'gradient-6', name: 'Cosmic Fusion', gradient: 'linear-gradient(135deg, #ff00cc 0%, #333399 100%)' },
    ];

    useEffect(() => {
        loadProfile();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const loadProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { navigate('/login'); return; }
            setUser(user);

            const { data: profile } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profile) {
                setFormData({
                    first_name: profile.first_name || '',
                    last_name: profile.last_name || '',
                    username: profile.username || '',
                    phone: profile.phone || '',
                    date_of_birth: profile.date_of_birth || '',
                    location: profile.location || '',
                    bio: profile.bio || '',
                });
                if (profile.avatar_url) setAvatarUrl(profile.avatar_url);
                if (profile.wallpaper_url) setWallpaperUrl(profile.wallpaper_url);
                if (profile.card_type) setSelectedCardType(profile.card_type);
                // Map old theme names to new ones
                if (profile.card_theme) {
                    const themeMapping = {
                        'purple': 'neon',
                        'blue': 'ocean',
                        'black': 'midnight',
                        'gold': 'sunset',
                        'pink': 'rose',
                        'green': 'emerald'
                    };
                    const mappedTheme = themeMapping[profile.card_theme] || profile.card_theme;
                    setSelectedCardTheme(mappedTheme);
                }
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const updateData = {
                id: user.id,
                ...formData,
                date_of_birth: formData.date_of_birth || null,
                avatar_url: avatarUrl,
                wallpaper_url: wallpaperUrl,
                card_type: selectedCardType,
                card_theme: selectedCardTheme,
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase
                .from('user_profiles')
                .upsert(updateData, { onConflict: 'id' });

            if (error) throw error;

            showToast('Profile updated successfully');
        } catch (error) {
            showToast(error.message || 'Failed to update profile', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            showToast('File too large. Max 2MB.', 'error');
            return;
        }

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/avatar.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, { upsert: true });
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            const timestampedUrl = `${publicUrl}?t=${Date.now()}`;
            await supabase.from('user_profiles').upsert({
                id: user.id,
                avatar_url: timestampedUrl,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' });

            setAvatarUrl(timestampedUrl);
            showToast('Avatar updated successfully');
        } catch (error) {
            showToast('Failed to upload avatar', 'error');
        }
    };

    const handleWallpaperUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            showToast('File too large. Max 5MB.', 'error');
            return;
        }

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/wallpaper.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('wallpapers')
                .upload(fileName, file, { upsert: true });
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('wallpapers')
                .getPublicUrl(fileName);

            const timestampedUrl = `${publicUrl}?t=${Date.now()}`;
            await supabase.from('user_profiles').upsert({
                id: user.id,
                wallpaper_url: timestampedUrl,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' });

            setWallpaperUrl(timestampedUrl);
            showToast('Wallpaper updated successfully');
        } catch (error) {
            showToast('Failed to upload wallpaper', 'error');
        }
    };

    const handleSetPredefinedWallpaper = async (gradient) => {
        try {
            await supabase.from('user_profiles').upsert({
                id: user.id,
                wallpaper_url: gradient,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' });
            setWallpaperUrl(gradient);
            showToast('Wallpaper updated');
        } catch (error) {
            showToast('Failed to update wallpaper', 'error');
        }
    };

    const handlePasswordChange = async () => {
        if (!passwordData.currentPassword) {
            showToast('Current password is required', 'error');
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }
        if (passwordData.newPassword.length < 8) {
            showToast('Password must be at least 8 characters', 'error');
            return;
        }

        setPasswordLoading(true);
        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: passwordData.currentPassword,
            });
            if (signInError) throw new Error('Current password is incorrect');

            const { error } = await supabase.auth.updateUser({
                password: passwordData.newPassword
            });
            if (error) throw error;

            showToast('Password updated successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            showToast(error.message || 'Failed to update password', 'error');
        } finally {
            setPasswordLoading(false);
        }
    };

    const getUserInitials = () => {
        if (formData.first_name && formData.last_name) {
            return `${formData.first_name[0]}${formData.last_name[0]}`.toUpperCase();
        }
        return user?.email?.[0]?.toUpperCase() || 'U';
    };

    const getDisplayName = () => {
        if (formData.first_name && formData.last_name) {
            return `${formData.first_name} ${formData.last_name}`;
        }
        if (formData.username) return formData.username;
        return user?.email?.split('@')[0] || 'User';
    };

    const getPasswordStrength = (password) => {
        if (!password) return { strength: 0, label: '', color: '' };
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

        if (strength <= 2) return { strength, label: 'Weak', color: '#ef4444' };
        if (strength <= 3) return { strength, label: 'Medium', color: '#f59e0b' };
        if (strength <= 4) return { strength, label: 'Strong', color: '#10b981' };
        return { strength, label: 'Very Strong', color: '#06b6d4' };
    };

    const passwordStrength = getPasswordStrength(passwordData.newPassword);

    if (loading) {
        return (
            <div className="profile-page">
                <div className="profile-loading">
                    <FinScopeAI />
                    <p>Loading your profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            {toast && (
                <div className={`profile-toast ${toast.type}`}>
                    {toast.type === 'success' ? '✓' : '✕'} {toast.message}
                </div>
            )}

            <header className="profile-header">
                <div className="profile-header-content">
                    <button className="profile-back-btn" onClick={() => navigate('/dashboard')}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Dashboard
                    </button>
                    <UserMenu />
                </div>
            </header>

            <main className="profile-main">
                {/* Hero Banner */}
                <div className="profile-hero-banner" style={{
                    background: wallpaperUrl?.startsWith('linear-gradient')
                        ? wallpaperUrl
                        : wallpaperUrl
                            ? `url(${wallpaperUrl})`
                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}>
                    <button className="change-cover-btn" onClick={() => wallpaperInputRef.current?.click()}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                        </svg>
                        Change Cover
                    </button>
                    <input
                        type="file"
                        ref={wallpaperInputRef}
                        accept="image/*"
                        onChange={handleWallpaperUpload}
                        style={{ display: 'none' }}
                    />
                </div>

                <div className="profile-content-wrapper">
                    {/* Profile Header with Virtual Card */}
                    <div className="profile-hero-section">
                        {/* Left: Avatar + Info */}
                        <div className="profile-info-left">
                            <div className="profile-avatar-large">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" />
                                ) : (
                                    <div className="avatar-placeholder-large">{getUserInitials()}</div>
                                )}
                                <label className="avatar-camera-btn">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                        <circle cx="12" cy="13" r="4" />
                                    </svg>
                                    <input type="file" ref={fileInputRef} accept="image/*" onChange={handleAvatarUpload} />
                                </label>
                            </div>

                            <div className="profile-header-info">
                                <h1 className="profile-display-name">{getDisplayName()}</h1>
                                <p className="profile-email">{user?.email}</p>
                                <p className="profile-subtitle">{formData.bio || 'No bio yet'}</p>
                            </div>
                        </div>

                        {/* Right: Virtual Card - Revolut Style */}
                        <div className="virtual-card-container">
                            <div
                                className="virtual-card"
                                style={{
                                    background: (cardThemes[selectedCardTheme] || cardThemes['neon']).gradient,
                                    color: (cardThemes[selectedCardTheme] || cardThemes['neon']).textColor
                                }}
                            >
                                {/* Background AI Orb */}
                                <div className="card-ai-background">
                                    <FinScopeAI />
                                </div>

                                {/* Top Section */}
                                <div className="card-top">
                                    <div className="card-brand-text">
                                        <div className="brand-name">FinScope AI</div>
                                        <div className="virtual-label">VIRTUAL</div>
                                    </div>
                                    <div className="contactless-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 18a6 6 0 0 0 0-12"/>
                                            <path d="M12 15a3 3 0 0 0 0-6"/>
                                            <path d="M12 21a9 9 0 0 0 0-18"/>
                                        </svg>
                                    </div>
                                </div>

                                {/* Card Number - Center */}
                                <div className="card-number-center">
                                    <span>****</span>
                                    <span>****</span>
                                    <span>****</span>
                                    <span className="highlighted-digits">5000</span>
                                </div>

                                {/* Bottom Section */}
                                <div className="card-bottom-info">
                                    <div className="card-details-group">
                                        <div className="detail-item">
                                            <div className="detail-label">VALID THRU</div>
                                            <div className="detail-value">01/24</div>
                                        </div>
                                        <div className="detail-item">
                                            <div className="detail-label">CVV</div>
                                            <div className="detail-value">***</div>
                                        </div>
                                    </div>
                                    <div className="card-network-logo">
                                        {selectedCardType === 'mastercard' && (
                                            <svg viewBox="0 0 131.39 86.9" fill="none">
                                                <circle cx="41.5" cy="43.45" r="35.9" fill="#eb001b"/>
                                                <circle cx="89.9" cy="43.45" r="35.9" fill="#f79e1b"/>
                                                <path d="M65.7,21.1c-6.9,5.3-11.4,13.6-11.4,23s4.5,17.7,11.4,23c6.9-5.3,11.4-13.6,11.4-23S72.6,26.4,65.7,21.1z" fill="#ff5f00"/>
                                            </svg>
                                        )}
                                        {selectedCardType === 'visa' && (
                                            <svg viewBox="0 0 141.732 141.732" fill="currentColor">
                                                <path d="M62.935,89.571h-9.733l6.083-37.384h9.734L62.935,89.571z"/>
                                                <path d="M95.014,52.887c-1.811-0.715-4.675-1.516-8.243-1.516c-9.096,0-15.504,4.777-15.558,11.614c-0.052,5.048,4.564,7.861,8.049,9.541c3.566,1.719,4.767,2.813,4.767,4.346c-0.016,2.346-2.84,3.42-5.473,3.42c-3.653,0-5.594-0.555-8.587-1.912l-1.193-0.555l-1.295,7.908c2.146,0.984,6.113,1.838,10.236,1.885c9.689,0,15.963-4.736,16.042-12.07c0.036-3.996-2.406-7.038-7.691-9.542c-3.206-1.626-5.169-2.709-5.169-4.36c0.018-1.498,1.67-3.016,5.31-3.016c2.99-0.052,5.178,0.643,6.86,1.357l0.824,0.398L95.014,52.887z"/>
                                                <path d="M104.495,73.049c0.822-2.182,3.964-10.637,3.964-10.637c-0.055,0.094,0.816-2.209,1.32-3.643l0.668,3.287c0,0,1.896,9.099,2.295,11.002h-8.247V73.049z M116.857,52.187h-7.535c-2.328,0-4.078,0.668-5.103,3.111L89.942,89.571h9.672c0,0,1.582-4.346,1.936-5.299c1.055,0,10.428,0.014,11.773,0.014c0.277,1.25,1.123,5.299,1.123,5.299h8.553L116.857,52.187z"/>
                                                <path d="M45.828,52.187L36.342,77.27l-1.004-5.049c-1.736-5.826-7.149-12.145-13.196-15.306l8.733,32.609h9.764l14.529-37.337H45.828z"/>
                                                <path d="M28.58,52.187h-14.95l-0.145,0.877c11.554,2.922,19.195,9.987,22.369,18.494l-3.222-16.355C32.2,52.961,30.515,52.279,28.58,52.187z"/>
                                            </svg>
                                        )}
                                        {selectedCardType === 'amex' && (
                                            <svg viewBox="0 0 152.407 108" fill="currentColor">
                                                <path d="M48.5,21.9h-6.9l-4.4,10L32.8,21.9h-7v14.8l-7.1-14.8h-6.2L5.2,40.1h4.7l1.2-2.8h8.4l1.2,2.8H32V26.5l7.6,13.6h4.5l7.6-13.6v13.6h4.7V21.9H48.5z M13.3,33.5l2.8-6.4l2.8,6.4H13.3z"/>
                                                <path d="M79.1,21.9H61.3v18.2h17.8v-4h-13V33h12.7v-3.9H66.1v-3.3h13V21.9z"/>
                                                <path d="M105.2,21.9h-6.9l-4.4,10l-4.4-10h-7v14.8L75.4,21.9h-6.2l-7.3,18.2h4.7l1.2-2.8h8.4l1.2,2.8h11.6V26.5l7.6,13.6h4.5l7.6-13.6v13.6h4.7V21.9H105.2z M70,33.5l2.8-6.4l2.8,6.4H70z"/>
                                            </svg>
                                        )}
                                    </div>
                                </div>

                                {/* Cardholder Name Overlay */}
                                <div className="card-name-overlay">
                                    {getDisplayName().toUpperCase()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="profile-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            Profile
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'card' ? 'active' : ''}`}
                            onClick={() => setActiveTab('card')}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="1" y="4" width="22" height="16" rx="2" />
                                <line x1="1" y1="10" x2="23" y2="10" />
                            </svg>
                            Virtual Card
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                            onClick={() => setActiveTab('security')}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            Security
                        </button>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'profile' && (
                        <div className="tab-content">
                            <div className="content-section">
                                <h2 className="section-heading">Profile Information</h2>

                                <div className="info-grid">
                                    <div className="info-field">
                                        <label>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                <circle cx="12" cy="7" r="4" />
                                            </svg>
                                            FIRST NAME
                                        </label>
                                        <input
                                            type="text"
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleChange}
                                            placeholder="John"
                                        />
                                    </div>

                                    <div className="info-field">
                                        <label>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                <circle cx="12" cy="7" r="4" />
                                            </svg>
                                            LAST NAME
                                        </label>
                                        <input
                                            type="text"
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleChange}
                                            placeholder="Doe"
                                        />
                                    </div>

                                    <div className="info-field">
                                        <label>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z"/>
                                            </svg>
                                            USERNAME
                                        </label>
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            placeholder="@username"
                                        />
                                    </div>

                                    <div className="info-field">
                                        <label>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="4"/>
                                                <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/>
                                            </svg>
                                            EMAIL
                                        </label>
                                        <input
                                            type="email"
                                            value={user?.email || ''}
                                            disabled
                                        />
                                    </div>

                                    <div className="info-field">
                                        <label>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                                            </svg>
                                            PHONE
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+44 7XXX XXX XXX"
                                        />
                                    </div>

                                    <div className="info-field">
                                        <label>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="4" width="18" height="18" rx="2" />
                                                <line x1="16" y1="2" x2="16" y2="6" />
                                                <line x1="8" y1="2" x2="8" y2="6" />
                                                <line x1="3" y1="10" x2="21" y2="10" />
                                            </svg>
                                            DATE OF BIRTH
                                        </label>
                                        <input
                                            type="date"
                                            name="date_of_birth"
                                            value={formData.date_of_birth}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="info-field">
                                        <label>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                                <circle cx="12" cy="10" r="3"/>
                                            </svg>
                                            LOCATION
                                        </label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            placeholder="London, United Kingdom"
                                        />
                                    </div>

                                    <div className="info-field full-width">
                                        <label>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                                <polyline points="14 2 14 8 20 8"/>
                                                <line x1="16" y1="13" x2="8" y2="13"/>
                                                <line x1="16" y1="17" x2="8" y2="17"/>
                                                <polyline points="10 9 9 9 8 9"/>
                                            </svg>
                                            BIO
                                        </label>
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleChange}
                                            placeholder="Tell us about yourself..."
                                            rows={3}
                                        />
                                    </div>
                                </div>

                                <div className="wallpaper-gallery-section">
                                    <h3>Cover Themes</h3>
                                    <div className="wallpaper-grid-compact">
                                        {predefinedWallpapers.map((wallpaper) => (
                                            <button
                                                key={wallpaper.id}
                                                className={`wallpaper-tile ${wallpaperUrl === wallpaper.gradient ? 'active' : ''}`}
                                                style={{ background: wallpaper.gradient }}
                                                onClick={() => handleSetPredefinedWallpaper(wallpaper.gradient)}
                                                title={wallpaper.name}
                                            >
                                                {wallpaperUrl === wallpaper.gradient && (
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                        <polyline points="20 6 9 17 4 12"/>
                                                    </svg>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button className="btn-save" onClick={handleSave} disabled={saving}>
                                        {saving ? (
                                            <>
                                                <div className="spinner"></div>
                                                Saving...
                                            </>
                                        ) : (
                                            'Save Changes'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'card' && (
                        <div className="tab-content">
                            <div className="content-section">
                                <h2 className="section-heading">Customize Your Virtual Card</h2>

                                <div className="card-customization">
                                    <div className="customization-group">
                                        <h3>Card Type</h3>
                                        <div className="card-type-selector">
                                            <button
                                                className={`card-type-btn ${selectedCardType === 'visa' ? 'active' : ''}`}
                                                onClick={() => setSelectedCardType('visa')}
                                            >
                                                <svg viewBox="0 0 141.732 141.732" fill="currentColor">
                                                    <g>
                                                        <path d="M62.935,89.571h-9.733l6.083-37.384h9.734L62.935,89.571z"/>
                                                        <path d="M95.014,52.887c-1.811-0.715-4.675-1.516-8.243-1.516c-9.096,0-15.504,4.777-15.558,11.614   c-0.052,5.048,4.564,7.861,8.049,9.541c3.566,1.719,4.767,2.813,4.767,4.346c-0.016,2.346-2.84,3.42-5.473,3.42   c-3.653,0-5.594-0.555-8.587-1.912l-1.193-0.555l-1.295,7.908c2.146,0.984,6.113,1.838,10.236,1.885   c9.689,0,15.963-4.736,16.042-12.07c0.036-3.996-2.406-7.038-7.691-9.542c-3.206-1.626-5.169-2.709-5.169-4.36   c0.018-1.498,1.67-3.016,5.31-3.016c2.99-0.052,5.178,0.643,6.86,1.357l0.824,0.398L95.014,52.887z"/>
                                                        <path d="M104.495,73.049c0.822-2.182,3.964-10.637,3.964-10.637c-0.055,0.094,0.816-2.209,1.32-3.643l0.668,3.287   c0,0,1.896,9.099,2.295,11.002h-8.247V73.049z M116.857,52.187h-7.535c-2.328,0-4.078,0.668-5.103,3.111L89.942,89.571h9.672   c0,0,1.582-4.346,1.936-5.299c1.055,0,10.428,0.014,11.773,0.014c0.277,1.25,1.123,5.299,1.123,5.299h8.553L116.857,52.187z"/>
                                                        <path d="M45.828,52.187L36.342,77.27l-1.004-5.049c-1.736-5.826-7.149-12.145-13.196-15.306l8.733,32.609h9.764l14.529-37.337   H45.828z"/>
                                                        <path d="M28.58,52.187h-14.95l-0.145,0.877c11.554,2.922,19.195,9.987,22.369,18.494l-3.222-16.355   C32.2,52.961,30.515,52.279,28.58,52.187z"/>
                                                    </g>
                                                </svg>
                                                Visa
                                            </button>
                                            <button
                                                className={`card-type-btn ${selectedCardType === 'mastercard' ? 'active' : ''}`}
                                                onClick={() => setSelectedCardType('mastercard')}
                                            >
                                                <svg viewBox="0 0 152.407 108" fill="currentColor">
                                                    <g>
                                                        <rect x="60.412" y="25.697" fill="currentColor" width="31.5" height="56.606"/>
                                                        <path fill="currentColor" d="M382.20312,306a35.9375,35.9375,0,0,1,13.7793-28.3037,36,36,0,1,0,0,56.6074A35.938,35.938,0,0,1,382.20312,306Z" transform="translate(-319.79688 -252)"/>
                                                        <path fill="currentColor" d="M454.20312,306a35.99867,35.99867,0,0,1-58.2207,28.3037,36.00518,36.00518,0,0,0,0-56.6074A35.99867,35.99867,0,0,1,454.20312,306Z" transform="translate(-319.79688 -252)"/>
                                                    </g>
                                                </svg>
                                                Mastercard
                                            </button>
                                            <button
                                                className={`card-type-btn ${selectedCardType === 'amex' ? 'active' : ''}`}
                                                onClick={() => setSelectedCardType('amex')}
                                            >
                                                <svg viewBox="0 0 152.407 108" fill="currentColor">
                                                    <g>
                                                        <path d="M48.5,21.9h-6.9l-4.4,10L32.8,21.9h-7v14.8l-7.1-14.8h-6.2L5.2,40.1h4.7l1.2-2.8h8.4l1.2,2.8H32V26.5l7.6,13.6h4.5   l7.6-13.6v13.6h4.7V21.9H48.5z M13.3,33.5l2.8-6.4l2.8,6.4H13.3z"/>
                                                        <path d="M79.1,21.9H61.3v18.2h17.8v-4h-13V33h12.7v-3.9H66.1v-3.3h13V21.9z"/>
                                                        <path d="M105.2,21.9h-6.9l-4.4,10l-4.4-10h-7v14.8L75.4,21.9h-6.2l-7.3,18.2h4.7l1.2-2.8h8.4l1.2,2.8h11.6V26.5l7.6,13.6h4.5   l7.6-13.6v13.6h4.7V21.9H105.2z M70,33.5l2.8-6.4l2.8,6.4H70z"/>
                                                    </g>
                                                </svg>
                                                Amex
                                            </button>
                                        </div>
                                    </div>

                                    <div className="customization-group">
                                        <h3>Card Theme</h3>
                                        <div className="card-theme-selector">
                                            {Object.entries(cardThemes).map(([key, theme]) => (
                                                <button
                                                    key={key}
                                                    className={`card-theme-btn ${selectedCardTheme === key ? 'active' : ''}`}
                                                    style={{ background: theme.gradient }}
                                                    onClick={() => setSelectedCardTheme(key)}
                                                    title={theme.name}
                                                >
                                                    {selectedCardTheme === key && (
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                                            <polyline points="20 6 9 17 4 12"/>
                                                        </svg>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button className="btn-save" onClick={handleSave} disabled={saving}>
                                        {saving ? (
                                            <>
                                                <div className="spinner"></div>
                                                Saving...
                                            </>
                                        ) : (
                                            'Save Card Settings'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="tab-content">
                            <div className="content-section">
                                <h2 className="section-heading">Change Password</h2>

                                <div className="security-form">
                                    <div className="info-field">
                                        <label>CURRENT PASSWORD</label>
                                        <div className="password-wrapper">
                                            <input
                                                type={showPasswords.current ? 'text' : 'password'}
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData(p => ({ ...p, currentPassword: e.target.value }))}
                                                placeholder="Enter current password"
                                            />
                                            <button
                                                type="button"
                                                className="password-eye"
                                                onClick={() => setShowPasswords(p => ({ ...p, current: !p.current }))}
                                            >
                                                {showPasswords.current ? (
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                                        <line x1="1" y1="1" x2="23" y2="23"/>
                                                    </svg>
                                                ) : (
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                        <circle cx="12" cy="12" r="3"/>
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="info-field">
                                        <label>NEW PASSWORD</label>
                                        <div className="password-wrapper">
                                            <input
                                                type={showPasswords.new ? 'text' : 'password'}
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData(p => ({ ...p, newPassword: e.target.value }))}
                                                placeholder="Enter new password"
                                            />
                                            <button
                                                type="button"
                                                className="password-eye"
                                                onClick={() => setShowPasswords(p => ({ ...p, new: !p.new }))}
                                            >
                                                {showPasswords.new ? (
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                                        <line x1="1" y1="1" x2="23" y2="23"/>
                                                    </svg>
                                                ) : (
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                        <circle cx="12" cy="12" r="3"/>
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                        {passwordData.newPassword && (
                                            <div className="password-strength-bar" style={{ marginTop: '8px' }}>
                                                <div
                                                    className="strength-fill"
                                                    style={{
                                                        width: `${(passwordStrength.strength / 5) * 100}%`,
                                                        backgroundColor: passwordStrength.color
                                                    }}
                                                ></div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="info-field">
                                        <label>CONFIRM NEW PASSWORD</label>
                                        <div className="password-wrapper">
                                            <input
                                                type={showPasswords.confirm ? 'text' : 'password'}
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))}
                                                placeholder="Confirm new password"
                                            />
                                            <button
                                                type="button"
                                                className="password-eye"
                                                onClick={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))}
                                            >
                                                {showPasswords.confirm ? (
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                                        <line x1="1" y1="1" x2="23" y2="23"/>
                                                    </svg>
                                                ) : (
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                        <circle cx="12" cy="12" r="3"/>
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="form-actions">
                                        <button
                                            className="btn-save"
                                            onClick={handlePasswordChange}
                                            disabled={passwordLoading || !passwordData.currentPassword || !passwordData.newPassword}
                                        >
                                            {passwordLoading ? (
                                                <>
                                                    <div className="spinner"></div>
                                                    Updating...
                                                </>
                                            ) : (
                                                'Update Password'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Profile;