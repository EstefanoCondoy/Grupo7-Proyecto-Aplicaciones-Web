/**
 * ============================================
 * CollisionManager.js - Gestion de colisiones
 * ============================================
 * Configura suelo, hitboxes temporales de melee y
 * overlaps de proyectiles fisicos.
 */

import { DEBUG_HITBOXES } from '../config/gameConfig.js';

const HITBOX_COLORS = {
    punch: 0xffaa00,
    kick: 0xff3366,
    special: 0x00e5ff,
};

export default class CollisionManager {
    /**
     * @param {Phaser.Scene} scene
     */
    constructor(scene) {
        this.scene = scene;
        this.ground = null;
        this.hitCooldowns = new Map();
        this.activeHitboxes = [];
        this.projectiles = this.scene.physics.add.group({ runChildUpdate: true });
    }

    /**
     * Crear suelo invisible para la fisica.
     * @param {number} y - Posicion Y del suelo
     * @returns {Phaser.Physics.Arcade.StaticGroup}
     */
    createGround(y) {
        this.ground = this.scene.physics.add.staticGroup();

        const groundHeight = 20;
        const platform = this.scene.add.rectangle(512, y + groundHeight / 2, 1024, groundHeight, 0x000000, 0);
        this.ground.add(platform);
        platform.body.updateFromGameObject();

        return this.ground;
    }

    /**
     * Configurar colision con suelo.
     * @param {Fighter} fighter
     */
    addGroundCollider(fighter) {
        if (!this.ground) return;
        this.scene.physics.add.collider(fighter, this.ground);
    }

    /**
     * Crear una hitbox temporal para punch/kick.
     * @param {Fighter} attacker
     * @param {'punch'|'kick'} attackType
     */
    createAttackHitbox(attacker, attackType) {
        const defender = this._getOpponent(attacker);
        const config = attacker.characterData?.hitboxes?.[attackType];

        if (!defender || !config) return;

        const direction = attacker.facingRight ? 1 : -1;
        const color = HITBOX_COLORS[attackType] || 0xffffff;
        const hitbox = this.scene.add.rectangle(
            attacker.x + direction * config.offsetX,
            attacker.y + config.offsetY,
            config.width,
            config.height,
            color,
            DEBUG_HITBOXES ? 0.25 : 0
        );

        hitbox.setDepth(DEBUG_HITBOXES ? 250 : 0);
        if (DEBUG_HITBOXES && hitbox.setStrokeStyle) {
            hitbox.setStrokeStyle(2, color, 0.9);
        }

        this.scene.physics.add.existing(hitbox);
        hitbox.body.allowGravity = false;
        hitbox.body.immovable = true;
        hitbox.body.setSize(config.width, config.height);

        hitbox.attacker = attacker;
        hitbox.attackType = attackType;
        hitbox.attackId = attacker.currentAttackId;
        hitbox.hasHit = false;

        hitbox._overlap = this.scene.physics.add.overlap(
            hitbox,
            defender,
            () => this._handleAttackOverlap(hitbox, attacker, defender, attackType),
            null,
            this
        );

        this.activeHitboxes.push(hitbox);

        this.scene.time.delayedCall(config.duration || 180, () => {
            this._destroyHitbox(hitbox);
        });
    }

    /**
     * Registrar un proyectil especial y conectarlo con el enemigo.
     * @param {Projectile} projectile
     */
    addProjectile(projectile) {
        if (!projectile) return;

        this.projectiles.add(projectile);
        projectile.body.allowGravity = false;
        projectile.setVelocity(projectile.direction * projectile.speed, 0);

        const defender = this._getOpponent(projectile.owner);
        if (!defender) return;

        projectile._overlap = this.scene.physics.add.overlap(
            projectile,
            defender,
            () => this._handleProjectileOverlap(projectile, defender),
            null,
            this
        );
    }

    /**
     * Actualizar proyectiles activos.
     */
    update() {
        if (!this.projectiles) return;

        const projectiles = this.projectiles.getChildren
            ? this.projectiles.getChildren()
            : Array.from(this.projectiles.children?.entries || []);

        projectiles.forEach(projectile => {
            if (projectile?.active && projectile.update) {
                projectile.update();
            }
        });
    }

