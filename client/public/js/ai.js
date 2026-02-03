// AI Controller for computer-controlled karts

class AIController {
    constructor(kart, track, difficulty = 'normal', courseData = null) {
        this.kart = kart;
        this.track = track;
        this.difficulty = difficulty;
        this.courseData = courseData;
        
        // Default difficulty settings (AI is 20% faster than player)
        this.difficultySettings = {
            easy: {
                maxSpeedMultiplier: 1.20,
                reactionTime: 0.3,
                turnAccuracy: 0.7,
                itemUseProbability: 0.5,
                rubberBandStrength: 0.3,
                mistakeProbability: 0.15
            },
            normal: {
                maxSpeedMultiplier: 1.20,
                reactionTime: 0.15,
                turnAccuracy: 0.85,
                itemUseProbability: 0.7,
                rubberBandStrength: 0.5,
                mistakeProbability: 0.08
            },
            hard: {
                maxSpeedMultiplier: 1.20,
                reactionTime: 0.08,
                turnAccuracy: 0.95,
                itemUseProbability: 0.9,
                rubberBandStrength: 0.7,
                mistakeProbability: 0.03
            }
        };
        
        // Use course-specific AI settings if available, otherwise use default difficulty
        if (courseData && courseData.ai) {
            const courseAI = courseData.ai;
            this.settings = {
                maxSpeedMultiplier: courseAI.maxSpeedMultiplier ?? this.difficultySettings[difficulty].maxSpeedMultiplier,
                reactionTime: courseAI.reactionTime ?? this.difficultySettings[difficulty].reactionTime,
                turnAccuracy: courseAI.turnAccuracy ?? this.difficultySettings[difficulty].turnAccuracy,
                itemUseProbability: courseAI.itemUseProbability ?? this.difficultySettings[difficulty].itemUseProbability,
                rubberBandStrength: courseAI.rubberBandStrength ?? this.difficultySettings[difficulty].rubberBandStrength,
                mistakeProbability: courseAI.mistakeProbability ?? this.difficultySettings[difficulty].mistakeProbability
            };
            console.log(`AI using course-specific settings: ${courseAI.difficulty}`, this.settings);
        } else {
            this.settings = this.difficultySettings[difficulty];
        }
        
        // Racing line waypoints
        this.waypoints = this.generateRacingLine();
        this.currentWaypointIndex = 0;
        this.lookaheadDistance = 12;  // 短めに設定してコースを外れにくくする
        
        // AI state
        this.targetPoint = null;
        this.stuckTimer = 0;
        this.offTrackTimer = 0;
        this.lastTrackDist = null;
        this.returnToTrack = false;
        this.lastPosition = kart.position.clone();
        this.recoveryMode = false;
        this.recoveryTimer = 0;
        this.avoidanceDirection = 0;  // 障害物回避方向
        
        // Decision timers
        this.itemDecisionTimer = 0;
        this.driftDecisionTimer = 0;
        
        // Personality variations
        this.aggression = Math.random() * 0.4 + 0.3; // 0.3 - 0.7
        this.consistency = Math.random() * 0.3 + 0.7; // 0.7 - 1.0
        
        // Rubber-banding state
        this.rubberBandBoost = 0;
    }
    
    generateRacingLine() {
        // Use track points but optimize for racing line
        const waypoints = [];
        
        // trackPointsが存在しない場合は空配列を返す
        if (!this.track.trackPoints || this.track.trackPoints.length === 0) {
            console.warn('Track points not available for AI');
            return waypoints;
        }
        
        const step = Math.max(1, Math.floor(this.track.trackPoints.length / 100));
        
        for (let i = 0; i < this.track.trackPoints.length; i += step) {
            const point = this.track.trackPoints[i];
            waypoints.push({
                x: point.x,
                y: point.y || 0,
                z: point.z,
                optimalSpeed: this.calculateOptimalSpeed(i)
            });
        }
        
        return waypoints;
    }
    
