/**
 * ============================================
 * gameConfig.js - Constantes globales del juego
 * ============================================
 * Define todas las constantes del juego: dimensiones, velocidades,
 * daños, colores y configuración de controles.
 */

export const GAME_WIDTH = 1024;
export const GAME_HEIGHT = 576;

// Colores del juego (tema cyberpunk/código)
export const COLORS = {
    // Fondos y UI
    PRIMARY: 0x6c2bd9,       // Púrpura principal
    SECONDARY: 0x00e5ff,     // Cyan neón
    ACCENT: 0xff3366,        // Rosa/rojo neón
    DARK_BG: 0x0a0a1a,       // Fondo oscuro
    PANEL_BG: 0x1a1a3e,      // Panel oscuro
    
    // Barras de vida
    HEALTH_HIGH: 0x00ff88,   // Verde salud alta
    HEALTH_MID: 0xffaa00,    // Amarillo salud media
    HEALTH_LOW: 0xff2244,    // Rojo salud baja
    HEALTH_BG: 0x1a1a2e,     // Fondo barra de vida
    
    // Texto
    TEXT_WHITE: '#ffffff',
    TEXT_GOLD: '#ffd700',
    TEXT_CYAN: '#00e5ff',
    TEXT_RED: '#ff3366',
    TEXT_GREEN: '#00ff88',
};

// Configuración de física
export const PHYSICS = {
    GRAVITY: 1200,
    GROUND_Y: 500,           // Posición Y del suelo
    WORLD_BOUNDS_X: 0,
    WORLD_BOUNDS_WIDTH: 1024,
    BOUNCE: 0.1,
};

// Configuración del luchador
export const FIGHTER = {
    SPEED: 250,              // Velocidad de movimiento
    JUMP_VELOCITY: -550,     // Velocidad de salto (negativo = arriba)
    MAX_HP: 100,             // Vida máxima
    
    // Daños de ataques
    PUNCH_DAMAGE: 8,         // Golpe rápido
    KICK_DAMAGE: 15,         // Patada fuerte
    SPECIAL_DAMAGE: 30,      // Ataque especial
    
    // Rangos de ataque (distancia en px para considerar "en rango")
    PUNCH_RANGE: 120,
    KICK_RANGE: 140,
    SPECIAL_RANGE: 300,      // Proyectil / rango largo
    
    // Cooldowns (ms)
    PUNCH_COOLDOWN: 300,
    KICK_COOLDOWN: 500,
    SPECIAL_COOLDOWN: 3000,
    HURT_DURATION: 400,      // Duración del estado de daño
    INVINCIBLE_DURATION: 500,// Invulnerabilidad post-golpe
    
    // Knockback
    KNOCKBACK_X: 200,
    KNOCKBACK_Y: -150,
    
    // Tamaño del cuerpo físico (basado en frame 256x512)
    BODY_WIDTH: 100,
    BODY_HEIGHT: 400,
    BODY_OFFSET_X: 78,
    BODY_OFFSET_Y: 112,
    
    // Tamaño visual del sprite base
    DISPLAY_WIDTH: 110,
    DISPLAY_HEIGHT: 220,
};

// Configuración del combate
export const COMBAT = {
    ROUNDS_TO_WIN: 2,        // Mejor de 3
    ROUND_TIME: 99,          // Segundos por ronda
    ROUND_START_DELAY: 2000, // Delay antes de empezar ronda
    KO_DELAY: 2000,          // Delay después de KO
    
    // Posiciones iniciales
    P1_START_X: 250,
    P2_START_X: 774,
    START_Y: 450,
};

// Configuración de IA
export const AI = {
    THINK_INTERVAL: 300,     // Cada cuántos ms la IA "piensa"
    APPROACH_DISTANCE: 250,  // Distancia para acercarse
    ATTACK_DISTANCE: 100,    // Distancia para atacar
    RETREAT_HP_THRESHOLD: 0.25, // % HP para retirarse
    ATTACK_PROBABILITY: 0.6, // Prob. de atacar cuando en rango
    BLOCK_PROBABILITY: 0.2,  // Prob. de bloquear
    SPECIAL_PROBABILITY: 0.15,// Prob. de usar especial
};

// Configuración de controles (teclas por defecto)
export const CONTROLS = {
    P1: {
        LEFT: 'A',
        RIGHT: 'D',
        JUMP: 'W',
        PUNCH: 'J',
        KICK: 'K',
        SPECIAL: 'L',
    },
    P2: {
        LEFT: 'LEFT',
        RIGHT: 'RIGHT',
        JUMP: 'UP',
        PUNCH: 'O',
        KICK: 'P',
        SPECIAL: 'I',
    },
    PAUSE: 'ESC',
};

// Configuración de audio
export const AUDIO = {
    MUSIC_VOLUME: 0.4,
    SFX_VOLUME: 0.7,
};

// Nombres de storage keys
export const STORAGE_KEYS = {
    HIGH_SCORE: 'mortalSystems_highScore',
    LEVEL: 'mortalSystems_level',
    AUDIO_CONFIG: 'mortalSystems_audioConfig',
    PROGRESS: 'mortalSystems_progress',
};

// Escenas
export const SCENES = {
    BOOT: 'BootScene',
    MENU: 'MenuScene',
    CHARACTER_SELECT: 'CharacterSelectScene',
    FIGHT: 'FightScene',
    PAUSE: 'PauseScene',
    GAME_OVER: 'GameOverScene',
    VICTORY: 'VictoryScene',
};
