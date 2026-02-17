import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';

const s = {
    page: {
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a0e27 0%, #1a1535 50%, #0a0e27 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 20px', fontFamily: 'Arial, sans-serif',
    },
    box: {
        background: 'rgba(15,23,42,0.92)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px',
        padding: '48px', width: '100%', maxWidth: '460px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
    },
    center: { textAlign: 'center', marginBottom: '32px' },
    iconBox: {
        width: '68px', height: '68px', margin: '0 auto 18px',
        background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.35)',
        borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    h1: {
        fontSize: '26px', fontWeight: 700, margin: '0 0 8px',
        background: 'linear-gradient(135deg,#06b6d4,#3b82f6)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    },
    sub: { color: 'rgba(255,255,255,0.55)', fontSize: '14px', margin: 0 },
    form: { display: 'flex', flexDirection: 'column', gap: '18px' },
    label: { display: 'block', fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: '7px' },
    inputWrap: { position: 'relative' },
    input: {
        width: '100%', padding: '13px 46px 13px 14px', boxSizing: 'border-box',
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.13)',
        borderRadius: '11px', color: '#fff', fontSize: '15px', outline: 'none',
    },
    inputErr: { border: '1px solid rgba(239,68,68,0.65)' },
    eyeBtn: {
        position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)',
        background: 'none', border: 'none', color: 'rgba(255,255,255,0.38)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', padding: '2px',
    },
    errMsg: { color: '#f87171', fontSize: '12px', marginTop: '5px' },
    reqs: {
        display: 'flex', flexDirection: 'column', gap: '5px',
        padding: '10px 13px', background: 'rgba(15,20,45,0.7)',
        border: '1px solid rgba(255,255,255,0.07)', borderRadius: '9px', marginTop: '6px',
    },
    req: { display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: 'rgba(255,255,255,0.38)' },
    reqOk: { color: '#6ee7b7' },
    btnMain: {
        padding: '14px', background: 'linear-gradient(135deg,#06b6d4,#3b82f6)',
        border: 'none', borderRadius: '11px', color: '#fff',
        fontSize: '15px', fontWeight: 600, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px',
    },
    btnSec: {
        padding: '12px', background: 'transparent',
        border: '1px solid rgba(255,255,255,0.13)', borderRadius: '11px',
        color: 'rgba(255,255,255,0.6)', fontSize: '14px', cursor: 'pointer',
    },
    alertErr: {
        display: 'flex', alignItems: 'center', gap: '9px', padding: '12px 14px',
        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
        borderRadius: '10px', color: '#fca5a5', fontSize: '13px', marginBottom: '16px',
    },
    spin: {
        display: 'inline-block', width: '17px', height: '17px',
        border: '3px solid rgba(255,255,255,0.25)', borderTopColor: '#fff',
        borderRadius: '50%', flexShrink: 0,
    },
    statusWrap: { textAlign: 'center', padding: '10px 0' },
    statusIcon: {
        width: '76px', height: '76px', borderRadius: '50%',
        margin: '0 auto 18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    okIcon: { background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 6px 20px rgba(16,185,129,0.3)' },
    noIcon: { background: 'linear-gradient(135deg,#ef4444,#dc2626)', boxShadow: '0 6px 20px rgba(239,68,68,0.3)' },
    statusH2: { fontSize: '24px', fontWeight: 700, color: '#fff', margin: '0 0 10px' },
    statusP: { color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: 1.7, margin: '0 0 22px' },
    bar: { height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden', margin: '0 0 22px' },
    barFill: { height: '100%', background: 'linear-gradient(90deg,#10b981,#06b6d4)', borderRadius: '2px' },
};

const Eye = ({ open }) => open
    ? <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
    : <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;

const Check = ({ ok }) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
         stroke={ok ? '#10b981' : 'rgba(255,255,255,0.25)'} strokeWidth="3">
        <polyline points="20 6 9 17 4 12"/>
    </svg>
);

const RULES = [
    { label: '8+ characters',       test: p => p.length >= 8 },
    { label: 'Uppercase letter',     test: p => /[A-Z]/.test(p) },
    { label: 'Lowercase letter',     test: p => /[a-z]/.test(p) },
    { label: 'Number',               test: p => /\d/.test(p) },
];

