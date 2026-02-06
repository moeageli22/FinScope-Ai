import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useLanguage } from '../pages/LanguageContext';
import UserMenu from '../components/UserMenu';
import './Settings.css';

const Settings = () => {
    const navigate = useNavigate();
    const { t, language, changeLanguage, languages } = useLanguage();
    const [activeSection, setActiveSection] = useState('appearance');
    const [toast, setToast] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('finscope_settings');
        return saved ? JSON.parse(saved) : {
            theme: 'dark',
            emailNotifications: true,
            pushNotifications: false,
            transactionAlerts: true,
            weeklyReport: true,
            monthlyReport: false,
            marketAlerts: false,
            twoFactor: true,
            sessionTimeout: 30,
            currency: 'GBP',
            dateFormat: 'DD/MM/YYYY',
            timeZone: 'Europe/London',
            numberFormat: '1,234.56',
            reducedMotion: false,
            highContrast: false,
            fontSize: 'medium',
            developerMode: false,
        };
    });

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { navigate('/login'); return; }
            setUser(user);
            const { data } = await supabase.from('user_settings').select('*').eq('user_id', user.id).single();
            if (data?.settings) setSettings(prev => ({ ...prev, ...data.settings }));
            setLoading(false);
        };
        checkUser();
    }, [navigate]);

    const showToast = (msg, type = 'success') => {
        setToast({ message: msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const updateSetting = useCallback(async (key, value) => {
        const ns = { ...settings, [key]: value };
        setSettings(ns);
        localStorage.setItem('finscope_settings', JSON.stringify(ns));
        if (key === 'reducedMotion') document.documentElement.classList.toggle('reduce-motion', value);
        if (key === 'highContrast') document.documentElement.classList.toggle('high-contrast', value);
        if (key === 'fontSize') {
            const sizes = { small: '14px', medium: '16px', large: '18px', extraLarge: '20px' };
            document.documentElement.style.fontSize = sizes[value] || '16px';
        }
        if (user) {
            await supabase.from('user_settings').upsert({ user_id: user.id, settings: ns, updated_at: new Date().toISOString() }, { onConflict: 'user_id' }).catch(() => {});
        }
    }, [settings, user]);

    const handleLanguageChange = (lang) => { changeLanguage(lang); showToast(t('settingsSaved')); };

    const handleResetDefaults = () => {
        if (!window.confirm(t('resetConfirm'))) return;
        const defaults = { theme:'dark',emailNotifications:true,pushNotifications:false,transactionAlerts:true,weeklyReport:true,monthlyReport:false,marketAlerts:false,twoFactor:true,sessionTimeout:30,currency:'GBP',dateFormat:'DD/MM/YYYY',timeZone:'Europe/London',numberFormat:'1,234.56',reducedMotion:false,highContrast:false,fontSize:'medium',developerMode:false };
        setSettings(defaults);
        localStorage.setItem('finscope_settings', JSON.stringify(defaults));
        changeLanguage('en');
        showToast(t('settingsSaved'));
    };

    const handleExportData = async () => {
        try {
            const { data: profile } = await supabase.from('user_profiles').select('*').eq('id', user.id).single();
            const blob = new Blob([JSON.stringify({ profile: profile || {}, settings, exportedAt: new Date().toISOString(), email: user.email }, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `finscope-data-${new Date().toISOString().split('T')[0]}.json`; a.click();
            URL.revokeObjectURL(url);
            showToast('Data exported');
        } catch { showToast('Export failed', 'error'); }
    };

    const Toggle = ({ checked, onChange }) => (
        <label className="toggle-switch">
            <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
            <span className="toggle-slider"></span>
        </label>
    );

    const sections = [
        { id: 'appearance', label: t('appearance'), icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z' },
        { id: 'notifications', label: t('notifications'), icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
        { id: 'privacy', label: t('privacy'), icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
        { id: 'regional', label: t('regional'), icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9' },
        { id: 'accessibility', label: t('accessibility'), icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
        { id: 'advanced', label: t('advanced'), icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
    ];

    if (loading) {
        return <div className="settings-page" style={{ display:'flex',alignItems:'center',justifyContent:'center' }}>
            <div className="spinner" style={{ width:40,height:40,border:'3px solid rgba(255,255,255,0.1)',borderTopColor:'#3b82f6',borderRadius:'50%',animation:'spin 0.8s linear infinite' }}></div>
        </div>;
    }

    return (
        <div className="settings-page">
            {toast && <div className={`settings-toast ${toast.type}`}>{toast.type === 'success' ? '✓' : '✕'} {toast.message}</div>}

            <header className="settings-header">
                <div className="settings-header-content">
                    <div className="settings-header-left">
                        <button className="settings-back-btn" onClick={() => navigate('/dashboard')}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                            {t('dashboard')}
                        </button>
                        <span className="settings-header-title">{t('settings')}</span>
                    </div>
                    <UserMenu />
                </div>
            </header>

            <main className="settings-main">
                <div className="settings-layout">
                    {/* Navigation */}
                    <nav className="settings-nav">
                        {sections.map(s => (
                            <button key={s.id} className={`settings-nav-item ${activeSection === s.id ? 'active' : ''}`} onClick={() => setActiveSection(s.id)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={s.icon} /></svg>
                                {s.label}
                            </button>
                        ))}
                    </nav>

                    {/* Content */}
                    <div className="settings-content">

                        {/* APPEARANCE */}
                        {activeSection === 'appearance' && (
                            <div className="settings-section">
                                <div className="settings-section-title">
                                    <div className="icon-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg></div>
                                    {t('appearance')}
                                </div>

                                <div className="setting-row">
                                    <div className="setting-info">
                                        <div className="setting-label">{t('language')}</div>
                                        <div className="setting-desc">{t('languageDesc')}</div>
                                    </div>
                                </div>
                                <div className="language-grid">
                                    {Object.entries(languages).map(([code, lang]) => (
                                        <div key={code} className={`language-option ${language === code ? 'active' : ''}`} onClick={() => handleLanguageChange(code)}>
                                            <span className="language-flag">{lang.flag}</span>
                                            <div className="language-names">
                                                <span className="language-name">{lang.name}</span>
                                                <span className="language-native">{lang.nativeName}</span>
                                            </div>
                                            {language === code && (
                                                <div className="language-check">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* NOTIFICATIONS */}
                        {activeSection === 'notifications' && (
                            <div className="settings-section">
                                <div className="settings-section-title">
                                    <div className="icon-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></div>
                                    {t('notifications')}
                                </div>

                                {[
                                    { key: 'emailNotifications', label: t('emailNotifications'), desc: t('emailNotifDesc') },
                                    { key: 'pushNotifications', label: t('pushNotifications'), desc: t('pushNotifDesc') },
                                    { key: 'transactionAlerts', label: t('transactionAlerts'), desc: t('transactionAlertDesc') },
                                    { key: 'weeklyReport', label: t('weeklyReport'), desc: t('weeklyReportDesc') },
                                    { key: 'monthlyReport', label: t('monthlyReport'), desc: t('monthlyReportDesc') },
                                    { key: 'marketAlerts', label: t('marketAlerts'), desc: t('marketAlertDesc') },
                                ].map(item => (
                                    <div key={item.key} className="setting-row">
                                        <div className="setting-info">
                                            <div className="setting-label">{item.label}</div>
                                            <div className="setting-desc">{item.desc}</div>
                                        </div>
                                        <div className="setting-control">
                                            <Toggle checked={settings[item.key]} onChange={v => updateSetting(item.key, v)} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* PRIVACY */}
                        {activeSection === 'privacy' && (
                            <div className="settings-section">
                                <div className="settings-section-title">
                                    <div className="icon-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
                                    {t('privacy')}
                                </div>

                                <div className="setting-row">
                                    <div className="setting-info">
                                        <div className="setting-label">{t('twoFactorAuth')}</div>
                                        <div className="setting-desc">{t('twoFactorDesc')}</div>
                                    </div>
                                    <div className="setting-control" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <span className={`status-badge ${settings.twoFactor ? 'enabled' : 'disabled'}`}>
                                            {settings.twoFactor ? t('enabled') : t('disabled')}
                                        </span>
                                        <Toggle checked={settings.twoFactor} onChange={v => updateSetting('twoFactor', v)} />
                                    </div>
                                </div>

                                <div className="setting-row">
                                    <div className="setting-info">
                                        <div className="setting-label">{t('sessionTimeout')}</div>
                                        <div className="setting-desc">{t('sessionTimeoutDesc')}</div>
                                    </div>
                                    <div className="setting-control" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <input type="range" className="setting-slider" min="5" max="120" step="5" value={settings.sessionTimeout} onChange={e => updateSetting('sessionTimeout', parseInt(e.target.value))} />
                                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', minWidth: 60 }}>{settings.sessionTimeout} {t('minutes')}</span>
                                    </div>
                                </div>

                                <div className="setting-row">
                                    <div className="setting-info">
                                        <div className="setting-label">{t('loginHistory')}</div>
                                        <div className="setting-desc">{t('loginHistoryDesc')}</div>
                                    </div>
                                    <button className="setting-action-btn">{t('viewHistory')}</button>
                                </div>

                                <div className="setting-row">
                                    <div className="setting-info">
                                        <div className="setting-label">{t('dataExport')}</div>
                                        <div className="setting-desc">{t('dataExportDesc')}</div>
                                    </div>
                                    <button className="setting-action-btn" onClick={handleExportData}>{t('exportData')}</button>
                                </div>
                            </div>
                        )}

                        {/* REGIONAL */}
                        {activeSection === 'regional' && (
                            <div className="settings-section">
                                <div className="settings-section-title">
                                    <div className="icon-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></div>
                                    {t('regional')}
                                </div>

                                <div className="setting-row">
                                    <div className="setting-info">
                                        <div className="setting-label">{t('currencyDisplay')}</div>
                                        <div className="setting-desc">{t('currencyDisplayDesc')}</div>
                                    </div>
                                    <select className="setting-select" value={settings.currency} onChange={e => updateSetting('currency', e.target.value)}>
                                        <option value="GBP">£ GBP - British Pound</option>
                                        <option value="USD">$ USD - US Dollar</option>
                                        <option value="EUR">€ EUR - Euro</option>
                                        <option value="JPY">¥ JPY - Japanese Yen</option>
                                        <option value="SAR">﷼ SAR - Saudi Riyal</option>
                                        <option value="INR">₹ INR - Indian Rupee</option>
                                        <option value="AUD">A$ AUD - Australian Dollar</option>
                                        <option value="CAD">C$ CAD - Canadian Dollar</option>
                                    </select>
                                </div>

                                <div className="setting-row">
                                    <div className="setting-info">
                                        <div className="setting-label">{t('dateFormat')}</div>
                                        <div className="setting-desc">{t('dateFormatDesc')}</div>
                                    </div>
                                    <select className="setting-select" value={settings.dateFormat} onChange={e => updateSetting('dateFormat', e.target.value)}>
                                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                        <option value="DD.MM.YYYY">DD.MM.YYYY</option>
                                    </select>
                                </div>

                                <div className="setting-row">
                                    <div className="setting-info">
                                        <div className="setting-label">{t('timeZone')}</div>
                                        <div className="setting-desc">{t('timeZoneDesc')}</div>
                                    </div>
                                    <select className="setting-select" value={settings.timeZone} onChange={e => updateSetting('timeZone', e.target.value)}>
                                        <option value="Europe/London">London (GMT+0)</option>
                                        <option value="America/New_York">New York (EST)</option>
                                        <option value="America/Los_Angeles">Los Angeles (PST)</option>
                                        <option value="Europe/Paris">Paris (CET)</option>
                                        <option value="Europe/Berlin">Berlin (CET)</option>
                                        <option value="Asia/Tokyo">Tokyo (JST)</option>
                                        <option value="Asia/Riyadh">Riyadh (AST)</option>
                                        <option value="Asia/Dubai">Dubai (GST)</option>
                                        <option value="Australia/Sydney">Sydney (AEST)</option>
                                    </select>
                                </div>

                                <div className="setting-row">
                                    <div className="setting-info">
                                        <div className="setting-label">{t('numberFormat')}</div>
                                        <div className="setting-desc">{t('numberFormatDesc')}</div>
                                    </div>
                                    <select className="setting-select" value={settings.numberFormat} onChange={e => updateSetting('numberFormat', e.target.value)}>
                                        <option value="1,234.56">1,234.56 (UK/US)</option>
                                        <option value="1.234,56">1.234,56 (EU)</option>
                                        <option value="1 234,56">1 234,56 (FR)</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* ACCESSIBILITY */}
                        {activeSection === 'accessibility' && (
                            <div className="settings-section">
                                <div className="settings-section-title">
                                    <div className="icon-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></div>
                                    {t('accessibility')}
                                </div>

                                <div className="setting-row">
                                    <div className="setting-info">
                                        <div className="setting-label">{t('reducedMotion')}</div>
                                        <div className="setting-desc">{t('reducedMotionDesc')}</div>
                                    </div>
                                    <Toggle checked={settings.reducedMotion} onChange={v => updateSetting('reducedMotion', v)} />
                                </div>

                                <div className="setting-row">
                                    <div className="setting-info">
                                        <div className="setting-label">{t('highContrast')}</div>
                                        <div className="setting-desc">{t('highContrastDesc')}</div>
                                    </div>
                                    <Toggle checked={settings.highContrast} onChange={v => updateSetting('highContrast', v)} />
                                </div>

                                <div className="setting-row">
                                    <div className="setting-info">
                                        <div className="setting-label">{t('fontSize')}</div>
                                        <div className="setting-desc">{t('fontSizeDesc')}</div>
                                    </div>
                                    <div className="font-size-selector">
                                        {[{ key: 'small', label: t('small') }, { key: 'medium', label: t('medium') }, { key: 'large', label: t('large') }, { key: 'extraLarge', label: 'XL' }].map(s => (
                                            <button key={s.key} className={`font-size-btn ${settings.fontSize === s.key ? 'active' : ''}`} onClick={() => updateSetting('fontSize', s.key)}>{s.label}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ADVANCED */}
                        {activeSection === 'advanced' && (
                            <div className="settings-section">
                                <div className="settings-section-title">
                                    <div className="icon-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></div>
                                    {t('advanced')}
                                </div>

                                <div className="setting-row">
                                    <div className="setting-info">
                                        <div className="setting-label">{t('developerMode')}</div>
                                        <div className="setting-desc">{t('developerModeDesc')}</div>
                                    </div>
                                    <Toggle checked={settings.developerMode} onChange={v => updateSetting('developerMode', v)} />
                                </div>

                                <div className="setting-row">
                                    <div className="setting-info">
                                        <div className="setting-label">{t('cacheManagement')}</div>
                                        <div className="setting-desc">{t('cacheManagementDesc')}</div>
                                    </div>
                                    <button className="setting-action-btn danger" onClick={() => { localStorage.clear(); showToast('Cache cleared'); }}>{t('clearCache')}</button>
                                </div>

                                <div className="setting-row">
                                    <div className="setting-info">
                                        <div className="setting-label">{t('resetDefaults')}</div>
                                        <div className="setting-desc">{t('resetConfirm')}</div>
                                    </div>
                                    <button className="setting-action-btn danger" onClick={handleResetDefaults}>{t('resetDefaults')}</button>
                                </div>

                                <div className="settings-footer">
                                    <span className="settings-version">{t('version')} 1.0.0</span>
                                    <span className="settings-version">FinScope AI © 2026</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Settings;