/**
 * ============================================
 * VictoryScene.js - Pantalla de victoria
 * ============================================
 * Se muestra cuando el jugador gana el match.
 * Celebración con partículas doradas, score,
 * y opciones de siguiente pelea o menú.
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, SCENES } from '../config/gameConfig.js';
import { getCharacterById } from '../config/characterData.js';
import Button from '../ui/Button.js';
import AudioManager from '../managers/AudioManager.js';
import StorageManager from '../managers/StorageManager.js';

export default class VictoryScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.VICTORY });
    }

    init(data) {
        this.finalScore = data.score || 0;
        this.isNewHighScore = data.isNewHighScore || false;
        this.rounds = data.rounds || 0;
        this.characterId = data.character || 'programmer';
        this.p1Wins = data.p1Wins || 0;
        this.p2Wins = data.p2Wins || 0;
    }

    create() {
        const charData = getCharacterById(this.characterId);
        
        // Audio
        this.audioManager = new AudioManager(this);
        this.audioManager.init();
        
        // ==========================================
        // FONDO
        // ==========================================
        const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'victory_screen');
        bg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
        bg.setAlpha(0.6);
        
        const overlay = this.add.rectangle(
            GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.3
        );
        
        // ==========================================
        // PARTÍCULAS DE CELEBRACIÓN
        // ==========================================
        this._createCelebrationParticles();
        
        // ==========================================
        // TÍTULO VICTORY
        // ==========================================
        const titleY = 80;
        
        // Sombra dorada
        this.add.text(GAME_WIDTH / 2 + 2, titleY + 2, 'VICTORY!', {
            fontFamily: 'Orbitron, monospace',
            fontSize: '56px',
            color: '#cc9900',
            fontStyle: 'bold',
        }).setOrigin(0.5).setAlpha(0.5);
        
        // Texto principal
        const title = this.add.text(GAME_WIDTH / 2, titleY, 'VICTORY!', {
            fontFamily: 'Orbitron, monospace',
            fontSize: '56px',
            color: COLORS.TEXT_GOLD,
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5);
        
        // Brillo del título
        this.tweens.add({
            targets: title,
            alpha: 0.8,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
        
        // ==========================================
        // PERSONAJE GANADOR
        // ==========================================
        const charImg = this.add.image(GAME_WIDTH / 2, 210, charData.portraitKey || charData.imageKey);
        charImg.setDisplaySize(150, 170);
        
        // Animación de victoria (saltar)
        this.tweens.add({
            targets: charImg,
            y: 195,
            scaleX: charImg.scaleX * 1.05,
            scaleY: charImg.scaleY * 1.05,
            duration: 400,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeOut',
        });
        
        // Nombre del personaje
        this.add.text(GAME_WIDTH / 2, 285, charData.name, {
            fontFamily: 'Orbitron, monospace',
            fontSize: '18px',
            color: `#${charData.tint.toString(16).padStart(6, '0')}`,
            fontStyle: 'bold',
        }).setOrigin(0.5);
        
        // ==========================================
        // RESULTADOS
        // ==========================================
        this.add.text(GAME_WIDTH / 2, 315, `${this.p1Wins} - ${this.p2Wins}`, {
            fontFamily: 'Orbitron, monospace',
            fontSize: '22px',
            color: COLORS.TEXT_WHITE,
        }).setOrigin(0.5);
        
        this.add.text(GAME_WIDTH / 2, 345, `SCORE: ${this.finalScore}`, {
            fontFamily: 'Orbitron, monospace',
            fontSize: '20px',
            color: COLORS.TEXT_CYAN,
        }).setOrigin(0.5);
        
        // High Score
        const highScore = StorageManager.getHighScore();
        this.add.text(GAME_WIDTH / 2, 375, `HIGH SCORE: ${highScore}`, {
            fontFamily: 'Orbitron, monospace',
            fontSize: '14px',
            color: COLORS.TEXT_GOLD,
        }).setOrigin(0.5);
        
        // Nuevo récord
        if (this.isNewHighScore) {
            const badge = this.add.text(GAME_WIDTH / 2, 400, '🏆 ¡NUEVO RÉCORD! 🏆', {
                fontFamily: 'Orbitron, monospace',
                fontSize: '16px',
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
        
        // ==========================================
        // BOTONES
        // ==========================================
        new Button(this, GAME_WIDTH / 2, 450, '⚔  SIGUIENTE PELEA', () => {
            this.cameras.main.fadeOut(400, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start(SCENES.FIGHT, { playerCharacter: this.characterId });
            });
        }, { width: 280, height: 48, fontSize: '18px', bgColor: 0x6c2bd9 });
        
        new Button(this, GAME_WIDTH / 2, 505, '🏠  MENÚ PRINCIPAL', () => {
            this.cameras.main.fadeOut(400, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start(SCENES.MENU);
            });
        }, { width: 280, height: 48, fontSize: '16px', bgColor: 0x636e72 });
        
        // ==========================================
        // FADE IN + SONIDO
        // ==========================================
        this.cameras.main.fadeIn(500, 0, 0, 0);
        this.audioManager.playSFX('sfx_victory');
    }

    /**
     * Crear partículas doradas de celebración
     */
    _createCelebrationParticles() {
        const colors = [0xffd700, 0xffaa00, 0x00e5ff, 0xff3366, 0x6c2bd9];
        
        // Confeti cayendo
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * GAME_WIDTH;
            const y = Math.random() * -200;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = 3 + Math.random() * 5;
            
            const particle = this.add.rectangle(x, y, size, size * 1.5, color);
            particle.setAlpha(0.7);
            particle.setDepth(1);
            
            this.tweens.add({
                targets: particle,
                y: GAME_HEIGHT + 50,
                x: x + (Math.random() - 0.5) * 200,
                angle: 360 * (Math.random() > 0.5 ? 1 : -1),
                duration: 3000 + Math.random() * 4000,
                repeat: -1,
                delay: Math.random() * 2000,
                onRepeat: () => {
                    particle.y = -20;
                    particle.x = Math.random() * GAME_WIDTH;
                },
            });
        }
        
        // Estrellas brillantes
        for (let i = 0; i < 8; i++) {
            const star = this.add.text(
                Math.random() * GAME_WIDTH,
                Math.random() * GAME_HEIGHT,
                '✦', {
                fontSize: `${12 + Math.random() * 16}px`,
                color: '#ffd700',
            }).setAlpha(0);
            
            this.tweens.add({
                targets: star,
                alpha: 0.8,
                scaleX: 1.5,
                scaleY: 1.5,
                duration: 600,
                yoyo: true,
                repeat: -1,
                delay: Math.random() * 2000,
            });
        }
    }
}
