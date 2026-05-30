/**
 * ============================================
 * BootScene.js - Carga de assets y pantalla de inicio
 * ============================================
 * Primera escena del juego. Muestra una barra de progreso
 * animada mientras precarga todas las imágenes, audio y
 * recursos del juego. Transiciona automáticamente a
 * MenuScene al completar la carga.
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, SCENES } from '../config/gameConfig.js';

// Importar imágenes como módulos (Vite)
import fighter1Img from '../assets/images/fighter1_programmer.png';
import fighter2Img from '../assets/images/fighter2_bug.png';
import fighter3Img from '../assets/images/fighter3_student.png';
import stageImg from '../assets/images/stage_computer_lab.png';
import menuBgImg from '../assets/images/menu_background.png';
import charSelectBgImg from '../assets/images/character_select_bg.png';
import gameOverImg from '../assets/images/game_over_screen.png';
import victoryImg from '../assets/images/victory_screen.png';
import effectsImg from '../assets/images/special_effects.png';

// Retratos de personajes (imágenes estáticas de presentación)
import fighter1Portrait from '../assets/images/fighter1_portrait.png';
import fighter2Portrait from '../assets/images/fighter2_portrait.png';
import fighter3Portrait from '../assets/images/fighter3_portrait.png';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.BOOT });
    }

    /**
     * Preload - Cargar todos los assets del juego
     */
    preload() {
        // ==========================================
        // BARRA DE PROGRESO
        // ==========================================
        this._createLoadingScreen();
        
        // ==========================================
        // CARGAR IMÁGENES
        // ==========================================
        
        // Personajes (1024x1024, 4 columnas x 2 filas -> 256x512)
        this.load.spritesheet('fighter1_programmer', fighter1Img, { frameWidth: 256, frameHeight: 512 });
        this.load.spritesheet('fighter2_bug', fighter2Img, { frameWidth: 256, frameHeight: 512 });
        this.load.spritesheet('fighter3_student', fighter3Img, { frameWidth: 256, frameHeight: 512 });
        
        // Escenarios
        this.load.image('stage_computer_lab', stageImg);
        
        // Fondos de UI
        this.load.image('menu_background', menuBgImg);
        this.load.image('character_select_bg', charSelectBgImg);
        this.load.image('game_over_screen', gameOverImg);
        this.load.image('victory_screen', victoryImg);
        
        // Efectos
        this.load.image('special_effects', effectsImg);
        
        // Retratos de personajes (para selección y victoria)
        this.load.image('fighter1_portrait', fighter1Portrait);
        this.load.image('fighter2_portrait', fighter2Portrait);
        this.load.image('fighter3_portrait', fighter3Portrait);
    }

    /**
     * Crear la pantalla de carga con barra de progreso
     */
    _createLoadingScreen() {
        const centerX = GAME_WIDTH / 2;
        const centerY = GAME_HEIGHT / 2;
        
        // Fondo
        this.cameras.main.setBackgroundColor(COLORS.DARK_BG);
        
        // Título del juego
        const titleText = this.add.text(centerX, centerY - 100, 'MORTAL SYSTEMS', {
            fontFamily: 'Orbitron, monospace',
            fontSize: '36px',
            color: COLORS.TEXT_CYAN,
            fontStyle: 'bold',
        }).setOrigin(0.5);
        
        const subtitleText = this.add.text(centerX, centerY - 60, 'EPN EDITION', {
            fontFamily: 'Orbitron, monospace',
            fontSize: '18px',
            color: COLORS.TEXT_GOLD,
        }).setOrigin(0.5);
        
        // Texto de carga
        const loadingText = this.add.text(centerX, centerY + 10, 'CARGANDO...', {
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '16px',
            color: '#ffffff',
        }).setOrigin(0.5);
        
        // Barra de progreso - fondo
        const barWidth = 400;
        const barHeight = 20;
        const barBg = this.add.graphics();
        barBg.fillStyle(0x1a1a3e, 0.8);
        barBg.fillRoundedRect(centerX - barWidth/2, centerY + 40, barWidth, barHeight, 10);
        barBg.lineStyle(2, COLORS.SECONDARY, 0.5);
        barBg.strokeRoundedRect(centerX - barWidth/2, centerY + 40, barWidth, barHeight, 10);
        
        // Barra de progreso - relleno
        const progressBar = this.add.graphics();
        
        // Texto de porcentaje
        const percentText = this.add.text(centerX, centerY + 50, '0%', {
            fontFamily: 'Orbitron, monospace',
            fontSize: '12px',
            color: '#ffffff',
        }).setOrigin(0.5);
        
        // ==========================================
        // EVENTOS DE CARGA
        // ==========================================
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(COLORS.SECONDARY, 1);
            progressBar.fillRoundedRect(
                centerX - barWidth/2 + 2, 
                centerY + 42, 
                (barWidth - 4) * value, 
                barHeight - 4, 
                8
            );
            // Brillo
            progressBar.fillStyle(0xffffff, 0.2);
            progressBar.fillRoundedRect(
                centerX - barWidth/2 + 2, 
                centerY + 42, 
                (barWidth - 4) * value, 
                (barHeight - 4) / 3, 
                8
            );
            
            percentText.setText(Math.round(value * 100) + '%');
        });
        
        this.load.on('complete', () => {
            loadingText.setText('¡LISTO!');
            percentText.setText('100%');
            
            // Transición con delay
            this.time.delayedCall(500, () => {
                this.cameras.main.fadeOut(500, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start(SCENES.MENU);
                });
            });
        });
    }

    create() {
        // Se ejecuta después de preload, pero el transition
        // ya está manejado en el evento 'complete'
    }
}
