/**
 * ============================================
 * AIFighter.js - Luchador controlado por IA
 * ============================================
 * Maquina de estados simple para controlar al oponente:
 * IDLE, APPROACH, ATTACK, RETREAT.
 */

import Phaser from 'phaser';
import Fighter from './Fighter.js';
import { AI, FIGHTER, GAME_WIDTH } from '../config/gameConfig.js';

const AI_STATE = {
    IDLE: 'IDLE',
    APPROACH: 'APPROACH',
    ATTACK: 'ATTACK',
    RETREAT: 'RETREAT',
};

const FIGHTER_RANGES = {
    PUNCH: FIGHTER.PUNCH_RANGE + 45,
    KICK: FIGHTER.KICK_RANGE + 55,
    SPECIAL: FIGHTER.SPECIAL_RANGE,
};

const ARENA_EDGE_PADDING = 120;

export default class AIFighter extends Fighter {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {string} texture
     * @param {object} characterData
     * @param {boolean} facingRight
     * @param {number} difficulty - 1 facil a 3 dificil
     */
    constructor(scene, x, y, texture, characterData, facingRight = false, difficulty = 2) {
        super(scene, x, y, texture, characterData, facingRight);

        this.target = null;
        this.state = AI_STATE.IDLE;
        this.difficulty = difficulty;
        this.lastThinkTime = 0;
        this.thinkInterval = AI.THINK_INTERVAL / difficulty;

        this.attackProb = Math.min(0.9, AI.ATTACK_PROBABILITY * (0.75 + difficulty * 0.25));
        this.specialProb = Math.min(0.45, AI.SPECIAL_PROBABILITY * (difficulty + 0.5));

        this.isBoss = characterData.id === 'boss';
        if (this.isBoss) {
            this.thinkInterval *= 0.55; // Boss piensa más rápido
            this.attackProb = 0.95;
            this.specialProb = 0.5;
        }
    }

    /**
     * Establecer objetivo.
     * @param {Fighter} target
     */
    setTarget(target) {
        this.target = target;
    }

    /**
     * Update de la IA.
     */
    update() {
        if (this.isDead || !this.target || this.target.isDead) {
            this.setVelocityX(0);
            return;
        }

        const now = Date.now();

        if (now - this.lastThinkTime < this.thinkInterval) {
            this._executeState();
            return;
        }

        this.lastThinkTime = now;

        const dist = this.distanceTo(this.target);
        const hpPercent = this.getHpPercent();
        const isCornered = this._isCornered();

        // this.facingRight = this.target.x > this.x;
        // this.setFlipX(!this.facingRight);
        // el boss siempre mira al jugador, incluso si está retrocediendo
        if (this.isBoss && dist <= FIGHTER_RANGES.SPECIAL && Math.random() < this.specialProb) {
            this.special();
            return;
        }

        if (!this.isBoss && !isCornered && hpPercent < AI.RETREAT_HP_THRESHOLD && Math.random() < 0.18) {
            this.state = AI_STATE.RETREAT;
        } else if (dist > AI.APPROACH_DISTANCE) {
            this.state = AI_STATE.APPROACH;
        } else if (dist > AI.ATTACK_DISTANCE) {
            if (Math.random() < this.attackProb || isCornered) {
                this.state = AI_STATE.ATTACK;
            } else if (Math.random() < 0.2) {
                this.state = AI_STATE.IDLE;
            } else {
                this.state = AI_STATE.APPROACH;
            }
        } else if (Math.random() < this.attackProb || isCornered) {
            this.state = AI_STATE.ATTACK;
        } else {
            this.state = AI_STATE.IDLE;
        }

        this._executeState();
    }

    /**
     * Ejecutar estado actual.
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
     * Acercarse al jugador.
     */
    _approach() {
        if (!this.target) return;

        const dir = this.target.x > this.x ? 1 : -1;
        this.move(dir);

        if (Math.random() < 0.01 * this.difficulty && this.distanceTo(this.target) > 160) {
            this.jump();
        }
    }

    /**
     * Atacar segun distancia.
     */
    _attack() {
        if (!this.target || this.isAttacking) return;

        const dist = this.distanceTo(this.target);
        const roll = Math.random();

        this.facingRight = this.target.x > this.x;
        this.setFlipX(!this.facingRight);

        if (dist <= FIGHTER_RANGES.KICK && roll < 0.55) {
            this.kick();
        } else if (dist <= FIGHTER_RANGES.PUNCH && roll < 0.85) {
            this.punch();
        } else if (dist <= FIGHTER_RANGES.SPECIAL && roll < this.specialProb) {
            this.special();
        } else {
            this._approach();
        }
    }

    /**
     * Retirada corta. Si esta arrinconado, contraataca.
     */
    _retreat() {
        if (!this.target) return;

        if (this._isCornered()) {
            this.state = AI_STATE.ATTACK;
            this._attack();
            return;
        }

        const dir = this.target.x > this.x ? -1 : 1;
        this.move(dir);

        if (Math.random() < 0.25 * this.difficulty) {
            this.special();
        }
    }

    /**
     * Detecta esquinas para evitar IA excesivamente evasiva.
     */
    _isCornered() {
        if (!this.target) return false;

        const nearLeft = this.x < ARENA_EDGE_PADDING && this.target.x > this.x;
        const nearRight = this.x > GAME_WIDTH - ARENA_EDGE_PADDING && this.target.x < this.x;
        return nearLeft || nearRight;
    }
}
