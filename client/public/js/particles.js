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
    
    // Create a pool of particles of a specific type
    createParticlePool(type, size) {
        this.particlePools[type] = {
            available: [],
            active: new Set()
        };
        
        const geometry = this.sharedGeometries[type];
        const pool = this.particlePools[type];
        
        for (let i = 0; i < size; i++) {
            const material = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 1
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.visible = false;
            mesh.__poolType = type;
            this.scene.add(mesh);
            pool.available.push(mesh);
        }
    }
    
    // Acquire a particle from the pool
    acquireParticle(type, color = 0xffffff) {
        const pool = this.particlePools[type];
        if (!pool) return null;
        
        let mesh;
        if (pool.available.length > 0) {
            mesh = pool.available.pop();
        } else {
            // Create new particle if pool exhausted (fallback)
            const geometry = this.sharedGeometries[type];
            const material = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 1
            });
            mesh = new THREE.Mesh(geometry, material);
            mesh.__poolType = type;
            this.scene.add(mesh);
        }
        
        // Reset and activate
        mesh.visible = true;
        mesh.material.color.setHex(color);
        mesh.material.opacity = 1;
        mesh.scale.set(1, 1, 1);
        mesh.rotation.set(0, 0, 0);
        pool.active.add(mesh);
        
        return mesh;
    }
    
    // Release a particle back to the pool
    releaseParticle(mesh) {
        const type = mesh.__poolType;
        const pool = this.particlePools[type];
        if (!pool) return;
        
        mesh.visible = false;
        mesh.position.set(0, -1000, 0);
        pool.active.delete(mesh);
        pool.available.push(mesh);
    }
    
    // Create drift spark particles - POOLED
    createDriftSparks(kart) {
        if (!kart.isDrifting) return null;
        
        // Determine spark color based on drift level
        let color;
        switch (kart.driftLevel) {
            case 1: color = 0x00d4ff; break; // Blue
            case 2: color = 0xffa500; break; // Orange
            case 3: color = 0x9b59b6; break; // Purple
            default: color = 0xaaaaaa; // Gray
        }
        
        const particles = [];
        const numParticles = 2;
        
        for (let i = 0; i < numParticles; i++) {
            const mesh = this.acquireParticle('spark', color);
            if (!mesh) continue;
            
            // Position at wheel
            const wheelOffset = kart.driftDirection < 0 ? -1.3 : 1.3;
            mesh.position.set(
                kart.position.x + wheelOffset + (Math.random() - 0.5) * 0.5,
                kart.position.y + 0.3 + Math.random() * 0.3,
                kart.position.z - 1.3 + (Math.random() - 0.5) * 0.5
            );
            
            particles.push({
                mesh: mesh,
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 5,
                    Math.random() * 3 + 2,
                    (Math.random() - 0.5) * 5
                ),
                lifetime: 0.3 + Math.random() * 0.2,
                maxLifetime: 0.5,
                type: 'spark'
            });
        }
        
        const group = { particles, active: true };
        this.particleGroups.push(group);
        return group;
    }
    
    // Create boost flame effect - POOLED
    createBoostFlame(kart) {
        const particles = [];
        const numParticles = 3;
        
        for (let i = 0; i < numParticles; i++) {
            const color = i % 2 === 0 ? 0xff6600 : 0xffff00;
            const mesh = this.acquireParticle('flame', color);
            if (!mesh) continue;
            
            mesh.rotation.x = Math.PI;
            
            // Position behind kart
            const behind = new THREE.Vector3(
                -Math.sin(kart.rotation),
                0,
                -Math.cos(kart.rotation)
            );
            
            mesh.position.copy(kart.position);
            mesh.position.add(behind.multiplyScalar(2.5));
            mesh.position.x += (i % 2 === 0 ? -0.6 : 0.6);
            mesh.position.y += 0.5;
            
            particles.push({
                mesh: mesh,
                velocity: behind.clone().multiplyScalar(-20),
                lifetime: 0.2,
                maxLifetime: 0.2,
                type: 'flame'
            });
        }
        
        const group = { particles, active: true };
        this.particleGroups.push(group);
        return group;
    }
    
    // Create dust/dirt particles - POOLED
    createDust(position, intensity = 1) {
        const particles = [];
        const numParticles = Math.floor(5 * intensity);
        
        for (let i = 0; i < numParticles; i++) {
            const mesh = this.acquireParticle('dust', 0x8b7355);
            if (!mesh) continue;
            
            mesh.position.copy(position);
            mesh.position.x += (Math.random() - 0.5) * 2;
            mesh.position.z += (Math.random() - 0.5) * 2;
            mesh.position.y += 0.2;
            mesh.scale.setScalar(1 + Math.random() * 0.3);
            
            particles.push({
                mesh: mesh,
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 3,
                    Math.random() * 2 + 1,
                    (Math.random() - 0.5) * 3
                ),
                lifetime: 0.5 + Math.random() * 0.3,
                maxLifetime: 0.8,
                type: 'dust'
            });
        }
        
        const group = { particles, active: true };
        this.particleGroups.push(group);
        return group;
    }
    
    // Create explosion effect - POOLED
    createExplosion(position) {
        const particles = [];
        const numParticles = 20;
        const colors = [0xff4400, 0xff6600, 0xffaa00, 0xffff00];
        
        // Core explosion particles
        for (let i = 0; i < numParticles; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            const mesh = this.acquireParticle('explosion', color);
            if (!mesh) continue;
            
            mesh.position.copy(position);
            mesh.scale.setScalar(0.8 + Math.random() * 0.6);
            
            const angle = (i / numParticles) * Math.PI * 2;
            const speed = 5 + Math.random() * 10;
            
            particles.push({
                mesh: mesh,
                velocity: new THREE.Vector3(
                    Math.cos(angle) * speed,
                    Math.random() * 8 + 2,
                    Math.sin(angle) * speed
                ),
                lifetime: 0.5 + Math.random() * 0.3,
                maxLifetime: 0.8,
                type: 'explosion'
            });
        }
        
        // Smoke particles
        for (let i = 0; i < 10; i++) {
            const mesh = this.acquireParticle('smoke', 0x333333);
            if (!mesh) continue;
            
            mesh.position.copy(position);
            mesh.position.y += 0.5;
            mesh.material.opacity = 0.7;
            
            particles.push({
                mesh: mesh,
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 3,
                    Math.random() * 5 + 3,
                    (Math.random() - 0.5) * 3
                ),
                lifetime: 1 + Math.random() * 0.5,
                maxLifetime: 1.5,
                type: 'smoke',
                scale: 1
            });
        }
        
        const group = { particles, active: true };
        this.particleGroups.push(group);
        return group;
    }
    
    // Create item pickup sparkle - POOLED
    createItemSparkle(position) {
        const particles = [];
        const numParticles = 12;
        
        for (let i = 0; i < numParticles; i++) {
            const mesh = this.acquireParticle('sparkle', 0xffff00);
            if (!mesh) continue;
            
            mesh.position.copy(position);
            
            const angle = (i / numParticles) * Math.PI * 2;
            const speed = 3 + Math.random() * 2;
            
            particles.push({
                mesh: mesh,
                velocity: new THREE.Vector3(
                    Math.cos(angle) * speed,
                    Math.random() * 4 + 2,
                    Math.sin(angle) * speed
                ),
                lifetime: 0.4 + Math.random() * 0.2,
                maxLifetime: 0.6,
                type: 'sparkle',
                rotationSpeed: Math.random() * 10
            });
        }
        
        const group = { particles, active: true };
        this.particleGroups.push(group);
        return group;
    }
    
    // Create speed lines (motion blur effect) - POOLED
    createSpeedLines(kart, intensity) {
        if (intensity < 0.7) return null;
        
        const particles = [];
        const numLines = Math.floor((intensity - 0.7) * 10);
        
        for (let i = 0; i < numLines; i++) {
            const mesh = this.acquireParticle('speedline', 0xffffff);
            if (!mesh) continue;
            
            mesh.material.opacity = 0.3;
            mesh.rotation.x = Math.PI / 2;
            mesh.rotation.z = kart.rotation;
            
            // Position around kart
            mesh.position.copy(kart.position);
            mesh.position.x += (Math.random() - 0.5) * 6;
            mesh.position.y += Math.random() * 3 + 1;
            mesh.position.z += (Math.random() - 0.5) * 6 - 3;
            
            particles.push({
                mesh: mesh,
                velocity: new THREE.Vector3(0, 0, -30),
                lifetime: 0.15,
                maxLifetime: 0.15,
                type: 'speedline'
            });
        }
        
        const group = { particles, active: true };
        this.particleGroups.push(group);
        return group;
    }
    
    // Create shield break effect - POOLED
    createShieldBreak(position) {
        const particles = [];
        const numParticles = 15;
        
        for (let i = 0; i < numParticles; i++) {
            const mesh = this.acquireParticle('shard', 0x00ffff);
            if (!mesh) continue;
            
            mesh.position.copy(position);
            mesh.material.opacity = 0.8;
            
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const speed = 5 + Math.random() * 5;
            
            particles.push({
                mesh: mesh,
                velocity: new THREE.Vector3(
                    Math.sin(phi) * Math.cos(theta) * speed,
                    Math.cos(phi) * speed,
                    Math.sin(phi) * Math.sin(theta) * speed
                ),
                lifetime: 0.6 + Math.random() * 0.3,
                maxLifetime: 0.9,
                type: 'shard',
                rotationSpeed: new THREE.Vector3(
                    Math.random() * 10,
                    Math.random() * 10,
                    Math.random() * 10
                )
            });
        }
        
        const group = { particles, active: true };
        this.particleGroups.push(group);
        return group;
    }
    
    // Create snowfall effect for snow course
    createSnowfall(bounds, intensity = 1) {
        const particles = [];
        const numParticles = Math.floor(50 * intensity);
        
        for (let i = 0; i < numParticles; i++) {
            const mesh = this.acquireParticle('snowflake', 0xffffff);
            if (!mesh) continue;
            
            mesh.position.set(
                bounds.minX + Math.random() * (bounds.maxX - bounds.minX),
                bounds.maxY || 50,
                bounds.minZ + Math.random() * (bounds.maxZ - bounds.minZ)
            );
            mesh.material.opacity = 0.8;
            
            particles.push({
                mesh: mesh,
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 2,
                    -2 - Math.random() * 2,
                    (Math.random() - 0.5) * 2
                ),
                lifetime: 5 + Math.random() * 3,
                maxLifetime: 8,
                type: 'snowflake',
                rotationSpeed: Math.random() * 2,
                bounds: bounds
            });
        }
        
        const group = { particles, active: true, persistent: true };
        this.particleGroups.push(group);
        return group;
    }
    
    // Create ember effect for castle course
    createEmbers(bounds, intensity = 1) {
        const particles = [];
        const numParticles = Math.floor(30 * intensity);
        
        for (let i = 0; i < numParticles; i++) {
            const color = Math.random() > 0.5 ? 0xff4400 : 0xff6600;
            const mesh = this.acquireParticle('ember', color);
            if (!mesh) continue;
            
            mesh.position.set(
                bounds.minX + Math.random() * (bounds.maxX - bounds.minX),
                bounds.minY || 0,
                bounds.minZ + Math.random() * (bounds.maxZ - bounds.minZ)
            );
            mesh.material.opacity = 0.9;
            
            particles.push({
                mesh: mesh,
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 3,
                    1 + Math.random() * 3,
                    (Math.random() - 0.5) * 3
                ),
                lifetime: 3 + Math.random() * 2,
                maxLifetime: 5,
                type: 'ember',
                bounds: bounds
            });
        }
        
        const group = { particles, active: true, persistent: true };
        this.particleGroups.push(group);
        return group;
    }
    
    // Create freeze effect (for snowball hit)
    createFreezeEffect(position) {
        const particles = [];
        const numParticles = 20;
        
        for (let i = 0; i < numParticles; i++) {
            const color = Math.random() > 0.5 ? 0x88ddff : 0xffffff;
            const mesh = this.acquireParticle('spark', color);
            if (!mesh) continue;
            
            mesh.position.copy(position);
            
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const speed = 3 + Math.random() * 4;
            
            particles.push({
                mesh: mesh,
                velocity: new THREE.Vector3(
                    Math.sin(phi) * Math.cos(theta) * speed,
                    Math.cos(phi) * speed + 2,
                    Math.sin(phi) * Math.sin(theta) * speed
                ),
                lifetime: 0.5 + Math.random() * 0.3,
                maxLifetime: 0.8,
                type: 'spark'
            });
        }
        
        const group = { particles, active: true };
        this.particleGroups.push(group);
        return group;
    }
    
    // Create flame burst effect (for fireball hit)
    createFlameBurst(position) {
        const particles = [];
        const numParticles = 25;
        const colors = [0xff2200, 0xff4400, 0xff6600, 0xffaa00];
        
        for (let i = 0; i < numParticles; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            const mesh = this.acquireParticle('flame', color);
            if (!mesh) continue;
            
            mesh.position.copy(position);
            mesh.rotation.x = Math.PI * Math.random();
            mesh.scale.setScalar(0.5 + Math.random() * 0.5);
            
            const angle = (i / numParticles) * Math.PI * 2;
            const speed = 4 + Math.random() * 6;
            
            particles.push({
                mesh: mesh,
                velocity: new THREE.Vector3(
                    Math.cos(angle) * speed,
                    Math.random() * 6 + 2,
                    Math.sin(angle) * speed
                ),
                lifetime: 0.4 + Math.random() * 0.3,
                maxLifetime: 0.7,
                type: 'flame'
            });
        }
        
        const group = { particles, active: true };
        this.particleGroups.push(group);
        return group;
    }
    
    // Update all particles - POOLED version
    update(deltaTime) {
        this.particleGroups = this.particleGroups.filter(group => {
            if (!group.active) return false;
            
            let allDead = true;
            
            group.particles = group.particles.filter(particle => {
                particle.lifetime -= deltaTime;
                
                // Handle persistent particle types (snowfall, embers) - loop instead of dying
                if (particle.lifetime <= 0 && group.persistent && particle.bounds) {
                    // Reset position to respawn
                    if (particle.type === 'snowflake') {
                        particle.mesh.position.set(
                            particle.bounds.minX + Math.random() * (particle.bounds.maxX - particle.bounds.minX),
                            particle.bounds.maxY || 50,
                            particle.bounds.minZ + Math.random() * (particle.bounds.maxZ - particle.bounds.minZ)
                        );
                        particle.lifetime = particle.maxLifetime;
                        particle.mesh.material.opacity = 0.8;
                    } else if (particle.type === 'ember') {
                        particle.mesh.position.set(
                            particle.bounds.minX + Math.random() * (particle.bounds.maxX - particle.bounds.minX),
                            particle.bounds.minY || 0,
                            particle.bounds.minZ + Math.random() * (particle.bounds.maxZ - particle.bounds.minZ)
                        );
                        particle.lifetime = particle.maxLifetime;
                        particle.mesh.material.opacity = 0.9;
                    }
                    allDead = false;
                    return true;
                }
                
                if (particle.lifetime <= 0) {
                    // Release back to pool instead of disposing
                    this.releaseParticle(particle.mesh);
                    return false;
                }
                
                allDead = false;
                
                // Update position
                particle.mesh.position.add(
                    particle.velocity.clone().multiplyScalar(deltaTime)
                );
                
                // Apply gravity to some particle types
                if (['spark', 'dust', 'explosion', 'sparkle', 'shard'].includes(particle.type)) {
                    particle.velocity.y -= 15 * deltaTime;
                }
                
                // Snowflake drifting
                if (particle.type === 'snowflake') {
                    particle.velocity.x = Math.sin(Date.now() * 0.001 + particle.mesh.position.z * 0.1) * 1.5;
                    if (particle.rotationSpeed) {
                        particle.mesh.rotation.y += particle.rotationSpeed * deltaTime;
                    }
                }
                
                // Ember flickering
                if (particle.type === 'ember') {
                    particle.mesh.material.opacity = 0.5 + Math.sin(Date.now() * 0.01 + particle.mesh.position.x) * 0.4;
                }
                
                // Fade out (skip for persistent types)
                if (!group.persistent) {
                    const lifeRatio = particle.lifetime / particle.maxLifetime;
                    particle.mesh.material.opacity = lifeRatio;
                }
                
                // Type-specific updates
                if (particle.type === 'smoke') {
                    // Smoke expands
                    particle.scale = (particle.scale || 1) + deltaTime * 2;
                    particle.mesh.scale.setScalar(particle.scale);
                    particle.velocity.multiplyScalar(0.95);
                }
                
                if (particle.type === 'sparkle' || particle.type === 'shard') {
                    if (particle.rotationSpeed) {
                        if (typeof particle.rotationSpeed === 'number') {
                            particle.mesh.rotation.y += particle.rotationSpeed * deltaTime;
                        } else {
                            particle.mesh.rotation.x += particle.rotationSpeed.x * deltaTime;
                            particle.mesh.rotation.y += particle.rotationSpeed.y * deltaTime;
                            particle.mesh.rotation.z += particle.rotationSpeed.z * deltaTime;
                        }
                    }
                }
                
                return true;
            });
            
            if (allDead && !group.persistent) {
                group.active = false;
                return false;
            }
            
            return true;
        });
    }
    
    // Clear all particles - POOLED version
    clear() {
        this.particleGroups.forEach(group => {
            group.particles.forEach(particle => {
                this.releaseParticle(particle.mesh);
            });
        });
        this.particleGroups = [];
    }
    
    // Dispose and cleanup pools
    dispose() {
        this.clear();
        
        // Clear pools
        Object.values(this.particlePools).forEach(pool => {
            pool.meshes.forEach(mesh => {
                this.scene.remove(mesh);
                mesh.geometry.dispose();
                mesh.material.dispose();
            });
        });
        this.particlePools = {};
        
        // Clear shared resources
        Object.values(this.sharedGeometries).forEach(geo => geo.dispose());
        this.sharedGeometries = {};
    }
    
    // Get active particle count
    getActiveCount() {
        let count = 0;
        this.particleGroups.forEach(group => {
            count += group.particles.length;
        });
        return count;
    }
    
    // Get pool statistics
    getPoolStats() {
        const stats = {};
        Object.entries(this.particlePools).forEach(([type, pool]) => {
            stats[type] = {
                total: pool.meshes.length,
                available: pool.available.length,
                inUse: pool.meshes.length - pool.available.length
            };
        });
        return stats;
    }
}

window.ParticleSystem = ParticleSystem;
