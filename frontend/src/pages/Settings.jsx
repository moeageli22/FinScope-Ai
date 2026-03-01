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
    const [savingRegional, setSavingRegional] = useState(false);

    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('finscope_settings');
        return saved ? JSON.parse(saved) : {
            currency: 'GBP',
            dateFormat: 'DD/MM/YYYY',
            timeZone: 'Europe/London',
            numberFormat: '1,234.56',
        };
    });

    const [pendingSettings, setPendingSettings] = useState(null);

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
            if (data?.settings) {
                const merged = { ...settings, ...data.settings };
                setSettings(merged);
                setPendingSettings(merged);
            } else {
                setPendingSettings({ ...settings });
            }
            setLoading(false);
        };
        checkUser();
    }, [navigate]);

    useEffect(() => {
        if (!pendingSettings) setPendingSettings({ ...settings });
    }, [settings]);

    const showToast = (msg, type = 'success') => {
        setToast({ message: msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const saveRegionalSettings = useCallback(async () => {
        if (!pendingSettings) return;
        setSavingRegional(true);
        const ns = { ...pendingSettings };
        setSettings(ns);
        localStorage.setItem('finscope_settings', JSON.stringify(ns));
        if (user) {
            await supabase
                .from('user_settings')
                .upsert({ user_id: user.id, settings: ns, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
                .catch(() => {});
        }
        setSavingRegional(false);
        showToast('Regional settings saved');
    }, [pendingSettings, user]);

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        if (isNaN(d)) return dateStr;
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        const fmt = settings.dateFormat || 'DD/MM/YYYY';
        return fmt.replace('DD', dd).replace('MM', mm).replace('YYYY', yyyy);
    };

    const formatNumber = (num) => {
        if (num === undefined || num === null) return '';
        const fmt = settings.numberFormat || '1,234.56';
        if (fmt === '1.234,56') return Number(num).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        if (fmt === '1 234,56') return Number(num).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const getCurrencySymbol = () => {
        const symbols = { GBP: '£', USD: '$', EUR: '€', JPY: '¥', SAR: '﷼', AED: 'د.إ', INR: '₹', AUD: 'A$', CAD: 'C$', CHF: 'Fr', CNY: '¥', BRL: 'R$', MXN: '$', SGD: 'S$', HKD: 'HK$', SEK: 'kr', NOK: 'kr', DKK: 'kr', PLN: 'zł', TRY: '₺' };
        return symbols[settings.currency] || settings.currency;
    };

    const handleExportCSV = async () => {
        try {
            showToast('Preparing your data export…');

            const { data: profile } = await supabase
                .from('user_profiles').select('*').eq('id', user.id).single();

            const { data: finances } = await supabase
                .from('user_finances').select('*').eq('user_id', user.id).single();

            const { data: transactions } = await supabase
                .from('user_transactions').select('*').eq('user_id', user.id)
                .order('created_at', { ascending: false });

            const sym = getCurrencySymbol();

            // Helper: wrap every cell in quotes, escaping any internal quotes
            const q = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
            const row = (...cells) => cells.map(q).join(',');

            // Use user_metadata as fallback when user_profiles row is empty/missing
            const meta = user.user_metadata || {};
            const firstName   = profile?.first_name   || meta.first_name   || '';
            const lastName    = profile?.last_name    || meta.last_name    || '';
            const username    = profile?.username     || meta.username     || '';
            const phone       = profile?.phone        || meta.phone        || '';
            const dob         = profile?.date_of_birth || meta.date_of_birth || '';
            const city        = profile?.city         || meta.city         || '';
            const country     = profile?.country      || meta.country      || '';

            const lines = [];

            // ── PROFILE ──────────────────────────────────────────
            lines.push(row('--- PROFILE ---', '', '', '', ''));
            lines.push(row('Field', 'Value', '', '', ''));
            lines.push(row('Email',            user.email || ''));
            lines.push(row('First Name',       firstName));
            lines.push(row('Last Name',        lastName));
            lines.push(row('Username',         username));
            lines.push(row('Phone',            phone));
            lines.push(row('Date of Birth',    dob));
            lines.push(row('City',             city));
            lines.push(row('Country',          country));
            lines.push(row('Registered On',    user.created_at ? formatDate(user.created_at) : ''));
            lines.push(row('Registered Time',  user.created_at ? new Date(user.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''));
            lines.push(row('Last Login Date',  user.last_sign_in_at ? formatDate(user.last_sign_in_at) : ''));
            lines.push(row('Last Login Time',  user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''));
            lines.push(row('Email Confirmed',  user.email_confirmed_at ? 'Yes - ' + formatDate(user.email_confirmed_at) : 'No'));
            lines.push(row('Auth Provider',    user.app_metadata?.provider || 'email'));
            lines.push(row('Account ID',       user.id || ''));
            lines.push(row('', '', '', '', ''));

            // ── FINANCIAL SUMMARY ────────────────────────────────
            lines.push(row('--- FINANCIAL SUMMARY ---', '', '', '', ''));
            lines.push(row('Metric', 'Value', '', '', ''));
            lines.push(row('Current Balance',  finances ? `${sym}${formatNumber(finances.balance)}`       : 'N/A'));
            lines.push(row('Total Income',     finances ? `${sym}${formatNumber(finances.total_income)}`   : 'N/A'));
            lines.push(row('Total Expenses',   finances ? `${sym}${formatNumber(finances.total_expenses)}` : 'N/A'));
            lines.push(row('Net Savings',      finances ? `${sym}${formatNumber((finances.total_income || 0) - (finances.total_expenses || 0))}` : 'N/A'));
            lines.push(row('Export Currency',  settings.currency));
            lines.push(row('Export Date',      formatDate(new Date().toISOString())));
            lines.push(row('', '', '', '', ''));

            // ── SPENDING BY CATEGORY ─────────────────────────────
            const expenses = (transactions || []).filter(t => t.type === 'expense');
            if (expenses.length > 0) {
                const catTotals = {};
                expenses.forEach(t => { catTotals[t.category] = (catTotals[t.category] || 0) + (t.amount || 0); });
                const cats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
                const totalSpent = cats.reduce((s, [, v]) => s + v, 0);
                lines.push(row('--- SPENDING BY CATEGORY ---', '', '', '', ''));
                lines.push(row('Category', 'Amount', 'Percentage', '', ''));
                cats.forEach(([cat, amt]) => {
                    lines.push(row(cat, `${sym}${formatNumber(amt)}`, `${((amt / totalSpent) * 100).toFixed(1)}%`));
                });
                lines.push(row('TOTAL SPENT', `${sym}${formatNumber(totalSpent)}`, '100%'));
                lines.push(row('', '', '', '', ''));
            }

            // ── ALL TRANSACTIONS ─────────────────────────────────
            lines.push(row('--- TRANSACTIONS ---', '', '', '', ''));
            lines.push(row('Date', 'Description', 'Category', 'Amount', 'Type'));

            if (transactions && transactions.length > 0) {
                transactions.forEach(tx => {
                    const sign = tx.type === 'deposit' ? '+' : '-';
                    lines.push(row(
                        tx.created_at ? formatDate(tx.created_at) : '',
                        tx.name || tx.description || '',
                        tx.category || '',
                        `${sign}${sym}${formatNumber(tx.amount || 0)}`,
                        tx.type || '',
                    ));
                });
            } else {
                lines.push(row('No transactions found', '', '', '', ''));
            }

            const csv = lines.join('\n');
            const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `finscope-export-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast(`Exported ${transactions?.length || 0} transactions successfully`);
        } catch (e) {
            console.error(e);
            showToast('Export failed — please try again', 'error');
        }
    };

    const handleViewLoginHistory = async () => {
        if (!user) return;
        try {
            let history = [];

            const { data: attempts, error: attemptsErr } = await supabase
                .from('login_attempts')
                .select('*')
                .eq('email', user.email)
                .order('created_at', { ascending: false })
                .limit(10);

            if (!attemptsErr && attempts && attempts.length > 0) {
                history = attempts;
            } else {
                // Fallback: use two_factor_codes as a proxy for login activity
                const { data: codes } = await supabase
                    .from('two_factor_codes')
                    .select('created_at, ip_address, user_agent, verified')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(10);

                if (codes && codes.length > 0) {
                    history = codes.map(c => ({
                        created_at: c.created_at,
                        ip_address: c.ip_address || 'Unknown',
                        success: true,
                        user_agent: c.user_agent,
                    }));
                }
            }

            setLoginHistory(history);
            setShowLoginHistory(true);
        } catch (err) {
            console.error(err);
            showToast('Could not load login history', 'error');
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
        const defaults = { currency: 'GBP', dateFormat: 'DD/MM/YYYY', timeZone: 'Europe/London', numberFormat: '1,234.56' };
        setSettings(defaults);
        setPendingSettings(defaults);
        localStorage.setItem('finscope_settings', JSON.stringify(defaults));
        showToast('Settings reset to defaults');
    };

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
                    justifyContent: 'center', zIndex: 1000, padding: '20px',
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #0f1729 0%, #1a1535 100%)',
                        border: '1px solid rgba(59,130,246,0.2)', borderRadius: 20,
                        padding: 32, width: '90%', maxWidth: 540,
                        maxHeight: '80vh', overflowY: 'auto',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <div>
                                <h3 style={{ color: '#fff', fontSize: 17, fontWeight: 700, margin: '0 0 4px' }}>Recent Login Activity</h3>
                                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0 }}>Last 10 sign-in events for {user?.email}</p>
                            </div>
                            <button onClick={() => setShowLoginHistory(false)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 18, lineHeight: 1, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                        </div>

                        {loginHistory.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '32px 0' }}>
                                <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                                <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: 14, fontWeight: 600 }}>No login history found</p>
                                <p style={{ color: 'rgba(255,255,255,0.25)', margin: '6px 0 0', fontSize: 12 }}>Sign-in attempts will appear here once recorded</p>
                            </div>
                        ) : loginHistory.map((entry, i) => (
                            <div key={i} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                                padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: 12,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                    <div style={{
                                        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                                        background: entry.success ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                                        border: `1px solid ${entry.success ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: entry.success ? '#34d399' : '#f87171', fontSize: 16, fontWeight: 700,
                                    }}>
                                        {entry.success ? '✓' : '✕'}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 13, color: entry.success ? '#34d399' : '#f87171', fontWeight: 700 }}>
                                            {entry.success ? 'Successful sign-in' : 'Failed attempt'}
                                        </div>
                                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>
                                            IP: {entry.ip_address || 'Unknown'}
                                        </div>
                                        {entry.user_agent && (
                                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 2, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {entry.user_agent}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', flexShrink: 0, textAlign: 'right' }}>
                                    {entry.created_at ? (
                                        <>
                                            <div>{formatDate(entry.created_at)}</div>
                                            <div style={{ marginTop: 2 }}>{new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </>
                                    ) : '—'}
                                </div>
                            </div>
                        ))}
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
                                        <div className="setting-desc">Display currency for balances, transactions and reports</div>
                                    </div>
                                    <select
                                        className="setting-select"
                                        value={pendingSettings?.currency ?? settings.currency}
                                        onChange={e => setPendingSettings(p => ({ ...p, currency: e.target.value }))}
                                    >
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
                                        <option value="CNY">¥ CNY — Chinese Yuan</option>
                                        <option value="BRL">R$ BRL — Brazilian Real</option>
                                        <option value="MXN">$ MXN — Mexican Peso</option>
                                        <option value="SGD">S$ SGD — Singapore Dollar</option>
                                        <option value="HKD">HK$ HKD — Hong Kong Dollar</option>
                                        <option value="SEK">kr SEK — Swedish Krona</option>
                                        <option value="NOK">kr NOK — Norwegian Krone</option>
                                        <option value="DKK">kr DKK — Danish Krone</option>
                                        <option value="PLN">zł PLN — Polish Zloty</option>
                                        <option value="TRY">₺ TRY — Turkish Lira</option>
                                    </select>
                                </div>

                                <div className="setting-row">
                                    <div className="setting-info">
                                        <div className="setting-label">Date Format</div>
                                        <div className="setting-desc">How dates appear in transactions and exported reports</div>
                                    </div>
                                    <select
                                        className="setting-select"
                                        value={pendingSettings?.dateFormat ?? settings.dateFormat}
                                        onChange={e => setPendingSettings(p => ({ ...p, dateFormat: e.target.value }))}
                                    >
                                        <option value="DD/MM/YYYY">DD/MM/YYYY (UK)</option>
                                        <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                                        <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                                        <option value="DD.MM.YYYY">DD.MM.YYYY (European)</option>
                                    </select>
                                </div>

                                <div className="setting-row">
                                    <div className="setting-info">
                                        <div className="setting-label">Time Zone</div>
                                        <div className="setting-desc">Affects how transaction timestamps are displayed</div>
                                    </div>
                                    <select
                                        className="setting-select"
                                        value={pendingSettings?.timeZone ?? settings.timeZone}
                                        onChange={e => setPendingSettings(p => ({ ...p, timeZone: e.target.value }))}
                                    >
                                        <option value="Europe/London">London (GMT+0)</option>
                                        <option value="America/New_York">New York (EST)</option>
                                        <option value="America/Chicago">Chicago (CST)</option>
                                        <option value="America/Denver">Denver (MST)</option>
                                        <option value="America/Los_Angeles">Los Angeles (PST)</option>
                                        <option value="Europe/Paris">Paris (CET)</option>
                                        <option value="Europe/Berlin">Berlin (CET)</option>
                                        <option value="Europe/Moscow">Moscow (MSK)</option>
                                        <option value="Asia/Riyadh">Riyadh (AST)</option>
                                        <option value="Asia/Dubai">Dubai (GST)</option>
                                        <option value="Asia/Kolkata">Mumbai / Delhi (IST)</option>
                                        <option value="Asia/Singapore">Singapore (SGT)</option>
                                        <option value="Asia/Shanghai">Shanghai (CST)</option>
                                        <option value="Asia/Tokyo">Tokyo (JST)</option>
                                        <option value="Australia/Sydney">Sydney (AEST)</option>
                                        <option value="Pacific/Auckland">Auckland (NZST)</option>
                                    </select>
                                </div>

                                <div className="setting-row">
                                    <div className="setting-info">
                                        <div className="setting-label">Number Format</div>
                                        <div className="setting-desc">Thousands separator and decimal style</div>
                                    </div>
                                    <select
                                        className="setting-select"
                                        value={pendingSettings?.numberFormat ?? settings.numberFormat}
                                        onChange={e => setPendingSettings(p => ({ ...p, numberFormat: e.target.value }))}
                                    >
                                        <option value="1,234.56">1,234.56 (UK / US)</option>
                                        <option value="1.234,56">1.234,56 (European)</option>
                                        <option value="1 234,56">1 234,56 (French)</option>
                                    </select>
                                </div>

                                <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 14, alignItems: 'center' }}>
                                    <button
                                        onClick={saveRegionalSettings}
                                        disabled={savingRegional}
                                        style={{
                                            padding: '12px 32px',
                                            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                                            border: 'none', borderRadius: 12,
                                            color: '#fff', fontSize: 14, fontWeight: 700,
                                            cursor: savingRegional ? 'not-allowed' : 'pointer',
                                            opacity: savingRegional ? 0.6 : 1,
                                            display: 'flex', alignItems: 'center', gap: 8,
                                            boxShadow: '0 4px 16px rgba(59,130,246,0.3)',
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        {savingRegional ? (
                                            <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Saving…</>
                                        ) : (
                                            <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>Save Settings</>
                                        )}
                                    </button>
                                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)' }}>
                                        Applied to all dates, amounts &amp; CSV exports
                                    </span>
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
                                    Privacy &amp; Security
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
                                        <div className="setting-desc">
                                            Download your complete profile, financial summary, spending by category, and every transaction as a CSV file
                                        </div>
                                    </div>
                                    <button className="setting-action-btn" onClick={handleExportCSV}>
                                        Download CSV
                                    </button>
                                </div>

                                <div className="setting-row">
                                    <div className="setting-info">
                                        <div className="setting-label" style={{ color: '#f87171' }}>Delete Account</div>
                                        <div className="setting-desc">Permanently remove your account and all associated data</div>
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
                                        <div className="setting-desc">Remove locally stored settings data</div>
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