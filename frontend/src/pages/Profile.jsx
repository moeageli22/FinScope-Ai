import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useLanguage } from '../pages/LanguageContext';
import UserMenu from '../components/UserMenu.jsx';
import FinScopeAI from '../components/FinScopeAI';
import AnimatedWallpaper from '../components/AnimatedWallpaper.jsx';
import './Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const fileInputRef = useRef(null);

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [toast, setToast] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [wallpaperUrl, setWallpaperUrl] = useState(null);
    const [selectedCardType, setSelectedCardType] = useState('visa');
    const [selectedCardTheme, setSelectedCardTheme] = useState('neon');
    const [memberSince, setMemberSince] = useState('');

    // Full profile form — includes all fields from Register
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        username: '',
        phone: '',
        date_of_birth: '',
        city: '',
        country: '',
        location: '',
        bio: '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '', newPassword: '', confirmPassword: '',
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false, new: false, confirm: false,
    });

    const cardThemes = {
        neon:      { name: 'Neon Purple',      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',  textColor: '#fff' },
        aurora:    { name: 'Aurora Blue',       gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',  textColor: '#fff' },
        midnight:  { name: 'Midnight Black',    gradient: 'linear-gradient(135deg, #232526 0%, #414345 100%)',  textColor: '#fff' },
        sunset:    { name: 'Sunset Glow',       gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',  textColor: '#fff' },
        ocean:     { name: 'Deep Ocean',        gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',  textColor: '#fff' },
        emerald:   { name: 'Emerald Forest',    gradient: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)',  textColor: '#fff' },
        rose:      { name: 'Rose Gold',         gradient: 'linear-gradient(135deg, #ed6ea0 0%, #ec8c69 100%)',  textColor: '#fff' },
        cosmic:    { name: 'Cosmic Night',      gradient: 'linear-gradient(135deg, #000428 0%, #004e92 100%)',  textColor: '#fff' },
        magenta:   { name: 'Magenta Dream',     gradient: 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)',  textColor: '#fff' },
        fire:      { name: 'Fire Blaze',        gradient: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)',  textColor: '#fff' },
        teal:      { name: 'Teal Wave',         gradient: 'linear-gradient(135deg, #0cebeb 0%, #20e3b2 100%)',  textColor: '#2c3e50' },
        violet:    { name: 'Violet Storm',      gradient: 'linear-gradient(135deg, #7F00FF 0%, #E100FF 100%)',  textColor: '#fff' },
        coral:     { name: 'Coral Reef',        gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ffa07a 100%)',  textColor: '#fff' },
        lime:      { name: 'Lime Fusion',       gradient: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)',  textColor: '#2c3e50' },
        amber:     { name: 'Amber Glow',        gradient: 'linear-gradient(135deg, #f79d00 0%, #64f38c 100%)',  textColor: '#2c3e50' },
        sapphire:  { name: 'Sapphire Sky',      gradient: 'linear-gradient(135deg, #0575e6 0%, #021b79 100%)',  textColor: '#fff' },
        cherry:    { name: 'Cherry Blossom',    gradient: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',  textColor: '#fff' },
        mint:      { name: 'Mint Fresh',        gradient: 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)',  textColor: '#2c3e50' },
        navy:      { name: 'Navy Deep',         gradient: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',  textColor: '#fff' },
        gold:      { name: 'Golden Luxury',     gradient: 'linear-gradient(135deg, #d4af37 0%, #f9d423 100%)',  textColor: '#2c3e50' },
        royal:     { name: 'Royal Purple',      gradient: 'linear-gradient(135deg, #4a148c 0%, #7b1fa2 100%)',  textColor: '#fff' },
        silver:    { name: 'Silver Mist',       gradient: 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)',  textColor: '#fff' },
        crimson:   { name: 'Crimson Wave',      gradient: 'linear-gradient(135deg, #8e0e00 0%, #1f1c18 100%)',  textColor: '#fff' },
        aqua:      { name: 'Aqua Marine',       gradient: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',  textColor: '#fff' },
    };

    const animatedWallpapers = [
        { id: 'anim-starfield', name: 'Starfield',       emoji: '✦',  description: 'Twinkling stars with shooting stars' },
        { id: 'anim-aurora',    name: 'Aurora Borealis', emoji: '🌌', description: 'Northern lights dancing across the sky' },
        { id: 'anim-particles', name: 'Neural Network',  emoji: '🔮', description: 'Connected particles floating in space' },
        { id: 'anim-matrix',    name: 'Digital Rain',    emoji: '💻', description: 'Cascading matrix-style characters' },
        { id: 'anim-ocean',     name: 'Deep Ocean',      emoji: '🌊', description: 'Underwater scene with light rays' },
        { id: 'anim-fireflies', name: 'Fireflies',       emoji: '🪲', description: 'Glowing fireflies in the night' },
        { id: 'anim-nebula',    name: 'Nebula',          emoji: '🌈', description: 'Colorful cosmic nebula clouds' },
        { id: 'anim-rain',      name: 'Night Rain',      emoji: '🌧', description: 'Gentle rain with lightning' },
        { id: 'anim-lava',      name: 'Molten Lava',     emoji: '🌋', description: 'Glowing lava with floating embers' },
        { id: 'anim-snowfall',  name: 'Snowfall',        emoji: '❄️', description: 'Peaceful snowfall at night' },
        { id: 'anim-galaxy',    name: 'Galaxy Spiral',   emoji: '🌀', description: 'Rotating spiral galaxy' },
    ];



    useEffect(() => { loadProfile(); }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const loadProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { navigate('/login'); return; }
            setUser(user);

            // Member-since date from auth metadata
            if (user.created_at) {
                const d = new Date(user.created_at);
                setMemberSince(d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }));
            }

            const { data: profile } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profile) {
                setFormData({
                    first_name:    profile.first_name    || '',
                    last_name:     profile.last_name     || '',
                    username:      profile.username      || '',
                    phone:         profile.phone         || '',
                    date_of_birth: profile.date_of_birth || '',
                    // city & country come from Register; location is a freeform override
                    city:          profile.city          || '',
                    country:       profile.country       || '',
                    location:      profile.location      || '',
                    bio:           profile.bio           || '',
                });
                if (profile.avatar_url)  setAvatarUrl(profile.avatar_url);
                if (profile.wallpaper_url) setWallpaperUrl(profile.wallpaper_url);
                if (profile.card_type)   setSelectedCardType(profile.card_type);
                if (profile.card_theme) {
                    const themeMapping = { purple: 'neon', blue: 'ocean', black: 'midnight', gold: 'sunset', pink: 'rose', green: 'emerald' };
                    setSelectedCardTheme(themeMapping[profile.card_theme] || profile.card_theme);
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
            const { error } = await supabase.from('user_profiles').upsert({
                id: user.id,
                ...formData,
                date_of_birth: formData.date_of_birth || null,
                avatar_url:    avatarUrl,
                wallpaper_url: wallpaperUrl,
                card_type:     selectedCardType,
                card_theme:    selectedCardTheme,
                updated_at:    new Date().toISOString(),
            }, { onConflict: 'id' });
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
        if (file.size > 2 * 1024 * 1024) { showToast('File too large. Max 2MB.', 'error'); return; }
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/avatar.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true });
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
            const timestampedUrl = `${publicUrl}?t=${Date.now()}`;
            await supabase.from('user_profiles').upsert({ id: user.id, avatar_url: timestampedUrl, updated_at: new Date().toISOString() }, { onConflict: 'id' });
            setAvatarUrl(timestampedUrl);
            showToast('Avatar updated successfully');
        } catch (error) {
            showToast('Failed to upload avatar', 'error');
        }
    };

    const handleWallpaperUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { showToast('File too large. Max 5MB.', 'error'); return; }
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/wallpaper.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('wallpapers').upload(fileName, file, { upsert: true });
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('wallpapers').getPublicUrl(fileName);
            const timestampedUrl = `${publicUrl}?t=${Date.now()}`;
            await supabase.from('user_profiles').upsert({ id: user.id, wallpaper_url: timestampedUrl, updated_at: new Date().toISOString() }, { onConflict: 'id' });
            setWallpaperUrl(timestampedUrl);
            showToast('Wallpaper updated');
        } catch (error) {
            showToast('Failed to upload wallpaper', 'error');
        }
    };

    const handleSetPredefinedWallpaper = async (value) => {
        try {
            await supabase.from('user_profiles').upsert({ id: user.id, wallpaper_url: value, updated_at: new Date().toISOString() }, { onConflict: 'id' });
            setWallpaperUrl(value);
            showToast('Wallpaper updated');
        } catch (error) {
            showToast('Failed to update wallpaper', 'error');
        }
    };

    const handlePasswordChange = async () => {
        if (!passwordData.currentPassword) { showToast('Current password is required', 'error'); return; }
        if (passwordData.newPassword !== passwordData.confirmPassword) { showToast('Passwords do not match', 'error'); return; }
        if (passwordData.newPassword.length < 8) { showToast('Password must be at least 8 characters', 'error'); return; }
        setPasswordLoading(true);
        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email, password: passwordData.currentPassword });
            if (signInError) throw new Error('Current password is incorrect');
            const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });
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
        if (formData.first_name && formData.last_name)
            return `${formData.first_name[0]}${formData.last_name[0]}`.toUpperCase();
        return user?.email?.[0]?.toUpperCase() || 'U';
    };

    const getDisplayName = () => {
        if (formData.first_name && formData.last_name) return `${formData.first_name} ${formData.last_name}`;
        if (formData.username) return formData.username;
        return user?.email?.split('@')[0] || 'User';
    };

    const getLocationDisplay = () => {
        if (formData.city && formData.country) return `${formData.city}, ${formData.country}`;
        if (formData.location) return formData.location;
        return null;
    };

    const getPasswordStrength = (password) => {
        if (!password) return { strength: 0, label: '', color: '' };
        let s = 0;
        if (password.length >= 8)  s++;
        if (password.length >= 12) s++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) s++;
        if (/\d/.test(password))   s++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) s++;
        if (s <= 2) return { strength: s, label: 'Weak',        color: '#ef4444' };
        if (s <= 3) return { strength: s, label: 'Medium',      color: '#f59e0b' };
        if (s <= 4) return { strength: s, label: 'Strong',      color: '#10b981' };
        return       { strength: s, label: 'Very Strong',  color: '#06b6d4' };
    };

    const isAnimatedWallpaper = wallpaperUrl?.startsWith('anim-');
    const passwordStrength    = getPasswordStrength(passwordData.newPassword);
    const currentCardTheme    = cardThemes[selectedCardTheme] || cardThemes.neon;

    const PasswordField = ({ label, field }) => (
        <div className="info-field">
            <label>{label}</label>
            <div className="password-wrapper">
                <input
                    type={showPasswords[field] ? 'text' : 'password'}
                    value={passwordData[field === 'current' ? 'currentPassword' : field === 'new' ? 'newPassword' : 'confirmPassword']}
                    onChange={(e) => setPasswordData(p => ({
                        ...p,
                        [field === 'current' ? 'currentPassword' : field === 'new' ? 'newPassword' : 'confirmPassword']: e.target.value,
                    }))}
                    placeholder={`Enter ${label.toLowerCase()}`}
                />
                <button type="button" className="password-eye" onClick={() => setShowPasswords(p => ({ ...p, [field]: !p[field] }))}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {showPasswords[field] ? (
                            <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                        ) : (
                            <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                        )}
                    </svg>
                </button>
            </div>
            {field === 'new' && passwordData.newPassword && (
                <div className="password-strength-wrap">
                    <div className="password-strength-bar">
                        <div className="strength-fill" style={{ width: `${(passwordStrength.strength / 5) * 100}%`, backgroundColor: passwordStrength.color }} />
                    </div>
                    <span className="strength-label" style={{ color: passwordStrength.color }}>{passwordStrength.label}</span>
                </div>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="profile-page">
                <div className="profile-loading"><div className="loading-spinner" /><p>Loading your profile...</p></div>
            </div>
        );
    }

    const tabs = [
        { id: 'profile',  label: 'Profile',      icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></> },
        { id: 'card',     label: 'Virtual Card',  icon: <><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></> },
        { id: 'wallpaper',label: 'Wallpaper',     icon: <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></> },
        { id: 'security', label: 'Security',      icon: <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></> },
    ];

    return (
        <div className="profile-page">
            {/* Toast */}
            {toast && (
                <div className={`profile-toast ${toast.type}`}>
                    <span className="toast-icon">{toast.type === 'success' ? '✓' : '✕'}</span>
                    {toast.message}
                </div>
            )}

            {/* Header */}
            <header className="profile-header">
                <div className="profile-header-content">
                    <button className="profile-back-btn" onClick={() => navigate('/dashboard')}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7"/>
                        </svg>
                        <span>Dashboard</span>
                    </button>
                    <div className="header-center-logo">
                        <span className="header-logo-text">FinScope <em>AI</em></span>
                    </div>
                    <UserMenu />
                </div>
            </header>

            <main className="profile-main">

                {/* ── Hero Banner ──────────────────────────────────── */}
                <div className="profile-hero-banner" style={{
                    background: isAnimatedWallpaper
                        ? '#050514'
                        : wallpaperUrl?.startsWith('linear-gradient')
                            ? wallpaperUrl
                            : wallpaperUrl
                                ? `url(${wallpaperUrl})`
                                : 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}>
                    {isAnimatedWallpaper && <AnimatedWallpaper theme={wallpaperUrl} />}
                    <div className="banner-overlay" />
                    <button className="change-cover-btn" onClick={() => setActiveTab('wallpaper')}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        Change Cover
                    </button>
                </div>

                {/* ── Profile Content ───────────────────────────────── */}
                <div className="profile-content-wrapper">

                    {/* Hero Section: Avatar + Info + Card */}
                    <div className="profile-hero-section">

                        {/* Left: Avatar + Name */}
                        <div className="profile-info-left">
                            {/* Avatar */}
                            <div className="profile-avatar-large">
                                {avatarUrl
                                    ? <img src={avatarUrl} alt="Avatar"/>
                                    : <div className="avatar-placeholder-large">{getUserInitials()}</div>
                                }
                                <label className="avatar-camera-btn" title="Upload photo">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                                        <circle cx="12" cy="13" r="4"/>
                                    </svg>
                                    <input type="file" ref={fileInputRef} accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }}/>
                                </label>
                            </div>

                            {/* Name / info */}
                            <div className="profile-header-info">
                                <div className="profile-name-row">
                                    <h1 className="profile-display-name">{getDisplayName()}</h1>
                                    {formData.username && (
                                        <span className="profile-username-tag">@{formData.username}</span>
                                    )}
                                </div>
                                <p className="profile-email">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                        <polyline points="22,6 12,13 2,6"/>
                                    </svg>
                                    {user?.email}
                                </p>
                                {getLocationDisplay() && (
                                    <p className="profile-location-row">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                            <circle cx="12" cy="10" r="3"/>
                                        </svg>
                                        {getLocationDisplay()}
                                    </p>
                                )}
                                {formData.bio && (
                                    <p className="profile-bio-preview">{formData.bio}</p>
                                )}

                                {/* Quick stats chips */}
                                <div className="profile-stat-chips">
                                    {memberSince && (
                                        <span className="stat-chip">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                                                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                                            </svg>
                                            Member since {memberSince}
                                        </span>
                                    )}
                                    {formData.date_of_birth && (
                                        <span className="stat-chip">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                                                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                                            </svg>
                                            Born {new Date(formData.date_of_birth).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    )}
                                    {formData.phone && (
                                        <span className="stat-chip">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.13 11.87a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.07 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                                            </svg>
                                            {formData.phone}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right: Virtual Card */}
                        <div className="virtual-card-container">
                            <div className="card-label-row">
                                <span className="card-label-text">Your Virtual Card</span>
                                <button className="card-edit-btn" onClick={() => setActiveTab('card')}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                    Customise
                                </button>
                            </div>
                            <div
                                className="virtual-card"
                                style={{ background: currentCardTheme.gradient, color: currentCardTheme.textColor }}
                            >
                                <div className="card-ai-background"><FinScopeAI /></div>
                                <div className="card-top">
                                    <div className="card-brand-text">
                                        <div className="brand-name">FinScope AI</div>
                                        <div className="virtual-label">VIRTUAL</div>
                                    </div>
                                </div>
                                <div className="card-number-center">
                                    <span>****</span><span>****</span><span>****</span>
                                    <span className="highlighted-digits">5000</span>
                                </div>
                                <div className="card-bottom-info">
                                    <div className="card-holder-name">{getDisplayName().toUpperCase()}</div>
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
                                                <path fill="currentColor" d="M278.2 334.2l33.4-195.7h53.4l-33.4 195.7h-53.4zm246.8-191.9c-10.6-4-27.1-8.4-47.8-8.4-52.7 0-89.8 26.3-90.1 64-0.3 27.9 26.5 43.5 46.8 52.8 20.8 9.6 27.8 15.7 27.7 24.2-0.2 13.1-16.7 19.1-32.2 19.1-21.5 0-32.9-2.9-50.5-10.1l-7-3.1-7.6 44.3c12.5 5.4 35.8 10.2 59.9 10.4 56 0 92.4-26 92.7-66.2 0.2-22.1-14-38.9-44.7-52.8-18.6-9-30-15-29.9-24.1 0-8.1 9.6-16.7 30.4-16.7 17.4-0.3 30 3.5 39.8 7.5l4.8 2.2 7.3-42.1z"/>
                                            </svg>
                                        )}
                                        {selectedCardType === 'amex' && (
                                            <svg viewBox="0 0 300 200" fill="none">
                                                <path fill="currentColor" d="M55.9 65.2h-8.5l-5.4 12.3-5.7-12.3h-8.6v18.2l-8.8-18.2h-7.6l-9 18.2h5.8l1.5-3.5h10.4l1.5 3.5h12.2V72.9l9.3 13.3h5.6l9.4-13.3v13.3h5.8V65.2h-7.9z"/>
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Tabs ─────────────────────────────────────── */}
                    <div className="profile-tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{tab.icon}</svg>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* ══════════════════════════════════════
                        PROFILE TAB
                    ══════════════════════════════════════ */}
                    {activeTab === 'profile' && (
                        <div className="tab-content">

                            {/* Account Overview Card */}
                            <div className="account-overview-card">
                                <div className="overview-avatar-mini">
                                    {avatarUrl
                                        ? <img src={avatarUrl} alt="Avatar"/>
                                        : <span>{getUserInitials()}</span>
                                    }
                                </div>
                                <div className="overview-details">
                                    <h3>{getDisplayName()}</h3>
                                    <p>{user?.email}</p>
                                </div>
                                <div className="overview-badges">
                                    <span className="badge badge-verified">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12">
                                            <polyline points="20 6 9 17 4 12"/>
                                        </svg>
                                        Verified
                                    </span>
                                    <span className="badge badge-member">FinScope Member</span>
                                </div>
                            </div>

                            {/* Personal Info */}
                            <div className="content-section">
                                <div className="section-header-row">
                                    <h2 className="section-heading">Personal Information</h2>
                                    <p className="section-sub">As provided during registration</p>
                                </div>
                                <div className="info-grid">
                                    {/* First Name */}
                                    <div className="info-field">
                                        <label>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                                            </svg>
                                            FIRST NAME
                                        </label>
                                        <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="John"/>
                                    </div>
                                    {/* Last Name */}
                                    <div className="info-field">
                                        <label>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                                            </svg>
                                            LAST NAME
                                        </label>
                                        <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Doe"/>
                                    </div>
                                    {/* Username */}
                                    <div className="info-field">
                                        <label>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z"/>
                                            </svg>
                                            USERNAME
                                        </label>
                                        <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="@username"/>
                                    </div>
                                    {/* Email (read-only) */}
                                    <div className="info-field">
                                        <label>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                                            </svg>
                                            EMAIL
                                        </label>
                                        <input type="email" value={user?.email || ''} disabled className="input-disabled"/>
                                        <span className="field-hint">Email cannot be changed here</span>
                                    </div>
                                    {/* Phone */}
                                    <div className="info-field">
                                        <label>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.13 11.87a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.07 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                                            </svg>
                                            PHONE
                                        </label>
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+44 7XXX XXX XXX"/>
                                    </div>
                                    {/* Date of Birth */}
                                    <div className="info-field">
                                        <label>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                                            </svg>
                                            DATE OF BIRTH
                                        </label>
                                        <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange}/>
                                    </div>
                                    {/* City */}
                                    <div className="info-field">
                                        <label>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                                            </svg>
                                            CITY
                                        </label>
                                        <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="London"/>
                                    </div>
                                    {/* Country */}
                                    <div className="info-field">
                                        <label>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                                            </svg>
                                            COUNTRY
                                        </label>
                                        <input type="text" name="country" value={formData.country} onChange={handleChange} placeholder="United Kingdom"/>
                                    </div>
                                    {/* Bio - full width */}
                                    <div className="info-field full-width">
                                        <label>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                                            </svg>
                                            BIO
                                        </label>
                                        <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Tell us about yourself..." rows={3}/>
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button className="btn-save" onClick={handleSave} disabled={saving}>
                                        {saving ? <><div className="spinner"/><span>Saving...</span></> : <>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                                                <polyline points="20 6 9 17 4 12"/>
                                            </svg>
                                            Save Changes
                                        </>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ══════════════════════════════════════
                        CARD TAB
                    ══════════════════════════════════════ */}
                    {activeTab === 'card' && (
                        <div className="tab-content">
                            <div className="content-section">
                                <div className="section-header-row">
                                    <h2 className="section-heading">Customise Your Virtual Card</h2>
                                    <p className="section-sub">Pick the look that fits you</p>
                                </div>

                                {/* Live card preview */}
                                <div className="card-preview-section">
                                    <div
                                        className="virtual-card card-preview-full"
                                        style={{ background: currentCardTheme.gradient, color: currentCardTheme.textColor }}
                                    >
                                        <div className="card-ai-background"><FinScopeAI /></div>
                                        <div className="card-top">
                                            <div className="card-brand-text">
                                                <div className="brand-name">FinScope AI</div>
                                                <div className="virtual-label">VIRTUAL</div>
                                            </div>
                                        </div>
                                        <div className="card-number-center">
                                            <span>****</span><span>****</span><span>****</span>
                                            <span className="highlighted-digits">5000</span>
                                        </div>
                                        <div className="card-bottom-info">
                                            <div className="card-holder-name">{getDisplayName().toUpperCase()}</div>
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
                                                        <path fill="currentColor" d="M278.2 334.2l33.4-195.7h53.4l-33.4 195.7h-53.4zm246.8-191.9c-10.6-4-27.1-8.4-47.8-8.4-52.7 0-89.8 26.3-90.1 64-0.3 27.9 26.5 43.5 46.8 52.8 20.8 9.6 27.8 15.7 27.7 24.2-0.2 13.1-16.7 19.1-32.2 19.1-21.5 0-32.9-2.9-50.5-10.1l-7-3.1-7.6 44.3c12.5 5.4 35.8 10.2 59.9 10.4 56 0 92.4-26 92.7-66.2 0.2-22.1-14-38.9-44.7-52.8-18.6-9-30-15-29.9-24.1 0-8.1 9.6-16.7 30.4-16.7 17.4-0.3 30 3.5 39.8 7.5l4.8 2.2 7.3-42.1z"/>
                                                    </svg>
                                                )}
                                                {selectedCardType === 'amex' && (
                                                    <svg viewBox="0 0 300 200" fill="none">
                                                        <path fill="currentColor" d="M55.9 65.2h-8.5l-5.4 12.3-5.7-12.3h-8.6v18.2l-8.8-18.2h-7.6l-9 18.2h5.8l1.5-3.5h10.4l1.5 3.5h12.2V72.9l9.3 13.3h5.6l9.4-13.3v13.3h5.8V65.2h-7.9z"/>
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Card type */}
                                <div className="customization-group">
                                    <h3 className="cust-group-label">Network</h3>
                                    <div className="card-type-selector">
                                        {[
                                            { type: 'visa',       label: 'Visa' },
                                            { type: 'mastercard', label: 'Mastercard' },
                                            { type: 'amex',       label: 'Amex' },
                                        ].map(card => (
                                            <button
                                                key={card.type}
                                                className={`card-type-btn ${selectedCardType === card.type ? 'active' : ''}`}
                                                onClick={() => setSelectedCardType(card.type)}
                                            >
                                                {card.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Card theme */}
                                <div className="customization-group">
                                    <h3 className="cust-group-label">Theme — <em>{currentCardTheme.name}</em></h3>
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

                                <div className="form-actions">
                                    <button className="btn-save" onClick={handleSave} disabled={saving}>
                                        {saving ? <><div className="spinner"/><span>Saving...</span></> : 'Save Card Settings'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ══════════════════════════════════════
                        WALLPAPER TAB
                    ══════════════════════════════════════ */}
                    {activeTab === 'wallpaper' && (
                        <div className="tab-content">
                            <div className="content-section">
                                <div className="section-header-row">
                                    <h2 className="section-heading">Animated Cover Themes</h2>
                                    <p className="section-sub">Live animated backgrounds for your profile</p>
                                </div>

                                {/* Animated wallpapers */}
                                <div className="animated-wallpaper-grid">
                                    {animatedWallpapers.map((wp) => (
                                        <button
                                            key={wp.id}
                                            className={`animated-wallpaper-tile ${wallpaperUrl === wp.id ? 'active' : ''}`}
                                            onClick={() => handleSetPredefinedWallpaper(wp.id)}
                                            title={wp.name}
                                        >
                                            <div className="anim-tile-preview">
                                                <AnimatedWallpaper theme={wp.id}/>
                                            </div>
                                            <div className="anim-tile-info">
                                                <span className="anim-tile-emoji">{wp.emoji}</span>
                                                <span className="anim-tile-name">{wp.name}</span>
                                                <span className="anim-tile-desc">{wp.description}</span>
                                            </div>
                                            {wallpaperUrl === wp.id && (
                                                <div className="anim-tile-check">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                        <polyline points="20 6 9 17 4 12"/>
                                                    </svg>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ══════════════════════════════════════
                        SECURITY TAB
                    ══════════════════════════════════════ */}
                    {activeTab === 'security' && (
                        <div className="tab-content">
                            <div className="content-section">
                                <div className="section-header-row">
                                    <h2 className="section-heading">Security Settings</h2>
                                    <p className="section-sub">Keep your account safe</p>
                                </div>

                                {/* Account status */}
                                <div className="security-status-row">
                                    <div className="security-status-item">
                                        <div className="security-status-icon security-ok">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="security-status-title">Account Protected</p>
                                            <p className="security-status-sub">Your account is secured with a password</p>
                                        </div>
                                    </div>
                                    <div className="security-status-item">
                                        <div className="security-status-icon security-ok">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                                <polyline points="20 6 9 17 4 12"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="security-status-title">Email Verified</p>
                                            <p className="security-status-sub">{user?.email}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="security-divider"/>

                                <h3 className="cust-group-label" style={{ marginBottom: '24px' }}>Change Password</h3>
                                <div className="security-form">
                                    <PasswordField label="Current Password"  field="current"/>
                                    <PasswordField label="New Password"       field="new"/>
                                    <PasswordField label="Confirm New Password" field="confirm"/>
                                    <div className="form-actions">
                                        <button
                                            className="btn-save"
                                            onClick={handlePasswordChange}
                                            disabled={passwordLoading || !passwordData.currentPassword || !passwordData.newPassword}
                                        >
                                            {passwordLoading
                                                ? <><div className="spinner"/><span>Updating...</span></>
                                                : 'Update Password'
                                            }
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