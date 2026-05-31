/**
 * ============================================
 * characterData.js - Datos de cada personaje
 * ============================================
 * Centraliza stats, presentacion, spritesheets, animaciones,
 * fisica visual e hitboxes de combate por personaje.
 */

const SPRITESHEET_SPACING = 8;
const HUMAN_FRAME_CONFIG = { frameWidth: 320, frameHeight: 512, spacing: SPRITESHEET_SPACING };
const BOSS_FRAME_CONFIG = { frameWidth: 256, frameHeight: 512, spacing: SPRITESHEET_SPACING };
const HUMAN_ANIMATIONS = {
    idle: [0, 1],
    walk: [1, 2, 1, 0],
    jump: [3],
    punch: [0, 4, 4, 0],
    kick: [0, 5, 5, 0],
    special: [0, 7, 7, 0],
    hurt: [6],
    death: [6],
    victory: [0, 7, 0],
};

/**
 * Array de datos de personajes disponibles.
 * Cada personaje tiene stats unicos que afectan el combate.
 */
export const CHARACTERS = [
    {
        id: 'programmer',
        name: 'El Programador',
        subtitle: 'Backend Developer',
        description: 'Un estudiante con su hoodie y laptop. Rapido y agil.',
        imageKey: 'fighter1_programmer',
        portraitKey: 'fighter1_portrait',

        frameConfig: HUMAN_FRAME_CONFIG,
        visual: {
            displayWidth: 263,
            displayHeight: 420,
            originX: 0.5,
            originY: 1,
            bodyWidth: 78,
            bodyHeight: 380,
            bodyOffsetX: 121,
            bodyOffsetY: 132,
        },
        animations: HUMAN_ANIMATIONS,
        hitboxes: {
            punch: { width: 95, height: 80, offsetX: 80, offsetY: -255, duration: 170, delay: 80 },
            kick: { width: 140, height: 76, offsetX: 100, offsetY: -145, duration: 220, delay: 110 },
        },
        projectile: { offsetX: 115, offsetY: -285 },

        tint: 0x6c5ce7,
        glowColor: 0x6c5ce7,

        statsDisplay: {
            speed: 80,
            power: 60,
            defense: 50,
            special: 75,
        },

        speedMod: 1.1,
        damageMod: 0.9,
        hpMod: 1.0,
        jumpMod: 1.05,
        scaleMod: 1.0,

        attacks: {
            punch: 'Keyboard Smash',
            kick: 'Compiler Kick',
            special: 'Stack Overflow',
        },

        specialColor: 0x6c5ce7,
    },
    {
        id: 'bug',
        name: 'El Bug',
        subtitle: 'Runtime Error',
        description: 'Una criatura virus nacida de codigo corrupto. Poderoso pero lento.',
        imageKey: 'fighter2_bug',
        portraitKey: 'fighter2_portrait',

        frameConfig: { frameWidth: 256, frameHeight: 256, spacing: SPRITESHEET_SPACING },
        visual: {
            displayWidth: 430,
            displayHeight: 430,
            originX: 0.5,
            originY: 1,
            bodyWidth: 150,
            bodyHeight: 245,
            bodyOffsetX: 53,
            bodyOffsetY: 11,
        },
        animations: {
            idle: [0, 1],
            walk: [1, 2, 1, 0],
            jump: [3],
            punch: [0, 8, 8, 0],
            kick: [0, 13, 13, 0],
            special: [0, 14, 14, 0],
            hurt: [11],
            death: [15],
            victory: [0, 1, 2, 1],
        },
        hitboxes: {
            punch: { width: 140, height: 88, offsetX: 115, offsetY: -165, duration: 185, delay: 90 },
            kick: { width: 155, height: 88, offsetX: 115, offsetY: -120, duration: 230, delay: 120 },
        },
        projectile: { offsetX: 170, offsetY: -225 },

        tint: 0xff3838,
        glowColor: 0xff3838,

        statsDisplay: {
            speed: 50,
            power: 78,
            defense: 64,
            special: 78,
        },

        speedMod: 0.85,
        damageMod: 1.1,
        hpMod: 1.05,
        jumpMod: 0.9,
        scaleMod: 1.0,

        attacks: {
            punch: 'Null Pointer',
            kick: 'Memory Leak',
            special: 'Segfault Blast',
        },

        specialColor: 0xff3838,
    },
    {
        id: 'engineer',
        name: 'La Ingeniera',
        subtitle: 'Full Stack Dev',
        description: 'Estudiante con bata de laboratorio. Equilibrada y tecnica.',
        imageKey: 'fighter3_student',
        portraitKey: 'fighter3_portrait',

        frameConfig: HUMAN_FRAME_CONFIG,
        visual: {
            displayWidth: 253,
            displayHeight: 405,
            originX: 0.5,
            originY: 1,
            bodyWidth: 82,
            bodyHeight: 370,
            bodyOffsetX: 119,
            bodyOffsetY: 142,
        },
        animations: HUMAN_ANIMATIONS,
        hitboxes: {
            punch: { width: 90, height: 80, offsetX: 76, offsetY: -245, duration: 170, delay: 80 },
            kick: { width: 136, height: 76, offsetX: 94, offsetY: -140, duration: 220, delay: 110 },
        },
        projectile: { offsetX: 110, offsetY: -270 },

        tint: 0x00cec9,
        glowColor: 0x00cec9,

        statsDisplay: {
            speed: 70,
            power: 70,
            defense: 65,
            special: 80,
        },

        speedMod: 1.0,
        damageMod: 1.05,
        hpMod: 1.05,
        jumpMod: 1.0,
        scaleMod: 1.0,

        attacks: {
            punch: 'Book Throw',
            kick: 'Debug Spin',
            special: 'Compile Error',
        },

        specialColor: 0x00cec9,
    },
    {
        id: 'boss',
        name: 'Boss',
        subtitle: 'Final Ransomware',
        description: 'El jefe final del sistema. Mas resistente y peligroso que el Bug comun.',
        imageKey: 'fighter2_boss',
        portraitKey: 'fighter2_boss_portrait',
        selectable: false,

        frameConfig: BOSS_FRAME_CONFIG,
        visual: {
            displayWidth: 300,
            displayHeight: 540,
            originX: 0.5,
            originY: 1,
            bodyWidth: 128,
            bodyHeight: 320,
            bodyOffsetX: 64,
            bodyOffsetY: 192,
        },
        animations: {
            idle: [0, 1],
            walk: [1, 0, 1],
            jump: [4],
            punch: [0, 5, 5, 0],
            kick: [0, 4, 4, 0],
            special: [0, 6, 7, 0],
            hurt: [8],
            death: [9],
            victory: [0, 2, 9, 2],
        },
        hitboxes: {
            punch: { width: 165, height: 95, offsetX: 140, offsetY: -250, duration: 210, delay: 85 },
            kick: { width: 205, height: 100, offsetX: 165, offsetY: -150, duration: 260, delay: 105 },
        },
        projectile: { offsetX: 160, offsetY: -185 },

        tint: 0xff1744,
        glowColor: 0xff1744,

        statsDisplay: {
            speed: 70,
            power: 96,
            defense: 94,
            special: 98,
        },

        speedMod: 1.02,
        damageMod: 1.45,
        hpMod: 1.75,
        jumpMod: 0.90,
        scaleMod: 1.0,

        attacks: {
            punch: 'Ransom Punch',
            kick: 'Firewall Kick',
            special: 'Ransomware Blast',
        },

        specialColor: 0xff1744,
    },
];

/**
 * Buscar un personaje por su ID.
 * @param {string} id - ID del personaje
 * @returns {object} Datos del personaje
 */
export function getCharacterById(id) {
    return CHARACTERS.find(c => c.id === id) || CHARACTERS[0];
}

/**
 * Buscar un personaje por su spritesheet.
 * @param {string} imageKey - Key de textura del personaje
 * @returns {object | undefined}
 */
export function getCharacterByImageKey(imageKey) {
    return CHARACTERS.find(c => c.imageKey === imageKey);
}

/**
 * Personajes seleccionables por el jugador.
 * @returns {object[]} Personajes jugables.
 */
export function getSelectableCharacters() {
    return CHARACTERS.filter(c => c.selectable !== false);
}
