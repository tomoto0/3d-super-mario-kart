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
        
        // 改善された移動ステータス - アーケードスタイル（高速化）
        this.baseMaxSpeed = 140;      // 基本最高速度（Easy = 100%）
        this.maxSpeed = 140;          // 現在の最高速度
        this.baseAcceleration = 90;   // 基本加速力
        this.acceleration = 90;       // 現在の加速力
        this.deceleration = 10;       // 自然減速（さらに緩やか）
        this.brakeStrength = 100;     // ブレーキ強化
        this.turnSpeed = 4.0;         // 旋回速度アップ
        this.friction = 0.992;        // 摩擦（より滑らか）
        this.grassFriction = 0.97;    // 芝でのペナルティ（緩和）
        this.difficultyMultiplier = 1.0;  // 難易度倍率
        
        // アーケード物理プロパティ
        this.grip = 1.0;              // タイヤグリップ
        this.steeringResponse = 0.2;  // ステアリングのレスポンス（速く）
        this.targetRotation = 0;      // 目標方向（スムーズな旋回用）
        this.lateralVelocity = 0;     // 横方向の速度（ドリフト用）
        this.enginePower = 0;         // エンジン出力（スムーズな加速用）
        this.driftGrip = 0.7;         // ドリフト時のグリップ
        this.driftAngle = 0;          // ドリフト角度
        this.verticalVelocity = 0;    // ジャンプ用の垂直速度
        this.isAirborne = false;      // 空中にいるかどうか
        
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
        this.shieldTimer = 0;  // シールドの残り時間
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
        this.raceStartTime = 0;  // レース開始時刻（スタート直後のラップ誤検出防止用）
        
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
    
    createKartMesh() {
        const group = new THREE.Group();
        
        // キャラクターの重量クラスを取得
        const weightClass = this.characterData?.weight || 'medium';
        
        // 重量クラスに応じたカートスタイルを選択
        if (weightClass === 'heavy') {
            this.buildHeavyKart(group);
        } else if (weightClass === 'light') {
            this.buildLightKart(group);
        } else {
            this.buildStandardKart(group);
        }
        
        // キャラクターを追加
        this.addCharacterToKart(group);
        
        // シールドエフェクト
        this.addShieldEffect(group);
        
        return group;
    }
    
    // === 標準カート（マリオカート風スタンダードカート） ===
    buildStandardKart(group) {
        const primaryColor = this.colorData.primary;
        const secondaryColor = this.colorData.secondary;
        
        // メインマテリアル（光沢のあるプラスチック/メタル風）
        const bodyMat = new THREE.MeshStandardMaterial({
            color: primaryColor,
            metalness: 0.4,
            roughness: 0.35
        });
        
        const accentMat = new THREE.MeshStandardMaterial({
            color: secondaryColor,
            metalness: 0.5,
            roughness: 0.3
        });
        
        const chromeMat = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            metalness: 0.95,
            roughness: 0.05
        });
        
        const darkMat = new THREE.MeshStandardMaterial({
            color: 0x222222,
            metalness: 0.3,
            roughness: 0.6
        });
        
        // === メインボディ（丸みを帯びた任天堂風） ===
        // ボディベース（丸い楕円形）
        const bodyGeom = new THREE.SphereGeometry(1.5, 24, 16);
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.scale.set(1.1, 0.45, 1.6);
        body.position.set(0, 0.55, 0);
        body.castShadow = true;
        group.add(body);
        
        // フロントノーズ（突き出たノーズ部分）
        const noseGeom = new THREE.SphereGeometry(0.8, 16, 12);
        const nose = new THREE.Mesh(noseGeom, bodyMat);
        nose.scale.set(1.2, 0.5, 1.3);
        nose.position.set(0, 0.45, 1.8);
        nose.castShadow = true;
        group.add(nose);
        
        // === コックピット周り ===
        // ダッシュボード
        const dashGeom = new THREE.BoxGeometry(1.8, 0.35, 0.5);
        const dash = new THREE.Mesh(dashGeom, darkMat);
        dash.position.set(0, 0.75, 0.9);
        dash.rotation.x = -0.25;
        group.add(dash);
        
        // ステアリングコラム
        const columnGeom = new THREE.CylinderGeometry(0.06, 0.08, 0.45, 12);
        const column = new THREE.Mesh(columnGeom, chromeMat);
        column.position.set(0, 0.85, 0.7);
        column.rotation.x = Math.PI / 5;
        group.add(column);
        
        // ステアリングホイール（マリオカート風の丸いハンドル）
        const wheelRingGeom = new THREE.TorusGeometry(0.28, 0.045, 12, 24);
        const steeringWheel = new THREE.Mesh(wheelRingGeom, darkMat);
        steeringWheel.position.set(0, 1.0, 0.85);
        steeringWheel.rotation.x = Math.PI / 3;
        group.add(steeringWheel);
        
        // ハンドルのスポーク
        [-1, 0, 1].forEach(angle => {
            const spokeGeom = new THREE.CylinderGeometry(0.025, 0.025, 0.25, 8);
            const spoke = new THREE.Mesh(spokeGeom, chromeMat);
            spoke.position.copy(steeringWheel.position);
            spoke.rotation.x = Math.PI / 3;
            spoke.rotation.z = angle * Math.PI / 3;
            group.add(spoke);
        });
        
        // === シート ===
        const seatGeom = new THREE.SphereGeometry(0.65, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
        const seatMat = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.75
        });
        const seat = new THREE.Mesh(seatGeom, seatMat);
        seat.scale.set(1.1, 0.7, 1.4);
        seat.position.set(0, 0.65, -0.35);
        seat.rotation.x = Math.PI;
        group.add(seat);
        
        // シートバック
        const backGeom = new THREE.SphereGeometry(0.5, 16, 12);
        const seatBack = new THREE.Mesh(backGeom, seatMat);
        seatBack.scale.set(1.2, 1.1, 0.4);
        seatBack.position.set(0, 1.0, -0.85);
        group.add(seatBack);
        
        // === エンジンカバー（後部） ===
        const engineCoverGeom = new THREE.BoxGeometry(1.5, 0.5, 0.9);
        const engineCover = new THREE.Mesh(engineCoverGeom, accentMat);
        engineCover.position.set(0, 0.75, -1.5);
        group.add(engineCover);
        
        // エンジンのベント（スリット）
        for (let i = -2; i <= 2; i++) {
            const ventGeom = new THREE.BoxGeometry(0.08, 0.25, 0.7);
            const vent = new THREE.Mesh(ventGeom, darkMat);
            vent.position.set(i * 0.25, 0.88, -1.5);
            group.add(vent);
        }
        
        // === マフラー（任天堂風の太いパイプ） ===
        const mufflerMat = new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.85,
            roughness: 0.15
        });
        
        [-0.45, 0.45].forEach(x => {
            // メインパイプ
            const pipeGeom = new THREE.CylinderGeometry(0.15, 0.12, 0.7, 16);
            const pipe = new THREE.Mesh(pipeGeom, mufflerMat);
            pipe.rotation.x = Math.PI / 2 + 0.35;
            pipe.position.set(x, 0.55, -2.1);
            group.add(pipe);
            
            // パイプの先端（赤いリング）
            const tipGeom = new THREE.TorusGeometry(0.14, 0.03, 8, 16);
            const tipMat = new THREE.MeshStandardMaterial({ color: 0xff3300, metalness: 0.6 });
            const tip = new THREE.Mesh(tipGeom, tipMat);
            tip.position.set(x, 0.4, -2.4);
            tip.rotation.x = Math.PI / 2.5;
            group.add(tip);
        });
        
        // === フロントバンパー ===
        const bumperGeom = new THREE.CylinderGeometry(0.12, 0.12, 2.4, 16);
        const bumper = new THREE.Mesh(bumperGeom, chromeMat);
        bumper.rotation.z = Math.PI / 2;
        bumper.position.set(0, 0.35, 2.35);
        group.add(bumper);
        
        // バンパー端のキャップ
        [-1, 1].forEach(side => {
            const capGeom = new THREE.SphereGeometry(0.14, 12, 12);
            const cap = new THREE.Mesh(capGeom, chromeMat);
            cap.position.set(side * 1.2, 0.35, 2.35);
            group.add(cap);
        });
        
        // === サイドポンツーン（特徴的なサイドパーツ） ===
        [-1, 1].forEach(side => {
            const pontoonGeom = new THREE.SphereGeometry(0.5, 16, 12);
            const pontoon = new THREE.Mesh(pontoonGeom, accentMat);
            pontoon.scale.set(0.6, 0.5, 1.8);
            pontoon.position.set(side * 1.35, 0.45, 0.2);
            pontoon.castShadow = true;
            group.add(pontoon);
            
            // サイドのストライプ
            const stripeGeom = new THREE.BoxGeometry(0.05, 0.18, 1.4);
            const stripeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
            const stripe = new THREE.Mesh(stripeGeom, stripeMat);
            stripe.position.set(side * 1.52, 0.48, 0.2);
            group.add(stripe);
        });
        
        // === ナンバープレート（キャラクターの絵文字風） ===
        const plateGeom = new THREE.CircleGeometry(0.35, 20);
        const plateMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0,
            roughness: 0.8
        });
        const plate = new THREE.Mesh(plateGeom, plateMat);
        plate.position.set(0, 0.45, 2.5);
        group.add(plate);
        
        // プレートの縁
        const plateRimGeom = new THREE.TorusGeometry(0.36, 0.04, 8, 24);
        const plateRim = new THREE.Mesh(plateRimGeom, new THREE.MeshStandardMaterial({
            color: primaryColor,
            metalness: 0.5
        }));
        plateRim.position.set(0, 0.45, 2.48);
        group.add(plateRim);
        
        // === タイヤとホイール ===
        this.wheels = [];
        this.buildMarioKartWheels(group, 'standard');
    }
    
    // === 軽量カート（ピーチ、キノピオ、ヨッシー向け） ===
    buildLightKart(group) {
        const primaryColor = this.colorData.primary;
        const secondaryColor = this.colorData.secondary;
        
        const bodyMat = new THREE.MeshStandardMaterial({
            color: primaryColor,
            metalness: 0.3,
            roughness: 0.4
        });
        
        const accentMat = new THREE.MeshStandardMaterial({
            color: secondaryColor,
            metalness: 0.4,
            roughness: 0.35
        });
        
        const chromeMat = new THREE.MeshStandardMaterial({
            color: 0xdddddd,
            metalness: 0.9,
            roughness: 0.1
        });
        
        const whiteMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0.1,
            roughness: 0.5
        });
        
        // === スリムでスポーティなボディ ===
        // メインボディ（カプセル形状を球体+円柱で再現）
        const bodyMainGeom = new THREE.CylinderGeometry(0.6, 0.6, 2.2, 24);
        const bodyMain = new THREE.Mesh(bodyMainGeom, bodyMat);
        bodyMain.rotation.x = Math.PI / 2;
        bodyMain.scale.set(1.6, 0.7, 1);
        bodyMain.position.set(0, 0.5, 0.3);
        bodyMain.castShadow = true;
        group.add(bodyMain);
        
        // カプセルの端を球体で丸める
        const bodyCapGeom = new THREE.SphereGeometry(0.6, 16, 12);
        const bodyCapFront = new THREE.Mesh(bodyCapGeom, bodyMat);
        bodyCapFront.scale.set(1.6 * 0.7, 0.7, 1);
        bodyCapFront.position.set(0, 0.5, 0.3 + 1.1);
        group.add(bodyCapFront);
        const bodyCapBack = new THREE.Mesh(bodyCapGeom, bodyMat);
        bodyCapBack.scale.set(1.6 * 0.7, 0.7, 1);
        bodyCapBack.position.set(0, 0.5, 0.3 - 1.1);
        group.add(bodyCapBack);
        
        // フロントカウル（流線型）
        const cowlGeom = new THREE.ConeGeometry(0.8, 1.2, 16, 1, true);
        const cowl = new THREE.Mesh(cowlGeom, bodyMat);
        cowl.rotation.x = -Math.PI / 2;
        cowl.scale.set(1.2, 1, 0.6);
        cowl.position.set(0, 0.5, 2.0);
        group.add(cowl);
        
        // === コックピット（オープンスタイル） ===
        // ウィンドシールド
        const windshieldGeom = new THREE.PlaneGeometry(1.3, 0.5);
        const windshieldMat = new THREE.MeshStandardMaterial({
            color: 0x88ccff,
            transparent: true,
            opacity: 0.5,
            metalness: 0.8,
            roughness: 0.1,
            side: THREE.DoubleSide
        });
        const windshield = new THREE.Mesh(windshieldGeom, windshieldMat);
        windshield.position.set(0, 0.95, 1.1);
        windshield.rotation.x = -Math.PI / 4;
        group.add(windshield);
        
        // ミニステアリング
        const steeringGeom = new THREE.TorusGeometry(0.22, 0.035, 10, 20);
        const steering = new THREE.Mesh(steeringGeom, new THREE.MeshStandardMaterial({ color: 0x444444 }));
        steering.position.set(0, 0.85, 0.75);
        steering.rotation.x = Math.PI / 3;
        group.add(steering);
        
        // === かわいいシート ===
        const seatGeom = new THREE.SphereGeometry(0.55, 16, 12);
        const seatMat = new THREE.MeshStandardMaterial({
            color: secondaryColor,
            roughness: 0.7
        });
        const seat = new THREE.Mesh(seatGeom, seatMat);
        seat.scale.set(1.2, 0.6, 1.3);
        seat.position.set(0, 0.6, -0.25);
        group.add(seat);
        
        // === サイドフェアリング（かわいい丸み） ===
        [-1, 1].forEach(side => {
            const fairingGeom = new THREE.SphereGeometry(0.4, 14, 10);
            const fairing = new THREE.Mesh(fairingGeom, accentMat);
            fairing.scale.set(0.7, 0.6, 1.6);
            fairing.position.set(side * 1.1, 0.4, 0.4);
            group.add(fairing);
            
            // ハートマーク（ピーチ用）やスターマーク
            const markGeom = new THREE.CircleGeometry(0.15, 16);
            const mark = new THREE.Mesh(markGeom, whiteMat);
            mark.position.set(side * 1.22, 0.45, 0.6);
            mark.rotation.y = side * Math.PI / 2;
            group.add(mark);
        });
        
        // === 小さなリアウィング ===
        const wingGroupLight = new THREE.Group();
        
        // ウィングサポート
        [-0.5, 0.5].forEach(x => {
            const supportGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.35, 8);
            const support = new THREE.Mesh(supportGeom, chromeMat);
            support.position.set(x, 0.18, 0);
            wingGroupLight.add(support);
        });
        
        // ウィング本体（丸みのある - 円柱で代用）
        const wingGeom = new THREE.CylinderGeometry(0.08, 0.08, 1.4, 12);
        const wing = new THREE.Mesh(wingGeom, accentMat);
        wing.rotation.z = Math.PI / 2;
        wing.position.set(0, 0.4, 0);
        wingGroupLight.add(wing);
        
        // ウィング端の丸み
        const wingCapGeom = new THREE.SphereGeometry(0.08, 8, 8);
        [-0.7, 0.7].forEach(x => {
            const wingCap = new THREE.Mesh(wingCapGeom, accentMat);
            wingCap.position.set(x, 0.4, 0);
            wingGroupLight.add(wingCap);
        });
        
        wingGroupLight.position.set(0, 0.75, -1.6);
        group.add(wingGroupLight);
        
        // === マフラー（小さめ） ===
        const mufflerGeom = new THREE.CylinderGeometry(0.1, 0.08, 0.5, 12);
        const mufflerMat = new THREE.MeshStandardMaterial({
            color: 0x999999,
            metalness: 0.85,
            roughness: 0.2
        });
        const muffler = new THREE.Mesh(mufflerGeom, mufflerMat);
        muffler.rotation.x = Math.PI / 2 + 0.3;
        muffler.position.set(0.4, 0.45, -1.9);
        group.add(muffler);
        
        // === タイヤ（小さめでかわいい） ===
        this.wheels = [];
        this.buildMarioKartWheels(group, 'light');
    }
    
    // === 重量級カート（クッパ、ドンキーコング、ワリオ向け） ===
    buildHeavyKart(group) {
        const primaryColor = this.colorData.primary;
        const secondaryColor = this.colorData.secondary;
        
        const bodyMat = new THREE.MeshStandardMaterial({
            color: primaryColor,
            metalness: 0.5,
            roughness: 0.4
        });
        
        const accentMat = new THREE.MeshStandardMaterial({
            color: secondaryColor,
            metalness: 0.4,
            roughness: 0.45
        });
        
        const metalMat = new THREE.MeshStandardMaterial({
            color: 0x666666,
            metalness: 0.8,
            roughness: 0.25
        });
        
        const chromeMat = new THREE.MeshStandardMaterial({
            color: 0xaaaaaa,
            metalness: 0.95,
            roughness: 0.1
        });
        
        // === 巨大でパワフルなボディ ===
        // メインボディ（ワイドで重厚）
        const bodyGeom = new THREE.BoxGeometry(2.8, 0.9, 3.6);
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.set(0, 0.6, 0);
        
        // 角を丸くする
        body.geometry.translate(0, 0, 0);
        body.castShadow = true;
        group.add(body);
        
        // フロントグリル（攻撃的なデザイン）
        const grillGeom = new THREE.BoxGeometry(2.4, 0.6, 0.3);
        const grill = new THREE.Mesh(grillGeom, metalMat);
        grill.position.set(0, 0.5, 1.9);
        group.add(grill);
        
        // グリルのスリット
        for (let i = -4; i <= 4; i++) {
            const slitGeom = new THREE.BoxGeometry(0.12, 0.45, 0.35);
            const slitMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
            const slit = new THREE.Mesh(slitGeom, slitMat);
            slit.position.set(i * 0.25, 0.5, 1.92);
            group.add(slit);
        }
        
        // === 巨大なエンジンブロック（露出） ===
        const engineGeom = new THREE.BoxGeometry(1.8, 0.8, 1.2);
        const engine = new THREE.Mesh(engineGeom, metalMat);
        engine.position.set(0, 1.1, -0.8);
        group.add(engine);
        
        // エンジンシリンダー（V8風）
        for (let row = -1; row <= 1; row += 2) {
            for (let i = 0; i < 4; i++) {
                const cylGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.35, 10);
                const cyl = new THREE.Mesh(cylGeom, chromeMat);
                cyl.position.set(row * 0.35, 1.55, -1.0 + i * 0.28);
                cyl.rotation.z = row * 0.25;
                group.add(cyl);
            }
        }
        
        // エアインテーク
        const intakeGeom = new THREE.BoxGeometry(0.6, 0.45, 0.6);
        const intake = new THREE.Mesh(intakeGeom, new THREE.MeshStandardMaterial({ color: 0x222222 }));
        intake.position.set(0, 1.4, -0.6);
        group.add(intake);
        
        // === 大きなコックピット ===
        // ダッシュボード
        const dashGeom = new THREE.BoxGeometry(2.2, 0.4, 0.6);
        const dash = new THREE.Mesh(dashGeom, new THREE.MeshStandardMaterial({ color: 0x333333 }));
        dash.position.set(0, 0.9, 1.0);
        dash.rotation.x = -0.2;
        group.add(dash);
        
        // ゴツいステアリング
        const steeringGeom = new THREE.TorusGeometry(0.35, 0.055, 12, 24);
        const steering = new THREE.Mesh(steeringGeom, new THREE.MeshStandardMaterial({ color: 0x444444 }));
        steering.position.set(0, 1.15, 1.0);
        steering.rotation.x = Math.PI / 2.8;
        group.add(steering);
        
        // === 重厚なシート ===
        const seatGeom = new THREE.BoxGeometry(1.6, 0.4, 1.4);
        const seatMat = new THREE.MeshStandardMaterial({
            color: 0x222222,
            roughness: 0.8
        });
        const seat = new THREE.Mesh(seatGeom, seatMat);
        seat.position.set(0, 0.8, 0.1);
        group.add(seat);
        
        // シートバック
        const backGeom = new THREE.BoxGeometry(1.6, 0.9, 0.3);
        const seatBack = new THREE.Mesh(backGeom, seatMat);
        seatBack.position.set(0, 1.15, -0.35);
        seatBack.rotation.x = -0.15;
        group.add(seatBack);
        
        // === サイドアーマー ===
        [-1, 1].forEach(side => {
            // メインアーマー
            const armorGeom = new THREE.BoxGeometry(0.35, 0.7, 2.8);
            const armor = new THREE.Mesh(armorGeom, accentMat);
            armor.position.set(side * 1.55, 0.55, 0);
            group.add(armor);
            
            // スパイク/リベット装飾
            for (let i = 0; i < 4; i++) {
                const rivetGeom = new THREE.SphereGeometry(0.08, 8, 8);
                const rivet = new THREE.Mesh(rivetGeom, chromeMat);
                rivet.position.set(side * 1.72, 0.55, -0.9 + i * 0.6);
                group.add(rivet);
            }
        });
        
        // === 巨大なマフラー（4本出し） ===
        const exhaustPositions = [
            { x: -0.6, y: 0.5 },
            { x: -0.2, y: 0.65 },
            { x: 0.2, y: 0.65 },
            { x: 0.6, y: 0.5 }
        ];
        
        exhaustPositions.forEach(pos => {
            const pipeGeom = new THREE.CylinderGeometry(0.14, 0.11, 0.8, 14);
            const pipeMat = new THREE.MeshStandardMaterial({
                color: 0x777777,
                metalness: 0.85,
                roughness: 0.2
            });
            const pipe = new THREE.Mesh(pipeGeom, pipeMat);
            pipe.rotation.x = Math.PI / 2 + 0.4;
            pipe.position.set(pos.x, pos.y, -2.2);
            group.add(pipe);
            
            // 火炎エフェクト用のリング
            const flameRingGeom = new THREE.TorusGeometry(0.12, 0.025, 8, 12);
            const flameRingMat = new THREE.MeshStandardMaterial({ 
                color: 0xff4400, 
                emissive: 0xff2200,
                emissiveIntensity: 0.3
            });
            const flameRing = new THREE.Mesh(flameRingGeom, flameRingMat);
            flameRing.position.set(pos.x, pos.y - 0.2, -2.55);
            flameRing.rotation.x = Math.PI / 2.2;
            group.add(flameRing);
        });
        
        // === フロントバンパー（ブルバー風） ===
        const bullbarGeom = new THREE.CylinderGeometry(0.1, 0.1, 2.6, 12);
        const bullbar = new THREE.Mesh(bullbarGeom, chromeMat);
        bullbar.rotation.z = Math.PI / 2;
        bullbar.position.set(0, 0.4, 2.2);
        group.add(bullbar);
        
        // ブルバーのサポート
        [-0.9, 0.9].forEach(x => {
            const supportGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.5, 8);
            const support = new THREE.Mesh(supportGeom, chromeMat);
            support.position.set(x, 0.6, 2.0);
            support.rotation.x = Math.PI / 4;
            group.add(support);
        });
        
        // === タイヤ（大きくてワイド） ===
        this.wheels = [];
        this.buildMarioKartWheels(group, 'heavy');
    }
    
    // === マリオカート風のタイヤを作成 ===
    buildMarioKartWheels(group, kartType) {
        const primaryColor = this.colorData.primary;
        
        // タイヤサイズと位置を重量クラスで調整
        let wheelConfig;
        switch (kartType) {
            case 'light':
                wheelConfig = {
                    positions: [
                        { x: -1.15, y: 0.35, z: 1.3, scale: 0.85 },
                        { x: 1.15, y: 0.35, z: 1.3, scale: 0.85 },
                        { x: -1.15, y: 0.4, z: -1.2, scale: 0.95 },
                        { x: 1.15, y: 0.4, z: -1.2, scale: 0.95 }
                    ],
                    tireWidth: 0.35,
                    tireRadius: 0.5,
                    rimStyle: 'sporty'
                };
                break;
            case 'heavy':
                wheelConfig = {
                    positions: [
                        { x: -1.6, y: 0.5, z: 1.5, scale: 1.15 },
                        { x: 1.6, y: 0.5, z: 1.5, scale: 1.15 },
                        { x: -1.6, y: 0.6, z: -1.4, scale: 1.35 },
                        { x: 1.6, y: 0.6, z: -1.4, scale: 1.35 }
                    ],
                    tireWidth: 0.55,
                    tireRadius: 0.6,
                    rimStyle: 'monster'
                };
                break;
            default: // standard
                wheelConfig = {
                    positions: [
                        { x: -1.35, y: 0.4, z: 1.35, scale: 1 },
                        { x: 1.35, y: 0.4, z: 1.35, scale: 1 },
                        { x: -1.35, y: 0.48, z: -1.35, scale: 1.15 },
                        { x: 1.35, y: 0.48, z: -1.35, scale: 1.15 }
                    ],
                    tireWidth: 0.45,
                    tireRadius: 0.55,
                    rimStyle: 'classic'
                };
        }
        
        wheelConfig.positions.forEach((pos, i) => {
            const wheelGroup = new THREE.Group();
            const scale = pos.scale;
            
            // タイヤ（ゴム部分）
            const tireGeom = new THREE.CylinderGeometry(
                wheelConfig.tireRadius * scale,
                wheelConfig.tireRadius * scale,
                wheelConfig.tireWidth * scale,
                28
            );
            const tireMat = new THREE.MeshStandardMaterial({
                color: 0x1a1a1a,
                roughness: 0.9,
                metalness: 0
            });
            const tire = new THREE.Mesh(tireGeom, tireMat);
            tire.rotation.z = Math.PI / 2;
            tire.castShadow = true;
            wheelGroup.add(tire);
            
            // タイヤの溝（トレッドパターン）
            const grooveCount = kartType === 'heavy' ? 12 : 8;
            for (let g = 0; g < grooveCount; g++) {
                const angle = (g / grooveCount) * Math.PI * 2;
                const grooveGeom = new THREE.BoxGeometry(0.03, 0.08 * scale, wheelConfig.tireWidth * scale * 1.02);
                const grooveMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
                const groove = new THREE.Mesh(grooveGeom, grooveMat);
                groove.position.set(
                    0,
                    Math.cos(angle) * wheelConfig.tireRadius * scale * 0.95,
                    Math.sin(angle) * wheelConfig.tireRadius * scale * 0.95
                );
                groove.rotation.x = angle;
                wheelGroup.add(groove);
            }
            
            // ホイール（リム）
            const rimRadius = wheelConfig.tireRadius * scale * 0.7;
            const rimGeom = new THREE.CylinderGeometry(rimRadius, rimRadius, wheelConfig.tireWidth * scale * 0.9, 20);
            const rimMat = new THREE.MeshStandardMaterial({
                color: 0xcccccc,
                metalness: 0.9,
                roughness: 0.15
            });
            const rim = new THREE.Mesh(rimGeom, rimMat);
            rim.rotation.z = Math.PI / 2;
            wheelGroup.add(rim);
            
            // ホイールキャップ（キャラクターカラー）
            const hubRadius = rimRadius * 0.75;
            const hubGeom = new THREE.CircleGeometry(hubRadius, 20);
            const hubMat = new THREE.MeshStandardMaterial({
                color: primaryColor,
                metalness: 0.6,
                roughness: 0.2
            });
            
            // 左側キャップ
            const hubL = new THREE.Mesh(hubGeom, hubMat);
            hubL.position.x = -wheelConfig.tireWidth * scale * 0.46;
            hubL.rotation.y = Math.PI / 2;
            wheelGroup.add(hubL);
            
            // 右側キャップ
            const hubR = new THREE.Mesh(hubGeom, hubMat);
            hubR.position.x = wheelConfig.tireWidth * scale * 0.46;
            hubR.rotation.y = -Math.PI / 2;
            wheelGroup.add(hubR);
            
            // スポーク（デザインパターン）
            const spokeCount = kartType === 'heavy' ? 6 : 5;
            [-1, 1].forEach(side => {
                for (let s = 0; s < spokeCount; s++) {
                    const angle = (s / spokeCount) * Math.PI * 2;
                    const spokeGeom = new THREE.BoxGeometry(0.04, hubRadius * 0.8, 0.02);
                    const spokeMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.8 });
                    const spoke = new THREE.Mesh(spokeGeom, spokeMat);
                    spoke.position.set(
                        side * wheelConfig.tireWidth * scale * 0.44,
                        Math.cos(angle) * hubRadius * 0.4,
                        Math.sin(angle) * hubRadius * 0.4
                    );
                    spoke.rotation.x = angle;
                    spoke.rotation.y = Math.PI / 2;
                    wheelGroup.add(spoke);
                }
            });
            
            // ボルト（中央）
            const boltGeom = new THREE.CylinderGeometry(0.06 * scale, 0.06 * scale, wheelConfig.tireWidth * scale * 0.5, 6);
            const boltMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.9 });
            const bolt = new THREE.Mesh(boltGeom, boltMat);
            bolt.rotation.z = Math.PI / 2;
            wheelGroup.add(bolt);
            
            wheelGroup.position.set(pos.x, pos.y, pos.z);
            group.add(wheelGroup);
            this.wheels.push(wheelGroup);
        });
    }
    
    // === キャラクターをカートに追加 ===
    addCharacterToKart(group) {
        let characterGroup;
        
        if (window.CharacterModelBuilder && this.characterId) {
            const builder = new window.CharacterModelBuilder();
            characterGroup = builder.createDriver(this.characterId);
            
            // 重量クラスによって位置を調整
            const weightClass = this.characterData?.weight || 'medium';
            switch (weightClass) {
                case 'light':
                    characterGroup.position.set(0, 0.7, -0.1);
                    characterGroup.scale.set(0.9, 0.9, 0.9);
                    break;
                case 'heavy':
                    characterGroup.position.set(0, 1.0, 0.15);
                    characterGroup.scale.set(1.1, 1.1, 1.1);
                    break;
                default:
                    characterGroup.position.set(0, 0.85, -0.15);
                    break;
            }
        } else {
            // フォールバック
            characterGroup = new THREE.Group();
            characterGroup.position.set(0, 0, -0.2);
            
            const torsoGeo = new THREE.CylinderGeometry(0.45, 0.5, 0.9, 12);
            const shirtMat = new THREE.MeshStandardMaterial({
                color: this.colorData.accent || this.colorData.primary,
                roughness: 0.8
            });
            const torso = new THREE.Mesh(torsoGeo, shirtMat);
            torso.position.y = 1.4;
            torso.castShadow = true;
            characterGroup.add(torso);
            
            const headGeo = new THREE.SphereGeometry(0.5, 16, 16);
            const skinMat = new THREE.MeshStandardMaterial({
                color: 0xffe0bd,
                roughness: 0.8
            });
            const head = new THREE.Mesh(headGeo, skinMat);
            head.position.y = 2.2;
            characterGroup.add(head);
            
            const capGeo = new THREE.SphereGeometry(0.52, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
            const capMat = new THREE.MeshStandardMaterial({
                color: this.colorData.primary,
                roughness: 0.6
            });
            const cap = new THREE.Mesh(capGeo, capMat);
            cap.position.y = 2.35;
            characterGroup.add(cap);
        }
        
        group.add(characterGroup);
    }
    
    // === シールドエフェクト ===
    addShieldEffect(group) {
        const shieldGeometry = new THREE.SphereGeometry(2.8, 24, 24);
        const shieldMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide,
            wireframe: true
        });
        this.shieldMesh = new THREE.Mesh(shieldGeometry, shieldMaterial);
        this.shieldMesh.position.y = 1.2;
        group.add(this.shieldMesh);
    }
    
    setPosition(x, y, z, rotation = 0) {
        this.position.set(x, y, z);
        this.lastValidPosition.copy(this.position);  // 有効な位置として保存
        this.rotation = rotation;
        this.updateMeshPosition();
    }
    
    updateMeshPosition() {
        this.mesh.position.copy(this.position);
        this.mesh.rotation.y = this.rotation;
        
        // Apply shrink effect
        const scale = this.isShrunken ? 0.5 : 1;
        this.mesh.scale.set(scale, scale, scale);
    }
    
    update(deltaTime, track) {
        // コースの最高速度倍率を更新
        if (track && track.physics && track.physics.topSpeed) {
            this.trackTopSpeed = track.physics.topSpeed;
        } else {
            this.trackTopSpeed = 1.0;
        }
        
        if (this.finished) {
            // Slow to stop after finishing
            this.speed *= 0.95;
            this.updatePhysics(deltaTime, track);
            return;
        }
        
        // Update timers
        this.updateTimers(deltaTime);
        
        if (this.isSpunOut) {
            this.handleSpinOut(deltaTime);
            this.updateMeshPosition();
            return;
        }
        
        if (this.isFrozen) {
            // Can't move while frozen
            this.speed *= 0.95;
            this.updateMeshPosition();
            return;
        }
        
        // Handle input for BOTH player and AI
        // (AI sets input via AIController before this is called)
        this.handleInput(deltaTime, track);
        
        // Update physics
        this.updatePhysics(deltaTime, track);
        
        // Update drift
        this.updateDrift(deltaTime);
        
        // Update boost
        this.updateBoost(deltaTime);
        
        // Rotate wheels
        this.updateWheels(deltaTime);
        
        // Update collision box
        this.updateCollisionBox();
        
        // Check for track features
        this.checkTrackFeatures(track);
        
        // Update race progress
        this.updateRaceProgress(track);
        
        // Update shield visual
        if (this.hasShield) {
            this.shieldMesh.rotation.y += deltaTime * 2;
            this.shieldMesh.material.opacity = 0.3 + Math.sin(Date.now() * 0.005) * 0.1;
        }
    }
    
    updateTimers(deltaTime) {
        if (this.shrinkTimer > 0) {
            this.shrinkTimer -= deltaTime;
            if (this.shrinkTimer <= 0) {
                this.isShrunken = false;
            }
        }
        
        if (this.freezeTimer > 0) {
            this.freezeTimer -= deltaTime;
            if (this.freezeTimer <= 0) {
                this.isFrozen = false;
            }
        }
        
        if (this.spinOutTimer > 0) {
            this.spinOutTimer -= deltaTime;
            if (this.spinOutTimer <= 0) {
                this.isSpunOut = false;
            }
        }
        
        if (this.invincibilityTimer > 0) {
            this.invincibilityTimer -= deltaTime;
        }
        
        // シールドのタイマー（スターと同じ8秒間）
        if (this.shieldTimer > 0) {
            this.shieldTimer -= deltaTime;
            if (this.shieldTimer <= 0) {
                this.hasShield = false;
                this.shieldMesh.material.opacity = 0;
            }
        }
    }
    
    handleInput(deltaTime, track) {
        const input = this.input;
        
        // Get physics modifiers for turn grip on ice
        let turnGrip = 1.0;
        let brakeEfficiency = 1.0;
        if (track.getPhysicsModifiers) {
            const modifiers = track.getPhysicsModifiers(this.position.x, this.position.z);
            turnGrip = modifiers.turnGrip || 1.0;
            brakeEfficiency = track.physics?.brakeEfficiency || 1.0;
        }
        
        // === エンジンパワーシステム（アーケード風即応性） ===
        const maxSpd = this.getEffectiveMaxSpeed();
        
        if (input.forward) {
            // 素早いエンジンレスポンス
            this.enginePower = Utils.lerp(this.enginePower, 1.0, 0.15);
        } else if (input.backward) {
            if (this.speed > 5) {
                // 強力なブレーキ
                this.enginePower = Utils.lerp(this.enginePower, -1.0, 0.2);
            } else {
                // バック
                this.enginePower = Utils.lerp(this.enginePower, -0.5, 0.1);
            }
        } else {
            // 緩やかなエンジンブレーキ
            this.enginePower = Utils.lerp(this.enginePower, 0, 0.08);
        }
        
        // エンジンパワーを速度に変換
        if (this.enginePower > 0) {
            // 加速カーブ - 低速で強く、高速で緩やか
            const accelerationCurve = Math.pow(1 - (this.speed / maxSpd), 0.7);
            this.speed += this.acceleration * this.enginePower * accelerationCurve * deltaTime;
            this.speed = Math.min(this.speed, maxSpd);
        } else if (this.enginePower < 0) {
            if (this.speed > 0) {
                // ブレーキ - 氷上ではブレーキ効率低下
                this.speed += this.brakeStrength * this.enginePower * brakeEfficiency * deltaTime;
                this.speed = Math.max(0, this.speed);
            } else {
                // バック
                this.speed += this.acceleration * 0.5 * this.enginePower * deltaTime;
                this.speed = Math.max(-maxSpd * 0.4, this.speed);
            }
        } else {
            // 自然減速
            if (this.speed > 0) {
                this.speed = Math.max(0, this.speed - this.deceleration * deltaTime);
            } else if (this.speed < 0) {
                this.speed = Math.min(0, this.speed + this.deceleration * deltaTime);
            }
        }
        
        // === ドリフトシステム（改良版） ===
        const speedRatio = Math.abs(this.speed) / maxSpd;
        const minDriftSpeed = 10;  // より低速でもドリフト可能
        
        // ドリフト開始判定
        if (input.drift && Math.abs(this.speed) > minDriftSpeed) {
            if (!this.isDrifting) {
                // ドリフト開始は明確な旋回入力がある時のみ
                if (input.left) {
                    this.startDrift(-1);
                } else if (input.right) {
                    this.startDrift(1);
                } else if (Math.abs(this.currentTurnAmount) > 0.45) {
                    this.startDrift(this.currentTurnAmount < 0 ? -1 : 1);
                }
            }
        } else if (this.isDrifting && !input.drift) {
            this.endDrift();
        }
        
        // === 旋回処理 ===
        // 速度に応じた旋回能力
        const turnAbility = 0.4 + speedRatio * 0.6;  // 低速でも十分曲がれる
        const highSpeedPenalty = speedRatio > 0.8 ? (1 - (speedRatio - 0.8) * 0.3) : 1;
        
        if (this.isDrifting) {
            // === ドリフト中の操作 ===
            const driftIntensity = 0.82 + this.driftLevel * 0.08;
            
            // ベースのドリフト旋回
            const baseDriftTurn = this.driftDirection * this.turnSpeed * 0.68 * driftIntensity;
            
            // ステアリング入力で微調整
            let steerAdjust = 0;
            const hasSteer = input.left || input.right;
            if (input.left) {
                steerAdjust = this.turnSpeed * 0.3;  // 左に追加旋回
            } else if (input.right) {
                steerAdjust = -this.turnSpeed * 0.3; // 右に追加旋回
            }
            
            const driftTurnScale = hasSteer ? 0.62 : 0.36;
            const desiredRotation = baseDriftTurn * driftTurnScale + steerAdjust;
            const turnSmoothing = hasSteer ? 0.08 : 0.06;
            this.targetRotation = Utils.lerp(this.targetRotation, desiredRotation, turnSmoothing);
            
            // ドリフト角度を更新（視覚用）
            this.driftAngle = Utils.lerp(this.driftAngle, this.driftDirection * (hasSteer ? 20 : 12), 0.1);
            
            // 横滑り（スピードに応じて）
            const driftSlide = this.driftDirection * this.speed * (hasSteer ? 0.22 : 0.12) * this.driftGrip;
            this.lateralVelocity = Utils.lerp(this.lateralVelocity, driftSlide, 0.12);
            
            // 旋回量を更新
            this.currentTurnAmount = Utils.lerp(this.currentTurnAmount, -this.driftDirection, 0.15);
            
        } else {
            // === 通常走行 ===
            this.driftAngle = Utils.lerp(this.driftAngle, 0, 0.15);
            this.lateralVelocity = Utils.lerp(this.lateralVelocity, 0, 0.2);  // 横滑りを素早く減衰
            
            if (input.left) {
                this.targetRotation = this.turnSpeed * turnAbility * highSpeedPenalty * turnGrip;
                this.currentTurnAmount = Utils.lerp(this.currentTurnAmount, -1, this.steeringResponse);
            } else if (input.right) {
                this.targetRotation = -this.turnSpeed * turnAbility * highSpeedPenalty * turnGrip;
                this.currentTurnAmount = Utils.lerp(this.currentTurnAmount, 1, this.steeringResponse);
            } else {
                this.targetRotation = 0;
                this.currentTurnAmount = Utils.lerp(this.currentTurnAmount, 0, this.steeringResponse * 2);
            }
            
            // 氷上では横滑りが発生
            if (turnGrip < 1.0 && Math.abs(this.speed) > 10) {
                const slideAmount = (1.0 - turnGrip) * this.currentTurnAmount * this.speed * 0.15;
                this.lateralVelocity = Utils.lerp(this.lateralVelocity, slideAmount, 0.1);
            }
        }
        
        // 旋回を適用
        this.rotation += this.targetRotation * deltaTime;
    }
    
    updatePhysics(deltaTime, track) {
        // === 地形判定 ===
        this.onGrass = track.isOnGrass(this.position.x, this.position.z);
        
        // Get physics modifiers from track (ice patches, lava, etc.)
        let physicsModifiers = { friction: 1.0, speedMultiplier: 1.0, onIce: false, onLava: false };
        if (track.getPhysicsModifiers) {
            physicsModifiers = track.getPhysicsModifiers(this.position.x, this.position.z);
        }
        
        // Course-specific base friction
        const courseFriction = track.physics?.friction || 1.0;
        
        // 芝でのペナルティ（プレイヤーのみ適用、AIは無視）
        let terrainGrip = 1.0;
        if (this.onGrass && this.isPlayer) {
            this.speed *= Math.pow(this.grassFriction, deltaTime * 20);  // ペナルティ緩和
            terrainGrip = 0.75;  // グリップやや低下
            // 最高速度制限を緩和
            if (!this.isDrifting) {
                this.speed = Math.min(this.speed, this.maxSpeed * 0.75);
            }
        }
        
        // Ice patch physics (slippery)
        if (physicsModifiers.onIce) {
            terrainGrip = 0.3;  // Very low grip on ice
            this.lateralVelocity *= 0.99;  // Less lateral friction (more sliding)
            // Ice visual effect
            if (window.game && window.game.particleSystem && Math.random() < 0.1) {
                window.game.particleSystem.createDust(this.position.x, this.position.y, this.position.z, 0x88ddff);
            }
        }
        
        // Lava damage
        if (physicsModifiers.onLava && !this.hasShield && this.invincibilityTimer <= 0) {
            // Instant spin out and damage
            this.spinOut();
            // Push away from lava
            const pushSpeed = 30;
            const trackDir = track.getTrackDirection(this.position.x, this.position.z);
            this.position.x += Math.sin(trackDir) * pushSpeed * deltaTime;
            this.position.z += Math.cos(trackDir) * pushSpeed * deltaTime;
            
            // Fire effect
            if (window.game && window.game.particleSystem) {
                window.game.particleSystem.createFlameBurst(this.position.x, this.position.y, this.position.z);
            }
        }
        
        // === 速度ベクトル計算 ===
        const forwardDir = new THREE.Vector3(
            Math.sin(this.rotation),
            0,
            Math.cos(this.rotation)
        );
        
        // 横方向（ドリフト・横滑り用）
        const lateralDir = new THREE.Vector3(
            Math.cos(this.rotation),
            0,
            -Math.sin(this.rotation)
        );
        
        // 前方速度
        this.velocity.copy(forwardDir).multiplyScalar(this.speed * deltaTime);
        
        // 横滑りを追加 (affected by ice/grip)
        if (Math.abs(this.lateralVelocity) > 0.5) {
            const lateralMove = lateralDir.clone().multiplyScalar(this.lateralVelocity * deltaTime * terrainGrip);
            this.velocity.add(lateralMove);
        }
        
        // === 1フレームの移動距離を制限（暴走防止） ===
        const maxMovePerFrame = 8;  // 1フレームで最大8単位まで
        const moveDistance = this.velocity.length();
        if (moveDistance > maxMovePerFrame) {
            this.velocity.normalize().multiplyScalar(maxMovePerFrame);
            console.log('移動距離制限発動:', moveDistance.toFixed(2), '->', maxMovePerFrame);
        }
        
        // 位置更新
        this.position.add(this.velocity);
        
        // NaNチェック - 位置が不正になったら最後の有効な位置に戻す
        if (isNaN(this.position.x) || isNaN(this.position.z) || isNaN(this.position.y)) {
            console.error('Position became NaN, restoring to last valid position');
            this.position.copy(this.lastValidPosition);
            this.speed = 0;
            this.velocity.set(0, 0, 0);
            return;
        }
        
        // === 極端なコース外チェック（暴走防止） ===
        const maxDistance = 500;  // コース中心からの最大許容距離
        const distFromCenter = Math.sqrt(this.position.x * this.position.x + this.position.z * this.position.z);
        if (distFromCenter > maxDistance) {
            console.warn('コース外に大きく逸脱、最後の有効な位置に戻す:', distFromCenter.toFixed(2));
            this.position.copy(this.lastValidPosition);
            this.speed *= 0.5;  // 速度を半減
            this.velocity.set(0, 0, 0);
            // 方向をコース中心に向ける
            this.rotation = Math.atan2(-this.position.x, -this.position.z);
            return;
        }
        
        // === 地形高さ追従とジャンプ物理 ===
        const groundY = track.getHeightAt(this.position.x, this.position.z) + 1.0;
        
        if (this.isAirborne) {
            // 空中にいる場合：重力を適用
            this.verticalVelocity -= 40 * deltaTime;  // 重力加速度
            this.position.y += this.verticalVelocity * deltaTime;
            
            // 着地判定
            if (this.position.y <= groundY) {
                this.position.y = groundY;
                this.verticalVelocity = 0;
                this.isAirborne = false;
                
                // 着地音
                if (window.audioManager) {
                    window.audioManager.playSound('land');
                }
            }
        } else {
            // 地上にいる場合：地形に追従
            if (!isNaN(groundY)) {
                this.position.y = Utils.lerp(this.position.y, groundY, 0.4);  // 素早く追従
            }
        }
        
        // 位置が有効なら保存
        this.lastValidPosition.copy(this.position);
        
        // === 摩擦適用 ===
        // Apply both terrain friction and course-specific friction
        const baseFriction = (this.onGrass && this.isPlayer) ? this.grassFriction : this.friction;
        const finalFriction = baseFriction * courseFriction * physicsModifiers.friction;
        this.speed *= finalFriction;
        
        // === メッシュ更新 ===
        this.updateMeshPosition();
        
        // カートの傾き
        if (!this.isSpunOut) {
            // ロール（左右の傾き）- ice increases tilt
            const tiltAmount = this.isDrifting ? 0.22 : (physicsModifiers.onIce ? 0.18 : 0.12);
            const targetTilt = this.currentTurnAmount * tiltAmount;
            this.mesh.rotation.z = Utils.lerp(this.mesh.rotation.z, targetTilt, physicsModifiers.onIce ? 0.1 : 0.2);
            
            // ピッチ（前後の傾き）- 加速/ブレーキで傾く
            const pitchAmount = -this.enginePower * 0.04;
            this.mesh.rotation.x = Utils.lerp(this.mesh.rotation.x || 0, pitchAmount, 0.15);
        }
    }
    
    startDrift(direction) {
        if (this.isDrifting) return;
        
        this.isDrifting = true;
        this.driftDirection = direction;
        this.driftTime = 0;
        this.driftLevel = 0;
        
        if (window.audioManager) {
            window.audioManager.startDriftSound();
        }
    }
    
    updateDrift(deltaTime) {
        if (!this.isDrifting) return;
        
        this.driftTime += deltaTime;
        
        // マリオカート風ドリフトレベル: ミニターボ(0.4s), スーパーミニターボ(0.9s), ウルトラミニターボ(1.6s)
        if (this.driftTime >= 1.6 && this.driftLevel < 3) {
            this.driftLevel = 3;
        } else if (this.driftTime >= 0.9 && this.driftLevel < 2) {
            this.driftLevel = 2;
        } else if (this.driftTime >= 0.4 && this.driftLevel < 1) {
            this.driftLevel = 1;
        }
    }
    
    endDrift() {
        if (!this.isDrifting) return;
        
        if (window.audioManager) {
            window.audioManager.stopDriftSound();
        }
        
        // マリオカート風ミニターボ: 強力だが制御可能
        if (this.driftLevel >= 1) {
            // ミニターボ/スーパー/ウルトラの3段階
            const boostDurations = [0, 0.3, 0.55, 0.85];  // さらに短め
            const boostMultipliers = [1, 1.12, 1.22, 1.32];  // さらに控えめ
            const boostNames = ['', 'ミニターボ', 'スーパーミニターボ', 'ウルトラミニターボ'];
            
            this.applyBoost(boostDurations[this.driftLevel], boostMultipliers[this.driftLevel]);
            console.log(boostNames[this.driftLevel] + '発動！');
            
            if (window.audioManager) {
                window.audioManager.playSound(this.driftLevel >= 2 ? 'boost_big' : 'boost');
            }
        }
        
        this.isDrifting = false;
        this.driftDirection = 0;
        this.driftTime = 0;
        this.driftLevel = 0;
    }
    
    applyBoost(duration, multiplier) {
        // マリオカート風: 強力なブースト（しかし上限あり）
        this.boostTime = Math.max(this.boostTime, duration);
        this.boostMultiplier = Math.max(this.boostMultiplier, multiplier);
        
        // ブースト開始時に瞬間加速（マリオカートの爽快感）
        this.speed = Math.min(this.speed * 1.15, this.maxSpeed * multiplier);
    }
    
    updateBoost(deltaTime) {
        if (this.boostTime > 0) {
            this.boostTime -= deltaTime;
            
            // マリオカート風ブースト: 力強い加速感
            const maxBoostedSpeed = this.maxSpeed * this.boostMultiplier;
            
            if (this.speed < maxBoostedSpeed) {
                // スムーズで力強い加速
                this.speed = Math.min(this.speed + this.acceleration * 2.0 * deltaTime, maxBoostedSpeed);
            }
            
            if (this.boostTime <= 0) {
                this.boostMultiplier = 1;
            }
        }
    }
    
    // 難易度に応じた速度倍率を設定
    setDifficultyMultiplier(multiplier) {
        this.difficultyMultiplier = multiplier;
        this.maxSpeed = this.baseMaxSpeed * multiplier;
        this.acceleration = this.baseAcceleration * multiplier;
        console.log(`カート速度設定: maxSpeed=${this.maxSpeed}, acceleration=${this.acceleration}`);
    }
    
    getEffectiveMaxSpeed() {
        let max = this.maxSpeed;
        
        // コース固有の最高速度倍率を適用（雪コースは高速）
        if (this.trackTopSpeed) {
            max *= this.trackTopSpeed;
        }
        
        if (this.boostTime > 0) {
            max *= this.boostMultiplier;
        }
        
        if (this.isShrunken) {
            max *= 0.7;
        }
        
        // ブースト中は高速を許可
        return max;
    }
    
    updateWheels(deltaTime) {
        const wheelRotation = this.speed * deltaTime * 0.3;
        
        this.wheels.forEach((wheelGroup, i) => {
            // Rotate the tire inside the wheel group
            if (wheelGroup.children[0]) {
                wheelGroup.children[0].rotation.y += wheelRotation;
            }
            
            // Front wheels turn with steering
            if (i < 2) {
                wheelGroup.rotation.y = Utils.lerp(
                    wheelGroup.rotation.y,
                    this.currentTurnAmount * 0.4,
                    0.15
                );
            }
        });
    }
    
    updateCollisionBox() {
        const halfSize = new THREE.Vector3(1.5, 1, 2.5);
        this.collisionBox.setFromCenterAndSize(this.position, halfSize.multiplyScalar(2));
    }
    
    checkTrackFeatures(track) {
        // ブーストパッドは無効化済み
        
        // Check item boxes
        track.itemBoxes.forEach(itemBox => {
            if (!itemBox.active) return;
            
            const dist = Utils.distance2D(
                this.position.x, this.position.z,
                itemBox.position.x, itemBox.position.z
            );
            
            if (dist < itemBox.radius && !this.currentItem) {
                this.collectItem(itemBox);
            }
        });
        
        // Check barriers collision
        this.checkBarrierCollision(track);
    }
    
    checkBarrierCollision(track) {
        if (!track.barriers || track.barriers.length === 0) return;
        
        const kartRadius = 3;
        
        for (const barrier of track.barriers) {
            const dist = Utils.distance2D(
                this.position.x, this.position.z,
                barrier.x, barrier.z
            );
            
            const collisionDist = kartRadius + barrier.radius;
            
            if (dist < collisionDist) {
                // 衝突！押し戻す
                const pushDirection = {
                    x: this.position.x - barrier.x,
                    z: this.position.z - barrier.z
                };
                
                const len = Math.sqrt(pushDirection.x * pushDirection.x + pushDirection.z * pushDirection.z);
                if (len > 0.01) {
                    pushDirection.x /= len;
                    pushDirection.z /= len;
                    
                    // カートを押し戻す
                    const pushDist = collisionDist - dist + 0.5;
                    this.position.x += pushDirection.x * pushDist;
                    this.position.z += pushDirection.z * pushDist;
                    
                    // 速度を大幅に減速
                    this.speed *= 0.3;
                    
                    // バウンス効果
                    if (this.velocity) {
                        this.velocity.x = pushDirection.x * Math.abs(this.speed) * 0.3;
                        this.velocity.z = pushDirection.z * Math.abs(this.speed) * 0.3;
                    }
                }
            }
        }
        
        // フェンス（カーブのショートカット防止）との衝突判定
        const fenceLines = [
            // 第1コーナー内側
            [{x: 160, z: -160}, {x: 190, z: -120}, {x: 200, z: -60}],
            // 第2コーナー内側
            [{x: 170, z: 120}, {x: 130, z: 150}, {x: 80, z: 160}],
            // S字カーブ内側
            [{x: 40, z: 140}, {x: -20, z: 170}, {x: -80, z: 190}],
            // 第3コーナー内側
            [{x: -170, z: 170}, {x: -190, z: 120}, {x: -190, z: 60}],
            // 最終コーナー内側
            [{x: -150, z: -100}, {x: -120, z: -140}, {x: -80, z: -165}],
        ];
        
        const fenceRadius = 5;
        fenceLines.forEach(points => {
            for (let i = 0; i < points.length - 1; i++) {
                const p1 = points[i];
                const p2 = points[i + 1];
                
                // 線分とカートの距離を計算
                const dist = this.pointToLineDistance(
                    this.position.x, this.position.z,
                    p1.x, p1.z, p2.x, p2.z
                );
                
                if (dist < fenceRadius) {
                    // フェンスに衝突 - 押し戻す
                    const midX = (p1.x + p2.x) / 2;
                    const midZ = (p1.z + p2.z) / 2;
                    const pushDirection = {
                        x: this.position.x - midX,
                        z: this.position.z - midZ
                    };
                    
                    const len = Math.sqrt(pushDirection.x * pushDirection.x + pushDirection.z * pushDirection.z);
                    if (len > 0.01) {
                        pushDirection.x /= len;
                        pushDirection.z /= len;
                        
                        const pushDist = fenceRadius - dist + 1;
                        this.position.x += pushDirection.x * pushDist;
                        this.position.z += pushDirection.z * pushDist;
                        
                        this.speed *= 0.5;
                    }
                }
            }
        });
    }
    
    // 点と線分の距離を計算
    pointToLineDistance(px, pz, x1, z1, x2, z2) {
        const A = px - x1;
        const B = pz - z1;
        const C = x2 - x1;
        const D = z2 - z1;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        
        if (lenSq !== 0) param = dot / lenSq;
        
        let xx, zz;
        if (param < 0) {
            xx = x1;
            zz = z1;
        } else if (param > 1) {
            xx = x2;
            zz = z2;
        } else {
            xx = x1 + param * C;
            zz = z1 + param * D;
        }
        
        const dx = px - xx;
        const dz = pz - zz;
        return Math.sqrt(dx * dx + dz * dz);
    }
    
    collectItem(itemBox) {
        try {
            itemBox.active = false;
            itemBox.mesh.visible = false;
            itemBox.respawnTime = 5; // Respawn after 5 seconds
            
            if (window.audioManager) {
                window.audioManager.playSound('item_get');
            }
            
            // For player, show item roulette animation
            if (this.isPlayer && window.game && window.game.uiManager && window.game.uiManager.showItemRoulette) {
                this.pendingItem = true;
                window.game.uiManager.showItemRoulette(() => {
                    // Get random item based on position after roulette
                    if (typeof getRandomItem === 'function') {
                        this.currentItem = getRandomItem(this.racePosition);
                    } else if (typeof window.getRandomItem === 'function') {
                        this.currentItem = window.getRandomItem(this.racePosition);
                    }
                    this.pendingItem = false;
                    
                    // Play item reveal sound
                    if (window.audioManager) {
                        window.audioManager.playSound('item_reveal');
                    }
                });
            } else {
                // For AI, just get item immediately
                if (typeof getRandomItem === 'function') {
                    this.currentItem = getRandomItem(this.racePosition);
                } else if (typeof window.getRandomItem === 'function') {
                    this.currentItem = window.getRandomItem(this.racePosition);
                } else {
                    console.error('getRandomItem function not found');
                    return;
                }
            }
        } catch (e) {
            console.error('Error in collectItem:', e);
        }
    }
    
    useItem(game) {
        if (!this.currentItem) return;

        const item = this.currentItem;
        console.log('[DEBUG] useItem called. currentItem.id:', item.id, 'emoji:', item.emoji);
        this.currentItem = null;
        if (window.audioManager) {
            window.audioManager.playSound('item_use');
        }
        // Item effects handled by game's item manager
        if (game && game.itemManager) {
            game.itemManager.useItem(this, item);
        }
    }
    
    updateRaceProgress(track) {
        // Calculate total progress (lap + checkpoint progress)
        const trackProgress = track.getTrackProgress(this.position.x, this.position.z);
        
        // Check for wrong way
        const trackDirection = track.getTrackDirection(this.position.x, this.position.z);
        const angleDiff = Utils.normalizeAngle(this.rotation - trackDirection);
        this.wrongWay = Math.abs(angleDiff) > Math.PI / 2 && this.speed > 10;
        
        // Update checkpoint
        const numCheckpoints = track.checkpoints.length;
        const newCheckpoint = Math.floor(trackProgress * numCheckpoints);
        
        // Lap detection - フィニッシュラインをトラックから取得（動的）
        const finishLine = track.finishLine;
        const finishX = finishLine ? finishLine.position.x : 0;
        const finishZ = finishLine ? finishLine.position.z : -200;
        const finishDirection = finishLine ? finishLine.direction : 'x';
        const finishAngle = finishLine ? finishLine.angle : 0;
        
        // フィニッシュラインからの距離を計算
        const distToFinishX = Math.abs(this.position.x - finishX);
        const distToFinishZ = Math.abs(this.position.z - finishZ);
        
        // フィニッシュラインの向きに応じて「近い」の判定を変える
        // direction='x'の場合: Z座標が近ければOK（X座標は通過判定で使う）
        // direction='z'の場合: X座標が近ければOK（Z座標は通過判定で使う）
        let nearFinishLine;
        if (finishDirection === 'x') {
            // フィニッシュラインがX軸に平行 → Z座標で判定、Xは広めに許容
            nearFinishLine = distToFinishZ < 40;
        } else if (finishDirection === 'z') {
            // フィニッシュラインがZ軸に平行 → X座標で判定、Zは広めに許容
            nearFinishLine = distToFinishX < 40;
        } else {
            // デフォルト: 両方チェック
            nearFinishLine = distToFinishZ < 40 && distToFinishX < 80;
        }
        
        // Initialize lastX on first update to prevent false lap count at start
        if (this.lastX === undefined) {
            this.lastX = this.position.x;
            this.lastZ = this.position.z;
        } else {
            // 前回位置と現在位置でフィニッシュラインを通過したか
            // スタート直後の5秒間はラップを誤検出しない
            const timeSinceRaceStart = (performance.now() - this.raceStartTime) / 1000;
            const canCountLap = timeSinceRaceStart > 5;  // 5秒経過後からラップを計数
            
            if (nearFinishLine && !this.wrongWay && canCountLap) {
                // フィニッシュラインの向きに応じて通過判定
                let crossedFinish = false;
                
                if (finishDirection === 'x' || Math.abs(finishAngle) < 0.3) {
                    // X軸に平行なフィニッシュライン: X座標が負から正に変わった = 東向きに通過
                    crossedFinish = (this.lastX < finishX) && (this.position.x >= finishX);
                } else if (finishDirection === 'z') {
                    // Z軸に平行なフィニッシュライン: Z座標が変わった
                    crossedFinish = (this.lastZ < finishZ) && (this.position.z >= finishZ);
                } else {
                    // その他の角度: X=0を基準に通過判定
                    crossedFinish = (this.lastX < 0) && (this.position.x >= 0);
                }
                
                if (crossedFinish) {
                    // チェックポイントを十分通過しているか確認（ショートカット防止）
                    // チェックポイント数の70%以上を通過していること
                    const requiredCheckpoints = Math.max(3, Math.floor(numCheckpoints * 0.7));
                    const checkpointBeforeReset = this.lastCheckpoint;
                    console.log('[LAP DEBUG] crossedFinish! lastCP:', this.lastCheckpoint, 'required:', requiredCheckpoints, 'numCP:', numCheckpoints, 'isPlayer:', this.isPlayer);
                    if (this.lastCheckpoint >= requiredCheckpoints) {
                        this.lap++;
                        this.lastCheckpoint = 0;
                        
                        if (window.audioManager) {
                            window.audioManager.playSound('lap_complete');
                        }
                        console.log('[LAP COMPLETED] Lap:', this.lap, 'Checkpoint was:', checkpointBeforeReset, 'isPlayer:', this.isPlayer);
                    } else {
                        console.log('[LAP REJECTED] Not enough checkpoints. lastCP:', this.lastCheckpoint, 'required:', requiredCheckpoints);
                    }
                }
            }
            
            this.lastX = this.position.x;
            this.lastZ = this.position.z;
        }
        
        // Update last checkpoint (prevent going backwards)
        if (newCheckpoint > this.lastCheckpoint || 
            (this.lastCheckpoint > numCheckpoints - 2 && newCheckpoint <= 1)) {
            this.lastCheckpoint = newCheckpoint;
        }
        
        this.checkpoint = newCheckpoint;
        this.totalProgress = this.lap + trackProgress;
    }
    
    handleSpinOut(deltaTime) {
        // Spin the kart
        this.rotation += 15 * deltaTime;
        this.speed *= 0.95;
        
        this.updateMeshPosition();
        this.mesh.rotation.z = Math.sin(this.spinOutTimer * 10) * 0.3;
        
        // スピンアウト終了時に元の向きに戻す
        if (this.spinOutTimer <= 0.1) {
            this.rotation = this.preSpinRotation;
            this.mesh.rotation.z = 0;
            this.updateMeshPosition();
        }
    }
    
    spinOut() {
        console.log('spinOut呼び出し:', this.isPlayer ? 'プレイヤー' : 'AI', 
            'invincibility:', this.invincibilityTimer, 
            'shield:', this.hasShield,
            'alreadySpunOut:', this.isSpunOut);
        
        if (this.invincibilityTimer > 0 || this.hasShield) {
            if (this.hasShield) {
                this.hasShield = false;
                this.shieldMesh.material.opacity = 0;
                if (window.audioManager) {
                    window.audioManager.playSound('shield_hit');
                }
            }
            console.log('spinOut防御された');
            return;
        }
        
        console.log('spinOut実行！');
        this.isSpunOut = true;
        this.spinOutTimer = 1.5;
        // スピンアウト開始時の向きを保存
        this.preSpinRotation = this.rotation;
        this.speed *= 0.3;
        this.invincibilityTimer = 2;
        
        if (window.audioManager) {
            window.audioManager.playSound('spin_out');
        }
    }
    
    activateShield() {
        this.hasShield = true;
        this.shieldTimer = 8;  // スターと同じ8秒間
        this.shieldMesh.material.opacity = 0.4;
        
        if (window.audioManager) {
            window.audioManager.playSound('shield_up');
        }
    }
    
    shrink(duration = 5) {
        if (this.invincibilityTimer > 0) return;
        
        this.isShrunken = true;
        this.shrinkTimer = duration;
        this.maxSpeed *= 0.7;
    }
    
    freeze(duration = 3) {
        if (this.invincibilityTimer > 0 || this.hasShield) return;
        
        this.isFrozen = true;
        this.freezeTimer = duration;
    }
    
    // Check collision with another kart
    checkCollision(otherKart) {
        const dist = this.position.distanceTo(otherKart.position);
        const minDist = this.collisionRadius + otherKart.collisionRadius;
        
        return dist < minDist;
    }
    
    // Handle collision response
    handleCollision(otherKart) {
        const pushDirection = new THREE.Vector3()
            .subVectors(this.position, otherKart.position)
            .normalize();
        
        // Push both karts apart
        const pushStrength = 0.5;
        this.position.add(pushDirection.clone().multiplyScalar(pushStrength));
        otherKart.position.add(pushDirection.clone().multiplyScalar(-pushStrength));
        
        // Reduce speeds
        this.speed *= 0.9;
        otherKart.speed *= 0.9;
        
        if (window.audioManager && Math.random() < 0.3) {
            window.audioManager.playSound('collision');
        }
    }
    
    // Get data for minimap
    getMinimapData() {
        return {
            x: this.position.x,
            z: this.position.z,
            rotation: this.rotation,
            color: this.colorData.primary,
            isPlayer: this.isPlayer
        };
    }
}

window.Kart = Kart;