    calculateOptimalSpeed(index) {
        // Calculate optimal speed based on upcoming turns
        const points = this.track.trackPoints;
        const lookahead = 10;
        
        let maxTurnAngle = 0;
        
        for (let i = 0; i < lookahead && index + i + 1 < points.length; i++) {
            const curr = points[index + i];
            const next = points[(index + i + 1) % points.length];
            const nextNext = points[(index + i + 2) % points.length];
            
            const angle1 = Math.atan2(next.z - curr.z, next.x - curr.x);
            const angle2 = Math.atan2(nextNext.z - next.z, nextNext.x - next.x);
            const turnAngle = Math.abs(Utils.normalizeAngle(angle2 - angle1));
            
            maxTurnAngle = Math.max(maxTurnAngle, turnAngle);
        }
        
        // Slower for sharper turns
        const speedFactor = 1 - (maxTurnAngle / Math.PI) * 0.5;
        return this.kart.maxSpeed * speedFactor * this.settings.maxSpeedMultiplier;
    }
    
    update(deltaTime, allKarts) {
        if (this.kart.isSpunOut || this.kart.isFrozen || this.kart.finished) {
            return;
        }
        
        // リカバリーモード中は特別な処理
        if (this.recoveryMode) {
            this.handleRecovery(deltaTime);
            return;
        }
        
        // Update rubber-banding
        this.updateRubberBanding(allKarts);
        
        // 障害物チェックと回避
        this.checkObstacleAvoidance(allKarts);
        
        // Find target waypoint
        this.updateTargetWaypoint();
        
        // Calculate steering
        this.calculateSteering(deltaTime);
        
        // Handle acceleration
        this.handleAcceleration(deltaTime);
        
        // Decide on drifting
        this.decideDrift(deltaTime);
        
        // Decide on item usage
        this.decideItemUsage(deltaTime, allKarts);
        
        // Check if stuck
        this.checkIfStuck(deltaTime);
        
        if (this.recoveryMode) return;
        
        // Apply random mistakes based on difficulty
        this.applyMistakes(deltaTime);
    }
    
    // 障害物回避チェック
    checkObstacleAvoidance(allKarts) {
        this.avoidanceDirection = 0;
        
        if (this.isOffTrack()) {
            return;
        }
        
        // 敵キャラクター（ドッスン、ノコノコ）をチェック
        if (this.track.enemies) {
            for (const enemy of this.track.enemies) {
                const dist = Utils.distance2D(
                    this.kart.position.x, this.kart.position.z,
                    enemy.mesh.position.x, enemy.mesh.position.z
                );
                
                // 前方の障害物のみチェック
                const angleToEnemy = Math.atan2(
                    enemy.mesh.position.x - this.kart.position.x,
                    enemy.mesh.position.z - this.kart.position.z
                );
                const angleDiff = Math.abs(Utils.normalizeAngle(angleToEnemy - this.kart.rotation));
                
                if (dist < 25 && angleDiff < Math.PI / 3) {
                    // 障害物が前方にある - 回避
                    const crossProduct = Math.sin(angleToEnemy - this.kart.rotation);
                    this.avoidanceDirection = crossProduct > 0 ? -1 : 1;
                    break;
                }
            }
        }
        
        // 他のカートもチェック
        for (const other of allKarts) {
            if (other === this.kart) continue;
            
            const dist = Utils.distance2D(
                this.kart.position.x, this.kart.position.z,
                other.position.x, other.position.z
            );
            
            if (dist < 8 && dist > 0) {
                const angleToKart = Math.atan2(
                    other.position.x - this.kart.position.x,
                    other.position.z - this.kart.position.z
                );
                const angleDiff = Math.abs(Utils.normalizeAngle(angleToKart - this.kart.rotation));
                
                if (angleDiff < Math.PI / 4) {
                    const crossProduct = Math.sin(angleToKart - this.kart.rotation);
                    this.avoidanceDirection = crossProduct > 0 ? -1 : 1;
                    break;
                }
            }
        }
    }
    
