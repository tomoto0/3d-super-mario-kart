// UI Manager - handles all HUD elements and screens

class UIManager {
    constructor() {
        // Get UI elements
        this.loadingScreen = document.getElementById('loading-screen');
        this.loadingBar = document.getElementById('loading-bar');
        this.loadingText = document.getElementById('loading-text');
        
        this.mainMenu = document.getElementById('main-menu');
        this.courseSelect = document.getElementById('course-select');
        this.hud = document.getElementById('hud');
        this.countdown = document.getElementById('countdown');
        this.wrongWay = document.getElementById('wrong-way');
        this.resultsScreen = document.getElementById('results-screen');
        this.pauseMenu = document.getElementById('pause-menu');
        
        // HUD elements
        this.positionDisplay = document.getElementById('position-display');
        this.lapDisplay = document.getElementById('lap-display');
        this.timerDisplay = document.getElementById('timer-display');
        this.itemDisplay = document.getElementById('item-display');
        this.speedDisplay = document.getElementById('speed-display');
        this.speedBar = document.getElementById('speed-bar');
        this.boostFill = document.getElementById('boost-fill');
        
        // Minimap
        this.minimapCanvas = document.getElementById('minimap-canvas');
        this.minimapCtx = this.minimapCanvas ? this.minimapCanvas.getContext('2d') : null;
        
        // Setup minimap canvas
        if (this.minimapCanvas) {
            this.minimapCanvas.width = 180;
            this.minimapCanvas.height = 180;
        }
        
        // Difficulty selection
        this.selectedDifficulty = 'normal';
        this.setupDifficultyButtons();
        
        // Course selection
        this.selectedCourse = 'grassland';
        this.setupCourseSelection();

        // Button handlers
        this.setupButtons();

        // Item icon cache
        this.iconCache = new Map();
    }
    
