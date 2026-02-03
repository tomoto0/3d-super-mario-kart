// Character system - Mario Kart style drivers and models
// 任天堂マリオカート風のキャラクターデザイン

// Character definitions with stats and appearance
const MarioCharacters = {
    mario: {
        id: 'mario',
        name: 'マリオ',
        weight: 'medium',
        stats: { speed: 3, acceleration: 3, handling: 3, weight: 3 },
        colors: { 
            primary: 0xed1c24,    // 鮮やかな赤（帽子・シャツ）
            secondary: 0x2b5caa,  // 青（オーバーオール）
            skin: 0xffc8a8,       // 肌色
            hair: 0x4a2511        // 茶色（髪・ひげ）
        },
        hat: 'cap',
        hatColor: 0xed1c24,
        hatLetter: 'M',
        mustache: true,
        gloves: 0xffffff,
        overalls: true
    },
    luigi: {
        id: 'luigi',
        name: 'ルイージ',
        weight: 'medium',
        stats: { speed: 3, acceleration: 3, handling: 4, weight: 2 },
        colors: { 
            primary: 0x00a651,    // 鮮やかな緑（帽子・シャツ）
            secondary: 0x2b5caa,  // 青（オーバーオール）
            skin: 0xffc8a8,       // 肌色
            hair: 0x4a2511        // 茶色
        },
        hat: 'cap',
        hatColor: 0x00a651,
        hatLetter: 'L',
        mustache: true,
        gloves: 0xffffff,
        overalls: true,
        taller: true
    },
    peach: {
        id: 'peach',
        name: 'ピーチ',
        weight: 'light',
        stats: { speed: 2, acceleration: 4, handling: 4, weight: 1 },
        colors: { 
            primary: 0xffb6c1,    // ピンク（ドレス）
            secondary: 0xffd700,  // ゴールド（クラウン・アクセント）
            skin: 0xffeedd,       // 明るい肌色
            hair: 0xffd54f,       // 金髪
            lips: 0xff6699        // 唇
        },
        hat: 'crown',
        hatColor: 0xffd700,
        dress: true,
        gloves: 0xffffff,
        earrings: 0x00aaff
    },
    toad: {
        id: 'toad',
        name: 'キノピオ',
        weight: 'light',
        stats: { speed: 2, acceleration: 5, handling: 4, weight: 1 },
        colors: { 
            primary: 0xffffff,    // 白（キノコ傘）
            secondary: 0xff0000,  // 赤（水玉）
            skin: 0xffeedd,       // 肌色
            vest: 0x0066cc        // 青ベスト
        },
        hat: 'mushroom',
        hatColor: 0xffffff,
        spotColor: 0xff0000
    },
    yoshi: {
        id: 'yoshi',
        name: 'ヨッシー',
        weight: 'medium',
        stats: { speed: 3, acceleration: 4, handling: 3, weight: 2 },
        colors: { 
            primary: 0x00cc00,    // 緑（体）
            secondary: 0xff6347,  // オレンジ赤（トサカ）
            skin: 0xffffff,       // 白（お腹）
            shell: 0xff0000,      // 赤（サドル）
            shoes: 0xff8c00       // オレンジ（靴）
        },
        dinosaur: true,
        saddle: 0xff0000
    },
    bowser: {
        id: 'bowser',
        name: 'クッパ',
        weight: 'heavy',
        stats: { speed: 4, acceleration: 1, handling: 2, weight: 5 },
        colors: { 
            primary: 0xe8a317,    // 黄土色（肌）
            secondary: 0x228b22,  // 緑（甲羅）
            skin: 0xf5deb3,       // ベージュ（お腹）
            shell: 0x228b22,      // 緑
            hair: 0xff4500,       // オレンジ赤（髪）
            horns: 0xfffdd0       // クリーム色（角）
        },
        spiky: true,
        horns: 0xfffdd0
    },
    donkeyKong: {
        id: 'donkeyKong',
        name: 'ドンキーコング',
        weight: 'heavy',
        stats: { speed: 4, acceleration: 2, handling: 2, weight: 4 },
        colors: { 
            primary: 0x8b4513,    // 茶色（毛）
            secondary: 0xdeb887,  // ベージュ（顔・胸）
            skin: 0x8b4513,       // 茶色
            tie: 0xff0000         // 赤いネクタイ
        },
        ape: true,
        tie: 0xff0000,
        tieText: 'DK'
    },
    wario: {
        id: 'wario',
        name: 'ワリオ',
        weight: 'heavy',
        stats: { speed: 4, acceleration: 2, handling: 2, weight: 4 },
        colors: { 
            primary: 0xffff00,    // 黄色（帽子・シャツ）
            secondary: 0x6b0ba1,  // 紫（オーバーオール）
            skin: 0xffd8a8,       // 肌色（少し濃いめ）
            hair: 0x4a2511        // 茶色
        },
        hat: 'cap',
        hatColor: 0xffff00,
        hatLetter: 'W',
        mustache: true,
        mustacheStyle: 'zigzag',
        gloves: 0xffffff,
        overalls: true,
        fat: true
    }
};

// Character order for selection
const CharacterOrder = ['mario', 'luigi', 'peach', 'toad', 'yoshi', 'bowser', 'donkeyKong', 'wario'];

// Character model builder
class CharacterModelBuilder {
    constructor() {
        this.textureLoader = new THREE.TextureLoader();
        this.style = 'snes';
    }
    
    // Create a complete driver model
    createDriver(characterId) {
        const charData = MarioCharacters[characterId];
        if (!charData) {
            console.warn(`Character ${characterId} not found, using Mario`);
            return this.createDriver('mario');
        }
        
        const group = new THREE.Group();
        group.userData.characterId = characterId;
        group.userData.characterData = charData;
        
        if (this.style === 'snes') {
            if (charData.dinosaur) {
                this.buildYoshiSNES(group, charData);
            } else if (charData.ape) {
                this.buildApeSNES(group, charData);
            } else if (charData.spiky) {
                this.buildBowserSNES(group, charData);
            } else {
                this.buildHumanoidSNES(group, charData);
            }
            this.addOutlineAndShadow(group);
        } else {
            if (charData.dinosaur) {
                this.buildYoshiModel(group, charData);
            } else if (charData.ape) {
                this.buildApeModel(group, charData);
            } else if (charData.spiky) {
                this.buildBowserModel(group, charData);
            } else {
                this.buildHumanoidModel(group, charData);
            }
        }
        
        return group;
    }

    // ===== SNES-INSPIRED RETRO BUILDERS =====
    makeRetroMat(color, options = {}) {
        return new THREE.MeshStandardMaterial({
            color,
            roughness: options.roughness ?? 0.8,
            metalness: options.metalness ?? 0.0,
            flatShading: true
        });
    }
    
    makeRetroBasic(color, options = {}) {
        return new THREE.MeshBasicMaterial({
            color,
            transparent: options.transparent || false,
            opacity: options.opacity ?? 1
        });
    }
    
    addRetroEyes(group, eyeY, eyeZ, isEvil = false, options = {}) {
        const scale = options.scale ?? 1;
        const eyeWhiteGeom = new THREE.BoxGeometry(0.16 * scale, 0.22 * scale, 0.05 * scale);
        const eyeWhiteMat = this.makeRetroBasic(0xffffff);
        const pupilGeom = new THREE.BoxGeometry(0.07 * scale, 0.1 * scale, 0.02 * scale);
        const pupilMat = this.makeRetroBasic(isEvil ? 0x2b2b2b : 0x111111);
        const highlightGeom = new THREE.BoxGeometry(0.03 * scale, 0.03 * scale, 0.01 * scale);
        const highlightMat = this.makeRetroBasic(0xffffff);
        const spacing = (options.spacing ?? 0.17) * scale;
        
        [-spacing, spacing].forEach((x, i) => {
            const eyeWhite = new THREE.Mesh(eyeWhiteGeom, eyeWhiteMat);
            eyeWhite.position.set(x, eyeY, eyeZ);
            group.add(eyeWhite);
            
            const pupil = new THREE.Mesh(pupilGeom, pupilMat);
            pupil.position.set(x, eyeY - 0.02 * scale, eyeZ + 0.04 * scale);
            group.add(pupil);
            
            const highlight = new THREE.Mesh(highlightGeom, highlightMat);
            highlight.position.set(x + (i === 0 ? -0.03 : 0.03) * scale, eyeY + 0.03 * scale, eyeZ + 0.06 * scale);
            group.add(highlight);
        });
        
        if (options.browColor) {
            const browGeom = new THREE.BoxGeometry(0.18 * scale, 0.05 * scale, 0.08 * scale);
            const browMat = this.makeRetroMat(options.browColor, { roughness: 0.9 });
            const tilt = options.browTilt ?? 0.15;
            [-spacing, spacing].forEach((x, idx) => {
                const brow = new THREE.Mesh(browGeom, browMat);
                brow.position.set(x, eyeY + 0.12 * scale, eyeZ - 0.02 * scale);
                brow.rotation.z = idx === 0 ? tilt : -tilt;
                group.add(brow);
            });
        }
    }
    
    addRetroCheeks(group, headY, headSize, color = 0xffb6b6) {
        const cheekGeom = new THREE.SphereGeometry(headSize * 0.14, 6, 6);
        const cheekMat = this.makeRetroMat(color, { roughness: 0.85 });
        [-1, 1].forEach(side => {
            const cheek = new THREE.Mesh(cheekGeom, cheekMat);
            cheek.position.set(side * headSize * 0.32, headY - headSize * 0.06, headSize * 0.55);
            cheek.scale.set(1, 0.75, 0.6);
            group.add(cheek);
        });
    }
    
