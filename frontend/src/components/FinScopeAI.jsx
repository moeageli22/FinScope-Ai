import React, { useState, useEffect } from 'react';

const FinScopeAI = () => {
    const [isListening, setIsListening] = useState(false);
    const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
    const [isBlinking, setIsBlinking] = useState(false);
    const [colorShift, setColorShift] = useState(0);

    useEffect(() => {
        // Smooth color shifting animation
        const colorAnimation = setInterval(() => {
            setColorShift((prev) => (prev + 1) % 360);
        }, 50); // Update every 50ms for smooth transition

        return () => clearInterval(colorAnimation);
    }, []);

    useEffect(() => {
        // Eye looking around animation - more frequent and expressive
        const lookAround = setInterval(() => {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 12 + 4; // Increased range for more movement
            setEyePosition({
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance
            });
        }, 800); // Much faster - eyes move every 0.8 seconds

        // Blinking animation - more frequent
        const blink = setInterval(() => {
            setIsBlinking(true);
            setTimeout(() => setIsBlinking(false), 120);
        }, 2000); // Blink every 2 seconds

        // Occasional double blink for cuteness
        const doubleBlink = setInterval(() => {
            setIsBlinking(true);
            setTimeout(() => {
                setIsBlinking(false);
                setTimeout(() => {
                    setIsBlinking(true);
                    setTimeout(() => setIsBlinking(false), 120);
                }, 150);
            }, 120);
        }, 8000); // Double blink every 8 seconds

        return () => {
            clearInterval(lookAround);
            clearInterval(blink);
            clearInterval(doubleBlink);
        };
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center overflow-hidden relative bg-black">
            <div className="relative z-10 text-center">
                <div className="relative flex items-center justify-center">

                    <div className="absolute w-96 h-96 rounded-full opacity-35"
                         style={{
                             background: 'radial-gradient(circle, rgba(55, 48, 163, 0.6) 0%, rgba(91, 33, 182, 0.4) 50%, transparent 70%)',
                             filter: 'blur(40px)',
                             animation: 'pulse 3s ease-in-out infinite'
                         }}></div>

                    <div className="relative w-80 h-80 rounded-full flex items-center justify-center transition-transform duration-500 hover:scale-105"
                         style={{
                             background: 'radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.85) 0%, rgba(37, 99, 235, 0.9) 15%, rgba(29, 78, 216, 0.95) 30%, rgba(55, 48, 163, 0.95) 50%, rgba(91, 33, 182, 0.95) 70%, rgba(126, 34, 206, 0.95) 85%, rgba(147, 51, 234, 0.9) 100%)',
                             boxShadow: `
                   0 0 80px rgba(55, 48, 163, 0.7),
                   0 0 40px rgba(126, 34, 206, 0.6),
                   inset 0 0 60px rgba(255, 255, 255, 0.08),
                   inset -30px -30px 80px rgba(91, 33, 182, 0.6),
                   inset 30px 30px 80px rgba(59, 130, 246, 0.2)
                 `,
                             backdropFilter: 'blur(10px)',
                             border: '1px solid rgba(255, 255, 255, 0.15)'
                         }}>

                        <div className="absolute top-12 left-16 w-40 h-40 rounded-full opacity-45 pointer-events-none"
                             style={{
                                 background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.5) 0%, rgba(147, 197, 253, 0.25) 30%, transparent 60%)',
                                 filter: 'blur(25px)',
                                 transform: 'rotate(-15deg)'
                             }}></div>

                        <div className="absolute top-20 left-24 w-24 h-24 rounded-full opacity-30 pointer-events-none"
                             style={{
                                 background: 'radial-gradient(circle, rgba(99, 102, 241, 0.5) 0%, transparent 70%)',
                                 filter: 'blur(15px)'
                             }}></div>

                        <div className="relative flex gap-12 items-center justify-center z-10">
                            <div className="relative w-8 h-20 flex items-center justify-center">
                                <div
                                    className="w-8 bg-white rounded-full transition-all duration-500 ease-out"
                                    style={{
                                        height: isBlinking ? '4px' : '80px',
                                        boxShadow: '0 0 30px rgba(255, 255, 255, 0.9), 0 0 15px rgba(147, 197, 253, 0.6), inset 0 2px 8px rgba(147, 197, 253, 0.3)',
                                        transform: `translate(${eyePosition.x}px, ${eyePosition.y}px)`
                                    }}
                                ></div>
                            </div>

                            <div className="relative w-8 h-20 flex items-center justify-center">
                                <div
                                    className="w-8 bg-white rounded-full transition-all duration-500 ease-out"
                                    style={{
                                        height: isBlinking ? '4px' : '80px',
                                        boxShadow: '0 0 30px rgba(255, 255, 255, 0.9), 0 0 15px rgba(147, 197, 253, 0.6), inset 0 2px 8px rgba(147, 197, 253, 0.3)',
                                        transform: `translate(${eyePosition.x}px, ${eyePosition.y}px)`
                                    }}
                                ></div>
                            </div>
                        </div>

                        <div className="absolute inset-8 rounded-full pointer-events-none opacity-30"
                             style={{
                                 background: 'transparent',
                                 boxShadow: 'inset 0 0 50px rgba(129, 140, 248, 0.4)'
                             }}></div>

                        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-56 h-32 rounded-full opacity-60 pointer-events-none"
                             style={{
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