    // リカバリーモード処理
    handleRecovery(deltaTime) {
        this.recoveryTimer -= deltaTime;
        const steerDir = this.getRecoveryDirection();
        
        // バック＋ランダムな方向に曲がる
        this.kart.input.forward = false;
        this.kart.input.backward = true;
        
        if (this.recoveryTimer > 0.5) {
            // 最初はバックしながら曲がる
            this.kart.input.left = steerDir > 0;
            this.kart.input.right = steerDir < 0;
        } else {
            // その後は前進
            this.kart.input.forward = true;
            this.kart.input.backward = false;
            this.kart.input.left = steerDir > 0;
            this.kart.input.right = steerDir < 0;
        }
        
        if (this.recoveryTimer <= 0) {
            this.recoveryMode = false;
            this.stuckTimer = 0;
        }
    }
    
    updateRubberBanding(allKarts) {
        // Find player position and calculate rubber-banding
        const playerKart = allKarts.find(k => k.isPlayer);
        if (!playerKart) return;
        
        const positionDiff = playerKart.racePosition - this.kart.racePosition;
        
        if (positionDiff > 0) {
            // AI is ahead of player - slow down slightly
            this.rubberBandBoost = -this.settings.rubberBandStrength * 0.3 * positionDiff;
        } else if (positionDiff < 0) {
            // AI is behind player - speed up
            this.rubberBandBoost = this.settings.rubberBandStrength * 0.5 * Math.abs(positionDiff);
        } else {
            this.rubberBandBoost = 0;
        }
        
        // Clamp rubber band boost
        this.rubberBandBoost = Utils.clamp(this.rubberBandBoost, -0.2, 0.3);
    }
    
    updateTargetWaypoint() {
        // waypointsがない場合は何もしない
        if (!this.waypoints || this.waypoints.length === 0) {
            // waypointsがなければ再生成を試みる
            this.waypoints = this.generateRacingLine();
            if (this.waypoints.length === 0) return;
        }

        const closestInfo = this.getClosestWaypointInfo();
        if (!closestInfo) return;
        
        const { index: closestIdx, dist: closestDist, point: nearestWp } = closestInfo;
        const offTrack = this.isOffTrack();
        this.returnToTrack = offTrack;
        
        if (offTrack && this.track && typeof this.track.getClosestTrackPoint === 'function') {
            const centerPoint = this.track.getClosestTrackPoint(
                this.kart.position.x,
                this.kart.position.z
            );
            if (centerPoint) {
                const trackDir = typeof this.track.getTrackDirection === 'function'
                    ? this.track.getTrackDirection(this.kart.position.x, this.kart.position.z)
                    : 0;
                const ahead = 6;
                this.currentWaypointIndex = closestIdx;
                this.targetPoint = {
                    x: centerPoint.x + Math.sin(trackDir) * ahead,
                    z: centerPoint.z + Math.cos(trackDir) * ahead,
                    optimalSpeed: Math.min(nearestWp?.optimalSpeed || this.kart.maxSpeed, this.kart.maxSpeed * 0.55)
                };
                return;
            }
        }
        
        // Look ahead for target
        const lookaheadWaypoints = Math.floor(this.lookaheadDistance / 8);
        this.currentWaypointIndex = (closestIdx + lookaheadWaypoints) % this.waypoints.length;
        this.targetPoint = this.waypoints[this.currentWaypointIndex];
        
        const trackHalfWidth = (this.track?.trackWidth || 25) / 2;
        const offTrackDist = trackHalfWidth + 2;
        const cautionDist = trackHalfWidth * 0.6;
        
        // 明確にコース外なら最寄りの中心点に戻る
        if (closestDist > offTrackDist) {
            this.currentWaypointIndex = closestIdx;
            this.targetPoint = {
                x: nearestWp.x,
                z: nearestWp.z,
                optimalSpeed: Math.min(nearestWp.optimalSpeed || this.kart.maxSpeed, this.kart.maxSpeed * 0.6)
            };
            return;
        }
        
        // コース中心への補正 - 最寄りのwaypointから離れすぎている場合は中心に寄せる
        const distFromCenter = Utils.distance2D(
            this.kart.position.x, this.kart.position.z,
            nearestWp.x, nearestWp.z
        );
        
        // コース端に近いほど中心へ強く戻す
        if (distFromCenter > cautionDist) {
            const blendFactor = Utils.clamp((distFromCenter - cautionDist) / (offTrackDist - cautionDist), 0, 1);
            const centerWeight = 0.6 + 0.35 * blendFactor;
            this.targetPoint = {
                x: Utils.lerp(this.targetPoint.x, nearestWp.x, centerWeight),
                z: Utils.lerp(this.targetPoint.z, nearestWp.z, centerWeight),
                optimalSpeed: this.targetPoint.optimalSpeed * (1 - blendFactor * 0.3)  // 外れている時は減速
            };
        }
    }
    
