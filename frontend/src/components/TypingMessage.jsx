import { useState, useEffect, useRef } from "react";

const MESSAGES = [
    "Hello... I am FinScope AI. 👋",
    "Mr. Ageli created me to change finance forever.",
    "I analyse your spending so you don't have to.",
    "Your data. Your insights. Your future.",
    "I never sleep. I never stop learning. 🧠",
    "Built in London. Thinking globally. 🌍",
    "I am not just an app. I am your financial brain.",
    "Ask me anything about your money. Go on. 💬",
    "The future of banking... is already here.",
    "FinScope AI — where intelligence meets finance. ✨",
];

const TypingMessage = () => {
    const [displayText, setDisplayText] = useState("");
    const [messageIndex, setMessageIndex] = useState(0);
    const [phase, setPhase] = useState("typing");
    const [cursorVisible, setCursorVisible] = useState(true);
    const timeoutRef = useRef(null);

    useEffect(() => {
        const interval = setInterval(() => setCursorVisible((v) => !v), 530);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const currentMsg = MESSAGES[messageIndex];

        if (phase === "typing") {
            if (displayText.length < currentMsg.length) {
                const delay = 38 + Math.random() * 40;
                timeoutRef.current = setTimeout(() => {
                    setDisplayText(currentMsg.slice(0, displayText.length + 1));
                }, delay);
            } else {
                timeoutRef.current = setTimeout(() => setPhase("deleting"), 2400);
            }
        } else if (phase === "deleting") {
            if (displayText.length > 0) {
                const delay = 22 + Math.random() * 18;
                timeoutRef.current = setTimeout(() => {
                    setDisplayText(displayText.slice(0, -1));
                }, delay);
            } else {
                setMessageIndex((i) => (i + 1) % MESSAGES.length);
                setPhase("typing");
            }
        }

        return () => clearTimeout(timeoutRef.current);
    }, [displayText, phase, messageIndex]);

    return (
        <div className="typing-message-wrapper">
            <div className="typing-bubble">
                <span className="typing-label">FINSCOPE AI</span>
                <p className="typing-text">
                    {displayText.length === 0 ? (
                        <span className="typing-dots">
                            <span /><span /><span />
                        </span>
                    ) : (
                        <>
                            {displayText}
                            <span className="typing-cursor" style={{ opacity: cursorVisible ? 1 : 0 }}>|</span>
                        </>
                    )}
                </p>
            </div>

            <style>{`
                .typing-message-wrapper {
                    display: flex;
                    justify-content: center;
                    width: 100%;
                    margin-top: -70px;
                    margin-bottom: 20px;
                    padding: 0 20px;
                    animation: tmFadeIn 0.8s ease forwards;
                }

                @keyframes tmFadeIn {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                .typing-bubble {
                    max-width: 520px;
                    width: 100%;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(139, 92, 246, 0.25);
                    border-radius: 16px;
                    padding: 14px 24px;
                    backdrop-filter: blur(12px);
                    box-shadow:
                        0 4px 24px rgba(99, 102, 241, 0.12),
                        inset 0 1px 0 rgba(255,255,255,0.05);
                    min-height: 64px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    gap: 5px;
                    text-align: center;
                }

                .typing-label {
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.14em;
                    background: linear-gradient(90deg, #60a5fa, #a78bfa);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .typing-text {
                    margin: 0;
                    font-size: 15px;
                    font-weight: 500;
                    color: rgba(255,255,255,0.88);
                    line-height: 1.55;
                    letter-spacing: 0.01em;
                    min-height: 24px;
                    font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace;
                }

                .typing-cursor {
                    display: inline-block;
                    margin-left: 1px;
                    color: #818cf8;
                    font-weight: 300;
                    transition: opacity 0.1s;
                }

                .typing-dots {
                    display: inline-flex;
                    gap: 5px;
                    align-items: center;
                    justify-content: center;
                }

                .typing-dots span {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    background: rgba(139, 92, 246, 0.6);
                    animation: tmBounce 1.2s ease-in-out infinite;
                    display: inline-block;
                }

                .typing-dots span:nth-child(2) { animation-delay: 0.18s; }
                .typing-dots span:nth-child(3) { animation-delay: 0.36s; }

                @keyframes tmBounce {
                    0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
                    40%           { transform: scale(1);   opacity: 1;   }
                }

                @media (max-width: 480px) {
                    .typing-text { font-size: 13px; }
                    .typing-message-wrapper { margin-top: -20px; }
                }
            `}</style>
        </div>
    );
};

export default TypingMessage;