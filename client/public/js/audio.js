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
        this.soundDefs = {
            engine_idle: { frequency: 80, type: 'sawtooth', duration: 0.1, loop: true },
            engine_rev: { frequency: 120, type: 'sawtooth', duration: 0.1, loop: true },
            drift: { frequency: 200, type: 'noise', duration: 0.1, loop: true },
            boost: { frequency: 400, type: 'square', duration: 0.3, sweep: 800 },
            boost_big: { frequency: 300, type: 'square', duration: 0.5, sweep: 1000 },
            item_get: { frequency: 600, type: 'sine', duration: 0.2, sweep: 1200 },
            item_use: { frequency: 400, type: 'square', duration: 0.15 },
            missile_fire: { frequency: 200, type: 'sawtooth', duration: 0.3, sweep: 50 },
            missile_hit: { frequency: 100, type: 'noise', duration: 0.4 },
            banana_drop: { frequency: 300, type: 'sine', duration: 0.1 },
            spin_out: { frequency: 150, type: 'noise', duration: 0.5 },
            shield_up: { frequency: 500, type: 'sine', duration: 0.3, sweep: 800 },
            shield_hit: { frequency: 600, type: 'noise', duration: 0.2 },
            shield_break: { frequency: 400, type: 'noise', duration: 0.3 },
            lightning: { frequency: 100, type: 'noise', duration: 0.6 },
            teleport: { frequency: 800, type: 'sine', duration: 0.4, sweep: 200 },
            countdown: { frequency: 440, type: 'sine', duration: 0.3 },
            countdown_go: { frequency: 880, type: 'sine', duration: 0.5 },
            lap_complete: { frequency: 523, type: 'sine', duration: 0.2, arpeggio: [523, 659, 784] },
            race_finish: { frequency: 523, type: 'sine', duration: 0.15, arpeggio: [523, 659, 784, 1047] },
            collision: { frequency: 80, type: 'noise', duration: 0.2 },
            crash: { frequency: 60, type: 'noise', duration: 0.4 },
            wrong_way: { frequency: 200, type: 'square', duration: 0.3 },
            freeze: { frequency: 1200, type: 'sine', duration: 0.5, sweep: 400 },
            fire: { frequency: 150, type: 'noise', duration: 0.4 },
            snowball_throw: { frequency: 300, type: 'noise', duration: 0.2 },
            snowball_hit: { frequency: 800, type: 'sine', duration: 0.3, sweep: 200 },
            fireball_throw: { frequency: 200, type: 'sawtooth', duration: 0.3, sweep: 400 },
            fireball_hit: { frequency: 100, type: 'noise', duration: 0.5 },
            thwomp: { frequency: 50, type: 'noise', duration: 0.4 }
        };
        
        // Engine oscillators
        this.engineOsc = null;
        this.engineGain = null;
        this.driftOsc = null;
        this.driftGain = null;
        
        // Ambient sound sources
        this.ambientSources = [];
    }
    
    async init() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create master gain
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0.7;
            this.masterGain.connect(this.audioContext.destination);
            
            // Create music gain
            this.musicGain = this.audioContext.createGain();
            this.musicGain.gain.value = this.musicVolume;
            this.musicGain.connect(this.masterGain);
            
            // Create SFX gain
            this.sfxGain = this.audioContext.createGain();
            this.sfxGain.gain.value = this.sfxVolume;
            this.sfxGain.connect(this.masterGain);
            
            // Create ambient gain
            this.ambientGain = this.audioContext.createGain();
            this.ambientGain.gain.value = 0.3;
            this.ambientGain.connect(this.masterGain);
            
            this.initialized = true;
            console.log('Audio system initialized');
            
            // Try to preload common sounds
            this.preloadCommonSounds();
        } catch (e) {
            console.warn('Audio system failed to initialize:', e);
        }
    }
    
    // Preload common sounds in background
    async preloadCommonSounds() {
        const commonSounds = Object.entries(this.soundPaths.common);
        for (const [name, path] of commonSounds) {
            try {
                await this.loadSound(name, path);
            } catch (e) {
                // Silently fail - will use procedural fallback
            }
        }
    }
    
    // Load a sound file
    async loadSound(name, url) {
        if (this.loadedSounds[name]) {
            return this.loadedSounds[name];
        }
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            this.loadedSounds[name] = audioBuffer;
            console.log(`Loaded sound: ${name}`);
            return audioBuffer;
        } catch (e) {
            console.warn(`Failed to load sound ${name} from ${url}:`, e.message);
            return null;
        }
    }
    
    // Load course-specific audio
    async loadCourseAudio(courseName) {
        if (this.currentCourse === courseName && this.courseAudioLoaded) {
            return;
        }
        
        this.currentCourse = courseName;
        this.courseAudioLoaded = false;
        
        const courseSounds = this.soundPaths[courseName];
        if (!courseSounds) {
            console.warn(`No audio defined for course: ${courseName}`);
            return;
        }
        
        const loadPromises = Object.entries(courseSounds).map(([name, path]) => {
            const soundName = `${courseName}_${name}`;
            return this.loadSound(soundName, path);
        });
        
        await Promise.allSettled(loadPromises);
        this.courseAudioLoaded = true;
        console.log(`Loaded audio for course: ${courseName}`);
    }
    
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    // Create noise buffer for noise-based sounds
    createNoiseBuffer(duration = 1) {
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        return buffer;
    }
    
    // Play a sound - file-based if available, procedural fallback
    playSound(soundName, options = {}) {
        if (!this.initialized || !this.audioContext) return null;
        
        // Check if we have a loaded file for this sound
        const courseSpecificName = this.currentCourse ? `${this.currentCourse}_${soundName}` : null;
        const loadedBuffer = this.loadedSounds[courseSpecificName] || this.loadedSounds[soundName];
        
        if (loadedBuffer) {
            return this.playLoadedSound(loadedBuffer, options);
        }
        
        // Fall back to procedural sound
        return this.playProceduralSound(soundName, options);
    }
    
    // Play a pre-loaded sound buffer
    playLoadedSound(buffer, options = {}) {
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        
        const gain = this.audioContext.createGain();
        gain.gain.value = options.volume || 0.5;
        
        source.connect(gain);
        gain.connect(this.sfxGain);
        
        source.loop = options.loop || false;
        source.playbackRate.value = options.playbackRate || 1;
        
        source.start(0);
        
        if (!options.loop && options.duration) {
            source.stop(this.audioContext.currentTime + options.duration);
        }
        
        return source;
    }
    
    // Play a synthesized (procedural) sound effect
    playProceduralSound(soundName, options = {}) {
        const def = this.soundDefs[soundName];
        if (!def) {
            console.warn(`Sound not found: ${soundName}`);
            return null;
        }
        
        const now = this.audioContext.currentTime;
        let source;
        
        if (def.type === 'noise') {
            // Create noise
            source = this.audioContext.createBufferSource();
            source.buffer = this.createNoiseBuffer(def.duration);
            
            // Add filter for shaping
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = def.frequency * 4;
            
            const gain = this.audioContext.createGain();
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + def.duration);
            
            source.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);
        } else {
            // Create oscillator
            source = this.audioContext.createOscillator();
            source.type = def.type;
            source.frequency.setValueAtTime(def.frequency, now);
            
            if (def.sweep) {
                source.frequency.exponentialRampToValueAtTime(def.sweep, now + def.duration);
            }
            
            // Handle arpeggio
            if (def.arpeggio) {
                const noteLength = def.duration / def.arpeggio.length;
                def.arpeggio.forEach((freq, i) => {
                    source.frequency.setValueAtTime(freq, now + i * noteLength);
                });
            }
            
            const gain = this.audioContext.createGain();
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + def.duration);
            
            source.connect(gain);
            gain.connect(this.sfxGain);
        }
        
        source.start(now);
        if (!def.loop) {
            source.stop(now + def.duration);
        }
        
        return source;
    }
    
    // Start ambient sound for current course
    startAmbientSound() {
        if (!this.currentCourse) return;
        
        this.stopAmbientSound();
        
        const ambientName = `${this.currentCourse}_ambient`;
        const ambientBuffer = this.loadedSounds[ambientName];
        
        if (ambientBuffer) {
            const source = this.audioContext.createBufferSource();
            source.buffer = ambientBuffer;
            source.loop = true;
            source.connect(this.ambientGain);
            source.start(0);
            this.ambientSources.push(source);
        }
        
        // Course-specific ambient effects
        if (this.currentCourse === 'snow') {
            const windName = `snow_wind`;
            const windBuffer = this.loadedSounds[windName];
            if (windBuffer) {
                const source = this.audioContext.createBufferSource();
                source.buffer = windBuffer;
                source.loop = true;
                
                const gain = this.audioContext.createGain();
                gain.gain.value = 0.2;
                
                source.connect(gain);
                gain.connect(this.ambientGain);
                source.start(0);
                this.ambientSources.push(source);
            }
        } else if (this.currentCourse === 'castle') {
            const lavaName = `castle_lava`;
            const lavaBuffer = this.loadedSounds[lavaName];
            if (lavaBuffer) {
                const source = this.audioContext.createBufferSource();
                source.buffer = lavaBuffer;
                source.loop = true;
                
                const gain = this.audioContext.createGain();
                gain.gain.value = 0.25;
                
                source.connect(gain);
                gain.connect(this.ambientGain);
                source.start(0);
                this.ambientSources.push(source);
            }
        }
    }
    
    // Stop ambient sounds
    stopAmbientSound() {
        this.ambientSources.forEach(source => {
            try {
                source.stop();
            } catch (e) {}
        });
        this.ambientSources = [];
    }
    
    // Start engine sound
    startEngine() {
        if (!this.initialized) return;
        
        if (this.engineOsc) {
            this.stopEngine();
        }
        
        this.engineOsc = this.audioContext.createOscillator();
        this.engineOsc.type = 'sawtooth';
        this.engineOsc.frequency.value = 60;
        
        this.engineGain = this.audioContext.createGain();
        this.engineGain.gain.value = 0.08;
        
        // Add some filtering to make it sound more like an engine
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        
        this.engineOsc.connect(filter);
        filter.connect(this.engineGain);
        this.engineGain.connect(this.sfxGain);
        
        this.engineOsc.start();
    }
    
    // Update engine sound based on speed
    updateEngine(speed, maxSpeed, isDrifting) {
        if (!this.engineOsc) return;
        
        const speedRatio = speed / maxSpeed;
        const baseFreq = 60;
        const maxFreq = 180;
        
        this.engineOsc.frequency.value = baseFreq + (maxFreq - baseFreq) * speedRatio;
        this.engineGain.gain.value = 0.05 + speedRatio * 0.1;
        
        // Handle drift sound
        if (isDrifting && !this.driftOsc) {
            this.startDriftSound();
        } else if (!isDrifting && this.driftOsc) {
            this.stopDriftSound();
        }
    }
    
    startDriftSound() {
        if (!this.initialized || this.driftOsc) return;
        
        this.driftOsc = this.audioContext.createOscillator();
        this.driftOsc.type = 'sawtooth';
        this.driftOsc.frequency.value = 100;
        
        this.driftGain = this.audioContext.createGain();
        this.driftGain.gain.value = 0.05;
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 500;
        
        this.driftOsc.connect(filter);
        filter.connect(this.driftGain);
        this.driftGain.connect(this.sfxGain);
        
        this.driftOsc.start();
    }
    
    stopDriftSound() {
        if (this.driftOsc) {
            this.driftOsc.stop();
            this.driftOsc = null;
            this.driftGain = null;
        }
    }
    
    stopEngine() {
        if (this.engineOsc) {
            this.engineOsc.stop();
            this.engineOsc = null;
            this.engineGain = null;
        }
        this.stopDriftSound();
    }
    
    // Play background music (file-based if available, procedural fallback)
    playMusic(type = 'race') {
        if (!this.initialized) return;
        
        this.stopMusic();
        
        // Check for course-specific music file
        if (type === 'race' && this.currentCourse) {
            const musicName = `${this.currentCourse}_music`;
            const musicBuffer = this.loadedSounds[musicName];
            
            if (musicBuffer) {
                this.playMusicFromBuffer(musicBuffer);
                return;
            }
        }
        
        // Fall back to procedural music
        const bpm = type === 'race' ? 140 : type === 'menu' ? 100 : 120;
        const beatLength = 60 / bpm;
        
        this.musicPlaying = true;
        this.playMusicLoop(type, beatLength);
    }
    
    // Play music from loaded buffer
    playMusicFromBuffer(buffer) {
        if (this.musicSource) {
            this.musicSource.stop();
        }
        
        this.musicSource = this.audioContext.createBufferSource();
        this.musicSource.buffer = buffer;
        this.musicSource.loop = true;
        this.musicSource.connect(this.musicGain);
        this.musicSource.start(0);
        this.musicPlaying = true;
    }
    
    playMusicLoop(type, beatLength) {
        if (!this.musicPlaying || !this.initialized) return;
        
        const now = this.audioContext.currentTime;
        
        // Bass line
        const bassNotes = type === 'race' 
            ? [65.41, 82.41, 98.00, 82.41] // C2, E2, G2, E2
            : [55.00, 65.41, 73.42, 65.41]; // A1, C2, D2, C2
        
        // Melody notes
        const melodyNotes = type === 'race'
            ? [261.63, 329.63, 392.00, 329.63, 293.66, 349.23, 392.00, 440.00]
            : [220.00, 261.63, 293.66, 261.63];
        
        // Play bass
        bassNotes.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            
            const gain = this.audioContext.createGain();
            gain.gain.setValueAtTime(0.15, now + i * beatLength);
            gain.gain.exponentialRampToValueAtTime(0.01, now + (i + 0.8) * beatLength);
            
            osc.connect(gain);
            gain.connect(this.musicGain);
            
            osc.start(now + i * beatLength);
            osc.stop(now + (i + 1) * beatLength);
        });
        
        // Play melody (every other beat)
        melodyNotes.forEach((freq, i) => {
            if (Math.random() > 0.3) {
                const osc = this.audioContext.createOscillator();
                osc.type = 'square';
                osc.frequency.value = freq;
                
                const gain = this.audioContext.createGain();
                gain.gain.setValueAtTime(0.08, now + i * beatLength * 0.5);
                gain.gain.exponentialRampToValueAtTime(0.01, now + (i + 0.3) * beatLength * 0.5);
                
                osc.connect(gain);
                gain.connect(this.musicGain);
                
                osc.start(now + i * beatLength * 0.5);
                osc.stop(now + (i + 0.5) * beatLength * 0.5);
            }
        });
        
        // Hi-hat rhythm
        for (let i = 0; i < 8; i++) {
            const noise = this.audioContext.createBufferSource();
            noise.buffer = this.createNoiseBuffer(0.05);
            
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.value = 8000;
            
            const gain = this.audioContext.createGain();
            gain.gain.setValueAtTime(0.05, now + i * beatLength * 0.5);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * beatLength * 0.5 + 0.05);
            
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.musicGain);
            
            noise.start(now + i * beatLength * 0.5);
        }
        
        // Schedule next loop
        const loopLength = bassNotes.length * beatLength;
        setTimeout(() => this.playMusicLoop(type, beatLength), loopLength * 1000 - 50);
    }
    
    stopMusic() {
        this.musicPlaying = false;
        
        // Stop file-based music source
        if (this.musicSource) {
            try {
                this.musicSource.stop();
            } catch (e) {}
            this.musicSource = null;
        }
    }
    
    // Set course and load its audio
    async setCourse(courseName) {
        await this.loadCourseAudio(courseName);
    }
    
    // Play victory fanfare
    playVictoryFanfare() {
        if (!this.initialized) return;
        
        const now = this.audioContext.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50, 1318.51];
        const durations = [0.2, 0.2, 0.2, 0.4, 0.2, 0.2, 0.6];
        
        let time = 0;
        notes.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            osc.type = 'square';
            osc.frequency.value = freq;
            
            const gain = this.audioContext.createGain();
            gain.gain.setValueAtTime(0.2, now + time);
            gain.gain.exponentialRampToValueAtTime(0.01, now + time + durations[i] * 0.9);
            
            osc.connect(gain);
            gain.connect(this.sfxGain);
            
            osc.start(now + time);
            osc.stop(now + time + durations[i]);
            
            time += durations[i];
        });
    }
    
    setMusicVolume(volume) {
        this.musicVolume = volume;
        if (this.musicGain) {
            this.musicGain.gain.value = volume;
        }
    }
    
    setSFXVolume(volume) {
        this.sfxVolume = volume;
        if (this.sfxGain) {
            this.sfxGain.gain.value = volume;
        }
    }
}

// Create global audio manager
window.audioManager = new AudioManager();
