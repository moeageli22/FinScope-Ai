"use client"

import { useState, useEffect } from "react"
import "./FinScopeAi.css"

const FinScopeAI = () => {
    const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 })
    const [isBlinking, setIsBlinking] = useState(false)
    const [wavePhase, setWavePhase] = useState(0)
    const [isHovered, setIsHovered] = useState(false)

    const fintechIcons = [
        { type: "dollar", angle: 0 },
        { type: "bitcoin", angle: 45 },
        { type: "euro", angle: 90 },
        { type: "chart-up", angle: 135 },
        { type: "pound", angle: 180 },
        { type: "yen", angle: 225 },
        { type: "chart-bar", angle: 270 },
        { type: "wallet", angle: 315 },
    ]

    const renderIcon = (type) => {
        switch (type) {
            case "dollar":
                return <span className="fintech-symbol">$</span>
            case "bitcoin":
                return (
                    <svg className="fintech-svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.5 8.8v-3h-1v3h1zm0 5.9v-3h-1v3h1zm2.5-5.4c0-.7-.1-1.2-.4-1.6-.3-.4-.7-.6-1.3-.7V5H12v2h-1V5h-1.3v2H8v1.3h.7c.4 0 .6.2.6.6v6.2c0 .4-.2.6-.6.6H8V17h1.7v2H11v-2h1v2h1.3v-2c.6-.1 1.1-.3 1.5-.6.4-.4.6-.9.7-1.6 0-.5-.1-1-.4-1.4-.2-.4-.6-.7-1.1-.8.4-.1.7-.4 1-.8.2-.4.4-.8.4-1.3zm-2 .9c0 .4-.1.7-.3.8-.2.2-.5.2-.9.2h-.8V9h.8c.4 0 .7.1.9.3.2.2.3.4.3.9zm.3 4.1c-.2.2-.6.3-1 .3h-1.3v-2.4h1.3c.4 0 .8.1 1 .3.2.2.3.5.3 1 0 .4-.1.7-.3.8z" />
                    </svg>
                )
            case "euro":
                return <span className="fintech-symbol">€</span>
            case "chart-up":
                return (
                    <svg
                        className="fintech-svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                        <polyline points="16 7 22 7 22 13" />
                    </svg>
                )
            case "pound":
                return <span className="fintech-symbol">£</span>
            case "yen":
                return <span className="fintech-symbol">¥</span>
            case "chart-bar":
                return (
                    <svg
                        className="fintech-svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="12" y1="20" x2="12" y2="10" />
                        <line x1="18" y1="20" x2="18" y2="4" />
                        <line x1="6" y1="20" x2="6" y2="16" />
                    </svg>
                )
            case "wallet":
                return (
                    <svg
                        className="fintech-svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                        <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                        <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" />
                    </svg>
                )
            default:
                return null
        }
    }

    useEffect(() => {
        const waveAnimation = setInterval(() => {
            setWavePhase((prev) => (prev + 0.015) % (Math.PI * 2))
        }, 50)
        return () => clearInterval(waveAnimation)
    }, [])

    useEffect(() => {
        const lookAround = setInterval(() => {
            const angle = Math.random() * Math.PI * 2
            const distance = Math.random() * 8 + 2
            setEyePosition({
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
            })
        }, 1200)

        const blink = setInterval(() => {
            setIsBlinking(true)
            setTimeout(() => setIsBlinking(false), 100)
        }, 3000)

        const doubleBlink = setInterval(() => {
            setIsBlinking(true)
            setTimeout(() => {
                setIsBlinking(false)
                setTimeout(() => {
                    setIsBlinking(true)
                    setTimeout(() => setIsBlinking(false), 100)
                }, 120)
            }, 100)
        }, 10000)

        return () => {
            clearInterval(lookAround)
            clearInterval(blink)
            clearInterval(doubleBlink)
        }
    }, [])

    const generateWavePoints = (count, radius, offset, intensity, frequency) => {
        const points = []
        for (let i = 0; i <= count; i++) {
            const angle = (i / count) * Math.PI * 2
            const wave1 = Math.sin(angle * frequency + wavePhase + offset) * intensity
            const wave2 = Math.cos(angle * (frequency * 0.7) - wavePhase * 0.8 + offset) * (intensity * 0.5)
            const wave3 = Math.sin(angle * (frequency * 1.5) + wavePhase * 1.2 + offset) * (intensity * 0.3)
            const r = radius + wave1 + wave2 + wave3
            const x = 200 + Math.cos(angle) * r
            const y = 200 + Math.sin(angle) * r
            points.push(`${x},${y}`)
        }
        return points.join(" ")
    }

    return (
        <div className="finscope-container">
            <div className="finscope-wrapper">
                {/* Outer ambient glow */}
                <div className="ambient-glow" />

                <div className="fintech-orbit">
                    {fintechIcons.map((icon, i) => (
                        <div
                            key={i}
                            className="fintech-icon"
                            style={{
                                "--icon-angle": `${icon.angle}deg`,
                                "--icon-delay": `${i * -2.5}s`,
                            }}
                        >
                            {renderIcon(icon.type)}
                        </div>
                    ))}
                </div>

                {/* Orbiting particles - kept */}
                <div className="orbit-particles">
                    {[...Array(12)].map((_, i) => (
                        <div
                            key={i}
                            className="orbit-particle"
                            style={{
                                "--orbit-delay": `${i * -1.5}s`,
                                "--orbit-size": `${4 + (i % 3) * 2}px`,
                            }}
                        />
                    ))}
                </div>

                {/* Animated wave rings - kept */}
                <svg className="wave-svg" viewBox="0 0 400 400">
                    <defs>
                        <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                            <stop offset="50%" stopColor="#6366f1" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
                        </linearGradient>
                        <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.5" />
                            <stop offset="50%" stopColor="#818cf8" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.25" />
                        </linearGradient>
                        <linearGradient id="waveGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.6" />
                            <stop offset="50%" stopColor="#a5b4fc" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0.3" />
                        </linearGradient>
                        <filter id="waveGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    <polygon
                        points={generateWavePoints(120, 185, 0, 10, 3)}
                        fill="none"
                        stroke="url(#waveGrad1)"
                        strokeWidth="1.5"
                        filter="url(#waveGlow)"
                    />
                    <polygon
                        points={generateWavePoints(100, 175, 1, 8, 4)}
                        fill="none"
                        stroke="url(#waveGrad2)"
                        strokeWidth="2"
                        filter="url(#waveGlow)"
                    />
                    <polygon
                        points={generateWavePoints(80, 165, 2, 6, 5)}
                        fill="none"
                        stroke="url(#waveGrad3)"
                        strokeWidth="2.5"
                        filter="url(#waveGlow)"
                    />
                </svg>

                {/* Main orb */}
                <div
                    className={`orb-main ${isHovered ? "orb-hovered" : ""}`}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* Glass reflections */}
                    <div className="reflection-primary" />
                    <div className="reflection-secondary" />
                    <div className="reflection-tertiary" />

                    {/* Eyes */}
                    <div className="eyes-container">
                        {[0, 1].map((i) => (
                            <div key={i} className="eye-wrapper">
                                <div
                                    className="eye"
                                    style={{
                                        height: isBlinking ? "4px" : "72px",
                                        transform: `translate(${eyePosition.x}px, ${eyePosition.y}px)`,
                                    }}
                                >
                                    <div className="eye-highlight" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Inner glow */}
                    <div className="inner-glow" />

                    {/* Bottom reflection */}
                    <div className="bottom-glow" />
                </div>

                {/* Floating particles */}
                <div className="particles">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="particle"
                            style={{
                                "--delay": `${i * 0.8}s`,
                                "--duration": `${3 + i * 0.5}s`,
                                "--x": `${Math.cos((i * 60 * Math.PI) / 180) * 140}px`,
                                "--y": `${Math.sin((i * 60 * Math.PI) / 180) * 140}px`,
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default FinScopeAI
