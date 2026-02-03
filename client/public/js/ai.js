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
        this.lookaheadDistance = 12;
        
        // AI state
        this.targetPoint = null;
        this.stuckTimer = 0;
        this.offTrackTimer = 0;
        this.lastTrackDist = null;
        this.returnToTrack = false;
        this.lastPosition = kart.position.clone();
        this.recoveryMode = false;
        this.recoveryTimer = 0;
        this.avoidanceDirection = 0;
        
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
    
    // ... rest of AI controller implementation (truncated for brevity)
    // Full file will be available in repository
}

// Export class if using modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIController;
}