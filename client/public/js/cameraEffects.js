// Camera Effects System - Mario Kart style camera with dynamic effects

class CameraEffectsManager {
    constructor(camera, scene, renderer) {
        this.camera = camera;
        this.scene = scene;
        this.renderer = renderer;
        
        // Camera modes
        this.cameraMode = 'follow'; // follow, wide, close, cinematic
        this.cameraModes = {
            follow: { distance: 15, height: 6, lookAhead: 8, fovBase: 70 },
            wide: { distance: 20, height: 8, lookAhead: 12, fovBase: 85 },
            close: { distance: 10, height: 4, lookAhead: 5, fovBase: 65 },
            cinematic: { distance: 18, height: 7, lookAhead: 10, fovBase: 75 }
        };
        
        // Dynamic values
        this.currentDistance = 15;
        this.currentHeight = 6;
        this.currentLookAhead = 8;
        this.currentFov = 70;
        
        // Effect states
        this.shakeIntensity = 0;
        this.shakeDecay = 0.92;
        this.tiltAmount = 0;
        this.rollAmount = 0;
        this.zoomPulse = 0;
        
        // Speed lines container
        this.speedLines = [];
        this.speedLinesGroup = null;
        this.speedLineIntensity = 0;
        
        // Motion blur simulation (via post-processing)
        this.motionBlurStrength = 0;
        
        // Impact flash
        this.impactFlash = 0;
        this.impactFlashColor = new THREE.Color(1, 1, 1);
        
        // Boost tunnel effect
        this.boostTunnelActive = false;
        this.boostTunnelMesh = null;
        
        // Initialize
        this.initSpeedLines();
        this.initBoostTunnel();
    }
    
