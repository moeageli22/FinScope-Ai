import React, { useState, useEffect } from 'react';
import './CookieBanner.css';

const CookieBanner = () => {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Check if user has already accepted cookies
        const cookiesAccepted = localStorage.getItem('cookiesAccepted');
        if (!cookiesAccepted) {
            setShowBanner(true);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem('cookiesAccepted', 'true');
        setShowBanner(false);
    };

    const declineCookies = () => {
        localStorage.setItem('cookiesAccepted', 'false');
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <div className="cookie-banner">
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