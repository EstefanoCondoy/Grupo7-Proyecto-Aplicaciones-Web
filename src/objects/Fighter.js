/**
 * ============================================
 * Fighter.js - Clase base del luchador
 * ============================================
 * Clase base para movimiento, ataques, dano, estados y
 * configuracion fisica de cada luchador.
 */

import Phaser from 'phaser';
import { FIGHTER } from '../config/gameConfig.js';
import AnimationManager from '../managers/AnimationManager.js';
import Projectile from './Projectile.js';

export default class Fighter extends Phaser.Physics.Arcade.Sprite {
    /**
     * @param {Phaser.Scene} scene - Escena activa
     * @param {number} x - Posicion X inicial
     * @param {number} y - Posicion Y inicial
     * @param {string} texture - Key de la textura
     * @param {object} characterData - Datos del personaje
     * @param {boolean} facingRight - Mira a la derecha
     */
    constructor(scene, x, y, texture, characterData, facingRight = true) {
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.characterData = characterData;
        this.fighterName = characterData.name;

        this.maxHp = Math.floor(FIGHTER.MAX_HP * characterData.hpMod);
        this.hp = this.maxHp;
        this.speed = Math.floor(FIGHTER.SPEED * characterData.speedMod);
        this.jumpVelocity = Math.floor(FIGHTER.JUMP_VELOCITY * characterData.jumpMod);
        this.damageMod = characterData.damageMod;

        const visual = characterData.visual || {};
        this.setOrigin(visual.originX ?? 0.5, visual.originY ?? 1);
        this.setDisplaySize(
            visual.displayWidth ?? FIGHTER.DISPLAY_WIDTH,
            visual.displayHeight ?? FIGHTER.DISPLAY_HEIGHT
        );

        this.baseScaleX = this.scaleX;
        this.baseScaleY = this.scaleY;
        this.setFrame(0);

        this.facingRight = facingRight;
        this.isAttacking = false;
        this.isHurt = false;
        this.isDead = false;
        this.isInvincible = false;
        this.currentAttack = null;

        this.lastPunchTime = 0;
        this.lastKickTime = 0;
        this.lastSpecialTime = 0;
        this.attackId = 0;
        this.currentAttackId = 0;

        this.score = 0;
        this.roundWins = 0;
        this.comboCount = 0;
        this.lastHitTime = 0;

        this._setupSprite(facingRight);

        this.animManager = new AnimationManager(scene);
        this.animManager.playIdle(this);
    }

    /**
     * Configurar sprite y cuerpo fisico.
     */
    _setupSprite(facingRight) {
        const visual = this.characterData.visual || {};

        this.body.setSize(visual.bodyWidth ?? FIGHTER.BODY_WIDTH, visual.bodyHeight ?? FIGHTER.BODY_HEIGHT);
        this.body.setOffset(visual.bodyOffsetX ?? FIGHTER.BODY_OFFSET_X, visual.bodyOffsetY ?? FIGHTER.BODY_OFFSET_Y);
        this.setCollideWorldBounds(true);
        this.setBounce(0, 0);
        this.setFlipX(!facingRight);
        this.setDepth(10);
        this._syncBodyToSprite();
    }

    // ==========================================
    // MOVIMIENTO
    // ==========================================

