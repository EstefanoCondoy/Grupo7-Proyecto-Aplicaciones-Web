/**
 * ============================================
 * Fighter.js - Clase base del luchador
 * ============================================
 * Clase base que representa un luchador en el juego.
 * Extiende Phaser.Physics.Arcade.Sprite y contiene
 * toda la lógica de movimiento, ataques, daño y estados.
 * PlayerFighter y AIFighter heredan de esta clase.
 */

import Phaser from 'phaser';
import { FIGHTER, PHYSICS } from '../config/gameConfig.js';
import AnimationManager from '../managers/AnimationManager.js';

export default class Fighter extends Phaser.Physics.Arcade.Sprite {
    /**
     * @param {Phaser.Scene} scene - Escena activa
     * @param {number} x - Posición X inicial
     * @param {number} y - Posición Y inicial
     * @param {string} texture - Key de la textura/imagen
     * @param {object} characterData - Datos del personaje (de characterData.js)
     * @param {boolean} facingRight - ¿Mira a la derecha?
     */
    constructor(scene, x, y, texture, characterData, facingRight = true) {
        super(scene, x, y, texture);
        
        // Agregar a la escena y activar física
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Datos del personaje
        this.characterData = characterData;
        this.fighterName = characterData.name;
        
        // Stats modificados según el personaje
        this.maxHp = Math.floor(FIGHTER.MAX_HP * characterData.hpMod);
        this.hp = this.maxHp;
        this.speed = Math.floor(FIGHTER.SPEED * characterData.speedMod);
        this.jumpVelocity = Math.floor(FIGHTER.JUMP_VELOCITY * characterData.jumpMod);
        this.damageMod = characterData.damageMod;
        
        // Ajustar escala en base al tamaño del frame (256x512) y el scaleMod del personaje
        const baseW = 110 * (characterData.scaleMod || 1);
        const baseH = 220 * (characterData.scaleMod || 1);
        this.setDisplaySize(baseW, baseH);
        
        // Guardar escala base para que AnimationManager la use si hace tweens
        this.baseScaleX = this.scaleX;
        this.baseScaleY = this.scaleY;
        
        this.setFrame(0);
        
        // Estado del luchador
        this.facingRight = facingRight;
        this.isAttacking = false;
        this.isHurt = false;
        this.isDead = false;
        this.isInvincible = false;
        this.currentAttack = null;  // 'punch', 'kick', 'special'
        
        // Cooldowns (timestamps)
        this.lastPunchTime = 0;
        this.lastKickTime = 0;
        this.lastSpecialTime = 0;
        
        // Score
        this.score = 0;
        this.roundWins = 0;
        this.comboCount = 0;
        this.lastHitTime = 0;
        
        // Configurar sprite
        this._setupSprite(facingRight);
        
        // Manager de animaciones
        this.animManager = new AnimationManager(scene);
    }

    /**
     * Configurar las propiedades del sprite y el cuerpo físico
     */
    _setupSprite(facingRight) {
        // La escala ya fue configurada en el constructor
        // usando baseW y baseH. No la sobreescribimos aquí.
        
        // Configurar cuerpo físico
        this.body.setSize(FIGHTER.BODY_WIDTH, FIGHTER.BODY_HEIGHT);
        this.body.setOffset(FIGHTER.BODY_OFFSET_X, FIGHTER.BODY_OFFSET_Y);
        this.setCollideWorldBounds(true);
        this.setBounce(PHYSICS.BOUNCE);
        
        // Dirección
        this.setFlipX(!facingRight);
        
        // Profundidad para estar encima del fondo
        this.setDepth(10);
    }

    // ==========================================
    // MOVIMIENTO
    // ==========================================

    /**
     * Mover al luchador horizontalmente
     * @param {number} direction - -1 (izquierda), 0 (quieto), 1 (derecha)
     */
    move(direction) {
        if (this.isAttacking || this.isHurt || this.isDead) {
            this.setVelocityX(0);
            return;
        }
        
        if (direction !== 0) {
            this.setVelocityX(direction * this.speed);
            this.facingRight = direction > 0;
            this.setFlipX(!this.facingRight);
            this.animManager.playWalk(this);
        } else {
            this.setVelocityX(0);
            if (this.body.touching.down || this.body.blocked.down) {
                this.animManager.playIdle(this);
            }
        }
    }

    /**
     * Saltar si está en el suelo
     * @returns {boolean} true si saltó
     */
    jump() {
        if (this.isAttacking || this.isHurt || this.isDead) return false;
        
        // Solo saltar si está tocando el suelo
        if (this.body.touching.down || this.body.blocked.down) {
            this.setVelocityY(this.jumpVelocity);
            this.animManager.playJump(this);
            return true;
        }
        return false;
    }

    // ==========================================
    // ATAQUES
    // ==========================================

    /**
     * Ejecutar golpe rápido
     * @returns {boolean} true si se ejecutó
     */
    punch() {
        const now = Date.now();
        if (this.isAttacking || this.isHurt || this.isDead) return false;
        if (now - this.lastPunchTime < FIGHTER.PUNCH_COOLDOWN) return false;
        
        this.isAttacking = true;
        this.currentAttack = 'punch';
        this.lastPunchTime = now;
        this.setVelocityX(0);
        
        // Animación y callback
        this.animManager.playPunch(this, () => {
            this.isAttacking = false;
            this.currentAttack = null;
        });
        
        // Efecto de sonido
        if (this.scene.audioManager) {
            this.scene.audioManager.playSFX('sfx_punch');
        }
        
        return true;
    }

