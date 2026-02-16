import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase.js';
import './Usermenu.css';

const UserMenu = ({ onEraseData }) => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const menuRef = useRef(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                const { data: profileData } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                if (profileData) {
                    setProfile(profileData);
                }
            }
        };
        getUser();
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClick = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClick);
            document.addEventListener('touchstart', handleClick);
            // Prevent body scroll on mobile
            if (window.innerWidth <= 767) {
                document.body.style.overflow = 'hidden';
            }
        }

        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('touchstart', handleClick);
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    const getUserInitials = () => {
        if (profile?.first_name && profile?.last_name) {
            return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
        }
        if (user?.email) {
            return user.email.substring(0, 2).toUpperCase();
        }
        return 'MA';
    };

    const getUserName = () => {
        if (profile?.first_name && profile?.last_name) {
            return `${profile.first_name} ${profile.last_name}`;
        }
        if (profile?.username) {
            return profile.username;
        }
        return user?.email?.split('@')[0] || 'User';
    };

    const handleMenuClick = (action) => {
        setIsOpen(false);
        action();
    };

    if (!user) return null;

    return (
        <div className="user-menu-wrapper" ref={menuRef}>
            {/* Trigger Button */}
            <button
                className="user-menu-trigger"
                onClick={() => setIsOpen(!isOpen)}
                type="button"
            >
                <div className="user-avatar">
                    <span>{getUserInitials()}</span>
                </div>
                <span className="user-name-trigger">{getUserName()}</span>
                <svg
                    className={`chevron ${isOpen ? 'open' : ''}`}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </button>

            {/* Backdrop (Mobile Only) */}
            {isOpen && (
                <div className="menu-backdrop" onClick={() => setIsOpen(false)} />
            )}

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="user-menu-dropdown">
                    {/* User Info Header */}
                    <div className="menu-user-info">
                        <div className="menu-avatar-large">
                            <span>{getUserInitials()}</span>
                        </div>
                        <div className="menu-user-details">
                            <div className="menu-user-name">{getUserName()}</div>
                            <div className="menu-user-email">{user.email}</div>
                        </div>
                    </div>

                    <div className="menu-divider"></div>

                    {/* Menu Items */}
                    <button
                        className="menu-item"
                        onClick={() => handleMenuClick(() => navigate('/dashboard'))}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        <span>Dashboard</span>
                    </button>

                    <button
                        className="menu-item"
                        onClick={() => handleMenuClick(() => navigate('/profile'))}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span>Profile</span>
                    </button>

                    <button
                        className="menu-item"
                        onClick={() => handleMenuClick(() => navigate('/settings'))}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M12 1v6m0 6v6"></path>
                        </svg>
                        <span>Settings</span>
                    </button>

                    <button
                        className="menu-item"
                        onClick={() => handleMenuClick(() => navigate('/help'))}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                        <span>Help & Support</span>
                    </button>

                    <div className="menu-divider"></div>

                    <button
                        className="menu-item danger"
                        onClick={() => handleMenuClick(() => onEraseData && onEraseData())}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        <span>Erase All Data</span>
                    </button>

                    <div className="menu-divider"></div>

                    <button
                        className="menu-item signout"
                        onClick={handleSignOut}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        <span>Sign Out</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserMenu;