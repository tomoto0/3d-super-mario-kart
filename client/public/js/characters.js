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
            shell: 0x228b22      // 緑
        }
        // ... rest of character definitions (truncated for brevity)
        // Full character data will be available in repository
    }
    // ... more characters (truncated for brevity)
};

// Character selection order
const CharacterOrder = [
    'mario', 'luigi', 'peach', 'toad', 'yoshi', 'bowser', 'donkeyKong', 'wario'
];

// Racer names for display
const RacerNames = [
    'マリオ', 'ルイージ', 'ピーチ', 'キノピオ', 'ヨッシー', 'クッパ', 'ドンキー', 'ワリオ'
];

// Legacy kart colors (fallback)
const KartColors = [
    { primary: 0xed1c24, secondary: 0x2b5caa, accent: 0xffd700, skin: 0xffc8a8 }, // Mario
    { primary: 0x00a651, secondary: 0x2b5caa, accent: 0xffd700, skin: 0xffc8a8 }, // Luigi
    { primary: 0xffb6c1, secondary: 0xffd700, accent: 0xff69b4, skin: 0xffeedd }, // Peach
    { primary: 0xffffff, secondary: 0xff0000, accent: 0x0066cc, skin: 0xffeedd }, // Toad
    { primary: 0x00cc00, secondary: 0xff6347, accent: 0xff0000, skin: 0xffffff }, // Yoshi
    { primary: 0xe8a317, secondary: 0x228b22, accent: 0xff4500, skin: 0xf5deb3 }, // Bowser
    { primary: 0x8b4513, secondary: 0xffff00, accent: 0xff0000, skin: 0xd2691e }, // DK
    { primary: 0xffd700, secondary: 0x800080, accent: 0x0000ff, skin: 0xffc8a8 }  // Wario
];

// Export for module usage
if (typeof window !== 'undefined') {
    window.MarioCharacters = MarioCharacters;
    window.CharacterOrder = CharacterOrder;
    window.RacerNames = RacerNames;
    window.KartColors = KartColors;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MarioCharacters, CharacterOrder, RacerNames, KartColors };
}