    calculateSteering(deltaTime) {
        if (!this.targetPoint) return;
        
        // Calculate angle to target
        const angleToTarget = Math.atan2(
            this.targetPoint.x - this.kart.position.x,
            this.targetPoint.z - this.kart.position.z
        );
        
        // Calculate angle difference
        let angleDiff = Utils.normalizeAngle(angleToTarget - this.kart.rotation);
        
        // Apply turn accuracy (lower = more wobbly steering)
        angleDiff *= this.returnToTrack ? 1.0 : this.settings.turnAccuracy;
        
        // Apply reaction time delay
        angleDiff *= this.returnToTrack ? 1.0 : Math.min(1, deltaTime / this.settings.reactionTime);
        
        if (this.returnToTrack) {
            angleDiff *= 1.4;
        }
        
        // 障害物回避を適用
        if (this.avoidanceDirection !== 0) {
            angleDiff += this.avoidanceDirection * 0.5;  // 回避方向に曲がる
        }
        
        // Set input based on angle difference
        const turnThreshold = this.returnToTrack ? 0.02 : 0.05;
        
        if (angleDiff > turnThreshold) {
            this.kart.input.left = true;
            this.kart.input.right = false;
        } else if (angleDiff < -turnThreshold) {
            this.kart.input.left = false;
            this.kart.input.right = true;
        } else {
            this.kart.input.left = false;
            this.kart.input.right = false;
        }
    }
    
    handleAcceleration(deltaTime) {
        const targetSpeed = this.targetPoint ? this.targetPoint.optimalSpeed : this.kart.maxSpeed * 0.8;
        const adjustedMaxSpeed = targetSpeed * (1 + this.rubberBandBoost);
        
        // Always accelerate unless going too fast
        if (this.kart.speed < adjustedMaxSpeed) {
            this.kart.input.forward = true;
            this.kart.input.backward = false;
        } else {
            // Ease off throttle
            this.kart.input.forward = Math.random() > 0.3;
            this.kart.input.backward = false;
        }
        
        // Brake for sharp turns
        if (this.shouldBrake()) {
            this.kart.input.forward = false;
            this.kart.input.backward = true;
        }
        
        // コース外にいる場合は減速して戻りやすくする
        if (this.returnToTrack) {
            const recoverySpeed = this.kart.maxSpeed * 0.5;
            if (this.kart.speed > recoverySpeed) {
                this.kart.input.forward = false;
                this.kart.input.backward = true;
            } else {
                this.kart.input.forward = true;
                this.kart.input.backward = false;
            }
        }
    }
    
