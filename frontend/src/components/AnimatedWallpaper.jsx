import React, { useEffect, useRef, useCallback } from 'react';

const AnimatedWallpaper = ({ theme, style = {}, className = '' }) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const particlesRef = useRef([]);

    const getThemeConfig = useCallback((themeName) => {
        const themes = {
            'anim-starfield': {
                type: 'canvas',
                init: (ctx, w, h) => {
                    const stars = [];
                    for (let i = 0; i < 300; i++) {
                        stars.push({
                            x: Math.random() * w,
                            y: Math.random() * h,
                            z: Math.random() * 3 + 0.5,
                            brightness: Math.random(),
                            twinkleSpeed: Math.random() * 0.02 + 0.005,
                            twinkleOffset: Math.random() * Math.PI * 2,
                        });
                    }
                    // Add some shooting stars
                    const shootingStars = [];
                    return { stars, shootingStars, lastShoot: 0 };
                },
                draw: (ctx, w, h, t, data) => {
                    ctx.fillStyle = 'rgba(5, 5, 25, 1)';
                    ctx.fillRect(0, 0, w, h);

                    // Draw nebula glow
                    const grad1 = ctx.createRadialGradient(w * 0.3, h * 0.4, 0, w * 0.3, h * 0.4, w * 0.5);
                    grad1.addColorStop(0, 'rgba(59, 50, 130, 0.15)');
                    grad1.addColorStop(1, 'transparent');
                    ctx.fillStyle = grad1;
                    ctx.fillRect(0, 0, w, h);

                    const grad2 = ctx.createRadialGradient(w * 0.7, h * 0.6, 0, w * 0.7, h * 0.6, w * 0.4);
                    grad2.addColorStop(0, 'rgba(20, 60, 120, 0.12)');
                    grad2.addColorStop(1, 'transparent');
                    ctx.fillStyle = grad2;
                    ctx.fillRect(0, 0, w, h);

                    // Draw stars
                    data.stars.forEach(star => {
                        const twinkle = Math.sin(t * star.twinkleSpeed + star.twinkleOffset) * 0.5 + 0.5;
                        const alpha = star.brightness * 0.4 + twinkle * 0.6;
                        const size = star.z * (0.8 + twinkle * 0.4);

                        ctx.beginPath();
                        ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(200, 210, 255, ${alpha})`;
                        ctx.fill();

                        // Add glow to bright stars
                        if (star.z > 2) {
                            ctx.beginPath();
                            ctx.arc(star.x, star.y, size * 3, 0, Math.PI * 2);
                            ctx.fillStyle = `rgba(150, 170, 255, ${alpha * 0.15})`;
                            ctx.fill();
                        }
                    });

                    // Shooting stars
                    if (t - data.lastShoot > 3000 + Math.random() * 5000 && data.shootingStars.length < 2) {
                        data.shootingStars.push({
                            x: Math.random() * w,
                            y: Math.random() * h * 0.3,
                            vx: (Math.random() - 0.3) * 8,
                            vy: Math.random() * 4 + 2,
                            life: 1,
                            trail: [],
                        });
                        data.lastShoot = t;
                    }

                    data.shootingStars = data.shootingStars.filter(s => {
                        s.x += s.vx;
                        s.y += s.vy;
                        s.life -= 0.015;
                        s.trail.push({ x: s.x, y: s.y, a: s.life });
                        if (s.trail.length > 20) s.trail.shift();

                        s.trail.forEach((tp, i) => {
                            const a = tp.a * (i / s.trail.length) * 0.6;
                            ctx.beginPath();
                            ctx.arc(tp.x, tp.y, 1.5 * (i / s.trail.length), 0, Math.PI * 2);
                            ctx.fillStyle = `rgba(220, 230, 255, ${a})`;
                            ctx.fill();
                        });

                        return s.life > 0;
                    });
                },
            },

            'anim-aurora': {
                type: 'canvas',
                init: (ctx, w, h) => {
                    const waves = [];
                    for (let i = 0; i < 5; i++) {
                        waves.push({
                            y: h * 0.2 + i * h * 0.08,
                            amplitude: 30 + i * 15,
                            frequency: 0.003 + i * 0.0005,
                            speed: 0.0003 + i * 0.0001,
                            hue: 120 + i * 30,
                            alpha: 0.15 - i * 0.02,
                            phase: Math.random() * Math.PI * 2,
                        });
                    }
                    const stars = [];
                    for (let i = 0; i < 100; i++) {
                        stars.push({
                            x: Math.random() * w,
                            y: Math.random() * h,
                            size: Math.random() * 1.5 + 0.5,
                            alpha: Math.random() * 0.6 + 0.2,
                        });
                    }
                    return { waves, stars };
                },
                draw: (ctx, w, h, t, data) => {
                    ctx.fillStyle = '#050a15';
                    ctx.fillRect(0, 0, w, h);

                    // Stars
                    data.stars.forEach(s => {
                        ctx.beginPath();
                        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(255,255,255,${s.alpha * (0.5 + Math.sin(t * 0.001 + s.x) * 0.5)})`;
                        ctx.fill();
                    });

                    // Aurora waves
                    data.waves.forEach(wave => {
                        ctx.beginPath();
                        const hueShift = Math.sin(t * 0.0002) * 20;
                        for (let x = 0; x <= w; x += 3) {
                            const y = wave.y +
                                Math.sin(x * wave.frequency + t * wave.speed + wave.phase) * wave.amplitude +
                                Math.sin(x * wave.frequency * 2.3 + t * wave.speed * 1.7) * wave.amplitude * 0.4;
                            if (x === 0) ctx.moveTo(x, y);
                            else ctx.lineTo(x, y);
                        }
                        ctx.lineTo(w, h);
                        ctx.lineTo(0, h);
                        ctx.closePath();

                        const grad = ctx.createLinearGradient(0, wave.y - wave.amplitude, 0, h);
                        grad.addColorStop(0, `hsla(${wave.hue + hueShift}, 80%, 55%, ${wave.alpha})`);
                        grad.addColorStop(0.4, `hsla(${wave.hue + hueShift + 20}, 70%, 40%, ${wave.alpha * 0.5})`);
                        grad.addColorStop(1, 'transparent');
                        ctx.fillStyle = grad;
                        ctx.fill();
                    });
                },
            },

            'anim-particles': {
                type: 'canvas',
                init: (ctx, w, h) => {
                    const particles = [];
                    for (let i = 0; i < 80; i++) {
                        particles.push({
                            x: Math.random() * w,
                            y: Math.random() * h,
                            vx: (Math.random() - 0.5) * 0.5,
                            vy: (Math.random() - 0.5) * 0.5,
                            size: Math.random() * 3 + 1,
                            hue: Math.random() * 60 + 200,
                        });
                    }
                    return { particles };
                },
                draw: (ctx, w, h, t, data) => {
                    ctx.fillStyle = 'rgba(8, 10, 30, 1)';
                    ctx.fillRect(0, 0, w, h);

                    const { particles } = data;
                    particles.forEach(p => {
                        p.x += p.vx + Math.sin(t * 0.001 + p.y * 0.01) * 0.3;
                        p.y += p.vy + Math.cos(t * 0.001 + p.x * 0.01) * 0.3;
                        if (p.x < 0) p.x = w;
                        if (p.x > w) p.x = 0;
                        if (p.y < 0) p.y = h;
                        if (p.y > h) p.y = 0;
                    });

                    // Draw connections
                    for (let i = 0; i < particles.length; i++) {
                        for (let j = i + 1; j < particles.length; j++) {
                            const dx = particles[i].x - particles[j].x;
                            const dy = particles[i].y - particles[j].y;
                            const dist = Math.sqrt(dx * dx + dy * dy);
                            if (dist < 120) {
                                const alpha = (1 - dist / 120) * 0.3;
                                ctx.beginPath();
                                ctx.moveTo(particles[i].x, particles[i].y);
                                ctx.lineTo(particles[j].x, particles[j].y);
                                ctx.strokeStyle = `rgba(100, 140, 255, ${alpha})`;
                                ctx.lineWidth = 0.5;
                                ctx.stroke();
                            }
                        }
                    }

                    // Draw particles
                    particles.forEach(p => {
                        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
                        glow.addColorStop(0, `hsla(${p.hue}, 80%, 70%, 0.6)`);
                        glow.addColorStop(1, 'transparent');
                        ctx.fillStyle = glow;
                        ctx.fillRect(p.x - p.size * 4, p.y - p.size * 4, p.size * 8, p.size * 8);

                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                        ctx.fillStyle = `hsla(${p.hue}, 80%, 80%, 0.9)`;
                        ctx.fill();
                    });
                },
            },

            'anim-matrix': {
                type: 'canvas',
                init: (ctx, w, h) => {
                    const columns = Math.floor(w / 18);
                    const drops = new Array(columns).fill(0).map(() => Math.random() * -100);
                    const speeds = new Array(columns).fill(0).map(() => Math.random() * 0.5 + 0.3);
                    return { drops, speeds, columns };
                },
                draw: (ctx, w, h, t, data) => {
                    ctx.fillStyle = 'rgba(0, 5, 2, 0.08)';
                    ctx.fillRect(0, 0, w, h);

                    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン01';
                    ctx.font = '15px monospace';

                    data.drops.forEach((drop, i) => {
                        const char = chars[Math.floor(Math.random() * chars.length)];
                        const x = i * 18;
                        const y = drop * 18;

                        // Lead character (bright)
                        ctx.fillStyle = 'rgba(150, 255, 150, 0.95)';
                        ctx.fillText(char, x, y);

                        // Trail
                        ctx.fillStyle = 'rgba(0, 200, 80, 0.4)';
                        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, y - 18);

                        data.drops[i] += data.speeds[i];
                        if (y > h && Math.random() > 0.98) {
                            data.drops[i] = 0;
                        }
                    });
                },
            },

            'anim-ocean': {
                type: 'canvas',
                init: (ctx, w, h) => {
                    return {};
                },
                draw: (ctx, w, h, t, data) => {
                    // Deep ocean background
                    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
                    bgGrad.addColorStop(0, '#0a1628');
                    bgGrad.addColorStop(0.5, '#0c2340');
                    bgGrad.addColorStop(1, '#061220');
                    ctx.fillStyle = bgGrad;
                    ctx.fillRect(0, 0, w, h);

                    // Light rays from top
                    for (let i = 0; i < 5; i++) {
                        const x = w * (0.2 + i * 0.15) + Math.sin(t * 0.0003 + i) * 30;
                        const grad = ctx.createLinearGradient(x, 0, x + 40, h);
                        grad.addColorStop(0, 'rgba(80, 180, 255, 0.08)');
                        grad.addColorStop(1, 'transparent');
                        ctx.fillStyle = grad;
                        ctx.beginPath();
                        ctx.moveTo(x - 10, 0);
                        ctx.lineTo(x + 50 + Math.sin(t * 0.0005) * 20, h);
                        ctx.lineTo(x - 50 + Math.sin(t * 0.0005) * 20, h);
                        ctx.closePath();
                        ctx.fill();
                    }

                    // Floating particles (plankton)
                    for (let i = 0; i < 60; i++) {
                        const px = (i * 47 + Math.sin(t * 0.0005 + i) * 50) % w;
                        const py = (i * 31 + Math.cos(t * 0.0003 + i * 0.7) * 30 + t * 0.01 * (0.3 + (i % 5) * 0.1)) % h;
                        const alpha = 0.2 + Math.sin(t * 0.001 + i) * 0.15;
                        ctx.beginPath();
                        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(120, 200, 255, ${alpha})`;
                        ctx.fill();
                    }

                    // Waves at top
                    for (let layer = 0; layer < 3; layer++) {
                        ctx.beginPath();
                        for (let x = 0; x <= w; x += 4) {
                            const y = 15 + layer * 8 +
                                Math.sin(x * 0.01 + t * 0.001 * (layer + 1)) * 6 +
                                Math.sin(x * 0.02 + t * 0.0015) * 3;
                            if (x === 0) ctx.moveTo(x, y);
                            else ctx.lineTo(x, y);
                        }
                        ctx.lineTo(w, 0);
                        ctx.lineTo(0, 0);
                        ctx.closePath();
                        ctx.fillStyle = `rgba(10, 25, 50, ${0.5 - layer * 0.12})`;
                        ctx.fill();
                    }
                },
            },

            'anim-fireflies': {
                type: 'canvas',
                init: (ctx, w, h) => {
                    const flies = [];
                    for (let i = 0; i < 40; i++) {
                        flies.push({
                            x: Math.random() * w,
                            y: Math.random() * h,
                            vx: (Math.random() - 0.5) * 0.8,
                            vy: (Math.random() - 0.5) * 0.8,
                            phase: Math.random() * Math.PI * 2,
                            glowSpeed: Math.random() * 0.003 + 0.001,
                            size: Math.random() * 2 + 1.5,
                            hue: Math.random() * 40 + 30, // golden to green
                        });
                    }
                    return { flies };
                },
                draw: (ctx, w, h, t, data) => {
                    // Forest night background
                    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
                    bgGrad.addColorStop(0, '#0a0f1a');
                    bgGrad.addColorStop(0.5, '#0d1520');
                    bgGrad.addColorStop(1, '#050a10');
                    ctx.fillStyle = bgGrad;
                    ctx.fillRect(0, 0, w, h);

                    // Subtle moon glow
                    const moonGrad = ctx.createRadialGradient(w * 0.8, h * 0.15, 0, w * 0.8, h * 0.15, 100);
                    moonGrad.addColorStop(0, 'rgba(200, 210, 230, 0.1)');
                    moonGrad.addColorStop(1, 'transparent');
                    ctx.fillStyle = moonGrad;
                    ctx.fillRect(0, 0, w, h);

                    data.flies.forEach(f => {
                        f.x += f.vx + Math.sin(t * 0.001 + f.phase) * 0.5;
                        f.y += f.vy + Math.cos(t * 0.0008 + f.phase) * 0.4;
                        if (f.x < -20) f.x = w + 20;
                        if (f.x > w + 20) f.x = -20;
                        if (f.y < -20) f.y = h + 20;
                        if (f.y > h + 20) f.y = -20;

                        const glow = Math.sin(t * f.glowSpeed + f.phase) * 0.5 + 0.5;
                        const alpha = glow * 0.8 + 0.1;

                        // Outer glow
                        const outerGrad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.size * 15);
                        outerGrad.addColorStop(0, `hsla(${f.hue}, 90%, 70%, ${alpha * 0.3})`);
                        outerGrad.addColorStop(1, 'transparent');
                        ctx.fillStyle = outerGrad;
                        ctx.fillRect(f.x - f.size * 15, f.y - f.size * 15, f.size * 30, f.size * 30);

                        // Core
                        ctx.beginPath();
                        ctx.arc(f.x, f.y, f.size * glow, 0, Math.PI * 2);
                        ctx.fillStyle = `hsla(${f.hue}, 90%, 85%, ${alpha})`;
                        ctx.fill();
                    });
                },
            },

            'anim-nebula': {
                type: 'canvas',
                init: (ctx, w, h) => {
                    const blobs = [];
                    for (let i = 0; i < 6; i++) {
                        blobs.push({
                            x: Math.random() * w,
                            y: Math.random() * h,
                            radius: Math.random() * 150 + 100,
                            hue: Math.random() * 80 + 240,
                            speed: Math.random() * 0.3 + 0.1,
                            angle: Math.random() * Math.PI * 2,
                            orbitRadius: Math.random() * 60 + 30,
                        });
                    }
                    const stars = [];
                    for (let i = 0; i < 150; i++) {
                        stars.push({
                            x: Math.random() * w,
                            y: Math.random() * h,
                            size: Math.random() * 1.5 + 0.3,
                            alpha: Math.random() * 0.7 + 0.2,
                        });
                    }
                    return { blobs, stars };
                },
                draw: (ctx, w, h, t, data) => {
                    ctx.fillStyle = '#03040a';
                    ctx.fillRect(0, 0, w, h);

                    // Stars
                    data.stars.forEach(s => {
                        ctx.beginPath();
                        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
                        ctx.fill();
                    });

                    // Nebula blobs
                    ctx.globalCompositeOperation = 'screen';
                    data.blobs.forEach(blob => {
                        const bx = blob.x + Math.cos(t * 0.0003 * blob.speed + blob.angle) * blob.orbitRadius;
                        const by = blob.y + Math.sin(t * 0.0003 * blob.speed + blob.angle) * blob.orbitRadius;
                        const hueShift = Math.sin(t * 0.0001) * 15;

                        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, blob.radius);
                        grad.addColorStop(0, `hsla(${blob.hue + hueShift}, 80%, 50%, 0.12)`);
                        grad.addColorStop(0.5, `hsla(${blob.hue + hueShift + 30}, 70%, 40%, 0.06)`);
                        grad.addColorStop(1, 'transparent');
                        ctx.fillStyle = grad;
                        ctx.fillRect(bx - blob.radius, by - blob.radius, blob.radius * 2, blob.radius * 2);
                    });
                    ctx.globalCompositeOperation = 'source-over';
                },
            },

            'anim-rain': {
                type: 'canvas',
                init: (ctx, w, h) => {
                    const drops = [];
                    for (let i = 0; i < 200; i++) {
                        drops.push({
                            x: Math.random() * w,
                            y: Math.random() * h,
                            speed: Math.random() * 4 + 3,
                            length: Math.random() * 20 + 10,
                            alpha: Math.random() * 0.3 + 0.1,
                        });
                    }
                    const splashes = [];
                    return { drops, splashes };
                },
                draw: (ctx, w, h, t, data) => {
                    // Stormy sky
                    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
                    bgGrad.addColorStop(0, '#0f1520');
                    bgGrad.addColorStop(0.5, '#151d2e');
                    bgGrad.addColorStop(1, '#0a1018');
                    ctx.fillStyle = bgGrad;
                    ctx.fillRect(0, 0, w, h);

                    // Lightning flash (rare)
                    if (Math.random() < 0.001) {
                        ctx.fillStyle = 'rgba(200, 210, 255, 0.05)';
                        ctx.fillRect(0, 0, w, h);
                    }

                    // Rain drops
                    data.drops.forEach(drop => {
                        ctx.beginPath();
                        ctx.moveTo(drop.x, drop.y);
                        ctx.lineTo(drop.x - 1, drop.y + drop.length);
                        ctx.strokeStyle = `rgba(120, 160, 220, ${drop.alpha})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();

                        drop.y += drop.speed;
                        drop.x -= 0.5;
                        if (drop.y > h) {
                            drop.y = -drop.length;
                            drop.x = Math.random() * w;
                        }
                    });
                },
            },

            'anim-lava': {
                type: 'canvas',
                init: (ctx, w, h) => {
                    const blobs = [];
                    for (let i = 0; i < 8; i++) {
                        blobs.push({
                            x: Math.random() * w,
                            y: Math.random() * h,
                            radius: Math.random() * 100 + 80,
                            vx: (Math.random() - 0.5) * 0.5,
                            vy: (Math.random() - 0.5) * 0.5,
                            phase: Math.random() * Math.PI * 2,
                        });
                    }
                    return { blobs };
                },
                draw: (ctx, w, h, t, data) => {
                    ctx.fillStyle = '#1a0508';
                    ctx.fillRect(0, 0, w, h);

                    ctx.globalCompositeOperation = 'screen';
                    data.blobs.forEach(blob => {
                        blob.x += blob.vx + Math.sin(t * 0.0005 + blob.phase) * 0.5;
                        blob.y += blob.vy + Math.cos(t * 0.0004 + blob.phase) * 0.5;

                        if (blob.x < -blob.radius) blob.x = w + blob.radius;
                        if (blob.x > w + blob.radius) blob.x = -blob.radius;
                        if (blob.y < -blob.radius) blob.y = h + blob.radius;
                        if (blob.y > h + blob.radius) blob.y = -blob.radius;

                        const pulse = Math.sin(t * 0.001 + blob.phase) * 0.3 + 1;
                        const r = blob.radius * pulse;

                        const grad = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, r);
                        grad.addColorStop(0, 'rgba(255, 100, 20, 0.25)');
                        grad.addColorStop(0.3, 'rgba(255, 50, 0, 0.15)');
                        grad.addColorStop(0.6, 'rgba(180, 20, 0, 0.08)');
                        grad.addColorStop(1, 'transparent');
                        ctx.fillStyle = grad;
                        ctx.fillRect(blob.x - r, blob.y - r, r * 2, r * 2);
                    });
                    ctx.globalCompositeOperation = 'source-over';

                    // Floating embers
                    for (let i = 0; i < 20; i++) {
                        const ex = (i * 73 + t * 0.02) % w;
                        const ey = h - ((i * 41 + t * 0.03 * (0.5 + i * 0.05)) % (h * 0.6));
                        const alpha = Math.sin(t * 0.003 + i) * 0.3 + 0.4;
                        ctx.beginPath();
                        ctx.arc(ex, ey, 1.5, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(255, 150, 50, ${alpha})`;
                        ctx.fill();
                    }
                },
            },

            'anim-snowfall': {
                type: 'canvas',
                init: (ctx, w, h) => {
                    const flakes = [];
                    for (let i = 0; i < 150; i++) {
                        flakes.push({
                            x: Math.random() * w,
                            y: Math.random() * h,
                            size: Math.random() * 3 + 1,
                            speed: Math.random() * 1 + 0.5,
                            wobble: Math.random() * Math.PI * 2,
                            wobbleSpeed: Math.random() * 0.002 + 0.001,
                            alpha: Math.random() * 0.5 + 0.3,
                        });
                    }
                    return { flakes };
                },
                draw: (ctx, w, h, t, data) => {
                    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
                    bgGrad.addColorStop(0, '#101830');
                    bgGrad.addColorStop(1, '#1a2540');
                    ctx.fillStyle = bgGrad;
                    ctx.fillRect(0, 0, w, h);

                    data.flakes.forEach(f => {
                        f.y += f.speed;
                        f.x += Math.sin(t * f.wobbleSpeed + f.wobble) * 0.5;

                        if (f.y > h + f.size) {
                            f.y = -f.size;
                            f.x = Math.random() * w;
                        }

                        ctx.beginPath();
                        ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(220, 230, 255, ${f.alpha})`;
                        ctx.fill();

                        if (f.size > 2) {
                            const glow = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.size * 3);
                            glow.addColorStop(0, `rgba(200, 220, 255, ${f.alpha * 0.2})`);
                            glow.addColorStop(1, 'transparent');
                            ctx.fillStyle = glow;
                            ctx.fillRect(f.x - f.size * 3, f.y - f.size * 3, f.size * 6, f.size * 6);
                        }
                    });
                },
            },

            'anim-galaxy': {
                type: 'canvas',
                init: (ctx, w, h) => {
                    const stars = [];
                    const cx = w / 2, cy = h / 2;
                    for (let i = 0; i < 400; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const dist = Math.random() * Math.min(w, h) * 0.45;
                        const arm = Math.floor(Math.random() * 3);
                        const armAngle = (arm / 3) * Math.PI * 2;
                        const spiral = dist * 0.008;
                        stars.push({
                            angle: angle + armAngle + spiral,
                            dist: dist + (Math.random() - 0.5) * 40,
                            size: Math.random() * 1.5 + 0.5,
                            hue: Math.random() * 60 + 200,
                            alpha: Math.random() * 0.7 + 0.2,
                            speed: 0.00003 + (1 / (dist + 50)) * 0.02,
                        });
                    }
                    return { stars, cx, cy };
                },
                draw: (ctx, w, h, t, data) => {
                    ctx.fillStyle = 'rgba(3, 3, 12, 0.3)';
                    ctx.fillRect(0, 0, w, h);

                    // Center glow
                    const centerGlow = ctx.createRadialGradient(data.cx, data.cy, 0, data.cx, data.cy, 80);
                    centerGlow.addColorStop(0, 'rgba(200, 180, 255, 0.08)');
                    centerGlow.addColorStop(1, 'transparent');
                    ctx.fillStyle = centerGlow;
                    ctx.fillRect(0, 0, w, h);

                    data.stars.forEach(s => {
                        s.angle += s.speed;
                        const x = data.cx + Math.cos(s.angle) * s.dist;
                        const y = data.cy + Math.sin(s.angle) * s.dist;

                        ctx.beginPath();
                        ctx.arc(x, y, s.size, 0, Math.PI * 2);
                        ctx.fillStyle = `hsla(${s.hue}, 70%, 75%, ${s.alpha})`;
                        ctx.fill();
                    });
                },
            },
        };

        return themes[themeName] || null;
    }, []);

    useEffect(() => {
        const config = getThemeConfig(theme);
        if (!config || config.type !== 'canvas') return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
        };
        resize();

        const rect = canvas.getBoundingClientRect();
        const data = config.init(ctx, rect.width, rect.height);

        let startTime = performance.now();
        const animate = (now) => {
            const elapsed = now - startTime;
            const rect = canvas.getBoundingClientRect();
            config.draw(ctx, rect.width, rect.height, elapsed, data);
            animationRef.current = requestAnimationFrame(animate);
        };
        animationRef.current = requestAnimationFrame(animate);

        const handleResize = () => {
            resize();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            window.removeEventListener('resize', handleResize);
        };
    }, [theme, getThemeConfig]);

    const config = getThemeConfig(theme);
    if (!config) return null;

    return (
        <canvas
            ref={canvasRef}
            className={className}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                ...style,
            }}
        />
    );
};

export default AnimatedWallpaper;