export default function ResetPassword() {
    const navigate = useNavigate();
    const [pw, setPw]           = useState('');
    const [cpw, setCpw]         = useState('');
    const [showPw, setShowPw]   = useState(false);
    const [showCpw, setShowCpw] = useState(false);
    const [errs, setErrs]       = useState({});
    const [busy, setBusy]       = useState(false);
    const [phase, setPhase]     = useState('checking'); // checking | form | success | invalid

    useEffect(() => {
        // Inject spin keyframe
        const el = document.createElement('style');
        el.textContent = `
            @keyframes _rp_spin { to { transform: rotate(360deg); } }
            @keyframes _rp_bar  { from { width:0 } to { width:100% } }
        `;
        document.head.appendChild(el);

        // If ForgotPassword redirects here after an error
        const params = new URLSearchParams(window.location.search);
        if (params.get('error') === 'expired') { setPhase('invalid'); return; }

        // With PKCE + AuthCallback already exchanged the code,
        // there should be a valid session waiting for us.
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            console.log('[ResetPassword] getSession →', session?.user?.email, error);
            if (session) {
                setPhase('form');
            } else {
                // No session — wait briefly for onAuthStateChange
                const t = setTimeout(() => setPhase('invalid'), 4000);
                const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sess) => {
                    console.log('[ResetPassword] event:', event);
                    if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && sess)) {
                        clearTimeout(t);
                        subscription.unsubscribe();
                        setPhase('form');
                    }
                });
            }
        });
    }, []);

    const validate = () => {
        const e = {};
        if (!pw) e.pw = 'Password is required';
        else if (pw.length < 8) e.pw = 'At least 8 characters required';
        else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pw)) e.pw = 'Must include uppercase, lowercase and a number';
        if (!cpw) e.cpw = 'Please confirm your password';
        else if (pw !== cpw) e.cpw = 'Passwords do not match';
        setErrs(e);
        return !Object.keys(e).length;
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setBusy(true);
        const { error } = await supabase.auth.updateUser({ password: pw });
        if (error) {
            setBusy(false);
            if (error.message.includes('same')) setErrs({ pw: 'Must be different from your current password' });
            else setErrs({ general: error.message });
            return;
        }
        setPhase('success');
        setTimeout(async () => { await supabase.auth.signOut(); navigate('/login'); }, 3000);
    };

    // ── CHECKING ──
    if (phase === 'checking') return (
        <div style={s.page}>
            <div style={s.box}>
                <div style={{ textAlign: 'center', padding: '30px 0', color: 'rgba(255,255,255,0.6)' }}>
                    <div style={{ width: '44px', height: '44px', border: '4px solid rgba(6,182,212,0.2)', borderTopColor: '#06b6d4', borderRadius: '50%', margin: '0 auto 16px', animation: '_rp_spin 0.8s linear infinite' }} />
                    Verifying your link...
                </div>
            </div>
        </div>
    );

    // ── INVALID ──
    if (phase === 'invalid') return (
        <div style={s.page}>
            <div style={s.box}>
                <div style={s.statusWrap}>
                    <div style={{ ...s.statusIcon, ...s.noIcon }}>
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                        </svg>
                    </div>
                    <h2 style={s.statusH2}>Link Expired</h2>
                    <p style={s.statusP}>This reset link has expired or already been used.<br/>Reset links are only valid for 1 hour.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button style={s.btnMain} onClick={() => navigate('/forgot-password')}>Request a New Link</button>
                        <button style={s.btnSec}  onClick={() => navigate('/login')}>Back to Login</button>
                    </div>
                </div>
            </div>
        </div>
    );

    // ── SUCCESS ──
    if (phase === 'success') return (
        <div style={s.page}>
            <div style={s.box}>
                <div style={s.statusWrap}>
                    <div style={{ ...s.statusIcon, ...s.okIcon }}>
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                    </div>
                    <h2 style={s.statusH2}>Password Updated!</h2>
                    <p style={s.statusP}>Your password has been changed.<br/>Redirecting to login...</p>
                    <div style={s.bar}><div style={{ ...s.barFill, animation: '_rp_bar 3s linear forwards' }} /></div>
                    <button style={s.btnMain} onClick={() => navigate('/login')}>Go to Login Now</button>
                </div>
            </div>
        </div>
    );

    // ── FORM ──
    return (
        <div style={s.page}>
            <div style={s.box}>
                <div style={s.center}>
                    <div style={s.iconBox}>
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="1.5">
                            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                    </div>
                    <h1 style={s.h1}>Set New Password</h1>
                    <p style={s.sub}>Choose a strong password for your FinScope AI account.</p>
                </div>

                {errs.general && (
                    <div style={s.alertErr}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        {errs.general}
                    </div>
                )}

                <form style={s.form} onSubmit={submit}>
                    {/* New password */}
                    <div>
                        <label style={s.label}>New Password</label>
                        <div style={s.inputWrap}>
                            <input
                                type={showPw ? 'text' : 'password'}
                                value={pw}
                                onChange={e => { setPw(e.target.value); setErrs(p => ({ ...p, pw: '' })); }}
                                placeholder="Create a strong password"
                                style={{ ...s.input, ...(errs.pw ? s.inputErr : {}) }}
                                disabled={busy}
                            />
                            <button type="button" style={s.eyeBtn} onClick={() => setShowPw(v => !v)}><Eye open={showPw}/></button>
                        </div>
                        {errs.pw && <div style={s.errMsg}>{errs.pw}</div>}
                        <div style={s.reqs}>
                            {RULES.map(r => (
                                <div key={r.label} style={{ ...s.req, ...(r.test(pw) ? s.reqOk : {}) }}>
                                    <Check ok={r.test(pw)}/>{r.label}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Confirm password */}
                    <div>
                        <label style={s.label}>Confirm New Password</label>
                        <div style={s.inputWrap}>
                            <input
                                type={showCpw ? 'text' : 'password'}
                                value={cpw}
                                onChange={e => { setCpw(e.target.value); setErrs(p => ({ ...p, cpw: '' })); }}
                                placeholder="Confirm your new password"
                                style={{ ...s.input, ...(errs.cpw ? s.inputErr : {}) }}
                                disabled={busy}
                            />
                            <button type="button" style={s.eyeBtn} onClick={() => setShowCpw(v => !v)}><Eye open={showCpw}/></button>
                        </div>
                        {errs.cpw && <div style={s.errMsg}>{errs.cpw}</div>}
                    </div>

                    <button type="submit" style={{ ...s.btnMain, opacity: busy ? 0.7 : 1, cursor: busy ? 'not-allowed' : 'pointer' }} disabled={busy}>
                        {busy ? <><div style={{ ...s.spin, animation: '_rp_spin 0.8s linear infinite' }}/>Updating...</> : 'Update Password'}
                    </button>
                    <button type="button" style={s.btnSec} onClick={() => navigate('/login')} disabled={busy}>Cancel</button>
                </form>
            </div>
        </div>
    );
}