    /**
     * Ejecutar patada fuerte
     * @returns {boolean} true si se ejecutó
     */
    kick() {
        const now = Date.now();
        if (this.isAttacking || this.isHurt || this.isDead) return false;
        if (now - this.lastKickTime < FIGHTER.KICK_COOLDOWN) return false;
        
        this.isAttacking = true;
        this.currentAttack = 'kick';
        this.lastKickTime = now;
        this.setVelocityX(0);
        
        this.animManager.playKick(this, () => {
            this.isAttacking = false;
            this.currentAttack = null;
        });
        
        if (this.scene.audioManager) {
            this.scene.audioManager.playSFX('sfx_kick');
        }
        
        return true;
    }

    /**
     * Ejecutar ataque especial
     * @returns {boolean} true si se ejecutó
     */
    special() {
        const now = Date.now();
        if (this.isAttacking || this.isHurt || this.isDead) return false;
        if (now - this.lastSpecialTime < FIGHTER.SPECIAL_COOLDOWN) return false;
        
        this.isAttacking = true;
        this.currentAttack = 'special';
        this.lastSpecialTime = now;
        this.setVelocityX(0);
        
        this.animManager.playSpecial(
            this, 
            this.characterData.specialColor, 
            () => {
                this.isAttacking = false;
                this.currentAttack = null;
            }
        );
        
        if (this.scene.audioManager) {
            this.scene.audioManager.playSFX('sfx_special');
        }
        
        return true;
    }

    /**
     * Obtener el daño del ataque actual
     * @returns {number} Daño del ataque
     */
    getAttackDamage() {
        let baseDamage = 0;
        switch (this.currentAttack) {
            case 'punch':
                baseDamage = FIGHTER.PUNCH_DAMAGE;
                break;
            case 'kick':
                baseDamage = FIGHTER.KICK_DAMAGE;
                break;
            case 'special':
                baseDamage = FIGHTER.SPECIAL_DAMAGE;
                break;
            default:
                return 0;
        }
        return Math.floor(baseDamage * this.damageMod);
    }

    /**
     * Obtener el rango del ataque actual
     * @returns {number}
     */
    getAttackRange() {
        switch (this.currentAttack) {
            case 'punch': return FIGHTER.PUNCH_RANGE;
            case 'kick': return FIGHTER.KICK_RANGE;
            case 'special': return FIGHTER.SPECIAL_RANGE;
            default: return 0;
        }
    }

    // ==========================================
    // RECIBIR DAÑO
    // ==========================================

    /**
     * Recibir daño de un ataque
     * @param {number} amount - Cantidad de daño
     * @param {number} fromX - Posición X del atacante (para knockback)
     * @returns {boolean} true si murió
     */
    takeDamage(amount, fromX) {
        if (this.isInvincible || this.isDead) return false;
        
        this.hp = Math.max(0, this.hp - amount);
        this.isHurt = true;
        this.isAttacking = false;
        this.currentAttack = null;
        
        // Knockback: empujar en dirección opuesta al atacante
        const knockDir = (this.x > fromX) ? 1 : -1;
        this.setVelocityX(knockDir * FIGHTER.KNOCKBACK_X);
        this.setVelocityY(FIGHTER.KNOCKBACK_Y);
        
        // Animación de daño
        this.animManager.playHurt(this, () => {
            this.isHurt = false;
        });
        
        // Invulnerabilidad temporal
        this.isInvincible = true;
        this.animManager.playInvincible(this, FIGHTER.INVINCIBLE_DURATION);
        
        this.scene.time.delayedCall(FIGHTER.INVINCIBLE_DURATION, () => {
            this.isInvincible = false;
        });
        
        // Sonido de daño
        if (this.scene.audioManager) {
            this.scene.audioManager.playSFX('sfx_hurt');
        }
        
        // Screen shake
        if (this.scene.cameras && this.scene.cameras.main) {
            this.scene.cameras.main.shake(100, 0.005);
        }
        
        // ¿Murió?
        if (this.hp <= 0) {
            this.die();
            return true;
        }
        
        return false;
    }

    /**
     * Ejecutar la muerte del luchador
     */
    die() {
        this.isDead = true;
        this.isAttacking = false;
        this.isHurt = false;
        this.setVelocityX(0);
        this.body.enable = false;
        
        this.animManager.playDeath(this);
        
        if (this.scene.audioManager) {
            this.scene.audioManager.playSFX('sfx_defeat');
        }
    }

    // ==========================================
    // UTILIDADES
    // ==========================================

    /**
     * Reiniciar al luchador para nueva ronda
     * @param {number} x - Nueva posición X
     * @param {number} y - Nueva posición Y
     */
    resetFighter(x, y) {
        this.hp = this.maxHp;
        this.isAttacking = false;
        this.isHurt = false;
        this.isDead = false;
        this.isInvincible = false;
        this.currentAttack = null;
        this.comboCount = 0;
        
        this.setPosition(x, y);
        this.setVelocity(0, 0);
        this.clearTint();
        this.setAlpha(1);
        this.setAngle(0);
        this.body.enable = true;
        this.scaleX = this.baseScaleX;
        this.scaleY = this.baseScaleY;
        
        this.animManager.stopAll(this);
    }

    /**
     * Obtener porcentaje de vida
     * @returns {number} 0-1
     */
    getHpPercent() {
        return this.hp / this.maxHp;
    }

    /**
     * ¿Está en el suelo?
     * @returns {boolean}
     */
    isGrounded() {
        return this.body.touching.down || this.body.blocked.down;
    }

    /**
     * Distancia a otro fighter
     * @param {Fighter} other
     * @returns {number}
     */
    distanceTo(other) {
        return Phaser.Math.Distance.Between(this.x, this.y, other.x, other.y);
    }

    /**
     * Update llamado cada frame
     */
    update() {
        // Override en subclases
    }
}
