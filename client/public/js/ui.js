// UI Manager - handles all HUD elements and screens

class UIManager {
    constructor() {
        // Get UI elements
        this.loadingScreen = document.getElementById('loading-screen');
        this.loadingBar = document.getElementById('loading-bar');
        this.loadingText = document.getElementById('loading-text');
        
        this.mainMenu = document.getElementById('main-menu');
        this.courseSelect = document.getElementById('course-select');
        this.hud = document.getElementById('hud');
        this.countdown = document.getElementById('countdown');
        this.wrongWay = document.getElementById('wrong-way');
        this.resultsScreen = document.getElementById('results-screen');
        this.pauseMenu = document.getElementById('pause-menu');
        
        // HUD elements
        this.positionDisplay = document.getElementById('position-display');
        this.lapDisplay = document.getElementById('lap-display');
        this.timerDisplay = document.getElementById('timer-display');
        this.itemDisplay = document.getElementById('item-display');
        this.speedDisplay = document.getElementById('speed-display');
        this.speedBar = document.getElementById('speed-bar');
        this.boostFill = document.getElementById('boost-fill');
        
        // Minimap
        this.minimapCanvas = document.getElementById('minimap-canvas');
        this.minimapCtx = this.minimapCanvas ? this.minimapCanvas.getContext('2d') : null;
        
        // Setup minimap canvas
        if (this.minimapCanvas) {
            this.minimapCanvas.width = 180;
            this.minimapCanvas.height = 180;
        }
        
        // Difficulty selection
        this.selectedDifficulty = 'normal';
        this.setupDifficultyButtons();
        
        // Course selection
        this.selectedCourse = 'grassland';
        this.setupCourseSelection();

        // Button handlers
        this.setupButtons();

        // Item icon cache
        this.iconCache = new Map();
    }
    
    setupDifficultyButtons() {
        const diffButtons = document.querySelectorAll('.diff-btn');
        diffButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                diffButtons.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.selectedDifficulty = btn.dataset.difficulty;
            });
        });
    }
    
    setupCourseSelection() {
        const courseCards = document.querySelectorAll('.course-card');
        courseCards.forEach(card => {
            card.addEventListener('click', () => {
                courseCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.selectedCourse = card.dataset.course;
            });
        });
        
        // Select first course by default
        if (courseCards.length > 0) {
            courseCards[0].classList.add('selected');
        }
    }
    
    setupButtons() {
        console.log('=== setupButtons start ===');
        
        // Start button (now opens course select)
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                console.log('START BUTTON clicked');
                this.showCourseSelect();
            });
        }
        
        // Course select back button
        const courseBackBtn = document.getElementById('course-back-btn');
        if (courseBackBtn) {
            courseBackBtn.addEventListener('click', () => {
                this.showMainMenu();
            });
        }
        
        // Course select start button
        const courseStartBtn = document.getElementById('course-start-btn');
        console.log('courseStartBtn:', courseStartBtn);
        if (courseStartBtn) {
            courseStartBtn.addEventListener('click', () => {
                console.log('=== START RACE button clicked ===');
                console.log('selectedDifficulty:', this.selectedDifficulty);
                console.log('selectedCourse:', this.selectedCourse);
                console.log('window.game:', window.game);
                if (window.game) {
                    console.log('Calling startRace...');
                    window.game.startRace(this.selectedDifficulty, this.selectedCourse);
                } else {
                    console.error('window.game does not exist!');
                    alert('Error: Game not initialized');
                }
            });
        } else {
            console.error('courseStartBtn not found!');
        }
        
        // Other button handlers...
        // (truncated for brevity - full implementation in repository)
    }
    
    // ... rest of UI manager implementation (truncated for brevity)
    // Full file will be available in repository
}

// Export class if using modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}