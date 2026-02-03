// Main Game Controller

class Game {
    constructor() {
        // Three.js setup
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        
        // Post-processing
        this.composer = null;
        this.bloomPass = null;
        this.fxaaPass = null;
        this.postProcessingEnabled = true;
        
        // Quality settings
        this.qualitySettings = {
            low: {
                shadows: false,
                postProcessing: false,
                particles: 0.3,
                pixelRatio: 1,
                antialiasing: false,
                bloom: false,
                fog: 400
            },
            medium: {
                shadows: true,
                postProcessing: true,
                particles: 0.7,
                pixelRatio: 1,
                antialiasing: false,
                bloom: true,
                fog: 600
            },
            high: {
                shadows: true,
                postProcessing: true,
                particles: 1.0,
                pixelRatio: Math.min(window.devicePixelRatio, 2),
                antialiasing: true,
                bloom: true,
                fog: 800
            }
        };
        this.currentQuality = 'medium';
        
        // Track loading
        this.trackLoader = null;
        this.currentCourse = null;
        
        // Game objects
        this.track = null;
        this.karts = [];
        this.playerKart = null;
        this.aiControllers = [];
        
        // Managers
        this.itemManager = null;
        this.particleSystem = null;
        this.uiManager = null;
        this.cameraEffects = null;
        this.driftEffects = null;
        
        // Game state
        this.gameState = 'loading'; // loading, menu, countdown, racing, paused, finished
        this.difficulty = 'normal';
        this.totalLaps = 3;
        this.numRacers = 8;
        
        // Race state
        this.raceTime = 0;
        this.raceStartTime = 0;
        
        // Input state
        this.keys = {};
        
        // Camera settings (legacy - now managed by CameraEffectsManager)
        this.cameraDistance = 15;
        this.cameraHeight = 6;
        this.cameraLookAhead = 8;
        
        // Performance
        this.lastTime = 0;
        this.deltaTime = 0;
        this.fps = 60;
        this.fpsUpdateTimer = 0;
        this.fpsHistory = [];
        this.autoQualityEnabled = true;
        
        // Initialize
        this.init();
    }
    
    async init() {
        try {
        // Create UI manager
        this.uiManager = new UIManager();
        this.uiManager.updateLoading(10, 'Initializing...');
        
        // Detect initial quality based on device
        this.detectOptimalQuality();
        
        // Setup Three.js
        this.setupRenderer();
        this.uiManager.updateLoading(20, 'Setting up renderer...');
        
        this.setupScene();
        this.uiManager.updateLoading(30, 'Creating scene...');
        
        this.setupCamera();
        this.uiManager.updateLoading(40, 'Setting up camera...');
        
        this.setupLights();
        this.uiManager.updateLoading(45, 'Adding lights...');
        
        // Setup post-processing
        this.setupPostProcessing();
        this.uiManager.updateLoading(50, 'Setting up effects...');
        
        // Initialize track loader
        this.trackLoader = new TrackLoader();
        this.uiManager.updateLoading(55, 'Loading courses...');
        
        // Create track
        console.log('Creating Track...');
        this.track = new Track(this.scene);
        console.log('Track created successfully');
        this.uiManager.updateLoading(70, 'Building track...');
        
        // Create particle system
        console.log('Creating ParticleSystem...');
        this.particleSystem = new ParticleSystem(this.scene);
        console.log('ParticleSystem created successfully');
        this.uiManager.updateLoading(80, 'Setting up effects...');
        
        // Create item manager
        console.log('Creating ItemManager...');
        this.itemManager = new ItemManager(this.scene, this.track);
        console.log('ItemManager created successfully');
        this.uiManager.updateLoading(85, 'Loading items...');
        
        // Initialize camera effects system
        if (typeof CameraEffectsManager !== 'undefined') {
            this.cameraEffects = new CameraEffectsManager(this.camera, this.scene, this.renderer);
            this.cameraEffects.addToScene(this.scene);
        }
        
        // Initialize drift effects system
        if (typeof DriftEffectsManager !== 'undefined') {
            this.driftEffects = new DriftEffectsManager(this.scene);
        }
        this.uiManager.updateLoading(88, 'Setting up camera effects...');
        
        // Setup input
        this.setupInput();
        this.uiManager.updateLoading(90, 'Configuring controls...');
        
        // Initialize audio
        await window.audioManager.init();
        this.uiManager.updateLoading(95, 'Loading audio...');
        
        // Setup resize handler
        window.addEventListener('resize', () => this.onResize());
        
        // Done loading
        this.uiManager.updateLoading(100, 'Ready!');
        
        setTimeout(() => {
            this.uiManager.hideLoading();
            this.uiManager.showMainMenu();
            this.gameState = 'menu';
            
            // Start background music
            window.audioManager.playMusic('menu');
        }, 500);
        
        // Start game loop
        this.lastTime = performance.now();
        this.gameLoop();
        } catch (error) {
            console.error('GAME INIT ERROR:', error);
            // エラーを画面に表示
            const loadingText = document.getElementById('loading-text');
            if (loadingText) {
                loadingText.textContent = 'Error: ' + error.message;
                loadingText.style.color = 'red';
            }
            alert('Game initialization error: ' + error.message + '\n\nStack: ' + error.stack);
        }
    }
    
