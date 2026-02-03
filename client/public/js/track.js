// Track generation and management

class Track {
    constructor(scene, courseData = null) {
        this.scene = scene;
        this.trackGroup = new THREE.Group();
        this.scene.add(this.trackGroup);
        
        // Course data from JSON (if provided)
        this.courseData = courseData;
        // Theme is in meta.theme for JSON courses, or directly in theme for legacy
        this.currentTheme = courseData?.meta?.theme || courseData?.theme || 'grassland';
        console.log('Track constructor - theme:', this.currentTheme, 'courseData:', courseData?.meta?.id);
        
        // Track properties (can be overridden by course data)
        this.trackWidth = courseData?.track?.width || 25;
        this.wallHeight = 3;
        
        // Track path waypoints - Convert from JSON to Vector3 if available, otherwise fallback
        // Note: waypoints processing is done in buildTrack()
        this.waypoints = null; // initialized in buildTrack()
        this.trackLength = 0;
        
        // Collision boundaries
        this.innerBoundary = [];
        this.outerBoundary = [];
        
        // Track features
        this.boostPads = [];
        this.itemBoxes = [];
        this.hazards = [];
        
        // Checkpoints for lap counting
        this.checkpoints = [];
        this.finishLine = null;
        
        // Enemy characters (Thwomps, Koopas)
        this.enemies = [];
        
        // Theme-specific elements
        this.themeElements = [];
        this.ambientParticles = [];
        
        // Physics modifiers from course data (complete physics parameters)
        this.physics = {
            friction: courseData?.physics?.friction ?? 0.97,
            iceFriction: courseData?.physics?.iceFriction ?? 0.75,
            gravity: courseData?.physics?.gravity ?? 35,
            topSpeed: courseData?.physics?.topSpeed ?? 1.0,
            boostMultiplier: courseData?.physics?.boostMultiplier ?? 1.6,
            jumpForce: courseData?.physics?.jumpForce ?? 20,
            slideMultiplier: courseData?.physics?.slideMultiplier ?? 1.0,
            airResistance: courseData?.physics?.airResistance ?? 0.995
        };
        console.log('Track physics initialized:', this.physics);
        
        // Build the track
        this.buildTrack();
        this.addEnvironment();
        // this.addBoostPads();  // Boost pads disabled
        this.addItemBoxes();
        
        // Add enemy characters (with try-catch for error handling)
        try {
            this.addEnemies();
        } catch (e) {
            console.error('Enemy character addition error:', e);
            this.enemies = [];
        }
        
        // Add theme-specific elements
        if (courseData) {
            this.applyThemeElements();
            this.addCourseDecorations();
            this.addCourseHazards();
        }
    }
    
    // ... rest of track implementation (truncated for brevity)
    // Full file will be available in repository
}

// Export class if using modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Track;
}