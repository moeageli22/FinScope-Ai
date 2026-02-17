import React, { useState } from 'react';
import './CookieBanner.css';

const STORAGE_KEY = 'cookiesAccepted';

// Check storage synchronously so the banner never flickers in/out
const hasStoredPreference = () => {
    try {
        return localStorage.getItem(STORAGE_KEY) !== null;
    } catch {
        return false; // storage unavailable — show the banner
    }
};

const CookieBanner = () => {
    // Show immediately unless the user already gave a preference
    const [showBanner, setShowBanner] = useState(!hasStoredPreference());
    const [animatingOut, setAnimatingOut] = useState(false);

    const dismiss = (accepted) => {
        // Animate banner out before removing it
        setAnimatingOut(true);
        setTimeout(() => {
            setShowBanner(false);
            setAnimatingOut(false);
        }, 350); // matches CSS transition duration

        try {
            localStorage.setItem(STORAGE_KEY, accepted ? 'true' : 'false');
        } catch {
            // Storage unavailable – preference won't persist across page loads,
            // but the banner will still close correctly for this session.
        }
    };

    const acceptCookies = () => dismiss(true);
    const declineCookies = () => dismiss(false);

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
                <button className="btn-cookie-decline" onClick={declineCookies}>
                    Decline
                </button>
                <button className="btn-cookie-accept" onClick={acceptCookies}>
                    Accept Cookies
                </button>
            </div>
        </div>
    );
};

export default CookieBanner;