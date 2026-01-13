import React, { useState, useEffect } from 'react';

const FinScopeAI = () => {
    const [isListening, setIsListening] = useState(false);
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
            const distance = Math.random() * 12 + 4;
            setEyePosition({
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance
            });
        }, 800);

        const blink = setInterval(() => {
            setIsBlinking(true);
            setTimeout(() => setIsBlinking(false), 120);
        }, 2000);

        const doubleBlink = setInterval(() => {
            setIsBlinking(true);
            setTimeout(() => {
                setIsBlinking(false);
                setTimeout(() => {
                    setIsBlinking(true);
                    setTimeout(() => setIsBlinking(false), 120);
                }, 150);
            }, 120);
        }, 8000);

        return () => {
            clearInterval(lookAround);
            clearInterval(blink);
            clearInterval(doubleBlink);
        };
    }, []);

    const getGradientColors = () => {
        return {
            color1: 'rgba(96, 165, 250, 0.85)',
            color2: 'rgba(59, 130, 246, 0.9)',
            color3: 'rgba(37, 99, 235, 0.95)',
            color4: 'rgba(79, 70, 229, 0.95)',
            color5: 'rgba(124, 58, 237, 0.95)',
            color6: 'rgba(168, 85, 247, 0.95)',
            color7: 'rgba(236, 72, 153, 0.9)',
            glow1: 'rgba(79, 70, 229, 0.7)',
            glow2: 'rgba(168, 85, 247, 0.5)',
            wave: 'rgba(124, 58, 237, 0.6)'
        };
    };

    const generateWavePoints = (count, radius, offset, intensity, frequency) => {
        const points = [];
        const baseRadius = radius;

        for (let i = 0; i <= count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const wave1 = Math.sin(angle * frequency + wavePhase + offset) * intensity;
            const wave2 = Math.cos(angle * (frequency * 0.7) - wavePhase * 0.8 + offset) * (intensity * 0.5);
            const wave3 = Math.sin(angle * (frequency * 1.5) + wavePhase * 1.2 + offset) * (intensity * 0.3);
            const r = baseRadius + wave1 + wave2 + wave3;
            const x = 200 + Math.cos(angle) * r;
            const y = 200 + Math.sin(angle) * r;
            points.push(`${x},${y}`);
        }

        return points.join(' ');
    };

    const colors = getGradientColors();

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                    <svg style={{ position: 'absolute', width: '24rem', height: '24rem', pointerEvents: 'none' }} viewBox="0 0 400 400">
                        <defs>
                            <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={colors.color2} stopOpacity="0.3" />
                                <stop offset="50%" stopColor={colors.color5} stopOpacity="0.2" />
                                <stop offset="100%" stopColor={colors.color7} stopOpacity="0.15" />
                            </linearGradient>
                            <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={colors.color3} stopOpacity="0.35" />
                                <stop offset="50%" stopColor={colors.color6} stopOpacity="0.25" />
                                <stop offset="100%" stopColor={colors.color7} stopOpacity="0.2" />
                            </linearGradient>
                            <linearGradient id="waveGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={colors.color4} stopOpacity="0.4" />
                                <stop offset="50%" stopColor={colors.color5} stopOpacity="0.3" />
                                <stop offset="100%" stopColor={colors.color6} stopOpacity="0.25" />
                            </linearGradient>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                                <feMerge>
                                    <feMergeNode in="coloredBlur"/>
                                    <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                            </filter>
                        </defs>

                        <polygon
                            points={generateWavePoints(100, 182, 0, 12, 3)}
                            fill="none"
                            stroke="url(#waveGradient1)"
                            strokeWidth="2"
                            opacity="0.5"
                            filter="url(#glow)"
                        />

                        <polygon
                            points={generateWavePoints(90, 172, 1.2, 10, 3.5)}
                            fill="none"
                            stroke="url(#waveGradient2)"
                            strokeWidth="2.5"
                            opacity="0.6"
                            filter="url(#glow)"
                        />

                        <polygon
                            points={generateWavePoints(80, 163, 2.5, 8, 4)}
                            fill="none"
                            stroke="url(#waveGradient3)"
                            strokeWidth="3"
                            opacity="0.7"
                            filter="url(#glow)"
                        />
                    </svg>

                    <div style={{
                        position: 'absolute',
                        width: '24rem',
                        height: '24rem',
                        borderRadius: '50%',
                        opacity: 0.4,
                        background: 'radial-gradient(circle, rgba(79, 70, 229, 0.7) 0%, rgba(168, 85, 247, 0.5) 50%, transparent 70%)',
                        filter: 'blur(40px)',
                        animation: 'pulse 3s ease-in-out infinite'
                    }}></div>

                    <div style={{
                        position: 'relative',
                        width: '20rem',
                        height: '20rem',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.5s',
                        background: 'radial-gradient(circle at 30% 30%, rgba(96, 165, 250, 0.85) 0%, rgba(59, 130, 246, 0.9) 15%, rgba(37, 99, 235, 0.95) 30%, rgba(79, 70, 229, 0.95) 50%, rgba(124, 58, 237, 0.95) 70%, rgba(168, 85, 247, 0.95) 85%, rgba(236, 72, 153, 0.9) 100%)',
                        boxShadow: `
                            0 0 80px rgba(79, 70, 229, 0.7),
                            0 0 40px rgba(168, 85, 247, 0.6),
                            inset 0 0 60px rgba(255, 255, 255, 0.15),
                            inset -30px -30px 80px rgba(124, 58, 237, 0.5),
                            inset 30px 30px 80px rgba(199, 210, 254, 0.3)
                        `,
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.25)'
                    }}
                         onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                         onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >

                        <div style={{
                            position: 'absolute',
                            top: '3rem',
                            left: '4rem',
                            width: '10rem',
                            height: '10rem',
                            borderRadius: '50%',
                            opacity: 0.6,
                            pointerEvents: 'none',
                            background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8) 0%, rgba(199, 210, 254, 0.4) 30%, transparent 60%)',
                            filter: 'blur(25px)',
                            transform: 'rotate(-15deg)'
                        }}></div>

                        <div style={{
                            position: 'absolute',
                            top: '5rem',
                            left: '6rem',
                            width: '6rem',
                            height: '6rem',
                            borderRadius: '50%',
                            opacity: 0.5,
                            pointerEvents: 'none',
                            background: 'radial-gradient(circle, rgba(165, 180, 252, 0.7) 0%, transparent 70%)',
                            filter: 'blur(15px)'
                        }}></div>

                        <div style={{
                            position: 'absolute',
                            top: '8rem',
                            left: '8rem',
                            width: '5rem',
                            height: '5rem',
                            borderRadius: '50%',
                            opacity: 0.4,
                            pointerEvents: 'none',
                            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, transparent 70%)',
                            filter: 'blur(10px)'
                        }}></div>

                        <div style={{
                            position: 'relative',
                            display: 'flex',
                            gap: '3rem',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10
                        }}>
                            <div style={{
                                position: 'relative',
                                width: '2rem',
                                height: '5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <div
                                    style={{
                                        width: '2rem',
                                        height: isBlinking ? '0.25rem' : '5rem',
                                        background: 'white',
                                        borderRadius: '50%',
                                        transition: 'all 0.5s ease-out',
                                        boxShadow: '0 0 30px rgba(255, 255, 255, 0.9), 0 0 15px rgba(147, 197, 253, 0.6), inset 0 2px 8px rgba(147, 197, 253, 0.3)',
                                        transform: `translate(${eyePosition.x}px, ${eyePosition.y}px)`
                                    }}
                                ></div>
                            </div>

                            <div style={{
                                position: 'relative',
                                width: '2rem',
                                height: '5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <div
                                    style={{
                                        width: '2rem',
                                        height: isBlinking ? '0.25rem' : '5rem',
                                        background: 'white',
                                        borderRadius: '50%',
                                        transition: 'all 0.5s ease-out',
                                        boxShadow: '0 0 30px rgba(255, 255, 255, 0.9), 0 0 15px rgba(147, 197, 253, 0.6), inset 0 2px 8px rgba(147, 197, 253, 0.3)',
                                        transform: `translate(${eyePosition.x}px, ${eyePosition.y}px)`
                                    }}
                                ></div>
                            </div>
                        </div>

                        <div style={{
                            position: 'absolute',
                            inset: '2rem',
                            borderRadius: '50%',
                            pointerEvents: 'none',
                            opacity: 0.3,
                            background: 'transparent',
                            boxShadow: 'inset 0 0 50px rgba(129, 140, 248, 0.4)'
                        }}></div>

                        <div style={{
                            position: 'absolute',
                            bottom: '2rem',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '14rem',
                            height: '8rem',
                            borderRadius: '50%',
                            opacity: 0.6,
                            pointerEvents: 'none',
                            background: 'radial-gradient(ellipse, rgba(91, 33, 182, 0.9) 0%, transparent 70%)',
                            filter: 'blur(20px)'
                        }}></div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.4; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.05); }
                }
            `}</style>
        </div>
    );
};

export default FinScopeAI;