    setupDifficultyButtons() {
        const diffButtons = document.querySelectorAll('.diff-btn');
        diffButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                diffButtons.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.selectedDifficulty = btn.dataset.difficulty;
            });
        });
    }
    
    setupCourseSelection() {
        const courseCards = document.querySelectorAll('.course-card');
        courseCards.forEach(card => {
            card.addEventListener('click', () => {
                courseCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.selectedCourse = card.dataset.course;
            });
        });
        
        // Select first course by default
        if (courseCards.length > 0) {
            courseCards[0].classList.add('selected');
        }
    }
    
    setupButtons() {
        console.log('=== setupButtons開始 ===');
        
        // Start button (now opens course select)
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                console.log('START BUTTONクリック');
                this.showCourseSelect();
            });
        }
        
        // Course select back button
        const courseBackBtn = document.getElementById('course-back-btn');
        if (courseBackBtn) {
            courseBackBtn.addEventListener('click', () => {
                this.showMainMenu();
            });
        }
        
        // Course select start button
        const courseStartBtn = document.getElementById('course-start-btn');
        console.log('courseStartBtn:', courseStartBtn);
        if (courseStartBtn) {
            courseStartBtn.addEventListener('click', () => {
                console.log('=== START RACEボタンクリック ===');
                console.log('selectedDifficulty:', this.selectedDifficulty);
                console.log('selectedCourse:', this.selectedCourse);
                console.log('window.game:', window.game);
                if (window.game) {
                    console.log('startRace呼び出し中...');
                    window.game.startRace(this.selectedDifficulty, this.selectedCourse);
                } else {
                    console.error('window.gameが存在しません！');
                    alert('エラー: ゲームが初期化されていません');
                }
            });
        } else {
            console.error('courseStartBtnが見つかりません！');
        }
        
        // Restart button
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                if (window.game) {
                    window.game.restartRace();
                }
            });
        }
        
        // Menu button
        const menuBtn = document.getElementById('menu-btn');
        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                if (window.game) {
                    window.game.returnToMenu();
                }
            });
        }
        
        // Resume button
        const resumeBtn = document.getElementById('resume-btn');
        if (resumeBtn) {
            resumeBtn.addEventListener('click', () => {
                if (window.game) {
                    window.game.resumeRace();
                }
            });
        }

        // Pause button (HUD)
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                if (!window.game) return;
                if (window.game.gameState === 'racing') {
                    window.game.pauseRace();
                } else if (window.game.gameState === 'paused') {
                    window.game.resumeRace();
                }
            });
        }
        
        // Quit button
        const quitBtn = document.getElementById('quit-btn');
        if (quitBtn) {
            quitBtn.addEventListener('click', () => {
                if (window.game) {
                    window.game.returnToMenu();
                }
            });
        }
    }
    
    // Loading screen
    updateLoading(progress, text) {
        if (this.loadingBar) {
            this.loadingBar.style.width = `${progress}%`;
        }
        if (this.loadingText) {
            this.loadingText.textContent = text;
        }
    }
    
    hideLoading() {
        if (this.loadingScreen) {
            this.loadingScreen.style.display = 'none';
        }
    }
    
    // Screen transitions
    showMainMenu() {
        this.hideAllScreens();
        if (this.mainMenu) {
            this.mainMenu.style.display = 'flex';
        }
    }
    
    showCourseSelect() {
        this.hideAllScreens();
        if (this.courseSelect) {
            this.courseSelect.style.display = 'flex';
        }
    }
    
    showHUD() {
        this.hideAllScreens();
        if (this.hud) {
            this.hud.style.display = 'block';
        }
    }
    
    showResults(results) {
        if (this.hud) {
            this.hud.style.display = 'none';
        }
        if (this.resultsScreen) {
            this.resultsScreen.style.display = 'flex';
            this.buildResultsTable(results);
        }
    }
    
    showPauseMenu() {
        if (this.pauseMenu) {
            this.pauseMenu.style.display = 'flex';
        }
    }
    
    hidePauseMenu() {
        if (this.pauseMenu) {
            this.pauseMenu.style.display = 'none';
        }
    }
    
    hideAllScreens() {
        if (this.mainMenu) this.mainMenu.style.display = 'none';
        if (this.courseSelect) this.courseSelect.style.display = 'none';
        if (this.hud) this.hud.style.display = 'none';
        if (this.resultsScreen) this.resultsScreen.style.display = 'none';
        if (this.pauseMenu) this.pauseMenu.style.display = 'none';
        if (this.countdown) this.countdown.style.display = 'none';
        if (this.wrongWay) this.wrongWay.style.display = 'none';
    }
    
    // Countdown
    async showCountdown() {
        return new Promise(resolve => {
            if (!this.countdown) {
                resolve();
                return;
            }
            
            const sequence = ['3', '2', '1', 'GO!'];
            let index = 0;
            
            const showNext = () => {
                if (index >= sequence.length) {
                    this.countdown.style.display = 'none';
                    resolve();
                    return;
                }
                
                this.countdown.textContent = sequence[index];
                this.countdown.style.display = 'block';
                this.countdown.style.animation = 'none';
                void this.countdown.offsetWidth; // Trigger reflow
                this.countdown.style.animation = 'countPulse 0.5s ease-out';
                
                // Play sound
                if (window.audioManager) {
                    window.audioManager.playSound(index < 3 ? 'countdown' : 'countdown_go');
                }
                
                index++;
                setTimeout(showNext, 1000);
            };
            
            showNext();
        });
    }
    
    // HUD updates
    updatePosition(position) {
        if (!this.positionDisplay) return;
        
        const suffix = Utils.getOrdinalSuffix(position);
        this.positionDisplay.innerHTML = `${position}<span>${suffix}</span>`;
        
        // Color based on position
        const colors = ['#ffd700', '#c0c0c0', '#cd7f32', '#ffffff'];
        this.positionDisplay.style.color = colors[Math.min(position - 1, 3)];
    }
    
    updateLap(current, total) {
        if (!this.lapDisplay) return;
        this.lapDisplay.textContent = `Lap ${current}/${total}`;
        
        // Flash on new lap
        if (current > 1) {
            this.lapDisplay.style.transform = 'scale(1.3)';
            this.lapDisplay.style.color = '#00ff00';
            setTimeout(() => {
                this.lapDisplay.style.transform = 'scale(1)';
                this.lapDisplay.style.color = '#ffd93d';
            }, 500);
        }
    }
    
    updateTimer(timeMs) {
        if (!this.timerDisplay) return;
        this.timerDisplay.textContent = Utils.formatTime(timeMs);
    }

    buildSvg(body, viewBox = '0 0 64 64') {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${body}</svg>`;
    }

    getItemIconDataUrl(itemOrId) {
        const id = typeof itemOrId === 'string' ? itemOrId : itemOrId?.id;
        if (!id) return null;
        if (this.iconCache.has(id)) return this.iconCache.get(id);
        
        const svg = this.buildItemIconSvg(id);
        if (!svg) return null;
        const url = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
        this.iconCache.set(id, url);
        return url;
    }

    buildItemIconSvg(id) {
        const outline = '#111111';
        const stem = '#f9e6c7';
        const capRed = '#d8232a';
        const capGreen = '#2fbf4f';
        const capBlue = '#3b7bff';
        const capYellow = '#f2c94c';
        
        const mushroomSvg = color => this.buildSvg(`
            <ellipse cx="32" cy="26" rx="22" ry="14" fill="${color}" stroke="${outline}" stroke-width="3"/>
            <circle cx="20" cy="24" r="5" fill="#ffffff"/>
            <circle cx="32" cy="18" r="4" fill="#ffffff"/>
            <circle cx="44" cy="24" r="5" fill="#ffffff"/>
            <rect x="22" y="28" width="20" height="20" rx="6" fill="${stem}" stroke="${outline}" stroke-width="3"/>
        `);
        
        const tripleMushroomSvg = this.buildSvg(`
            <g transform="translate(6 8) scale(0.6)">
                <ellipse cx="32" cy="26" rx="22" ry="14" fill="${capRed}" stroke="${outline}" stroke-width="3"/>
                <circle cx="20" cy="24" r="5" fill="#ffffff"/>
                <circle cx="32" cy="18" r="4" fill="#ffffff"/>
                <rect x="22" y="28" width="20" height="20" rx="6" fill="${stem}" stroke="${outline}" stroke-width="3"/>
            </g>
            <g transform="translate(26 16) scale(0.55)">
                <ellipse cx="32" cy="26" rx="22" ry="14" fill="${capGreen}" stroke="${outline}" stroke-width="3"/>
                <circle cx="20" cy="24" r="5" fill="#ffffff"/>
                <circle cx="32" cy="18" r="4" fill="#ffffff"/>
                <rect x="22" y="28" width="20" height="20" rx="6" fill="${stem}" stroke="${outline}" stroke-width="3"/>
            </g>
            <g transform="translate(20 28) scale(0.5)">
                <ellipse cx="32" cy="26" rx="22" ry="14" fill="${capBlue}" stroke="${outline}" stroke-width="3"/>
                <circle cx="20" cy="24" r="5" fill="#ffffff"/>
                <circle cx="32" cy="18" r="4" fill="#ffffff"/>
                <rect x="22" y="28" width="20" height="20" rx="6" fill="${stem}" stroke="${outline}" stroke-width="3"/>
            </g>
        `);
        
        const shellSvg = color => this.buildSvg(`
            <circle cx="32" cy="32" r="22" fill="${color}" stroke="${outline}" stroke-width="3"/>
            <circle cx="32" cy="32" r="18" fill="none" stroke="#f6f6f6" stroke-width="4"/>
            <polygon points="32,16 38,28 32,40 26,28" fill="rgba(0,0,0,0.18)"/>
            <polygon points="16,30 28,32 16,44 12,36" fill="rgba(0,0,0,0.18)"/>
            <polygon points="48,30 36,32 48,44 52,36" fill="rgba(0,0,0,0.18)"/>
        `);
        
        const bananaSvg = this.buildSvg(`
            <path d="M10 38 C18 18 40 10 54 20 C46 44 26 52 10 38 Z" fill="#ffd84a" stroke="${outline}" stroke-width="3"/>
            <circle cx="14" cy="36" r="3" fill="#7a4a1d"/>
            <circle cx="50" cy="22" r="3" fill="#7a4a1d"/>
            <path d="M16 34 C24 24 40 18 50 24" fill="none" stroke="#fff2b0" stroke-width="3" opacity="0.6"/>
        `);
        
        const starSvg = this.buildSvg(`
            <polygon points="32,8 38,24 56,24 42,34 48,52 32,42 16,52 22,34 8,24 26,24" fill="${capYellow}" stroke="${outline}" stroke-width="3"/>
        `);
        
        const lightningSvg = this.buildSvg(`
            <polygon points="30,6 40,6 34,26 46,26 26,58 30,34 18,34" fill="#ffe45c" stroke="${outline}" stroke-width="3"/>
        `);
        
        const shieldSvg = this.buildSvg(`
            <path d="M32 6 L52 14 V30 C52 44 43 54 32 58 C21 54 12 44 12 30 V14 Z" fill="#5ac8fa" stroke="${outline}" stroke-width="3"/>
            <path d="M32 12 L44 18 V30 C44 40 38 48 32 51 C26 48 20 40 20 30 V18 Z" fill="rgba(255,255,255,0.5)"/>
        `);
        
        const freezeSvg = this.buildSvg(`
            <g stroke="${outline}" stroke-width="2" stroke-linecap="round">
                <line x1="32" y1="10" x2="32" y2="54" />
                <line x1="10" y1="32" x2="54" y2="32" />
                <line x1="18" y1="18" x2="46" y2="46" />
                <line x1="46" y1="18" x2="18" y2="46" />
            </g>
        `);
        
        const swapSvg = this.buildSvg(`
            <path d="M10 22 H40 L34 16" fill="none" stroke="${outline}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M54 42 H24 L30 48" fill="none" stroke="${outline}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="32" cy="22" r="8" fill="#f6f6f6" opacity="0.6"/>
            <circle cx="32" cy="42" r="8" fill="#f6f6f6" opacity="0.6"/>
        `);

        const questionSvg = this.buildSvg(`
            <path d="M24 24 C24 16 40 16 40 26 C40 32 32 34 32 40" fill="none" stroke="${outline}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M24 24 C24 16 40 16 40 26 C40 32 32 34 32 40" fill="none" stroke="#ffd93d" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="32" cy="48" r="5" fill="${outline}"/>
            <circle cx="32" cy="48" r="3" fill="#ffd93d"/>
        `);
        
        switch (id) {
            case 'rocket_boost':
                return mushroomSvg(capRed);
            case 'triple_boost':
                return tripleMushroomSvg;
            case 'banana':
                return bananaSvg;
            case 'green_shell':
                return shellSvg('#2fbf4f');
            case 'red_shell':
                return shellSvg('#e23a2e');
            case 'star':
                return starSvg;
            case 'lightning':
                return lightningSvg;
            case 'shield':
                return shieldSvg;
            case 'time_freeze':
                return freezeSvg;
            case 'teleport':
                return swapSvg;
            case 'question_mark':
                return questionSvg;
            case 'oil_slick':
                return null; // fallback to emoji for oil
            case 'snowball':
                return this.buildSvg(`<circle cx="32" cy="32" r="20" fill="#dff5ff" stroke="${outline}" stroke-width="3"/>`);
            case 'fireball':
                return this.buildSvg(`<circle cx="32" cy="32" r="20" fill="#ff6b2e" stroke="${outline}" stroke-width="3"/><circle cx="40" cy="24" r="8" fill="#ffd166" opacity="0.7"/>`);
            default:
                return null;
        }
    }

    setItemDisplayIcon(itemOrId, fallbackEmoji = null) {
        if (!this.itemDisplay) return;
        const url = this.getItemIconDataUrl(itemOrId);
        
        this.itemDisplay.innerHTML = '';
        if (url) {
            const img = document.createElement('img');
            img.src = url;
            img.alt = typeof itemOrId === 'string' ? itemOrId : itemOrId?.name || '';
            img.style.width = '64px';
            img.style.height = '64px';
            img.style.objectFit = 'contain';
            img.style.imageRendering = 'auto';
            img.style.display = 'block';
            this.itemDisplay.appendChild(img);
        } else {
            const span = document.createElement('span');
            span.textContent = fallbackEmoji || (typeof itemOrId === 'string' ? '?' : itemOrId?.emoji || '-');
            span.style.display = 'inline-block';
            span.style.lineHeight = '1';
            this.itemDisplay.appendChild(span);
        }
    }
    
    updateItem(item) {
        if (!this.itemDisplay) return;
        if (this.itemDisplay.classList.contains('roulette')) return;
        
        if (item) {
            this.setItemDisplayIcon(item, item.emoji);
            this.itemDisplay.style.animation = 'pulse 0.5s ease-in-out';
        } else {
            this.setItemDisplayIcon('question_mark', '❓');
            this.itemDisplay.style.animation = '';
        }
    }
    
    updateSpeed(speed, maxSpeed) {
        if (!this.speedDisplay) return;
        const displaySpeed = Math.floor(speed * 3.0); // Convert to km/h-like display (higher numbers feel faster)
        this.speedDisplay.textContent = `${displaySpeed} km/h`;
        
        // Dynamic color based on speed
        const speedPercent = maxSpeed > 0 ? speed / maxSpeed : 0;
        if (this.speedBar) {
            const clamped = Math.max(0, Math.min(1, speedPercent));
            this.speedBar.style.width = `${Math.round(clamped * 100)}%`;
        }
        if (speedPercent > 0.9) {
            this.speedDisplay.style.color = '#ff3333';  // Red at max speed
            this.speedDisplay.style.textShadow = '0 0 15px #ff0000, 0 0 30px #ff0000';
        } else if (speedPercent > 0.7) {
            this.speedDisplay.style.color = '#ffaa00';  // Orange at high speed
            this.speedDisplay.style.textShadow = '0 0 10px #ff8800';
        } else if (speedPercent > 0.5) {
            this.speedDisplay.style.color = '#ffff00';  // Yellow at medium speed
            this.speedDisplay.style.textShadow = '0 0 8px #ffff00';
        } else {
            this.speedDisplay.style.color = '#00ff88';  // Green at low speed
            this.speedDisplay.style.textShadow = '0 0 5px #00ff88';
        }
    }
    
    updateBoostMeter(driftLevel, driftTime, boostTime) {
        if (!this.boostFill) return;
        
        let fillPercent = 0;
        let levelClass = '';
        
        if (boostTime > 0) {
            fillPercent = 100;
            levelClass = 'level3';
        } else if (driftTime > 0) {
            // Drift charging
            if (driftTime < 0.5) {
                fillPercent = (driftTime / 0.5) * 33;
                levelClass = '';
            } else if (driftTime < 1.2) {
                fillPercent = 33 + ((driftTime - 0.5) / 0.7) * 33;
                levelClass = 'level1';
            } else if (driftTime < 2.0) {
                fillPercent = 66 + ((driftTime - 1.2) / 0.8) * 34;
                levelClass = 'level2';
            } else {
                fillPercent = 100;
                levelClass = 'level3';
            }
        }
        
        this.boostFill.style.width = `${fillPercent}%`;
        this.boostFill.className = levelClass;
    }
    
    showWrongWay(show) {
        if (!this.wrongWay) return;
        this.wrongWay.style.display = show ? 'block' : 'none';
    }
    
    // Minimap
    updateMinimap(karts, track) {
        if (!this.minimapCtx || !track) return;
        
        const ctx = this.minimapCtx;
        const width = this.minimapCanvas.width;
        const height = this.minimapCanvas.height;
        
        // Clear with rounded corners background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.beginPath();
        this.roundRect(ctx, 0, 0, width, height, 10);
        ctx.fill();
        
        // Calculate bounds
        const padding = 15;
        const scale = this.calculateMinimapScale(track, width - padding * 2, height - padding * 2);
        const offset = this.calculateMinimapOffset(track, width, height, scale);
        
        // Draw track shadow
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        
        const points = track.trackPoints;
        for (let i = 0; i < points.length; i += 3) {
            const x = (points[i].x * scale) + offset.x + 2;
            const y = (points[i].z * scale) + offset.y + 2;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.stroke();
        
        // Draw track road
        ctx.strokeStyle = '#555555';
        ctx.lineWidth = 12;
        ctx.beginPath();
        
        for (let i = 0; i < points.length; i += 3) {
            const x = (points[i].x * scale) + offset.x;
            const y = (points[i].z * scale) + offset.y;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.stroke();
        
        // Draw track center line (dashed)
        ctx.strokeStyle = '#888888';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        
        for (let i = 0; i < points.length; i += 3) {
            const x = (points[i].x * scale) + offset.x;
            const y = (points[i].z * scale) + offset.y;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw item boxes (if available)
        if (track.itemBoxes) {
            ctx.fillStyle = 'rgba(255, 255, 0, 0.8)';
            track.itemBoxes.forEach(box => {
                if (box.active) {
                    const x = (box.position.x * scale) + offset.x;
                    const y = (box.position.z * scale) + offset.y;
                    ctx.beginPath();
                    ctx.arc(x, y, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        }
        
        // Draw finish line
        ctx.fillStyle = '#ffffff';
        const finishX = (0 * scale) + offset.x;
        const finishY = (-200 * scale) + offset.y;
        ctx.fillRect(finishX - 2, finishY - 10, 4, 20);
        
        // Draw checkered pattern
        ctx.fillStyle = '#000000';
        for (let i = 0; i < 5; i++) {
            if (i % 2 === 0) {
                ctx.fillRect(finishX - 2, finishY - 10 + i * 4, 2, 4);
                ctx.fillRect(finishX, finishY - 10 + i * 4 + 4, 2, 4);
            }
        }
        
        // Sort karts by position (draw lower positions first)
        const sortedKarts = [...karts].sort((a, b) => b.racePosition - a.racePosition);
        
        // Draw karts
        sortedKarts.forEach((kart, index) => {
            const x = (kart.position.x * scale) + offset.x;
            const y = (kart.position.z * scale) + offset.y;
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(-kart.rotation);
            
            // Kart marker
            if (kart.isPlayer) {
                // Player marker - larger with glow effect
                ctx.shadowColor = '#00ff00';
                ctx.shadowBlur = 8;
                
                ctx.fillStyle = '#00ff00';
                ctx.beginPath();
                ctx.moveTo(0, -8);
                ctx.lineTo(-5, 5);
                ctx.lineTo(5, 5);
                ctx.closePath();
                ctx.fill();
                
                // White outline
                ctx.shadowBlur = 0;
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.stroke();
            } else {
                // AI markers - colored dots
                const color = kart.colorData ? kart.colorData.primary : 0xff0000;
                ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
                
                ctx.beginPath();
                ctx.arc(0, 0, 4, 0, Math.PI * 2);
                ctx.fill();
                
                // Dark outline
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
            
            ctx.restore();
            
            // Draw position number next to non-player karts
            if (!kart.isPlayer) {
                ctx.font = 'bold 8px Arial';
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                ctx.fillText(kart.racePosition.toString(), x, y - 8);
            }
        });
        
        // Draw position indicator for player
        const playerKart = karts.find(k => k.isPlayer);
        if (playerKart) {
            ctx.font = 'bold 14px Arial';
            ctx.fillStyle = '#00ff00';
            ctx.textAlign = 'left';
            ctx.fillText(`P${playerKart.racePosition}`, 8, 18);
        }
    }
    
    // Helper function for rounded rectangles
    roundRect(ctx, x, y, w, h, r) {
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
    }
    
    calculateMinimapScale(track, maxWidth, maxHeight) {
        let minX = Infinity, maxX = -Infinity;
        let minZ = Infinity, maxZ = -Infinity;
        
        track.trackPoints.forEach(point => {
            minX = Math.min(minX, point.x);
            maxX = Math.max(maxX, point.x);
            minZ = Math.min(minZ, point.z);
            maxZ = Math.max(maxZ, point.z);
        });
        
        const trackWidth = maxX - minX;
        const trackHeight = maxZ - minZ;
        
        return Math.min(maxWidth / trackWidth, maxHeight / trackHeight) * 0.85;
    }
    
    calculateMinimapOffset(track, canvasWidth, canvasHeight, scale) {
        let minX = Infinity, maxX = -Infinity;
        let minZ = Infinity, maxZ = -Infinity;
        
        track.trackPoints.forEach(point => {
            minX = Math.min(minX, point.x);
            maxX = Math.max(maxX, point.x);
            minZ = Math.min(minZ, point.z);
            maxZ = Math.max(maxZ, point.z);
        });
        
        const centerX = (minX + maxX) / 2;
        const centerZ = (minZ + maxZ) / 2;
        
        return {
            x: canvasWidth / 2 - centerX * scale,
            y: canvasHeight / 2 - centerZ * scale
        };
    }
    
    // Results screen
    buildResultsTable(results) {
        const table = document.getElementById('results-table');
        if (!table) return;
        
        table.innerHTML = '';
        
        results.forEach((racer, index) => {
            const row = document.createElement('div');
            row.className = 'results-row' + (racer.isPlayer ? ' player' : '');
            
            const posColors = ['🥇', '🥈', '🥉', ''];
            const posIcon = posColors[Math.min(index, 3)];
            
            row.innerHTML = `
                <span class="results-position">${posIcon || (index + 1)}</span>
                <span class="results-name">${racer.name}</span>
                <span class="results-time">${Utils.formatTime(racer.time)}</span>
            `;
            
            table.appendChild(row);
        });
    }
    
    // Final lap notification
    showFinalLap() {
        // Create temporary overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 72px;
            font-weight: bold;
            color: #ff0000;
            text-shadow: 0 0 20px #ff0000, 4px 4px 0 #000;
            z-index: 200;
            animation: countPulse 0.5s ease-out;
        `;
        overlay.textContent = 'FINAL LAP!';
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            overlay.remove();
        }, 2000);
    }
    
    // Position indicator arrows
    updatePositionArrows(playerKart, allKarts) {
        if (!playerKart) return;
        
        // Create arrows container if not exists
        let arrowsContainer = document.getElementById('position-arrows');
        if (!arrowsContainer) {
            arrowsContainer = document.createElement('div');
            arrowsContainer.id = 'position-arrows';
            arrowsContainer.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 80%;
                height: 80%;
                pointer-events: none;
                z-index: 50;
            `;
            this.hud.appendChild(arrowsContainer);
        }
        
        // Clear existing arrows
        arrowsContainer.innerHTML = '';
        
        // Find karts ahead and behind
        const playerPos = playerKart.racePosition;
        const nearbyKarts = allKarts.filter(k => !k.isPlayer && Math.abs(k.racePosition - playerPos) === 1);
        
        nearbyKarts.forEach(kart => {
            const dx = kart.position.x - playerKart.position.x;
            const dz = kart.position.z - playerKart.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            
            // Only show arrows for nearby karts
            if (distance > 500) return;
            
            // Calculate angle from player to kart
            const angle = Math.atan2(dx, dz) - playerKart.rotation;
            
            // Normalize angle to screen position
            const screenX = Math.sin(angle);
            const screenY = -Math.cos(angle);
            
            // Only show if kart is off-screen (behind or to the sides)
            if (Math.abs(screenY) < 0.5 && Math.abs(screenX) < 0.5) return;
            
            // Create arrow indicator
            const arrow = document.createElement('div');
            const isAhead = kart.racePosition < playerPos;
            
            // Position on edge of container
            const edgeX = Math.max(-0.45, Math.min(0.45, screenX * 0.6)) * 100 + 50;
            const edgeY = Math.max(-0.45, Math.min(0.45, screenY * 0.6)) * 100 + 50;
            
            const rotation = Math.atan2(screenX, -screenY) * (180 / Math.PI);
            
            arrow.style.cssText = `
                position: absolute;
                left: ${edgeX}%;
                top: ${edgeY}%;
                transform: translate(-50%, -50%) rotate(${rotation}deg);
                width: 0;
                height: 0;
                border-left: 12px solid transparent;
                border-right: 12px solid transparent;
                border-bottom: 20px solid ${isAhead ? '#ff0000' : '#00ff00'};
                filter: drop-shadow(0 0 5px ${isAhead ? '#ff0000' : '#00ff00'});
                opacity: ${1 - distance / 500};
            `;
            
            // Position number label
            const label = document.createElement('div');
            label.style.cssText = `
                position: absolute;
                left: 50%;
                top: 100%;
                transform: translateX(-50%);
                font-size: 10px;
                font-weight: bold;
                color: white;
                white-space: nowrap;
            `;
            label.textContent = `${kart.racePosition}${Utils.getOrdinalSuffix(kart.racePosition)}`;
            arrow.appendChild(label);
            
            arrowsContainer.appendChild(arrow);
        });
    }
    
    // Enhanced item display with animation
    showItemRoulette(callback) {
        if (!this.itemDisplay) return;
        
        const items = [
            'rocket_boost',
            'banana',
            'green_shell',
            'star',
            'red_shell',
            'shield',
            'lightning',
            'triple_boost'
        ];
        let iterations = 0;
        const maxIterations = 20;
        
        this.itemDisplay.style.animation = '';
        this.itemDisplay.classList.add('roulette');
        
        const interval = setInterval(() => {
            const randomItem = items[Math.floor(Math.random() * items.length)];
            this.setItemDisplayIcon(randomItem);
            iterations++;
            
            if (iterations >= maxIterations) {
                clearInterval(interval);
                this.itemDisplay.classList.remove('roulette');
                if (callback) callback();
            }
        }, 50 + iterations * 5); // Slow down gradually
    }
    
    // Lap times display
    updateLapTimes(lapTimes, currentLap) {
        let lapTimesDiv = document.getElementById('lap-times');
        if (!lapTimesDiv) {
            lapTimesDiv = document.createElement('div');
            lapTimesDiv.id = 'lap-times';
            lapTimesDiv.style.cssText = `
                position: absolute;
                top: 120px;
                right: 20px;
                font-family: 'Rubik', 'Courier New', monospace;
                font-size: 12px;
                color: white;
                text-shadow: 2px 2px 0 #000;
                text-align: right;
            `;
            this.hud.appendChild(lapTimesDiv);
        }
        
        let html = '';
        lapTimes.forEach((time, index) => {
            const lapNum = index + 1;
            const isCurrentLap = lapNum === currentLap;
            const isBestLap = time === Math.min(...lapTimes.filter(t => t > 0));
            
            let color = '#ffffff';
            if (isCurrentLap) color = '#ffff00';
            if (isBestLap && time > 0) color = '#ff00ff';
            
            html += `<div style="color: ${color}; margin-bottom: 4px;">
                Lap ${lapNum}: ${time > 0 ? Utils.formatTime(time) : '--:--.---'}
            </div>`;
        });
        
        lapTimesDiv.innerHTML = html;
    }
    
    // Hit effect
    showHitEffect(type = 'normal') {
        const overlay = document.createElement('div');
        
        const colors = {
            normal: 'rgba(255, 0, 0, 0.5)',
            star: 'rgba(255, 215, 0, 0.5)',
            blue: 'rgba(0, 100, 255, 0.5)'
        };
        
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: ${colors[type] || colors.normal};
            z-index: 300;
            pointer-events: none;
            animation: hitFlash 0.3s ease-out forwards;
        `;
        
        // Add keyframe animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes hitFlash {
                0% { opacity: 1; }
                100% { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            overlay.remove();
            style.remove();
        }, 300);
    }
    
    // Speed boost effect
    showSpeedBoost() {
        const lines = document.createElement('div');
        lines.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(
                to right,
                transparent 0%,
                transparent 45%,
                rgba(255, 255, 255, 0.3) 50%,
                transparent 55%,
                transparent 100%
            );
            z-index: 100;
            pointer-events: none;
            animation: speedBoostLines 2s ease-out forwards;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes speedBoostLines {
                0% { opacity: 1; transform: scaleX(1); }
                100% { opacity: 0; transform: scaleX(2); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(lines);
        
        setTimeout(() => {
            lines.remove();
            style.remove();
        }, 2000);
    }
}

window.UIManager = UIManager;
