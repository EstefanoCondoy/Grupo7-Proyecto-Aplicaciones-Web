/**
 * ============================================
 * Projectile.js - Proyectiles de ataque especial
 * ============================================
 * Sprite fisico usado por los especiales de los personajes.
 */

import Phaser from 'phaser';
import { GAME_WIDTH } from '../config/gameConfig.js';

export default class Projectile extends Phaser.Physics.Arcade.Sprite {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x - Posicion X de origen
     * @param {number} y - Posicion Y de origen
     * @param {number} direction - 1 derecha, -1 izquierda
     * @param {number} color - Color del proyectil
     * @param {number} damage - Dano aplicado al impactar
     * @param {Fighter} owner - Luchador que lo disparo
     */
    constructor(scene, x, y, direction, color, damage, owner) {
        const textureKey = `projectile_${color}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

        const graphics = scene.add.graphics();
        graphics.fillStyle(color, 0.35);
        graphics.fillEllipse(18, 12, 34, 14);
        graphics.fillStyle(color, 1);
        graphics.fillEllipse(26, 12, 30, 12);
        graphics.fillStyle(0xffffff, 0.75);
        graphics.fillEllipse(31, 10, 12, 5);
        graphics.fillStyle(color, 0.45);
        graphics.fillTriangle(2, 12, 14, 4, 14, 20);
        graphics.generateTexture(textureKey, 48, 24);
        graphics.destroy();

        super(scene, x, y, textureKey);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.textureKey = textureKey;
        this.damage = damage;
        this.owner = owner;
        this.speed = 420;
        this.color = color;
        this.startY = y;
        this.direction = direction;

        this.body.allowGravity = false;
        this.body.setSize(34, 14);
        this.body.setOffset(7, 5);
        this.setVelocity(direction * this.speed, 0);
        this.setDepth(15);
        this.setTint(color);
        this.setFlipX(direction < 0);

        this._pulseTween = scene.tweens.add({
            targets: this,
            scaleX: 1.3,
            scaleY: 1.3,
            alpha: 0.72,
            duration: 200,
            yoyo: true,
            repeat: -1,
        });

        scene.time.delayedCall(3000, () => {
            if (this.active) {
                this.destroy();
            }
        });
    }

    /**
     * Destruir si sale de pantalla.
     */
    update() {
        if (!this.active) return;

        this.y = this.startY;
        this.setVelocity(this.direction * this.speed, 0);
        this.body.allowGravity = false;

        if (this.x < -50 || this.x > GAME_WIDTH + 50) {
            this.destroy();
        }
    }

    /**
     * Efecto de impacto.
     */
    onHit() {
        if (!this.active) return;

        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 50 + Math.random() * 100;
            const particle = this.scene.add.circle(
                this.x,
                this.y,
                3 + Math.random() * 4,
                this.color
            ).setDepth(20);

            this.scene.tweens.add({
                targets: particle,
                x: particle.x + Math.cos(angle) * speed,
                y: particle.y + Math.sin(angle) * speed,
                alpha: 0,
                scale: 0,
                duration: 300,
                onComplete: () => particle.destroy(),
            });
        }

        this.destroy();
    }

    destroy(fromScene) {
        if (this._pulseTween) {
            this._pulseTween.stop();
            this._pulseTween = null;
        }

        const textureKey = this.textureKey;
        const textureManager = this.scene?.textures;

        super.destroy(fromScene);

        if (textureManager?.exists(textureKey)) {
            textureManager.remove(textureKey);
        }
    }
}