    detectOptimalQuality() {
        // Detect device capabilities
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        
        if (!gl) {
            this.currentQuality = 'low';
            return;
        }
        
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
        
        // Check for mobile
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        // Check for integrated graphics
        const isIntegrated = /Intel|Mali|Adreno/i.test(renderer);
        
        if (isMobile) {
            this.currentQuality = 'low';
        } else if (isIntegrated) {
            this.currentQuality = 'medium';
        } else {
            this.currentQuality = 'high';
        }
        
        console.log(`Auto-detected quality: ${this.currentQuality} (GPU: ${renderer})`);
    }
    
    setQuality(quality) {
        if (!this.qualitySettings[quality]) return;
        
        this.currentQuality = quality;
        const settings = this.qualitySettings[quality];
        
        // Update renderer
        this.renderer.setPixelRatio(settings.pixelRatio);
        this.renderer.shadowMap.enabled = settings.shadows;
        
        // Update fog
        if (this.scene.fog) {
            this.scene.fog.far = settings.fog;
        }
        
        // Update post-processing
        this.postProcessingEnabled = settings.postProcessing;
        if (this.bloomPass) {
            this.bloomPass.enabled = settings.bloom;
        }
        if (this.fxaaPass) {
            this.fxaaPass.enabled = settings.antialiasing;
        }
        
        // Update particle system intensity
        if (this.particleSystem) {
            this.particleSystem.intensityMultiplier = settings.particles;
        }
        
        console.log(`Quality set to: ${quality}`);
    }
    
    setupRenderer() {
        const settings = this.qualitySettings[this.currentQuality];
        
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: settings.antialiasing,
            powerPreference: 'high-performance',
            stencil: false
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(settings.pixelRatio);
        
        // Shadow configuration
        this.renderer.shadowMap.enabled = settings.shadows;
        if (settings.shadows) {
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }
        
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        
        // Optimization: frustum culling is on by default
        this.renderer.sortObjects = true;
        
        document.getElementById('game-container').appendChild(this.renderer.domElement);
    }
    
