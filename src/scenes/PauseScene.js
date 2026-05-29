/**
 * ============================================
 * PauseScene.js - Escena de pausa (overlay)
 * ============================================
 * Se lanza como overlay sobre FightScene.
 * Muestra opciones de Continuar, Reiniciar y
 * volver al Menú Principal. Incluye control de mute.
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, SCENES } from '../config/gameConfig.js';
import Button from '../ui/Button.js';
import AudioManager from '../managers/AudioManager.js';

export default class PauseScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.PAUSE });
    }

    create() {
        // Audio para esta escena
        this.audioManager = new AudioManager(this);
        this.audioManager.init();
        
        // ==========================================
        // OVERLAY OSCURO
        // ==========================================
        const overlay = this.add.rectangle(
            GAME_WIDTH / 2, GAME_HEIGHT / 2,
            GAME_WIDTH, GAME_HEIGHT,
            0x000000, 0.7
        ).setInteractive(); // Bloquear clics al fondo
        
        // ==========================================
        // PANEL DE PAUSA
        // ==========================================
        const panelW = 350;
        const panelH = 350;
        const panel = this.add.graphics();
        
        // Fondo del panel con glassmorphism
        panel.fillStyle(0x1a1a3e, 0.9);
        panel.fillRoundedRect(GAME_WIDTH/2 - panelW/2, GAME_HEIGHT/2 - panelH/2, panelW, panelH, 20);
        
        // Borde neón
        panel.lineStyle(2, COLORS.SECONDARY, 0.6);
        panel.strokeRoundedRect(GAME_WIDTH/2 - panelW/2, GAME_HEIGHT/2 - panelH/2, panelW, panelH, 20);
        
        // Glow exterior
        panel.lineStyle(4, COLORS.SECONDARY, 0.1);
        panel.strokeRoundedRect(GAME_WIDTH/2 - panelW/2 - 4, GAME_HEIGHT/2 - panelH/2 - 4, panelW + 8, panelH + 8, 22);
        
        // ==========================================
        // TÍTULO
        // ==========================================
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 130, '⏸ PAUSA', {
            fontFamily: 'Orbitron, monospace',
            fontSize: '32px',
            color: COLORS.TEXT_CYAN,
            fontStyle: 'bold',
        }).setOrigin(0.5);
        
        // Línea decorativa
        const decLine = this.add.graphics();
        decLine.lineStyle(1, COLORS.SECONDARY, 0.3);
        decLine.lineBetween(GAME_WIDTH/2 - 120, GAME_HEIGHT/2 - 95, GAME_WIDTH/2 + 120, GAME_HEIGHT/2 - 95);
        
        // ==========================================
        // BOTONES
        // ==========================================
        const btnY = GAME_HEIGHT / 2 - 40;
        const btnSpacing = 60;
        
        // Continuar
        new Button(this, GAME_WIDTH / 2, btnY, '▶  CONTINUAR', () => {
            this._resume();
        }, { width: 260, height: 48, fontSize: '18px', bgColor: 0x00b894 });
        
        // Reiniciar
        new Button(this, GAME_WIDTH / 2, btnY + btnSpacing, '🔄  REINICIAR', () => {
            this.scene.stop(SCENES.FIGHT);
            this.scene.start(SCENES.CHARACTER_SELECT);
        }, { width: 260, height: 48, fontSize: '18px', bgColor: 0xe17055 });
        
        // Menú Principal
        new Button(this, GAME_WIDTH / 2, btnY + btnSpacing * 2, '🏠  MENÚ PRINCIPAL', () => {
            this.scene.stop(SCENES.FIGHT);
            this.scene.start(SCENES.MENU);
        }, { width: 260, height: 48, fontSize: '18px', bgColor: 0x636e72 });
        
        // ==========================================
        // CONTROL DE AUDIO
        // ==========================================
        const isMuted = this.audioManager.isMuted();
        const muteText = this.add.text(
            GAME_WIDTH / 2, GAME_HEIGHT / 2 + 140,
            `Audio: ${isMuted ? '🔇 OFF' : '🔊 ON'}`,
            {
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: '16px',
                color: '#aaaaaa',
            }
        ).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        muteText.on('pointerdown', () => {
            const muted = this.audioManager.toggleMute();
            muteText.setText(`Audio: ${muted ? '🔇 OFF' : '🔊 ON'}`);
        });
        
        // ==========================================
        // ANIMACIÓN DE ENTRADA
        // ==========================================
        overlay.setAlpha(0);
        this.tweens.add({
            targets: overlay,
            alpha: 0.7,
            duration: 200,
        });
    }

    /**
     * Reanudar el juego
     */
    _resume() {
        // Obtener referencia a FightScene y reanudar
        const fightScene = this.scene.get(SCENES.FIGHT);
        if (fightScene && fightScene.resumeGame) {
            fightScene.resumeGame();
        }
        
        this.scene.resume(SCENES.FIGHT);
        this.scene.stop();
    }
}