    /**
     * Manejar impacto de melee.
     */
    _handleAttackOverlap(hitbox, attacker, defender, attackType) {
        if (!hitbox.active || hitbox.hasHit) return;
        if (!attacker.active || attacker.isDead || !attacker.isAttacking) return;
        if (defender.isInvincible || defender.isDead) return;

        const isFacingDefender = attacker.facingRight ? defender.x >= attacker.x : defender.x <= attacker.x;
        if (!isFacingDefender) return;

        const hitKey = `${attacker.fighterName}_${attackType}_${hitbox.attackId}_${defender.fighterName}`;
        if (this.hitCooldowns.has(hitKey)) return;

        const damage = attacker.getAttackDamage(attackType);
        if (damage <= 0) return;

        hitbox.hasHit = true;
        this.hitCooldowns.set(hitKey, true);
        this.scene.time.delayedCall(500, () => {
            this.hitCooldowns.delete(hitKey);
        });

        this._createHitEffect(defender.x, defender.y - defender.displayHeight * 0.55, attackType);
        this.scene._onHit(attacker, defender, damage);
        this._destroyHitbox(hitbox);
    }

    /**
     * Manejar impacto de proyectil.
     */
    _handleProjectileOverlap(projectile, defender) {
        if (!projectile.active || !projectile.owner || projectile.owner === defender) return;
        if (defender.isInvincible || defender.isDead || projectile.owner.isDead) return;

        this._createHitEffect(defender.x, defender.y - defender.displayHeight * 0.5, 'special');
        projectile.onHit();
        this.scene._onHit(projectile.owner, defender, projectile.damage);
    }

    /**
     * Obtener el oponente del luchador o dueno de proyectil.
     */
    _getOpponent(fighter) {
        if (fighter === this.scene.player1) return this.scene.player2;
        if (fighter === this.scene.player2) return this.scene.player1;
        return null;
    }

    /**
     * Destruir una hitbox y su overlap asociado.
     */
    _destroyHitbox(hitbox) {
        if (!hitbox) return;

        if (hitbox._overlap) {
            hitbox._overlap.destroy();
            hitbox._overlap = null;
        }

        this.activeHitboxes = this.activeHitboxes.filter(activeHitbox => activeHitbox !== hitbox);

        if (hitbox.active) {
            hitbox.destroy();
        }
    }

    /**
     * Crear efecto visual de impacto.
     * @param {number} x
     * @param {number} y
     * @param {string} attackType
     */
    _createHitEffect(x, y, attackType) {
        let color = 0xffffff;
        let text = 'HIT!';

        switch (attackType) {
            case 'punch':
                color = 0xffaa00;
                text = 'POW!';
                break;
            case 'kick':
                color = 0xff3366;
                text = 'KICK!';
                break;
            case 'special':
                color = 0x00e5ff;
                text = 'BOOM!';
                break;
        }

        const hitText = this.scene.add.text(x, y, text, {
            fontFamily: 'Orbitron, monospace',
            fontSize: '24px',
            color: `#${color.toString(16).padStart(6, '0')}`,
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5).setDepth(150);

        this.scene.tweens.add({
            targets: hitText,
            y: y - 50,
            alpha: 0,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 600,
            ease: 'Power2',
            onComplete: () => hitText.destroy(),
        });

        for (let i = 0; i < 5; i++) {
            const particle = this.scene.add.circle(
                x,
                y,
                2 + Math.random() * 4,
                color
            ).setDepth(149);

            const angle = Math.random() * Math.PI * 2;
            const speed = 40 + Math.random() * 80;

            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                alpha: 0,
                scale: 0,
                duration: 300 + Math.random() * 200,
                onComplete: () => particle.destroy(),
            });
        }

        if (attackType === 'special') {
            const flash = this.scene.add.rectangle(
                512,
                288,
                1024,
                576,
                0xffffff,
                0.3
            ).setDepth(200);

            this.scene.tweens.add({
                targets: flash,
                alpha: 0,
                duration: 200,
                onComplete: () => flash.destroy(),
            });
        }
    }

    /**
     * Limpiar cooldowns, hitboxes y proyectiles activos.
     */
    clearCooldowns() {
        this.hitCooldowns.clear();
        [...this.activeHitboxes].forEach(hitbox => this._destroyHitbox(hitbox));

        if (this.projectiles) {
            this.projectiles.clear(true, true);
        }
    }

    /**
     * Destruir recursos del manager.
     */
    destroy() {
        this.clearCooldowns();

        if (this.projectiles) {
            this.projectiles.destroy(true);
            this.projectiles = null;
        }

        this.ground = null;
    }
}
