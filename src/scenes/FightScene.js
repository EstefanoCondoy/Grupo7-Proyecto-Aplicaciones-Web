/**
 * ============================================
 * FightScene.js - Escena principal de combate
 * ============================================
 * Escena central del juego donde ocurre la pelea.
 * Gestiona: creación de luchadores, física, HUD,
 * sistema de rondas (best of 3), detección de golpes,
 * condiciones de victoria/derrota, y transiciones.
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, SCENES, COMBAT, PHYSICS, FIGHTER } from '../config/gameConfig.js';
import { getCharacterById, CHARACTERS } from '../config/characterData.js';
import PlayerFighter from '../objects/PlayerFighter.js';
import AIFighter from '../objects/AIFighter.js';
import InputManager from '../managers/InputManager.js';
import AudioManager from '../managers/AudioManager.js';
import CollisionManager from '../physics/CollisionManager.js';
import HUD from '../ui/HUD.js';
import TouchControls from '../ui/TouchControls.js';
import StorageManager from '../managers/StorageManager.js';

export default class FightScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.FIGHT });
    }

    /**
     * Recibir datos de la escena anterior
     */
    init(data) {
        this.playerCharacterId = data.playerCharacter || 'programmer';
        this.currentRound = 1;
        this.p1Wins = 0;
        this.p2Wins = 0;
        this.score = 0;
        this.roundActive = false;
        this.matchOver = false;
    }

    create() {
        // ==========================================
        // AUDIO
        // ==========================================
        this.audioManager = new AudioManager(this);
        this.audioManager.init();
        
        // ==========================================
        // ESCENARIO (FONDO)
        // ==========================================
        this._createStage();
        
        // ==========================================
        // FÍSICA: SUELO
        // ==========================================
        this.collisionManager = new CollisionManager(this);
        this.collisionManager.createGround(PHYSICS.GROUND_Y);
        
        // ==========================================
        // PERSONAJES
        // ==========================================
        this._createFighters();
        
        // ==========================================
        // COLISIONES Y OVERLAPS
        // ==========================================
        this._setupCollisions();
        
        // ==========================================
        // HUD
        // ==========================================
        this._createHUD();
        
        // ==========================================
        // CONTROLES TÁCTILES
        // ==========================================
        this.touchControls = new TouchControls(this, this.inputManager);
        
        // ==========================================
        // TECLA DE PAUSA (ESC)
        // ==========================================
        this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.pauseKey.on('down', () => {
            this._pauseGame();
        });
        
        // Evento de pausa desde HUD
        this.events.on('pause-requested', () => {
            this._pauseGame();
        });
        
        // ==========================================
        // INICIAR PRIMERA RONDA
        // ==========================================
        this.cameras.main.fadeIn(400, 0, 0, 0);
        this.time.delayedCall(600, () => {
            this._startRound();
        });
        
        // Iniciar música
        this.audioManager.playMusic('music_fight');
    }

    // ==========================================
    // CREACIÓN DEL ESCENARIO
    // ==========================================

    _createStage() {
        // Fondo del escenario
        const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'stage_computer_lab');
        bg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
        bg.setDepth(0);
        
        // Suelo visible (decorativo)
        const groundGfx = this.add.graphics();
        groundGfx.fillStyle(0x1a1a2e, 0.9);
        groundGfx.fillRect(0, PHYSICS.GROUND_Y - 5, GAME_WIDTH, GAME_HEIGHT - PHYSICS.GROUND_Y + 5);
        
        // Línea del suelo
        groundGfx.lineStyle(2, COLORS.SECONDARY, 0.4);
        groundGfx.lineBetween(0, PHYSICS.GROUND_Y - 5, GAME_WIDTH, PHYSICS.GROUND_Y - 5);
        
        // Reflejo sutil
        groundGfx.fillStyle(COLORS.SECONDARY, 0.05);
        groundGfx.fillRect(0, PHYSICS.GROUND_Y, GAME_WIDTH, 30);
        groundGfx.setDepth(1);
    }

    // ==========================================
    // CREACIÓN DE LUCHADORES
    // ==========================================

    _createFighters() {
        // Datos de los personajes
        const p1Data = getCharacterById(this.playerCharacterId);
        
        // Elegir enemigo aleatorio (diferente al jugador)
        const enemyOptions = CHARACTERS.filter(c => c.id !== this.playerCharacterId);
        const p2Data = enemyOptions[Math.floor(Math.random() * enemyOptions.length)];
        
        this.p1Data = p1Data;
        this.p2Data = p2Data;
        
        // Input Manager para el jugador
        this.inputManager = new InputManager(this, 1);
        
        // Crear Jugador 1 (humano)
        this.player1 = new PlayerFighter(
            this,
            COMBAT.P1_START_X, COMBAT.START_Y,
            p1Data.imageKey, p1Data,
            this.inputManager,
            true // Mira a la derecha
        );
        
        // Crear Jugador 2 (IA)
        this.player2 = new AIFighter(
            this,
            COMBAT.P2_START_X, COMBAT.START_Y,
            p2Data.imageKey, p2Data,
            false, // Mira a la izquierda
            2     // Dificultad media
        );
        
        // Asignar target a la IA
        this.player2.setTarget(this.player1);
    }

    // ==========================================
    // CONFIGURACIÓN DE COLISIONES
    // ==========================================

    _setupCollisions() {
        // Ambos luchadores colisionan con el suelo
        this.collisionManager.addGroundCollider(this.player1);
        this.collisionManager.addGroundCollider(this.player2);
        
        // Colisión entre luchadores (no se atraviesan)
        this.physics.add.collider(this.player1, this.player2);
    }

    // ==========================================
    // HUD
    // ==========================================

    _createHUD() {
        this.hud = new HUD(this, {
            name: this.p1Data.name,
            tint: this.p1Data.tint,
            maxHp: this.player1.maxHp,
        }, {
            name: this.p2Data.name,
            tint: this.p2Data.tint,
            maxHp: this.player2.maxHp,
        });
    }

    // ==========================================
    // SISTEMA DE RONDAS
    // ==========================================

    /**
     * Iniciar una nueva ronda
     */
    _startRound() {
        this.roundActive = false;
        this.matchOver = false;
        
        // Resetear luchadores
        this.player1.resetFighter(COMBAT.P1_START_X, COMBAT.START_Y);
        this.player2.resetFighter(COMBAT.P2_START_X, COMBAT.START_Y);
        this.player2.setTarget(this.player1);
        
        // Limpiar cooldowns
        this.collisionManager.clearCooldowns();
        
        // Actualizar HUD
        this.hud.setRound(this.currentRound);
        this.hud.updateHealth(
            this.player1.hp, this.player1.maxHp,
            this.player2.hp, this.player2.maxHp
        );
        
        // Anuncio de ronda
        this._showRoundAnnouncement(`ROUND ${this.currentRound}`, () => {
            this._showRoundAnnouncement('FIGHT!', () => {
                this.roundActive = true;
                this.hud.startTimer(() => this._onTimeUp());
            }, COLORS.ACCENT);
        }, COLORS.SECONDARY);
    }

    /**
     * Mostrar anuncio de ronda (texto grande en pantalla)
     */
    _showRoundAnnouncement(text, onComplete, color = 0x00e5ff) {
        const colorHex = `#${(typeof color === 'number' ? color : 0x00e5ff).toString(16).padStart(6, '0')}`;
        
        const announcement = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, text, {
            fontFamily: 'Orbitron, monospace',
            fontSize: '56px',
            color: colorHex,
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6,
        }).setOrigin(0.5).setDepth(300).setAlpha(0).setScale(0.3);
        
        // Animación de entrada
        this.tweens.add({
            targets: announcement,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 300,
            ease: 'Back.easeOut',
            onComplete: () => {
                // Mantener visible y luego desvanecer
                this.time.delayedCall(600, () => {
                    this.tweens.add({
                        targets: announcement,
                        alpha: 0,
                        scaleX: 2,
                        scaleY: 2,
                        duration: 300,
                        onComplete: () => {
                            announcement.destroy();
                            if (onComplete) onComplete();
                        }
                    });
                });
            }
        });
        
        // Sonido
        this.audioManager.playSFX('sfx_round_start');
    }

    // ==========================================
    // MANEJO DE GOLPES
    // ==========================================

    /**
     * Callback cuando un golpe conecta
     */
    _onHit(attacker, defender, damage) {
        if (!this.roundActive || this.matchOver) return;
        
        // Aplicar daño
        const died = defender.takeDamage(damage, attacker.x);
        
        // Actualizar HUD
        this.hud.updateHealth(
            this.player1.hp, this.player1.maxHp,
            this.player2.hp, this.player2.maxHp
        );
        
        // Si el atacante es el jugador, sumar score
        if (attacker === this.player1) {
            const comboBonus = attacker.comboCount > 1 ? attacker.comboCount * 10 : 0;
            this.score += damage * 10 + comboBonus;
            this.hud.updateScore(this.score);
        }
        
        // Si el defensor murió
        if (died) {
            this._onKO(attacker, defender);
        }
    }

    /**
     * Cuando un luchador es noqueado
     */
    _onKO(winner, loser) {
        this.roundActive = false;
        this.hud.pauseTimer();
        
        // Determinar quién ganó la ronda
        if (winner === this.player1) {
            this.p1Wins++;
            this.hud.setRoundWin(1, this.p1Wins);
            this.score += 500; // Bonus por ganar ronda
        } else {
            this.p2Wins++;
            this.hud.setRoundWin(2, this.p2Wins);
        }
        
        this.hud.updateScore(this.score);
        
        // Animación de victoria del ganador
        winner.animManager.playVictory(winner);
        
        // Anuncio de KO
        this._showRoundAnnouncement('K.O.!', () => {
            this.time.delayedCall(500, () => {
                this._checkMatchEnd();
            });
        }, COLORS.ACCENT);
        
        // Sonido de victoria
        this.audioManager.playSFX('sfx_victory');
    }

    /**
     * Cuando se acaba el tiempo
     */
    _onTimeUp() {
        if (!this.roundActive) return;
        this.roundActive = false;
        
        // Gana quien tenga más vida
        const p1Percent = this.player1.getHpPercent();
        const p2Percent = this.player2.getHpPercent();
        
        if (p1Percent >= p2Percent) {
            this.p1Wins++;
            this.hud.setRoundWin(1, this.p1Wins);
            this.score += 200;
        } else {
            this.p2Wins++;
            this.hud.setRoundWin(2, this.p2Wins);
        }
        
        this.hud.updateScore(this.score);
        
        this._showRoundAnnouncement('TIME!', () => {
            this.time.delayedCall(500, () => {
                this._checkMatchEnd();
            });
        }, 0xffd700);
    }

    /**
     * Verificar si el match terminó
     */
    _checkMatchEnd() {
        if (this.p1Wins >= COMBAT.ROUNDS_TO_WIN) {
            // ¡Jugador ganó el match!
            this._endMatch(true);
        } else if (this.p2Wins >= COMBAT.ROUNDS_TO_WIN) {
            // IA ganó el match
            this._endMatch(false);
        } else {
            // Siguiente ronda
            this.currentRound++;
            this._startRound();
        }
    }

    /**
     * Finalizar el match
     */
    _endMatch(playerWon) {
        this.matchOver = true;
        this.audioManager.stopMusic();
        
        // Guardar datos
        const isNewHighScore = StorageManager.saveHighScore(this.score);
        const progress = StorageManager.getProgress();
        StorageManager.saveProgress({
            winsTotal: (progress.winsTotal || 0) + (playerWon ? 1 : 0),
            roundsPlayed: (progress.roundsPlayed || 0) + this.currentRound,
            lastCharacter: this.playerCharacterId,
        });
        
        // Guardar nivel
        if (playerWon) {
            const currentLevel = StorageManager.getLevel();
            StorageManager.saveLevel(currentLevel + 1);
        }
        
        // Transición a la escena correspondiente
        this.time.delayedCall(1500, () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                if (playerWon) {
                    this.scene.start(SCENES.VICTORY, {
                        score: this.score,
                        isNewHighScore,
                        rounds: this.currentRound,
                        character: this.playerCharacterId,
                        p1Wins: this.p1Wins,
                        p2Wins: this.p2Wins,
                    });
                } else {
                    this.scene.start(SCENES.GAME_OVER, {
                        score: this.score,
                        isNewHighScore,
                        rounds: this.currentRound,
                        character: this.playerCharacterId,
                    });
                }
            });
        });
    }

    // ==========================================
    // PAUSA
    // ==========================================

    _pauseGame() {
        if (this.matchOver || !this.roundActive) return;
        
        this.roundActive = false;
        this.hud.pauseTimer();
        this.physics.pause();
        
        // Lanzar escena de pausa como overlay
        this.scene.launch(SCENES.PAUSE);
        this.scene.pause();
    }

    /**
     * Reanudar el juego (llamado desde PauseScene)
     */
    resumeGame() {
        this.physics.resume();
        this.hud.resumeTimer();
        this.roundActive = true;
    }

    // ==========================================
    // GAME LOOP
    // ==========================================

    update(time, delta) {
        if (!this.roundActive || this.matchOver) return;
        
        // Actualizar luchadores
        this.player1.update();
        this.player2.update();
        
        // Chequeo manual de golpes
        this.collisionManager.update();
        
        // Actualizar HUD con los HP actuales
        this.hud.updateHealth(
            this.player1.hp, this.player1.maxHp,
            this.player2.hp, this.player2.maxHp
        );
    }

    /**
     * Limpieza al destruir la escena
     */
    shutdown() {
        if (this.hud) this.hud.destroy();
        if (this.touchControls) this.touchControls.destroy();
        if (this.collisionManager) this.collisionManager.destroy();
        if (this.audioManager) this.audioManager.destroy();
    }
}
