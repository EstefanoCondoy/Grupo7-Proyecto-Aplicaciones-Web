/**
 * ============================================
 * HUD.js - Heads-Up Display del combate
 * ============================================
 * Muestra la información del combate en pantalla:
 * - Barras de vida de ambos luchadores
 * - Timer central (cuenta regresiva)
 * - Indicador de ronda
 * - Score del jugador
 * - Botón de pausa
 * - Indicador de rondas ganadas
 */

import { GAME_WIDTH, COLORS, COMBAT } from '../config/gameConfig.js';
import HealthBar from './HealthBar.js';

export default class HUD {
    /**
     * @param {Phaser.Scene} scene
     * @param {object} p1Data - Datos del jugador 1 { name, tint, maxHp }
     * @param {object} p2Data - Datos del jugador 2 { name, tint, maxHp }
     */
    constructor(scene, p1Data, p2Data) {
        this.scene = scene;
        this.p1Data = p1Data;
        this.p2Data = p2Data;
        this.timeLeft = COMBAT.ROUND_TIME;
        this.timerEvent = null;
        
        this._createElements();
    }

    /**
     * Crear todos los elementos del HUD
     */
    _createElements() {
        const barWidth = 320;
        const barHeight = 22;
        const barY = 25;
        const margin = 30;
        
        // ==========================================
        // FONDO SUPERIOR DEL HUD
        // ==========================================
        this.hudBg = this.scene.add.graphics();
        this.hudBg.fillStyle(0x000000, 0.5);
        this.hudBg.fillRect(0, 0, GAME_WIDTH, 65);
        this.hudBg.setDepth(99);
        
        // Línea decorativa inferior
        this.hudBg.lineStyle(2, COLORS.SECONDARY, 0.5);
        this.hudBg.lineBetween(0, 65, GAME_WIDTH, 65);
        
        // ==========================================
        // BARRAS DE VIDA
        // ==========================================
        
        // Jugador 1 (izquierda)
        this.p1HealthBar = new HealthBar(
            this.scene, margin, barY, barWidth, barHeight, 
            false, this.p1Data.name, this.p1Data.tint
        );
        
        // Jugador 2 (derecha, flipped)
        this.p2HealthBar = new HealthBar(
            this.scene, GAME_WIDTH - margin - barWidth, barY, barWidth, barHeight,
            true, this.p2Data.name, this.p2Data.tint
        );
        
        // ==========================================
        // TIMER CENTRAL
        // ==========================================
        this.timerBg = this.scene.add.graphics();
        this.timerBg.fillStyle(0x1a0a2e, 0.9);
        this.timerBg.fillRoundedRect(GAME_WIDTH / 2 - 30, 8, 60, 50, 8);
        this.timerBg.lineStyle(2, COLORS.SECONDARY, 0.8);
        this.timerBg.strokeRoundedRect(GAME_WIDTH / 2 - 30, 8, 60, 50, 8);
        this.timerBg.setDepth(105);
        
        this.timerText = this.scene.add.text(GAME_WIDTH / 2, 30, '99', {
            fontFamily: 'Orbitron, monospace',
            fontSize: '28px',
            color: COLORS.TEXT_WHITE,
            fontStyle: 'bold',
        }).setOrigin(0.5).setDepth(106);
        
        // ==========================================
        // INDICADOR DE RONDA
        // ==========================================
        this.roundText = this.scene.add.text(GAME_WIDTH / 2, 72, 'ROUND 1', {
            fontFamily: 'Orbitron, monospace',
            fontSize: '12px',
            color: COLORS.TEXT_CYAN,
            fontStyle: 'bold',
        }).setOrigin(0.5).setDepth(100);
        
        // ==========================================
        // INDICADORES DE RONDAS GANADAS (círculos)
        // ==========================================
        this.p1RoundIndicators = [];
        this.p2RoundIndicators = [];
        
        for (let i = 0; i < COMBAT.ROUNDS_TO_WIN; i++) {
            // P1 indicadores
            const p1Circle = this.scene.add.circle(
                margin + barWidth / 2 - 15 + i * 20, 55, 6, 0x333333
            ).setStrokeStyle(1, 0x666666).setDepth(100);
            this.p1RoundIndicators.push(p1Circle);
            
            // P2 indicadores
            const p2Circle = this.scene.add.circle(
                GAME_WIDTH - margin - barWidth / 2 - 15 + i * 20, 55, 6, 0x333333
            ).setStrokeStyle(1, 0x666666).setDepth(100);
            this.p2RoundIndicators.push(p2Circle);
        }
        
        // ==========================================
        // SCORE
        // ==========================================
        this.scoreText = this.scene.add.text(margin, 55, 'SCORE: 0', {
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '12px',
            color: COLORS.TEXT_GOLD,
        }).setDepth(100);
        
        // ==========================================
        // BOTÓN DE PAUSA
        // ==========================================
        this.pauseBtn = this.scene.add.text(GAME_WIDTH - 15, 72, '⏸', {
            fontSize: '20px',
            color: '#ffffff',
        }).setOrigin(1, 0.5).setDepth(110).setInteractive({ useHandCursor: true });
        
        this.pauseBtn.on('pointerover', () => {
            this.pauseBtn.setScale(1.2);
        });
        this.pauseBtn.on('pointerout', () => {
            this.pauseBtn.setScale(1);
        });
        this.pauseBtn.on('pointerdown', () => {
            this.scene.events.emit('pause-requested');
        });
        
        // ==========================================
        // MUTE BUTTON
        // ==========================================
        const isMuted = this.scene.audioManager ? this.scene.audioManager.isMuted() : false;
        this.muteBtn = this.scene.add.text(GAME_WIDTH - 45, 72, isMuted ? '🔇' : '🔊', {
            fontSize: '18px',
            color: '#ffffff',
        }).setOrigin(1, 0.5).setDepth(110).setInteractive({ useHandCursor: true });
        
        this.muteBtn.on('pointerdown', () => {
            if (this.scene.audioManager) {
                const muted = this.scene.audioManager.toggleMute();
                this.muteBtn.setText(muted ? '🔇' : '🔊');
            }
        });
    }

