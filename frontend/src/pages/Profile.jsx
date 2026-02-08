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

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [toast, setToast] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState(null);

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
        monthly_income: '',
        preferred_currency: 'GBP',
        financial_goal: '',
        website: '',
        twitter: '',
        linkedin: '',
    });

    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordLoading, setPasswordLoading] = useState(false);

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
                    monthly_income: profile.monthly_income || '',
                    preferred_currency: profile.preferred_currency || 'GBP',
                    financial_goal: profile.financial_goal || '',
                    website: profile.website || '',
                    twitter: profile.twitter || '',
                    linkedin: profile.linkedin || '',
                }));
                if (profile.avatar_url) {
                    setAvatarUrl(profile.avatar_url);
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
                date_of_birth: formData.date_of_birth || null, // Convert empty string to null
                monthly_income: formData.monthly_income || null, // Also good for numbers
            };

            const updateData = {
                id: user.id,
                ...cleanedData,
                avatar_url: avatarUrl,
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
            showToast(t('avatarUpdated'));
        } catch (error) {
            console.error('Avatar upload error:', error);
            showToast(t('avatarError'), 'error');
        }
    };

    const handleRemoveAvatar = async () => {
        try {
            await supabase
                .from('user_profiles')
                .update({ avatar_url: null })
                .eq('id', user.id);

            setAvatarUrl(null);
            showToast(t('avatarRemoved'));
        } catch (error) {
            showToast(t('avatarError'), 'error');
        }
    };

    const handlePasswordChange = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast(t('passwordMismatch'), 'error');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return;
        }
        setPasswordLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: passwordData.newPassword
            });
            if (error) throw error;
            showToast(t('passwordUpdated'));
            setPasswordData({ newPassword: '', confirmPassword: '' });
        } catch (error) {
            showToast(t('passwordError'), 'error');
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

    if (loading) {
        return (
            <div className="profile-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#3b82f6' }}></div>
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
                        <span className="profile-header-title">{t('profile')}</span>
                    </div>
                    <UserMenu />
                </div>
            </header>

            <main className="profile-main">
                <div className="profile-layout">
                    {/* Sidebar */}
                    <div className="profile-sidebar">
                        <div className="profile-avatar-card">
                            <div className="avatar-section">
                                <div className="avatar-display">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" />
                                    ) : (
                                        <div className="avatar-placeholder">{getUserInitials()}</div>
                                    )}
                                </div>
                                <label className="avatar-upload-btn">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                                    <input type="file" ref={fileInputRef} accept="image/*" onChange={handleAvatarUpload} />
                                </label>
                            </div>

                            <div className="avatar-actions">
                                <button className="avatar-action-btn change" onClick={() => fileInputRef.current?.click()}>
                                    {t('changeAvatar')}
                                </button>
                                {avatarUrl && (
                                    <button className="avatar-action-btn remove" onClick={handleRemoveAvatar}>
                                        {t('removeAvatar')}
                                    </button>
                                )}
                            </div>
                            <div className="avatar-hint">{t('maxFileSize')}</div>

                            <div className="profile-display-name">{getDisplayName()}</div>
                            <div className="profile-display-email">{user?.email}</div>

                            <div className="profile-meta">
                                <div className="profile-meta-item">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                    {t('memberSince')} {new Date(user?.created_at).toLocaleDateString()}
                                </div>
                                <div className="profile-meta-item">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                    {t('lastUpdated')} {new Date().toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="profile-content">
                        {/* Personal Info */}
                        <div className="profile-section">
                            <div className="section-title">
                                <div className="section-title-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                </div>
                                {t('personalInfo')}
                            </div>

                            <div className="profile-form-grid">
                                <div className="form-field">
                                    <label>{t('firstName')}</label>
                                    <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} disabled={!editing} placeholder="John" />
                                </div>
                                <div className="form-field">
                                    <label>{t('lastName')}</label>
                                    <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} disabled={!editing} placeholder="Doe" />
                                </div>
                                <div className="form-field">
                                    <label>{t('username')}</label>
                                    <input type="text" name="username" value={formData.username} onChange={handleChange} disabled={!editing} placeholder="johndoe" />
                                </div>
                                <div className="form-field">
                                    <label>{t('email')}</label>
                                    <input type="email" value={user?.email || ''} disabled style={{ opacity: 0.5 }} />
                                </div>
                                <div className="form-field">
                                    <label>{t('phone')}</label>
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} disabled={!editing} placeholder="+44 7XXX XXX XXX" />
                                </div>
                                <div className="form-field">
                                    <label>{t('dateOfBirth')}</label>
                                    <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} disabled={!editing} />
                                </div>
                                <div className="form-field">
                                    <label>{t('gender')}</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} disabled={!editing}>
                                        <option value="">—</option>
                                        <option value="male">{t('male')}</option>
                                        <option value="female">{t('female')}</option>
                                        <option value="other">{t('other')}</option>
                                        <option value="prefer_not">{t('preferNotToSay')}</option>
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label>{t('location')}</label>
                                    <input type="text" name="location" value={formData.location} onChange={handleChange} disabled={!editing} placeholder="London, UK" />
                                </div>
                                <div className="form-field">
                                    <label>{t('occupation')}</label>
                                    <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} disabled={!editing} placeholder="Software Engineer" />
                                </div>
                                <div className="form-field full-width">
                                    <label>{t('bio')}</label>
                                    <textarea name="bio" value={formData.bio} onChange={handleChange} disabled={!editing} placeholder="Tell us about yourself..." rows={3} />
                                </div>
                            </div>

                            <div className="profile-form-actions">
                                {!editing ? (
                                    <button className="btn-save-profile" onClick={() => setEditing(true)}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                        {t('editProfile')}
                                    </button>
                                ) : (
                                    <>
                                        <button className="btn-cancel-profile" onClick={() => { setEditing(false); loadProfile(); }}>
                                            {t('cancel')}
                                        </button>
                                        <button className="btn-save-profile" onClick={handleSave} disabled={saving}>
                                            {saving ? <><span className="spinner"></span> {t('saving')}</> : t('saveChanges')}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Financial Profile */}
                        <div className="profile-section">
                            <div className="section-title">
                                <div className="section-title-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                                </div>
                                {t('financialProfile')}
                            </div>
                            <div className="profile-form-grid">
                                <div className="form-field">
                                    <label>{t('monthlyIncome')}</label>
                                    <input type="number" name="monthly_income" value={formData.monthly_income} onChange={handleChange} disabled={!editing} placeholder="3000" />
                                </div>
                                <div className="form-field">
                                    <label>{t('currency')}</label>
                                    <select name="preferred_currency" value={formData.preferred_currency} onChange={handleChange} disabled={!editing}>
                                        <option value="GBP">£ GBP</option>
                                        <option value="USD">$ USD</option>
                                        <option value="EUR">€ EUR</option>
                                        <option value="JPY">¥ JPY</option>
                                        <option value="SAR">﷼ SAR</option>
                                    </select>
                                </div>
                                <div className="form-field full-width">
                                    <label>{t('financialGoal')}</label>
                                    <select name="financial_goal" value={formData.financial_goal} onChange={handleChange} disabled={!editing}>
                                        <option value="">—</option>
                                        <option value="emergency">{t('saveForEmergency')}</option>
                                        <option value="debt">{t('payOffDebt')}</option>
                                        <option value="invest">{t('investForFuture')}</option>
                                        <option value="budget">{t('budgetBetter')}</option>
                                        <option value="purchase">{t('saveForPurchase')}</option>
                                        <option value="retirement">{t('retirement')}</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="profile-section">
                            <div className="section-title">
                                <div className="section-title-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                                </div>
                                {t('socialLinks')}
                            </div>
                            <div className="profile-form-grid">
                                <div className="form-field">
                                    <label>{t('website')}</label>
                                    <input type="url" name="website" value={formData.website} onChange={handleChange} disabled={!editing} placeholder="https://yoursite.com" />
                                </div>
                                <div className="form-field">
                                    <label>{t('twitter')}</label>
                                    <input type="text" name="twitter" value={formData.twitter} onChange={handleChange} disabled={!editing} placeholder="@username" />
                                </div>
                                <div className="form-field">
                                    <label>{t('linkedin')}</label>
                                    <input type="text" name="linkedin" value={formData.linkedin} onChange={handleChange} disabled={!editing} placeholder="linkedin.com/in/username" />
                                </div>
                            </div>
                        </div>

                        {/* Change Password */}
                        <div className="profile-section">
                            <div className="section-title">
                                <div className="section-title-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                </div>
                                {t('accountSecurity')}
                            </div>
                            <div className="password-form">
                                <div className="form-field" style={{ maxWidth: 400 }}>
                                    <label>{t('newPassword')}</label>
                                    <input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData(p => ({ ...p, newPassword: e.target.value }))} placeholder="••••••••" />
                                </div>
                                <div className="form-field" style={{ maxWidth: 400 }}>
                                    <label>{t('confirmPassword')}</label>
                                    <input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))} placeholder="••••••••" />
                                </div>
                                <button className="btn-update-password" onClick={handlePasswordChange} disabled={passwordLoading || !passwordData.newPassword}>
                                    {passwordLoading ? t('saving') : t('updatePassword')}
                                </button>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="profile-section danger-section">
                            <div className="section-title">
                                <div className="section-title-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                                </div>
                                {t('dangerZone')}
                            </div>
                            <div className="danger-zone-content">
                                <div className="danger-zone-text">
                                    <p>{t('deleteAccountDesc')}</p>
                                </div>
                                <button className="btn-delete-account" onClick={handleDeleteAccount}>
                                    {t('deleteAccount')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;