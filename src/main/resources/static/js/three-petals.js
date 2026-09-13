/**
 * ============================================================================
 * ROMANTIC 3D ENGINE v2.0
 * ─────────────────────────────────────────────────────────────────────────────
 * Modules:
 *   1. GalaxyEngine     — star field + shooting stars on the galaxy canvas
 *   2. RingScene3D      — animated 3D diamond ring floating in the hero
 *   3. PetalsEngine     — Three.js curved botanical petals (ambient + burst)
 *   4. HeartEngine      — extruded 3D hearts spawned on celebration
 *   5. Public API       — window.romanticEngine (used by script.js)
 * ============================================================================
 */

'use strict';

/* ─────────────────────────────────────────────────────────────────────────────
   1. GALAXY ENGINE  (canvas 2D — lightweight, runs behind everything)
───────────────────────────────────────────────────────────────────────────── */
class GalaxyEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx    = this.canvas.getContext('2d');
        this.stars  = [];
        this.shoots = [];
        this.nebula = [];
        this.raf    = null;

        this._resize();
        this._buildStars();
        this._buildNebula();
        this._loop();

        window.addEventListener('resize', () => {
            this._resize();
            this._buildStars();
            this._buildNebula();
        });

        // Spawn shooting star every 3–7 s
        this._scheduleShoot();
    }

    _resize() {
        this.W = this.canvas.width  = window.innerWidth;
        this.H = this.canvas.height = window.innerHeight;
    }

    _buildStars() {
        this.stars = [];
        const count = Math.floor((this.W * this.H) / 3800);
        for (let i = 0; i < count; i++) {
            this.stars.push({
                x:    Math.random() * this.W,
                y:    Math.random() * this.H,
                r:    0.3 + Math.random() * 1.4,
                base: 0.2 + Math.random() * 0.7,
                phase: Math.random() * Math.PI * 2,
                speed: 0.4 + Math.random() * 1.2,
                color: this._starColor()
            });
        }
    }

    _buildNebula() {
        this.nebula = [
            { x: this.W * 0.15, y: this.H * 0.20, rx: this.W * 0.35, ry: this.H * 0.30, color: 'rgba(255,61,107,0.055)' },
            { x: this.W * 0.80, y: this.H * 0.65, rx: this.W * 0.40, ry: this.H * 0.38, color: 'rgba(123,47,247,0.045)' },
            { x: this.W * 0.50, y: this.H * 0.50, rx: this.W * 0.30, ry: this.H * 0.35, color: 'rgba(255,209,102,0.030)' }
        ];
    }

    _starColor() {
        const p = Math.random();
        if (p < 0.10) return '#ffd166';   // gold
        if (p < 0.18) return '#ffb3c6';   // rose
        if (p < 0.24) return '#c084fc';   // violet
        return '#ffffff';
    }

    _scheduleShoot() {
        const delay = 3000 + Math.random() * 4000;
        setTimeout(() => {
            this._spawnShoot();
            this._scheduleShoot();
        }, delay);
    }

    _spawnShoot() {
        const angle   = (15 + Math.random() * 30) * (Math.PI / 180);
        const startX  = Math.random() * this.W;
        const startY  = Math.random() * (this.H * 0.45);
        const speed   = 14 + Math.random() * 12;
        const length  = 90 + Math.random() * 120;
        const palette = ['#ffffff', '#ffd166', '#ffb3c6', '#c084fc'];
        const color   = palette[Math.floor(Math.random() * palette.length)];

        this.shoots.push({
            x: startX, y: startY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            length, color,
            opacity: 1,
            life: 0,
            maxLife: 40 + Math.random() * 20
        });
    }

    _loop() {
        const { ctx, W, H } = this;
        const t = performance.now() * 0.001;

        ctx.clearRect(0, 0, W, H);

        // -- Deep space gradient
        const bg = ctx.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0,   '#080311');
        bg.addColorStop(0.5, '#0d0618');
        bg.addColorStop(1,   '#130822');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        // -- Nebula blobs
        for (const n of this.nebula) {
            const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.rx);
            g.addColorStop(0,   n.color);
            g.addColorStop(1,   'transparent');
            ctx.save();
            ctx.scale(1, n.ry / n.rx);
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(n.x, n.y * (n.rx / n.ry), n.rx, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // -- Stars (twinkle)
        for (const s of this.stars) {
            const alpha = s.base + (1 - s.base) * 0.5 * (1 + Math.sin(t * s.speed + s.phase));
            ctx.save();
            ctx.globalAlpha = alpha;
            // glow halo for bigger stars
            if (s.r > 1.0) {
                const halo = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4);
                halo.addColorStop(0, s.color);
                halo.addColorStop(1, 'transparent');
                ctx.fillStyle = halo;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.fillStyle = s.color;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // -- Shooting stars
        for (let i = this.shoots.length - 1; i >= 0; i--) {
            const s = this.shoots[i];
            s.life++;
            s.x += s.vx;
            s.y += s.vy;
            s.opacity = 1 - s.life / s.maxLife;

            if (s.life > s.maxLife || s.x > W + 200 || s.y > H + 100) {
                this.shoots.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.globalAlpha = s.opacity;
            const tail = ctx.createLinearGradient(
                s.x - s.vx * (s.length / 14), s.y - s.vy * (s.length / 14),
                s.x, s.y
            );
            tail.addColorStop(0, 'transparent');
            tail.addColorStop(1, s.color);
            ctx.strokeStyle = tail;
            ctx.lineWidth   = 1.5;
            ctx.shadowBlur  = 8;
            ctx.shadowColor = s.color;
            ctx.beginPath();
            ctx.moveTo(s.x - s.vx * (s.length / 14), s.y - s.vy * (s.length / 14));
            ctx.lineTo(s.x, s.y);
            ctx.stroke();
            // Bright tip
            ctx.globalAlpha = s.opacity * 0.9;
            ctx.fillStyle   = '#ffffff';
            ctx.beginPath();
            ctx.arc(s.x, s.y, 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        this.raf = requestAnimationFrame(() => this._loop());
    }
}


/* ─────────────────────────────────────────────────────────────────────────────
   2. RING SCENE 3D  (Three.js scene in the hero section)
───────────────────────────────────────────────────────────────────────────── */
class RingScene3D {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container || typeof THREE === 'undefined') return;

        this.scene    = null;
        this.camera   = null;
        this.renderer = null;
        this.ring     = null;
        this.gem      = null;
        this.sparks   = [];
        this.mouse    = { x: 0, y: 0 };
        this.clock    = new THREE.Clock();

        this._init();
        this._buildRing();
        this._buildSparkles();
        this._lights();
        this._bindEvents();
        this._loop();
    }

    _init() {
        const W = this.container.offsetWidth;
        const H = this.container.offsetHeight;

        this.scene  = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 500);
        this.camera.position.set(0, 0, 110);

        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(W, H);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping          = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure  = 1.4;
        this.renderer.outputEncoding       = THREE.sRGBEncoding;
        this.container.appendChild(this.renderer.domElement);
    }

    _lights() {
        // Ambient warm fill
        this.scene.add(new THREE.AmbientLight(0xffb3c6, 0.9));

        // Rose key light
        const key = new THREE.PointLight(0xff3d6b, 3.5, 400);
        key.position.set(60, 80, 60);
        this.scene.add(key);

        // Gold rim light
        const rim = new THREE.PointLight(0xffd166, 2.8, 400);
        rim.position.set(-70, -50, 90);
        this.scene.add(rim);

        // Violet fill
        const fill = new THREE.PointLight(0x7b2ff7, 1.8, 300);
        fill.position.set(-60, 60, -40);
        this.scene.add(fill);

        // Subtle bottom bounce
        const bounce = new THREE.PointLight(0xffd166, 1.0, 200);
        bounce.position.set(0, -80, 50);
        this.scene.add(bounce);
    }

    _buildRing() {
        const group = new THREE.Group();

        // ── Band: torus ──
        const torusGeo = new THREE.TorusGeometry(14, 2.2, 32, 140);
        const bandMat  = new THREE.MeshStandardMaterial({
            color:             0xffd166,
            metalness:         0.95,
            roughness:         0.05,
            envMapIntensity:   1.2
        });
        const torus = new THREE.Mesh(torusGeo, bandMat);
        group.add(torus);

        // ── Prong base (cylinder) ──
        const prongBaseMat = new THREE.MeshStandardMaterial({
            color:     0xffd166,
            metalness: 0.95,
            roughness: 0.06
        });
        const prongBaseGeo = new THREE.CylinderGeometry(3.8, 3.2, 4, 8);
        const prongBase    = new THREE.Mesh(prongBaseGeo, prongBaseMat);
        prongBase.position.set(0, 14, 0);
        group.add(prongBase);

        // ── 4 gold prongs ──
        const prongs = [
            { x:  2.8, z:  2.8 },
            { x: -2.8, z:  2.8 },
            { x:  2.8, z: -2.8 },
            { x: -2.8, z: -2.8 }
        ];
        prongs.forEach(p => {
            const geo  = new THREE.CylinderGeometry(0.45, 0.35, 6, 6);
            const mesh = new THREE.Mesh(geo, prongBaseMat.clone());
            mesh.position.set(p.x, 18.5, p.z);
            group.add(mesh);
        });

        // ── Gemstone (octahedron as a faceted diamond) ──
        const gemGeo = new THREE.OctahedronGeometry(5, 1);
        // Flatten slightly to look like a cut gemstone
        gemGeo.applyMatrix4(new THREE.Matrix4().makeScale(1, 0.62, 1));

        const gemMat = new THREE.MeshPhysicalMaterial({
            color:              0xffffff,
            metalness:          0.0,
            roughness:          0.0,
            transmission:       0.92,
            thickness:          4.0,
            ior:                2.42,
            reflectivity:       1.0,
            iridescence:        0.6,
            iridescenceIOR:     1.5,
            clearcoat:          1,
            clearcoatRoughness: 0
        });
        this.gem = new THREE.Mesh(gemGeo, gemMat);
        this.gem.position.set(0, 21, 0);
        group.add(this.gem);

        // ── Gem glow sprite ──
        const glowCanvas = document.createElement('canvas');
        glowCanvas.width = glowCanvas.height = 128;
        const gc = glowCanvas.getContext('2d');
        const gg = gc.createRadialGradient(64, 64, 2, 64, 64, 64);
        gg.addColorStop(0,   'rgba(255,255,255,0.95)');
        gg.addColorStop(0.3, 'rgba(192,132,252,0.55)');
        gg.addColorStop(0.7, 'rgba(255,61,107,0.20)');
        gg.addColorStop(1,   'transparent');
        gc.fillStyle = gg;
        gc.fillRect(0, 0, 128, 128);

        const glowTex    = new THREE.CanvasTexture(glowCanvas);
        const glowSprite = new THREE.Sprite(
            new THREE.SpriteMaterial({ map: glowTex, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending })
        );
        glowSprite.scale.set(28, 28, 1);
        glowSprite.position.set(0, 21, 0);
        group.add(glowSprite);

        // Tilt the whole ring slightly
        group.rotation.x = 0.3;
        group.rotation.z = 0.15;
        this.ring = group;
        this.scene.add(group);
    }

    _buildSparkles() {
        const sparkCount = 60;
        const geo   = new THREE.BufferGeometry();
        const pos   = new Float32Array(sparkCount * 3);
        const sizes = new Float32Array(sparkCount);
        const cols  = new Float32Array(sparkCount * 3);

        const palette = [
            new THREE.Color(0xffd166),
            new THREE.Color(0xff6b93),
            new THREE.Color(0xc084fc),
            new THREE.Color(0xffffff)
        ];

        for (let i = 0; i < sparkCount; i++) {
            const r     = 30 + Math.random() * 40;
            const theta = Math.random() * Math.PI * 2;
            const phi   = Math.random() * Math.PI;
            pos[i*3]     = r * Math.sin(phi) * Math.cos(theta);
            pos[i*3+1]   = r * Math.sin(phi) * Math.sin(theta);
            pos[i*3+2]   = r * Math.cos(phi);
            sizes[i]     = 1.5 + Math.random() * 3.5;
            const c      = palette[Math.floor(Math.random() * palette.length)];
            cols[i*3]    = c.r;
            cols[i*3+1]  = c.g;
            cols[i*3+2]  = c.b;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));
        geo.setAttribute('color',    new THREE.BufferAttribute(cols, 3));

        // Build a soft round sparkle texture
        const sc = document.createElement('canvas');
        sc.width = sc.height = 64;
        const sCtx = sc.getContext('2d');
        const sg   = sCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
        sg.addColorStop(0,   'rgba(255,255,255,1)');
        sg.addColorStop(0.4, 'rgba(255,255,255,0.6)');
        sg.addColorStop(1,   'transparent');
        sCtx.fillStyle = sg;
        sCtx.fillRect(0, 0, 64, 64);
        const sTex = new THREE.CanvasTexture(sc);

        const mat = new THREE.PointsMaterial({
            size:            0.06,
            map:             sTex,
            vertexColors:    true,
            transparent:     true,
            blending:        THREE.AdditiveBlending,
            sizeAttenuation: true,
            depthWrite:      false
        });

        // We'll animate sizes individually in the loop via userData
        const points = new THREE.Points(geo, mat);
        points.userData.phases = Float32Array.from({ length: sparkCount }, () => Math.random() * Math.PI * 2);
        points.userData.speeds = Float32Array.from({ length: sparkCount }, () => 0.8 + Math.random() * 2.0);
        points.userData.baseSizes = sizes.slice();
        this.sparks = points;
        this.scene.add(points);
    }

    _bindEvents() {
        window.addEventListener('resize', () => {
            if (!this.renderer || !this.camera || !this.container) return;
            const W = this.container.offsetWidth;
            const H = this.container.offsetHeight;
            this.camera.aspect = W / H;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(W, H);
        });

        window.addEventListener('mousemove', e => {
            this.mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
            this.mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
        });
    }

    _loop() {
        if (!this.renderer) return;
        requestAnimationFrame(() => this._loop());

        const t     = this.clock.getElapsedTime();
        const delta = this.clock.getDelta();

        if (this.ring) {
            // Gentle floating bob
            this.ring.position.y = Math.sin(t * 0.8) * 3.5;

            // Slow continuous rotation
            this.ring.rotation.y += 0.006;

            // Subtle mouse-parallax tilt
            this.ring.rotation.x = 0.3 + this.mouse.y * 0.12;
            this.ring.rotation.z = 0.15 - this.mouse.x * 0.1;
        }

        if (this.gem) {
            // Gem inner shimmer oscillation
            this.gem.material.iridescence = 0.5 + 0.5 * Math.sin(t * 1.8);
        }

        // Sparkle twinkle
        if (this.sparks) {
            const sizes   = this.sparks.geometry.attributes.size;
            const phases  = this.sparks.userData.phases;
            const speeds  = this.sparks.userData.speeds;
            const base    = this.sparks.userData.baseSizes;

            for (let i = 0; i < phases.length; i++) {
                const tw     = 0.5 + 0.5 * Math.sin(t * speeds[i] + phases[i]);
                sizes.array[i] = base[i] * (0.4 + tw * 0.6);
            }
            sizes.needsUpdate = true;
            this.sparks.rotation.y = t * 0.04;
        }

        // Camera gentle sway
        this.camera.position.x += (this.mouse.x * 8 - this.camera.position.x) * 0.04;
        this.camera.position.y += (-this.mouse.y * 5 - this.camera.position.y) * 0.04;
        this.camera.lookAt(0, 0, 0);

        this.renderer.render(this.scene, this.camera);
    }
}


