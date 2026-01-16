import React, { useState, useEffect } from 'react';

const FinScopeLogoMini = () => {
    const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
    const [isBlinking, setIsBlinking] = useState(false);
    const [wavePhase, setWavePhase] = useState(0);

    useEffect(() => {
        const waveAnimation = setInterval(() => {
            setWavePhase((prev) => (prev + 0.02) % (Math.PI * 2));
        }, 50);
        return () => clearInterval(waveAnimation);
    }, []);

    useEffect(() => {
        const lookAround = setInterval(() => {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 2 + 1;
            setEyePosition({
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance
            });
        }, 1200);

        const blink = setInterval(() => {
            setIsBlinking(true);
            setTimeout(() => setIsBlinking(false), 120);
        }, 3000);

        return () => {
            clearInterval(lookAround);
            clearInterval(blink);
        };
    }, []);

    const generateWavePoints = (count, radius, offset, intensity, frequency) => {
        const points = [];
        for (let i = 0; i <= count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const wave1 = Math.sin(angle * frequency + wavePhase + offset) * intensity;
            const wave2 = Math.cos(angle * (frequency * 0.7) - wavePhase * 0.8 + offset) * (intensity * 0.5);
            const r = radius + wave1 + wave2;
            const x = 30 + Math.cos(angle) * r;
            const y = 30 + Math.sin(angle) * r;
            points.push(`${x},${y}`);
        }
        return points.join(' ');
    };

    return (
        <div style={{
            width: '60px',
            height: '60px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {/* Wave rings */}
            <svg
                style={{
                    position: 'absolute',
                    width: '60px',
                    height: '60px',
                    pointerEvents: 'none'
                }}
                viewBox="0 0 60 60"
            >
                <defs>
                    <linearGradient id="miniWaveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(59, 130, 246, 0.4)" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="rgba(168, 85, 247, 0.4)" stopOpacity="0.2" />
                    </linearGradient>
                    <filter id="miniGlow">
                        <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                <polygon
                    points={generateWavePoints(40, 27, 0, 2, 3)}
                    fill="none"
                    stroke="url(#miniWaveGradient)"
                    strokeWidth="0.5"
                    opacity="0.6"
                    filter="url(#miniGlow)"
                />
            </svg>

            {/* Main orb */}
            <div style={{
                position: 'relative',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'radial-gradient(circle at 30% 30%, rgba(96, 165, 250, 0.9) 0%, rgba(59, 130, 246, 0.95) 20%, rgba(79, 70, 229, 1) 50%, rgba(124, 58, 237, 1) 80%, rgba(168, 85, 247, 0.95) 100%)',
                boxShadow: `
                    0 0 20px rgba(79, 70, 229, 0.6),
                    0 0 10px rgba(168, 85, 247, 0.4),
                    inset 0 0 15px rgba(255, 255, 255, 0.2)
                `,
                border: '1px solid rgba(255, 255, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
            }}>
                {/* Eyes */}
                <div style={{
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {/* Left eye */}
                    <div style={{
                        width: '6px',
                        height: isBlinking ? '1px' : '12px',
                        background: 'white',
                        borderRadius: '50%',
                        transition: 'all 0.1s ease',
                        boxShadow: '0 0 8px rgba(255, 255, 255, 0.8)',
                        transform: `translate(${eyePosition.x}px, ${eyePosition.y}px)`
                    }}></div>

                    {/* Right eye */}
                    <div style={{
                        width: '6px',
                        height: isBlinking ? '1px' : '12px',
                        background: 'white',
                        borderRadius: '50%',
                        transition: 'all 0.1s ease',
                        boxShadow: '0 0 8px rgba(255, 255, 255, 0.8)',
                        transform: `translate(${eyePosition.x}px, ${eyePosition.y}px)`
                    }}></div>
                </div>

                {/* Inner glow */}
                <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '10px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 70%)',
                    filter: 'blur(4px)',
                    pointerEvents: 'none'
                }}></div>
            </div>

            <style>{`
                @keyframes miniPulse {
                    0%, 100% { opacity: 0.6; }
                    50% { opacity: 0.8; }
                }
            `}</style>
        </div>
    );
};

export default FinScopeLogoMini;