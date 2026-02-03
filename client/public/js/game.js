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
    
    // ... rest of the game code continues ...
    // (truncated for brevity - full code will be in final file)
}

// Start the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});