import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useLanguage } from '../pages/LanguageContext';
import UserMenu from '../components/UserMenu';
import FinScopeAI from '../components/FinScopeAI';
import AnimatedWallpaper from '../components/AnimatedWallpaper';
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
    const [selectedCardType, setSelectedCardType] = useState('visa');
    const [selectedCardTheme, setSelectedCardTheme] = useState('neon');

    const [formData, setFormData] = useState({
        first_name: '', last_name: '', username: '', phone: '',
        date_of_birth: '', location: '', bio: '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '', newPassword: '', confirmPassword: '',
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false, new: false, confirm: false,
    });

    const cardThemes = {
        neon: { name: 'Neon Purple', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', textColor: '#fff' },
        aurora: { name: 'Aurora Blue', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', textColor: '#fff' },
        midnight: { name: 'Midnight Black', gradient: 'linear-gradient(135deg, #232526 0%, #414345 100%)', textColor: '#fff' },
        sunset: { name: 'Sunset Glow', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', textColor: '#fff' },
        ocean: { name: 'Deep Ocean', gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', textColor: '#fff' },
        emerald: { name: 'Emerald Forest', gradient: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)', textColor: '#fff' },
        rose: { name: 'Rose Gold', gradient: 'linear-gradient(135deg, #ed6ea0 0%, #ec8c69 100%)', textColor: '#fff' },
        cosmic: { name: 'Cosmic Night', gradient: 'linear-gradient(135deg, #000428 0%, #004e92 100%)', textColor: '#fff' },
        magenta: { name: 'Magenta Dream', gradient: 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)', textColor: '#fff' },
        fire: { name: 'Fire Blaze', gradient: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)', textColor: '#fff' },
        teal: { name: 'Teal Wave', gradient: 'linear-gradient(135deg, #0cebeb 0%, #20e3b2 100%)', textColor: '#2c3e50' },
        violet: { name: 'Violet Storm', gradient: 'linear-gradient(135deg, #7F00FF 0%, #E100FF 100%)', textColor: '#fff' },
        coral: { name: 'Coral Reef', gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ffa07a 100%)', textColor: '#fff' },
        lime: { name: 'Lime Fusion', gradient: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)', textColor: '#2c3e50' },
        amber: { name: 'Amber Glow', gradient: 'linear-gradient(135deg, #f79d00 0%, #64f38c 100%)', textColor: '#2c3e50' },
        sapphire: { name: 'Sapphire Sky', gradient: 'linear-gradient(135deg, #0575e6 0%, #021b79 100%)', textColor: '#fff' },
        cherry: { name: 'Cherry Blossom', gradient: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)', textColor: '#fff' },
        mint: { name: 'Mint Fresh', gradient: 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)', textColor: '#2c3e50' },
        navy: { name: 'Navy Deep', gradient: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)', textColor: '#fff' },
        gold: { name: 'Golden Luxury', gradient: 'linear-gradient(135deg, #d4af37 0%, #f9d423 100%)', textColor: '#2c3e50' },
        royal: { name: 'Royal Purple', gradient: 'linear-gradient(135deg, #4a148c 0%, #7b1fa2 100%)', textColor: '#fff' },
        silver: { name: 'Silver Mist', gradient: 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)', textColor: '#fff' },
        crimson: { name: 'Crimson Wave', gradient: 'linear-gradient(135deg, #8e0e00 0%, #1f1c18 100%)', textColor: '#fff' },
        aqua: { name: 'Aqua Marine', gradient: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)', textColor: '#fff' },
    };

    const animatedWallpapers = [
        { id: 'anim-starfield', name: 'Starfield', emoji: '✦', description: 'Twinkling stars with shooting stars' },
        { id: 'anim-aurora', name: 'Aurora Borealis', emoji: '🌌', description: 'Northern lights dancing across the sky' },
        { id: 'anim-particles', name: 'Neural Network', emoji: '🔮', description: 'Connected particles floating in space' },
        { id: 'anim-matrix', name: 'Digital Rain', emoji: '💻', description: 'Cascading matrix-style characters' },
        { id: 'anim-ocean', name: 'Deep Ocean', emoji: '🌊', description: 'Underwater scene with light rays' },
        { id: 'anim-fireflies', name: 'Fireflies', emoji: '🪲', description: 'Glowing fireflies in the night' },
        { id: 'anim-nebula', name: 'Nebula', emoji: '🌈', description: 'Colorful cosmic nebula clouds' },
        { id: 'anim-rain', name: 'Night Rain', emoji: '🌧', description: 'Gentle rain with lightning' },
        { id: 'anim-lava', name: 'Molten Lava', emoji: '🌋', description: 'Glowing lava with floating embers' },
        { id: 'anim-snowfall', name: 'Snowfall', emoji: '❄️', description: 'Peaceful snowfall at night' },
        { id: 'anim-galaxy', name: 'Galaxy Spiral', emoji: '🌀', description: 'Rotating spiral galaxy' },
    ];

    const predefinedWallpapers = [
        { id: 'gradient-1', name: 'Midnight Ocean', gradient: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)', type: 'gradient' },
        { id: 'gradient-2', name: 'Purple Dream', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', type: 'gradient' },
        { id: 'gradient-3', name: 'Sunset Bliss', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', type: 'gradient' },
        { id: 'gradient-4', name: 'Emerald City', gradient: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)', type: 'gradient' },
        { id: 'gradient-5', name: 'Royal Blue', gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', type: 'gradient' },
        { id: 'gradient-6', name: 'Cosmic Fusion', gradient: 'linear-gradient(135deg, #ff00cc 0%, #333399 100%)', type: 'gradient' },
        { id: 'image-1', name: 'Mountain Peak', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80', type: 'image' },
        { id: 'image-2', name: 'Ocean Waves', image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1920&q=80', type: 'image' },
        { id: 'image-3', name: 'Northern Lights', image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=80', type: 'image' },
        { id: 'image-4', name: 'City Skyline', image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1920&q=80', type: 'image' },
        { id: 'image-5', name: 'Starry Night', image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80', type: 'image' },
        { id: 'image-6', name: 'Neon City', image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1920&q=80', type: 'image' },
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
            const { data: profile } = await supabase.from('user_profiles').select('*').eq('id', user.id).single();
            if (profile) {
                setFormData({
                    first_name: profile.first_name || '', last_name: profile.last_name || '',
                    username: profile.username || '', phone: profile.phone || '',
                    date_of_birth: profile.date_of_birth || '', location: profile.location || '',
                    bio: profile.bio || '',
                });
                if (profile.avatar_url) setAvatarUrl(profile.avatar_url);
                if (profile.wallpaper_url) setWallpaperUrl(profile.wallpaper_url);
                if (profile.card_type) setSelectedCardType(profile.card_type);
                if (profile.card_theme) {
                    const themeMapping = { 'purple': 'neon', 'blue': 'ocean', 'black': 'midnight', 'gold': 'sunset', 'pink': 'rose', 'green': 'emerald' };
                    setSelectedCardTheme(themeMapping[profile.card_theme] || profile.card_theme);
                }
            }
        } catch (error) { console.error('Error loading profile:', error); }
        finally { setLoading(false); }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await supabase.from('user_profiles').upsert({
                id: user.id, ...formData, date_of_birth: formData.date_of_birth || null,
                avatar_url: avatarUrl, wallpaper_url: wallpaperUrl,
                card_type: selectedCardType, card_theme: selectedCardTheme,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'id' });
            if (error) throw error;
            showToast('Profile updated successfully');
        } catch (error) { showToast(error.message || 'Failed to update profile', 'error'); }
        finally { setSaving(false); }
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
        } catch (error) { showToast('Failed to upload avatar', 'error'); }
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
            showToast('Wallpaper updated successfully');
        } catch (error) { showToast('Failed to upload wallpaper', 'error'); }
    };

    const handleSetPredefinedWallpaper = async (value) => {
        try {
            await supabase.from('user_profiles').upsert({ id: user.id, wallpaper_url: value, updated_at: new Date().toISOString() }, { onConflict: 'id' });
            setWallpaperUrl(value);
            showToast('Wallpaper updated');
        } catch (error) { showToast('Failed to update wallpaper', 'error'); }
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
        } catch (error) { showToast(error.message || 'Failed to update password', 'error'); }
        finally { setPasswordLoading(false); }
    };

    const getUserInitials = () => {
        if (formData.first_name && formData.last_name) return `${formData.first_name[0]}${formData.last_name[0]}`.toUpperCase();
        return user?.email?.[0]?.toUpperCase() || 'U';
    };

    const getDisplayName = () => {
        if (formData.first_name && formData.last_name) return `${formData.first_name} ${formData.last_name}`;
        if (formData.username) return formData.username;
        return user?.email?.split('@')[0] || 'User';
    };

    const getPasswordStrength = (password) => {
        if (!password) return { strength: 0, label: '', color: '' };
        let s = 0;
        if (password.length >= 8) s++;
        if (password.length >= 12) s++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) s++;
        if (/\d/.test(password)) s++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) s++;
        if (s <= 2) return { strength: s, label: 'Weak', color: '#ef4444' };
        if (s <= 3) return { strength: s, label: 'Medium', color: '#f59e0b' };
        if (s <= 4) return { strength: s, label: 'Strong', color: '#10b981' };
        return { strength: s, label: 'Very Strong', color: '#06b6d4' };
    };

    const isAnimatedWallpaper = wallpaperUrl?.startsWith('anim-');
    const passwordStrength = getPasswordStrength(passwordData.newPassword);

    const PasswordField = ({ label, field }) => (
        <div className="info-field">
            <label>{label}</label>
            <div className="password-wrapper">
                <input
                    type={showPasswords[field] ? 'text' : 'password'}
                    value={passwordData[field === 'current' ? 'currentPassword' : field === 'new' ? 'newPassword' : 'confirmPassword']}
                    onChange={(e) => setPasswordData(p => ({
                        ...p,
                        [field === 'current' ? 'currentPassword' : field === 'new' ? 'newPassword' : 'confirmPassword']: e.target.value
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
                <div className="password-strength-bar" style={{ marginTop: '8px' }}>
                    <div className="strength-fill" style={{ width: `${(passwordStrength.strength / 5) * 100}%`, backgroundColor: passwordStrength.color }}></div>
                </div>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="profile-page">
                <div className="profile-loading"><FinScopeAI /><p>Loading your profile...</p></div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            {toast && <div className={`profile-toast ${toast.type}`}>{toast.type === 'success' ? '✓' : '✕'} {toast.message}</div>}

            <header className="profile-header">
                <div className="profile-header-content">
                    <button className="profile-back-btn" onClick={() => navigate('/dashboard')}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                        Dashboard
                    </button>
                    <UserMenu />
                </div>
            </header>

            <main className="profile-main">
                {/* Hero Banner with animated wallpaper support */}
                <div className="profile-hero-banner" style={{
                    background: isAnimatedWallpaper ? '#050514'
                        : wallpaperUrl?.startsWith('linear-gradient') ? wallpaperUrl
                            : wallpaperUrl ? `url(${wallpaperUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundSize: 'cover', backgroundPosition: 'center',
                }}>
                    {isAnimatedWallpaper && <AnimatedWallpaper theme={wallpaperUrl} />}
                    <button className="change-cover-btn" onClick={() => wallpaperInputRef.current?.click()}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                        </svg>
                        Upload Image
                    </button>
                    <input type="file" ref={wallpaperInputRef} accept="image/*" onChange={handleWallpaperUpload} style={{ display: 'none' }} />
                </div>

                <div className="profile-content-wrapper">
                    <div className="profile-hero-section">
                        <div className="profile-info-left">
                            <div className="profile-avatar-large">
                                {avatarUrl ? <img src={avatarUrl} alt="Avatar" /> : <div className="avatar-placeholder-large">{getUserInitials()}</div>}
                                <label className="avatar-camera-btn">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
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

                        <div className="virtual-card-container">
                            <div className="virtual-card" style={{
                                background: (cardThemes[selectedCardTheme] || cardThemes['neon']).gradient,
                                color: (cardThemes[selectedCardTheme] || cardThemes['neon']).textColor
                            }}>
                                <div className="card-ai-background"><FinScopeAI /></div>
                                <div className="card-top"><div className="card-brand-text"><div className="brand-name">FinScope AI</div><div className="virtual-label">VIRTUAL</div></div></div>
                                <div className="card-number-center"><span>****</span><span>****</span><span>****</span><span className="highlighted-digits">5000</span></div>
                                <div className="card-bottom-info">
                                    <div className="card-network-logo">
                                        {selectedCardType === 'mastercard' && <svg viewBox="0 0 131.39 86.9" fill="none"><circle cx="41.5" cy="43.45" r="35.9" fill="#eb001b"/><circle cx="89.9" cy="43.45" r="35.9" fill="#f79e1b"/><path d="M65.7,21.1c-6.9,5.3-11.4,13.6-11.4,23s4.5,17.7,11.4,23c6.9-5.3,11.4-13.6,11.4-23S72.6,26.4,65.7,21.1z" fill="#ff5f00"/></svg>}
                                        {selectedCardType === 'visa' && <svg viewBox="0 0 750 471" fill="none"><path fill="currentColor" d="M278.2 334.2l33.4-195.7h53.4l-33.4 195.7h-53.4zm246.8-191.9c-10.6-4-27.1-8.4-47.8-8.4-52.7 0-89.8 26.3-90.1 64-0.3 27.9 26.5 43.5 46.8 52.8 20.8 9.6 27.8 15.7 27.7 24.2-0.2 13.1-16.7 19.1-32.2 19.1-21.5 0-32.9-2.9-50.5-10.1l-7-3.1-7.6 44.3c12.5 5.4 35.8 10.2 59.9 10.4 56 0 92.4-26 92.7-66.2 0.2-22.1-14-38.9-44.7-52.8-18.6-9-30-15-29.9-24.1 0-8.1 9.6-16.7 30.4-16.7 17.4-0.3 30 3.5 39.8 7.5l4.8 2.2 7.3-42.1z"/></svg>}
                                        {selectedCardType === 'amex' && <svg viewBox="0 0 300 200" fill="none"><path fill="currentColor" d="M55.9 65.2h-8.5l-5.4 12.3-5.7-12.3h-8.6v18.2l-8.8-18.2h-7.6l-9 18.2h5.8l1.5-3.5h10.4l1.5 3.5h12.2V72.9l9.3 13.3h5.6l9.4-13.3v13.3h5.8V65.2h-7.9z"/></svg>}
                                    </div>
                                </div>
                                <div className="card-name-overlay">{getDisplayName().toUpperCase()}</div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="profile-tabs">
                        {[
                            { id: 'profile', label: 'Profile', icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></> },
                            { id: 'card', label: 'Virtual Card', icon: <><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></> },
                            { id: 'security', label: 'Security', icon: <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></> },
                        ].map(tab => (
                            <button key={tab.id} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{tab.icon}</svg>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <div className="tab-content">
                            <div className="content-section">
                                <h2 className="section-heading">Profile Information</h2>
                                <div className="info-grid">
                                    {[
                                        { name: 'first_name', label: 'FIRST NAME', placeholder: 'John', icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></> },
                                        { name: 'last_name', label: 'LAST NAME', placeholder: 'Doe', icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></> },
                                        { name: 'username', label: 'USERNAME', placeholder: '@username', icon: <path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z"/> },
                                        { name: 'email', label: 'EMAIL', disabled: true, icon: <><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/></> },
                                        { name: 'phone', label: 'PHONE', placeholder: '+44 7XXX XXX XXX', type: 'tel', icon: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/> },
                                        { name: 'date_of_birth', label: 'DATE OF BIRTH', type: 'date', icon: <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></> },
                                        { name: 'location', label: 'LOCATION', placeholder: 'London, United Kingdom', icon: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></> },
                                    ].map(field => (
                                        <div key={field.name} className="info-field">
                                            <label><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{field.icon}</svg>{field.label}</label>
                                            <input
                                                type={field.type || 'text'}
                                                name={field.name}
                                                value={field.disabled ? (user?.email || '') : formData[field.name]}
                                                onChange={field.disabled ? undefined : handleChange}
                                                placeholder={field.placeholder}
                                                disabled={field.disabled}
                                            />
                                        </div>
                                    ))}
                                    <div className="info-field full-width">
                                        <label><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>BIO</label>
                                        <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Tell us about yourself..." rows={3} />
                                    </div>
                                </div>

                                {/* Animated Wallpapers */}
                                <div className="wallpaper-gallery-section animated-section">
                                    <h3><span className="section-badge">NEW</span>Animated Themes</h3>
                                    <p className="section-subtitle">Live animated backgrounds for your profile cover</p>
                                    <div className="animated-wallpaper-grid">
                                        {animatedWallpapers.map((wp) => (
                                            <button key={wp.id} className={`animated-wallpaper-tile ${wallpaperUrl === wp.id ? 'active' : ''}`} onClick={() => handleSetPredefinedWallpaper(wp.id)} title={wp.name}>
                                                <div className="anim-tile-preview">
                                                    <AnimatedWallpaper theme={wp.id} />
                                                </div>
                                                <div className="anim-tile-info">
                                                    <span className="anim-tile-emoji">{wp.emoji}</span>
                                                    <span className="anim-tile-name">{wp.name}</span>
                                                </div>
                                                {wallpaperUrl === wp.id && (
                                                    <div className="anim-tile-check">
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Static Wallpapers */}
                                <div className="wallpaper-gallery-section">
                                    <h3>Static Themes</h3>
                                    <p className="section-subtitle">Gradients, patterns, and photo backgrounds</p>
                                    <div className="wallpaper-grid-compact">
                                        {predefinedWallpapers.map((wallpaper) => (
                                            <button key={wallpaper.id} className={`wallpaper-tile ${(wallpaperUrl === wallpaper.gradient || wallpaperUrl === wallpaper.image) ? 'active' : ''}`}
                                                    style={{ background: wallpaper.gradient || 'transparent', backgroundImage: wallpaper.image ? `url(${wallpaper.image})` : wallpaper.gradient }}
                                                    onClick={() => handleSetPredefinedWallpaper(wallpaper.image || wallpaper.gradient)} title={wallpaper.name} />
                                        ))}
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button className="btn-save" onClick={handleSave} disabled={saving}>
                                        {saving ? <><div className="spinner"></div>Saving...</> : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CARD TAB */}
                    {activeTab === 'card' && (
                        <div className="tab-content">
                            <div className="content-section">
                                <h2 className="section-heading">Customize Your Virtual Card</h2>
                                <div className="card-customization">
                                    <div className="customization-group">
                                        <h3>Card Type</h3>
                                        <div className="card-type-selector">
                                            {[
                                                { type: 'visa', label: 'Visa', svg: <svg viewBox="0 0 750 471" fill="none"><path fill="#1434CB" d="M278.2 334.2l33.4-195.7h53.4l-33.4 195.7h-53.4z"/><path fill="#FAA61A" d="M131.9 138.5H45.2L44.6 142c66.6 16 110.7 54.7 129 101.2l-18.6-88.3c-3.2-12.3-12.4-16.1-23.1-16.4z"/></svg> },
                                                { type: 'mastercard', label: 'Mastercard', svg: <svg viewBox="0 0 152.407 108" fill="currentColor"><rect x="60.412" y="25.697" width="31.5" height="56.606"/></svg> },
                                                { type: 'amex', label: 'Amex', svg: <svg viewBox="0 0 300 200" fill="none"><path fill="#006FCF" d="M0 100C0 44.8 44.8 0 100 0h100c55.2 0 100 44.8 100 100s-44.8 100-100 100H100C44.8 200 0 155.2 0 100z"/></svg> },
                                            ].map(card => (
                                                <button key={card.type} className={`card-type-btn ${selectedCardType === card.type ? 'active' : ''}`} onClick={() => setSelectedCardType(card.type)}>
                                                    {card.svg}{card.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="customization-group">
                                        <h3>Card Theme</h3>
                                        <div className="card-theme-selector">
                                            {Object.entries(cardThemes).map(([key, theme]) => (
                                                <button key={key} className={`card-theme-btn ${selectedCardTheme === key ? 'active' : ''}`} style={{ background: theme.gradient }} onClick={() => setSelectedCardTheme(key)} title={theme.name}>
                                                    {selectedCardTheme === key && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button className="btn-save" onClick={handleSave} disabled={saving}>
                                        {saving ? <><div className="spinner"></div>Saving...</> : 'Save Card Settings'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECURITY TAB */}
                    {activeTab === 'security' && (
                        <div className="tab-content">
                            <div className="content-section">
                                <h2 className="section-heading">Change Password</h2>
                                <div className="security-form">
                                    <PasswordField label="CURRENT PASSWORD" field="current" />
                                    <PasswordField label="NEW PASSWORD" field="new" />
                                    <PasswordField label="CONFIRM NEW PASSWORD" field="confirm" />
                                    <div className="form-actions">
                                        <button className="btn-save" onClick={handlePasswordChange} disabled={passwordLoading || !passwordData.currentPassword || !passwordData.newPassword}>
                                            {passwordLoading ? <><div className="spinner"></div>Updating...</> : 'Update Password'}
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