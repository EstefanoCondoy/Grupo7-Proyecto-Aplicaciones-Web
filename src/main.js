/**
 * ============================================
 * main.js - Punto de entrada del juego
 * ============================================
 * Mortal Systems: EPN Edition
 * Juego de pelea 2D con Phaser.js
 * 
 * Configura Phaser con Arcade Physics, Scale Manager
 * para responsive design, y registra todas las escenas.
 * 
 * Autor: Estudiante EPN
 * Asignatura: Aplicaciones Web
 * Tecnología: Phaser.js 3 + Vite + JavaScript
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PHYSICS, COLORS, DEBUG_HITBOXES } from './config/gameConfig.js';

// Importar todas las escenas
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import CharacterSelectScene from './scenes/CharacterSelectScene.js';
import FightScene from './scenes/FightScene.js';
import PauseScene from './scenes/PauseScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import VictoryScene from './scenes/VictoryScene.js';

// Importar estilos
import './styles/index.css';

/**
 * Configuración principal de Phaser
 * Define el tipo de renderizado, dimensiones, física,
 * escenas y opciones de escalado responsive.
 */
const config = {
    // Tipo de renderizado (WebGL con fallback a Canvas)
    type: Phaser.AUTO,
    
    // Dimensiones base del juego (16:9)
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    
    // Contenedor HTML
    parent: 'game-container',
    
    // Color de fondo
    backgroundColor: COLORS.DARK_BG,
    
    // ==========================================
    // CONFIGURACIÓN DE FÍSICA
    // ==========================================
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: PHYSICS.GRAVITY },
            debug: DEBUG_HITBOXES,
        },
    },
    
    // ==========================================
    // CONFIGURACIÓN DE ESCALADO (RESPONSIVE)
    // ==========================================
    scale: {
        mode: Phaser.Scale.FIT,         // Escalar para ajustar
        autoCenter: Phaser.Scale.CENTER_BOTH, // Centrar en ambos ejes
        min: {
            width: 480,
            height: 270,
        },
        max: {
            width: 1920,
            height: 1080,
        },
    },
    
    // ==========================================
    // CONFIGURACIÓN DE INPUT
    // ==========================================
    input: {
        keyboard: true,
        mouse: true,
        touch: true,
        gamepad: false,
    },
    
    // ==========================================
    // CONFIGURACIÓN DE RENDERIZADO
    // ==========================================
    render: {
        pixelArt: false,        // No usar pixel art filtering
        antialias: true,        // Suavizado de bordes
        roundPixels: false,
    },
    
    // ==========================================
    // ESCENAS DEL JUEGO
    // ==========================================
    scene: [
        BootScene,            // Carga de assets
        MenuScene,            // Menú principal
        CharacterSelectScene, // Selección de personaje
        FightScene,           // Combate principal
        PauseScene,           // Overlay de pausa
        GameOverScene,        // Pantalla de derrota
        VictoryScene,         // Pantalla de victoria
    ],
    
    // ==========================================
    // CONFIGURACIÓN DE AUDIO
    // ==========================================
    audio: {
        disableWebAudio: false,
        noAudio: false,
    },
    
    // Configuración de FPS
    fps: {
        target: 60,
        min: 45,
        forceSetTimeOut: false,
    },
};

// ==========================================
// CREAR INSTANCIA DEL JUEGO
// ==========================================
const game = new Phaser.Game(config);

// Log de inicio
console.log('%c🎮 MORTAL SYSTEMS: EPN EDITION', 
    'color: #00e5ff; font-size: 20px; font-weight: bold; text-shadow: 2px 2px #6c2bd9;');
console.log('%cPhaser.js + Vite | Proyecto Final - Aplicaciones Web', 
    'color: #888; font-size: 12px;');

// Exportar para debugging
export default game;
