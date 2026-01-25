import React, { useState, useRef, useEffect } from 'react';
import FinScopeAI from './FinScopeAI';
import './AIAssistant.css';

// Insight Data Cards Component
const InsightCards = ({ data }) => {
    return (
        <div className="insight-cards-grid">
            {data.map((card, index) => (
                <div key={index} className="insight-data-card">
                    <div className="card-icon">
                        {card.icon}
                    </div>
                    <div className="card-content">
                        <div className="card-label">{card.label}</div>
                        <div className="card-value">{card.value}</div>
                        {card.subtitle && <div className="card-subtitle">{card.subtitle}</div>}
                    </div>
                </div>
            ))}
        </div>
    );
};

// Spending Trends Chart Component
const SpendingTrendsChart = ({ data }) => {
    const maxAmount = Math.max(...data.map(item => item.amount));

    return (
        <div className="spending-trends-container">
            <div className="trends-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="20" x2="12" y2="10" />
                    <line x1="18" y1="20" x2="18" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="16" />
                </svg>
                <h4>Spending Trends</h4>
            </div>
            <div className="trends-chart">
                {data.map((item, index) => {
                    const percentage = (item.amount / maxAmount) * 100;
                    return (
                        <div key={index} className="trend-row">
                            <div className="trend-label">{item.category}</div>
                            <div className="trend-bar-container">
                                <div
                                    className="trend-bar"
                                    style={{
                                        width: `${percentage}%`,
                                        background: item.color || 'linear-gradient(90deg, #3b82f6, #06b6d4)'
                                    }}
                                />
                            </div>
                            <div className="trend-amount">${item.amount}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const AIAssistant = ({ onClose, user }) => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'ai',
            content: {
                type: 'text',
                text: "Hello! I'm FinScope AI. I can help you analyze your finances, create custom dashboards, and provide insights. What would you like to explore today?"
            },
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const simulateAIResponse = (userMessage) => {
        setIsTyping(true);

        setTimeout(() => {
            const lowerMessage = userMessage.toLowerCase();
            let aiResponse;

            // Check for spending analysis
            if (lowerMessage.includes('spending') || lowerMessage.includes('total')) {
                aiResponse = {
                    type: 'rich',
                    text: "Here's your spending analysis for this month. I've broken it down by categories and highlighted your top expenses.",
                    data: {
                        cards: [
                            {
                                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
                                label: 'Total Spent',
                                value: '$2,847',
                                subtitle: 'This month'
                            },
                            {
                                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
                                label: 'Top Category',
                                value: 'Food',
                                subtitle: '$847 spent'
                            },
                            {
                                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>,
                                label: 'Savings Rate',
                                value: '23%',
                                subtitle: 'Of income'
                            }
                        ]
                    }
                };
            }
            // Check for trends
            else if (lowerMessage.includes('trend')) {
                aiResponse = {
                    type: 'rich',
                    text: "I've analyzed your spending patterns. Here are the trends I've identified with detailed breakdowns.",
                    data: {
                        trends: [
                            { category: 'Food', amount: 847, color: 'linear-gradient(90deg, #3b82f6, #06b6d4)' },
                            { category: 'Transport', amount: 234, color: 'linear-gradient(90deg, #06b6d4, #0891b2)' },
                            { category: 'Shopping', amount: 567, color: 'linear-gradient(90deg, #8b5cf6, #6366f1)' },
                            { category: 'Entertainment', amount: 189, color: 'linear-gradient(90deg, #a78bfa, #8b5cf6)' }
                        ]
                    }
                };
            }
            // Combined request
            else if (lowerMessage.includes('trend') && lowerMessage.includes('total')) {
                aiResponse = {
                    type: 'rich',
                    text: "Here's your spending analysis for this month. I've broken it down by categories and highlighted your top expenses.",
                    data: {
                        trends: [
                            { category: 'Food', amount: 847, color: 'linear-gradient(90deg, #3b82f6, #06b6d4)' },
                            { category: 'Transport', amount: 234, color: 'linear-gradient(90deg, #06b6d4, #0891b2)' },
                            { category: 'Shopping', amount: 567, color: 'linear-gradient(90deg, #8b5cf6, #6366f1)' },
                            { category: 'Entertainment', amount: 189, color: 'linear-gradient(90deg, #a78bfa, #8b5cf6)' }
                        ],
                        cards: [
                            {
                                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
                                label: 'Total Spent',
                                value: '$2,847',
                                subtitle: 'This month'
                            },
                            {
                                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
                                label: 'Top Category',
                                value: 'Food',
                                subtitle: '$847 spent'
                            },
                            {
                                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>,
                                label: 'Savings Rate',
                                value: '23%',
                                subtitle: 'Of income'
                            }
                        ]
                    }
                };
            }
            // Budget help
            else if (lowerMessage.includes('budget')) {
                aiResponse = {
                    type: 'text',
                    text: "I can help you with spending analysis, trend reports, budget planning, and custom financial dashboards. Try asking about your spending or trends!"
                };
            }
            // Default response
            else {
                aiResponse = {
                    type: 'text',
                    text: "I can help you with spending analysis, trend reports, budget planning, and custom financial dashboards. Try asking about your spending or trends!"
                };
            }

            setMessages(prev => [...prev, {
                id: Date.now(),
                type: 'ai',
                content: aiResponse,
                timestamp: new Date()
            }]);

            setIsTyping(false);
        }, 1500);
    };

    const handleSendMessage = (messageText = null) => {
        const text = messageText || inputValue.trim();

        if (!text) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: {
                type: 'text',
                text: text
            },
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');

        // TODO: Replace with actual API call to Python backend
        simulateAIResponse(text);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const renderMessageContent = (content) => {
        if (content.type === 'text') {
            return <p>{content.text}</p>;
        }

        if (content.type === 'rich') {
            return (
                <>
                    <p>{content.text}</p>
                    {content.data?.trends && <SpendingTrendsChart data={content.data.trends} />}
                    {content.data?.cards && <InsightCards data={content.data.cards} />}
                </>
            );
        }

        return null;
    };

    return (
        <div className="ai-assistant-overlay" onClick={onClose}>
            <div className="ai-assistant-container" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="ai-assistant-header">
                    <button className="back-btn" onClick={onClose}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="header-info">
                        <div className="header-avatar">
                            <FinScopeAI />
                        </div>
                        <div className="header-text">
                            <h3>FinScope AI Assistant</h3>
                            <p>Your personal financial advisor</p>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="ai-assistant-messages">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`message-item ${message.type}`}
                        >
                            {message.type === 'ai' && (
                                <div className="message-avatar-small">
                                    <FinScopeAI />
                                </div>
                            )}
                            <div className="message-bubble-wrapper">
                                {message.type === 'user' && <span className="user-label">You</span>}
                                <div className="message-bubble-content">
                                    {renderMessageContent(message.content)}
                                </div>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="message-item ai">
                            <div className="message-avatar-small">
                                <FinScopeAI />
                            </div>
                            <div className="message-bubble-wrapper">
                                <div className="message-bubble-content typing">
                                    <div className="typing-dots">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="ai-assistant-input">
                    <div className="input-container">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Ask me about your finances..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <button
                            className="send-button"
                            onClick={() => handleSendMessage()}
                            disabled={!inputValue.trim()}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="22" y1="2" x2="11" y2="13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIAssistant;