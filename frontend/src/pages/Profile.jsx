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

    // Card themes - Modern gradient designs with wave patterns
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
            textColor: '#fff'
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
        magenta: {
            name: 'Magenta Dream',
            gradient: 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)',
            textColor: '#fff'
        },
        fire: {
            name: 'Fire Blaze',
            gradient: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)',
            textColor: '#fff'
        },
        teal: {
            name: 'Teal Wave',
            gradient: 'linear-gradient(135deg, #0cebeb 0%, #20e3b2 100%)',
            textColor: '#2c3e50'
        },
        violet: {
            name: 'Violet Storm',
            gradient: 'linear-gradient(135deg, #7F00FF 0%, #E100FF 100%)',
            textColor: '#fff'
        },
        coral: {
            name: 'Coral Reef',
            gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ffa07a 100%)',
            textColor: '#fff'
        },
        lime: {
            name: 'Lime Fusion',
            gradient: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)',
            textColor: '#2c3e50'
        },
        amber: {
            name: 'Amber Glow',
            gradient: 'linear-gradient(135deg, #f79d00 0%, #64f38c 100%)',
            textColor: '#2c3e50'
        },
        sapphire: {
            name: 'Sapphire Sky',
            gradient: 'linear-gradient(135deg, #0575e6 0%, #021b79 100%)',
            textColor: '#fff'
        },
        cherry: {
            name: 'Cherry Blossom',
            gradient: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
            textColor: '#fff'
        },
        mint: {
            name: 'Mint Fresh',
            gradient: 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)',
            textColor: '#2c3e50'
        },
        navy: {
            name: 'Navy Deep',
            gradient: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
            textColor: '#fff'
        },
        gold: {
            name: 'Golden Luxury',
            gradient: 'linear-gradient(135deg, #d4af37 0%, #f9d423 100%)',
            textColor: '#2c3e50'
        },
        royal: {
            name: 'Royal Purple',
            gradient: 'linear-gradient(135deg, #4a148c 0%, #7b1fa2 100%)',
            textColor: '#fff'
        },
        silver: {
            name: 'Silver Mist',
            gradient: 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)',
            textColor: '#fff'
        },
        crimson: {
            name: 'Crimson Wave',
            gradient: 'linear-gradient(135deg, #8e0e00 0%, #1f1c18 100%)',
            textColor: '#fff'
        },
        aqua: {
            name: 'Aqua Marine',
            gradient: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
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
                                {/* AI Orb - Top Right Corner (Revolut Style) */}
                                <div className="card-ai-background">
                                    <FinScopeAI />
                                </div>

                                {/* Top Section - Brand Only */}
                                <div className="card-top">
                                    <div className="card-brand-text">
                                        <div className="brand-name">FinScope AI</div>
                                        <div className="virtual-label">VIRTUAL</div>
                                    </div>
                                    {/* Contactless icon removed - AI orb in top-right replaces it */}
                                </div>

                                {/* Card Number - Center */}
                                <div className="card-number-center">
                                    <span>****</span>
                                    <span>****</span>
                                    <span>****</span>
                                    <span className="highlighted-digits">5000</span>
                                </div>

                                {/* Bottom Section - Only Network Logo */}
                                <div className="card-bottom-info">
                                    <div className="card-network-logo">
                                        {selectedCardType === 'mastercard' && (
                                            <svg viewBox="0 0 131.39 86.9" fill="none">
                                                <circle cx="41.5" cy="43.45" r="35.9" fill="#eb001b"/>
                                                <circle cx="89.9" cy="43.45" r="35.9" fill="#f79e1b"/>
                                                <path d="M65.7,21.1c-6.9,5.3-11.4,13.6-11.4,23s4.5,17.7,11.4,23c6.9-5.3,11.4-13.6,11.4-23S72.6,26.4,65.7,21.1z" fill="#ff5f00"/>
                                            </svg>
                                        )}
                                        {selectedCardType === 'visa' && (
                                            <svg viewBox="0 0 750 471" fill="none">
                                                <rect width="750" height="471" fill="none"/>
                                                <path fill="currentColor" d="M278.2 334.2l33.4-195.7h53.4l-33.4 195.7h-53.4zm246.8-191.9c-10.6-4-27.1-8.4-47.8-8.4-52.7 0-89.8 26.3-90.1 64-0.3 27.9 26.5 43.5 46.8 52.8 20.8 9.6 27.8 15.7 27.7 24.2-0.2 13.1-16.7 19.1-32.2 19.1-21.5 0-32.9-2.9-50.5-10.1l-7-3.1-7.6 44.3c12.5 5.4 35.8 10.2 59.9 10.4 56 0 92.4-26 92.7-66.2 0.2-22.1-14-38.9-44.7-52.8-18.6-9-30-15-29.9-24.1 0-8.1 9.6-16.7 30.4-16.7 17.4-0.3 30 3.5 39.8 7.5l4.8 2.2 7.3-42.1zm91.5-3.8h-41.3c-12.8 0-22.4 3.5-28 16.2l-79.4 179.5h56l11.1-29.1h68.5l6.5 29.1h49.4l-43.1-195.7zm-66.8 126.2c0.3-0.8 22.4-57.4 22.4-57.4-0.3 0.5 4.6-11.9 7.5-19.6l3.8 17.9s10.8 49.1 13 59.1h-46.7zm-233.5-126.2l-52.5 133.5-5.6-27.1c-9.7-30.8-40-64.2-73.9-80.9l47.8 169.9h56.5l84.1-195.4h-56.4z"/>
                                            </svg>
                                        )}
                                        {selectedCardType === 'amex' && (
                                            <svg viewBox="0 0 300 200" fill="none">
                                                <rect width="300" height="200" fill="none"/>
                                                <path fill="currentColor" d="M55.9 65.2h-8.5l-5.4 12.3-5.7-12.3h-8.6v18.2l-8.8-18.2h-7.6l-9 18.2h5.8l1.5-3.5h10.4l1.5 3.5h12.2V72.9l9.3 13.3h5.6l9.4-13.3v13.3h5.8V65.2h-7.9zm-38.1 12l3.4-7.9 3.4 7.9h-6.8zm98.8-12h-17.5v18.2h17.5v-4.9h-11.7v-2.5h11.4v-4.8h-11.4v-2.1h11.7v-3zm51.8 0h-6.8l-5.4 12.3-5.7-12.3h-8.6v18.2l-8.8-18.2h-7.6l-9 18.2h5.8l1.5-3.5h10.4l1.5 3.5h12.2V72.9l9.3 13.3h5.6l9.4-13.3v13.3h5.8V65.2h-9.6zm-38.1 12l3.4-7.9 3.4 7.9h-6.8zm74.5 6.2v-18.4h-14.7v4.2h4.4v14.2h-4.4v4.2h14.1v-4.2h-4.3z"/>
                                                <path fill="currentColor" d="M48.7 105.6l-9-18.2h-7.6l-9 18.2h5.8l1.5-3.5h10.4l1.5 3.5h6.4zm-13.4-6.4l3.4-7.9 3.4 7.9h-6.8zm75.9-4.5c0-4.5-2.9-7.3-7.8-7.3h-12v18.2h5.8v-5.5h4.5l3.8 5.5h6.8l-4.5-6.4c2.3-0.9 3.4-3 3.4-4.5zm-14 1.6v-5.1h5.6c1.7 0 2.6 0.9 2.6 2.5s-0.9 2.6-2.6 2.6h-5.6zm58.5-8.9h-17.5v18.2h17.5v-4.9h-11.7v-2.5h11.4v-4.8h-11.4v-2.1h11.7v-3zm18.6 0h-5.8v18.2h5.8v-18.2zm32.8 13.3c-1.4 0-2.5-1.1-2.5-2.5v-3.1c0-1.4 1.1-2.5 2.5-2.5 1.1 0 2.1 0.7 2.4 1.7h6.1c-0.7-4.3-4.3-7.5-8.5-7.5-4.8 0-8.7 3.9-8.7 8.7v2.6c0 4.8 3.9 8.7 8.7 8.7 4.2 0 7.8-3.2 8.5-7.5h-6.1c-0.3 1-1.3 1.7-2.4 1.7zm39-13.3h-8.5l-5.4 12.3-5.7-12.3h-8.6v18.2l-8.8-18.2h-7.6l-9 18.2h5.8l1.5-3.5h10.4l1.5 3.5h12.2V92.6l9.3 13.3h5.6l9.4-13.3v13.3h5.8V87.4h-7.9zm-38.1 12l3.4-7.9 3.4 7.9h-6.8zm92 6.2v-18.4h-7.2l-9 11.4-9-11.4H267v18.4h5.8v-10.8l8.2 10.8 8.2-10.8v10.8h5.8z"/>
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
                                                <svg viewBox="0 0 750 471" fill="none">
                                                    <rect width="750" height="471" fill="none"/>
                                                    <path fill="#1434CB" d="M278.2 334.2l33.4-195.7h53.4l-33.4 195.7h-53.4zm246.8-191.9c-10.6-4-27.1-8.4-47.8-8.4-52.7 0-89.8 26.3-90.1 64-0.3 27.9 26.5 43.5 46.8 52.8 20.8 9.6 27.8 15.7 27.7 24.2-0.2 13.1-16.7 19.1-32.2 19.1-21.5 0-32.9-2.9-50.5-10.1l-7-3.1-7.6 44.3c12.5 5.4 35.8 10.2 59.9 10.4 56 0 92.4-26 92.7-66.2 0.2-22.1-14-38.9-44.7-52.8-18.6-9-30-15-29.9-24.1 0-8.1 9.6-16.7 30.4-16.7 17.4-0.3 30 3.5 39.8 7.5l4.8 2.2 7.3-42.1zm91.5-3.8h-41.3c-12.8 0-22.4 3.5-28 16.2l-79.4 179.5h56l11.1-29.1h68.5l6.5 29.1h49.4l-43.1-195.7zm-66.8 126.2c0.3-0.8 22.4-57.4 22.4-57.4-0.3 0.5 4.6-11.9 7.5-19.6l3.8 17.9s10.8 49.1 13 59.1h-46.7zm-233.5-126.2l-52.5 133.5-5.6-27.1c-9.7-30.8-40-64.2-73.9-80.9l47.8 169.9h56.5l84.1-195.4h-56.4z"/>
                                                    <path fill="#FAA61A" d="M131.9 138.5H45.2L44.6 142c66.6 16 110.7 54.7 129 101.2l-18.6-88.3c-3.2-12.3-12.4-16.1-23.1-16.4z"/>
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
                                                <svg viewBox="0 0 300 200" fill="none">
                                                    <rect width="300" height="200" fill="none"/>
                                                    <path fill="#006FCF" d="M0 100C0 44.8 44.8 0 100 0h100c55.2 0 100 44.8 100 100s-44.8 100-100 100H100C44.8 200 0 155.2 0 100z"/>
                                                    <path fill="#FFF" d="M55.9 65.2h-8.5l-5.4 12.3-5.7-12.3h-8.6v18.2l-8.8-18.2h-7.6l-9 18.2h5.8l1.5-3.5h10.4l1.5 3.5h12.2V72.9l9.3 13.3h5.6l9.4-13.3v13.3h5.8V65.2h-7.9zm-38.1 12l3.4-7.9 3.4 7.9h-6.8zm98.8-12h-17.5v18.2h17.5v-4.9h-11.7v-2.5h11.4v-4.8h-11.4v-2.1h11.7v-3zm51.8 0h-6.8l-5.4 12.3-5.7-12.3h-8.6v18.2l-8.8-18.2h-7.6l-9 18.2h5.8l1.5-3.5h10.4l1.5 3.5h12.2V72.9l9.3 13.3h5.6l9.4-13.3v13.3h5.8V65.2h-9.6zm-38.1 12l3.4-7.9 3.4 7.9h-6.8zm74.5 6.2v-18.4h-14.7v4.2h4.4v14.2h-4.4v4.2h14.1v-4.2h-4.3z"/>
                                                    <path fill="#FFF" d="M48.7 105.6l-9-18.2h-7.6l-9 18.2h5.8l1.5-3.5h10.4l1.5 3.5h6.4zm-13.4-6.4l3.4-7.9 3.4 7.9h-6.8zm75.9-4.5c0-4.5-2.9-7.3-7.8-7.3h-12v18.2h5.8v-5.5h4.5l3.8 5.5h6.8l-4.5-6.4c2.3-0.9 3.4-3 3.4-4.5zm-14 1.6v-5.1h5.6c1.7 0 2.6 0.9 2.6 2.5s-0.9 2.6-2.6 2.6h-5.6zm58.5-8.9h-17.5v18.2h17.5v-4.9h-11.7v-2.5h11.4v-4.8h-11.4v-2.1h11.7v-3zm18.6 0h-5.8v18.2h5.8v-18.2zm32.8 13.3c-1.4 0-2.5-1.1-2.5-2.5v-3.1c0-1.4 1.1-2.5 2.5-2.5 1.1 0 2.1 0.7 2.4 1.7h6.1c-0.7-4.3-4.3-7.5-8.5-7.5-4.8 0-8.7 3.9-8.7 8.7v2.6c0 4.8 3.9 8.7 8.7 8.7 4.2 0 7.8-3.2 8.5-7.5h-6.1c-0.3 1-1.3 1.7-2.4 1.7zm39-13.3h-8.5l-5.4 12.3-5.7-12.3h-8.6v18.2l-8.8-18.2h-7.6l-9 18.2h5.8l1.5-3.5h10.4l1.5 3.5h12.2V92.6l9.3 13.3h5.6l9.4-13.3v13.3h5.8V87.4h-7.9zm-38.1 12l3.4-7.9 3.4 7.9h-6.8zm92 6.2v-18.4h-7.2l-9 11.4-9-11.4H267v18.4h5.8v-10.8l8.2 10.8 8.2-10.8v10.8h5.8z"/>
                                                </svg>
                                                American Express
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