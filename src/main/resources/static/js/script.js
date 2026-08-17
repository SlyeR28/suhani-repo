/**
 * ============================================================================
 * ROMANTIC PROPOSAL INTERACTIVE CONTROLLER
 * Handles:
 * 1. Step-by-step 3D story card transitions & progress tracking
 * 2. Playful dodging "No" button physics & funny toasts
 * 3. Grand "YES!" celebration (confetti explosions, petal storms, love letter modal)
 * 4. Romantic Web Audio procedural music box / ambient melody synthesizer
 * 5. Interactive touch & mouse cursor sparkling trail
 * ============================================================================
 */

(function () {
    'use strict';

    // State Variables
    let currentStep = 1;
    const totalSteps = 4;
    let dodgeCount = 0;
    let isMusicPlaying = false;
    let audioCtx = null;
    let musicInterval = null;

    // DOM Elements
    const cards = document.querySelectorAll('.story-card');
    const stepIndicators = document.querySelectorAll('.step-indicator');
    const progressFill = document.getElementById('progressFill');
    const btnYes = document.getElementById('btnYes');
    const btnNo = document.getElementById('btnNo');
    const noToast = document.getElementById('noToast');
    const celebrationModal = document.getElementById('celebrationModal');
    const btnCloseModal = document.getElementById('btnCloseModal');
    const btnShowerPetals = document.getElementById('btnShowerPetals');
    const currentDateEl = document.getElementById('currentDate');
    const musicToggle = document.getElementById('musicToggle');
    const touchFxContainer = document.getElementById('touch-fx-container');

    // Playful dodge responses
    const noResponses = [
        "Nice try! 💕",
        "Are you sure? Try again! 😉",
        "The button is shy! 🙈",
        "Error 404: 'No' not found! 🥰",
        "There's only one right answer! 💍",
        "Nope, destiny says YES! ✨",
        "You can't resist my charm! 😘",
        "Almost got it... but not quite! 🏃💨",
        "It is written in the stars! 🌟",
        "Resistance is futile, my love! ❤️"
    ];

    /* ==========================================================================
       1. STEP NAVIGATION & STORY PROGRESSION
       ========================================================================== */

    function goToStep(targetStep) {
        if (targetStep < 1 || targetStep > totalSteps || targetStep === currentStep) return;

        const currentCard = document.getElementById(`card-${currentStep}`);
        const nextCard = document.getElementById(`card-${targetStep}`);

        if (!currentCard || !nextCard) return;

        // Animate exit of current card
        currentCard.classList.remove('active');
        currentCard.classList.add('exit-left');

        setTimeout(() => {
            currentCard.classList.remove('exit-left');
        }, 700);

        // Animate enter of target card
        nextCard.classList.add('active');

        // Update progress bar
        currentStep = targetStep;
        updateProgressBar();

        // Trigger realistic 3D Petal Burst from Three.js engine
        if (window.romanticPetalsEngine && typeof window.romanticPetalsEngine.triggerPetalBurst === 'function') {
            window.romanticPetalsEngine.triggerPetalBurst(50);
        }
    }

    function updateProgressBar() {
        // Progress fill percentage (25%, 50%, 75%, 100%)
        const percentage = (currentStep / totalSteps) * 100;
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }

        // Update step indicators
        stepIndicators.forEach((ind) => {
            const stepNum = parseInt(ind.getAttribute('data-step'), 10);
            ind.classList.remove('active', 'completed');

            if (stepNum === currentStep) {
                ind.classList.add('active');
            } else if (stepNum < currentStep) {
                ind.classList.add('completed');
            }
        });
    }

    // Attach listeners to all "Next Step" buttons
    document.querySelectorAll('.next-step-btn').forEach((button) => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const target = parseInt(button.getAttribute('data-target'), 10);
            goToStep(target);
            initAudioOnFirstInteraction();
        });
    });

    // Allow clicking on previous step indicators in the header
    stepIndicators.forEach((ind) => {
        ind.addEventListener('click', () => {
            const target = parseInt(ind.getAttribute('data-step'), 10);
            if (target <= currentStep) {
                goToStep(target);
            }
        });
    });

    /* ==========================================================================
       2. PLAYFUL DODGING "NO" BUTTON
       ========================================================================== */

    function dodgeNoButton(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        dodgeCount++;

        // Calculate random evasive coordinates within safe visible boundaries
        const arena = btnNo.parentElement;
        const arenaRect = arena.getBoundingClientRect();
        const btnRect = btnNo.getBoundingClientRect();

        const maxX = Math.min(180, (window.innerWidth - btnRect.width) / 2 - 20);
        const maxY = 90;

        let randX = (Math.random() - 0.5) * (maxX * 2);
        let randY = (Math.random() - 0.5) * (maxY * 2);

        // Ensure button moves at least 60px away
        if (Math.abs(randX) < 40) randX = randX >= 0 ? 65 : -65;
        if (Math.abs(randY) < 30) randY = randY >= 0 ? 45 : -45;

        btnNo.style.position = 'relative';
        btnNo.style.transition = 'transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        btnNo.style.transform = `translate(${randX}px, ${randY}px) scale(0.9)`;

        // Gradually grow the "YES" button to make it even more irresistible!
        if (btnYes) {
            const yesScale = Math.min(1.35, 1 + dodgeCount * 0.05);
            btnYes.style.transform = `scale(${yesScale})`;
        }

        // Show playful toast message
        showNoToast();
    }

    let toastTimer = null;
    function showNoToast() {
        if (!noToast) return;
        const randomMsg = noResponses[Math.floor(Math.random() * noResponses.length)];
        noToast.textContent = randomMsg;
        noToast.classList.add('show');

        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            noToast.classList.remove('show');
        }, 2200);
    }

    if (btnNo) {
        // Desktop hover dodge
        btnNo.addEventListener('mouseenter', dodgeNoButton);
        btnNo.addEventListener('mouseover', dodgeNoButton);

        // Mobile touch & click dodge
        btnNo.addEventListener('touchstart', dodgeNoButton, { passive: false });
        btnNo.addEventListener('click', dodgeNoButton);
    }

    /* ==========================================================================
       3. GRAND "YES!" PROPOSAL CELEBRATION
       ========================================================================== */

    function celebrateYes() {
        // 1. Trigger massive 3D Petal Storm & Floating 3D Hearts in Three.js
        if (window.romanticPetalsEngine && typeof window.romanticPetalsEngine.triggerCelebrationPetalStorm === 'function') {
            window.romanticPetalsEngine.triggerCelebrationPetalStorm();
        }

        // 2. Multi-Stage Canvas Confetti Fireworks
        triggerConfettiExplosion();

        // 3. Play happy musical chime chords
        playCelebrationFanfare();

        // 4. Update date in love letter
        if (currentDateEl) {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const today = new Date().toLocaleDateString(undefined, options);
            currentDateEl.innerHTML = `${today} &bull; Forever &amp; Always 💕`;
        }

        // 5. Reveal Grand Love Letter Modal with elegant delay
        setTimeout(() => {
            if (celebrationModal) {
                celebrationModal.classList.add('open');
            }
        }, 1200);
    }

    function triggerConfettiExplosion() {
        if (typeof confetti !== 'function') return;

        const count = 200;
        const defaults = {
            origin: { y: 0.7 },
            zIndex: 1500
        };

        function fire(particleRatio, opts) {
            confetti(Object.assign({}, defaults, opts, {
                particleCount: Math.floor(count * particleRatio)
            }));
        }

        // Luxurious golden and romantic crimson color palette
        const romanticColors = ['#ff0055', '#ff4d6d', '#ff758f', '#ffd166', '#ffffff', '#c9184a'];

        fire(0.25, {
            spread: 26,
            startVelocity: 55,
            colors: romanticColors
        });
        fire(0.2, {
            spread: 60,
            colors: romanticColors
        });
        fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8,
            colors: romanticColors
        });
        fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2,
            shapes: ['circle', 'square'],
            colors: ['#ffd166', '#ffb3c1']
        });
        fire(0.1, {
            spread: 120,
            startVelocity: 45,
            colors: romanticColors
        });

        // Continuous celebratory confetti bursts for 4 seconds
        const end = Date.now() + 3500;
        const interval = setInterval(function () {
            if (Date.now() > end) {
                return clearInterval(interval);
            }
            confetti({
                startVelocity: 30,
                spread: 360,
                ticks: 60,
                origin: { x: Math.random(), y: Math.random() * 0.5 },
                colors: romanticColors,
                zIndex: 1500
            });
        }, 350);
    }

    if (btnYes) {
        btnYes.addEventListener('click', () => {
            initAudioOnFirstInteraction();
            celebrateYes();
        });
    }

    if (btnShowerPetals) {
        btnShowerPetals.addEventListener('click', () => {
            if (window.romanticPetalsEngine && typeof window.romanticPetalsEngine.triggerPetalBurst === 'function') {
                window.romanticPetalsEngine.triggerPetalBurst(100);
            }
            triggerConfettiExplosion();
        });
    }

    if (btnCloseModal) {
        btnCloseModal.addEventListener('click', () => {
            if (celebrationModal) {
                celebrationModal.classList.remove('open');
            }
        });
    }

    // Close modal on backdrop click
    if (celebrationModal) {
        const backdrop = celebrationModal.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.addEventListener('click', () => {
                celebrationModal.classList.remove('open');
            });
        }
    }

    /* ==========================================================================
       4. ROMANTIC PROCEDURAL WEB AUDIO SYNTHESIZER
       Harmonic dreamy music box / acoustic piano arpeggiator in D Major
       100% offline, zero network dependencies, buttery smooth audio
       ========================================================================== */

    function initAudioContext() {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                audioCtx = new AudioContextClass();
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    // Musical frequencies for romantic progression (D Maj - A Maj - B min - G Maj)
    const romanticChords = [
        [293.66, 369.99, 440.00, 587.33], // D Major
        [220.00, 277.18, 329.63, 440.00], // A Major
        [246.94, 293.66, 369.99, 493.88], // B Minor
        [196.00, 246.94, 293.66, 392.00]  // G Major
    ];

    let chordIndex = 0;
    let noteIndex = 0;

    function playMusicBoxNote(freq, timeOffset = 0, duration = 2.5, velocity = 0.15) {
        if (!audioCtx || !isMusicPlaying) return;

        const now = audioCtx.currentTime + timeOffset;

        // Primary bell tone
        const osc = audioCtx.createOscillator();
        const oscHarmonic = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        oscHarmonic.type = 'triangle';
        oscHarmonic.frequency.setValueAtTime(freq * 2, now);

        // Low-pass filter for cozy intimate warmth
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, now);
        filter.Q.setValueAtTime(2, now);

        // Organic envelope (instant attack, slow romantic bell decay)
        gainNode.gain.setValueAtTime(0.0001, now);
        gainNode.gain.exponentialRampToValueAtTime(velocity, now + 0.04);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(filter);
        oscHarmonic.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc.start(now);
        oscHarmonic.start(now);
        osc.stop(now + duration);
        oscHarmonic.stop(now + duration);
    }

    function scheduleArpeggioStep() {
        if (!isMusicPlaying) return;

        const chord = romanticChords[chordIndex];
        const note = chord[noteIndex];

        // Play root note with subtle sparkle octave
        playMusicBoxNote(note, 0, 2.2, 0.14);

        if (noteIndex === 0) {
            // Bass warmth on first beat
            playMusicBoxNote(note / 2, 0, 3.0, 0.18);
        }

        noteIndex++;
        if (noteIndex >= chord.length) {
            noteIndex = 0;
            chordIndex = (chordIndex + 1) % romanticChords.length;
        }
    }

    function toggleMusic() {
        initAudioContext();

        if (isMusicPlaying) {
            isMusicPlaying = false;
            clearInterval(musicInterval);
            if (musicToggle) musicToggle.classList.remove('playing');
        } else {
            isMusicPlaying = true;
            if (musicToggle) musicToggle.classList.add('playing');

            // Play immediate first chord
            scheduleArpeggioStep();
            musicInterval = setInterval(scheduleArpeggioStep, 450);
        }
    }

    function playCelebrationFanfare() {
        initAudioContext();
        if (!audioCtx) return;

        // Bright joyous major fanfare chord (D5, F#5, A5, D6)
        const fanfareNotes = [587.33, 739.99, 880.00, 1174.66];
        fanfareNotes.forEach((freq, idx) => {
            const now = audioCtx.currentTime + idx * 0.12;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(0.001, now);
            gain.gain.exponentialRampToValueAtTime(0.2, now + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start(now);
            osc.stop(now + 3.0);
        });
    }

    if (musicToggle) {
        musicToggle.addEventListener('click', toggleMusic);
    }

    function initAudioOnFirstInteraction() {
        initAudioContext();
        if (!isMusicPlaying) {
            toggleMusic();
        }
    }

    // Start audio on first user tap/click on the page
    document.body.addEventListener('click', function onceClick() {
        initAudioContext();
        document.body.removeEventListener('click', onceClick);
    }, { once: true });

    /* ==========================================================================
       5. INTERACTIVE TOUCH & CURSOR TRAIL PARTICLES
       ========================================================================== */

    let lastTrailTime = 0;
    const trailEmojis = ['💖', '✨', '🌸', '💫', '💕', '🌹'];

    function createTrailParticle(x, y) {
        if (!touchFxContainer) return;
        const now = performance.now();
        if (now - lastTrailTime < 70) return; // Throttled to 14 particles/sec
        lastTrailTime = now;

        const particle = document.createElement('div');
        particle.className = 'trail-particle';
        particle.textContent = trailEmojis[Math.floor(Math.random() * trailEmojis.length)];

        const offsetX = (Math.random() - 0.5) * 30;
        const rotate = (Math.random() - 0.5) * 60;

        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.setProperty('--tx', `${offsetX}px`);
        particle.style.setProperty('--tr', `${rotate}deg`);

        touchFxContainer.appendChild(particle);

        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 1000);
    }

    window.addEventListener('mousemove', (e) => {
        createTrailParticle(e.clientX, e.clientY);
    });

    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            createTrailParticle(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });

    /* ==========================================================================
       6. KEYBOARD NAVIGATION
       ========================================================================== */

    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'Space') {
            if (currentStep < totalSteps) {
                goToStep(currentStep + 1);
            }
        } else if (e.key === 'ArrowLeft') {
            if (currentStep > 1) {
                goToStep(currentStep - 1);
            }
        } else if (e.key === 'Escape') {
            if (celebrationModal && celebrationModal.classList.contains('open')) {
                celebrationModal.classList.remove('open');
            }
        }
    });

})();
