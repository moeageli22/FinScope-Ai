// src/components/HomeAIChat.jsx
// Home Page AI Assistant - Navigation & FinScope Information Helper

import React, { useState, useEffect, useRef } from 'react';
import FinScopeAI from './FinScopeAI';
import './HomeAIChat.css';

/* ═══════════════════════════════════════════
   MINI ORB - Real FinScopeAI scaled down
   ═══════════════════════════════════════════ */
const MiniOrb = ({ size = 40 }) => {
    const scale = size / 400;
    return (
        <div className="hai-real-orb" style={{
            width: size,
            height: size,
            minWidth: size,
            overflow: 'hidden',
            borderRadius: '50%',
            position: 'relative',
        }}>
            <div style={{
                transform: `scale(${scale})`,
                transformOrigin: 'center center',
                width: 400,
                height: 400,
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: -200,
                marginLeft: -200,
                pointerEvents: 'none',
            }}>
                <FinScopeAI />
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════
   HOME AI ASSISTANT
   ═══════════════════════════════════════════ */
const HomeAIChat = ({ onNavigate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatRef = useRef(null);
    const inputRef = useRef(null);

    // Welcome message
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                id: 1,
                role: 'ai',
                text: "👋 Hi! I'm FinScope AI, your guide to our platform!\n\nI can help you:\n• Learn about FinScope features\n• Navigate the website\n• Understand how our AI works\n• Find information about the founder\n\nWhat would you like to know?"
            }]);
        }
    }, [isOpen]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    // Handle message sending
    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: userMsg }]);
        setIsTyping(true);

        // Simulate AI response with navigation and info
        setTimeout(() => {
            const response = generateResponse(userMsg);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'ai',
                text: response.text,
                action: response.action
            }]);
            setIsTyping(false);

            // Execute navigation action if provided
            if (response.action && onNavigate) {
                setTimeout(() => onNavigate(response.action), 1000);
            }
        }, 800);
    };

    // Generate contextual responses
    const generateResponse = (msg) => {
        const lower = msg.toLowerCase();

        // Navigation queries
        if (lower.includes('about') || lower.includes('learn more') || lower.includes('who made')) {
            return {
                text: "📖 Great question! Our **About section** explains FinScope's mission and the story behind it.\n\nShall I take you there?",
                action: 'about'
            };
        }

        if (lower.includes('feature') || lower.includes('what can') || lower.includes('capabilities')) {
            return {
                text: "✨ FinScope offers powerful AI-powered features:\n\n• **Smart Analytics** - AI insights on spending\n• **Real-time Transactions** - Instant transfers\n• **Practice Mode** - Safe learning environment\n• **Live Exchange** - Currency conversion\n\nWant to explore the features section?",
                action: 'features'
            };
        }

        if (lower.includes('contact') || lower.includes('reach') || lower.includes('email')) {
            return {
                text: "📧 Want to get in touch? I can take you to our **Contact page** where you can send a message directly!\n\nShall I navigate there?",
                action: 'contact'
            };
        }

        if (lower.includes('dashboard') || lower.includes('start') || lower.includes('try')) {
            return {
                text: "🚀 Ready to dive in? You can **start using FinScope** right away!\n\nClick 'Get Started' to create an account, or 'Sign In' if you already have one. Want me to take you to the dashboard?",
                action: 'dashboard'
            };
        }

        if (lower.includes('exchange') || lower.includes('currency') || lower.includes('convert')) {
            return {
                text: "💱 Our **Live Exchange** feature lets you convert currencies in real-time with AI-powered rates!\n\nWant to check it out?",
                action: 'exchange'
            };
        }

        // Founder/owner information
        if (lower.includes('founder') || lower.includes('owner') || lower.includes('creator') || lower.includes('who built')) {
            return {
                text: "👨‍💻 **FinScope AI** was created by a passionate fintech innovator dedicated to making financial management accessible through AI technology.\n\nThe platform combines cutting-edge artificial intelligence with intuitive design to help people take control of their finances. You can learn more in our About section!",
                action: 'about'
            };
        }

        // AI/Technology questions
        if (lower.includes('how does') || lower.includes('ai work') || lower.includes('technology')) {
            return {
                text: "🤖 FinScope uses **Claude AI by Anthropic** to provide:\n\n• Intelligent spending analysis\n• Personalized financial advice\n• Predictive insights\n• Natural conversation\n\nOur AI learns from your patterns to give you tailored recommendations while keeping your data secure!"
            };
        }

        if (lower.includes('safe') || lower.includes('secure') || lower.includes('privacy')) {
            return {
                text: "🔒 **Security is our priority!**\n\n• Practice Mode uses virtual funds\n• Real mode has bank-level encryption\n• Your data stays private\n• AI processing is secure\n\nYou're always in control of your information."
            };
        }

        if (lower.includes('practice') || lower.includes('demo') || lower.includes('learn')) {
            return {
                text: "🎓 **Practice Mode** is perfect for learning!\n\nYou get virtual funds to experiment with:\n• Adding transactions\n• Tracking spending\n• Getting AI insights\n• Understanding budgets\n\nNo real money involved - it's a safe space to learn financial management!"
            };
        }

        if (lower.includes('price') || lower.includes('cost') || lower.includes('free')) {
            return {
                text: "💰 FinScope offers a **free tier** to get started!\n\nYou can create an account and try Practice Mode at no cost. Premium features are available for users who want advanced analytics and real account linking.\n\nWant to sign up?"
            };
        }

        // Home/reset
        if (lower.includes('home') || lower.includes('main page') || lower.includes('start over')) {
            return {
                text: "🏠 Taking you back to the home page!",
                action: 'home'
            };
        }

        // Default helpful response
        return {
            text: "I'm here to help! Here are some things you can ask me:\n\n• \"Tell me about FinScope\"\n• \"What features do you have?\"\n• \"Who created this?\"\n• \"How does the AI work?\"\n• \"Take me to the dashboard\"\n• \"Show me the contact page\"\n\nWhat would you like to know? 😊"
        };
    };

    const suggestions = [
        { emoji: '📖', label: 'About FinScope', prompt: 'Tell me about FinScope' },
        { emoji: '✨', label: 'Features', prompt: 'What features do you offer?' },
        { emoji: '👨‍💻', label: 'Who made this?', prompt: 'Who is the founder?' },
        { emoji: '🚀', label: 'Get Started', prompt: 'How do I get started?' },
    ];

    return (
        <>
            {/* Floating Chat Button */}
            <button
                className={`hai-fab ${isOpen ? 'hai-fab-open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Open AI Assistant"
            >
                {isOpen ? (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                ) : (
                    <MiniOrb size={64} />
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="hai-window">
                    {/* Header */}
                    <div className="hai-header">
                        <MiniOrb size={40} />
                        <div className="hai-header-text">
                            <h3>FinScope AI</h3>
                            <span>Your Guide</span>
                        </div>
                        <span className="hai-live-badge">
                            <span className="hai-live-dot" />
                            LIVE
                        </span>
                    </div>

                    {/* Messages */}
                    <div className="hai-messages" ref={chatRef}>
                        {messages.map(msg => (
                            <div key={msg.id} className={`hai-msg ${msg.role}`}>
                                {msg.role === 'ai' && (
                                    <div className="hai-msg-avatar">
                                        <MiniOrb size={32} />
                                    </div>
                                )}
                                <div className="hai-bubble">
                                    {msg.text.split('\n').map((line, i) => (
                                        <span key={i}>
                                            {line.split(/(\*\*.*?\*\*)/).map((part, j) =>
                                                part.startsWith('**') && part.endsWith('**')
                                                    ? <strong key={j}>{part.slice(2, -2)}</strong>
                                                    : part
                                            )}
                                            <br />
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="hai-msg ai">
                                <div className="hai-msg-avatar">
                                    <MiniOrb size={32} />
                                </div>
                                <div className="hai-bubble hai-typing">
                                    <span className="hai-dot" />
                                    <span className="hai-dot" />
                                    <span className="hai-dot" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Suggestions */}
                    {messages.length <= 2 && (
                        <div className="hai-suggestions">
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    className="hai-suggestion"
                                    onClick={() => {
                                        setInput(s.prompt);
                                        setTimeout(() => handleSend(), 100);
                                    }}
                                    disabled={isTyping}
                                >
                                    <span>{s.emoji}</span>
                                    <span>{s.label}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="hai-input-area">
                        <input
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            placeholder="Ask me anything..."
                            disabled={isTyping}
                            className="hai-input"
                        />
                        <button
                            className="hai-send"
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <polygon points="22 2 15 22 11 13 2 9 22 2" fill="white" opacity="0.9" />
                                <line x1="22" y1="2" x2="11" y2="13" stroke="white" strokeWidth="1.5" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default HomeAIChat;