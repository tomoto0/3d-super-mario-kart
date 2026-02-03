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
    
    /**
     * Release all active objects
     * @param {Function} resetFn - Optional reset function
     */
    releaseAll(resetFn = null) {
        this.active.forEach(obj => this.release(obj, resetFn));
    }
    
    /**
     * Dispose all objects and clear the pool
     * @param {Function} disposeFn - Custom dispose function
     */
    dispose(disposeFn = null) {
        const allObjects = [...this.pool, ...this.active];
        
        allObjects.forEach(obj => {
            if (disposeFn) {
                disposeFn(obj);
            } else if (obj.geometry && obj.material) {
                obj.geometry.dispose();
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(m => m.dispose());
                } else {
                    obj.material.dispose();
                }
            }
        });
        
        this.pool = [];
        this.active.clear();
    }
    
    /**
     * Get pool statistics
     */
    getStats() {
        return {
            ...this.stats,
            pooled: this.pool.length,
            active: this.active.size,
            total: this.pool.length + this.active.size
        };
    }
}

// ============================================================================
// Geometry Registry - Shared geometry management
// ============================================================================
class GeometryRegistry {
    constructor() {
        this.geometries = new Map();
        this.materials = new Map();
        this.refCounts = new Map();
    }
    
    /**
     * Get or create a shared geometry
     * @param {string} key - Unique identifier for the geometry
     * @param {Function} factory - Factory function to create geometry
     * @returns {THREE.BufferGeometry}
     */
    getGeometry(key, factory) {
        if (!this.geometries.has(key)) {
            this.geometries.set(key, factory());
            this.refCounts.set(`geo_${key}`, 0);
        }
        this.refCounts.set(`geo_${key}`, (this.refCounts.get(`geo_${key}`) || 0) + 1);
        return this.geometries.get(key);
    }
    
    /**
     * Get or create a shared material
     * @param {string} key - Unique identifier for the material
     * @param {Function} factory - Factory function to create material
     * @returns {THREE.Material}
     */
    getMaterial(key, factory) {
        if (!this.materials.has(key)) {
            this.materials.set(key, factory());
            this.refCounts.set(`mat_${key}`, 0);
        }
        this.refCounts.set(`mat_${key}`, (this.refCounts.get(`mat_${key}`) || 0) + 1);
        return this.materials.get(key);
    }
    
    /**
     * Release a reference to a geometry
     * @param {string} key - Geometry key
     */
    releaseGeometry(key) {
        const refKey = `geo_${key}`;
        const count = (this.refCounts.get(refKey) || 1) - 1;
        this.refCounts.set(refKey, count);
        
        if (count <= 0 && this.geometries.has(key)) {
            this.geometries.get(key).dispose();
            this.geometries.delete(key);
            this.refCounts.delete(refKey);
        }
    }
    
    /**
     * Release a reference to a material
     * @param {string} key - Material key
     */
    releaseMaterial(key) {
        const refKey = `mat_${key}`;
        const count = (this.refCounts.get(refKey) || 1) - 1;
        this.refCounts.set(refKey, count);
        
        if (count <= 0 && this.materials.has(key)) {
            this.materials.get(key).dispose();
            this.materials.delete(key);
            this.refCounts.delete(refKey);
        }
    }
    
    /**
     * Dispose all geometries and materials
     */
    dispose() {
        this.geometries.forEach(geo => geo.dispose());
        this.materials.forEach(mat => mat.dispose());
        this.geometries.clear();
        this.materials.clear();
        this.refCounts.clear();
    }
    
    /**
     * Get registry statistics
     */
    getStats() {
        return {
            geometries: this.geometries.size,
            materials: this.materials.size
        };
    }
}

// ============================================================================
// Memory Monitor - FPS and memory tracking with auto-GC
// ============================================================================
class MemoryMonitor {
    constructor(renderer, options = {}) {
        this.renderer = renderer;
        this.options = {
            fpsThreshold: 30,           // Trigger cleanup below this FPS
            checkInterval: 1000,        // Check every 1 second
            memoryWarningMB: 500,       // Warn above this memory usage
            autoGC: true,               // Enable automatic garbage collection hints
            ...options
        };
        
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 60;
        this.fpsHistory = [];
        this.callbacks = {
            onLowFPS: [],
            onHighMemory: [],
            onCleanup: []
        };
        
        this.isMonitoring = false;
        this.intervalId = null;
    }
    
    /**
     * Start monitoring
     */
    start() {
        if (this.isMonitoring) return;
        this.isMonitoring = true;
        this.lastTime = performance.now();
        
        this.intervalId = setInterval(() => this.check(), this.options.checkInterval);
    }
    