    // ==========================================
    // API PÚBLICA
    // ==========================================

    /**
     * Actualizar barras de vida
     * @param {number} p1Hp
     * @param {number} p1MaxHp
     * @param {number} p2Hp
     * @param {number} p2MaxHp
     */
    updateHealth(p1Hp, p1MaxHp, p2Hp, p2MaxHp) {
        this.p1HealthBar.setValue(p1Hp, p1MaxHp);
        this.p2HealthBar.setValue(p2Hp, p2MaxHp);
    }

    /**
     * Iniciar el temporizador de la ronda
     * @param {function} onTimeUp - Callback cuando el tiempo se agota
     */
    startTimer(onTimeUp) {
        this.timeLeft = COMBAT.ROUND_TIME;
        this.timerText.setText(this.timeLeft.toString());
        
        if (this.timerEvent) {
            this.timerEvent.destroy();
        }
        
        this.timerEvent = this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timeLeft--;
                this.timerText.setText(Math.max(0, this.timeLeft).toString());
                
                // Color rojo cuando queda poco tiempo
                if (this.timeLeft <= 10) {
                    this.timerText.setColor(COLORS.TEXT_RED);
                    // Pulso
                    this.scene.tweens.add({
                        targets: this.timerText,
                        scaleX: 1.2,
                        scaleY: 1.2,
                        duration: 200,
                        yoyo: true,
                    });
                }
                
                if (this.timeLeft <= 0) {
                    this.timerEvent.destroy();
                    if (onTimeUp) onTimeUp();
                }
            },
            repeat: COMBAT.ROUND_TIME - 1,
        });
    }

    /**
     * Pausar/reanudar el temporizador
     */
    pauseTimer() {
        if (this.timerEvent) {
            this.timerEvent.paused = true;
        }
    }

    resumeTimer() {
        if (this.timerEvent) {
            this.timerEvent.paused = false;
        }
    }

    /**
     * Actualizar indicador de ronda
     * @param {number} round - Número de ronda actual
     */
    setRound(round) {
        this.roundText.setText(`ROUND ${round}`);
        this.timerText.setColor(COLORS.TEXT_WHITE);
    }

    /**
     * Marcar una ronda ganada
     * @param {number} player - 1 o 2
     * @param {number} wins - Número de victorias
     */
    setRoundWin(player, wins) {
        const indicators = player === 1 ? this.p1RoundIndicators : this.p2RoundIndicators;
        const color = player === 1 ? COLORS.HEALTH_HIGH : COLORS.HEALTH_LOW;
        
        for (let i = 0; i < wins && i < indicators.length; i++) {
            indicators[i].setFillStyle(color);
            
            // Animación
            this.scene.tweens.add({
                targets: indicators[i],
                scaleX: 1.5,
                scaleY: 1.5,
                duration: 200,
                yoyo: true,
            });
        }
    }

    /**
     * Actualizar score
     * @param {number} score
     */
    updateScore(score) {
        this.scoreText.setText(`SCORE: ${score}`);
    }

    /**
     * Destruir todos los elementos del HUD
     */
    destroy() {
        if (this.timerEvent) this.timerEvent.destroy();
        this.p1HealthBar.destroy();
        this.p2HealthBar.destroy();
        this.hudBg.destroy();
        this.timerBg.destroy();
        this.timerText.destroy();
        this.roundText.destroy();
        this.scoreText.destroy();
        this.pauseBtn.destroy();
        this.muteBtn.destroy();
        this.p1RoundIndicators.forEach(c => c.destroy());
        this.p2RoundIndicators.forEach(c => c.destroy());
    }
}
