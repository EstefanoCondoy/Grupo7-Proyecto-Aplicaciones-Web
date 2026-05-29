/**
 * ============================================
 * GameOverScene.js - Pantalla de derrota
 * ============================================
 * Se muestra cuando el jugador pierde el match.
 * Muestra el score final, high score, y opciones
 * de reintentar o volver al menú.
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, SCENES } from '../config/gameConfig.js';
import Button from '../ui/Button.js';
import AudioManager from '../managers/AudioManager.js';
import StorageManager from '../managers/StorageManager.js';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.GAME_OVER });
    }

    init(data) {
        this.finalScore = data.score || 0;
        this.isNewHighScore = data.isNewHighScore || false;
        this.rounds = data.rounds || 0;
        this.characterId = data.character || 'programmer';
    }

    create() {
        // Audio
        this.audioManager = new AudioManager(this);
        this.audioManager.init();
        
        // ==========================================
        // FONDO
        // ==========================================
        const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'game_over_screen');
        bg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
        bg.setAlpha(0.6);
        
        const overlay = this.add.rectangle(
            GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.4
        );
        
        // ==========================================
        // TÍTULO GAME OVER con efecto glitch
        // ==========================================
        const titleY = 120;
        
        // Sombra roja desplazada (efecto glitch)
        this.add.text(GAME_WIDTH / 2 + 3, titleY + 2, 'GAME OVER', {
            fontFamily: 'Orbitron, monospace',
            fontSize: '52px',
            color: '#ff0000',
            fontStyle: 'bold',
        }).setOrigin(0.5).setAlpha(0.3);
        
        // Sombra cyan desplazada
        this.add.text(GAME_WIDTH / 2 - 3, titleY - 2, 'GAME OVER', {
            fontFamily: 'Orbitron, monospace',
            fontSize: '52px',
            color: '#00ffff',
            fontStyle: 'bold',
        }).setOrigin(0.5).setAlpha(0.3);
        
        // Texto principal
        const title = this.add.text(GAME_WIDTH / 2, titleY, 'GAME OVER', {
            fontFamily: 'Orbitron, monospace',
            fontSize: '52px',
            color: COLORS.TEXT_RED,
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5);
        
        // Efecto de parpadeo del título
        this.tweens.add({
            targets: title,
            alpha: 0.6,
            duration: 1000,
            yoyo: true,
            repeat: -1,
        });
        
        // ==========================================
        // SCORE
        // ==========================================
        this.add.text(GAME_WIDTH / 2, 210, `SCORE: ${this.finalScore}`, {
            fontFamily: 'Orbitron, monospace',
            fontSize: '24px',
            color: COLORS.TEXT_WHITE,
        }).setOrigin(0.5);
        
        // High Score
        const highScore = StorageManager.getHighScore();
        this.add.text(GAME_WIDTH / 2, 245, `HIGH SCORE: ${highScore}`, {
            fontFamily: 'Orbitron, monospace',
            fontSize: '16px',
            color: COLORS.TEXT_GOLD,
        }).setOrigin(0.5);
        
        // New High Score badge
        if (this.isNewHighScore) {
            const badge = this.add.text(GAME_WIDTH / 2, 275, '🏆 ¡NUEVO RÉCORD!', {
                fontFamily: 'Orbitron, monospace',
                fontSize: '18px',
                color: COLORS.TEXT_GOLD,
                fontStyle: 'bold',
            }).setOrigin(0.5);
            
            this.tweens.add({
                targets: badge,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 500,
                yoyo: true,
                repeat: -1,
            });
        }
        
        // Rounds info
        this.add.text(GAME_WIDTH / 2, 305, `Rondas jugadas: ${this.rounds}`, {
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '16px',
            color: '#888888',
        }).setOrigin(0.5);
        
        // ==========================================
        // BOTONES
        // ==========================================
        new Button(this, GAME_WIDTH / 2, 380, '🔄  REINTENTAR', () => {
            this.cameras.main.fadeOut(400, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start(SCENES.FIGHT, { playerCharacter: this.characterId });
            });
        }, { width: 280, height: 50, fontSize: '20px', bgColor: 0xe17055 });
        
        new Button(this, GAME_WIDTH / 2, 445, '🏠  MENÚ PRINCIPAL', () => {
            this.cameras.main.fadeOut(400, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start(SCENES.MENU);
            });
        }, { width: 280, height: 50, fontSize: '18px', bgColor: 0x636e72 });
        
        // ==========================================
        // EFECTO VISUAL
        // ==========================================
        this.cameras.main.fadeIn(500, 0, 0, 0);
        
        // Sonido de derrota
        this.audioManager.playSFX('sfx_defeat');
    }
}
