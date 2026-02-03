// Audio system for the racing game

class AudioManager {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.loadedSounds = {}; // File-based sounds cache
        this.music = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.masterGain = null;
        this.initialized = false;
        this.musicVolume = 0.3;
        this.sfxVolume = 0.5;
        
        // Current course audio
        this.currentCourse = null;
        this.courseAudioLoaded = false;
        
        // File-based sound paths
        this.soundPaths = {
            common: {
                engine_idle: 'audio/sfx/common/engine_idle.mp3',
                engine_rev: 'audio/sfx/common/engine_rev.mp3',
                boost: 'audio/sfx/common/boost.mp3',
                boost_big: 'audio/sfx/common/boost_big.mp3',
                item_get: 'audio/sfx/common/item_get.mp3',
                item_use: 'audio/sfx/common/item_use.mp3',
                missile_fire: 'audio/sfx/common/missile_fire.mp3',
                missile_hit: 'audio/sfx/common/missile_hit.mp3',
                banana_drop: 'audio/sfx/common/banana_drop.mp3',
                spin_out: 'audio/sfx/common/spin_out.mp3',
                shield_up: 'audio/sfx/common/shield_up.mp3',
                shield_hit: 'audio/sfx/common/shield_hit.mp3',
                shield_break: 'audio/sfx/common/shield_break.mp3',
                lightning: 'audio/sfx/common/lightning.mp3',
                teleport: 'audio/sfx/common/teleport.mp3',
                countdown: 'audio/sfx/common/countdown.mp3',
                countdown_go: 'audio/sfx/common/countdown_go.mp3',
                lap_complete: 'audio/sfx/common/lap_complete.mp3',
                race_finish: 'audio/sfx/common/race_finish.mp3',
                collision: 'audio/sfx/common/collision.mp3',
                crash: 'audio/sfx/common/crash.mp3',
                wrong_way: 'audio/sfx/common/wrong_way.mp3'
            },
            grassland: {
                ambient: 'audio/sfx/grassland/ambient.mp3',
                music: 'audio/music/grassland.mp3'
            },
            snow: {
                ambient: 'audio/sfx/snow/ambient.mp3',
                wind: 'audio/sfx/snow/wind.mp3',
                freeze: 'audio/sfx/snow/freeze.mp3',
                snowball_throw: 'audio/sfx/snow/snowball_throw.mp3',
                snowball_hit: 'audio/sfx/snow/snowball_hit.mp3',
                music: 'audio/music/snow.mp3'
            },
            castle: {
                ambient: 'audio/sfx/castle/ambient.mp3',
                lava: 'audio/sfx/castle/lava.mp3',
                fire: 'audio/sfx/castle/fire.mp3',
                fireball_throw: 'audio/sfx/castle/fireball_throw.mp3',
                fireball_hit: 'audio/sfx/castle/fireball_hit.mp3',
                thwomp: 'audio/sfx/castle/thwomp.mp3',
                music: 'audio/music/castle.mp3'
            }
        };
        
        // Sound effect definitions (procedural fallback)
        // ... (truncated for brevity - full implementation in repository)
    }
    
    // ... rest of audio manager implementation (truncated for brevity)
    // Full file will be available in repository
}

// Initialize global audio manager
window.audioManager = new AudioManager();

// Export class if using modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
}