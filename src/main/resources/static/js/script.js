/**
 * ============================================================================
 * ROMANTIC PROPOSAL CONTROLLER v2.0
 * ─────────────────────────────────────────────────────────────────────────────
 * Modules (all self-contained, boot after DOMContentLoaded):
 *
 *  1. LoadingScreen       — fake progress bar, then reveals the page
 *  2. MagneticCursor      — custom dot + ring that tracks the mouse
 *  3. TypewriterHero      — cycles romantic phrases in the hero h1
 *  4. ScrollReveal        — IntersectionObserver for .reveal-* classes
 *  5. CounterAnimator     — animates stat numbers when scrolled into view
 *  6. TimelineUnlock      — sequential chapter unlock on button click
 *  7. RingBoxController   — opens the CSS ring box on scroll into view
 *  8. LoveTickerAnimator  — staggered fade-cycle for ticker words
 *  9. NoButtonDodger      — playful dodging "No" button
 * 10. YesCelebration      — confetti, petals, hearts, love letter reveal
 * 11. MusicSynth          — procedural Web Audio music box / ambient piano
 * 12. CursorTrail         — emoji trail following mouse / touch
 * 13. KeyboardNav         — arrow / space shortcuts
 * ============================================================================
 */

(function () {
    'use strict';

    /* ══════════════════════════════════════════════════════════════════════════
       UTILITY HELPERS
       ══════════════════════════════════════════════════════════════════════════ */

    const $ = id => document.getElementById(id);
    const $$ = sel => document.querySelectorAll(sel);

    function lerp(a, b, t) { return a + (b - a) * t; }

    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

    /* ══════════════════════════════════════════════════════════════════════════
       1. LOADING SCREEN
       ══════════════════════════════════════════════════════════════════════════ */
    (function LoadingScreen() {
        const screen = $('loading-screen');
        const fill   = $('loaderFill');
        if (!screen) return;

        let progress = 0;
        const target = { val: 0 };

        // Simulate asset loading progress
        const milestones = [
            { pct: 30,  delay: 200  },
            { pct: 60,  delay: 500  },
            { pct: 85,  delay: 900  },
            { pct: 100, delay: 1400 }
        ];

        milestones.forEach(m => {
            setTimeout(() => { target.val = m.pct; }, m.delay);
        });

        const tick = setInterval(() => {
            progress = lerp(progress, target.val, 0.12);
            if (fill) fill.style.width = progress.toFixed(1) + '%';

            if (progress >= 99) {
                clearInterval(tick);
                setTimeout(() => {
                    screen.classList.add('hidden');
                    // Trigger hero entrance after loader
                    document.body.classList.add('loaded');
                }, 300);
            }
        }, 16);
    })();

    /* ══════════════════════════════════════════════════════════════════════════
       2. MAGNETIC CURSOR
       ══════════════════════════════════════════════════════════════════════════ */
    (function MagneticCursor() {
        const dot  = $('cursor-dot');
        const ring = $('cursor-ring');
        if (!dot || !ring) return;

        // Only active on non-touch devices
        if (window.matchMedia('(pointer: coarse)').matches) return;

        let mx = -100, my = -100;
        let rx = -100, ry = -100;

        window.addEventListener('mousemove', e => {
            mx = e.clientX;
            my = e.clientY;
        });

        window.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
        window.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'));

        // Hover detection
        document.addEventListener('mouseover', e => {
            const el = e.target.closest('button, a, [data-next], .timeline-card, .media-frame');
            if (el) document.body.classList.add('cursor-hover');
        });
        document.addEventListener('mouseout', e => {
            const el = e.target.closest('button, a, [data-next], .timeline-card, .media-frame');
            if (el) document.body.classList.remove('cursor-hover');
        });

        (function animCursor() {
            // Dot follows instantly
            dot.style.left = mx + 'px';
            dot.style.top  = my + 'px';

            // Ring lags behind
            rx = lerp(rx, mx, 0.14);
            ry = lerp(ry, my, 0.14);
            ring.style.left = rx + 'px';
            ring.style.top  = ry + 'px';

            requestAnimationFrame(animCursor);
        })();
    })();

    /* ══════════════════════════════════════════════════════════════════════════
       3. TYPEWRITER HERO
       ══════════════════════════════════════════════════════════════════════════ */
    (function TypewriterHero() {
        const el = $('typedText');
        if (!el) return;

        const phrases = [
            'it all belongs to you.',
            'you are my everything.',
            'you are my home.',
            'you are my forever.',
            'my heart beats for you.',
            'you are my answered prayer.',
        ];

        let phraseIdx = 0;
        let charIdx   = 0;
        let deleting  = false;
        let pauseTicks = 0;

        const PAUSE_AFTER_TYPE   = 55;  // frames to wait after full phrase
        const PAUSE_AFTER_DELETE = 12;

        function tick() {
            const phrase = phrases[phraseIdx];

            if (!deleting && charIdx <= phrase.length) {
                el.textContent = phrase.slice(0, charIdx);
                charIdx++;

                if (charIdx > phrase.length) {
                    // Finished typing — pause
                    pauseTicks = PAUSE_AFTER_TYPE;
                    deleting = true;
                    setTimeout(tick, pauseTicks * 16);
                    return;
                }
                setTimeout(tick, 55 + Math.random() * 40);

            } else if (deleting && charIdx >= 0) {
                el.textContent = phrase.slice(0, charIdx);
                charIdx--;

                if (charIdx < 0) {
                    deleting   = false;
                    phraseIdx  = (phraseIdx + 1) % phrases.length;
                    charIdx    = 0;
                    setTimeout(tick, PAUSE_AFTER_DELETE * 16);
                    return;
                }
                setTimeout(tick, 28 + Math.random() * 18);
            }
        }

        // Start after the loading screen finishes (~1.7s)
        setTimeout(tick, 1800);
    })();

    /* ══════════════════════════════════════════════════════════════════════════
       4. SCROLL REVEAL  (IntersectionObserver)
       ══════════════════════════════════════════════════════════════════════════ */
    (function ScrollReveal() {
        const targets = $$('.reveal-up, .reveal-left, .reveal-right, .reveal-scale');
        if (!targets.length) return;

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Only animate once
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        targets.forEach(el => observer.observe(el));
    })();

    /* ══════════════════════════════════════════════════════════════════════════
       5. COUNTER ANIMATOR
       ══════════════════════════════════════════════════════════════════════════ */
    (function CounterAnimator() {
        const counters = $$('[data-count]');
        if (!counters.length) return;

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el  = entry.target;
                const end = parseInt(el.dataset.count, 10);
                // Special ∞ counter
                if (el.dataset.count === '999') {
                    setTimeout(() => { el.textContent = '∞'; }, 600);
                    observer.unobserve(el);
                    return;
                }
                animateCount(el, 0, end, 1600);
                observer.unobserve(el);
            });
        }, { threshold: 0.5 });

        counters.forEach(el => observer.observe(el));

        function animateCount(el, from, to, duration) {
            const start = performance.now();
            // easeOutExpo
            function step(now) {
                const elapsed  = now - start;
                const progress = clamp(elapsed / duration, 0, 1);
                const eased    = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                const value    = Math.round(from + (to - from) * eased);
                el.textContent = value.toLocaleString();
                if (progress < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
        }
    })();

    /* ══════════════════════════════════════════════════════════════════════════
       6. TIMELINE UNLOCK
       ══════════════════════════════════════════════════════════════════════════ */
    (function TimelineUnlock() {
        const buttons = $$('.btn-chapter-next');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.dataset.next;
                const target   = $(targetId);

                if (!target) {
                    // "One last question" — scroll to proposal
                    const proposal = $('proposal-section');
                    if (proposal) {
                        proposal.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                    return;
                }

                // Unlock & reveal the target chapter
                target.classList.remove('locked');
                target.classList.add('unlocked');

                // Smooth scroll to it after a brief moment
                setTimeout(() => {
                    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 150);

                // Trigger a small petal burst on each chapter reveal
                if (window.romanticEngine) {
                    window.romanticEngine.triggerPetalBurst(50);
                }

                // Ripple click animation on the button itself
                _ripple(btn);

                // Animate the unlocked card in with a scale-bounce
                const card = target.querySelector('.card-inner');
                if (card) {
                    card.style.transition = 'none';
                    card.style.transform  = 'scale(0.88)';
                    requestAnimationFrame(() => {
                        card.style.transition = 'transform 0.65s cubic-bezier(0.175,0.885,0.32,1.275)';
                        card.style.transform  = 'scale(1)';
                    });
                }

                initAudioOnInteraction();
            });
        });

        function _ripple(btn) {
            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position:absolute; border-radius:50%;
                width:10px; height:10px;
                background:rgba(255,255,255,0.45);
                top:50%; left:50%;
                transform:translate(-50%,-50%) scale(0);
                animation:rippleAnim 0.55s ease forwards;
                pointer-events:none;
            `;
            if (!document.getElementById('ripple-kf')) {
                const style = document.createElement('style');
                style.id = 'ripple-kf';
                style.textContent = '@keyframes rippleAnim{to{transform:translate(-50%,-50%) scale(18);opacity:0}}';
                document.head.appendChild(style);
            }
            btn.style.position = 'relative';
            btn.style.overflow = 'hidden';
            btn.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        }
    })();

    /* ══════════════════════════════════════════════════════════════════════════
       7. RING BOX CONTROLLER
       ══════════════════════════════════════════════════════════════════════════ */
    (function RingBoxController() {
        const scene = $('ringBoxScene');
        const box   = $('ringBox');
        if (!scene || !box) return;

        let opened = false;

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !opened) {
                    opened = true;
                    // Dramatic delay before opening
                    setTimeout(() => {
                        box.classList.add('open');
                        // Small screen shake on open
                        scene.animate([
                            { transform: 'translateX(-4px)' },
                            { transform: 'translateX(4px)'  },
                            { transform: 'translateX(-3px)' },
                            { transform: 'translateX(0)'    }
                        ], { duration: 350, easing: 'ease-out' });
                    }, 550);

                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(scene);

        // Allow clicking the box to open/close it again
        scene.addEventListener('click', () => {
            box.classList.toggle('open');
            if (window.romanticEngine) window.romanticEngine.triggerPetalBurst(20);
        });
    })();

    /* ══════════════════════════════════════════════════════════════════════════
       8. LOVE TICKER ANIMATOR
       ══════════════════════════════════════════════════════════════════════════ */
    (function LoveTickerAnimator() {
        const ticker = $('loveTicker');
        if (!ticker) return;

        const words = ticker.querySelectorAll('.tick-word');
        if (!words.length) return;

        // Each word animates with a staggered delay that repeats
        words.forEach((w, i) => {
            w.style.animationDelay = (i * 1.8) + 's';
            w.style.animationDuration = (words.length * 1.8) + 's';
        });
    })();

    /* ══════════════════════════════════════════════════════════════════════════
       9. NO BUTTON DODGER
       ══════════════════════════════════════════════════════════════════════════ */
    (function NoButtonDodger() {
        const btnNo   = $('btnNo');
        const btnYes  = $('btnYes');
        const toast   = $('noToast');
        const wrapper = $('noWrapper');
        if (!btnNo) return;

        const responses = [
            "Nice try! 💕",
            "Error 404: 'No' not found! 🥰",
            "Destiny says YES! ✨",
            "The button is shy! 🙈",
            "You can't resist! 😘",
            "Are you sure? Try again 😉",
            "It's written in the stars! 🌟",
            "Resistance is futile, my love! ❤️",
            "One right answer only! 💍",
            "Almost... but not quite! 🏃💨",
            "Your heart knows the answer 💖",
        ];

        let dodges    = 0;
        let toastTimer;

        function dodge(e) {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            dodges++;

            // Compute a random escape translation clamped to viewport
            const safeW = Math.min(200, window.innerWidth  / 2 - 80);
            const safeH = Math.min(120, window.innerHeight / 2 - 60);

            let dx = (Math.random() - 0.5) * safeW * 2;
            let dy = (Math.random() - 0.5) * safeH * 2;

            // Ensure minimum travel distance
            if (Math.abs(dx) < 55) dx = dx >= 0 ?  70 : -70;
            if (Math.abs(dy) < 35) dy = dy >= 0 ?  45 : -45;

            if (wrapper) {
                wrapper.style.transition = 'transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275)';
                wrapper.style.transform  = `translate(${dx}px, ${dy}px) scale(${Math.max(0.7, 1 - dodges * 0.04)})`;
            }

            // YES button grows more irresistible with each dodge
            if (btnYes) {
                const scale = Math.min(1.45, 1 + dodges * 0.045);
                btnYes.style.transform = `scale(${scale})`;
            }

            showToast(responses[Math.floor(Math.random() * responses.length)]);
            initAudioOnInteraction();
        }

        function showToast(msg) {
            if (!toast) return;
            toast.textContent = msg;
            toast.classList.add('show');
            clearTimeout(toastTimer);
            toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
        }

        // Desktop hover escape
        btnNo.addEventListener('mouseenter', dodge);
        // Mobile touch escape
        btnNo.addEventListener('touchstart', dodge, { passive: false });
        // Click (fallback if somehow clicked)
        btnNo.addEventListener('click',      dodge);
    })();

    /* ══════════════════════════════════════════════════════════════════════════
       10. YES — GRAND CELEBRATION
       ══════════════════════════════════════════════════════════════════════════ */
    (function YesCelebration() {
        const btnYes = $('btnYes');
        const modal  = $('celebrationModal');
        const overlay = $('modalOverlay');
        const btnClose = $('btnCloseModal');
        const btnPetals = $('btnShowerPetals');
        const sigDate   = $('sigDate');

        if (!btnYes) return;

        btnYes.addEventListener('click', () => {
            initAudioOnInteraction();

            // 1. Three.js celebration (petals + hearts)
            if (window.romanticEngine) {
                window.romanticEngine.triggerCelebration();
            }

            // 2. Multi-burst canvas confetti
            triggerConfetti();

            // 3. Fanfare chord
            playCelebrationFanfare();

            // 4. Fill in today's date
            if (sigDate) {
                const opts = { year: 'numeric', month: 'long', day: 'numeric' };
                sigDate.innerHTML = new Date().toLocaleDateString(undefined, opts) + ' &bull; Forever &amp; Always 💕';
            }

            // 5. Open love letter after short delay
            setTimeout(() => {
                if (modal) modal.classList.add('open');
            }, 1100);

            // Button feedback
            btnYes.style.transform = 'scale(0.92)';
            setTimeout(() => { btnYes.style.transform = ''; }, 250);
        });

        if (btnPetals) {
            btnPetals.addEventListener('click', () => {
                if (window.romanticEngine) window.romanticEngine.triggerPetalBurst(100);
                triggerConfetti();
            });
        }

        function closeModal() {
            if (modal) modal.classList.remove('open');
        }

        if (btnClose)  btnClose.addEventListener('click',  closeModal);
        if (overlay)   overlay.addEventListener('click',   closeModal);

        // ── Confetti explosions ──
        function triggerConfetti() {
            if (typeof confetti !== 'function') return;

            const colors = ['#ff0055', '#ff4d6d', '#ff758f', '#ffd166', '#ffffff', '#c9184a', '#c084fc'];

            function fire(ratio, opts) {
                confetti(Object.assign({
                    particleCount: Math.floor(200 * ratio),
                    origin: { y: 0.7 },
                    zIndex: 1500
                }, opts));
            }

            fire(0.25, { spread: 26, startVelocity: 55, colors });
            fire(0.20, { spread: 60, colors });
            fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors });
            fire(0.10, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, shapes: ['circle'], colors: ['#ffd166', '#ffb3c1'] });
            fire(0.10, { spread: 120, startVelocity: 45, colors });

            // Sustained bursts for 4 s
            const end = Date.now() + 4000;
            const id  = setInterval(() => {
                if (Date.now() > end) { clearInterval(id); return; }
                confetti({
                    startVelocity: 28,
                    spread: 360,
                    ticks: 55,
                    origin: { x: Math.random(), y: Math.random() * 0.55 },
                    colors,
                    zIndex: 1500
                });
            }, 320);
        }
    })();

    /* ══════════════════════════════════════════════════════════════════════════
       11. MUSIC SYNTHESIZER  (100% offline, Web Audio API)
       ─────────────────────────────────────────────────────────────────────────
       Romantic arpeggiator: D Major → A Major → B Minor → G Major
       Music box timbre: sine + triangle + slight reverb
       ══════════════════════════════════════════════════════════════════════════ */
    let audioCtx       = null;
    let musicPlaying   = false;
    let musicInterval  = null;
    let chordIdx       = 0;
    let noteIdx        = 0;
    let reverbNode     = null;

    // D Maj → A Maj → B min → G Maj (frequencies in Hz)
    const CHORDS = [
        [293.66, 369.99, 440.00, 587.33],   // D Major
        [220.00, 277.18, 329.63, 440.00],   // A Major
        [246.94, 293.66, 369.99, 493.88],   // B Minor
        [196.00, 246.94, 293.66, 392.00]    // G Major
    ];

    function initAudio() {
        if (audioCtx) {
            if (audioCtx.state === 'suspended') audioCtx.resume();
            return;
        }
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        audioCtx = new Ctx();

        // Simple convolver reverb (impulse built from noise)
        try {
            const bufLen  = audioCtx.sampleRate * 1.8;
            const buf     = audioCtx.createBuffer(2, bufLen, audioCtx.sampleRate);
            for (let ch = 0; ch < 2; ch++) {
                const data = buf.getChannelData(ch);
                for (let i = 0; i < bufLen; i++) {
                    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 2.5);
                }
            }
            reverbNode = audioCtx.createConvolver();
            reverbNode.buffer = buf;
            reverbNode.connect(audioCtx.destination);
        } catch (_) {
            reverbNode = null;
        }
    }

    function playNote(freq, delay = 0, duration = 2.5, gain = 0.13) {
        if (!audioCtx || !musicPlaying) return;
        const now = audioCtx.currentTime + delay;

        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const g    = audioCtx.createGain();
        const lpf  = audioCtx.createBiquadFilter();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq, now);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq * 2.002, now);  // slight detune

        lpf.type                  = 'lowpass';
        lpf.frequency.setValueAtTime(1200, now);
        lpf.Q.setValueAtTime(1.8, now);

        // Bell-like attack and slow romantic decay
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(gain, now + 0.035);
        g.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc1.connect(lpf);
        osc2.connect(lpf);
        lpf.connect(g);
        g.connect(audioCtx.destination);

        // Wet reverb send
        if (reverbNode) {
            const wetGain = audioCtx.createGain();
            wetGain.gain.setValueAtTime(0.18, now);
            g.connect(wetGain);
            wetGain.connect(reverbNode);
        }

        osc1.start(now); osc1.stop(now + duration);
        osc2.start(now); osc2.stop(now + duration);
    }

    function stepArpeggio() {
        if (!musicPlaying) return;
        const chord = CHORDS[chordIdx];
        const freq  = chord[noteIdx];

        playNote(freq, 0, 2.3, 0.13);

        // Bass warmth on beat 1
        if (noteIdx === 0) {
            playNote(freq / 2, 0, 3.2, 0.17);
        }
        // Occasional high sparkle
        if (noteIdx === 2 && Math.random() > 0.5) {
            playNote(freq * 2, 0.18, 1.4, 0.06);
        }

        noteIdx++;
        if (noteIdx >= chord.length) {
            noteIdx  = 0;
            chordIdx = (chordIdx + 1) % CHORDS.length;
        }
    }

    function toggleMusic() {
        initAudio();
        if (musicPlaying) {
            musicPlaying = false;
            clearInterval(musicInterval);
            const toggle = $('musicToggle');
            if (toggle) toggle.classList.remove('playing');
        } else {
            musicPlaying = true;
            stepArpeggio();
            musicInterval = setInterval(stepArpeggio, 460);
            const toggle = $('musicToggle');
            if (toggle) toggle.classList.add('playing');
        }
    }

    function playCelebrationFanfare() {
        initAudio();
        if (!audioCtx) return;
        // D5 F#5 A5 D6 ascending fanfare
        const notes = [587.33, 739.99, 880.00, 1174.66];
        notes.forEach((freq, i) => {
            const now = audioCtx.currentTime + i * 0.11;
            const o   = audioCtx.createOscillator();
            const g   = audioCtx.createGain();
            o.type    = 'triangle';
            o.frequency.setValueAtTime(freq, now);
            g.gain.setValueAtTime(0.001, now);
            g.gain.exponentialRampToValueAtTime(0.22, now + 0.045);
            g.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);
            o.connect(g);
            g.connect(audioCtx.destination);
            o.start(now);
            o.stop(now + 3.2);
        });
    }

    function initAudioOnInteraction() {
        initAudio();
        if (!musicPlaying) toggleMusic();
    }

    // Music toggle button
    const musicBtn = $('musicToggle');
    if (musicBtn) musicBtn.addEventListener('click', toggleMusic);

    // Auto-start music on first any-click
    document.addEventListener('click', function once() {
        initAudio();
        document.removeEventListener('click', once);
    }, { once: true });

    /* ══════════════════════════════════════════════════════════════════════════
       12. CURSOR / TOUCH TRAIL
       ══════════════════════════════════════════════════════════════════════════ */
    (function CursorTrail() {
        const layer = $('fx-layer');
        if (!layer) return;

        const emojis   = ['💖', '✨', '🌸', '💫', '💕', '🌹', '⭐', '🦋'];
        let lastTime   = 0;
        const THROTTLE = 65; // ms between particles

        function spawn(x, y) {
            const now = Date.now();
            if (now - lastTime < THROTTLE) return;
            lastTime = now;

            const p  = document.createElement('div');
            p.className = 'trail-particle';
            p.textContent = emojis[Math.floor(Math.random() * emojis.length)];

            const dx = (Math.random() - 0.5) * 40;
            const dr = (Math.random() - 0.5) * 70;
            p.style.left = x + 'px';
            p.style.top  = y + 'px';
            p.style.setProperty('--dx', dx + 'px');
            p.style.setProperty('--dr', dr + 'deg');

            layer.appendChild(p);
            setTimeout(() => p.parentNode && p.parentNode.removeChild(p), 1100);
        }

        window.addEventListener('mousemove',  e => spawn(e.clientX, e.clientY));
        window.addEventListener('touchmove',  e => {
            if (e.touches[0]) spawn(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: true });
    })();

    /* ══════════════════════════════════════════════════════════════════════════
       13. KEYBOARD NAVIGATION
       ══════════════════════════════════════════════════════════════════════════ */
    (function KeyboardNav() {
        window.addEventListener('keydown', e => {
            const modal = $('celebrationModal');

            if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
                modal.classList.remove('open');
                return;
            }

            // Space / ArrowDown — scroll hero into the timeline
            if ((e.key === ' ' || e.key === 'ArrowDown') && !e.target.closest('button, input, textarea')) {
                e.preventDefault();
                const section = document.getElementById('timelineSection') || document.getElementById('statsBar');
                if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }

            // M — toggle music
            if (e.key === 'm' || e.key === 'M') toggleMusic();
        });
    })();

    /* ══════════════════════════════════════════════════════════════════════════
       HERO SCROLL CTA
       ══════════════════════════════════════════════════════════════════════════ */
    const scrollCta = $('heroScrollCta');
    if (scrollCta) {
        scrollCta.addEventListener('click', () => {
            const target = $('statsBar') || $('timelineSection');
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            initAudioOnInteraction();
        });
    }

    /* ══════════════════════════════════════════════════════════════════════════
       PROPOSAL SECTION — auto-reveal reveal-scale on scroll
       ══════════════════════════════════════════════════════════════════════════ */
    (function ProposalReveal() {
        const el = document.querySelector('.proposal-container');
        if (!el) return;

        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('visible');
                    obs.unobserve(e.target);
                }
            });
        }, { threshold: 0.15 });

        obs.observe(el);
    })();

})();