    /**
     * Stop monitoring
     */
    stop() {
        this.isMonitoring = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    
    /**
     * Call this every frame to track FPS
     */
    tick() {
        this.frameCount++;
    }
    
    /**
     * Perform periodic checks
     */
    check() {
        const now = performance.now();
        const elapsed = now - this.lastTime;
        
        // Calculate FPS
        this.fps = Math.round((this.frameCount * 1000) / elapsed);
        this.fpsHistory.push(this.fps);
        if (this.fpsHistory.length > 60) {
            this.fpsHistory.shift();
        }
        
        this.frameCount = 0;
        this.lastTime = now;
        
        // Check for low FPS
        if (this.fps < this.options.fpsThreshold) {
            this.callbacks.onLowFPS.forEach(cb => cb(this.fps));
            
            if (this.options.autoGC) {
                this.suggestCleanup();
            }
        }
        
        // Check memory usage (if available)
        const memoryInfo = this.getMemoryInfo();
        if (memoryInfo.usedMB > this.options.memoryWarningMB) {
            this.callbacks.onHighMemory.forEach(cb => cb(memoryInfo));
        }
    }
    
    /**
     * Get Three.js renderer memory info
     */
    getMemoryInfo() {
        const info = this.renderer?.info?.memory || {};
        const performance = window.performance?.memory || {};
        
        return {
            geometries: info.geometries || 0,
            textures: info.textures || 0,
            usedMB: performance.usedJSHeapSize 
                ? Math.round(performance.usedJSHeapSize / 1024 / 1024) 
                : 0,
            totalMB: performance.totalJSHeapSize
                ? Math.round(performance.totalJSHeapSize / 1024 / 1024)
                : 0
        };
    }
    
    /**
     * Get render info from Three.js
     */
    getRenderInfo() {
        const info = this.renderer?.info?.render || {};
        return {
            calls: info.calls || 0,
            triangles: info.triangles || 0,
            points: info.points || 0,
            lines: info.lines || 0
        };
    }
    
    /**
     * Suggest cleanup to the garbage collector
     */
    suggestCleanup() {
        this.callbacks.onCleanup.forEach(cb => cb());
        
        // Force a minor GC hint (not guaranteed)
        if (window.gc) {
            window.gc();
        }
    }
    
    /**
     * Register callback for low FPS events
     * @param {Function} callback
     */
    onLowFPS(callback) {
        this.callbacks.onLowFPS.push(callback);
    }
    
    /**
     * Register callback for high memory events
     * @param {Function} callback
     */
    onHighMemory(callback) {
        this.callbacks.onHighMemory.push(callback);
    }
    
    /**
     * Register callback for cleanup events
     * @param {Function} callback
     */
    onCleanup(callback) {
        this.callbacks.onCleanup.push(callback);
    }
    
    /**
     * Get current stats
     */
    getStats() {
        const avgFPS = this.fpsHistory.length > 0
            ? Math.round(this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length)
            : 60;
        
        return {
            fps: this.fps,
            avgFPS,
            minFPS: Math.min(...this.fpsHistory, 60),
            maxFPS: Math.max(...this.fpsHistory, 0),
            memory: this.getMemoryInfo(),
            render: this.getRenderInfo()
        };
    }
}

// ============================================================================
// Particle Pool Manager - Specialized pool for particle systems
// ============================================================================
class ParticlePoolManager {
    constructor(scene) {
        this.scene = scene;
        this.registry = new GeometryRegistry();
        this.pools = {};
        
        // Pre-create shared geometries
        this.initSharedGeometries();
    }
    
    /**
     * Initialize shared geometries for all particle types
     */
    initSharedGeometries() {
        // Small sphere for sparks
        this.registry.getGeometry('spark_sphere', () => 
            new THREE.SphereGeometry(0.1, 4, 4)
        );
        
        // Medium sphere for flames
        this.registry.getGeometry('flame_sphere', () => 
            new THREE.SphereGeometry(0.15, 6, 6)
        );
        
        // Large sphere for explosions
        this.registry.getGeometry('explosion_sphere', () => 
            new THREE.SphereGeometry(0.3, 8, 8)
        );
        
        // Plane for speed lines
        this.registry.getGeometry('speed_plane', () => 
            new THREE.PlaneGeometry(0.1, 2)
        );
        
        // Dust plane
        this.registry.getGeometry('dust_plane', () => 
            new THREE.PlaneGeometry(0.5, 0.5)
        );
        
        // Snowflake plane
        this.registry.getGeometry('snowflake', () =>
            new THREE.PlaneGeometry(0.3, 0.3)
        );
    }
    
