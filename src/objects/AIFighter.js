/**
 * ============================================
 * AIFighter.js - Luchador controlado por IA
 * ============================================
 * BONUS: IA Avanzada (+10%)
 * Implementa una máquina de estados simple para controlar
 * al oponente: IDLE, APPROACH, ATTACK, RETREAT.
 * Usa distancia al jugador y HP propio para tomar decisiones.
 */

import Phaser from 'phaser';
import Fighter from './Fighter.js';
import { AI, FIGHTER } from '../config/gameConfig.js';

// Estados de la IA
const AI_STATE = {
    IDLE: 'IDLE',
    APPROACH: 'APPROACH',
    ATTACK: 'ATTACK',
    RETREAT: 'RETREAT',
};

// Rangos de referencia para la IA
const FIGHTER_RANGES = {
    PUNCH: FIGHTER.PUNCH_RANGE + 20,
    KICK: FIGHTER.KICK_RANGE + 30,
    SPECIAL: FIGHTER.SPECIAL_RANGE,
};

export default class AIFighter extends Fighter {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {string} texture
     * @param {object} characterData
     * @param {boolean} facingRight
     * @param {number} difficulty - 1 (fácil) a 3 (difícil)
     */
    constructor(scene, x, y, texture, characterData, facingRight = false, difficulty = 2) {
        super(scene, x, y, texture, characterData, facingRight);
        
        this.target = null;       // Referencia al jugador
        this.state = AI_STATE.IDLE;
        this.difficulty = difficulty;
        this.lastThinkTime = 0;
        this.thinkInterval = AI.THINK_INTERVAL / difficulty; // Más difícil = piensa más rápido
        
        // Modificadores de dificultad
        this.attackProb = AI.ATTACK_PROBABILITY * (0.5 + difficulty * 0.25);
        this.specialProb = AI.SPECIAL_PROBABILITY * difficulty;
        this.reactionTime = 400 / difficulty; // ms para reaccionar
    }

    /**
     * Establecer el objetivo (jugador)
     * @param {Fighter} target
     */
    setTarget(target) {
        this.target = target;
    }

    /**
     * Update de la IA - ejecuta la máquina de estados
     */
    update() {
        if (this.isDead || !this.target || this.target.isDead) {
            this.setVelocityX(0);
            return;
        }
        
        const now = Date.now();
        
        // Solo "pensar" cada X milisegundos
        if (now - this.lastThinkTime < this.thinkInterval) {
            // Continuar la acción actual
            this._executeState();
            return;
        }
        
        this.lastThinkTime = now;
        
        // Calcular distancia al jugador
        const dist = this.distanceTo(this.target);
        const hpPercent = this.getHpPercent();
        
        // Actualizar dirección (siempre mirar al jugador)
        this.facingRight = this.target.x > this.x;
        this.setFlipX(!this.facingRight);
        
        // ==========================================
        // MÁQUINA DE ESTADOS DE LA IA
        // ==========================================
        
        // Si tiene poca vida, retirarse más frecuentemente
        if (hpPercent < AI.RETREAT_HP_THRESHOLD && Math.random() < 0.6) {
            this.state = AI_STATE.RETREAT;
        }
        // Si está lejos, acercarse
        else if (dist > AI.APPROACH_DISTANCE) {
            this.state = AI_STATE.APPROACH;
        }
        // Si está en rango medio, decidir entre acercarse o atacar
        else if (dist > AI.ATTACK_DISTANCE) {
            if (Math.random() < this.attackProb * 0.5) {
                this.state = AI_STATE.APPROACH;
            } else if (Math.random() < this.specialProb) {
                this.state = AI_STATE.ATTACK;
            } else {
                this.state = AI_STATE.IDLE;
            }
        }
        // Si está en rango de ataque
        else {
            if (Math.random() < this.attackProb) {
                this.state = AI_STATE.ATTACK;
            } else {
                this.state = Math.random() < 0.5 ? AI_STATE.IDLE : AI_STATE.RETREAT;
            }
        }
        
        // Ejecutar la acción del estado
        this._executeState();
    }

    /**
     * Ejecutar la acción del estado actual
     */
    _executeState() {
        if (this.isHurt || this.isAttacking) return;
        
        switch (this.state) {
            case AI_STATE.IDLE:
                this.move(0);
                break;
                
            case AI_STATE.APPROACH:
                this._approach();
                break;
                
            case AI_STATE.ATTACK:
                this._attack();
                break;
                
            case AI_STATE.RETREAT:
                this._retreat();
                break;
        }
    }

    /**
     * Acercarse al jugador
     */
    _approach() {
        if (!this.target) return;
        
        const dir = this.target.x > this.x ? 1 : -1;
        this.move(dir);
        
        // Saltar aleatoriamente para parecer más dinámico
        if (Math.random() < 0.02 * this.difficulty) {
            this.jump();
        }
    }

    /**
     * Ejecutar un ataque
     */
    _attack() {
        if (!this.target || this.isAttacking) return;
        
        const dist = this.distanceTo(this.target);
        
        // Elegir ataque según distancia y probabilidad
        const roll = Math.random();
        
        if (dist <= FIGHTER_RANGES.PUNCH && roll < 0.5) {
            this.punch();
        } else if (dist <= FIGHTER_RANGES.KICK && roll < 0.8) {
            this.kick();
        } else if (roll < this.specialProb) {
            this.special();
        } else {
            // Si no atacó, acercarse
            this._approach();
        }
    }

    /**
     * Retirarse del jugador
     */
    _retreat() {
        if (!this.target) return;
        
        // Moverse en dirección opuesta al jugador
        const dir = this.target.x > this.x ? -1 : 1;
        this.move(dir);
        
        // Contraatacar mientras retrocede
        if (Math.random() < 0.1 * this.difficulty) {
            this.punch();
        }
    }
}