    // Initialize speed lines effect
    initSpeedLines() {
        this.speedLinesGroup = new THREE.Group();
        this.speedLinesGroup.renderOrder = 999;
        
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            depthTest: false
        });
        
        // Create pool of speed lines
        for (let i = 0; i < 50; i++) {
            const points = [
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, 0, -10)
            ];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, lineMaterial.clone());
            line.visible = false;
            this.speedLines.push(line);
            this.speedLinesGroup.add(line);
        }
    }
    
    // Initialize boost tunnel effect
    initBoostTunnel() {
        // Radial lines tunnel effect for boost
        const tunnelGeometry = new THREE.CylinderGeometry(0.5, 8, 30, 16, 1, true);
        const tunnelMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                intensity: { value: 0 },
                color: { value: new THREE.Color(0xff6600) }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vPosition;
                void main() {
                    vUv = uv;
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform float intensity;
                uniform vec3 color;
                varying vec2 vUv;
                varying vec3 vPosition;
                
                void main() {
                    // Radial lines pattern
                    float angle = atan(vPosition.x, vPosition.z);
                    float lines = sin(angle * 20.0 + time * 10.0) * 0.5 + 0.5;
                    
                    // Fade at edges
                    float fade = 1.0 - abs(vUv.y - 0.5) * 2.0;
                    fade = pow(fade, 2.0);
                    
                    // Speed streaks
                    float streaks = sin(vUv.y * 50.0 - time * 30.0) * 0.5 + 0.5;
                    
                    float alpha = lines * fade * intensity * streaks;
                    gl_FragColor = vec4(color, alpha * 0.6);
                }
            `,
            transparent: true,
            side: THREE.BackSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        
        this.boostTunnelMesh = new THREE.Mesh(tunnelGeometry, tunnelMaterial);
        this.boostTunnelMesh.rotation.x = Math.PI / 2;
        this.boostTunnelMesh.visible = false;
    }
    
    // Add effects to scene
    addToScene(scene) {
        scene.add(this.speedLinesGroup);
        scene.add(this.boostTunnelMesh);
    }
    
    // Set camera mode
    setCameraMode(mode) {
        if (this.cameraModes[mode]) {
            this.cameraMode = mode;
        }
    }
    
    // Cycle through camera modes
    cycleCameraMode() {
        const modes = Object.keys(this.cameraModes);
        const currentIndex = modes.indexOf(this.cameraMode);
        this.cameraMode = modes[(currentIndex + 1) % modes.length];
        return this.cameraMode;
    }
    
    // Trigger camera shake
    shake(intensity = 0.5, duration = 0.3) {
        this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    }
    
    // Trigger impact flash
    flash(color = 0xffffff, intensity = 1.0) {
        this.impactFlash = intensity;
        this.impactFlashColor.setHex(color);
    }
    
    // Trigger zoom pulse (for item hit, boost, etc.)
    zoomPulseEffect(amount = 5) {
        this.zoomPulse = amount;
    }
    
    // Update camera with all effects
    update(deltaTime, kart, track) {
        if (!kart) return;
        
        // Get current mode settings
        const mode = this.cameraModes[this.cameraMode];
        
        // Calculate speed factor
        const speedFactor = Math.abs(kart.speed) / kart.maxSpeed;
        const boostActive = kart.boostTime > 0;
        const drifting = kart.isDrifting;
        
        // === Dynamic Distance & Height ===
        let targetDistance = mode.distance;
        let targetHeight = mode.height;
        let targetFov = mode.fovBase;
        
        // Pull back at high speed (stronger effect for better speed sensation)
        targetDistance += speedFactor * 4;
        targetHeight += speedFactor * 2;
        targetFov += speedFactor * 25;  // Stronger FOV change for better speed feel
        
        // Boost effect - dramatic zoom effect
        if (boostActive) {
            targetDistance -= 3;
            targetFov += 15;  // Stronger boost FOV
        }
        
        // Drift - widen view
        if (drifting) {
            targetDistance += 2;
            targetHeight += 1;
        }
        
        // Add zoom pulse
        targetFov += this.zoomPulse;
        this.zoomPulse *= 0.9;
        
        // Smooth interpolation
        this.currentDistance = Utils.lerp(this.currentDistance, targetDistance, 0.08);
        this.currentHeight = Utils.lerp(this.currentHeight, targetHeight, 0.08);
        this.currentFov = Utils.lerp(this.currentFov, targetFov, 0.1);
        this.currentLookAhead = Utils.lerp(this.currentLookAhead, mode.lookAhead * (0.5 + speedFactor * 0.5), 0.1);
        
        // === Calculate Camera Position ===
        const cameraOffset = new THREE.Vector3(
            -Math.sin(kart.rotation) * this.currentDistance,
            this.currentHeight,
            -Math.cos(kart.rotation) * this.currentDistance
        );
        
        // Add shake
        if (this.shakeIntensity > 0.01) {
            cameraOffset.x += (Math.random() - 0.5) * this.shakeIntensity;
            cameraOffset.y += (Math.random() - 0.5) * this.shakeIntensity * 0.5;
            cameraOffset.z += (Math.random() - 0.5) * this.shakeIntensity * 0.3;
            this.shakeIntensity *= this.shakeDecay;
        }
        
        // Boost shake
        if (boostActive) {
            cameraOffset.x += (Math.random() - 0.5) * 0.2;
            cameraOffset.y += (Math.random() - 0.5) * 0.15;
        }
        
        // High drift level shake
        if (drifting && kart.driftLevel >= 2) {
            const driftShake = kart.driftLevel * 0.03;
            cameraOffset.x += (Math.random() - 0.5) * driftShake;
        }
        
        // Apply position
        const targetPos = kart.position.clone().add(cameraOffset);
        this.camera.position.lerp(targetPos, 0.1);
        
        // === Look Target ===
        const lookTarget = kart.position.clone();
        lookTarget.x += Math.sin(kart.rotation) * this.currentLookAhead;
        lookTarget.z += Math.cos(kart.rotation) * this.currentLookAhead;
        lookTarget.y += 1.5;
        
        this.camera.lookAt(lookTarget);
        
        // === Camera Roll (Tilt) ===
        // Note: Do NOT set camera.rotation.z directly after lookAt - it causes gimbal issues
        // Instead, apply roll by rotating around the camera's forward axis
        let targetRoll = 0;
        
        // Drift tilt
        if (drifting) {
            targetRoll = kart.driftDirection * -0.08;
        }
        
        // Turn tilt
        if (Math.abs(kart.currentTurnAmount) > 0.1) {
            targetRoll += -kart.currentTurnAmount * 0.03;
        }
        
        this.rollAmount = Utils.lerp(this.rollAmount, targetRoll, 0.1);
        
        // Apply roll using quaternion to avoid gimbal lock
        if (Math.abs(this.rollAmount) > 0.001) {
            const rollQuat = new THREE.Quaternion();
            const forward = new THREE.Vector3(0, 0, -1);
            forward.applyQuaternion(this.camera.quaternion);
            rollQuat.setFromAxisAngle(forward, this.rollAmount);
            this.camera.quaternion.multiply(rollQuat);
        }
        
        // === Update FOV ===
        this.camera.fov = this.currentFov;
        this.camera.updateProjectionMatrix();
        
        // === Update Speed Lines ===
        this.updateSpeedLines(kart, speedFactor);
        
        // === Update Boost Tunnel ===
        this.updateBoostTunnel(kart, boostActive, deltaTime);
        
        // === Update Motion Blur Strength ===
        this.motionBlurStrength = boostActive ? 0.6 : speedFactor * 0.3;
        
        // === Update Impact Flash ===
        this.impactFlash *= 0.85;
    }
    
    // Update speed lines effect
    updateSpeedLines(kart, speedFactor) {
        // Only show at high speeds
        const threshold = 0.5;
        const intensity = Math.max(0, (speedFactor - threshold) / (1 - threshold));
        this.speedLineIntensity = Utils.lerp(this.speedLineIntensity, intensity, 0.1);
        
        const showLines = this.speedLineIntensity > 0.05;
        
        this.speedLines.forEach((line, i) => {
            if (!showLines) {
                line.visible = false;
                return;
            }
            
            // Random visibility based on intensity
            if (Math.random() > this.speedLineIntensity * 0.5) {
                line.visible = false;
                return;
            }
            
            line.visible = true;
            
            // Position around camera view
            const angle = Math.random() * Math.PI * 2;
            const radius = 3 + Math.random() * 8;
            const forward = -5 - Math.random() * 15;
            
            line.position.set(
                this.camera.position.x + Math.cos(angle) * radius,
                this.camera.position.y + Math.sin(angle) * radius * 0.3,
                this.camera.position.z + forward
            );
            
            // Point towards camera
            line.lookAt(this.camera.position);
            
            // Adjust length based on speed
            const length = 5 + speedFactor * 10;
            const positions = line.geometry.attributes.position;
            positions.setZ(1, -length);
            positions.needsUpdate = true;
            
            // Adjust opacity
            line.material.opacity = this.speedLineIntensity * 0.4;
        });
    }
    
    // Update boost tunnel effect
    updateBoostTunnel(kart, boostActive, deltaTime) {
        if (boostActive) {
            if (!this.boostTunnelMesh.visible) {
                this.boostTunnelMesh.visible = true;
            }
            
            // Position in front of camera
            this.boostTunnelMesh.position.copy(kart.position);
            this.boostTunnelMesh.position.y += 2;
            this.boostTunnelMesh.rotation.y = kart.rotation + Math.PI;
            
            // Update shader
            this.boostTunnelMesh.material.uniforms.time.value += deltaTime;
            this.boostTunnelMesh.material.uniforms.intensity.value = 
                Utils.lerp(this.boostTunnelMesh.material.uniforms.intensity.value, 1.0, 0.1);
            
            // Color based on boost type
            let color;
            if (kart.tripleBoostCharges > 0) {
                color = new THREE.Color(0xff00ff); // Purple for triple boost
            } else if (kart.driftLevel >= 3) {
                color = new THREE.Color(0xff00ff); // Purple for max drift
            } else {
                color = new THREE.Color(0xff6600); // Orange for normal
            }
            this.boostTunnelMesh.material.uniforms.color.value = color;
            
        } else {
            // Fade out
            if (this.boostTunnelMesh.visible) {
                this.boostTunnelMesh.material.uniforms.intensity.value *= 0.9;
                if (this.boostTunnelMesh.material.uniforms.intensity.value < 0.01) {
                    this.boostTunnelMesh.visible = false;
                }
            }
        }
    }
    
    // Get current motion blur strength for post-processing
    getMotionBlurStrength() {
        return this.motionBlurStrength;
    }
    
    // Get impact flash for overlay
    getImpactFlash() {
        return {
            intensity: this.impactFlash,
            color: this.impactFlashColor
        };
    }
    
    // Cleanup
    dispose() {
        if (this.speedLinesGroup) {
            this.speedLines.forEach(line => {
                line.geometry.dispose();
                line.material.dispose();
            });
        }
        if (this.boostTunnelMesh) {
            this.boostTunnelMesh.geometry.dispose();
            this.boostTunnelMesh.material.dispose();
        }
    }
}

// Drift Visual Effects Manager
class DriftEffectsManager {
    constructor(scene) {
        this.scene = scene;
        
        // Drift trails
        this.driftTrails = new Map(); // kartId -> trail data
        
        // Spark pools
        this.sparkPool = [];
        this.activeSparks = [];
        
        // Trail material
        this.trailMaterials = {
            blue: this.createTrailMaterial(0x00aaff),
            orange: this.createTrailMaterial(0xff6600),
            purple: this.createTrailMaterial(0xff00ff)
        };
        
        // Initialize spark pool
        this.initSparkPool(100);
    }
    
    createTrailMaterial(color) {
        return new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
    }
    
    initSparkPool(count) {
        const sparkGeometry = new THREE.SphereGeometry(0.1, 4, 4);
        
        for (let i = 0; i < count; i++) {
            const spark = new THREE.Mesh(
                sparkGeometry,
                new THREE.MeshBasicMaterial({
                    color: 0xffaa00,
                    transparent: true,
                    blending: THREE.AdditiveBlending
                })
            );
            spark.visible = false;
            this.scene.add(spark);
            this.sparkPool.push({
                mesh: spark,
                velocity: new THREE.Vector3(),
                life: 0,
                active: false
            });
        }
    }
    
    // Start drift trail for a kart
    startDriftTrail(kartId, kart) {
        if (this.driftTrails.has(kartId)) return;
        
        // Create trail geometry
        const maxPoints = 50;
        const positions = new Float32Array(maxPoints * 6); // 2 vertices per point
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const trail = {
            geometry: geometry,
            mesh: null,
            points: [],
            maxPoints: maxPoints,
            material: this.trailMaterials.blue.clone()
        };
        
        trail.mesh = new THREE.Mesh(geometry, trail.material);
        trail.mesh.frustumCulled = false;
        this.scene.add(trail.mesh);
        
        this.driftTrails.set(kartId, trail);
    }
    
    // Update drift trail
    updateDriftTrail(kartId, kart, driftLevel) {
        const trail = this.driftTrails.get(kartId);
        if (!trail) return;
        
        // Update material color based on drift level
        let color;
        if (driftLevel >= 3) {
            color = 0xff00ff; // Purple
        } else if (driftLevel >= 2) {
            color = 0xff6600; // Orange
        } else {
            color = 0x00aaff; // Blue
        }
        trail.material.color.setHex(color);
        
        // Add new point at tire positions
        const leftTire = new THREE.Vector3(
            kart.position.x - Math.cos(kart.rotation) * 1.2,
            kart.position.y + 0.1,
            kart.position.z + Math.sin(kart.rotation) * 1.2
        );
        const rightTire = new THREE.Vector3(
            kart.position.x + Math.cos(kart.rotation) * 1.2,
            kart.position.y + 0.1,
            kart.position.z - Math.sin(kart.rotation) * 1.2
        );
        
        trail.points.push({ left: leftTire, right: rightTire });
        
        // Remove old points
        while (trail.points.length > trail.maxPoints) {
            trail.points.shift();
        }
        
        // Update geometry
        this.updateTrailGeometry(trail);
    }
    
    updateTrailGeometry(trail) {
        const positions = trail.geometry.attributes.position.array;
        
        for (let i = 0; i < trail.points.length; i++) {
            const point = trail.points[i];
            const idx = i * 6;
            
            positions[idx] = point.left.x;
            positions[idx + 1] = point.left.y;
            positions[idx + 2] = point.left.z;
            
            positions[idx + 3] = point.right.x;
            positions[idx + 4] = point.right.y;
            positions[idx + 5] = point.right.z;
        }
        
        trail.geometry.attributes.position.needsUpdate = true;
        trail.geometry.setDrawRange(0, trail.points.length * 2);
    }
    
    // End drift trail
    endDriftTrail(kartId) {
        const trail = this.driftTrails.get(kartId);
        if (!trail) return;
        
        // Fade out then remove
        const fadeOut = () => {
            trail.material.opacity -= 0.05;
            if (trail.material.opacity > 0) {
                requestAnimationFrame(fadeOut);
            } else {
                this.scene.remove(trail.mesh);
                trail.geometry.dispose();
                trail.material.dispose();
                this.driftTrails.delete(kartId);
            }
        };
        fadeOut();
    }
    
    // Spawn drift sparks
    spawnDriftSparks(kart, driftLevel, count = 3) {
        const color = driftLevel >= 3 ? 0xff00ff : 
                      driftLevel >= 2 ? 0xff6600 : 0xffaa00;
        
        for (let i = 0; i < count; i++) {
            const spark = this.sparkPool.find(s => !s.active);
            if (!spark) continue;
            
            spark.active = true;
            spark.life = 0.3 + Math.random() * 0.3;
            
            // Position at rear tires
            const side = Math.random() > 0.5 ? 1 : -1;
            spark.mesh.position.set(
                kart.position.x + Math.cos(kart.rotation) * side * 1.2 + (Math.random() - 0.5) * 0.5,
                kart.position.y + 0.2 + Math.random() * 0.3,
                kart.position.z - Math.sin(kart.rotation) * side * 1.2 + (Math.random() - 0.5) * 0.5
            );
            
            // Velocity - spray outward and up
            spark.velocity.set(
                (Math.random() - 0.5) * 5,
                2 + Math.random() * 3,
                (Math.random() - 0.5) * 5
            );
            
            // Color and visibility
            spark.mesh.material.color.setHex(color);
            spark.mesh.material.opacity = 1;
            spark.mesh.visible = true;
            
            this.activeSparks.push(spark);
        }
    }
    
    // Update all effects
    update(deltaTime) {
        // Update sparks
        for (let i = this.activeSparks.length - 1; i >= 0; i--) {
            const spark = this.activeSparks[i];
            
            spark.life -= deltaTime;
            
            if (spark.life <= 0) {
                spark.active = false;
                spark.mesh.visible = false;
                this.activeSparks.splice(i, 1);
                continue;
            }
            
            // Physics
            spark.velocity.y -= 15 * deltaTime; // Gravity
            spark.mesh.position.add(spark.velocity.clone().multiplyScalar(deltaTime));
            
            // Fade
            spark.mesh.material.opacity = spark.life * 2;
        }
    }
    
    // Cleanup
    dispose() {
        this.driftTrails.forEach((trail) => {
            this.scene.remove(trail.mesh);
            trail.geometry.dispose();
            trail.material.dispose();
        });
        this.driftTrails.clear();
        
        this.sparkPool.forEach(spark => {
            this.scene.remove(spark.mesh);
            spark.mesh.geometry.dispose();
            spark.mesh.material.dispose();
        });
    }
}

// Export for use
window.CameraEffectsManager = CameraEffectsManager;
window.DriftEffectsManager = DriftEffectsManager;
