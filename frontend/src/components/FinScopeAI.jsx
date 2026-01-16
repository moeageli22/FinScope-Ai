"use client"

import { useState, useEffect } from "react"
import "./FinScopeAi.css"

const FinScopeAI = () => {
    const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 })
    const [isBlinking, setIsBlinking] = useState(false)
    const [wavePhase, setWavePhase] = useState(0)
    const [isHovered, setIsHovered] = useState(false)

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