/* ─────────────────────────────────────────────────────────────────────────────
   3. PETALS ENGINE  (Three.js — ambient falling petals + burst effects)
───────────────────────────────────────────────────────────────────────────── */
class PetalsEngine {
    constructor() {
        this.container = document.getElementById('webgl-container');
        if (!this.container || typeof THREE === 'undefined') return;

        this.scene    = new THREE.Scene();
        this.petals   = [];
        this.clock    = new THREE.Clock();
        this.mouse    = { x: 0, y: 0, tx: 0, ty: 0 };
        this.textures = [];
        this.geos     = [];
        this.active   = true;

        this._initRenderer();
        this._lights();
        this._buildAssets();
        this._spawnAmbient();
        this._bindEvents();
        this._loop();
    }

    _initRenderer() {
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 0, 100);

        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping         = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.container.appendChild(this.renderer.domElement);
    }

    _lights() {
        this.scene.add(new THREE.AmbientLight(0xffb3c1, 0.9));

        const p1 = new THREE.PointLight(0xff4d6d, 2.2, 300);
        p1.position.set(50, 80, 50);
        this.scene.add(p1);

        const p2 = new THREE.PointLight(0xffd166, 1.6, 300);
        p2.position.set(-60, -40, 80);
        this.scene.add(p2);
    }

    _buildAssets() {
        // ── 3 organic curved petal geometries ──
        for (let variant = 0; variant < 3; variant++) {
            const geo = new THREE.PlaneGeometry(3.5, 4.8, 12, 14);
            const pos = geo.attributes.position;
            for (let i = 0; i < pos.count; i++) {
                const u = pos.getX(i) / 1.75;
                const v = pos.getY(i) / 2.4;
                const z = -0.75 * (1 - v * v) * (1 + 0.28 * Math.abs(u))
                          + 0.25 * u * u
                          + (variant === 1 ? Math.sin(u * 2.2) * 0.25 : 0)
                          + (variant === 2 ? Math.cos(v * 1.8) * 0.18 : 0);
                pos.setZ(i, z);
                // Pinch towards the base
                if (v < -0.65) {
                    pos.setX(i, pos.getX(i) * (1 + (v + 0.65) * 0.9));
                }
            }
            geo.computeVertexNormals();
            this.geos.push(geo);
        }

        // ── Rose petal texture ──
        const rCanvas = this._petalCanvas(
            [
                { stop: 0,    color: '#ff758f' },
                { stop: 0.35, color: '#c9184a' },
                { stop: 0.80, color: '#800f2f' },
                { stop: 1,    color: '#590d22' }
            ],
            'rgba(255,200,220,0.22)'
        );
        this.textures.push(new THREE.CanvasTexture(rCanvas));

        // ── Sakura / blush petal ──
        const sCanvas = this._petalCanvas(
            [
                { stop: 0,    color: '#ffffff' },
                { stop: 0.25, color: '#ffccd5' },
                { stop: 0.65, color: '#ff758f' },
                { stop: 1,    color: '#c9184a' }
            ],
            'rgba(255,180,200,0.18)'
        );
        this.textures.push(new THREE.CanvasTexture(sCanvas));

        // ── Golden petal (for celebration) ──
        const gCanvas = this._petalCanvas(
            [
                { stop: 0,    color: '#fffde7' },
                { stop: 0.3,  color: '#ffd166' },
                { stop: 0.75, color: '#e09400' },
                { stop: 1,    color: '#a06000' }
            ],
            'rgba(255,220,100,0.15)'
        );
        this.textures.push(new THREE.CanvasTexture(gCanvas));
    }

    /** Draw a procedural petal canvas with radial gradient + veins */
    _petalCanvas(stops, veinColor) {
        const c = document.createElement('canvas');
        c.width = c.height = 256;
        const ctx = c.getContext('2d');

        const grad = ctx.createRadialGradient(128, 185, 18, 128, 128, 132);
        stops.forEach(s => grad.addColorStop(s.stop, s.color));

        // Petal silhouette
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(128, 232);
        ctx.bezierCurveTo(38, 208, 18, 95, 128, 22);
        ctx.bezierCurveTo(238, 95, 218, 208, 128, 232);
        ctx.fill();

        // Veins
        ctx.strokeStyle = veinColor;
        ctx.lineWidth   = 1.4;
        for (let v = -5; v <= 5; v++) {
            ctx.beginPath();
            ctx.moveTo(128, 220);
            ctx.quadraticCurveTo(128 + v * 14, 118, 128 + v * 26, 46);
            ctx.stroke();
        }
        // Subtle translucency gradient
        const fade = ctx.createLinearGradient(128, 22, 128, 232);
        fade.addColorStop(0, 'rgba(255,255,255,0.08)');
        fade.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = fade;
        ctx.beginPath();
        ctx.moveTo(128, 232);
        ctx.bezierCurveTo(38, 208, 18, 95, 128, 22);
        ctx.bezierCurveTo(238, 95, 218, 208, 128, 232);
        ctx.fill();

        return c;
    }

    _makePetalMesh(texIdx) {
        const geo = this.geos[Math.floor(Math.random() * this.geos.length)];
        const tex = this.textures[texIdx !== undefined ? texIdx : Math.floor(Math.random() * 2)]; // ambient only rose/sakura
        const mat = new THREE.MeshStandardMaterial({
            map:       tex,
            side:      THREE.DoubleSide,
            transparent: true,
            opacity:   0.82 + Math.random() * 0.16,
            roughness: 0.38,
            metalness: 0.06,
            alphaTest: 0.04
        });
        const mesh  = new THREE.Mesh(geo, mat);
        const scale = (0.65 + Math.random() * 0.65) * (window.innerWidth < 600 ? 0.75 : 1.0);
        mesh.scale.setScalar(scale);
        mesh.rotation.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
        );
        return mesh;
    }

    _spawnAmbient() {
        const count = window.innerWidth < 768 ? 55 : 110;
        for (let i = 0; i < count; i++) this._addAmbientPetal(true);
    }

    _addAmbientPetal(scatter = false) {
        const mesh = this._makePetalMesh();
        mesh.position.set(
            (Math.random() - 0.5) * 190,
            scatter ? (Math.random() - 0.5) * 170 : 90 + Math.random() * 20,
            (Math.random() - 0.5) * 150
        );
        mesh.userData = {
            type:         'ambient',
            vx:           (Math.random() - 0.5) * 0.22,
            vy:           -(0.33 + Math.random() * 0.42),
            vz:           (Math.random() - 0.5) * 0.18,
            rx:           (Math.random() - 0.5) * 0.042,
            ry:           (Math.random() - 0.5) * 0.052,
            rz:           (Math.random() - 0.5) * 0.030,
            flPhase:      Math.random() * Math.PI * 2,
            flSpeed:      1.4 + Math.random() * 2.2
        };
        this.scene.add(mesh);
        this.petals.push(mesh);
    }

    /** Public: burst of petals from a center point */
    triggerBurst(count = 70, texIdx = undefined) {
        const ox = (Math.random() - 0.5) * 30;
        const oy = -10;
        const oz = 20;
        for (let i = 0; i < count; i++) {
            const mesh  = this._makePetalMesh(texIdx);
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.0 + Math.random() * 2.8;
            mesh.position.set(
                ox + (Math.random() - 0.5) * 18,
                oy + (Math.random() - 0.5) * 18,
                oz + (Math.random() - 0.5) * 22
            );
            mesh.userData = {
                type:     'burst',
                vx:       Math.cos(angle) * speed,
                vy:       Math.sin(angle) * speed + 1.3,
                vz:       (Math.random() - 0.5) * speed * 1.4,
                rx:       (Math.random() - 0.5) * 0.12,
                ry:       (Math.random() - 0.5) * 0.15,
                rz:       (Math.random() - 0.5) * 0.10,
                life:     0,
                maxLife:  320 + Math.random() * 200
            };
            this.scene.add(mesh);
            this.petals.push(mesh);
        }
    }

    /** Public: massive celebration storm */
    triggerCelebration() {
        // 3 staggered waves of mixed petal types
        for (let wave = 0; wave < 3; wave++) {
            setTimeout(() => {
                for (let i = 0; i < 70; i++) {
                    const mesh  = this._makePetalMesh(wave % 3);  // cycle through all 3 petal types
                    const angle = Math.random() * Math.PI * 2;
                    const speed = 0.9 + Math.random() * 2.2;
                    mesh.position.set(
                        (Math.random() - 0.5) * 160,
                        55 + Math.random() * 35,
                        (Math.random() - 0.5) * 100
                    );
                    mesh.userData = {
                        type:    'burst',
                        vx:      Math.cos(angle) * speed * 0.7,
                        vy:      Math.sin(angle) * speed + 0.3,
                        vz:      (Math.random() - 0.5) * speed,
                        rx:      (Math.random() - 0.5) * 0.10,
                        ry:      (Math.random() - 0.5) * 0.13,
                        rz:      (Math.random() - 0.5) * 0.08,
                        life:    0,
                        maxLife: 400 + Math.random() * 250
                    };
                    this.scene.add(mesh);
                    this.petals.push(mesh);
                }
            }, wave * 600);
        }
    }

    _bindEvents() {
        window.addEventListener('resize', () => {
            if (!this.renderer || !this.camera) return;
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        window.addEventListener('mousemove', e => {
            this.mouse.tx = (e.clientX / window.innerWidth  - 0.5) * 2;
            this.mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
        });
        window.addEventListener('touchmove', e => {
            if (e.touches[0]) {
                this.mouse.tx = (e.touches[0].clientX / window.innerWidth  - 0.5) * 2;
                this.mouse.ty = (e.touches[0].clientY / window.innerHeight - 0.5) * 2;
            }
        }, { passive: true });
    }

    _loop() {
        if (!this.renderer) return;
        requestAnimationFrame(() => this._loop());

        const t  = this.clock.getElapsedTime();
        this.mouse.x += (this.mouse.tx - this.mouse.x) * 0.05;
        this.mouse.y += (this.mouse.ty - this.mouse.y) * 0.05;

        // Camera gentle parallax
        this.camera.position.x += (this.mouse.x * 10 - this.camera.position.x) * 0.03;
        this.camera.position.y += (this.mouse.y *  6 - this.camera.position.y) * 0.03;
        this.camera.lookAt(0, 0, 0);

        for (let i = this.petals.length - 1; i >= 0; i--) {
            const p = this.petals[i];
            const d = p.userData;

            if (d.type === 'burst') {
                p.position.x += d.vx;
                p.position.y += d.vy;
                p.position.z += d.vz;
                d.vx *= 0.984;
                d.vz *= 0.984;
                d.vy -= 0.032;    // gravity
                p.rotation.x += d.rx;
                p.rotation.y += d.ry;
                p.rotation.z += d.rz;
                d.life++;
                if (d.life > d.maxLife || p.position.y < -95) {
                    this.scene.remove(p);
                    p.material.dispose();
                    this.petals.splice(i, 1);
                }
            } else {
                const fl = Math.sin(t * d.flSpeed + d.flPhase);
                p.position.y += d.vy;
                p.position.x += Math.sin(t + p.position.y * 0.05) * 0.22 + this.mouse.x * 0.35;
                p.position.z += Math.cos(t + p.position.y * 0.05) * 0.14;
                p.rotation.x += d.rx + fl * 0.009;
                p.rotation.y += d.ry;
                p.rotation.z += d.rz + fl * 0.012;
                if (p.position.y < -88) {
                    p.position.y  = 88;
                    p.position.x  = (Math.random() - 0.5) * 190;
                    p.position.z  = (Math.random() - 0.5) * 150;
                }
            }
        }

        this.renderer.render(this.scene, this.camera);
    }
}


/* ─────────────────────────────────────────────────────────────────────────────
   4. 3D HEART ENGINE  (extruded hearts spawned during celebration)
───────────────────────────────────────────────────────────────────────────── */
class HeartEngine {
    constructor(scene) {
        this.scene  = scene;
        this.hearts = [];
        this._buildGeo();
    }

    _buildGeo() {
        const s = new THREE.Shape();
        s.moveTo(2.5, 2.5);
        s.bezierCurveTo(2.5, 2.5,  2,  0,    0,  0);
        s.bezierCurveTo(-3,  0,   -3,  3.5, -3,  3.5);
        s.bezierCurveTo(-3,  5.5, -1,  7.7,  2.5, 9.5);
        s.bezierCurveTo( 6,  7.7,  8,  5.5,  8,  3.5);
        s.bezierCurveTo( 8,  3.5,  8,  0,    5,  0);
        s.bezierCurveTo( 3.5, 0, 2.5, 2.5, 2.5, 2.5);

        this.geo = new THREE.ExtrudeGeometry(s, {
            depth:          1.2,
            bevelEnabled:   true,
            bevelSegments:  4,
            bevelSize:      0.5,
            bevelThickness: 0.5
        });
        this.geo.center();
    }

    spawn(count = 30) {
        const palette = [0xff0055, 0xff4d6d, 0xffd166, 0xff758f, 0xc084fc];
        for (let i = 0; i < count; i++) {
            const color = palette[Math.floor(Math.random() * palette.length)];
            const mat   = new THREE.MeshStandardMaterial({
                color,
                roughness:         0.18,
                metalness:         0.38,
                emissive:          color,
                emissiveIntensity: 0.22
            });
            const mesh = new THREE.Mesh(this.geo, mat);
            const sc   = 0.35 + Math.random() * 0.45;
            mesh.scale.setScalar(sc);
            mesh.position.set(
                (Math.random() - 0.5) * 150,
                -85 - Math.random() * 30,
                (Math.random() - 0.5) * 90
            );
            mesh.userData = {
                vy:    0.55 + Math.random() * 0.85,
                rx:    (Math.random() - 0.5) * 0.030,
                ry:    (Math.random() - 0.5) * 0.055,
                phase: Math.random() * Math.PI * 2
            };
            this.scene.add(mesh);
            this.hearts.push(mesh);
        }
    }

    update(t) {
        for (const h of this.hearts) {
            h.position.y += h.userData.vy;
            h.position.x += Math.sin(t * 1.8 + h.userData.phase) * 0.28;
            h.rotation.x += h.userData.rx;
            h.rotation.y += h.userData.ry;
            if (h.position.y > 95) {
                h.position.y = -85;
                h.position.x = (Math.random() - 0.5) * 150;
            }
        }
    }
}


/* ─────────────────────────────────────────────────────────────────────────────
   5. BOOTSTRAP & PUBLIC API
───────────────────────────────────────────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {

    // -- Galaxy (2D canvas, no Three.js needed)
    const galaxy = new GalaxyEngine('galaxy-canvas');

    // -- 3D Ring in hero
    let ring3d = null;
    const heroContainer = document.getElementById('ring-3d-scene');
    if (heroContainer && typeof THREE !== 'undefined') {
        ring3d = new RingScene3D('ring-3d-scene');
    }

    // -- Petals WebGL layer
    // Petals need their own canvas; add a container div if it doesn't exist
    let petalContainer = document.getElementById('webgl-container');
    if (!petalContainer) {
        petalContainer = document.createElement('div');
        petalContainer.id = 'webgl-container';
        petalContainer.style.cssText = 'position:fixed;inset:0;z-index:1;pointer-events:none;';
        document.body.prepend(petalContainer);
    }

    let petalsEngine = null;
    let heartEngine  = null;

    if (typeof THREE !== 'undefined') {
        petalsEngine = new PetalsEngine();
        if (petalsEngine.scene) {
            heartEngine = new HeartEngine(petalsEngine.scene);
        }
    }

    // Hook heart update into petals loop clock
    if (petalsEngine && heartEngine) {
        const origLoop = petalsEngine._loop.bind(petalsEngine);
        petalsEngine._loop = function () {
            if (!this.renderer) return;
            requestAnimationFrame(() => this._loop());
            const t  = this.clock.getElapsedTime();
            this.mouse.x += (this.mouse.tx - this.mouse.x) * 0.05;
            this.mouse.y += (this.mouse.ty - this.mouse.y) * 0.05;
            this.camera.position.x += (this.mouse.x * 10 - this.camera.position.x) * 0.03;
            this.camera.position.y += (this.mouse.y *  6 - this.camera.position.y) * 0.03;
            this.camera.lookAt(0, 0, 0);
            for (let i = this.petals.length - 1; i >= 0; i--) {
                const p = this.petals[i];
                const d = p.userData;
                if (d.type === 'burst') {
                    p.position.x += d.vx;
                    p.position.y += d.vy;
                    p.position.z += d.vz;
                    d.vx *= 0.984; d.vz *= 0.984; d.vy -= 0.032;
                    p.rotation.x += d.rx; p.rotation.y += d.ry; p.rotation.z += d.rz;
                    d.life++;
                    if (d.life > d.maxLife || p.position.y < -95) {
                        this.scene.remove(p); p.material.dispose(); this.petals.splice(i, 1);
                    }
                } else {
                    const fl = Math.sin(t * d.flSpeed + d.flPhase);
                    p.position.y += d.vy;
                    p.position.x += Math.sin(t + p.position.y * 0.05) * 0.22 + this.mouse.x * 0.35;
                    p.position.z += Math.cos(t + p.position.y * 0.05) * 0.14;
                    p.rotation.x += d.rx + fl * 0.009;
                    p.rotation.y += d.ry;
                    p.rotation.z += d.rz + fl * 0.012;
                    if (p.position.y < -88) {
                        p.position.y  = 88;
                        p.position.x  = (Math.random() - 0.5) * 190;
                        p.position.z  = (Math.random() - 0.5) * 150;
                    }
                }
            }
            heartEngine.update(t);
            this.renderer.render(this.scene, this.camera);
        };
        // Restart the custom loop
        petalsEngine._loop();
    }

    /* ── Public API ── */
    window.romanticEngine = {
        galaxy,
        ring3d,
        petals: petalsEngine,
        hearts: heartEngine,

        triggerPetalBurst(count = 65) {
            if (petalsEngine) petalsEngine.triggerBurst(count);
        },

        triggerCelebration() {
            if (petalsEngine) petalsEngine.triggerCelebration();
            if (heartEngine)  heartEngine.spawn(35);
        }
    };
});
