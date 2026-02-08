import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useLanguage } from '../pages/LanguageContext';
import UserMenu from '../components/UserMenu';
import './Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const fileInputRef = useRef(null);
    const wallpaperInputRef = useRef(null);

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [toast, setToast] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [wallpaperUrl, setWallpaperUrl] = useState(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingWallpaper, setUploadingWallpaper] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        username: '',
        phone: '',
        date_of_birth: '',
        gender: '',
        bio: '',
        location: '',
        occupation: '',
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

    // Predefined wallpapers with beautiful themes
    const predefinedWallpapers = [
        { id: 'gradient-1', name: 'Midnight Ocean', gradient: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' },
        { id: 'gradient-2', name: 'Purple Dream', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
        { id: 'gradient-3', name: 'Sunset Bliss', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
        { id: 'gradient-4', name: 'Emerald City', gradient: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)' },
        { id: 'gradient-5', name: 'Royal Blue', gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' },
        { id: 'gradient-6', name: 'Cosmic Fusion', gradient: 'linear-gradient(135deg, #ff00cc 0%, #333399 100%)' },
        { id: 'gradient-7', name: 'Amber Glow', gradient: 'linear-gradient(135deg, #ff6a00 0%, #ee0979 100%)' },
        { id: 'gradient-8', name: 'Arctic Ice', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    ];

    useEffect(() => {
        loadProfile();
        // Auto-save last saved time
        const interval = setInterval(() => {
            if (lastSaved) {
                setLastSaved(new Date(lastSaved));
            }
        }, 60000); // Update every minute
        return () => clearInterval(interval);
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

            // Try to fetch existing profile
            const { data: profile, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profile) {
                setFormData(prev => ({
                    ...prev,
                    first_name: profile.first_name || '',
                    last_name: profile.last_name || '',
                    username: profile.username || '',
                    phone: profile.phone || '',
                    date_of_birth: profile.date_of_birth || '',
                    gender: profile.gender || '',
                    bio: profile.bio || '',
                    location: profile.location || '',
                    occupation: profile.occupation || '',
                }));
                if (profile.avatar_url) {
                    setAvatarUrl(profile.avatar_url);
                }
                if (profile.wallpaper_url) {
                    setWallpaperUrl(profile.wallpaper_url);
                }
                if (profile.updated_at) {
                    setLastSaved(new Date(profile.updated_at));
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
            // Clean the data - convert empty strings to null for date fields
            const cleanedData = {
                ...formData,
                date_of_birth: formData.date_of_birth || null,
            };

            const updateData = {
                id: user.id,
                ...cleanedData,
                avatar_url: avatarUrl,
                wallpaper_url: wallpaperUrl,
                updated_at: new Date().toISOString(),
            };

            console.log('💾 Saving profile data:', updateData);

            const { data, error } = await supabase
                .from('user_profiles')
                .upsert(updateData, { onConflict: 'id' });

            if (error) {
                console.error('❌ Database error:', error);
                throw error;
            }

            console.log('✅ Profile saved successfully');
            setLastSaved(new Date());
            showToast(t('profileUpdated'));
            setEditing(false);
        } catch (error) {
            console.error('💥 Save error:', error);
            showToast(error.message || t('profileError'), 'error');
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

        setUploadingAvatar(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/avatar.${fileExt}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            // Update profile with avatar URL
            const timestampedUrl = `${publicUrl}?t=${Date.now()}`;
            await supabase
                .from('user_profiles')
                .upsert({ id: user.id, avatar_url: timestampedUrl, updated_at: new Date().toISOString() }, { onConflict: 'id' });

            setAvatarUrl(timestampedUrl);
            setLastSaved(new Date());
            showToast(t('avatarUpdated'));
        } catch (error) {
            console.error('Avatar upload error:', error);
            showToast(t('avatarError'), 'error');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleWallpaperUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            showToast('File too large. Max 5MB.', 'error');
            return;
        }

        setUploadingWallpaper(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/wallpaper.${fileExt}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('wallpapers')
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('wallpapers')
                .getPublicUrl(fileName);

            // Update profile with wallpaper URL
            const timestampedUrl = `${publicUrl}?t=${Date.now()}`;
            await supabase
                .from('user_profiles')
                .upsert({ id: user.id, wallpaper_url: timestampedUrl, updated_at: new Date().toISOString() }, { onConflict: 'id' });

            setWallpaperUrl(timestampedUrl);
            setLastSaved(new Date());
            showToast('Wallpaper updated successfully');
        } catch (error) {
            console.error('Wallpaper upload error:', error);
            showToast('Failed to upload wallpaper', 'error');
        } finally {
            setUploadingWallpaper(false);
        }
    };

    const handleSetPredefinedWallpaper = async (gradient) => {
        try {
            await supabase
                .from('user_profiles')
                .upsert({ id: user.id, wallpaper_url: gradient, updated_at: new Date().toISOString() }, { onConflict: 'id' });

            setWallpaperUrl(gradient);
            setLastSaved(new Date());
            showToast('Wallpaper updated');
        } catch (error) {
            showToast('Failed to update wallpaper', 'error');
        }
    };

    const handleRemoveAvatar = async () => {
        try {
            await supabase
                .from('user_profiles')
                .update({ avatar_url: null })
                .eq('id', user.id);

            setAvatarUrl(null);
            setLastSaved(new Date());
            showToast(t('avatarRemoved'));
        } catch (error) {
            showToast(t('avatarError'), 'error');
        }
    };

    const handleRemoveWallpaper = async () => {
        try {
            await supabase
                .from('user_profiles')
                .update({ wallpaper_url: null })
                .eq('id', user.id);

            setWallpaperUrl(null);
            setLastSaved(new Date());
            showToast('Wallpaper removed');
        } catch (error) {
            showToast('Failed to remove wallpaper', 'error');
        }
    };

    const handlePasswordChange = async () => {
        if (!passwordData.currentPassword) {
            showToast('Current password is required', 'error');
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast(t('passwordMismatch'), 'error');
            return;
        }
        if (passwordData.newPassword.length < 8) {
            showToast('Password must be at least 8 characters', 'error');
            return;
        }

        // Check password strength
        const hasUpperCase = /[A-Z]/.test(passwordData.newPassword);
        const hasLowerCase = /[a-z]/.test(passwordData.newPassword);
        const hasNumbers = /\d/.test(passwordData.newPassword);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword);

        if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
            showToast('Password must contain uppercase, lowercase, number and special character', 'error');
            return;
        }

        setPasswordLoading(true);
        try {
            // First verify current password by signing in
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: passwordData.currentPassword,
            });

            if (signInError) {
                throw new Error('Current password is incorrect');
            }

            // Update password
            const { error } = await supabase.auth.updateUser({
                password: passwordData.newPassword
            });

            if (error) throw error;

            showToast(t('passwordUpdated'));
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            showToast(error.message || t('passwordError'), 'error');
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm(t('deleteConfirm'))) return;
        // For safety, just sign out. Actual deletion requires admin/edge function.
        await supabase.auth.signOut();
        navigate('/');
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

    const getTimeAgo = (date) => {
        if (!date) return 'Never';
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
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
                    <div className="loading-spinner"></div>
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
                    <div className="profile-header-left">
                        <button className="profile-back-btn" onClick={() => navigate('/dashboard')}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                            {t('dashboard')}
                        </button>
                        <div className="profile-header-info">
                            <span className="profile-header-title">{t('profile')}</span>
                            <span className="profile-last-saved">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                Last saved {getTimeAgo(lastSaved)}
                            </span>
                        </div>
                    </div>
                    <UserMenu />
                </div>
            </header>

            <main className="profile-main">
                {/* Hero Banner */}
                <div className="profile-hero" style={{
                    background: wallpaperUrl?.startsWith('linear-gradient')
                        ? wallpaperUrl
                        : wallpaperUrl
                            ? `url(${wallpaperUrl})`
                            : 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}>
                    <div className="profile-hero-overlay">
                        <button className="wallpaper-edit-btn" onClick={() => wallpaperInputRef.current?.click()}>
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

                        <div className="profile-hero-content">
                            <div className="profile-avatar-hero">
                                <div className="avatar-hero-display">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" />
                                    ) : (
                                        <div className="avatar-hero-placeholder">{getUserInitials()}</div>
                                    )}
                                    {uploadingAvatar && <div className="upload-spinner"></div>}
                                </div>
                                <label className="avatar-hero-upload">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                        <circle cx="12" cy="13" r="4" />
                                    </svg>
                                    <input type="file" ref={fileInputRef} accept="image/*" onChange={handleAvatarUpload} />
                                </label>
                            </div>

                            <div className="profile-hero-info">
                                <h1 className="profile-hero-name">{getDisplayName()}</h1>
                                <p className="profile-hero-email">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="4"/>
                                        <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/>
                                    </svg>
                                    {user?.email}
                                </p>
                                <div className="profile-hero-badges">
                                    <span className="profile-badge verified">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                            <polyline points="22 4 12 14.01 9 11.01"/>
                                        </svg>
                                        Verified
                                    </span>
                                    <span className="profile-badge encrypted">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                        </svg>
                                        Encrypted
                                    </span>
                                    <span className="profile-badge member">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="4" width="18" height="18" rx="2" />
                                            <line x1="16" y1="2" x2="16" y2="6" />
                                            <line x1="8" y1="2" x2="8" y2="6" />
                                            <line x1="3" y1="10" x2="21" y2="10" />
                                        </svg>
                                        Member since {new Date(user?.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="profile-container">
                    {/* Wallpaper Gallery */}
                    <div className="profile-section wallpaper-section">
                        <div className="section-title">
                            <div className="section-title-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="2" y="2" width="20" height="20" rx="2.18" />
                                    <line x1="7" y1="2" x2="7" y2="22" />
                                    <line x1="17" y1="2" x2="17" y2="22" />
                                    <line x1="2" y1="12" x2="22" y2="12" />
                                    <line x1="2" y1="7" x2="7" y2="7" />
                                    <line x1="2" y1="17" x2="7" y2="17" />
                                    <line x1="17" y1="17" x2="22" y2="17" />
                                    <line x1="17" y1="7" x2="22" y2="7" />
                                </svg>
                            </div>
                            <span>Cover Wallpapers</span>
                        </div>

                        <div className="wallpaper-grid">
                            {predefinedWallpapers.map((wallpaper) => (
                                <button
                                    key={wallpaper.id}
                                    className={`wallpaper-option ${wallpaperUrl === wallpaper.gradient ? 'active' : ''}`}
                                    style={{ background: wallpaper.gradient }}
                                    onClick={() => handleSetPredefinedWallpaper(wallpaper.gradient)}
                                >
                                    {wallpaperUrl === wallpaper.gradient && (
                                        <div className="wallpaper-check">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                <polyline points="20 6 9 17 4 12"/>
                                            </svg>
                                        </div>
                                    )}
                                    <span className="wallpaper-name">{wallpaper.name}</span>
                                </button>
                            ))}
                            <button className="wallpaper-option wallpaper-upload" onClick={() => wallpaperInputRef.current?.click()}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <polyline points="17 8 12 3 7 8"/>
                                    <line x1="12" y1="3" x2="12" y2="15"/>
                                </svg>
                                <span className="wallpaper-name">Upload Custom</span>
                            </button>
                            {wallpaperUrl && (
                                <button className="wallpaper-option wallpaper-remove" onClick={handleRemoveWallpaper}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="3 6 5 6 21 6"/>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                    </svg>
                                    <span className="wallpaper-name">Remove</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Personal Information */}
                    <div className="profile-section">
                        <div className="section-title">
                            <div className="section-title-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </div>
                            <span>Personal Information</span>
                            <div className="section-actions">
                                {!editing && (
                                    <button className="btn-edit-inline" onClick={() => setEditing(true)}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                        Edit
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="profile-form-grid">
                            <div className="form-field">
                                <label>First Name</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    placeholder="John"
                                />
                            </div>
                            <div className="form-field">
                                <label>Last Name</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    placeholder="Doe"
                                />
                            </div>
                            <div className="form-field">
                                <label>Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    placeholder="johndoe"
                                />
                            </div>
                            <div className="form-field">
                                <label>Email Address</label>
                                <div className="input-with-icon">
                                    <input type="email" value={user?.email || ''} disabled />
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                    </svg>
                                </div>
                            </div>
                            <div className="form-field">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    placeholder="+44 7XXX XXX XXX"
                                />
                            </div>
                            <div className="form-field">
                                <label>Date of Birth</label>
                                <input
                                    type="date"
                                    name="date_of_birth"
                                    value={formData.date_of_birth}
                                    onChange={handleChange}
                                    disabled={!editing}
                                />
                            </div>
                            <div className="form-field">
                                <label>Gender</label>
                                <select name="gender" value={formData.gender} onChange={handleChange} disabled={!editing}>
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                    <option value="prefer_not">Prefer not to say</option>
                                </select>
                            </div>
                            <div className="form-field">
                                <label>Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    placeholder="London, UK"
                                />
                            </div>
                            <div className="form-field">
                                <label>Occupation</label>
                                <input
                                    type="text"
                                    name="occupation"
                                    value={formData.occupation}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    placeholder="Software Engineer"
                                />
                            </div>
                            <div className="form-field full-width">
                                <label>Bio</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    placeholder="Tell us about yourself..."
                                    rows={3}
                                />
                            </div>
                        </div>

                        {editing && (
                            <div className="profile-form-actions">
                                <button className="btn-cancel-profile" onClick={() => { setEditing(false); loadProfile(); }}>
                                    Cancel
                                </button>
                                <button className="btn-save-profile" onClick={handleSave} disabled={saving}>
                                    {saving ? (
                                        <>
                                            <span className="spinner"></span>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                                                <polyline points="17 21 17 13 7 13 7 21"/>
                                                <polyline points="7 3 7 8 15 8"/>
                                            </svg>
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Change Password */}
                    <div className="profile-section">
                        <div className="section-title">
                            <div className="section-title-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            </div>
                            <span>Change Password</span>
                        </div>

                        <div className="password-form">
                            <div className="form-field">
                                <label>Current Password</label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showPasswords.current ? 'text' : 'password'}
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData(p => ({ ...p, currentPassword: e.target.value }))}
                                        placeholder="Enter current password"
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
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

                            <div className="form-field">
                                <label>New Password</label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showPasswords.new ? 'text' : 'password'}
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData(p => ({ ...p, newPassword: e.target.value }))}
                                        placeholder="Enter new password"
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
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
                                    <div className="password-strength">
                                        <div className="password-strength-bar">
                                            <div
                                                className="password-strength-fill"
                                                style={{
                                                    width: `${(passwordStrength.strength / 5) * 100}%`,
                                                    backgroundColor: passwordStrength.color
                                                }}
                                            ></div>
                                        </div>
                                        <span style={{ color: passwordStrength.color }}>{passwordStrength.label}</span>
                                    </div>
                                )}
                            </div>

                            <div className="form-field">
                                <label>Confirm New Password</label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showPasswords.confirm ? 'text' : 'password'}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))}
                                        placeholder="Confirm new password"
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
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

                            <div className="password-requirements">
                                <p>Password must contain:</p>
                                <ul>
                                    <li className={passwordData.newPassword.length >= 8 ? 'valid' : ''}>
                                        At least 8 characters
                                    </li>
                                    <li className={/[A-Z]/.test(passwordData.newPassword) ? 'valid' : ''}>
                                        One uppercase letter
                                    </li>
                                    <li className={/[a-z]/.test(passwordData.newPassword) ? 'valid' : ''}>
                                        One lowercase letter
                                    </li>
                                    <li className={/\d/.test(passwordData.newPassword) ? 'valid' : ''}>
                                        One number
                                    </li>
                                    <li className={/[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword) ? 'valid' : ''}>
                                        One special character
                                    </li>
                                </ul>
                            </div>

                            <button
                                className="btn-update-password"
                                onClick={handlePasswordChange}
                                disabled={passwordLoading || !passwordData.currentPassword || !passwordData.newPassword}
                            >
                                {passwordLoading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                        </svg>
                                        Update Password
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="profile-section danger-section">
                        <div className="section-title">
                            <div className="section-title-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                    <line x1="12" y1="9" x2="12" y2="13" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                            </div>
                            <span>Danger Zone</span>
                        </div>

                        <div className="danger-zone-content">
                            <div className="danger-zone-text">
                                <h4>Delete Account</h4>
                                <p>Once you delete your account, there is no going back. Please be certain.</p>
                            </div>
                            <button className="btn-delete-account" onClick={handleDeleteAccount}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                    <line x1="10" y1="11" x2="10" y2="17"/>
                                    <line x1="14" y1="11" x2="14" y2="17"/>
                                </svg>
                                Delete My Account
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;