/**
 * ============================================
 * AnimationManager.js - Creación de animaciones
 * ============================================
 * Centraliza la creación y reproducción de todas las
 * animaciones del juego basadas en spritesheets.
 */

import { CHARACTERS } from '../config/characterData.js';

export default class AnimationManager {
    /**
     * @param {Phaser.Scene} scene - Escena activa
     */
    constructor(scene) {
        this.scene = scene;
        this._initAnimations();
    }

    /**
     * Inicializar las animaciones para todos los personajes
     */
    _initAnimations() {
        CHARACTERS.forEach(char => {
            const key = char.imageKey;
            
            // Idle (respiración, frames 0-1)
            if (!this.scene.anims.exists(`${key}_idle`)) {
                this.scene.anims.create({
                    key: `${key}_idle`,
                    frames: this.scene.anims.generateFrameNumbers(key, { start: 0, end: 1 }),
                    frameRate: 4,
                    repeat: -1
                });
            }
            
            // Walk (caminar, frames 1-2)
            if (!this.scene.anims.exists(`${key}_walk`)) {
                this.scene.anims.create({
                    key: `${key}_walk`,
                    frames: this.scene.anims.generateFrameNumbers(key, { frames: [1, 2, 1, 0] }),
                    frameRate: 8,
                    repeat: -1
                });
            }
            
            // Jump (salto, frame 3)
            if (!this.scene.anims.exists(`${key}_jump`)) {
                this.scene.anims.create({
                    key: `${key}_jump`,
                    frames: [{ key: key, frame: 3 }],
                    frameRate: 10
                });
            }
            
            // Punch (golpe, frame 4)
            if (!this.scene.anims.exists(`${key}_punch`)) {
                this.scene.anims.create({
                    key: `${key}_punch`,
                    frames: this.scene.anims.generateFrameNumbers(key, { frames: [0, 4, 0] }),
                    frameRate: 12
                });
            }
            
            // Kick (patada, frame 5)
            if (!this.scene.anims.exists(`${key}_kick`)) {
                this.scene.anims.create({
                    key: `${key}_kick`,
                    frames: this.scene.anims.generateFrameNumbers(key, { frames: [0, 5, 0] }),
                    frameRate: 10
                });
            }
            
            // Special (especial, frame 6)
            if (!this.scene.anims.exists(`${key}_special`)) {
                this.scene.anims.create({
                    key: `${key}_special`,
                    frames: this.scene.anims.generateFrameNumbers(key, { frames: [0, 6, 6, 0] }),
                    frameRate: 8
                });
            }
            
            // Hurt (daño, frame 7)
            if (!this.scene.anims.exists(`${key}_hurt`)) {
                this.scene.anims.create({
                    key: `${key}_hurt`,
                    frames: [{ key: key, frame: 7 }],
                    frameRate: 10
                });
            }
        });
    }

    /**
     * Aplicar animación de idle
     */
    playIdle(sprite) {
        this.stopAll(sprite);
        if (sprite.texture.key) {
            sprite.play(`${sprite.texture.key}_idle`, true);
        }
    }

    /**
     * Animación de caminar
     */
    playWalk(sprite) {
        this.stopAll(sprite);
        if (sprite.texture.key) {
            sprite.play(`${sprite.texture.key}_walk`, true);
        }
    }

    /**
     * Animación de salto
     */
    playJump(sprite) {
        this.stopAll(sprite);
        if (sprite.texture.key) {
            sprite.play(`${sprite.texture.key}_jump`, true);
        }
    }

    /**
     * Animación de golpe
     */
    playPunch(sprite, onComplete) {
        this.stopAll(sprite);
        if (sprite.texture.key) {
            sprite.play(`${sprite.texture.key}_punch`);
            sprite.once('animationcomplete', () => {
                if (onComplete) onComplete();
                this.playIdle(sprite);
            });
        }
    }

    /**
     * Animación de patada
     */
    playKick(sprite, onComplete) {
        this.stopAll(sprite);
        if (sprite.texture.key) {
            sprite.play(`${sprite.texture.key}_kick`);
            sprite.once('animationcomplete', () => {
                if (onComplete) onComplete();
                this.playIdle(sprite);
            });
        }
    }

    /**
     * Animación de ataque especial
     */
    playSpecial(sprite, color, onComplete) {
        this.stopAll(sprite);
        
        // Flash de color temporal
        sprite.setTint(color);
        this.scene.time.delayedCall(400, () => sprite.clearTint());
        
        if (sprite.texture.key) {
            sprite.play(`${sprite.texture.key}_special`);
            sprite.once('animationcomplete', () => {
                if (onComplete) onComplete();
                this.playIdle(sprite);
            });
        }
    }

    /**
     * Animación de recibir daño
     */
    playHurt(sprite, onComplete) {
        this.stopAll(sprite);
        
        sprite.setTint(0xff0000);
        
        if (sprite.texture.key) {
            sprite.play(`${sprite.texture.key}_hurt`);
            
            // Parpadeo rojo con tween
            sprite._hurtTween = this.scene.tweens.add({
                targets: sprite,
                alpha: 0.5,
                duration: 100,
                yoyo: true,
                repeat: 1,
                onComplete: () => {
                    sprite.clearTint();
                    sprite.alpha = 1;
                    if (onComplete) onComplete();
                    if (!sprite.isDead) {
                        this.playIdle(sprite);
                    }
                }
            });
        }
    }

    /**
     * Animación de muerte
     */
    playDeath(sprite, onComplete) {
        this.stopAll(sprite);
        sprite.setTint(0xff0000);
        
        if (sprite.texture.key) {
            sprite.play(`${sprite.texture.key}_hurt`);
        }
        
        this.scene.tweens.add({
            targets: sprite,
            angle: sprite.flipX ? -90 : 90,
            alpha: 0.3,
            y: sprite.y + 20,
            duration: 600,
            ease: 'Power2',
            onComplete: () => {
                if (onComplete) onComplete();
            },
        });
    }

    /**
     * Animación de victoria
     */
    playVictory(sprite) {
        this.stopAll(sprite);
        if (sprite.texture.key) {
            sprite.play(`${sprite.texture.key}_idle`, true);
        }
        
        this.scene.tweens.add({
            targets: sprite,
            y: sprite.y - 30,
            duration: 300,
            yoyo: true,
            repeat: 2,
            ease: 'Bounce.easeOut',
        });
    }

    /**
     * Animación de parpadeo (invulnerabilidad)
     */
    playInvincible(sprite, duration) {
        sprite._blinkTween = this.scene.tweens.add({
            targets: sprite,
            alpha: 0.3,
            duration: 80,
            yoyo: true,
            repeat: Math.floor(duration / 160),
            onComplete: () => {
                sprite.alpha = 1;
            },
        });
    }

    /**
     * Detener todas las animaciones activas
     */
    stopAll(sprite) {
        if (sprite.anims) {
            sprite.anims.stop();
        }
        
        const tweenKeys = ['_hurtTween', '_blinkTween'];
        tweenKeys.forEach(key => {
            if (sprite[key]) {
                sprite[key].stop();
                sprite[key] = null;
            }
        });
        
        sprite.angle = 0;
        sprite.scaleX = sprite.baseScaleX || sprite.scaleX;
        sprite.scaleY = sprite.baseScaleY || sprite.scaleY;
    }
}
