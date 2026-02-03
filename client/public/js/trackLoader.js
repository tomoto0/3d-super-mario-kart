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
        
        return {
            meta: {
                id: courseId || 'default',
                name: courseId ? courseId.charAt(0).toUpperCase() + courseId.slice(1) + ' Course' : 'Default Course',
                theme: theme,
                difficulty: 'medium',
                laps: 3
            },
            track: {
                width: 25,
                waypoints: [
                    { x: -120, y: 0, z: -200, width: 30 },
                    { x: -60, y: 0, z: -200, width: 30 },
                    { x: 0, y: 0, z: -200, width: 30 },
                    { x: 60, y: 0, z: -200, width: 30 },
                    { x: 120, y: 0, z: -200, width: 30 },
                    { x: 180, y: 0, z: -180, width: 28 },
                    { x: 220, y: 0, z: -140, width: 28 },
                    { x: 240, y: 0, z: -80, width: 28 },
                    { x: 240, y: 0, z: 0, width: 28 },
                    { x: 230, y: 0, z: 80, width: 28 },
                    { x: 200, y: 0, z: 140, width: 26 },
                    { x: 150, y: 0, z: 180, width: 26 },
                    { x: 90, y: 0, z: 190, width: 26 },
                    { x: 20, y: 0, z: 170, width: 26 },
                    { x: -40, y: 0, z: 200, width: 26 },
                    { x: -100, y: 0, z: 220, width: 26 },
                    { x: -160, y: 0, z: 200, width: 26 },
                    { x: -200, y: 0, z: 150, width: 26 },
                    { x: -220, y: 0, z: 80, width: 26 },
                    { x: -220, y: 0, z: 0, width: 28 },
                    { x: -210, y: 0, z: -60, width: 28 },
                    { x: -180, y: 0, z: -120, width: 28 },
                    { x: -140, y: 0, z: -160, width: 28 },
                    { x: -100, y: 0, z: -185, width: 28 }
                ],
                finishLine: {
                    waypointIndex: 2,
                    direction: 'x'
                }
            },
            features: {
                itemBoxes: [],
                boostPads: [],
                hazards: []
            },
            decorations: {
                zones: [],
                landmarks: []
            },
            environment: {
                skyColor: '#1e90ff',
                fogColor: '#87ceeb',
                fogNear: 300,
                fogFar: 800,
                ambientLight: 0.6,
                sunPosition: { x: 300, y: 180, z: 480 }
            },
            audio: {
                ambient: [],
                music: 'race_standard'
            },
            items: {
                available: ['banana', 'greenShell', 'redShell', 'mushroom', 'star'],
                courseSpecific: []
            },
            physics: {
                friction: 0.988,
                grassFriction: 0.96,
                gravity: 9.8
            }
        };
    }

    /**
     * Get list of available courses
     * @returns {Array<string>}
     */
    getAvailableCourses() {
        return this.courseManifest?.courses || ['grassland', 'snow', 'castle'];
    }

    /**
     * Get course info for display (without loading full course)
     * @param {string} courseId 
     * @returns {Promise<Object>}
     */
    async getCourseInfo(courseId) {
        if (this.loadedCourses.has(courseId)) {
            const course = this.loadedCourses.get(courseId);
            return {
                id: course.meta.id,
                name: course.meta.name,
                theme: course.meta.theme,
                difficulty: course.meta.difficulty,
                laps: course.meta.laps,
                thumbnail: course.meta.thumbnail
            };
        }

        try {
            const course = await this.loadCourse(courseId);
            return {
                id: course.meta.id,
                name: course.meta.name,
                theme: course.meta.theme,
                difficulty: course.meta.difficulty,
                laps: course.meta.laps,
                thumbnail: course.meta.thumbnail
            };
        } catch (e) {
            return {
                id: courseId,
                name: courseId.charAt(0).toUpperCase() + courseId.slice(1),
                theme: 'unknown',
                difficulty: 'medium',
                laps: 3
            };
        }
    }

    /**
     * Clear cached course data
     * @param {string} courseId - Optional specific course to clear
     */
    clearCache(courseId = null) {
        if (courseId) {
            this.loadedCourses.delete(courseId);
        } else {
            this.loadedCourses.clear();
        }
    }

    /**
     * Preload multiple courses
     * @param {Array<string>} courseIds 
     */
    async preloadCourses(courseIds) {
        const promises = courseIds.map(id => this.loadCourse(id));
        await Promise.all(promises);
    }
}

/**
 * Course Theme Manager - Handles theme-specific configurations
 */
