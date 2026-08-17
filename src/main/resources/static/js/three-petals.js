/**
 * ============================================================================
 * 3D REALISTIC BOTANICAL FLOWER PETALS & LIGHTING ENGINE (THREE.JS)
 * Realistic aerodynamic flutter, 3D curved petal geometries, dynamic lighting,
 * and high-impact celebration burst effects.
 * ============================================================================
 */

class RomanticPetalsEngine {
    constructor() {
        this.container = document.getElementById('webgl-container');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.petals = [];
        this.hearts = [];
        this.petalTextures = [];
        this.petalGeometries = [];
        this.clock = new THREE.Clock();
        
        this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
        this.wind = { x: 0.2, y: -0.9, z: 0.1, turbulence: 0.5 };
        this.isCelebration = false;

        this.init();
    }

    init() {
        if (!this.container) return;

        // 1. Scene Setup
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x20050d, 0.0018);

        // 2. Camera Setup
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 100);

        // 3. Renderer Setup
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.container.appendChild(this.renderer.domElement);

        // 4. Romantic Lighting
        const ambientLight = new THREE.AmbientLight(0xffb3c1, 0.85);
        this.scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0xff4d6d, 2.2, 300);
        pointLight1.position.set(50, 80, 50);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xffd166, 1.8, 300);
        pointLight2.position.set(-60, -40, 80);
        this.scene.add(pointLight2);

        // 5. Generate Procedural Petal Textures & Geometries
        this.generateProceduralAssets();

        // 6. Spawn Initial Ambient Petals
        const initialCount = window.innerWidth < 768 ? 60 : 120;
        for (let i = 0; i < initialCount; i++) {
            this.spawnPetal(true);
        }

        // 7. Event Listeners
        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: true });

        // 8. Start Animation Loop
        this.animate();
    }

    /**
     * Create procedural 3D curved petal geometry and canvas textures
     */
    generateProceduralAssets() {
        // Create 3 curved variations of realistic botanical petals
        for (let i = 0; i < 3; i++) {
            const geom = new THREE.PlaneGeometry(3.5, 4.8, 12, 12);
            const pos = geom.attributes.position;

            // Deform flat plane into realistic organic 3D curve (bowl/spoon shaped petal)
            for (let j = 0; j < pos.count; j++) {
                const u = pos.getX(j) / 1.75;
                const v = pos.getY(j) / 2.4;
                
                // Curve spine and edges
                const curveZ = -0.7 * (1 - v * v) * (1 + 0.3 * Math.abs(u)) + 0.3 * (u * u);
                pos.setZ(j, curveZ + (i === 1 ? Math.sin(u * 2) * 0.2 : 0));
                
                // Organic pinch at base
                if (v < -0.6) {
                    pos.setX(j, pos.getX(j) * (1 + (v + 0.6) * 0.8));
                }
            }
            geom.computeVertexNormals();
            this.petalGeometries.push(geom);
        }

        // Create Petal Canvas Textures (Rose gradient + delicate petal veins)
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Draw Petal Silhouette & Radial Shading
        const grad = ctx.createRadialGradient(128, 180, 20, 128, 128, 130);
        grad.addColorStop(0, '#ff758f');
        grad.addColorStop(0.4, '#c9184a');
        grad.addColorStop(0.85, '#800f2f');
        grad.addColorStop(1, '#590d22');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(128, 230);
        ctx.bezierCurveTo(40, 210, 20, 100, 128, 25);
        ctx.bezierCurveTo(236, 100, 216, 210, 128, 230);
        ctx.fill();

        // Subtle Petal Veins
        ctx.strokeStyle = 'rgba(255, 200, 220, 0.25)';
        ctx.lineWidth = 1.5;
        for (let a = -4; a <= 4; a++) {
            ctx.beginPath();
            ctx.moveTo(128, 220);
            ctx.quadraticCurveTo(128 + a * 15, 120, 128 + a * 25, 50);
            ctx.stroke();
        }

        const petalTexture = new THREE.CanvasTexture(canvas);
        petalTexture.anisotropy = 4;
        this.petalTextures.push(petalTexture);

        // Sakura Blossom Variant Texture (Soft Pink/White)
        const canvasSakura = document.createElement('canvas');
        canvasSakura.width = 256;
        canvasSakura.height = 256;
        const ctxS = canvasSakura.getContext('2d');
        const gradS = ctxS.createRadialGradient(128, 200, 10, 128, 128, 125);
        gradS.addColorStop(0, '#ffffff');
        gradS.addColorStop(0.3, '#ffccd5');
        gradS.addColorStop(0.7, '#ff758f');
        gradS.addColorStop(1, '#c9184a');
        ctxS.fillStyle = gradS;
        ctxS.beginPath();
        ctxS.moveTo(128, 230);
        ctxS.bezierCurveTo(45, 200, 25, 90, 128, 30);
        ctxS.bezierCurveTo(231, 90, 211, 200, 128, 230);
        ctxS.fill();
        const sakuraTexture = new THREE.CanvasTexture(canvasSakura);
        this.petalTextures.push(sakuraTexture);
    }

    /**
     * Spawn an individual realistic 3D petal
     */
    spawnPetal(randomY = false, isBurst = false, origin = null) {
        const geom = this.petalGeometries[Math.floor(Math.random() * this.petalGeometries.length)];
        const texture = this.petalTextures[Math.floor(Math.random() * this.petalTextures.length)];

        // Double-sided translucent botanical material with specular shine
        const mat = new THREE.MeshStandardMaterial({
            map: texture,
            side: THREE.DoubleSide,
            transparent: true,
            roughness: 0.35,
            metalness: 0.1,
            alphaTest: 0.05,
            opacity: 0.88 + Math.random() * 0.12,
            bumpScale: 0.05
        });

        const mesh = new THREE.Mesh(geom, mat);

        const scale = (0.7 + Math.random() * 0.6) * (window.innerWidth < 600 ? 0.8 : 1.0);
        mesh.scale.set(scale, scale, scale);

        if (isBurst && origin) {
            mesh.position.set(
                origin.x + (Math.random() - 0.5) * 15,
                origin.y + (Math.random() - 0.5) * 15,
                origin.z + (Math.random() - 0.5) * 30
            );
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.2 + Math.random() * 2.5;
            mesh.userData = {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed + 1.2,
                vz: (Math.random() - 0.5) * speed * 1.5,
                rotX: (Math.random() - 0.5) * 0.12,
                rotY: (Math.random() - 0.5) * 0.15,
                rotZ: (Math.random() - 0.5) * 0.1,
                flutterPhase: Math.random() * Math.PI * 2,
                flutterSpeed: 2.0 + Math.random() * 3.0,
                isBurst: true,
                lifetime: 0,
                maxLifetime: 350 + Math.random() * 200
            };
        } else {
            mesh.position.set(
                (Math.random() - 0.5) * 180,
                randomY ? (Math.random() - 0.5) * 160 : 90 + Math.random() * 20,
                (Math.random() - 0.5) * 140
            );
            mesh.userData = {
                vx: (Math.random() - 0.5) * 0.2,
                vy: -(0.35 + Math.random() * 0.45),
                vz: (Math.random() - 0.5) * 0.2,
                rotX: (Math.random() - 0.5) * 0.04,
                rotY: (Math.random() - 0.5) * 0.05,
                rotZ: (Math.random() - 0.5) * 0.03,
                flutterPhase: Math.random() * Math.PI * 2,
                flutterSpeed: 1.5 + Math.random() * 2.0,
                isBurst: false
            };
        }

        mesh.rotation.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
        );

        this.scene.add(mesh);
        this.petals.push(mesh);
        return mesh;
    }

    /**
     * Trigger a 3D Flower Petal Burst on button clicks
     */
    triggerPetalBurst(count = 80) {
        const origin = { x: (Math.random() - 0.5) * 20, y: -5, z: 20 };
        for (let i = 0; i < count; i++) {
            this.spawnPetal(false, true, origin);
        }
    }

    /**
     * Trigger Grand Celebration Mode (Hundreds of petals, gold sparkles, floating 3D hearts)
     */
    triggerCelebrationPetalStorm() {
        this.isCelebration = true;
        
        // Spawn massive wave of petals
        for (let i = 0; i < 200; i++) {
            setTimeout(() => {
                this.spawnPetal(false, true, {
                    x: (Math.random() - 0.5) * 120,
                    y: 60 + Math.random() * 30,
                    z: (Math.random() - 0.5) * 80
                });
            }, i * 25);
        }

        // Spawn 3D Glowing Hearts
        this.spawn3DHearts(35);
    }

    /**
     * Create 3D floating hearts in celebration
     */
    spawn3DHearts(count = 25) {
        const heartShape = new THREE.Shape();
        const x = 0, y = 0;
        heartShape.moveTo(x + 2.5, y + 2.5);
        heartShape.bezierCurveTo(x + 2.5, y + 2.5, x + 2, y, x, y);
        heartShape.bezierCurveTo(x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5);
        heartShape.bezierCurveTo(x - 3, y + 5.5, x - 1, y + 7.7, x + 2.5, y + 9.5);
        heartShape.bezierCurveTo(x + 6, y + 7.7, x + 8, y + 5.5, x + 8, y + 3.5);
        heartShape.bezierCurveTo(x + 8, y + 3.5, x + 8, y, x + 5, y);
        heartShape.bezierCurveTo(x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5);

        const extrudeSettings = { depth: 1, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.5, bevelThickness: 0.5 };
        const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
        geometry.center();

        for (let i = 0; i < count; i++) {
            const material = new THREE.MeshStandardMaterial({
                color: Math.random() > 0.3 ? 0xff0055 : 0xffd166,
                roughness: 0.2,
                metalness: 0.4,
                emissive: 0x590d22,
                emissiveIntensity: 0.4
            });

            const heartMesh = new THREE.Mesh(geometry, material);
            heartMesh.scale.set(0.5, 0.5, 0.5);
            heartMesh.position.set(
                (Math.random() - 0.5) * 140,
                -70 - Math.random() * 30,
                (Math.random() - 0.5) * 80
            );

            heartMesh.userData = {
                vy: 0.6 + Math.random() * 0.8,
                rotY: (Math.random() - 0.5) * 0.05,
                rotX: (Math.random() - 0.5) * 0.03,
                floatOffset: Math.random() * Math.PI * 2
            };

            this.scene.add(heartMesh);
            this.hearts.push(heartMesh);
        }
    }

    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onMouseMove(e) {
        this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
        this.mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
    }

    onTouchMove(e) {
        if (e.touches.length > 0) {
            this.mouse.targetX = (e.touches[0].clientX / window.innerWidth - 0.5) * 2;
            this.mouse.targetY = -(e.touches[0].clientY / window.innerHeight - 0.5) * 2;
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        // Smooth mouse wind tracking
        this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
        this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

        // Camera gentle breathing parallax
        this.camera.position.x += (this.mouse.x * 12 - this.camera.position.x) * 0.03;
        this.camera.position.y += (this.mouse.y * 8 - this.camera.position.y) * 0.03;
        this.camera.lookAt(0, 0, 0);

        // Update Petals
        for (let i = this.petals.length - 1; i >= 0; i--) {
            const petal = this.petals[i];
            const data = petal.userData;

            if (data.isBurst) {
                petal.position.x += data.vx;
                petal.position.y += data.vy;
                petal.position.z += data.vz;

                // Air drag & gravity on burst
                data.vx *= 0.98;
                data.vz *= 0.98;
                data.vy -= 0.035; // gravity pulls down

                data.lifetime++;
                if (data.lifetime > data.maxLifetime || petal.position.y < -90) {
                    this.scene.remove(petal);
                    this.petals.splice(i, 1);
                    continue;
                }
            } else {
                // Natural gentle atmospheric flutter
                const flutter = Math.sin(time * data.flutterSpeed + data.flutterPhase);
                petal.position.y += data.vy;
                petal.position.x += Math.sin(time + petal.position.y * 0.05) * 0.25 + (this.mouse.x * 0.4);
                petal.position.z += Math.cos(time + petal.position.y * 0.05) * 0.15;

                // Rotational tumbling in 3D
                petal.rotation.x += data.rotX + flutter * 0.01;
                petal.rotation.y += data.rotY;
                petal.rotation.z += data.rotZ + flutter * 0.015;

                // Wrap around when falling below screen
                if (petal.position.y < -85) {
                    petal.position.y = 85;
                    petal.position.x = (Math.random() - 0.5) * 180;
                    petal.position.z = (Math.random() - 0.5) * 140;
                }
            }
        }

        // Update 3D Floating Hearts
        for (let i = this.hearts.length - 1; i >= 0; i--) {
            const heart = this.hearts[i];
            heart.position.y += heart.userData.vy;
            heart.position.x += Math.sin(time * 2 + heart.userData.floatOffset) * 0.3;
            heart.rotation.y += heart.userData.rotY;
            heart.rotation.x += heart.userData.rotX;

            if (heart.position.y > 90) {
                heart.position.y = -90;
                heart.position.x = (Math.random() - 0.5) * 140;
            }
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Global initialization helper
window.addEventListener('DOMContentLoaded', () => {
    window.romanticPetalsEngine = new RomanticPetalsEngine();
});