    /**
     * Get or create a particle pool
     * @param {string} type - Particle type
     * @param {Function} factory - Factory function
     * @param {number} initialSize - Initial pool size
     */
    getPool(type, factory, initialSize = 50) {
        if (!this.pools[type]) {
            this.pools[type] = new ObjectPool(factory, initialSize, initialSize * 4);
        }
        return this.pools[type];
    }
    
    /**
     * Create a spark particle using pooled resources
     */
    createSparkParticle(color = 0xffaa00) {
        const geometry = this.registry.getGeometry('spark_sphere', () => 
            new THREE.SphereGeometry(0.1, 4, 4)
        );
        
        const matKey = `spark_mat_${color.toString(16)}`;
        const material = this.registry.getMaterial(matKey, () => 
            new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 1
            })
        );
        
        const mesh = new THREE.Mesh(geometry, material.clone());
        mesh.visible = false;
        this.scene.add(mesh);
        
        return mesh;
    }
    
    /**
     * Create a flame particle using pooled resources
     */
    createFlameParticle() {
        const geometry = this.registry.getGeometry('flame_sphere', () => 
            new THREE.SphereGeometry(0.15, 6, 6)
        );
        
        const material = this.registry.getMaterial('flame_mat', () => 
            new THREE.MeshBasicMaterial({
                color: 0xff4400,
                transparent: true,
                opacity: 0.8
            })
        ).clone();
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.visible = false;
        this.scene.add(mesh);
        
        return mesh;
    }
    
    /**
     * Create a dust particle using pooled resources
     */
    createDustParticle() {
        const geometry = this.registry.getGeometry('dust_plane', () => 
            new THREE.PlaneGeometry(0.5, 0.5)
        );
        
        const material = this.registry.getMaterial('dust_mat', () => 
            new THREE.MeshBasicMaterial({
                color: 0x8B7355,
                transparent: true,
                opacity: 0.5,
                side: THREE.DoubleSide
            })
        ).clone();
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.visible = false;
        this.scene.add(mesh);
        
        return mesh;
    }
    
    /**
     * Create a speed line using pooled resources
     */
    createSpeedLine() {
        const geometry = this.registry.getGeometry('speed_plane', () => 
            new THREE.PlaneGeometry(0.1, 2)
        );
        
        const material = this.registry.getMaterial('speed_mat', () => 
            new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.3,
                side: THREE.DoubleSide
            })
        ).clone();
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.visible = false;
        this.scene.add(mesh);
        
        return mesh;
    }
    
    /**
     * Dispose all pools
     */
    dispose() {
        Object.values(this.pools).forEach(pool => {
            pool.dispose((obj) => {
                if (obj.parent) {
                    obj.parent.remove(obj);
                }
                // Don't dispose geometry (shared) but dispose cloned material
                if (obj.material && !obj.material.__shared) {
                    obj.material.dispose();
                }
            });
        });
        
        this.registry.dispose();
        this.pools = {};
    }
    
    /**
     * Get statistics for all pools
     */
    getStats() {
        const stats = {};
        Object.entries(this.pools).forEach(([type, pool]) => {
            stats[type] = pool.getStats();
        });
        stats.registry = this.registry.getStats();
        return stats;
    }
}

// ============================================================================
// Global Pool Manager Instance
// ============================================================================
class PoolManager {
    static instance = null;
    
    static init(scene, renderer) {
        if (!PoolManager.instance) {
            PoolManager.instance = {
                particles: new ParticlePoolManager(scene),
                geometry: new GeometryRegistry(),
                memory: new MemoryMonitor(renderer),
                objectPools: {}
            };
            
            // Setup memory monitoring
            PoolManager.instance.memory.onLowFPS((fps) => {
                console.warn(`Low FPS detected: ${fps}`);
            });
            
            PoolManager.instance.memory.onCleanup(() => {
                // Release inactive particles
                const particles = PoolManager.instance.particles;
                Object.values(particles.pools).forEach(pool => {
                    // Keep only necessary pooled objects
                    while (pool.pool.length > 20) {
                        const obj = pool.pool.pop();
                        if (obj.parent) obj.parent.remove(obj);
                        if (obj.material) obj.material.dispose();
                    }
                });
            });
            
            PoolManager.instance.memory.start();
        }
        return PoolManager.instance;
    }
    
    static get() {
        return PoolManager.instance;
    }
    
    static dispose() {
        if (PoolManager.instance) {
            PoolManager.instance.particles.dispose();
            PoolManager.instance.geometry.dispose();
            PoolManager.instance.memory.stop();
            PoolManager.instance = null;
        }
    }
}

// Export for use in other modules
window.ObjectPool = ObjectPool;
window.GeometryRegistry = GeometryRegistry;
window.MemoryMonitor = MemoryMonitor;
window.ParticlePoolManager = ParticlePoolManager;
window.PoolManager = PoolManager;