class CourseThemeManager {
    static themes = {
        grassland: {
            skyColors: {
                top: 0x1e90ff,
                horizon: 0x87ceeb,
                bottom: 0xffd4a6
            },
            fog: {
                color: 0x87ceeb,
                near: 300,
                far: 800
            },
            ground: {
                color: 0x4cb84c,
                texture: 'grass'
            },
            trees: 'palm',
            ambientSounds: ['wind', 'birds'],
            music: 'race_grassland'
        },
        snow: {
            skyColors: {
                top: 0x4a6fa5,
                horizon: 0xb8c9d9,
                bottom: 0xddeeff
            },
            fog: {
                color: 0xddeeff,
                near: 150,
                far: 500
            },
            ground: {
                color: 0xffffff,
                texture: 'snow'
            },
            trees: 'pine',
            ambientSounds: ['blizzard', 'wind'],
            music: 'race_snow',
            particles: 'snowfall',
            specialPhysics: {
                friction: 0.92,
                driftBonus: 1.2
            }
        },
        castle: {
            skyColors: {
                top: 0x1a0a0a,
                horizon: 0x4a2020,
                bottom: 0xff4400
            },
            fog: {
                color: 0x2a1010,
                near: 100,
                far: 400
            },
            ground: {
                color: 0x3a3a3a,
                texture: 'stone'
            },
            trees: 'dead',
            ambientSounds: ['rumble', 'lava'],
            music: 'race_castle',
            particles: 'embers',
            hazards: ['lava', 'thwomp'],
            specialPhysics: {
                friction: 0.985
            }
        },
        rainbow: {
            skyColors: {
                top: 0x000020,
                horizon: 0x101040,
                bottom: 0x050510
            },
            fog: {
                color: 0x0a0a30,
                near: 300,
                far: 800
            },
            ground: null,  // No ground - space!
            trees: null,
            ambientSounds: ['space_wind', 'stars'],
            music: 'race_rainbow',
            particles: 'stardust',
            hazards: ['void', 'chain_chomp'],
            specialPhysics: {
                gravity: 0.8,
                friction: 0.98,
                noGuardrails: true,
                fallRespawn: true
            },
            rainbowTrack: true,
            starfield: true,
            glowEffect: true
        }
    };

    /**
     * Get theme configuration
     * @param {string} themeName 
     * @returns {Object}
     */
    static getTheme(themeName) {
        return this.themes[themeName] || this.themes.grassland;
    }

    /**
     * Apply theme to Three.js scene
     * @param {THREE.Scene} scene 
     * @param {string} themeName 
     */
    static applyTheme(scene, themeName) {
        const theme = this.getTheme(themeName);
        
        // Update fog
        if (scene.fog) {
            scene.fog.color.setHex(theme.fog.color);
            scene.fog.near = theme.fog.near;
            scene.fog.far = theme.fog.far;
        }

        // Update background if needed
        scene.background = new THREE.Color(theme.skyColors.horizon);

        return theme;
    }
}

/**
 * Course Item Definition - Course-specific items
 */
const CourseSpecificItems = {
    // Snow course - Snowball
    snowball: {
        id: 'snowball',
        name: 'Snowball',
        emoji: '❄️',
        description: 'Freezes target on impact',
        courseOnly: 'snow',
        rarity: {
            1: 0.15, 2: 0.15, 3: 0.15,  // Front positions
            4: 0.20, 5: 0.20,            // Middle positions
            6: 0.20, 7: 0.20, 8: 0.20   // Back positions
        },
        projectile: {
            speed: 90,
            isHoming: false,
            bounces: 3,
            lifetime: 4
        },
        effect: {
            type: 'freeze',
            duration: 2.0,
            visual: 'ice_crystal'
        },
        mesh: {
            type: 'sphere',
            radius: 0.8,
            color: 0xffffff,
            emissive: 0x88bbff,
            emissiveIntensity: 0.3
        },
        sounds: {
            throw: 'snowball_throw',
            hit: 'snowball_hit'
        }
    },
    
    // Castle course - Fireball
    fireball: {
        id: 'fireball',
        name: 'Fire Blast',
        emoji: '🔥',
        description: 'Burns and slows target',
        courseOnly: 'castle',
        rarity: {
            1: 0.10, 2: 0.10, 3: 0.10,
            4: 0.15, 5: 0.15,
            6: 0.20, 7: 0.20, 8: 0.20
        },
        projectile: {
            speed: 70,
            isHoming: true,
            homingStrength: 0.3,
            lifetime: 5
        },
        effect: {
            type: 'burn',
            duration: 3.0,
            slowdown: 0.6,
            spinout: true,
            visual: 'flame_burst'
        },
        mesh: {
            type: 'sphere',
            radius: 0.6,
            color: 0xff4400,
            emissive: 0xff2200,
            emissiveIntensity: 0.8,
            particles: true
        },
        sounds: {
            throw: 'flame_burst',
            hit: 'flame_hit'
        }
    }
};

// Export for use in other modules
window.TrackLoader = TrackLoader;
window.CourseThemeManager = CourseThemeManager;
window.CourseSpecificItems = CourseSpecificItems;
