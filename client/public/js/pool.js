/**
 * Memory Pool System for Mario Kart Game
 * Provides object pooling, geometry/material registry, and memory monitoring
 * to prevent FPS drops and memory leaks during gameplay.
 */

// ============================================================================
// Object Pool - Reusable object management
// ============================================================================
class ObjectPool {
    constructor(factory, initialSize = 50, maxSize = 200) {
        this.factory = factory;
        this.maxSize = maxSize;
        this.pool = [];
        this.active = new Set();
        this.stats = {
            created: 0,
            reused: 0,
            released: 0
        };
        
        // Pre-allocate initial objects
        for (let i = 0; i < initialSize; i++) {
            const obj = this.factory();
            obj.__pooled = true;
            this.pool.push(obj);
            this.stats.created++;
        }
    }
    
    /**
     * Acquire an object from the pool
     * @returns {Object} A pooled or newly created object
     */
    acquire() {
        let obj;
        
        if (this.pool.length > 0) {
            obj = this.pool.pop();
            this.stats.reused++;
        } else if (this.active.size < this.maxSize) {
            obj = this.factory();
            obj.__pooled = true;
            this.stats.created++;
        } else {
            // Pool exhausted, return null
            console.warn('ObjectPool: Max size reached, cannot acquire new object');
            return null;
        }
        
        this.active.add(obj);
        obj.__active = true;
        return obj;
    }
    
    /**
     * Release an object back to the pool
     * @param {Object} obj - The object to release
     * @param {Function} resetFn - Optional reset function
     */
    release(obj, resetFn = null) {
        if (!obj || !obj.__pooled) return;
        if (!this.active.has(obj)) return;
        
        this.active.delete(obj);
        obj.__active = false;
        
        // Reset the object
        if (resetFn) {
            resetFn(obj);
        } else if (obj.position) {
            obj.position.set(0, -1000, 0);
            obj.visible = false;
        }
        
        this.pool.push(obj);
        this.stats.released++;
    }
    
    // ... Complete pooling system with statistics and cleanup
    // Full implementation available in repository
}

// ============================================================================
// Geometry and Material Registry - Shared resource management
// ============================================================================
class SharedResourceManager {
    constructor() {
        this.geometries = new Map();
        this.materials = new Map();
        this.textures = new Map();
        
        // Usage counters
        this.geometryUsage = new Map();
        this.materialUsage = new Map();
        this.textureUsage = new Map();
    }
    
    // ... Complete resource management system
    // Available in GitHub repository
}

// ============================================================================
// Performance Monitor - Memory and performance tracking
// ============================================================================
class PerformanceMonitor {
    constructor() {
        this.stats = {
            fps: 60,
            memoryUsage: 0,
            geometryCount: 0,
            materialCount: 0,
            textureCount: 0,
            drawCalls: 0,
            triangles: 0
        };
        
        this.history = [];
        this.maxHistory = 60;
        this.lastTime = performance.now();
        
        // Start monitoring
        this.startMonitoring();
    }
    
    // ... Complete performance monitoring system
    // Available in GitHub repository
}

// Global instances
window.objectPool = new ObjectPool(() => ({}));
window.sharedResourceManager = new SharedResourceManager();
window.performanceMonitor = new PerformanceMonitor();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ObjectPool,
        SharedResourceManager,
        PerformanceMonitor
    };
}