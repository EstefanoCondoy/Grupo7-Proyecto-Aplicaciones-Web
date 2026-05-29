/**
 * ============================================
 * MenuScene.js - Menú principal del juego
 * ============================================
 * Pantalla de inicio con el fondo animado, título
 * con efecto de glitch/neon, botones de navegación,
 * high score visible y botón de mute.
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, SCENES } from '../config/gameConfig.js';
import Button from '../ui/Button.js';
import AudioManager from '../managers/AudioManager.js';
import StorageManager from '../managers/StorageManager.js';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.MENU });
    }

    create() {
        // ==========================================
        // AUDIO MANAGER (inicializar aquí en menú)
        // ==========================================
        this.audioManager = new AudioManager(this);
        this.audioManager.init();
        
        // ==========================================
        // FONDO
        // ==========================================
        const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'menu_background');
        bg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
        bg.setAlpha(0.8);
        
        // Overlay oscuro para legibilidad
        const overlay = this.add.rectangle(
            GAME_WIDTH / 2, GAME_HEIGHT / 2, 
            GAME_WIDTH, GAME_HEIGHT, 
            0x000000, 0.4
        );
        
        // Partículas decorativas (código cayendo estilo matrix)
        this._createMatrixEffect();
        
        // ==========================================
        // TÍTULO
        // ==========================================
        const titleY = 110;
        
        // Sombra del título
        this.add.text(GAME_WIDTH / 2 + 3, titleY + 3, 'MORTAL SYSTEMS', {
            fontFamily: 'Orbitron, monospace',
            fontSize: '48px',
            color: '#000000',
            fontStyle: 'bold',
        }).setOrigin(0.5).setAlpha(0.5);
        
        // Título principal
        const title = this.add.text(GAME_WIDTH / 2, titleY, 'MORTAL SYSTEMS', {
            fontFamily: 'Orbitron, monospace',
            fontSize: '48px',
            color: COLORS.TEXT_CYAN,
            fontStyle: 'bold',
            stroke: '#1a0a2e',
            strokeThickness: 4,
        }).setOrigin(0.5);
        
        // Animación de brillo del título
        this.tweens.add({
            targets: title,
            alpha: 0.7,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
        
        // Subtítulo
        const subtitle = this.add.text(GAME_WIDTH / 2, titleY + 45, 'EPN EDITION', {
            fontFamily: 'Orbitron, monospace',
            fontSize: '20px',
            color: COLORS.TEXT_GOLD,
            letterSpacing: 8,
        }).setOrigin(0.5);
        
        // Línea decorativa
        const line = this.add.graphics();
        line.lineStyle(2, COLORS.SECONDARY, 0.5);
        line.lineBetween(GAME_WIDTH / 2 - 180, titleY + 70, GAME_WIDTH / 2 + 180, titleY + 70);
        
        // ==========================================
        // BOTONES DE MENÚ
        // ==========================================
        const btnStartY = 260;
        const btnSpacing = 65;
        
        // Botón JUGAR
        new Button(this, GAME_WIDTH / 2, btnStartY, '⚔  JUGAR', () => {
            this.cameras.main.fadeOut(400, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start(SCENES.CHARACTER_SELECT);
            });
        }, {
            width: 300,
            height: 55,
            fontSize: '22px',
            bgColor: 0x6c2bd9,
        });
        
        // Botón CONTROLES
        new Button(this, GAME_WIDTH / 2, btnStartY + btnSpacing, '🎮  CONTROLES', () => {
            this._showControls();
        }, {
            width: 300,
            height: 50,
            fontSize: '18px',
            bgColor: 0x2d3436,
        });
        
        // Botón CRÉDITOS
        new Button(this, GAME_WIDTH / 2, btnStartY + btnSpacing * 2, '📜  CRÉDITOS', () => {
            this._showCredits();
        }, {
            width: 300,
            height: 50,
            fontSize: '18px',
            bgColor: 0x2d3436,
        });
        
        // ==========================================
        // HIGH SCORE
        // ==========================================
        const highScore = StorageManager.getHighScore();
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 80, `🏆 HIGH SCORE: ${highScore}`, {
            fontFamily: 'Orbitron, monospace',
            fontSize: '16px',
            color: COLORS.TEXT_GOLD,
        }).setOrigin(0.5);
        
        // ==========================================
        // MUTE BUTTON
        // ==========================================
        const isMuted = this.audioManager.isMuted();
        const muteBtn = this.add.text(GAME_WIDTH - 40, 30, isMuted ? '🔇' : '🔊', {
            fontSize: '28px',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        muteBtn.on('pointerdown', () => {
            const muted = this.audioManager.toggleMute();
            muteBtn.setText(muted ? '🔇' : '🔊');
        });
        
        // ==========================================
        // INSTRUCCIONES DE PIE
        // ==========================================
        const footerText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 30, 
            'Proyecto Final - Aplicaciones Web - Phaser.js', {
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '12px',
            color: '#666666',
        }).setOrigin(0.5);
        
        // ==========================================
        // FADE IN
        // ==========================================
        this.cameras.main.fadeIn(500, 0, 0, 0);
        
        // Iniciar música
        this.audioManager.playMusic();
    }

    /**
     * Crear efecto de código cayendo estilo Matrix
     */
    _createMatrixEffect() {
        const chars = '01{}[]<>/;:=+-*&|~!@#$%^';
        
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * GAME_WIDTH;
            const char = chars[Math.floor(Math.random() * chars.length)];
            
            const text = this.add.text(x, -20, char, {
                fontFamily: 'monospace',
                fontSize: `${10 + Math.random() * 14}px`,
                color: '#00ff88',
            }).setAlpha(0.1 + Math.random() * 0.2);
            
            this.tweens.add({
                targets: text,
                y: GAME_HEIGHT + 20,
                duration: 3000 + Math.random() * 5000,
                repeat: -1,
                delay: Math.random() * 3000,
                onRepeat: () => {
                    text.x = Math.random() * GAME_WIDTH;
                    text.setText(chars[Math.floor(Math.random() * chars.length)]);
                },
            });
        }
    }

    /**
     * Mostrar panel de controles
     */
    _showControls() {
        // Overlay oscuro
        const overlay = this.add.rectangle(
            GAME_WIDTH / 2, GAME_HEIGHT / 2, 
            GAME_WIDTH, GAME_HEIGHT, 
            0x000000, 0.85
        ).setDepth(200).setInteractive();
        
        // Panel
        const panelW = 500;
        const panelH = 380;
        const panel = this.add.graphics().setDepth(201);
        panel.fillStyle(0x1a1a3e, 0.95);
        panel.fillRoundedRect(GAME_WIDTH/2 - panelW/2, GAME_HEIGHT/2 - panelH/2, panelW, panelH, 15);
        panel.lineStyle(2, COLORS.SECONDARY, 0.6);
        panel.strokeRoundedRect(GAME_WIDTH/2 - panelW/2, GAME_HEIGHT/2 - panelH/2, panelW, panelH, 15);
        
        // Título
        const titleCtrl = this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2 - panelH/2 + 30, '🎮 CONTROLES', {
            fontFamily: 'Orbitron, monospace',
            fontSize: '22px',
            color: COLORS.TEXT_CYAN,
            fontStyle: 'bold',
        }).setOrigin(0.5).setDepth(202);
        
        // Lista de controles
        const controls = [
            '─────── JUGADOR 1 ───────',
            'A / D         Mover izquierda / derecha',
            'W             Saltar',
            'J             Golpe rápido',
            'K             Patada fuerte',
            'L             Ataque especial',
            '',
            '─────── GENERAL ───────',
            'ESC           Pausar',
            '',
            '─────── MÓVIL ───────',
            'D-Pad         Mover y saltar',
            'Botones       Golpe, Patada, Especial',
        ];
        
        const controlsText = this.add.text(
            GAME_WIDTH/2, GAME_HEIGHT/2 - 20, 
            controls.join('\n'), {
            fontFamily: 'Rajdhani, monospace',
            fontSize: '14px',
            color: '#cccccc',
            lineSpacing: 6,
            align: 'center',
        }).setOrigin(0.5).setDepth(202);
        
        // Botón cerrar
        const closeBtn = this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2 + panelH/2 - 35, '[ CERRAR ]', {
            fontFamily: 'Orbitron, monospace',
            fontSize: '16px',
            color: COLORS.TEXT_CYAN,
        }).setOrigin(0.5).setDepth(202).setInteractive({ useHandCursor: true });
        
        closeBtn.on('pointerover', () => closeBtn.setColor(COLORS.TEXT_GOLD));
        closeBtn.on('pointerout', () => closeBtn.setColor(COLORS.TEXT_CYAN));
        closeBtn.on('pointerdown', () => {
            overlay.destroy();
            panel.destroy();
            titleCtrl.destroy();
            controlsText.destroy();
            closeBtn.destroy();
        });
    }

    /**
     * Mostrar panel de créditos
     */
    _showCredits() {
        const overlay = this.add.rectangle(
            GAME_WIDTH / 2, GAME_HEIGHT / 2, 
            GAME_WIDTH, GAME_HEIGHT, 
            0x000000, 0.85
        ).setDepth(200).setInteractive();
        
        const panelW = 450;
        const panelH = 300;
        const panel = this.add.graphics().setDepth(201);
        panel.fillStyle(0x1a1a3e, 0.95);
        panel.fillRoundedRect(GAME_WIDTH/2 - panelW/2, GAME_HEIGHT/2 - panelH/2, panelW, panelH, 15);
        panel.lineStyle(2, COLORS.SECONDARY, 0.6);
        panel.strokeRoundedRect(GAME_WIDTH/2 - panelW/2, GAME_HEIGHT/2 - panelH/2, panelW, panelH, 15);
        
        const creditsTitle = this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2 - panelH/2 + 30, '📜 CRÉDITOS', {
            fontFamily: 'Orbitron, monospace',
            fontSize: '22px',
            color: COLORS.TEXT_GOLD,
            fontStyle: 'bold',
        }).setOrigin(0.5).setDepth(202);
        
        const credits = [
            'MORTAL SYSTEMS: EPN EDITION',
            '',
            'Desarrollado por:',
            'Estudiante EPN',
            '',
            'Tecnologías:',
            'Phaser.js 3 + Vite + JavaScript',
            '',
            'Asignatura:',
            'Aplicaciones Web',
            'Docente: Jaime Sayago-Heredia',
            '',
            '© 2026 - Proyecto Final',
        ];
        
        const creditsText = this.add.text(
            GAME_WIDTH/2, GAME_HEIGHT/2, 
            credits.join('\n'), {
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '14px',
            color: '#cccccc',
            lineSpacing: 4,
            align: 'center',
        }).setOrigin(0.5).setDepth(202);
        
        const closeBtn = this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2 + panelH/2 - 30, '[ CERRAR ]', {
            fontFamily: 'Orbitron, monospace',
            fontSize: '16px',
            color: COLORS.TEXT_CYAN,
        }).setOrigin(0.5).setDepth(202).setInteractive({ useHandCursor: true });
        
        closeBtn.on('pointerover', () => closeBtn.setColor(COLORS.TEXT_GOLD));
        closeBtn.on('pointerout', () => closeBtn.setColor(COLORS.TEXT_CYAN));
        closeBtn.on('pointerdown', () => {
            overlay.destroy();
            panel.destroy();
            creditsTitle.destroy();
            creditsText.destroy();
            closeBtn.destroy();
        });
    }
}