    shouldBrake() {
        if (!this.targetPoint) return false;
        
        // Calculate turn sharpness
        const angleToTarget = Math.atan2(
            this.targetPoint.x - this.kart.position.x,
            this.targetPoint.z - this.kart.position.z
        );
        
        const angleDiff = Math.abs(Utils.normalizeAngle(angleToTarget - this.kart.rotation));
        
        // Brake if turn is sharp and going fast
        return angleDiff > Math.PI / 4 && this.kart.speed > 40;  // より早めにブレーキ
    }
    
    // コース外判定
    isOffTrack() {
        if (this.track && typeof this.track.isOnTrack === 'function') {
            return !this.track.isOnTrack(this.kart.position.x, this.kart.position.z);
        }
        if (!this.waypoints || this.waypoints.length === 0) return false;
        
        // 最寄りのwaypointとの距離でコース外判定
        let minDist = Infinity;
        for (const wp of this.waypoints) {
            const dist = Utils.distance2D(
                this.kart.position.x, this.kart.position.z,
                wp.x, wp.z
            );
            minDist = Math.min(minDist, dist);
        }
        
        const trackHalfWidth = (this.track?.trackWidth || 25) / 2;
        return minDist > trackHalfWidth + 2;
    }
    
    decideDrift(deltaTime) {
        if (this.returnToTrack) {
            this.kart.input.drift = false;
            return;
        }
        this.driftDecisionTimer -= deltaTime;
        
        if (this.driftDecisionTimer > 0) return;
        
        this.driftDecisionTimer = 0.2;
        
        if (!this.targetPoint) {
            this.kart.input.drift = false;
            return;
        }
        
        // Calculate upcoming turn
        const nextIdx = (this.currentWaypointIndex + 5) % this.waypoints.length;
        const nextPoint = this.waypoints[nextIdx];
        
        const currentAngle = Math.atan2(
            this.targetPoint.x - this.kart.position.x,
            this.targetPoint.z - this.kart.position.z
        );
        
        const nextAngle = Math.atan2(
            nextPoint.x - this.targetPoint.x,
            nextPoint.z - this.targetPoint.z
        );
        
        const turnAmount = Math.abs(Utils.normalizeAngle(nextAngle - currentAngle));
        
        // Drift on sharp turns
        if (turnAmount > Math.PI / 6 && this.kart.speed > 40) {
            this.kart.input.drift = true;
        } else if (this.kart.driftLevel >= 2) {
            // Keep drifting if we have a good boost built up
            this.kart.input.drift = true;
        } else {
            this.kart.input.drift = false;
        }
    }
    
    decideItemUsage(deltaTime, allKarts) {
        this.itemDecisionTimer -= deltaTime;
        
        if (this.itemDecisionTimer > 0) return;
        if (!this.kart.currentItem) return;
        
        this.itemDecisionTimer = 0.5 + Math.random() * 0.5;
        
        // Probability check
        if (Math.random() > this.settings.itemUseProbability) return;
        
        const item = this.kart.currentItem;
        const position = this.kart.racePosition;
        
        let shouldUse = false;
        
        // Strategic item usage based on item type and race situation
        switch (item.id) {
            case 'rocket_boost':
            case 'triple_boost':
                // Use on straights or when behind
                shouldUse = this.isOnStraight() || (position > 3 && Math.random() < 0.7);
                break;
                
            case 'homing_missile':
            case 'red_shell':
                // Use when there's a target ahead
                shouldUse = this.hasTargetAhead(allKarts);
                break;
                
            case 'green_shell':
                // Use when target is close and straight ahead
                shouldUse = this.hasTargetAhead(allKarts) && this.isOnStraight();
                break;
                
            case 'banana':
            case 'oil_slick':
                // Strategic placement - on racing line or when pursued
                shouldUse = this.hasPursuer(allKarts) || 
                           (this.isOnRacingLine() && Math.random() < 0.4);
                break;
                
            case 'shield':
                // Use preemptively when leading or under threat
                shouldUse = position === 1 || this.detectIncomingThreat(allKarts);
                break;
                
            case 'lightning':
                // Use when far behind and many karts ahead
                shouldUse = position >= 4 && this.countKartsAhead(allKarts) >= 3;
                break;
                
            case 'star':
                // Use when crowded or to catch up
                shouldUse = this.hasNearbyKarts(allKarts) || position >= 3;
                break;
                
            case 'teleport':
                // Use when far behind
                shouldUse = position >= 5;
                break;
                
            case 'time_freeze':
                // Use when close to others and in last lap
                shouldUse = this.hasNearbyKarts(allKarts) && this.kart.lap >= 2;
                break;
                
            // Course-specific items
            case 'snowball':
                // Use when target ahead and on snow course
                shouldUse = this.hasTargetAhead(allKarts) && Math.random() < 0.8;
                break;
                
            case 'fireball':
                // Use aggressively
                shouldUse = this.hasTargetAhead(allKarts) || (position > 2 && Math.random() < 0.5);
                break;
                
            default:
                shouldUse = Math.random() < 0.5;
        }
        
        if (shouldUse && window.game) {
            this.kart.useItem(window.game);
        }
    }
    
