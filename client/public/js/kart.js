// Kart class - handles player and AI karts

class Kart {
    constructor(scene, colorIndex, isPlayer = false, name = 'Racer', characterId = null) {
        this.scene = scene;
        this.isPlayer = isPlayer;
        this.name = name;
        
        // Character system
        if (characterId && window.MarioCharacters && window.MarioCharacters[characterId]) {
            this.characterId = characterId;
            this.characterData = window.MarioCharacters[characterId];
            // Use character colors
            this.colorData = {
                primary: this.characterData.colors.primary,
                secondary: this.characterData.colors.secondary || 0x0000ff,
                accent: this.characterData.colors.primary,
                skin: this.characterData.colors.skin || 0xffdab3
            };
        } else {
            // Fallback to color index system
            const charOrder = window.CharacterOrder || ['mario', 'luigi', 'peach', 'toad', 'yoshi', 'bowser', 'donkeyKong', 'wario'];
            this.characterId = charOrder[colorIndex % charOrder.length];
            this.characterData = window.MarioCharacters ? window.MarioCharacters[this.characterId] : null;
            this.colorData = KartColors[colorIndex % KartColors.length];
            
            if (this.characterData) {
                this.colorData = {
                    primary: this.characterData.colors.primary,
                    secondary: this.characterData.colors.secondary || 0x0000ff,
                    accent: this.characterData.colors.primary,
                    skin: this.characterData.colors.skin || 0xffdab3
                };
            }
        }
        
        // Physics properties - アップグレード版
        this.position = new THREE.Vector3(0, 0.5, 0);
        this.lastValidPosition = new THREE.Vector3(0, 0.5, 0);  // 最後の有効な位置を保存
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.rotation = 0; // Y-axis rotation (heading)
        this.angularVelocity = 0;
        
        // Improved movement stats - arcade style (faster)
        this.baseMaxSpeed = 140;      // Base max speed (Easy = 100%)
        this.maxSpeed = 140;          // Current max speed
        this.baseAcceleration = 90;   // Base acceleration
        this.acceleration = 90;       // Current acceleration
        this.deceleration = 10;       // Natural deceleration (even more gradual)
        this.brakeStrength = 100;     // Brake strength enhanced
        this.turnSpeed = 4.0;         // Turn speed up
        this.friction = 0.992;        // Friction (smoother)
        this.grassFriction = 0.97;    // Grass penalty (mitigated)
        this.difficultyMultiplier = 1.0;  // Difficulty multiplier
        
        // Arcade physics properties
        this.grip = 1.0;              // Tire grip
        this.steeringResponse = 0.2;  // Steering response (fast)
        this.targetRotation = 0;      // Target direction (for smooth turning)
        this.lateralVelocity = 0;     // Lateral velocity (for drifting)
        this.enginePower = 0;         // Engine power (for smooth acceleration)
        this.driftGrip = 0.7;         // Grip during drift
        this.driftAngle = 0;          // Drift angle
        this.verticalVelocity = 0;    // Vertical velocity for jumping
        this.isAirborne = false;      // Whether in the air
        
        // Current state
        this.speed = 0;
        this.currentTurnAmount = 0;
        this.onGrass = false;
        this.isColliding = false;
        
        // Drift system
        this.isDrifting = false;
        this.driftDirection = 0; // -1 left, 1 right
        this.driftTime = 0;
        this.driftLevel = 0; // 0, 1, 2, 3 (blue, orange, purple)
        this.driftBoostReady = false;
        
        // Boost system
        this.boostTime = 0;
        this.boostMultiplier = 1;
        this.tripleBoostCharges = 0;
        
        // Item system
        this.currentItem = null;
        this.hasShield = false;
        this.shieldTimer = 0;  // Shield remaining time
        this.isShrunken = false;
        this.shrinkTimer = 0;
        this.isFrozen = false;
        this.freezeTimer = 0;
        this.isSpunOut = false;
        this.spinOutTimer = 0;
        this.invincibilityTimer = 0;
        
        // Race state
        this.lap = 0;
        this.checkpoint = 0;
        this.lastCheckpoint = -1;
        this.racePosition = 1;
        this.finished = false;
        this.finishTime = 0;
        this.totalProgress = 0;
        this.wrongWay = false;
        this.raceStartTime = 0;  // Race start time (to prevent false lap detection at start)
        
        // Input state (for player)
        this.input = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            drift: false,
            item: false
        };
        
        // Create 3D model
        this.mesh = this.createKartMesh();
        this.scene.add(this.mesh);
        
        // Collision box
        this.collisionRadius = 2;
        this.collisionBox = new THREE.Box3();
    }
    
    // ... rest of kart implementation (truncated for brevity)
    // Full file will be available in repository
}

// Export class if using modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Kart;
}