/**
 * Track Loader - JSON-based course data management
 * Loads courses from JSON files and manages track transitions with proper memory cleanup
 */

class TrackLoader {
    constructor() {
        this.loadedCourses = new Map();
        this.currentCourse = null;
        this.courseManifest = null;
    }

    /**
     * Initialize the track loader and load the course manifest
     */
    async init() {
        try {
            const response = await fetch('/courses/manifest.json');
            if (response.ok) {
                this.courseManifest = await response.json();
            } else {
                // Default manifest if file doesn't exist
                this.courseManifest = {
                    courses: ['grassland', 'snow', 'castle'],
                    default: 'grassland'
                };
            }
        } catch (e) {
            console.warn('Could not load course manifest, using defaults');
            this.courseManifest = {
                courses: ['grassland', 'snow', 'castle'],
                default: 'grassland'
            };
        }
        return this;
    }

    /**
     * Load a course by ID
     * @param {string} courseId - The course identifier
     * @returns {Promise<Object>} The course data
     */
    async loadCourse(courseId) {
        // Check cache first
        if (this.loadedCourses.has(courseId)) {
            return this.loadedCourses.get(courseId);
        }

        try {
            const response = await fetch(`/courses/${courseId}.json`);
            if (!response.ok) {
                throw new Error(`Course ${courseId} not found`);
            }

            const courseData = await response.json();
            
            // Validate course data
            if (!this.validateCourseData(courseData)) {
                throw new Error(`Invalid course data for ${courseId}`);
            }

            // Cache the loaded course
            this.loadedCourses.set(courseId, courseData);
            this.currentCourse = courseId;

            return courseData;
        } catch (error) {
            console.error(`Failed to load course ${courseId}:`, error);
            
            // Fall back to default course generation
            return this.generateDefaultCourse(courseId);
        }
    }

    /**
     * Validate course data structure
     * @param {Object} data - Course data to validate
     * @returns {boolean}
     */
    validateCourseData(data) {
        if (!data || typeof data !== 'object') return false;
        if (!data.meta || !data.meta.id) return false;
        if (!data.track || !Array.isArray(data.track.waypoints)) return false;
        if (data.track.waypoints.length < 4) return false;
        return true;
    }

    /**
     * Generate default course data (fallback)
     * @param {string} courseId 
     * @returns {Object}
     */
    generateDefaultCourse(courseId) {
        // Map courseId to theme
        const themeMap = {
            'grassland': 'grassland',
            'snow': 'snow',
            'castle': 'castle',
            'rainbow': 'rainbow'
        };
        
        const theme = themeMap[courseId] || 'grassland';
        
        // Generate simple oval track
        const waypoints = [];
        const radius = 50;
        const points = 16;
        
        for (let i = 0; i < points; i++) {
            const angle = (i / points) * Math.PI * 2;
            waypoints.push({
                x: Math.cos(angle) * radius,
                y: 0,
                z: Math.sin(angle) * radius
            });
        }
        
        return {
            meta: {
                id: courseId,
                name: courseId.charAt(0).toUpperCase() + courseId.slice(1) + ' Circuit',
                theme: theme,
                difficulty: 'normal',
                laps: 3,
                generated: true
            },
            track: {
                waypoints: waypoints,
                width: 12,
                startingGrid: [
                    { x: 0, y: 0, z: -radius + 10, rotation: 0 },
                    { x: -4, y: 0, z: -radius + 8, rotation: 0 },
                    { x: 4, y: 0, z: -radius + 8, rotation: 0 },
                    { x: -8, y: 0, z: -radius + 6, rotation: 0 }
                ]
            },
            // ... Complete default course generation
            // Available in GitHub repository
        };
    }
    
    // ... Additional course loading and management methods
    // Available in GitHub repository
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TrackLoader;
}