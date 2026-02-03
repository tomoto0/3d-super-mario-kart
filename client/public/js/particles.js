// Particle system for visual effects - Optimized with Object Pooling

class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particleGroups = [];
        this.maxParticles = 200;
        this.activeParticles = 0;
        
        // Initialize shared geometries and materials
        this.sharedGeometries = {};
        this.sharedMaterials = {};
        this.particlePools = {};
        
        // Pre-create shared resources
        this.initSharedResources();
    }
    
    // Initialize shared geometries and materials to avoid per-particle allocation
    initSharedResources() {
        // Shared geometries
        this.sharedGeometries = {
            spark: new THREE.SphereGeometry(0.1, 4, 4),
            flame: new THREE.ConeGeometry(0.2, 0.5, 4),
            dust: new THREE.SphereGeometry(0.15, 4, 4),
            explosion: new THREE.SphereGeometry(0.25, 6, 6),
            smoke: new THREE.SphereGeometry(0.4, 6, 6),
            sparkle: new THREE.OctahedronGeometry(0.15, 0),
            speedline: new THREE.CylinderGeometry(0.02, 0.02, 3, 4),
            shard: new THREE.TetrahedronGeometry(0.3, 0),
            snowflake: new THREE.CircleGeometry(0.15, 6),
            ember: new THREE.SphereGeometry(0.08, 4, 4)
        };
        
        // Pre-create particle pools for each type
        this.createParticlePool('spark', 50);
        this.createParticlePool('flame', 30);
        this.createParticlePool('dust', 40);
        this.createParticlePool('explosion', 30);
        this.createParticlePool('smoke', 20);
        this.createParticlePool('sparkle', 20);
        this.createParticlePool('speedline', 15);
        this.createParticlePool('shard', 20);
        this.createParticlePool('snowflake', 100);
        this.createParticlePool('ember', 50);
    }
    
    // ... Complete implementation truncated for upload
    // Full particle system with pooling, effects, and cleanup
    // Available in GitHub repository
}

// Export class if using modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ParticleSystem;
}