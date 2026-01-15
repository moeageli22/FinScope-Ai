import React, { useState, useEffect } from 'react';
import FinScopeAI from '../components/FinScopeAI.jsx';
import './AIChatDemo.css';

const AIChatDemo = () => {
    const [messages, setMessages] = useState([]);
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    // Conversation script
    const conversationScript = [
        {
            type: 'ai',
            text: 'Hi Ageli! I noticed you spent 15% more on dining this month. Would you like to set a budget alert?',
            delay: 1000
        },
        {
            type: 'user',
            text: 'Yes, please! Set it to $500',
            delay: 2500
        },
        {
            type: 'ai',
            text: "Done! ✓ I'll notify you when you reach 80% of your dining budget. I can also suggest affordable restaurants nearby!",
            delay: 2500
        }
    ];

    useEffect(() => {
        if (currentMessageIndex < conversationScript.length) {
            const timer = setTimeout(() => {
                const newMessage = conversationScript[currentMessageIndex];
                setMessages(prev => [...prev, newMessage]);
                setCurrentMessageIndex(prev => prev + 1);
            }, conversationScript[currentMessageIndex].delay);

            return () => clearTimeout(timer);
        } else {
            // Reset animation after completion
            const resetTimer = setTimeout(() => {
                setMessages([]);
                setCurrentMessageIndex(0);
            }, 4000);

            return () => clearTimeout(resetTimer);
        }
    }, [currentMessageIndex]);

    return (
        <div className="ai-chat-demo-section">
            <div className="demo-header">
                <h2>Meet Your Personal <span className="gradient-text">Financial Assistant</span></h2>
                <p className="demo-subtitle">
                    FinScope AI Chatbot understands your financial goals and provides real-time assistance
                </p>
            </div>

            <div className="demo-content">
                {/* Left Side - Features */}
                <div className="features-list">
                    <div className="feature-item">
                        <div className="feature-icon chat-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                        <div className="feature-content">
                            <h3>Natural Conversations</h3>
                            <p>Ask questions in plain English. Get instant answers about your finances, transactions, and spending habits.</p>
                        </div>
                    </div>

                    <div className="feature-item">
                        <div className="feature-icon brain-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
                                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
                            </svg>
                        </div>
                        <div className="feature-content">
                            <h3>Smart Predictions</h3>
                            <p>AI analyzes your spending patterns to predict future expenses and suggest optimal saving strategies.</p>
                        </div>
                    </div>

                    <div className="feature-item">
                        <div className="feature-icon target-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <circle cx="12" cy="12" r="6" />
                                <circle cx="12" cy="12" r="2" />
                            </svg>
                        </div>
                        <div className="feature-content">
                            <h3>Goal Tracking</h3>
                            <p>Set financial goals and let AI guide you with personalized recommendations and milestone celebrations.</p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Chat Interface */}
                <div className="chat-demo-container">
                    <div className="chat-demo-window">
                        <div className="chat-header">
                            <div className="mini-orb-wrapper">
                                <FinScopeAI />
                            </div>
                            <div className="chat-header-text">
                                <h4>FinScope AI Assistant</h4>
                                <span className="status-text">Your personal financial advisor</span>
                            </div>
                        </div>

                        <div className="chat-messages">
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`message-wrapper ${message.type === 'user' ? 'user-message' : 'ai-message'}`}
                                >
                                    {message.type === 'ai' && (
                                        <div className="message-avatar-orb">
                                            <FinScopeAI />
                                        </div>
                                    )}
                                    <div className="message-bubble">
                                        {message.text}
                                    </div>
                                    {message.type === 'user' && (
                                        <div className="message-avatar user-avatar">
                                            <span>You</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="chat-input-demo">
                            <input
                                type="text"
                                placeholder="Ask me about your finances..."
                                disabled
                            />
                            <button className="send-button">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIChatDemo;