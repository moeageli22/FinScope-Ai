import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
    const navigate = useNavigate();

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <nav className="main-navigation">
            <div className="nav-container">
                <button
                    className="nav-btn active"
                    onClick={() => scrollToSection('home')}
                >
                    Home
                </button>
                <button
                    className="nav-btn"
                    onClick={() => scrollToSection('about')}
                >
                    About
                </button>
                <button
                    className="nav-btn"
                    onClick={() => scrollToSection('features')}
                >
                    Features
                </button>
                <button
                    className="nav-btn"
                    onClick={() => scrollToSection('live-exchange')}
                >
                    Live Exchange
                </button>
                <button
                    className="nav-btn"
                    onClick={() => scrollToSection('contact')}
                >
                    Contact
                </button>
            </div>
        </nav>
    );
};

export default Navigation;