import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import UserMenu from '../components/UserMenu.jsx';
import './Settings.css';

const Settings = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('regional');
    const [toast, setToast] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loginHistory, setLoginHistory] = useState([]);
    const [showLoginHistory, setShowLoginHistory] = useState(false);

    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('finscope_settings');
        return saved ? JSON.parse(saved) : {
            currency: 'GBP',
            dateFormat: 'DD/MM/YYYY',
            timeZone: 'Europe/London',
            numberFormat: '1,234.56',
            hideBalances: false,
        };
    });

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { navigate('/login'); return; }
            setUser(user);
            const { data } = await supabase
                .from('user_settings')
                .select('*')
                .eq('user_id', user.id)
                .single();
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
        if (user) {
            await supabase
                .from('user_settings')
                .upsert({ user_id: user.id, settings: ns, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
                .catch(() => {});
        }
        showToast('Saved');
    }, [settings, user]);

    const handleViewLoginHistory = async () => {
        if (!user) return;
        try {
            const { data } = await supabase
                .from('login_attempts')
                .select('*')
                .eq('email', user.email)
                .order('created_at', { ascending: false })
                .limit(10);
            setLoginHistory(data || []);
            setShowLoginHistory(true);
        } catch {
            showToast('Could not load login history', 'error');
        }
    };

    const handleExportCSV = async () => {
        try {
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            const { data: transactions } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false });

            const rows = [];

            // Profile section
            rows.push(['--- PROFILE ---', '', '', '', '']);
            rows.push(['Field', 'Value', '', '', '']);
            rows.push(['Email',         user.email || '',           '', '', '']);
            rows.push(['First Name',    profile?.first_name || '',  '', '', '']);
            rows.push(['Last Name',     profile?.last_name || '',   '', '', '']);
            rows.push(['Username',      profile?.username || '',    '', '', '']);
            rows.push(['Phone',         profile?.phone || '',       '', '', '']);
            rows.push(['Date of Birth', profile?.date_of_birth || '', '', '', '']);
            rows.push(['City',          profile?.city || '',        '', '', '']);
            rows.push(['Country',       profile?.country || '',     '', '', '']);
            rows.push(['', '', '', '', '']);

            // Transactions section
            rows.push(['--- TRANSACTIONS ---', '', '', '', '']);
            rows.push(['Date', 'Description', 'Category', 'Amount', 'Type']);
            if (transactions && transactions.length > 0) {
                transactions.forEach(tx => {
                    rows.push([
                        tx.date || '',
                        `"${(tx.description || tx.name || '').replace(/"/g, '""')}"`,
                        tx.category || '',
                        tx.amount || '',
                        tx.type || '',
                    ]);
                });
            } else {
                rows.push(['No transactions found', '', '', '', '']);
            }

            const csv = rows.map(r => r.join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `finscope-export-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('CSV downloaded');
        } catch (e) {
            console.error(e);
            showToast('Export failed', 'error');
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
        try {
            await supabase.from('user_profiles').delete().eq('id', user.id);
            await supabase.auth.signOut();
            navigate('/');
        } catch {
            showToast('Failed to delete account', 'error');
        }
    };

    const handleResetDefaults = () => {
        if (!window.confirm('Reset all settings to defaults?')) return;
        const defaults = {
            currency: 'GBP',
            dateFormat: 'DD/MM/YYYY',
            timeZone: 'Europe/London',
            numberFormat: '1,234.56',
            hideBalances: false,
        };
        setSettings(defaults);
        localStorage.setItem('finscope_settings', JSON.stringify(defaults));
        showToast('Settings reset');
    };

    const Toggle = ({ checked, onChange }) => (
        <label className="toggle-switch">
            <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
            <span className="toggle-slider" />
        </label>
    );

    const sections = [
        { id: 'regional', label: 'Regional', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9' },
        { id: 'privacy',  label: 'Privacy',  icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
        { id: 'advanced', label: 'Advanced', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
    ];

    if (loading) {
        return (
            <div className="settings-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
        );
    }

    return (
        <div className="settings-page">
            {toast && (
                <div className={`settings-toast ${toast.type}`}>
                    {toast.type === 'success' ? '✓' : '✕'} {toast.message}
                </div>
            )}

            {/* Login History Modal */}
            {showLoginHistory && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
                    backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 1000,
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #0f1729 0%, #1a1535 100%)',
                        border: '1px solid rgba(59,130,246,0.2)', borderRadius: 20,
                        padding: 32, width: '90%', maxWidth: 520,
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 style={{ color: '#fff', fontSize: 17, fontWeight: 600, margin: 0 }}>Recent Login Activity</h3>
                            <button onClick={() => setShowLoginHistory(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>✕</button>
                        </div>
                        {loginHistory.length === 0
                            ? <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '20px 0', margin: 0 }}>No login history found</p>
                            : loginHistory.map((entry, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div>
                                        <div style={{ fontSize: 13, color: entry.success ? '#34d399' : '#f87171', fontWeight: 600 }}>
                                            {entry.success ? '✓ Successful' : '✕ Failed attempt'}
                                        </div>
                                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                                            IP: {entry.ip_address || 'Unknown'}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                                        {entry.created_at ? new Date(entry.created_at).toLocaleString() : '—'}
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            )}

            <header className="settings-header">
                <div className="settings-header-content">
                    <div className="settings-header-left">
                        <button className="settings-back-btn" onClick={() => navigate('/dashboard')}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                            Dashboard
                        </button>
                        <span className="settings-header-title">Settings</span>
                    </div>
                    <UserMenu />
                </div>
            </header>

            <main className="settings-main">
                <div className="settings-layout">

                    <nav className="settings-nav">
                        {sections.map(s => (
                            <button
                                key={s.id}
                                className={`settings-nav-item ${activeSection === s.id ? 'active' : ''}`}
                                onClick={() => setActiveSection(s.id)}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d={s.icon} />
                                </svg>
                                {s.label}
                            </button>
                        ))}
                    </nav>

                    <div className="settings-content">

                        {/* ── REGIONAL ── */}
                        {activeSection === 'regional' && (
                            <div className="settings-section">
                                <div className="settings-section-title">
                                    <div className="icon-box">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                                        </svg>
                                    </div>
                                    Regional & Format
                                </div>

                                <div className="setting-row">
                                    <div className="setting-info">
                                        <div className="setting-label">Currency</div>
                                        <div className="setting-desc">Used across balances, transactions and reports</div>
                                    </div>
                                    <select className="setting-select" value={settings.currency} onChange={e => updateSetting('currency', e.target.value)}>
                                        <option value="GBP">£ GBP — British Pound</option>
                                        <option value="USD">$ USD — US Dollar</option>
                                        <option value="EUR">€ EUR — Euro</option>
                                        <option value="JPY">¥ JPY — Japanese Yen</option>
                                        <option value="SAR">﷼ SAR — Saudi Riyal</option>
                                        <option value="AED">د.إ AED — UAE Dirham</option>
                                        <option value="INR">₹ INR — Indian Rupee</option>
                                        <option value="AUD">A$ AUD — Australian Dollar</option>
                                        <option value="CAD">C$ CAD — Canadian Dollar</option>
                                        <option value="CHF">Fr CHF — Swiss Franc</option>
                                    </select>
                                </div>

                                <div className="setting-row">
                                    <div className="setting-info">
                                        <div className="setting-label">Date Format</div>
                                        <div className="setting-desc">How dates appear in transactions and reports</div>
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
                                        <div className="setting-label">Time Zone</div>
                                        <div className="setting-desc">Affects transaction timestamps</div>
                                    </div>
                                    <select className="setting-select" value={settings.timeZone} onChange={e => updateSetting('timeZone', e.target.value)}>
                                        <option value="Europe/London">London (GMT+0)</option>
                                        <option value="America/New_York">New York (EST)</option>
                                        <option value="America/Los_Angeles">Los Angeles (PST)</option>
                                        <option value="Europe/Paris">Paris (CET)</option>
                                        <option value="Europe/Berlin">Berlin (CET)</option>
                                        <option value="Asia/Riyadh">Riyadh (AST)</option>
                                        <option value="Asia/Dubai">Dubai (GST)</option>
                                        <option value="Asia/Tokyo">Tokyo (JST)</option>
                                        <option value="Australia/Sydney">Sydney (AEST)</option>
                                    </select>
                                </div>

                                <div className="setting-row">
                                    <div className="setting-info">
                                        <div className="setting-label">Number Format</div>
                                        <div className="setting-desc">How large numbers are displayed</div>
                                    </div>
                                    <select className="setting-select" value={settings.numberFormat} onChange={e => updateSetting('numberFormat', e.target.value)}>
                                        <option value="1,234.56">1,234.56 (UK / US)</option>
                                        <option value="1.234,56">1.234,56 (European)</option>
                                        <option value="1 234,56">1 234,56 (French)</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* ── PRIVACY ── */}
                        {activeSection === 'privacy' && (
                            <div className="settings-section">
                                <div className="settings-section-title">
                                    <div className="icon-box">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="11" width="18" height="11" rx="2"/>
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                        </svg>
                                    </div>
                                    Privacy & Security
                                </div>

                                <div className="setting-row">
                                    <div className="setting-info">
                                        <div className="setting-label">Hide Balances</div>
                                        <div className="setting-desc">Mask all balance amounts with •••• across the app</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <span className={`status-badge ${settings.hideBalances ? 'enabled' : 'disabled'}`}>
                                            {settings.hideBalances ? 'Hidden' : 'Visible'}
                                        </span>
                                        <Toggle checked={settings.hideBalances} onChange={v => updateSetting('hideBalances', v)} />
                                    </div>
                                </div>

                                <div className="setting-row">
                                    <div className="setting-info">
                                        <div className="setting-label">Login History</div>
                                        <div className="setting-desc">See the last 10 sign-in attempts on your account</div>
                                    </div>
                                    <button className="setting-action-btn" onClick={handleViewLoginHistory}>
                                        View History
                                    </button>
                                </div>

                                <div className="setting-row">
                                    <div className="setting-info">
                                        <div className="setting-label">Change Password</div>
                                        <div className="setting-desc">Update your password from the profile security tab</div>
                                    </div>
                                    <button className="setting-action-btn" onClick={() => navigate('/profile')}>
                                        Go to Profile
                                    </button>
                                </div>

                                <div className="setting-row">
                                    <div className="setting-info">
                                        <div className="setting-label">Export My Data</div>
                                        <div className="setting-desc">Download your profile and transactions as a CSV file</div>
                                    </div>
                                    <button className="setting-action-btn" onClick={handleExportCSV}>
                                        Download CSV
                                    </button>
                                </div>

                                <div className="setting-row">
                                    <div className="setting-info">
                                        <div className="setting-label" style={{ color: '#f87171' }}>Delete Account</div>
                                        <div className="setting-desc">Permanently remove your account and all data</div>
                                    </div>
                                    <button className="setting-action-btn danger" onClick={handleDeleteAccount}>
                                        Delete Account
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ── ADVANCED ── */}
                        {activeSection === 'advanced' && (
                            <div className="settings-section">
                                <div className="settings-section-title">
                                    <div className="icon-box">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="3"/>
                                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                                        </svg>
                                    </div>
                                    Advanced
                                </div>

                                <div className="setting-row">
                                    <div className="setting-info">
                                        <div className="setting-label">Clear App Cache</div>
                                        <div className="setting-desc">Remove locally stored data and reload from server</div>
                                    </div>
                                    <button className="setting-action-btn danger" onClick={() => {
                                        localStorage.removeItem('finscope_settings');
                                        showToast('Cache cleared');
                                    }}>
                                        Clear Cache
                                    </button>
                                </div>

                                <div className="setting-row">
                                    <div className="setting-info">
                                        <div className="setting-label">Reset All Settings</div>
                                        <div className="setting-desc">Restore every setting back to its default value</div>
                                    </div>
                                    <button className="setting-action-btn danger" onClick={handleResetDefaults}>
                                        Reset Defaults
                                    </button>
                                </div>

                                <div className="settings-footer">
                                    <span className="settings-version">Version 1.0.0</span>
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