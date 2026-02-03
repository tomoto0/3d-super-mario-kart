// Utility functions for the racing game

// Math utilities
const Utils = {
    // Clamp value between min and max
    clamp: function(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },
    
    // Linear interpolation
    lerp: function(a, b, t) {
        return a + (b - a) * t;
    },
    
    // Smooth interpolation
    smoothLerp: function(a, b, t) {
        t = t * t * (3 - 2 * t);
        return a + (b - a) * t;
    },
    
    // Convert degrees to radians
    degToRad: function(degrees) {
        return degrees * Math.PI / 180;
    },
    
    // Convert radians to degrees
    radToDeg: function(radians) {
        return radians * 180 / Math.PI;
    },
    
    // Get random value in range
    random: function(min, max) {
        return Math.random() * (max - min) + min;
    },
    
    // Distance between two points (2D)
    distance2D: function(x1, z1, x2, z2) {
        const dx = x2 - x1;
        const dz = z2 - z1;
        return Math.sqrt(dx * dx + dz * dz);
    },
    
    // Angle between two points (returns radians)
    angleBetween: function(x1, z1, x2, z2) {
        return Math.atan2(z2 - z1, x2 - x1);
    },
    
    // Normalize angle to -PI to PI
    normalizeAngle: function(angle) {
        while (angle > Math.PI) angle -= 2 * Math.PI;
        while (angle < -Math.PI) angle += 2 * Math.PI;
        return angle;
    },
    
    // Check if point is inside polygon (2D)
    pointInPolygon: function(x, z, polygon) {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].x, zi = polygon[i].z;
            const xj = polygon[j].x, zj = polygon[j].z;
            
            if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) {
                inside = !inside;
            }
        }
        return inside;
    },
    
    // ... Complete utility functions truncated for upload
    // Full utility library with math, timing, and helper functions
    // Available in GitHub repository
};

// Export for module usage
if (typeof window !== 'undefined') {
    window.Utils = Utils;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}