    setupPostProcessing() {
        const settings = this.qualitySettings[this.currentQuality];
        
        // Check if post-processing classes are available
        if (typeof THREE.EffectComposer === 'undefined') {
            console.warn('Post-processing not available, skipping setup');
            this.postProcessingEnabled = false;
            return;
        }
        
        // Create effect composer
        this.composer = new THREE.EffectComposer(this.renderer);
        
        // Render pass
        const renderPass = new THREE.RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        
        // Bloom pass for glow effects (item boxes, boost flames, etc.)
        if (typeof THREE.UnrealBloomPass !== 'undefined') {
            this.bloomPass = new THREE.UnrealBloomPass(
                new THREE.Vector2(window.innerWidth, window.innerHeight),
                0.5,   // strength
                0.4,   // radius
                0.85   // threshold
            );
            this.bloomPass.enabled = settings.bloom;
            this.composer.addPass(this.bloomPass);
        }
        
        // FXAA antialiasing (cheaper than MSAA)
        if (typeof THREE.ShaderPass !== 'undefined' && typeof THREE.FXAAShader !== 'undefined') {
            this.fxaaPass = new THREE.ShaderPass(THREE.FXAAShader);
            this.fxaaPass.material.uniforms['resolution'].value.x = 1 / (window.innerWidth * settings.pixelRatio);
            this.fxaaPass.material.uniforms['resolution'].value.y = 1 / (window.innerHeight * settings.pixelRatio);
            this.fxaaPass.enabled = settings.antialiasing;
            this.composer.addPass(this.fxaaPass);
        }
        
        this.postProcessingEnabled = settings.postProcessing;
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 300, 800);  // 拡大したコース用にフォグ距離を伸ばす
    }
    
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            70,
            window.innerWidth / window.innerHeight,
            0.1,
            1500  // 遠くまで見えるように
        );
        this.camera.position.set(0, 10, -20);
    }
    
    setupLights() {
        // Ambient light
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambient);
        
        // Directional light (sun)
        const sun = new THREE.DirectionalLight(0xffffff, 0.8);
        sun.position.set(100, 100, 50);
        sun.castShadow = true;
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        sun.shadow.camera.near = 10;
        sun.shadow.camera.far = 400;
        sun.shadow.camera.left = -150;
        sun.shadow.camera.right = 150;
        sun.shadow.camera.top = 150;
        sun.shadow.camera.bottom = -150;
        this.scene.add(sun);
        
        // Hemisphere light for sky color
        const hemi = new THREE.HemisphereLight(0x87CEEB, 0x228B22, 0.3);
        this.scene.add(hemi);
    }
    
    setupInput() {
        // Keyboard input
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            // Pause toggle
            if (e.code === 'KeyP' || e.code === 'Escape') {
                if (this.gameState === 'racing') {
                    this.pauseRace();
                } else if (this.gameState === 'paused') {
                    this.resumeRace();
                }
            }
            
            // Camera mode toggle (C key)
            if (e.code === 'KeyC' && this.gameState === 'racing') {
                if (this.cameraEffects) {
                    const newMode = this.cameraEffects.cycleCameraMode();
                    console.log('Camera mode:', newMode);
                    // Show brief notification
                    this.showCameraModeNotification(newMode);
                }
            }
            
            // Resume audio context on first input
            window.audioManager.resume();
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }
    
    // Show camera mode change notification
    showCameraModeNotification(mode) {
        const modeNames = {
            follow: '📷 Standard View',
            wide: '📷 Wide View',
            close: '📷 Close View',
            cinematic: '📷 Cinematic View'
        };
        
        // Create or reuse notification element
        let notification = document.getElementById('camera-mode-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'camera-mode-notification';
            notification.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 15px 30px;
                border-radius: 10px;
                font-size: 24px;
                font-weight: bold;
                z-index: 1000;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            document.body.appendChild(notification);
        }
        
        notification.textContent = modeNames[mode] || mode;
        notification.style.opacity = '1';
        
        setTimeout(() => {
            notification.style.opacity = '0';
        }, 1500);
    }
    
    updatePlayerInput() {
        if (!this.playerKart) return;
        
        const input = this.playerKart.input;
        
        input.forward = this.keys['ArrowUp'] || this.keys['KeyW'];
        input.backward = this.keys['ArrowDown'] || this.keys['KeyS'];
        input.left = this.keys['ArrowLeft'] || this.keys['KeyA'];
        input.right = this.keys['ArrowRight'] || this.keys['KeyD'];
        input.drift = this.keys['Space'];
        
        // Item use (Space when not drifting, or Shift)
        if ((this.keys['Space'] && !input.forward) || this.keys['ShiftLeft']) {
            if (this.playerKart.currentItem && !this.playerKart.isDrifting) {
                this.playerKart.useItem(this);
            }
        }
    }
    
    async startRace(difficulty = 'normal', course = 'grassland') {
        console.log('=== startRace開始 ===', { difficulty, course });
        try {
        this.difficulty = difficulty;
        this.currentCourse = course;
        this.gameState = 'countdown';
        
        // Clear any existing karts
        console.log('clearRace呼び出し...');
        this.clearRace();
        
        // Load course data from JSON
        let courseData = null;
        try {
            if (this.trackLoader) {
                console.log('コースデータ読み込み中:', course);
                courseData = await this.trackLoader.loadCourse(course);
                console.log(`Loaded course data for ${course}:`, courseData?.name);
            }
        } catch (err) {
            console.warn('Failed to load course data, using defaults:', err);
        }
        
        // Remove old track and create new one with course data
        if (this.track) {
            console.log('古いトラックを削除...');
            this.scene.remove(this.track.trackGroup);
        }
        console.log('新しいトラックを作成中...');
        this.track = new Track(this.scene, courseData);
        console.log('トラック作成完了');
        
        // Apply theme from course data (theme is already applied in Track constructor)
        // TrackLoader.applyTheme is a static method - skip if not available
        try {
            if (courseData && typeof TrackLoader !== 'undefined' && TrackLoader.applyTheme) {
                console.log('テーマを適用中...');
                TrackLoader.applyTheme(this.scene, course);
            }
        } catch (e) {
            console.warn('テーマ適用スキップ:', e.message);
        }
        
        // Re-initialize item manager with new track
        if (this.itemManager) {
            this.itemManager.track = this.track;
            this.itemManager.setCourse(course);
        }
        
        // Load course audio
        if (window.audioManager) {
            await window.audioManager.setCourse(course);
        }
        
        // Create karts
        console.log('カートを作成中...');
        this.createKarts();
        
        // Position karts at start
        console.log('カートをスタート位置に配置...');
        this.positionKartsAtStart();
        
        // Start course-specific ambient particles
        this.startCourseParticles(course);
        
        // Show HUD
        console.log('HUDを表示...');
        this.uiManager.showHUD();
        
        // Start race music
        window.audioManager.stopMusic();
        window.audioManager.playMusic('race');
        
        // Start ambient sounds
        window.audioManager.startAmbientSound();
        
        // Start engine sounds
        window.audioManager.startEngine();
        
        // Show countdown
        console.log('カウントダウン開始...');
        await this.uiManager.showCountdown();
        
        // Start race
        console.log('レース開始！');
        this.gameState = 'racing';
        this.raceStartTime = performance.now();
        this.raceTime = 0;
        
        // Initialize lap times tracking
        this.lapTimes = new Array(this.totalLaps).fill(0);
        this.lastLapTime = 0;
        
        // Set race start time for each kart (to prevent false lap count at start)
        this.karts.forEach(kart => {
            kart.raceStartTime = this.raceStartTime;
        });
        console.log('=== startRace完了 ===');
        } catch (error) {
            console.error('startRaceエラー:', error);
            console.error('スタック:', error.stack);
            alert('レース開始エラー: ' + error.message);
        }
    }
    
    // Start course-specific ambient particle effects
    startCourseParticles(course) {
        if (!this.particleSystem) return;
        
        // Get bounds from track if available
        const bounds = {
            minX: this.track?.courseData?.environment?.bounds?.minX || -200,
            maxX: this.track?.courseData?.environment?.bounds?.maxX || 200,
            minZ: this.track?.courseData?.environment?.bounds?.minZ || -50,
            maxZ: this.track?.courseData?.environment?.bounds?.maxZ || 350,
            minY: 0,
            maxY: 60
        };
        
        if (course === 'snow') {
            this.particleSystem.createSnowfall(bounds, 1.0);
        } else if (course === 'castle') {
            this.particleSystem.createEmbers(bounds, 0.8);
        }
    }
    
    createKarts() {
        // 難易度に応じた速度倍率を設定
        // Easy: 1.0 (現在の速度), Normal: 1.2 (+20%), Hard: 1.4 (+40%)
        const speedMultipliers = {
            'easy': 1.0,
            'normal': 1.2,
            'hard': 1.4
        };
        const speedMultiplier = speedMultipliers[this.difficulty] || 1.0;
        console.log(`難易度: ${this.difficulty}, 速度倍率: ${speedMultiplier}`);
        
        // Create player kart (force Mario)
        this.playerKart = new Kart(this.scene, 0, true, 'Mario', 'mario');
        this.playerKart.setDifficultyMultiplier(speedMultiplier);
        this.karts.push(this.playerKart);
        
        // Create AI karts
        for (let i = 1; i < this.numRacers; i++) {
            const aiCharacterId =
                (window.CharacterOrder && window.CharacterOrder[i]) || null;
            const aiKart = new Kart(this.scene, i, false, RacerNames[i], aiCharacterId);
            aiKart.setDifficultyMultiplier(speedMultiplier);
            this.karts.push(aiKart);
            
            // Use course-specific AI settings if available
            const courseData = this.track?.courseData;
            const aiController = new AIController(aiKart, this.track, this.difficulty, courseData);
            this.aiControllers.push(aiController);
        }
    }
    
    positionKartsAtStart() {
        const startPositions = this.track.getStartPositions(this.numRacers);
        
        // Shuffle positions for AI variety (player always in back)
        this.karts.forEach((kart, index) => {
            const pos = startPositions[index];
            kart.setPosition(pos.x, pos.y, pos.z, pos.rotation);
            kart.lap = 0;
            kart.checkpoint = 0;
            kart.lastCheckpoint = -1;
            kart.finished = false;
            kart.finishTime = 0;
            kart.totalProgress = 0;
            kart.speed = 0;
            kart.currentItem = null;
            kart.hasShield = false;
            kart.isShrunken = false;
            kart.isFrozen = false;
            kart.isSpunOut = false;
            kart.isDrifting = false;
            kart.driftLevel = 0;
            kart.driftTime = 0;
            kart.boostTime = 0;
            kart.finalLapShown = false;
        });
    }
    
    clearRace() {
        // Remove all karts
        this.karts.forEach(kart => {
            this.scene.remove(kart.mesh);
        });
        this.karts = [];
        this.aiControllers = [];
        this.playerKart = null;
        
        // Clear items
        if (this.itemManager) {
            this.itemManager.clear();
        }
        
        // Clear particles
        if (this.particleSystem) {
            this.particleSystem.clear();
        }
        
        // Reset item boxes
        if (this.track) {
            this.track.itemBoxes.forEach(box => {
                box.active = true;
                box.mesh.visible = true;
                box.respawnTime = 0;
            });
        }
    }
    
    pauseRace() {
        if (this.gameState !== 'racing') return;
        
        this.gameState = 'paused';
        this.uiManager.showPauseMenu();
        window.audioManager.stopEngine();
    }
    
    resumeRace() {
        if (this.gameState !== 'paused') return;
        
        this.gameState = 'racing';
        this.uiManager.hidePauseMenu();
        window.audioManager.startEngine();
    }
    
    restartRace() {
        this.gameState = 'menu';
        this.uiManager.hideAllScreens();
        this.clearRace();
        
        // Start new race with current course
        this.startRace(this.difficulty, this.currentCourse || 'grassland');
    }
    
    returnToMenu() {
        this.gameState = 'menu';
        this.clearRace();
        this.uiManager.showMainMenu();
        
        window.audioManager.stopEngine();
        window.audioManager.stopAmbientSound();
        window.audioManager.stopMusic();
        window.audioManager.playMusic('menu');
    }
    
    finishRace() {
        this.gameState = 'finished';
        
        window.audioManager.stopEngine();
        window.audioManager.stopMusic();
        window.audioManager.playVictoryFanfare();
        
        // Build results
        const results = this.karts
            .sort((a, b) => {
                if (a.finished && b.finished) {
                    return a.finishTime - b.finishTime;
                }
                if (a.finished) return -1;
                if (b.finished) return 1;
                return b.totalProgress - a.totalProgress;
            })
            .map((kart, index) => ({
                name: kart.name,
                time: kart.finishTime || this.raceTime,
                isPlayer: kart.isPlayer,
                position: index + 1
            }));
        
        this.uiManager.showResults(results);
    }
    
    gameLoop() {
        requestAnimationFrame(() => this.gameLoop());
        
        const currentTime = performance.now();
        this.deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;
        
        // Update FPS counter
        this.fpsUpdateTimer += this.deltaTime;
        if (this.fpsUpdateTimer >= 0.5) {
            this.fps = Math.round(1 / this.deltaTime);
            this.fpsUpdateTimer = 0;
            
            // Auto-adjust quality if needed
            if (this.gameState === 'racing') {
                this.autoAdjustQuality();
            }
        }
        
        // Update based on game state
        if (this.gameState === 'racing') {
            this.updateRace();
        } else if (this.gameState === 'countdown') {
            this.updateCountdown();
        }
        
        // Always render
        this.render();
    }
    
    updateRace() {
        try {
            // Update race time
            this.raceTime = performance.now() - this.raceStartTime;
            
            // Update player input FIRST
            this.updatePlayerInput();
            
            // Update AI inputs BEFORE updating karts (critical fix!)
            this.aiControllers.forEach(ai => {
                ai.update(this.deltaTime, this.karts);
            });
            
            // Now update all karts with their inputs set
            this.karts.forEach(kart => {
                kart.update(this.deltaTime, this.track);
            });
            
            // Handle kart collisions
            this.handleKartCollisions();
            
            // 敵キャラクター（ドッスン、ノコノコ）の更新と衝突判定
            // 全カートの位置を配列で渡す（プレイヤー＋AI）
            const kartPositions = this.karts.map(kart => kart.position);
            this.track.updateEnemies(this.deltaTime, kartPositions);
            this.checkEnemyCollisions();
            
            // Update items
            this.itemManager.update(this.deltaTime, this.karts);
            
            // Update track (item box respawns, etc.)
            this.track.update(this.deltaTime);
            
            // Update particles
            this.updateParticles();
            this.particleSystem.update(this.deltaTime);
            
            // Update positions
            this.updateRacePositions();
            
            // Check for lap completion and race finish
            this.checkLapCompletion();
            
            // Update camera
            this.updateCamera();
            
            // Update audio
            this.updateAudio();
            
            // Update UI
            this.updateUI();
        } catch (e) {
            console.error('Error in updateRace:', e);
        }
    }
    
    updateCountdown() {
        // Camera orbits around track during countdown
        const time = performance.now() * 0.0005;
        this.camera.position.x = Math.sin(time) * 100;
        this.camera.position.z = Math.cos(time) * 100;
        this.camera.position.y = 50;
        this.camera.lookAt(0, 0, 50);
    }
    
    handleKartCollisions() {
        for (let i = 0; i < this.karts.length; i++) {
            for (let j = i + 1; j < this.karts.length; j++) {
                if (this.karts[i].checkCollision(this.karts[j])) {
                    this.karts[i].handleCollision(this.karts[j]);
                }
            }
        }
    }
    
    // 敵キャラクター（ドッスン、ノコノコ）との衝突判定
    checkEnemyCollisions() {
        this.karts.forEach(kart => {
            // 無敵状態やスピンアウト中はスキップ
            if (kart.invincibilityTimer > 0 || kart.isSpunOut || kart.starActive) return;
            
            const enemy = this.track.checkEnemyCollision(kart.position);
            if (enemy) {
                // シールドがあれば防ぐ
                if (kart.hasShield) {
                    kart.hasShield = false;
                    if (window.audioManager) {
                        window.audioManager.playSound('shield_break');
                    }
                } else {
                    // クラッシュ
                    kart.spinOut();
                    if (window.audioManager) {
                        window.audioManager.playSound('crash');
                    }
                }
            }
            
            // ブーストパッドのチェック
            this.checkBoostPadCollision(kart);
            
            // ジャンプ台のチェック
            this.checkJumpRampCollision(kart);
        });
    }
    
    // ブーストパッドとの衝突チェック
    checkBoostPadCollision(kart) {
        if (!this.track.boostPads) return;
        
        this.track.boostPads.forEach(pad => {
            const dx = kart.position.x - pad.position.x;
            const dz = kart.position.z - pad.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            
            // ブーストパッドの範囲内
            if (dist < (pad.width + pad.length) / 3) {
                // まだこのパッドでブーストを受けていない場合
                if (!kart._lastBoostPad || kart._lastBoostPad !== pad) {
                    kart.applyBoost(0.8, pad.boostStrength || 1.4);
                    kart._lastBoostPad = pad;
                    kart._lastBoostTime = Date.now();
                    
                    if (window.audioManager) {
                        window.audioManager.playSound('boost');
                    }
                }
            }
        });
        
        // ブースト履歴をクリア（1秒後）
        if (kart._lastBoostTime && Date.now() - kart._lastBoostTime > 1000) {
            kart._lastBoostPad = null;
        }
    }
    
    // ジャンプ台との衝突チェック
    checkJumpRampCollision(kart) {
        if (!this.track.jumpRamps) return;
        
        this.track.jumpRamps.forEach(ramp => {
            const dx = kart.position.x - ramp.position.x;
            const dz = kart.position.z - ramp.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            
            // ジャンプ台の範囲内
            if (dist < ramp.radius && !kart.isAirborne) {
                // まだこのジャンプ台でジャンプしていない場合
                if (!kart._lastJumpRamp || kart._lastJumpRamp !== ramp) {
                    // ジャンプ効果
                    kart.verticalVelocity = 18;  // 上向きの速度
                    kart.isAirborne = true;
                    kart.applyBoost(0.5, ramp.boostStrength || 1.3);
                    kart._lastJumpRamp = ramp;
                    kart._lastJumpTime = Date.now();
                    
                    if (window.audioManager) {
                        window.audioManager.playSound('jump');
                    }
                    console.log('ジャンプ！');
                }
            }
        });
        
        // ジャンプ履歴をクリア（1秒後）
        if (kart._lastJumpTime && Date.now() - kart._lastJumpTime > 1000) {
            kart._lastJumpRamp = null;
        }
    }
    
    updateRacePositions() {
        // Sort by progress
        const sorted = [...this.karts].sort((a, b) => b.totalProgress - a.totalProgress);
        
        sorted.forEach((kart, index) => {
            kart.racePosition = index + 1;
        });
    }
    
    checkLapCompletion() {
        this.karts.forEach(kart => {
            if (kart.finished) return;
            
            // Track lap time for player
            if (kart.isPlayer) {
                // Initialize last tracked lap if not set
                if (this.lastTrackedLap === undefined) {
                    this.lastTrackedLap = kart.lap;
                }
                
                // Check if lap completed
                if (kart.lap > this.lastTrackedLap && kart.lap <= this.totalLaps) {
                    // Record lap time
                    const lapTime = this.raceTime - this.lastLapTime;
                    if (this.lapTimes && this.lastTrackedLap < this.lapTimes.length) {
                        this.lapTimes[this.lastTrackedLap] = lapTime;
                    }
                    this.lastLapTime = this.raceTime;
                    this.lastTrackedLap = kart.lap;
                    
                    // Show lap time notification
                    this.showLapTimeNotification(kart.lap, lapTime);
                }
            }
            
            // Debug: Log when approaching finish condition
            if (kart.isPlayer && kart.lap >= this.totalLaps - 1) {
                console.log('[FINISH DEBUG] Player lap:', kart.lap, 'totalLaps:', this.totalLaps, 'finished:', kart.finished);
            }
            
            // Check if crossed finish line (lap 3 completed)
            if (kart.lap >= this.totalLaps) {
                console.log('[FINISH] Setting kart.finished=true for', kart.isPlayer ? 'Player' : 'AI', 'lap:', kart.lap);
                kart.finished = true;
                kart.finishTime = this.raceTime;
                
                if (kart.isPlayer) {
                    // Record final lap time
                    if (this.lapTimes && this.totalLaps - 1 < this.lapTimes.length) {
                        const finalLapTime = this.raceTime - this.lastLapTime;
                        this.lapTimes[this.totalLaps - 1] = finalLapTime;
                    }
                    
                    // Player finished!
                    window.audioManager.playSound('race_finish');
                    setTimeout(() => this.finishRace(), 2000);
                }
            }
            
            // Final lap notification
            if (kart.isPlayer && kart.lap === this.totalLaps - 1 && !kart.finalLapShown) {
                kart.finalLapShown = true;
                this.uiManager.showFinalLap();
            }
        });
        
        // Check if all karts finished
        const allFinished = this.karts.every(k => k.finished);
        if (allFinished && this.gameState === 'racing') {
            this.finishRace();
        }
    }
    
    // Lap time notification
    showLapTimeNotification(lapNumber, lapTime) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 40%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-family: 'Rubik', 'Courier New', monospace;
            font-size: 24px;
            color: #00ff00;
            text-shadow: 2px 2px 0 #000, 0 0 10px #00ff00;
            z-index: 200;
            animation: lapTimeNotify 1.5s ease-out forwards;
            pointer-events: none;
        `;
        
        const timeStr = window.Utils ? window.Utils.formatTime(lapTime) : (lapTime / 1000).toFixed(3);
        notification.textContent = `Lap ${lapNumber}: ${timeStr}`;
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes lapTimeNotify {
                0% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
                100% { opacity: 0; transform: translate(-50%, -100%) scale(0.8); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 1500);
    }
    
    updateParticles() {
        if (!this.playerKart) return;
        
        // Drift sparks
        if (this.playerKart.isDrifting && this.playerKart.driftLevel >= 1) {
            this.particleSystem.createDriftSparks(this.playerKart);
        }
        
        // Boost flames
        if (this.playerKart.boostTime > 0) {
            this.particleSystem.createBoostFlame(this.playerKart);
        }
        
        // Grass dust
        if (this.playerKart.onGrass && this.playerKart.speed > 20) {
            if (Math.random() < 0.3) {
                this.particleSystem.createDust(this.playerKart.position, this.playerKart.speed / 50);
            }
        }
        
        // Speed lines at high speed
        const speedRatio = this.playerKart.speed / this.playerKart.maxSpeed;
        if (speedRatio > 0.8) {
            this.particleSystem.createSpeedLines(this.playerKart, speedRatio);
        }
        
        // AI particles (less frequent for performance)
        this.karts.forEach(kart => {
            if (kart.isPlayer) return;
            
            if (kart.isDrifting && kart.driftLevel >= 2 && Math.random() < 0.3) {
                this.particleSystem.createDriftSparks(kart);
            }
        });
    }
    
    updateCamera() {
        if (!this.playerKart) return;
        
        const kart = this.playerKart;
        
        // NaN チェック - カートの位置が不正な場合はカメラを更新しない
        if (isNaN(kart.position.x) || isNaN(kart.position.y) || isNaN(kart.position.z)) {
            console.error('Kart position is NaN, skipping camera update');
            return;
        }
        
        // Use advanced camera effects if available
        if (this.cameraEffects) {
            this.cameraEffects.update(this.deltaTime, kart, this.track);
            
            // Update drift effects
            if (this.driftEffects) {
                this.driftEffects.update(this.deltaTime);
                
                // Handle drift trail
                if (kart.isDrifting) {
                    if (!kart._driftTrailActive) {
                        this.driftEffects.startDriftTrail(0, kart);
                        kart._driftTrailActive = true;
                    }
                    this.driftEffects.updateDriftTrail(0, kart, kart.driftLevel);
                    
                    // Spawn sparks periodically
                    if (Math.random() < 0.3) {
                        this.driftEffects.spawnDriftSparks(kart, kart.driftLevel, 2 + kart.driftLevel);
                    }
                } else if (kart._driftTrailActive) {
                    this.driftEffects.endDriftTrail(0);
                    kart._driftTrailActive = false;
                }
            }
            return;
        }
        
        // Fallback to legacy camera (if effects manager not loaded)
        // Calculate camera target position
        const cameraOffset = new THREE.Vector3(
            -Math.sin(kart.rotation) * this.cameraDistance,
            this.cameraHeight,
            -Math.cos(kart.rotation) * this.cameraDistance
        );
        
        // Add some dynamic movement based on speed
        const speedFactor = Math.abs(kart.speed) / kart.maxSpeed;
        cameraOffset.y += speedFactor * 2;
        
        // Wider view at high speed
        this.camera.fov = 70 + speedFactor * 15;
        this.camera.updateProjectionMatrix();
        
        // Smooth camera follow
        const targetPos = kart.position.clone().add(cameraOffset);
        this.camera.position.lerp(targetPos, 0.1);
        
        // Look ahead based on speed
        const lookAhead = this.cameraLookAhead * (0.5 + speedFactor * 0.5);
        const lookTarget = kart.position.clone();
        lookTarget.x += Math.sin(kart.rotation) * lookAhead;
        lookTarget.z += Math.cos(kart.rotation) * lookAhead;
        lookTarget.y += 1.5;
        
        this.camera.lookAt(lookTarget);
        
        // Camera effects
        // Shake on boost
        if (kart.boostTime > 0) {
            this.camera.position.x += (Math.random() - 0.5) * 0.15;
            this.camera.position.y += (Math.random() - 0.5) * 0.1;
        }
        
        // Shake on drift at high level
        if (kart.isDrifting && kart.driftLevel >= 2) {
            this.camera.position.x += (Math.random() - 0.5) * 0.05 * kart.driftLevel;
        }
        
        // Note: Camera roll/tilt disabled in fallback mode to prevent gimbal issues
        // For proper camera tilt, use CameraEffectsManager
    }
    
    updateAudio() {
        if (!this.playerKart) return;
        
        window.audioManager.updateEngine(
            Math.abs(this.playerKart.speed),
            this.playerKart.maxSpeed,
            this.playerKart.isDrifting
        );
    }
    
    updateUI() {
        if (!this.playerKart) return;
        
        try {
            const kart = this.playerKart;
            
            this.uiManager.updatePosition(kart.racePosition);
            this.uiManager.updateLap(Math.min(kart.lap + 1, this.totalLaps), this.totalLaps);
            this.uiManager.updateTimer(this.raceTime);
            this.uiManager.updateItem(kart.currentItem);
            this.uiManager.updateSpeed(kart.speed, kart.maxSpeed);
            this.uiManager.updateBoostMeter(kart.driftLevel, kart.driftTime, kart.boostTime);
            this.uiManager.showWrongWay(kart.wrongWay);
            this.uiManager.updateMinimap(this.karts, this.track);
            
            // Position arrows for nearby racers - 無効化
            // if (this.uiManager.updatePositionArrows) {
            //     this.uiManager.updatePositionArrows(this.playerKart, this.karts);
            // }
            
            // Lap times display
            if (this.uiManager.updateLapTimes && this.lapTimes) {
                this.uiManager.updateLapTimes(this.lapTimes, kart.lap + 1);
            }
        } catch (e) {
            console.error('Error in updateUI:', e);
        }
    }
    
    render() {
        try {
            // カメラ位置がNaNの場合はリセット
            if (isNaN(this.camera.position.x) || isNaN(this.camera.position.y) || isNaN(this.camera.position.z)) {
                console.error('Camera position is NaN, resetting');
                this.camera.position.set(0, 10, -20);
                if (this.playerKart) {
                    this.camera.lookAt(this.playerKart.position);
                }
            }
            
            // Use post-processing if enabled and available
            if (this.postProcessingEnabled && this.composer) {
                this.composer.render();
            } else {
                this.renderer.render(this.scene, this.camera);
            }
        } catch (e) {
            console.error('Error in render:', e);
        }
    }
    
    onResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const settings = this.qualitySettings[this.currentQuality];
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        
        // Update post-processing sizes
        if (this.composer) {
            this.composer.setSize(width, height);
        }
        
        if (this.fxaaPass) {
            this.fxaaPass.material.uniforms['resolution'].value.x = 1 / (width * settings.pixelRatio);
            this.fxaaPass.material.uniforms['resolution'].value.y = 1 / (height * settings.pixelRatio);
        }
        
        if (this.bloomPass) {
            this.bloomPass.setSize(width, height);
        }
    }
    
    // Auto-adjust quality based on FPS
    autoAdjustQuality() {
        if (!this.autoQualityEnabled) return;
        
        this.fpsHistory.push(this.fps);
        if (this.fpsHistory.length > 60) {
            this.fpsHistory.shift();
        }
        
        // Check every 60 frames
        if (this.fpsHistory.length === 60) {
            const avgFps = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
            
            if (avgFps < 25 && this.currentQuality !== 'low') {
                console.log(`FPS too low (${avgFps.toFixed(1)}), lowering quality`);
                this.setQuality(this.currentQuality === 'high' ? 'medium' : 'low');
                this.fpsHistory = [];
            } else if (avgFps > 55 && this.currentQuality !== 'high') {
                console.log(`FPS stable (${avgFps.toFixed(1)}), increasing quality`);
                this.setQuality(this.currentQuality === 'low' ? 'medium' : 'high');
                this.fpsHistory = [];
            }
        }
    }
}

// Start the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