    /**
     * Mover al luchador horizontalmente.
     * @param {number} direction - -1 izquierda, 0 quieto, 1 derecha
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
            return;
        }

        this.setVelocityX(0);
        if (this.body.touching.down || this.body.blocked.down) {
            this.animManager.playIdle(this);
        }
    }

    /**
     * Saltar si esta en el suelo.
     * @returns {boolean}
     */
    jump() {
        if (this.isAttacking || this.isHurt || this.isDead) return false;

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
     * Ejecutar golpe rapido.
     * @returns {boolean}
     */
    punch() {
        const now = Date.now();
        if (this.isAttacking || this.isHurt || this.isDead) return false;
        if (now - this.lastPunchTime < FIGHTER.PUNCH_COOLDOWN) return false;

        this.isAttacking = true;
        this.currentAttack = 'punch';
        this.currentAttackId = ++this.attackId;
        const attackId = this.currentAttackId;
        this.lastPunchTime = now;
        this.setVelocityX(0);

        this._queueAttackHitbox('punch');
        this._scheduleAttackRecovery('punch', attackId, 650);

        this.animManager.playPunch(this, () => {
            this._finishAttack('punch', attackId);
        });

        if (this.scene.audioManager) {
            this.scene.audioManager.playSFX('sfx_punch');
        }

        return true;
    }

    /**
     * Ejecutar patada fuerte.
     * @returns {boolean}
     */
    kick() {
        const now = Date.now();
        if (this.isAttacking || this.isHurt || this.isDead) return false;
        if (now - this.lastKickTime < FIGHTER.KICK_COOLDOWN) return false;

        this.isAttacking = true;
        this.currentAttack = 'kick';
        this.currentAttackId = ++this.attackId;
        const attackId = this.currentAttackId;
        this.lastKickTime = now;
        this.setVelocityX(0);

        this._queueAttackHitbox('kick');
        this._scheduleAttackRecovery('kick', attackId, 800);

        this.animManager.playKick(this, () => {
            this._finishAttack('kick', attackId);
        });

        if (this.scene.audioManager) {
            this.scene.audioManager.playSFX('sfx_kick');
        }

        return true;
    }

    /**
     * Limpiar estado ofensivo si la animacion termina o si se interrumpe.
     */
    _finishAttack(attackType, attackId) {
        if (this.currentAttackId !== attackId || this.currentAttack !== attackType) return;

        this.isAttacking = false;
        this.currentAttack = null;
    }

    /**
     * Failsafe contra estados de ataque atascados.
     */
    _scheduleAttackRecovery(attackType, attackId, duration) {
        this.scene.time.delayedCall(duration, () => {
            if (
                this.active &&
                !this.isDead &&
                this.currentAttackId === attackId &&
                this.currentAttack === attackType
            ) {
                this.isAttacking = false;
                this.currentAttack = null;

                if (!this.isHurt) {
                    this.animManager.playIdle(this);
                }
            }
        });
    }

    /**
     * Crear la hitbox cuando la pose de ataque ya esta visible.
     */
    _queueAttackHitbox(attackType) {
        if (!this.scene.collisionManager) return;

        const attackId = this.currentAttackId;
        const delay = this.characterData.hitboxes?.[attackType]?.delay || 0;

        this.scene.time.delayedCall(delay, () => {
            if (
                this.active &&
                this.isAttacking &&
                !this.isHurt &&
                !this.isDead &&
                this.currentAttack === attackType &&
                this.currentAttackId === attackId
            ) {
                this.scene.collisionManager.createAttackHitbox(this, attackType);
            }
        });
    }

    /**
     * Ejecutar ataque especial.
     * @returns {boolean}
     */
    special() {
        const now = Date.now();
        if (this.isAttacking || this.isHurt || this.isDead) return false;
        if (now - this.lastSpecialTime < FIGHTER.SPECIAL_COOLDOWN) return false;

        this.isAttacking = true;
        this.currentAttack = 'special';
        this.currentAttackId = ++this.attackId;
        const attackId = this.currentAttackId;
        this.lastSpecialTime = now;
        this.setVelocityX(0);

        this.scene.time.delayedCall(150, () => {
            if (
                this.active &&
                this.isAttacking &&
                this.currentAttack === 'special' &&
                this.currentAttackId === attackId &&
                !this.isHurt &&
                !this.isDead
            ) {
                this._spawnSpecialProjectile();
            }
        });
        this._scheduleAttackRecovery('special', attackId, 900);

        this.animManager.playSpecial(
            this,
            this.characterData.specialColor,
            () => {
                this._finishAttack('special', attackId);
            }
        );

        if (this.scene.audioManager) {
            this.scene.audioManager.playSFX('sfx_special');
        }

        return true;
    }

    /**
     * Crear el proyectil fisico del ataque especial.
     */
    _spawnSpecialProjectile() {
        const direction = this.facingRight ? 1 : -1;
        const projectileConfig = this.characterData.projectile || {};
        const spawnX = this.x + direction * (projectileConfig.offsetX ?? Math.max(80, this.displayWidth * 0.45));
        const spawnY = this.y + (projectileConfig.offsetY ?? -Math.max(120, this.displayHeight * 0.58));
        const damage = Math.floor(FIGHTER.SPECIAL_DAMAGE * this.damageMod);

        const projectile = new Projectile(
            this.scene,
            spawnX,
            spawnY,
            direction,
            this.characterData.specialColor,
            damage,
            this
        );

        if (this.scene.collisionManager) {
            this.scene.collisionManager.addProjectile(projectile);
        }
    }

    /**
     * Obtener dano de un ataque.
     * @param {string} attackType
     * @returns {number}
     */
    getAttackDamage(attackType = this.currentAttack) {
        let baseDamage = 0;
        switch (attackType) {
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
     * Obtener rango de referencia para IA.
     * @param {string} attackType
     * @returns {number}
     */
    getAttackRange(attackType = this.currentAttack) {
        switch (attackType) {
            case 'punch': return FIGHTER.PUNCH_RANGE;
            case 'kick': return FIGHTER.KICK_RANGE;
            case 'special': return FIGHTER.SPECIAL_RANGE;
            default: return 0;
        }
    }

    // ==========================================
    // RECIBIR DANO
    // ==========================================

    /**
     * Recibir dano de un ataque.
     * @param {number} amount - Cantidad de dano
     * @param {number} fromX - Posicion X del atacante
     * @returns {boolean} true si murio
     */
    takeDamage(amount, fromX) {
        if (this.isInvincible || this.isDead) return false;

        this.hp = Math.max(0, this.hp - amount);
        this.isHurt = true;
        this.isAttacking = false;
        this.currentAttack = null;

        const knockDir = (this.x > fromX) ? 1 : -1;
        this.setVelocityX(knockDir * FIGHTER.KNOCKBACK_X);
        this.setVelocityY(FIGHTER.KNOCKBACK_Y);

        this.animManager.playHurt(this, () => {
            this.isHurt = false;
        });
        this.scene.time.delayedCall(FIGHTER.HURT_DURATION, () => {
            if (this.active && !this.isDead) {
                this.isHurt = false;
            }
        });

        this.isInvincible = true;
        this.animManager.playInvincible(this, FIGHTER.INVINCIBLE_DURATION);

        this.scene.time.delayedCall(FIGHTER.INVINCIBLE_DURATION, () => {
            this.isInvincible = false;
            if (this.active && !this.isDead) {
                this.clearTint();
                this.setAlpha = 1;
            }
        });

        if (this.scene.audioManager) {
            this.scene.audioManager.playSFX('sfx_hurt');
        }

        if (this.scene.cameras && this.scene.cameras.main) {
            this.scene.cameras.main.shake(100, 0.005);
        }

        if (this.hp <= 0) {
            this.die();
            return true;
        }

        return false;
    }

    /**
     * Ejecutar muerte del luchador.
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
     * Reiniciar al luchador para nueva ronda.
     * @param {number} x - Nueva posicion X
     * @param {number} y - Nueva posicion Y
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

        if (this.animManager) {
            this.animManager.stopAll(this);
        }

        if (typeof this.clearTint === 'function') {
            this.clearTint();
        }

        this.alpha = 1;
        this.visible = true;

        this.setAngle(0);

        if (this.body) {
            this.body.enable = true;
            this.body.setVelocity(0, 0);
        }

        this.scaleX = this.baseScaleX;
        this.scaleY = this.baseScaleY;

        this._syncBodyToSprite();

        this.animManager.playIdle(this);    
    }

    /**
     * Obtener porcentaje de vida.
     * @returns {number}
     */
    getHpPercent() {
        return this.hp / this.maxHp;
    }

    /**
     * Esta en el suelo.
     * @returns {boolean}
     */
    isGrounded() {
        return this.body.touching.down || this.body.blocked.down;
    }

    /**
     * Distancia a otro luchador.
     * @param {Fighter} other
     * @returns {number}
     */
    distanceTo(other) {
        return Phaser.Math.Distance.Between(this.x, this.y, other.x, other.y);
    }

    /**
     * Update llamado cada frame.
     */
    update() {
        // Override en subclases.
    }

    /**
     * Sincroniza el cuerpo con la posicion/origen actual del sprite.
     */
    _syncBodyToSprite() {
        if (this.body?.updateFromGameObject) {
            this.body.updateFromGameObject();
        }
    }

}
