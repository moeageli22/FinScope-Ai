import React, { useState } from 'react';
import './CookieBanner.css';

const STORAGE_KEY = 'cookiesAccepted';

// ─── Module-level flag ────────────────────────────────────────────────────────
// This variable lives outside React. It is set once per JS session and survives
// every remount (e.g. navigating away and back in a React Router SPA).
// localStorage / sessionStorage are used as a cross-session backup.
let _preferenceGiven = (() => {
    try {
        return (
            localStorage.getItem(STORAGE_KEY) !== null ||
            sessionStorage.getItem(STORAGE_KEY) !== null
        );
    } catch {
        return false;
    }
})();

const savePreference = (value) => {
    _preferenceGiven = true;
    try { localStorage.setItem(STORAGE_KEY, value); } catch { /* ignored */ }
    try { sessionStorage.setItem(STORAGE_KEY, value); } catch { /* ignored */ }
};
// ─────────────────────────────────────────────────────────────────────────────

const CookieBanner = () => {
    const [showBanner, setShowBanner] = useState(!_preferenceGiven);
    const [animatingOut, setAnimatingOut] = useState(false);

    const dismiss = (accepted) => {
        savePreference(accepted ? 'true' : 'false');
        setAnimatingOut(true);
        setTimeout(() => {
            setShowBanner(false);
            setAnimatingOut(false);
        }, 350);
    };

    if (!showBanner) return null;

    return (
        <div className={`cookie-banner${animatingOut ? ' cookie-banner--hide' : ''}`}>
            <div className="cookie-content">
                <div className="cookie-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="8" cy="10" r="1.5" fill="currentColor" />
                        <circle cx="15" cy="10" r="1.5" fill="currentColor" />
                        <circle cx="11" cy="15" r="1.5" fill="currentColor" />
                        <circle cx="16" cy="14" r="1" fill="currentColor" />
                        <circle cx="9" cy="17" r="1" fill="currentColor" />
                    </svg>
                </div>
                <div className="cookie-text">
                    <h4>We use cookies</h4>
                    <p>
                        We use cookies to enhance your browsing experience, analyze site traffic,
                        and personalize content. By clicking "Accept", you consent to our use of cookies.
                        {' '}
                        <a href="#privacy" className="cookie-link">Learn more</a>
                    </p>
                </div>
            </div>
            <div className="cookie-actions">
                <button className="btn-cookie-decline" onClick={() => dismiss(false)}>
                    Decline
                </button>
                <button className="btn-cookie-accept" onClick={() => dismiss(true)}>
                    Accept Cookies
                </button>
            </div>
        </div>
    );
};

export default CookieBanner;