    addRetroMouth(group, headY, headSize, color = 0x2b1500) {
        const mouthGeom = new THREE.TorusGeometry(headSize * 0.14, headSize * 0.03, 6, 10, Math.PI);
        const mouthMat = this.makeRetroBasic(color);
        const mouth = new THREE.Mesh(mouthGeom, mouthMat);
        mouth.position.set(0, headY - headSize * 0.32, headSize * 0.58);
        mouth.rotation.x = Math.PI * 0.6;
        group.add(mouth);
    }
    
    addRetroMustache(group, color, headY) {
        const mustacheMat = this.makeRetroMat(color || 0x3a2000, { roughness: 0.9 });
        const mustacheGeom = new THREE.BoxGeometry(0.22, 0.1, 0.14);
        [-1, 1].forEach(side => {
            const mustache = new THREE.Mesh(mustacheGeom, mustacheMat);
            mustache.position.set(side * 0.16, headY - 0.23, 0.4);
            group.add(mustache);
        });
    }
    
    addRetroCap(group, color, headY, headSize, letter = null) {
        const capMat = this.makeRetroMat(color, { roughness: 0.6 });
        const capGeom = new THREE.SphereGeometry(headSize * 0.95, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const cap = new THREE.Mesh(capGeom, capMat);
        cap.position.set(0, headY + headSize * 0.35, headSize * 0.08);
        group.add(cap);
        
        const brimGeom = new THREE.CylinderGeometry(headSize * 0.7, headSize * 0.7, headSize * 0.12, 8);
        const brim = new THREE.Mesh(brimGeom, capMat);
        brim.rotation.x = Math.PI / 2;
        brim.position.set(0, headY + headSize * 0.1, headSize * 0.65);
        group.add(brim);
        
        const emblemGeom = new THREE.CircleGeometry(headSize * 0.22, 10);
        const emblemMat = this.makeRetroBasic(0xf6f6f6);
        const emblem = new THREE.Mesh(emblemGeom, emblemMat);
        emblem.position.set(0, headY + headSize * 0.18, headSize * 0.92);
        group.add(emblem);
        
        if (letter) {
            const letterGroup = this.createPixelTextGroup(letter, color, headSize * 0.08, headSize * 0.05);
            letterGroup.position.set(0, headY + headSize * 0.16, headSize * 0.95);
            group.add(letterGroup);
        }
    }
    
    addRetroCrown(group, color, headY, headSize) {
        const baseMat = this.makeRetroMat(color, { roughness: 0.4 });
        const baseGeom = new THREE.CylinderGeometry(headSize * 0.35, headSize * 0.4, headSize * 0.2, 8);
        const base = new THREE.Mesh(baseGeom, baseMat);
        base.position.set(0, headY + headSize * 0.55, 0);
        group.add(base);
        
        const spikeGeom = new THREE.ConeGeometry(headSize * 0.12, headSize * 0.25, 6);
        const spikeMat = this.makeRetroMat(0xffd700, { roughness: 0.3 });
        [-0.22, 0, 0.22].forEach(x => {
            const spike = new THREE.Mesh(spikeGeom, spikeMat);
            spike.position.set(x, headY + headSize * 0.72, 0);
            group.add(spike);
        });
    }
    
    addRetroMushroomCap(group, colors, headY, headSize) {
        const capMat = this.makeRetroMat(colors.primary || 0xffffff, { roughness: 0.7 });
        const capGeom = new THREE.SphereGeometry(headSize * 1.4, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const cap = new THREE.Mesh(capGeom, capMat);
        cap.position.set(0, headY + headSize * 0.25, 0);
        group.add(cap);
        
        const spotMat = this.makeRetroMat(colors.secondary || 0xff0000, { roughness: 0.8 });
        const spotGeom = new THREE.SphereGeometry(headSize * 0.22, 6, 6);
        const spots = [
            { x: 0.4, y: headY + headSize * 0.6, z: 0.6 },
            { x: -0.35, y: headY + headSize * 0.5, z: 0.5 },
            { x: 0, y: headY + headSize * 0.75, z: -0.1 }
        ];
        spots.forEach(pos => {
            const spot = new THREE.Mesh(spotGeom, spotMat);
            spot.position.set(pos.x, pos.y, pos.z);
            group.add(spot);
        });
    }
    
    buildHumanoidSNES(group, charData) {
        const colors = charData.colors;
        const isFat = charData.fat;
        const isTaller = charData.taller;
        
        const headSize = isFat ? 0.7 : 0.62;
        const headY = isTaller ? 1.34 : 1.26;
        
        const skinMat = this.makeRetroMat(colors.skin || 0xffd8c0, { roughness: 0.7 });
        const head = new THREE.Mesh(new THREE.IcosahedronGeometry(headSize, 0), skinMat);
        head.position.y = headY;
        group.add(head);
        
        const nose = new THREE.Mesh(new THREE.SphereGeometry(headSize * 0.26, 8, 6), skinMat);
        nose.position.set(0, headY - headSize * 0.06, headSize * 0.92);
        nose.scale.set(1.2, 0.8, 1);
        group.add(nose);
        
        const browColor = colors.hair || colors.primary || 0x3a2000;
        this.addRetroEyes(group, headY + headSize * 0.12, headSize * 0.66, charData.id === 'wario', {
            scale: 1.15,
            browColor: browColor,
            browTilt: charData.id === 'wario' ? 0.22 : 0.12
        });
        
        const cheekColor = charData.colors?.lips || 0xffb6b6;
        this.addRetroCheeks(group, headY, headSize, cheekColor);
        
        if (charData.mustache) {
            this.addRetroMustache(group, colors.hair || 0x3a2000, headY);
        } else {
            const mouthColor = charData.colors?.lips || 0x8a3b2d;
            this.addRetroMouth(group, headY, headSize, mouthColor);
        }
        
        if (charData.hat === 'cap') {
            this.addRetroCap(group, charData.hatColor || colors.primary, headY, headSize, charData.hatLetter);
        } else if (charData.hat === 'crown') {
            this.addRetroCrown(group, charData.hatColor || 0xffd700, headY, headSize);
        } else if (charData.hat === 'mushroom') {
            this.addRetroMushroomCap(group, colors, headY, headSize);
        }
        
        const torsoW = isFat ? 0.7 : 0.58;
        const torsoH = isTaller ? 0.58 : 0.5;
        const torsoD = 0.46;
        const shirtMat = this.makeRetroMat(colors.primary, { roughness: 0.8 });
        const shirt = new THREE.Mesh(new THREE.BoxGeometry(torsoW, torsoH, torsoD), shirtMat);
        shirt.position.set(0, 0.82, 0);
        group.add(shirt);
        
        const overallsColor = colors.secondary || colors.primary;
        if (charData.dress) {
            const dressMat = this.makeRetroMat(colors.primary, { roughness: 0.7 });
            const dressGeom = new THREE.CylinderGeometry(torsoW * 0.35, torsoW * 0.75, torsoH * 1.2, 8);
            const dress = new THREE.Mesh(dressGeom, dressMat);
            dress.position.set(0, 0.6, 0);
            group.add(dress);
        } else if (charData.overalls) {
            const overallsMat = this.makeRetroMat(overallsColor, { roughness: 0.7 });
            const overalls = new THREE.Mesh(new THREE.BoxGeometry(torsoW * 0.95, torsoH * 0.9, torsoD * 0.95), overallsMat);
            overalls.position.set(0, 0.6, 0);
            group.add(overalls);
            
            const strapGeom = new THREE.BoxGeometry(torsoW * 0.2, torsoH * 0.5, torsoD * 0.1);
            [-1, 1].forEach(side => {
                const strap = new THREE.Mesh(strapGeom, overallsMat);
                strap.position.set(side * torsoW * 0.25, 0.9, torsoD * 0.5);
                group.add(strap);
            });
        } else if (colors.vest) {
            const vestMat = this.makeRetroMat(colors.vest, { roughness: 0.7 });
            const vest = new THREE.Mesh(new THREE.BoxGeometry(torsoW * 0.9, torsoH * 0.7, torsoD * 0.8), vestMat);
            vest.position.set(0, 0.8, torsoD * 0.2);
            group.add(vest);
        }
        
        const armMat = this.makeRetroMat(colors.primary, { roughness: 0.85 });
        const gloveMat = this.makeRetroMat(charData.gloves || 0xffffff, { roughness: 0.8 });
        const armGeom = new THREE.CylinderGeometry(0.09, 0.1, 0.45, 6);
        const handGeom = new THREE.SphereGeometry(0.12, 6, 6);
        
        [-1, 1].forEach(side => {
            const arm = new THREE.Mesh(armGeom, armMat);
            arm.position.set(side * (torsoW * 0.6), 0.82, 0.1);
            arm.rotation.z = side * 0.5;
            group.add(arm);
            
            const hand = new THREE.Mesh(handGeom, gloveMat);
            hand.position.set(side * (torsoW * 0.85), 0.62, 0.2);
            group.add(hand);
        });
        
        const legMat = this.makeRetroMat(overallsColor, { roughness: 0.8 });
        const shoeColor = colors.shoes || (charData.overalls ? 0x4a2511 : (colors.secondary || 0x4a2511));
        const shoeMat = this.makeRetroMat(shoeColor, { roughness: 0.7 });
        const legGeom = new THREE.BoxGeometry(0.18, 0.32, 0.24);
        const shoeGeom = new THREE.BoxGeometry(0.22, 0.12, 0.35);
        
        [-1, 1].forEach(side => {
            const leg = new THREE.Mesh(legGeom, legMat);
            leg.position.set(side * 0.18, 0.28, 0);
            group.add(leg);
            
            const shoe = new THREE.Mesh(shoeGeom, shoeMat);
            shoe.position.set(side * 0.18, 0.14, 0.1);
            group.add(shoe);
        });
        
        const emblemText = this.getEmblemText(charData);
        if (emblemText && !(charData.hat === 'cap' && charData.hatLetter)) {
            this.addRetroEmblem(group, emblemText, {
                position: { x: 0, y: 0.92, z: 0.42 },
                bgColor: 0xf6f6f6,
                textColor: colors.primary
            });
        }
        
        group.scale.set(0.95, 0.95, 0.95);
    }
    
    buildYoshiSNES(group, charData) {
        const colors = charData.colors;
        const bodyMat = this.makeRetroMat(colors.primary, { roughness: 0.75 });
        const bellyMat = this.makeRetroMat(colors.skin || 0xffffff, { roughness: 0.8 });
        const shellMat = this.makeRetroMat(colors.shell || colors.secondary || 0xff0000, { roughness: 0.7 });
        
        const body = new THREE.Mesh(new THREE.IcosahedronGeometry(0.62, 0), bodyMat);
        body.position.set(0, 0.7, 0);
        group.add(body);
        
        const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.66, 0), bodyMat);
        head.position.set(0, 1.28, 0.25);
        group.add(head);
        
        const snout = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.34, 0.7), bodyMat);
        snout.position.set(0, 1.16, 0.86);
        group.add(snout);
        
        const nose = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), bodyMat);
        nose.position.set(0, 1.22, 1.18);
        group.add(nose);
        
        const belly = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.5, 0.35), bellyMat);
        belly.position.set(0, 0.68, 0.2);
        group.add(belly);
        
        const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.6), shellMat);
        saddle.position.set(0, 0.95, -0.05);
        group.add(saddle);
        
        const shell = new THREE.Mesh(new THREE.SphereGeometry(0.46, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), shellMat);
        shell.position.set(0, 0.86, -0.2);
        shell.rotation.x = Math.PI;
        group.add(shell);
        
        const eyeStalkGeom = new THREE.CylinderGeometry(0.09, 0.11, 0.32, 6);
        const eyeStalkMat = bodyMat;
        [-0.2, 0.2].forEach(x => {
            const stalk = new THREE.Mesh(eyeStalkGeom, eyeStalkMat);
            stalk.position.set(x, 1.62, 0.25);
            group.add(stalk);
            
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 6), this.makeRetroBasic(0xffffff));
            eye.position.set(x, 1.76, 0.3);
            group.add(eye);
            
            const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), this.makeRetroBasic(0x111111));
            pupil.position.set(x, 1.74, 0.4);
            group.add(pupil);
        });
        
        const cheekMat = this.makeRetroMat(colors.skin || 0xffffff, { roughness: 0.85 });
        const cheekGeom = new THREE.SphereGeometry(0.16, 6, 6);
        [-0.32, 0.32].forEach(x => {
            const cheek = new THREE.Mesh(cheekGeom, cheekMat);
            cheek.position.set(x, 1.18, 0.6);
            cheek.scale.set(0.8, 0.6, 0.6);
            group.add(cheek);
        });
        
        const limbGeom = new THREE.BoxGeometry(0.2, 0.28, 0.28);
        [-1, 1].forEach(side => {
            const leg = new THREE.Mesh(limbGeom, bodyMat);
            leg.position.set(side * 0.2, 0.24, 0.05);
            group.add(leg);
        });
        
        const armGeom = new THREE.BoxGeometry(0.18, 0.22, 0.2);
        [-1, 1].forEach(side => {
            const arm = new THREE.Mesh(armGeom, bodyMat);
            arm.position.set(side * 0.35, 0.8, 0.35);
            group.add(arm);
        });
        
        const emblemText = this.getEmblemText(charData);
        if (emblemText) {
            this.addRetroEmblem(group, emblemText, {
                position: { x: 0, y: 0.78, z: 0.62 },
                bgColor: 0xf6f6f6,
                textColor: colors.secondary || 0x111111
            });
        }
        
        group.scale.set(0.95, 0.95, 0.95);
    }
    
    buildBowserSNES(group, charData) {
        const colors = charData.colors;
        const bodyMat = this.makeRetroMat(colors.primary, { roughness: 0.75 });
        const bellyMat = this.makeRetroMat(colors.skin || 0xf5deb3, { roughness: 0.8 });
        const shellMat = this.makeRetroMat(colors.shell || 0x228b22, { roughness: 0.7 });
        
        const body = new THREE.Mesh(new THREE.IcosahedronGeometry(0.78, 0), bodyMat);
        body.position.set(0, 0.75, 0);
        group.add(body);
        
        const belly = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.6, 0.4), bellyMat);
        belly.position.set(0, 0.72, 0.32);
        group.add(belly);
        
        const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.68, 0), bodyMat);
        head.position.set(0, 1.48, 0.2);
        group.add(head);
        
        const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.3, 0.68), bodyMat);
        jaw.position.set(0, 1.1, 0.7);
        group.add(jaw);
        
        const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.26, 0.5), bellyMat);
        muzzle.position.set(0, 1.22, 0.62);
        group.add(muzzle);
        
        const nostrilGeom = new THREE.BoxGeometry(0.08, 0.04, 0.02);
        const nostrilMat = this.makeRetroBasic(0x1a0d06);
        [-0.12, 0.12].forEach(side => {
            const nostril = new THREE.Mesh(nostrilGeom, nostrilMat);
            nostril.position.set(side, 1.2, 0.86);
            group.add(nostril);
        });
        
        this.addRetroEyes(group, 1.58, 0.48, true, {
            scale: 1.05,
            browColor: colors.hair || 0x2b1200,
            browTilt: 0.2
        });
        
        const hornMat = this.makeRetroMat(colors.horns || 0xfffdd0, { roughness: 0.6 });
        const hornGeom = new THREE.ConeGeometry(0.14, 0.35, 6);
        [-0.28, 0.28].forEach(side => {
            const horn = new THREE.Mesh(hornGeom, hornMat);
            horn.position.set(side, 1.72, 0.05);
            horn.rotation.z = side * 0.4;
            group.add(horn);
        });
        
        const shell = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), shellMat);
        shell.position.set(0, 0.85, -0.25);
        shell.rotation.x = Math.PI;
        group.add(shell);
        
        const spikeGeom = new THREE.ConeGeometry(0.12, 0.25, 6);
        const spikeMat = this.makeRetroMat(0xffffff, { roughness: 0.5 });
        const spikePositions = [
            { x: 0, y: 1.1, z: -0.65 },
            { x: -0.25, y: 0.95, z: -0.55 },
            { x: 0.25, y: 0.95, z: -0.55 },
            { x: -0.35, y: 0.75, z: -0.35 },
            { x: 0.35, y: 0.75, z: -0.35 }
        ];
        spikePositions.forEach(pos => {
            const spike = new THREE.Mesh(spikeGeom, spikeMat);
            spike.position.set(pos.x, pos.y, pos.z);
            spike.rotation.x = Math.PI;
            group.add(spike);
        });
        
        const armGeom = new THREE.CylinderGeometry(0.18, 0.2, 0.5, 6);
        [-1, 1].forEach(side => {
            const arm = new THREE.Mesh(armGeom, bodyMat);
            arm.position.set(side * 0.75, 0.9, 0.1);
            arm.rotation.z = side * 0.5;
            group.add(arm);
        });
        
        const legGeom = new THREE.BoxGeometry(0.3, 0.35, 0.4);
        [-1, 1].forEach(side => {
            const leg = new THREE.Mesh(legGeom, bodyMat);
            leg.position.set(side * 0.25, 0.25, 0);
            group.add(leg);
        });
        
        const emblemText = this.getEmblemText(charData);
        if (emblemText) {
            this.addRetroEmblem(group, emblemText, {
                position: { x: 0, y: 0.85, z: 0.68 },
                bgColor: 0xf6f6f6,
                textColor: colors.secondary || 0x111111
            });
        }
        
        group.scale.set(1.0, 1.0, 1.0);
    }
    
    buildApeSNES(group, charData) {
        const colors = charData.colors;
        const bodyMat = this.makeRetroMat(colors.primary || 0x8b4513, { roughness: 0.8 });
        const chestMat = this.makeRetroMat(colors.secondary || 0xdeb887, { roughness: 0.8 });
        
        const body = new THREE.Mesh(new THREE.IcosahedronGeometry(0.75, 0), bodyMat);
        body.position.set(0, 0.78, 0);
        group.add(body);
        
        const chest = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.55, 0.38), chestMat);
        chest.position.set(0, 0.75, 0.28);
        group.add(chest);
        
        const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.63, 0), bodyMat);
        head.position.set(0, 1.42, 0.2);
        group.add(head);
        
        const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.28, 0.42), chestMat);
        muzzle.position.set(0, 1.24, 0.64);
        group.add(muzzle);
        
        const noseGeom = new THREE.BoxGeometry(0.1, 0.05, 0.03);
        const noseMat = this.makeRetroBasic(0x2b1500);
        [-0.1, 0.1].forEach(side => {
            const nostril = new THREE.Mesh(noseGeom, noseMat);
            nostril.position.set(side, 1.22, 0.82);
            group.add(nostril);
        });
        
        this.addRetroEyes(group, 1.48, 0.52, false, {
            scale: 1.1,
            browColor: colors.primary || 0x4a2511,
            browTilt: 0.08
        });
        
        this.addRetroMouth(group, 1.42, 0.6, 0x3a1d10);
        
        if (charData.tie) {
            const tieMat = this.makeRetroMat(charData.tie, { roughness: 0.7 });
            const tie = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.3, 0.05), tieMat);
            tie.position.set(0, 0.95, 0.5);
            group.add(tie);
        }
        
        const armGeom = new THREE.CylinderGeometry(0.2, 0.24, 0.6, 6);
        [-1, 1].forEach(side => {
            const arm = new THREE.Mesh(armGeom, bodyMat);
            arm.position.set(side * 0.85, 0.8, 0.2);
            arm.rotation.z = side * 0.55;
            group.add(arm);
        });
        
        const handGeom = new THREE.SphereGeometry(0.18, 6, 6);
        [-1, 1].forEach(side => {
            const hand = new THREE.Mesh(handGeom, chestMat);
            hand.position.set(side * 1.05, 0.45, 0.3);
            group.add(hand);
        });
        
        const legGeom = new THREE.BoxGeometry(0.28, 0.35, 0.35);
        [-1, 1].forEach(side => {
            const leg = new THREE.Mesh(legGeom, bodyMat);
            leg.position.set(side * 0.28, 0.25, 0);
            group.add(leg);
        });
        
        const emblemText = this.getEmblemText(charData);
        if (emblemText) {
            this.addRetroEmblem(group, emblemText, {
                position: { x: 0, y: 1.02, z: 0.62 },
                bgColor: 0xf6f6f6,
                textColor: colors.primary
            });
        }
        
        group.scale.set(0.95, 0.95, 0.95);
    }

    getEmblemText(charData) {
        if (!charData) return null;
        if (charData.hatLetter) return charData.hatLetter;
        if (charData.tieText) return charData.tieText;
        const fallback = {
            peach: 'P',
            toad: 'T',
            yoshi: 'Y',
            bowser: 'B',
            donkeyKong: 'DK',
            wario: 'W',
            luigi: 'L',
            mario: 'M'
        };
        return fallback[charData.id] || null;
    }
    
    addRetroEmblem(group, text, options = {}) {
        if (!text) return;
        const position = options.position || { x: 0, y: 0.9, z: 0.4 };
        const radius = options.radius || 0.16;
        const bgColor = options.bgColor || 0xf6f6f6;
        const textColor = options.textColor || 0x111111;
        
        const emblem = new THREE.Mesh(
            new THREE.CircleGeometry(radius, 10),
            this.makeRetroBasic(bgColor)
        );
        emblem.position.set(position.x, position.y, position.z);
        emblem.rotation.x = options.rotationX ?? -0.1;
        group.add(emblem);
        
        const textLength = String(text).length;
        const pixelSize = radius * (textLength > 1 ? 0.28 : 0.35);
        const depth = radius * 0.12;
        const textGroup = this.createPixelTextGroup(text, textColor, pixelSize, depth);
        textGroup.position.set(position.x, position.y - radius * 0.05, position.z + radius * 0.02);
        textGroup.rotation.x = emblem.rotation.x;
        group.add(textGroup);
    }
    
    getPixelPattern(letter) {
        const patterns = {
            M: [
                '10001',
                '11011',
                '10101',
                '10001',
                '10001'
            ],
            L: [
                '10000',
                '10000',
                '10000',
                '10000',
                '11111'
            ],
            W: [
                '10001',
                '10001',
                '10101',
                '11011',
                '10001'
            ],
            P: [
                '11110',
                '10001',
                '11110',
                '10000',
                '10000'
            ],
            T: [
                '11111',
                '00100',
                '00100',
                '00100',
                '00100'
            ],
            Y: [
                '10001',
                '01010',
                '00100',
                '00100',
                '00100'
            ],
            B: [
                '11110',
                '10001',
                '11110',
                '10001',
                '11110'
            ],
            D: [
                '11100',
                '10010',
                '10001',
                '10010',
                '11100'
            ],
            K: [
                '10010',
                '10100',
                '11000',
                '10100',
                '10010'
            ]
        };
        return patterns[letter] || patterns[letter?.toUpperCase?.()] || null;
    }
    
    createPixelLetterGroup(letter, color, pixelSize = 0.04, depth = 0.02) {
        const pattern = this.getPixelPattern(letter);
        const group = new THREE.Group();
        if (!pattern) return group;
        
        const rows = pattern.length;
        const cols = pattern[0].length;
        const geo = new THREE.BoxGeometry(pixelSize, pixelSize, depth);
        const mat = this.makeRetroBasic(color);
        const offsetX = (cols - 1) * pixelSize * 0.5;
        const offsetY = (rows - 1) * pixelSize * 0.5;
        
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (pattern[r][c] !== '1') continue;
                const pixel = new THREE.Mesh(geo, mat);
                const x = c * pixelSize - offsetX;
                const y = (rows - 1 - r) * pixelSize - offsetY;
                pixel.position.set(x, y, 0);
                group.add(pixel);
            }
        }
        return group;
    }
    
    createPixelTextGroup(text, color, pixelSize = 0.04, depth = 0.02) {
        const group = new THREE.Group();
        const letters = String(text).split('');
        const spacing = pixelSize * 6;
        const totalWidth = (letters.length - 1) * spacing;
        
        letters.forEach((letter, index) => {
            const letterGroup = this.createPixelLetterGroup(letter, color, pixelSize, depth);
            letterGroup.position.x = index * spacing - totalWidth * 0.5;
            group.add(letterGroup);
        });
        return group;
    }
    
    addOutlineAndShadow(group) {
        const outlineMat = new THREE.MeshBasicMaterial({
            color: 0x111111,
            side: THREE.BackSide
        });
        const sourceMeshes = [];
        
        group.traverse(obj => {
            if (obj.isMesh && !obj.userData.isOutline && !obj.userData.isShadow) {
                sourceMeshes.push(obj);
            }
        });
        
        sourceMeshes.forEach(mesh => {
            const outline = new THREE.Mesh(mesh.geometry, outlineMat);
            outline.position.copy(mesh.position);
            outline.rotation.copy(mesh.rotation);
            outline.scale.copy(mesh.scale).multiplyScalar(1.06);
            outline.userData.isOutline = true;
            outline.renderOrder = (mesh.renderOrder || 0) - 1;
            if (mesh.parent) {
                mesh.parent.add(outline);
            }
        });
        
        const shadow = new THREE.Mesh(
            new THREE.CircleGeometry(0.95, 18),
            this.makeRetroBasic(0x000000, { transparent: true, opacity: 0.35 })
        );
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.set(0, 0.04, 0);
        shadow.userData.isShadow = true;
        group.add(shadow);
    }
    
    // Build humanoid character (Mario, Luigi, Peach, Toad, Wario)
    buildHumanoidModel(group, charData) {
        const colors = charData.colors;
        const isFat = charData.fat;
        const isTaller = charData.taller;
        
        // === 頭部 ===
        const headSize = isFat ? 0.55 : 0.5;
        const headGeom = new THREE.SphereGeometry(headSize, 20, 20);
        const headMat = new THREE.MeshStandardMaterial({ 
            color: colors.skin,
            roughness: 0.5
        });
        const head = new THREE.Mesh(headGeom, headMat);
        head.position.y = isTaller ? 1.35 : 1.2;
        group.add(head);
        
        // === 耳 ===
        const earGeom = new THREE.SphereGeometry(0.12, 8, 8);
        const earMat = new THREE.MeshStandardMaterial({ color: colors.skin, roughness: 0.5 });
        [-1, 1].forEach(side => {
            const ear = new THREE.Mesh(earGeom, earMat);
            ear.position.set(side * 0.45, head.position.y, 0);
            ear.scale.set(0.5, 1, 0.6);
            group.add(ear);
        });
        
        // === 目 ===
        this.addCartoonEyes(group, head.position.y + 0.05, 0.38, charData.id === 'wario');
        
        // === 大きな鼻（マリオブラザーズの特徴） ===
        if (charData.mustache) {
            const noseSize = isFat ? 0.22 : 0.18;
            const noseGeom = new THREE.SphereGeometry(noseSize, 12, 12);
            const noseMat = new THREE.MeshStandardMaterial({ color: colors.skin, roughness: 0.4 });
            const nose = new THREE.Mesh(noseGeom, noseMat);
            nose.position.set(0, head.position.y - 0.08, 0.48);
            nose.scale.set(1.1, 0.85, 1.0);
            group.add(nose);
        }
        
        // === ひげ ===
        if (charData.mustache) {
            this.addMarioMustache(group, charData, head.position.y);
        }
        
        // === 帽子 ===
        if (charData.hat === 'cap') {
            this.addMarioCap(group, charData, head.position.y);
        } else if (charData.hat === 'crown') {
            this.addPeachCrown(group, charData, head.position.y);
        } else if (charData.hat === 'mushroom') {
            this.addToadMushroomCap(group, charData, head.position.y);
        }
        
        // === 胴体 ===
        const bodyWidth = isFat ? 0.5 : 0.38;
        const bodyHeight = isTaller ? 0.9 : 0.75;
        
        // オーバーオール/ドレス
        if (charData.overalls) {
            // シャツ部分（上）
            const shirtGeom = new THREE.CylinderGeometry(bodyWidth * 0.9, bodyWidth, bodyHeight * 0.4, 12);
            const shirtMat = new THREE.MeshStandardMaterial({ 
                color: colors.primary,
                roughness: 0.5 
            });
            const shirt = new THREE.Mesh(shirtGeom, shirtMat);
            shirt.position.y = 0.7;
            group.add(shirt);
            
            // オーバーオール部分（下）
            const overallGeom = new THREE.CylinderGeometry(bodyWidth, bodyWidth * 1.05, bodyHeight * 0.6, 12);
            const overallMat = new THREE.MeshStandardMaterial({ 
                color: colors.secondary,
                roughness: 0.4 
            });
            const overall = new THREE.Mesh(overallGeom, overallMat);
            overall.position.y = 0.35;
            group.add(overall);
            
            // オーバーオールのストラップ
            const strapMat = new THREE.MeshStandardMaterial({ color: colors.secondary, roughness: 0.4 });
            [-0.15, 0.15].forEach(x => {
                const strapGeom = new THREE.BoxGeometry(0.08, 0.3, 0.06);
                const strap = new THREE.Mesh(strapGeom, strapMat);
                strap.position.set(x, 0.75, 0.32);
                group.add(strap);
            });
            
            // 金ボタン
            const buttonGeom = new THREE.CircleGeometry(0.05, 12);
            const buttonMat = new THREE.MeshStandardMaterial({ 
                color: 0xffd700, 
                metalness: 0.7,
                roughness: 0.2
            });
            [-0.15, 0.15].forEach(x => {
                const button = new THREE.Mesh(buttonGeom, buttonMat);
                button.position.set(x, 0.62, 0.39);
                group.add(button);
            });
        } else if (charData.dress) {
            // ピーチのドレス
            this.addPeachDress(group, colors);
        } else {
            // キノピオのベスト
            this.addToadBody(group, colors);
        }
        
        // === 腕 ===
        this.addCartoonArms(group, charData);
        
        // スケール調整
        const scale = isTaller ? 0.75 : 0.8;
        group.scale.set(scale, scale, scale);
        
        return group;
    }
    
    // Build Yoshi model - 任天堂風ヨッシー
    buildYoshiModel(group, charData) {
        const colors = charData.colors;
        
        // === 頭部（特徴的な丸い形） ===
        const headGeom = new THREE.SphereGeometry(0.5, 20, 20);
        const headMat = new THREE.MeshStandardMaterial({ 
            color: colors.primary,
            roughness: 0.4
        });
        const head = new THREE.Mesh(headGeom, headMat);
        head.position.y = 1.35;
        group.add(head);
        
        // === 鼻/口吻（長い鼻） ===
        const snoutGeom = new THREE.SphereGeometry(0.35, 16, 16);
        const snout = new THREE.Mesh(snoutGeom, headMat);
        snout.position.set(0, 1.2, 0.55);
        snout.scale.set(0.9, 0.7, 1.2);
        group.add(snout);
        
        // 鼻の穴（2つの赤い点）
        const nostrilGeom = new THREE.SphereGeometry(0.06, 8, 8);
        const nostrilMat = new THREE.MeshStandardMaterial({ color: colors.secondary });
        [-0.12, 0.12].forEach(x => {
            const nostril = new THREE.Mesh(nostrilGeom, nostrilMat);
            nostril.position.set(x, 1.25, 0.9);
            group.add(nostril);
        });
        
        // === 大きな目（ヨッシー特有） ===
        const eyeWhiteGeom = new THREE.SphereGeometry(0.22, 16, 16);
        const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const pupilGeom = new THREE.SphereGeometry(0.1, 12, 12);
        const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        
        [-0.22, 0.22].forEach(x => {
            // 目の白い部分（上に突き出る）
            const eyeWhite = new THREE.Mesh(eyeWhiteGeom, eyeWhiteMat);
            eyeWhite.position.set(x, 1.6, 0.25);
            eyeWhite.scale.set(0.9, 1.1, 0.8);
            group.add(eyeWhite);
            
            // 黒目
            const pupil = new THREE.Mesh(pupilGeom, pupilMat);
            pupil.position.set(x, 1.58, 0.42);
            group.add(pupil);
            
            // 目のハイライト
            const highlightGeom = new THREE.SphereGeometry(0.04, 6, 6);
            const highlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const highlight = new THREE.Mesh(highlightGeom, highlightMat);
            highlight.position.set(x + 0.03, 1.62, 0.44);
            group.add(highlight);
        });
        
        // === トサカ（背中のヒレ） ===
        const crestMat = new THREE.MeshStandardMaterial({ color: colors.secondary, roughness: 0.3 });
        for (let i = 0; i < 3; i++) {
            const crestGeom = new THREE.ConeGeometry(0.1, 0.25, 8);
            const crest = new THREE.Mesh(crestGeom, crestMat);
            crest.position.set(0, 1.5 - i * 0.18, -0.35 - i * 0.08);
            crest.rotation.x = -0.4;
            group.add(crest);
        }
        
        // === ほっぺた（白い部分） ===
        const cheekGeom = new THREE.SphereGeometry(0.18, 12, 12);
        const cheekMat = new THREE.MeshStandardMaterial({ color: 0xffdddd, roughness: 0.6 });
        [-0.35, 0.35].forEach(x => {
            const cheek = new THREE.Mesh(cheekGeom, cheekMat);
            cheek.position.set(x, 1.25, 0.35);
            cheek.scale.set(0.8, 0.6, 0.5);
            group.add(cheek);
        });
        
        // === 胴体 ===
        const bodyGeom = new THREE.SphereGeometry(0.55, 20, 20);
        const body = new THREE.Mesh(bodyGeom, headMat);
        body.position.y = 0.55;
        body.scale.set(0.85, 1, 0.75);
        group.add(body);
        
        // 白いお腹
        const bellyGeom = new THREE.SphereGeometry(0.45, 16, 16);
        const bellyMat = new THREE.MeshStandardMaterial({ color: colors.skin, roughness: 0.5 });
        const belly = new THREE.Mesh(bellyGeom, bellyMat);
        belly.position.set(0, 0.5, 0.2);
        belly.scale.set(0.7, 0.9, 0.5);
        group.add(belly);
        
        // === 赤いサドル ===
        const saddleGeom = new THREE.CylinderGeometry(0.38, 0.42, 0.12, 16);
        const saddleMat = new THREE.MeshStandardMaterial({ 
            color: charData.saddle,
            roughness: 0.3
        });
        const saddle = new THREE.Mesh(saddleGeom, saddleMat);
        saddle.position.set(0, 0.9, -0.05);
        group.add(saddle);
        
        // === 腕 ===
        const armMat = new THREE.MeshStandardMaterial({ color: colors.primary, roughness: 0.4 });
        [-1, 1].forEach(side => {
            const armGeom = new THREE.SphereGeometry(0.15, 12, 12);
            const arm = new THREE.Mesh(armGeom, armMat);
            arm.position.set(side * 0.5, 0.55, 0.25);
            arm.scale.set(0.8, 1.2, 0.8);
            group.add(arm);
        });
        
        // === 靴（オレンジ色のブーツ） ===
        const shoeMat = new THREE.MeshStandardMaterial({ color: colors.shoes, roughness: 0.4 });
        const shoeGeom = new THREE.SphereGeometry(0.18, 12, 12);
        [-0.2, 0.2].forEach(x => {
            const shoe = new THREE.Mesh(shoeGeom, shoeMat);
            shoe.position.set(x, 0.05, 0.1);
            shoe.scale.set(1, 0.6, 1.4);
            group.add(shoe);
        });
        
        group.scale.set(0.72, 0.72, 0.72);
        
        return group;
    }
    
    // Build Bowser model - 任天堂風クッパ
    buildBowserModel(group, charData) {
        const colors = charData.colors;
        
        // === 頭部 ===
        const headGeom = new THREE.SphereGeometry(0.6, 20, 20);
        const headMat = new THREE.MeshStandardMaterial({ 
            color: colors.primary,
            roughness: 0.6
        });
        const head = new THREE.Mesh(headGeom, headMat);
        head.position.y = 1.5;
        head.scale.set(1.1, 0.95, 1);
        group.add(head);
        
        // === 口吻（黄土色の口周り） ===
        const muzzleGeom = new THREE.SphereGeometry(0.4, 16, 16);
        const muzzleMat = new THREE.MeshStandardMaterial({ color: 0xf5deb3, roughness: 0.5 });
        const muzzle = new THREE.Mesh(muzzleGeom, muzzleMat);
        muzzle.position.set(0, 1.3, 0.45);
        muzzle.scale.set(1.1, 0.75, 0.85);
        group.add(muzzle);
        
        // 鼻
        const noseGeom = new THREE.SphereGeometry(0.12, 8, 8);
        const noseMat = new THREE.MeshStandardMaterial({ color: 0x2d1f00 });
        const nose = new THREE.Mesh(noseGeom, noseMat);
        nose.position.set(0, 1.4, 0.7);
        nose.scale.set(1.3, 0.8, 0.8);
        group.add(nose);
        
        // 鼻の穴
        [-0.08, 0.08].forEach(x => {
            const nostrilGeom = new THREE.CircleGeometry(0.04, 8);
            const nostrilMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
            const nostril = new THREE.Mesh(nostrilGeom, nostrilMat);
            nostril.position.set(x, 1.38, 0.78);
            group.add(nostril);
        });
        
        // === 怒った目 ===
        const eyeGeom = new THREE.SphereGeometry(0.15, 12, 12);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const pupilGeom = new THREE.SphereGeometry(0.07, 8, 8);
        const pupilMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        
        [-0.25, 0.25].forEach((x, i) => {
            // 黄色い目
            const eye = new THREE.Mesh(eyeGeom, eyeMat);
            eye.position.set(x, 1.6, 0.48);
            group.add(eye);
            
            // 赤い瞳孔
            const pupil = new THREE.Mesh(pupilGeom, pupilMat);
            pupil.position.set(x, 1.58, 0.6);
            group.add(pupil);
            
            // 怒り眉毛
            const browGeom = new THREE.BoxGeometry(0.22, 0.06, 0.08);
            const browMat = new THREE.MeshStandardMaterial({ color: colors.hair });
            const brow = new THREE.Mesh(browGeom, browMat);
            brow.position.set(x, 1.73, 0.48);
            brow.rotation.z = i === 0 ? 0.35 : -0.35;
            group.add(brow);
        });
        
        // === 角（クリーム色） ===
        const hornMat = new THREE.MeshStandardMaterial({ 
            color: charData.horns,
            roughness: 0.3
        });
        [-0.4, 0.4].forEach(x => {
            const hornGeom = new THREE.ConeGeometry(0.12, 0.5, 8);
            const horn = new THREE.Mesh(hornGeom, hornMat);
            horn.position.set(x, 1.9, -0.1);
            horn.rotation.x = -0.3;
            horn.rotation.z = x > 0 ? -0.25 : 0.25;
            group.add(horn);
        });
        
        // === 赤い髪（炎のような） ===
        const hairMat = new THREE.MeshStandardMaterial({ 
            color: colors.hair,
            roughness: 0.4
        });
        for (let i = 0; i < 7; i++) {
            const hairGeom = new THREE.ConeGeometry(0.1, 0.35, 6);
            const hair = new THREE.Mesh(hairGeom, hairMat);
            const angle = ((i - 3) / 6) * 1.8;
            hair.position.set(
                Math.sin(angle) * 0.35,
                1.95,
                Math.cos(angle) * 0.15 - 0.35
            );
            hair.rotation.x = -0.6;
            hair.rotation.z = angle * 0.25;
            group.add(hair);
        }
        
        // === 胴体 ===
        const bodyGeom = new THREE.SphereGeometry(0.65, 20, 20);
        const bodyMat = new THREE.MeshStandardMaterial({ 
            color: colors.primary,
            roughness: 0.6
        });
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.y = 0.6;
        body.scale.set(1.15, 1, 0.9);
        group.add(body);
        
        // お腹（クリーム色）
        const bellyGeom = new THREE.SphereGeometry(0.5, 16, 16);
        const bellyMat = new THREE.MeshStandardMaterial({ color: colors.skin, roughness: 0.5 });
        const belly = new THREE.Mesh(bellyGeom, bellyMat);
        belly.position.set(0, 0.5, 0.35);
        belly.scale.set(0.85, 0.9, 0.55);
        group.add(belly);
        
        // お腹のライン（横縞）
        for (let i = 0; i < 4; i++) {
            const lineGeom = new THREE.TorusGeometry(0.35 - i * 0.05, 0.02, 8, 24, Math.PI);
            const lineMat = new THREE.MeshStandardMaterial({ color: 0xccaa77 });
            const line = new THREE.Mesh(lineGeom, lineMat);
            line.position.set(0, 0.65 - i * 0.12, 0.38);
            line.rotation.x = Math.PI / 2;
            line.rotation.z = Math.PI;
            group.add(line);
        }
        
        // === 甲羅（緑） ===
        const shellGeom = new THREE.SphereGeometry(0.6, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const shellMat = new THREE.MeshStandardMaterial({ 
            color: colors.secondary,
            roughness: 0.4
        });
        const shell = new THREE.Mesh(shellGeom, shellMat);
        shell.rotation.x = Math.PI;
        shell.position.set(0, 0.85, -0.15);
        group.add(shell);
        
        // 甲羅の縁
        const shellRimGeom = new THREE.TorusGeometry(0.55, 0.08, 8, 24);
        const shellRimMat = new THREE.MeshStandardMaterial({ color: 0xfffdd0 });
        const shellRim = new THREE.Mesh(shellRimGeom, shellRimMat);
        shellRim.position.set(0, 0.55, -0.15);
        shellRim.rotation.x = Math.PI / 2;
        group.add(shellRim);
        
        // 甲羅のトゲ
        const spikeMat = new THREE.MeshStandardMaterial({ color: charData.horns, roughness: 0.3 });
        for (let ring = 0; ring < 2; ring++) {
            const numSpikes = ring === 0 ? 5 : 4;
            for (let i = 0; i < numSpikes; i++) {
                const spikeGeom = new THREE.ConeGeometry(0.1, 0.28, 8);
                const spike = new THREE.Mesh(spikeGeom, spikeMat);
                const angle = (i / numSpikes) * Math.PI * 0.8 - Math.PI * 0.4;
                const radius = 0.4 - ring * 0.12;
                spike.position.set(
                    Math.sin(angle) * radius,
                    0.9 - ring * 0.18,
                    Math.cos(angle) * radius * 0.5 - 0.25
                );
                spike.rotation.x = Math.PI / 2 + Math.cos(angle) * 0.4;
                spike.rotation.z = Math.sin(angle) * 0.4;
                group.add(spike);
            }
        }
        
        // === 腕 ===
        const armMat = new THREE.MeshStandardMaterial({ color: colors.primary, roughness: 0.6 });
        [-1, 1].forEach(side => {
            // 上腕
            const armGeom = new THREE.CylinderGeometry(0.18, 0.15, 0.5, 12);
            const arm = new THREE.Mesh(armGeom, armMat);
            arm.position.set(side * 0.65, 0.65, 0.15);
            arm.rotation.z = side * 0.5;
            arm.rotation.x = -0.3;
            group.add(arm);
            
            // 手（爪付き）
            const handGeom = new THREE.SphereGeometry(0.14, 10, 10);
            const hand = new THREE.Mesh(handGeom, armMat);
            hand.position.set(side * 0.85, 0.4, 0.25);
            group.add(hand);
            
            // 爪
            for (let c = 0; c < 3; c++) {
                const clawGeom = new THREE.ConeGeometry(0.03, 0.12, 6);
                const clawMat = new THREE.MeshStandardMaterial({ color: 0xffffee });
                const claw = new THREE.Mesh(clawGeom, clawMat);
                claw.position.set(
                    side * 0.9 + side * c * 0.05,
                    0.35,
                    0.32 + c * 0.03
                );
                claw.rotation.x = Math.PI / 2;
                group.add(claw);
            }
        });
        
        group.scale.set(0.58, 0.58, 0.58);
        
        return group;
    }
    
    // Build Donkey Kong model - 任天堂風ドンキーコング
    buildApeModel(group, charData) {
        const colors = charData.colors;
        
        // === 頭部（大きめ） ===
        const headGeom = new THREE.SphereGeometry(0.6, 20, 20);
        const headMat = new THREE.MeshStandardMaterial({ 
            color: colors.primary,
            roughness: 0.85
        });
        const head = new THREE.Mesh(headGeom, headMat);
        head.position.y = 1.4;
        head.scale.set(1.05, 0.95, 0.95);
        group.add(head);
        
        // === 顔（ベージュ色のマズル） ===
        const faceGeom = new THREE.SphereGeometry(0.45, 16, 16);
        const faceMat = new THREE.MeshStandardMaterial({ 
            color: colors.secondary,
            roughness: 0.7
        });
        const face = new THREE.Mesh(faceGeom, faceMat);
        face.position.set(0, 1.25, 0.32);
        face.scale.set(0.95, 0.85, 0.65);
        group.add(face);
        
        // 鼻（大きな黒い鼻）
        const noseGeom = new THREE.SphereGeometry(0.15, 12, 12);
        const noseMat = new THREE.MeshStandardMaterial({ color: 0x2d1f00, roughness: 0.3 });
        const nose = new THREE.Mesh(noseGeom, noseMat);
        nose.position.set(0, 1.22, 0.55);
        nose.scale.set(1.3, 0.9, 0.8);
        group.add(nose);
        
        // 鼻の穴
        [-0.08, 0.08].forEach(x => {
            const nostrilGeom = new THREE.CircleGeometry(0.04, 8);
            const nostrilMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
            const nostril = new THREE.Mesh(nostrilGeom, nostrilMat);
            nostril.position.set(x, 1.18, 0.62);
            group.add(nostril);
        });
        
        // === 目 ===
        const eyeWhiteGeom = new THREE.SphereGeometry(0.12, 10, 10);
        const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const pupilGeom = new THREE.SphereGeometry(0.06, 8, 8);
        const pupilMat = new THREE.MeshBasicMaterial({ color: 0x331100 });
        
        [-0.18, 0.18].forEach(x => {
            const eyeWhite = new THREE.Mesh(eyeWhiteGeom, eyeWhiteMat);
            eyeWhite.position.set(x, 1.45, 0.48);
            group.add(eyeWhite);
            
            const pupil = new THREE.Mesh(pupilGeom, pupilMat);
            pupil.position.set(x, 1.43, 0.58);
            group.add(pupil);
        });
        
        // 眉毛（太い）
        const browMat = new THREE.MeshStandardMaterial({ color: colors.primary });
        [-0.18, 0.18].forEach(x => {
            const browGeom = new THREE.BoxGeometry(0.18, 0.06, 0.1);
            const brow = new THREE.Mesh(browGeom, browMat);
            brow.position.set(x, 1.58, 0.45);
            group.add(brow);
        });
        
        // === 口 ===
        const mouthGeom = new THREE.TorusGeometry(0.12, 0.03, 8, 16, Math.PI);
        const mouthMat = new THREE.MeshStandardMaterial({ color: 0x442211 });
        const mouth = new THREE.Mesh(mouthGeom, mouthMat);
        mouth.position.set(0, 1.08, 0.52);
        mouth.rotation.x = Math.PI * 0.6;
        group.add(mouth);
        
        // === 大きな耳 ===
        const earGeom = new THREE.SphereGeometry(0.15, 10, 10);
        const earInnerMat = new THREE.MeshStandardMaterial({ color: colors.secondary });
        [-1, 1].forEach(side => {
            // 耳の外側
            const ear = new THREE.Mesh(earGeom, headMat);
            ear.position.set(side * 0.6, 1.45, 0);
            ear.scale.set(0.5, 1, 0.6);
            group.add(ear);
            
            // 耳の内側
            const earInner = new THREE.Mesh(earGeom, earInnerMat);
            earInner.position.set(side * 0.58, 1.45, 0.02);
            earInner.scale.set(0.3, 0.7, 0.4);
            group.add(earInner);
        });
        
        // === 頭頂部の毛 ===
        const hairTuft = new THREE.SphereGeometry(0.25, 12, 12);
        const hairMat = new THREE.MeshStandardMaterial({ color: colors.primary, roughness: 0.9 });
        const tuft = new THREE.Mesh(hairTuft, hairMat);
        tuft.position.set(0, 1.85, -0.1);
        tuft.scale.set(1, 0.6, 1);
        group.add(tuft);
        
        // === 胴体（がっしりした） ===
        const chestGeom = new THREE.SphereGeometry(0.6, 20, 20);
        const chest = new THREE.Mesh(chestGeom, headMat);
        chest.position.y = 0.6;
        chest.scale.set(1.2, 1, 0.85);
        group.add(chest);
        
        // 胸の毛（茶色のパッチ）
        const chestFurGeom = new THREE.SphereGeometry(0.45, 16, 16);
        const chestFur = new THREE.Mesh(chestFurGeom, faceMat);
        chestFur.position.set(0, 0.55, 0.35);
        chestFur.scale.set(0.8, 0.85, 0.5);
        group.add(chestFur);
        
        // === 赤いネクタイ（DKロゴ付き） ===
        // ネクタイ上部
        const tieTopGeom = new THREE.BoxGeometry(0.18, 0.12, 0.06);
        const tieMat = new THREE.MeshStandardMaterial({ 
            color: charData.tie,
            roughness: 0.4
        });
        const tieTop = new THREE.Mesh(tieTopGeom, tieMat);
        tieTop.position.set(0, 0.9, 0.55);
        group.add(tieTop);
        
        // ネクタイ本体
        const tieBodyGeom = new THREE.BoxGeometry(0.22, 0.4, 0.06);
        const tieBody = new THREE.Mesh(tieBodyGeom, tieMat);
        tieBody.position.set(0, 0.58, 0.58);
        group.add(tieBody);
        
        // DKロゴ（黄色）
        const logoMat = new THREE.MeshBasicMaterial({ color: 0xffdd00 });
        // D
        const dGeom = new THREE.CircleGeometry(0.06, 12, Math.PI / 2, Math.PI);
        const d = new THREE.Mesh(dGeom, logoMat);
        d.position.set(-0.04, 0.6, 0.62);
        group.add(d);
        // K
        const kGeom = new THREE.PlaneGeometry(0.08, 0.15);
        const k = new THREE.Mesh(kGeom, logoMat);
        k.position.set(0.04, 0.6, 0.62);
        group.add(k);
        
        // === 腕（太くて筋肉質） ===
        [-1, 1].forEach(side => {
            // 上腕
            const upperArmGeom = new THREE.CylinderGeometry(0.18, 0.15, 0.55, 12);
            const arm = new THREE.Mesh(upperArmGeom, headMat);
            arm.position.set(side * 0.7, 0.6, 0.1);
            arm.rotation.z = side * 0.55;
            arm.rotation.x = -0.3;
            group.add(arm);
            
            // 手
            const handGeom = new THREE.SphereGeometry(0.15, 10, 10);
            const hand = new THREE.Mesh(handGeom, headMat);
            hand.position.set(side * 0.95, 0.28, 0.22);
            group.add(hand);
        });
        
        group.scale.set(0.55, 0.55, 0.55);
        
        return group;
    }
    
    // Helper methods for character parts
    
    // === カートゥーン風の目 ===
    addCartoonEyes(group, eyeY, eyeZ, isEvil = false) {
        const eyeWhiteGeom = new THREE.SphereGeometry(0.12, 12, 12);
        const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const pupilGeom = new THREE.SphereGeometry(0.055, 8, 8);
        const pupilMat = new THREE.MeshBasicMaterial({ color: isEvil ? 0x333333 : 0x1a1a1a });
        
        [-0.16, 0.16].forEach(x => {
            // 白目
            const eyeWhite = new THREE.Mesh(eyeWhiteGeom, eyeWhiteMat);
            eyeWhite.position.set(x, eyeY, eyeZ);
            eyeWhite.scale.set(1, 1.1, 0.9);
            group.add(eyeWhite);
            
            // 黒目
            const pupil = new THREE.Mesh(pupilGeom, pupilMat);
            pupil.position.set(x, eyeY - 0.02, eyeZ + 0.1);
            group.add(pupil);
            
            // ハイライト
            const highlightGeom = new THREE.SphereGeometry(0.025, 6, 6);
            const highlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const highlight = new THREE.Mesh(highlightGeom, highlightMat);
            highlight.position.set(x + 0.025, eyeY + 0.02, eyeZ + 0.12);
            group.add(highlight);
        });
    }
    
    // === マリオ/ルイージ/ワリオのひげ ===
    addMarioMustache(group, charData, headY) {
        const mustacheColor = charData.colors.hair || 0x3a2000;
        const mustacheMat = new THREE.MeshStandardMaterial({ color: mustacheColor, roughness: 0.6 });
        
        if (charData.mustacheStyle === 'zigzag') {
            // ワリオのジグザグひげ
            const points = [];
            for (let i = 0; i <= 12; i++) {
                const t = i / 12;
                const x = (t - 0.5) * 0.7;
                const y = Math.sin(t * Math.PI * 4) * 0.06;
                points.push(new THREE.Vector2(x, y - 0.02));
            }
            points.push(new THREE.Vector2(0.35, -0.1));
            points.push(new THREE.Vector2(-0.35, -0.1));
            
            const shape = new THREE.Shape(points);
            const extrudeSettings = { depth: 0.06, bevelEnabled: false };
            const mustacheGeom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
            const mustache = new THREE.Mesh(mustacheGeom, mustacheMat);
            mustache.position.set(0, headY - 0.2, 0.4);
            group.add(mustache);
        } else {
            // マリオ/ルイージの丸いひげ
            [-1, 1].forEach(side => {
                const mustacheGeom = new THREE.SphereGeometry(0.12, 10, 10);
                const mustache = new THREE.Mesh(mustacheGeom, mustacheMat);
                mustache.position.set(side * 0.15, headY - 0.18, 0.4);
                mustache.scale.set(1.3, 0.6, 0.8);
                group.add(mustache);
            });
        }
    }
    
    // === マリオキャップ ===
    addMarioCap(group, charData, headY) {
        const capMat = new THREE.MeshStandardMaterial({ 
            color: charData.hatColor,
            roughness: 0.35
        });
        
        // 帽子のドーム
        const capGeom = new THREE.SphereGeometry(0.54, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const cap = new THREE.Mesh(capGeom, capMat);
        cap.position.y = headY + 0.22;
        group.add(cap);
        
        // つば
        const brimGeom = new THREE.CylinderGeometry(0.32, 0.38, 0.08, 20, 1, false, -Math.PI/2, Math.PI);
        const brim = new THREE.Mesh(brimGeom, capMat);
        brim.rotation.z = Math.PI / 2;
        brim.rotation.y = Math.PI / 2;
        brim.position.set(0, headY + 0.02, 0.48);
        group.add(brim);
        
        // 白い丸（エンブレム背景）
        const emblemBgGeom = new THREE.CircleGeometry(0.2, 20);
        const emblemBgMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const emblemBg = new THREE.Mesh(emblemBgGeom, emblemBgMat);
        emblemBg.position.set(0, headY + 0.38, 0.38);
        emblemBg.rotation.x = -0.35;
        group.add(emblemBg);
        
        // 文字（M/L/W）
        if (charData.hatLetter) {
            const letterMat = new THREE.MeshBasicMaterial({ color: charData.hatColor });
            const letterGeom = this.createLetterGeometry(charData.hatLetter);
            if (letterGeom) {
                const letter = new THREE.Mesh(letterGeom, letterMat);
                letter.position.set(0, headY + 0.38, 0.4);
                letter.rotation.x = -0.35;
                letter.scale.set(0.12, 0.12, 0.08);
                group.add(letter);
            }
        }
    }
    
    // === ピーチの王冠 ===
    addPeachCrown(group, charData, headY) {
        const crownMat = new THREE.MeshStandardMaterial({ 
            color: charData.hatColor,
            metalness: 0.85,
            roughness: 0.15
        });
        
        // 王冠のベース
        const baseGeom = new THREE.CylinderGeometry(0.28, 0.32, 0.12, 20);
        const base = new THREE.Mesh(baseGeom, crownMat);
        base.position.y = headY + 0.35;
        group.add(base);
        
        // 王冠の先端（5つ）
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const pointGeom = new THREE.ConeGeometry(0.08, 0.22, 6);
            const point = new THREE.Mesh(pointGeom, crownMat);
            point.position.set(
                Math.sin(angle) * 0.22,
                headY + 0.52,
                Math.cos(angle) * 0.22
            );
            group.add(point);
            
            // 宝石
            if (i % 2 === 0) {
                const jewelGeom = new THREE.SphereGeometry(0.045, 8, 8);
                const jewelColors = [0xff0066, 0x0066ff, 0x00ff66];
                const jewelMat = new THREE.MeshStandardMaterial({ 
                    color: jewelColors[i / 2],
                    metalness: 0.3,
                    roughness: 0.1
                });
                const jewel = new THREE.Mesh(jewelGeom, jewelMat);
                jewel.position.set(
                    Math.sin(angle) * 0.3,
                    headY + 0.38,
                    Math.cos(angle) * 0.3
                );
                group.add(jewel);
            }
        }
        
        // 青い中央宝石
        const mainJewelGeom = new THREE.OctahedronGeometry(0.06, 0);
        const mainJewelMat = new THREE.MeshStandardMaterial({ 
            color: charData.earrings || 0x00aaff,
            metalness: 0.4,
            roughness: 0.1
        });
        const mainJewel = new THREE.Mesh(mainJewelGeom, mainJewelMat);
        mainJewel.position.set(0, headY + 0.38, 0.32);
        mainJewel.rotation.y = Math.PI / 4;
        group.add(mainJewel);
        
        // 金髪
        const hairMat = new THREE.MeshStandardMaterial({ 
            color: charData.colors.hair,
            roughness: 0.65
        });
        
        // 前髪
        const frontHairGeom = new THREE.SphereGeometry(0.52, 16, 16, 0, Math.PI, 0, Math.PI/3);
        const frontHair = new THREE.Mesh(frontHairGeom, hairMat);
        frontHair.position.set(0, headY + 0.05, 0.1);
        group.add(frontHair);
        
        // 後ろ髪（長い）
        const backHairGeom = new THREE.SphereGeometry(0.55, 16, 16);
        const backHair = new THREE.Mesh(backHairGeom, hairMat);
        backHair.position.set(0, headY - 0.15, -0.15);
        backHair.scale.set(1, 1.4, 0.85);
        group.add(backHair);
        
        // 耳のイヤリング
        if (charData.earrings) {
            const earringGeom = new THREE.SphereGeometry(0.06, 8, 8);
            const earringMat = new THREE.MeshStandardMaterial({ 
                color: charData.earrings,
                metalness: 0.3,
                roughness: 0.1
            });
            [-0.48, 0.48].forEach(x => {
                const earring = new THREE.Mesh(earringGeom, earringMat);
                earring.position.set(x, headY - 0.15, 0.05);
                group.add(earring);
            });
        }
    }
    
    // === キノピオのキノコ帽 ===
    addToadMushroomCap(group, charData, headY) {
        const capMat = new THREE.MeshStandardMaterial({ 
            color: charData.hatColor,
            roughness: 0.35
        });
        
        // キノコの傘（大きなドーム）
        const capGeom = new THREE.SphereGeometry(0.7, 24, 18, 0, Math.PI * 2, 0, Math.PI / 2);
        const cap = new THREE.Mesh(capGeom, capMat);
        cap.position.y = headY + 0.15;
        cap.scale.set(1.1, 0.75, 1.1);
        group.add(cap);
        
        // 赤い水玉模様
        const spotMat = new THREE.MeshStandardMaterial({ 
            color: charData.spotColor,
            roughness: 0.3
        });
        
        const spotPositions = [
            { x: 0, y: 0.45, z: 0.5, size: 0.18 },
            { x: 0.4, y: 0.35, z: 0.35, size: 0.15 },
            { x: -0.4, y: 0.35, z: 0.35, size: 0.15 },
            { x: 0.25, y: 0.5, z: -0.35, size: 0.14 },
            { x: -0.25, y: 0.5, z: -0.35, size: 0.14 },
            { x: 0.5, y: 0.28, z: -0.1, size: 0.12 },
            { x: -0.5, y: 0.28, z: -0.1, size: 0.12 }
        ];
        
        spotPositions.forEach(pos => {
            const spotGeom = new THREE.SphereGeometry(pos.size, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
            const spot = new THREE.Mesh(spotGeom, spotMat);
            spot.position.set(pos.x, headY + pos.y, pos.z);
            // 傘の表面に沿わせる
            const dir = new THREE.Vector3(pos.x, pos.y - 0.2, pos.z).normalize();
            spot.lookAt(spot.position.clone().add(dir));
            group.add(spot);
        });
    }
    
    // === ピーチのドレス ===
    addPeachDress(group, colors) {
        // 上半身（ピンク）
        const topGeom = new THREE.CylinderGeometry(0.32, 0.35, 0.45, 16);
        const dressMat = new THREE.MeshStandardMaterial({ 
            color: colors.primary,
            roughness: 0.4
        });
        const top = new THREE.Mesh(topGeom, dressMat);
        top.position.y = 0.72;
        group.add(top);
        
        // スカート部分（広がる）
        const skirtGeom = new THREE.CylinderGeometry(0.35, 0.55, 0.5, 20);
        const skirt = new THREE.Mesh(skirtGeom, dressMat);
        skirt.position.y = 0.32;
        group.add(skirt);
        
        // ドレスの縁（ゴールド）
        const trimMat = new THREE.MeshStandardMaterial({ 
            color: colors.secondary,
            metalness: 0.6,
            roughness: 0.2
        });
        
        // 首元の装飾
        const collarGeom = new THREE.TorusGeometry(0.28, 0.035, 8, 20);
        const collar = new THREE.Mesh(collarGeom, trimMat);
        collar.position.y = 0.92;
        collar.rotation.x = Math.PI / 2;
        group.add(collar);
        
        // 胸元のブローチ
        const broochGeom = new THREE.OctahedronGeometry(0.06, 0);
        const broochMat = new THREE.MeshStandardMaterial({ 
            color: 0x00aaff,
            metalness: 0.4,
            roughness: 0.1
        });
        const brooch = new THREE.Mesh(broochGeom, broochMat);
        brooch.position.set(0, 0.85, 0.34);
        brooch.rotation.y = Math.PI / 4;
        group.add(brooch);
    }
    
    // === キノピオのベスト ===
    addToadBody(group, colors) {
        // 白い体
        const bodyGeom = new THREE.CylinderGeometry(0.3, 0.35, 0.6, 14);
        const bodyMat = new THREE.MeshStandardMaterial({ 
            color: 0xffeedd,
            roughness: 0.5
        });
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.y = 0.45;
        group.add(body);
        
        // 青いベスト
        const vestMat = new THREE.MeshStandardMaterial({ 
            color: colors.vest || 0x0066cc,
            roughness: 0.4
        });
        
        // ベストの左右
        [-1, 1].forEach(side => {
            const vestGeom = new THREE.BoxGeometry(0.18, 0.45, 0.12);
            const vest = new THREE.Mesh(vestGeom, vestMat);
            vest.position.set(side * 0.15, 0.5, 0.22);
            group.add(vest);
        });
        
        // 金ボタン
        const buttonGeom = new THREE.SphereGeometry(0.035, 8, 8);
        const buttonMat = new THREE.MeshStandardMaterial({ 
            color: 0xffd700,
            metalness: 0.7,
            roughness: 0.2
        });
        [0.6, 0.45, 0.3].forEach(y => {
            const button = new THREE.Mesh(buttonGeom, buttonMat);
            button.position.set(0, y, 0.35);
            group.add(button);
        });
    }
    
    // === カートゥーン風の腕 ===
    addCartoonArms(group, charData) {
        const colors = charData.colors;
        const gloveColor = charData.gloves || colors.skin;
        
        const armMat = new THREE.MeshStandardMaterial({ 
            color: colors.primary,
            roughness: 0.5
        });
        const gloveMat = new THREE.MeshStandardMaterial({ 
            color: gloveColor,
            roughness: 0.35
        });
        
        [-1, 1].forEach(side => {
            // 腕
            const armGeom = new THREE.CylinderGeometry(0.1, 0.09, 0.35, 10);
            const arm = new THREE.Mesh(armGeom, armMat);
            arm.position.set(side * 0.48, 0.58, 0.12);
            arm.rotation.z = side * 0.55;
            arm.rotation.x = -0.25;
            group.add(arm);
            
            // 手袋/手
            const handGeom = new THREE.SphereGeometry(0.12, 10, 10);
            const hand = new THREE.Mesh(handGeom, gloveMat);
            hand.position.set(side * 0.62, 0.38, 0.22);
            group.add(hand);
        });
    }
    
    createLetterGeometry(letter) {
        const shape = new THREE.Shape();
        
        if (letter === 'M') {
            shape.moveTo(-1, -1);
            shape.lineTo(-1, 1);
            shape.lineTo(-0.3, 0);
            shape.lineTo(0.3, 1);
            shape.lineTo(0.3, 0);
            shape.lineTo(1, 1);
            shape.lineTo(1, -1);
            shape.lineTo(0.6, -1);
            shape.lineTo(0.6, 0.3);
            shape.lineTo(0, -0.5);
            shape.lineTo(-0.6, 0.3);
            shape.lineTo(-0.6, -1);
            shape.closePath();
        } else if (letter === 'L') {
            shape.moveTo(-0.6, 1);
            shape.lineTo(-0.2, 1);
            shape.lineTo(-0.2, -0.6);
            shape.lineTo(0.6, -0.6);
            shape.lineTo(0.6, -1);
            shape.lineTo(-0.6, -1);
            shape.closePath();
        } else if (letter === 'W') {
            shape.moveTo(-1, 1);
            shape.lineTo(-0.6, 1);
            shape.lineTo(-0.3, -0.3);
            shape.lineTo(0, 0.5);
            shape.lineTo(0.3, -0.3);
            shape.lineTo(0.6, 1);
            shape.lineTo(1, 1);
            shape.lineTo(0.5, -1);
            shape.lineTo(0.15, -1);
            shape.lineTo(0, -0.3);
            shape.lineTo(-0.15, -1);
            shape.lineTo(-0.5, -1);
            shape.closePath();
        }
        
        const extrudeSettings = { depth: 0.3, bevelEnabled: false };
        return new THREE.ExtrudeGeometry(shape, extrudeSettings);
    }
}

// Export for use in other files
window.MarioCharacters = MarioCharacters;
window.CharacterOrder = CharacterOrder;
window.CharacterModelBuilder = CharacterModelBuilder;