    // Check if kart is on the optimal racing line
    isOnRacingLine() {
        if (!this.targetPoint) return false;
        
        const distToLine = Utils.distance2D(
            this.kart.position.x, this.kart.position.z,
            this.targetPoint.x, this.targetPoint.z
        );
        
        return distToLine < 5;
    }
    
    // Detect incoming projectiles or threats
    detectIncomingThreat(allKarts) {
        // Check for nearby shells or missiles (simplified)
        if (window.game && window.game.itemManager) {
            const projectiles = window.game.itemManager.projectiles || [];
            for (const proj of projectiles) {
                if (!proj.mesh) continue;
                
                const dist = this.kart.position.distanceTo(proj.mesh.position);
                if (dist < 30) {
                    // Check if coming towards us
                    if (proj.target === this.kart || !proj.owner || proj.owner !== this.kart) {
                        return true;
                    }
                }
            }
        }
        
        // Check for aggressive karts behind with items
        for (const other of allKarts) {
            if (other === this.kart || !other.currentItem) continue;
            
            const dist = this.kart.position.distanceTo(other.position);
            if (dist < 40) {
                const toOther = Math.atan2(
                    other.position.x - this.kart.position.x,
                    other.position.z - this.kart.position.z
                );
                const angleDiff = Math.abs(Utils.normalizeAngle(toOther - this.kart.rotation));
                
                // Behind us with an item
                if (angleDiff > Math.PI * 0.5 && 
                    ['homing_missile', 'green_shell', 'red_shell'].includes(other.currentItem.id)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    // Count how many karts are ahead
    countKartsAhead(allKarts) {
        let count = 0;
        for (const other of allKarts) {
            if (other !== this.kart && other.racePosition < this.kart.racePosition) {
                count++;
            }
        }
        return count;
    }
    
    isOnStraight() {
        if (!this.targetPoint) return false;
        
        // Check if next few waypoints are relatively straight
        let totalTurn = 0;
        
        for (let i = 0; i < 5; i++) {
            const curr = this.waypoints[(this.currentWaypointIndex + i) % this.waypoints.length];
            const next = this.waypoints[(this.currentWaypointIndex + i + 1) % this.waypoints.length];
            const nextNext = this.waypoints[(this.currentWaypointIndex + i + 2) % this.waypoints.length];
            
            const angle1 = Math.atan2(next.z - curr.z, next.x - curr.x);
            const angle2 = Math.atan2(nextNext.z - next.z, nextNext.x - next.x);
            
            totalTurn += Math.abs(Utils.normalizeAngle(angle2 - angle1));
        }
        
        return totalTurn < Math.PI / 4;
    }
    
    hasTargetAhead(allKarts) {
        for (const other of allKarts) {
            if (other === this.kart) continue;
            
            // Check if other is ahead
            if (other.totalProgress > this.kart.totalProgress) {
                const dist = this.kart.position.distanceTo(other.position);
                if (dist < 50) {
                    // Check if roughly in front
                    const toOther = Math.atan2(
                        other.position.x - this.kart.position.x,
                        other.position.z - this.kart.position.z
                    );
                    const angleDiff = Math.abs(Utils.normalizeAngle(toOther - this.kart.rotation));
                    
                    if (angleDiff < Math.PI / 4) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    hasPursuer(allKarts) {
        for (const other of allKarts) {
            if (other === this.kart) continue;
            
            const dist = this.kart.position.distanceTo(other.position);
            if (dist < 20) {
                // Check if behind
                const toOther = Math.atan2(
                    other.position.x - this.kart.position.x,
                    other.position.z - this.kart.position.z
                );
                const angleDiff = Math.abs(Utils.normalizeAngle(toOther - this.kart.rotation));
                
                if (angleDiff > Math.PI * 0.6) {
                    return true;
                }
            }
        }
        return false;
    }
    
    hasNearbyKarts(allKarts) {
        let nearbyCount = 0;
        
        for (const other of allKarts) {
            if (other === this.kart) continue;
            
            const dist = this.kart.position.distanceTo(other.position);
            if (dist < 30) {
                nearbyCount++;
            }
        }
        
        return nearbyCount >= 2;
    }
    
    checkIfStuck(deltaTime) {
        const moved = this.kart.position.distanceTo(this.lastPosition);
        this.lastPosition.copy(this.kart.position);
        const offTrack = this.isOffTrack();
        const trackDist = this.getDistanceToTrackCenter();
        
        if (offTrack) {
            if (this.lastTrackDist !== null && trackDist !== null && trackDist < this.lastTrackDist - 0.2) {
                this.offTrackTimer = Math.max(0, this.offTrackTimer - deltaTime);
            } else {
                this.offTrackTimer += deltaTime;
            }
        } else {
            this.offTrackTimer = Math.max(0, this.offTrackTimer - deltaTime * 2);
        }
        this.lastTrackDist = trackDist;
        
        const trackHalfWidth = (this.track?.trackWidth || 25) / 2;
        if (offTrack && ((trackDist !== null && trackDist > trackHalfWidth * 2.2) || this.offTrackTimer > 3.5)) {
            if (this.snapToTrack()) {
                return;
            }
        }
        
        if (this.offTrackTimer > 2.2) {
            this.recoveryMode = true;
            this.recoveryTimer = 1.6;
            this.avoidanceDirection = this.getRecoveryDirection();
            this.offTrackTimer = 0;
            this.stuckTimer = 0;
            return;
        }
        
        // スピードが低いか、ほとんど動いていない場合
        if ((moved < 0.5 && this.kart.input.forward) || this.kart.speed < 2) {
            this.stuckTimer += deltaTime;
        } else {
            this.stuckTimer = Math.max(0, this.stuckTimer - deltaTime * 2);  // 回復
        }
        
        // 1.5秒以上スタックしていたらリカバリーモードに入る
        if (this.stuckTimer > 1.5) {
            this.recoveryMode = true;
            this.recoveryTimer = 1.4;  // 1.4秒間リカバリー
            this.avoidanceDirection = this.getRecoveryDirection();
            this.stuckTimer = 0;
            return;
        }
        
        // 軽微なスタック（1秒未満）- 少しバック
        if (this.stuckTimer > 1) {
            this.kart.input.backward = true;
            this.kart.input.forward = false;
        }
    }
    
    applyMistakes(deltaTime) {
        // Random mistakes based on difficulty
        if (this.isOffTrack()) return;
        if (Math.random() < this.settings.mistakeProbability * deltaTime) {
            // Brief wrong input
            if (Math.random() < 0.5) {
                this.kart.input.left = !this.kart.input.left;
                this.kart.input.right = !this.kart.input.right;
            } else {
                // Briefly let off throttle
                this.kart.input.forward = false;
            }
        }
    }
    
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        this.settings = this.difficultySettings[difficulty];
        
        // Regenerate racing line with new difficulty
        this.waypoints = this.generateRacingLine();
    }

    getClosestWaypointInfo() {
        if (!this.waypoints || this.waypoints.length === 0) return null;
        
        let closestDist = Infinity;
        let closestIdx = 0;
        
        for (let i = 0; i < this.waypoints.length; i++) {
            const wp = this.waypoints[i];
            const dist = Utils.distance2D(
                this.kart.position.x, this.kart.position.z,
                wp.x, wp.z
            );
            
            if (dist < closestDist) {
                closestDist = dist;
                closestIdx = i;
            }
        }
        
        return { index: closestIdx, dist: closestDist, point: this.waypoints[closestIdx] };
    }

    getDistanceToTrackCenter() {
        if (this.track && typeof this.track.getClosestTrackPoint === 'function') {
            const closest = this.track.getClosestTrackPoint(
                this.kart.position.x,
                this.kart.position.z
            );
            if (closest) {
                return Utils.distance2D(
                    this.kart.position.x,
                    this.kart.position.z,
                    closest.x,
                    closest.z
                );
            }
        }
        
        const info = this.getClosestWaypointInfo();
        return info ? info.dist : null;
    }

    snapToTrack() {
        if (!this.track || typeof this.track.getClosestTrackPoint !== 'function') {
            return false;
        }
        
        const closest = this.track.getClosestTrackPoint(
            this.kart.position.x,
            this.kart.position.z
        );
        if (!closest) return false;
        
        const trackDir = typeof this.track.getTrackDirection === 'function'
            ? this.track.getTrackDirection(this.kart.position.x, this.kart.position.z)
            : 0;
        const lateral = trackDir + Math.PI / 2;
        const trackHalfWidth = (this.track.trackWidth || 25) / 2;
        const offset = (Math.random() - 0.5) * trackHalfWidth * 0.4;
        const x = closest.x + Math.sin(lateral) * offset;
        const z = closest.z + Math.cos(lateral) * offset;
        const y = closest.y || 0;
        
        if (typeof this.kart.setPosition === 'function') {
            this.kart.setPosition(x, y, z, trackDir);
        } else {
            this.kart.position.set(x, y, z);
            this.kart.rotation = trackDir;
            if (this.kart.updateMeshPosition) this.kart.updateMeshPosition();
        }
        
        this.kart.speed = 0;
        this.kart.enginePower = 0;
        this.kart.lateralVelocity = 0;
        this.kart.currentTurnAmount = 0;
        this.kart.targetRotation = 0;
        this.kart.input.forward = false;
        this.kart.input.backward = false;
        this.kart.input.left = false;
        this.kart.input.right = false;
        this.kart.input.drift = false;
        
        this.recoveryMode = false;
        this.recoveryTimer = 0;
        this.stuckTimer = 0;
        this.offTrackTimer = 0;
        this.returnToTrack = false;
        this.lastTrackDist = null;
        
        return true;
    }

    getRecoveryDirection() {
        const closestInfo = this.getClosestWaypointInfo();
        if (!closestInfo) return Math.random() > 0.5 ? 1 : -1;
        
        const target = closestInfo.point;
        const angleToTarget = Math.atan2(
            target.x - this.kart.position.x,
            target.z - this.kart.position.z
        );
        const angleDiff = Utils.normalizeAngle(angleToTarget - this.kart.rotation);
        
        if (Math.abs(angleDiff) < 0.05) {
            return Math.random() > 0.5 ? 1 : -1;
        }
        
        return angleDiff > 0 ? 1 : -1;
    }
}

window.AIController = AIController;
