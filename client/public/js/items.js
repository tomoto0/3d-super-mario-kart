// Item system - handles all power-ups and projectiles

class ItemManager {
    constructor(scene, track) {
        this.scene = scene;
        this.track = track;
        
        // Current course (for course-specific items)
        this.currentCourse = null;
        
        // Active projectiles and hazards
        this.projectiles = [];
        this.hazards = [];
        
        // Projectile meshes container
        this.itemGroup = new THREE.Group();
        this.scene.add(this.itemGroup);
    }
    
    // Set current course for course-specific items
    setCourse(courseName) {
        this.currentCourse = courseName;
    }
    
    useItem(kart, itemType) {
        switch (itemType.id) {
            case 'rocket_boost':
                this.useRocketBoost(kart);
                break;
            case 'triple_boost':
                this.useTripleBoost(kart);
                break;
            case 'homing_missile':
                this.fireHomingMissile(kart);
                break;
            case 'banana':
                this.dropBanana(kart);
                break;
            case 'oil_slick':
                this.dropOilSlick(kart);
                break;
            case 'shield':
                this.activateShield(kart);
                break;
            case 'lightning':
                this.useLightning(kart);
                break;
            case 'teleport':
                this.useTeleport(kart);
                break;
            case 'time_freeze':
                this.useTimeFreeze(kart);
                break;
            case 'star':
                this.useStar(kart);
                break;
            case 'green_shell':
                this.fireGreenShell(kart);
                break;
            case 'red_shell':
                this.fireRedShell(kart);
                break;
            // Course-specific items
            case 'snowball':
                this.fireSnowball(kart);
                break;
            case 'fireball':
                this.fireFireball(kart);
                break;
        }
    }
    
    // ========================================
    // COURSE-SPECIFIC ITEMS
    // ========================================
    
    // Snowball - Snow course only
    // Freezes target in ice for 2 seconds
    fireSnowball(kart) {
        const snowball = this.createSnowball(kart);
        this.projectiles.push(snowball);
        
        if (window.audioManager) {
            window.audioManager.playSound('snowball_throw');
        }
    }
    
    createSnowball(kart) {
        const snowballGroup = new THREE.Group();
        
        // Main sphere (chunky snowball)
        const mainGeo = new THREE.SphereGeometry(0.8, 16, 12);
        const snowMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.9,
            metalness: 0.0,
            emissive: 0x88ccff,
            emissiveIntensity: 0.2
        });
        const mainSphere = new THREE.Mesh(mainGeo, snowMat);
        snowballGroup.add(mainSphere);
        
        // ... rest of item implementation (truncated for brevity)
        // Full file will be available in repository
        
        return {
            mesh: snowballGroup,
            type: 'snowball',
            position: kart.position.clone(),
            direction: this.getForwardVector(kart),
            speed: 80,
            life: 3.0,
            owner: kart
        };
    }
    
    // ... rest of item manager implementation (truncated for brevity)
    // Full file will be available in repository
}

// Export class if using modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ItemManager;
}