/**
 * ============================================
 * AnimationManager.js - Creacion de animaciones
 * ============================================
 * Centraliza la creacion y reproduccion de animaciones
 * usando los frames definidos por personaje.
 */

import { CHARACTERS, getCharacterByImageKey } from '../config/characterData.js';

const ANIMATION_SETTINGS = {
    idle: { frameRate: 4, repeat: -1 },
    walk: { frameRate: 8, repeat: -1 },
    jump: { frameRate: 10, repeat: 0 },
    punch: { frameRate: 9, repeat: 0 },
    kick: { frameRate: 8, repeat: 0 },
    special: { frameRate: 7, repeat: 0 },
    hurt: { frameRate: 10, repeat: 0 },
    death: { frameRate: 10, repeat: 0 },
    victory: { frameRate: 4, repeat: -1 },
};

export default class AnimationManager {
    /**
     * @param {Phaser.Scene} scene - Escena activa
     */
    constructor(scene) {
        this.scene = scene;
        this._initAnimations();
    }

    /**
     * Inicializar las animaciones para todos los personajes.
     */
    _initAnimations() {
        CHARACTERS.forEach(character => {
            Object.keys(ANIMATION_SETTINGS).forEach(animationName => {
                this._createAnimation(character, animationName);
            });
        });
    }

    /**
     * Crear una animacion especifica a partir del arreglo de frames del personaje.
     * @param {object} character
     * @param {string} animationName
     */
    _createAnimation(character, animationName) {
        const animationKey = `${character.imageKey}_${animationName}`;
        if (this.scene.anims.exists(animationKey)) return;

        const frames = character.animations?.[animationName] || character.animations?.idle || [0];
        const settings = ANIMATION_SETTINGS[animationName];

        this.scene.anims.create({
            key: animationKey,
            frames: frames.map(frame => ({ key: character.imageKey, frame })),
            frameRate: settings.frameRate,
            repeat: settings.repeat,
        });
    }

    /**
     * Reproducir una animacion por nombre.
     * @param {Phaser.Physics.Arcade.Sprite} sprite
     * @param {string} animationName
     * @param {boolean} ignoreIfPlaying
     * @returns {boolean}
     */
    _play(sprite, animationName, ignoreIfPlaying = false) {
        const textureKey = sprite?.texture?.key;
        if (!textureKey) return false;

        const animationKey = `${textureKey}_${animationName}`;
        if (!this.scene.anims.exists(animationKey)) {
            const character = getCharacterByImageKey(textureKey);
            if (character) {
                this._createAnimation(character, animationName);
            }
        }

        if (!this.scene.anims.exists(animationKey)) return false;
        sprite.play(animationKey, ignoreIfPlaying);
        return true;
    }

    /**
     * Reproducir una animacion no repetitiva y volver a idle al terminar.
     */
    _playOnce(sprite, animationName, onComplete) {
        this.stopAll(sprite);

        if (!this._play(sprite, animationName)) {
            if (onComplete) onComplete();
            return;
        }

        sprite.once('animationcomplete', () => {
            if (onComplete) onComplete();
            if (!sprite.isDead) {
                this.playIdle(sprite);
            }
        });
    }

    /**
     * Reproducir una animacion en loop sin reiniciarla cada frame.
     */
    _playLoop(sprite, animationName) {
        const textureKey = sprite?.texture?.key;
        const animationKey = textureKey ? `${textureKey}_${animationName}` : null;

        if (animationKey && sprite.anims?.currentAnim?.key === animationKey && sprite.anims.isPlaying) {
            return;
        }

        this.stopAll(sprite);
        this._play(sprite, animationName, true);
    }

    playIdle(sprite) {
        this._playLoop(sprite, 'idle');
    }

    playWalk(sprite) {
        this._playLoop(sprite, 'walk');
    }

    playJump(sprite) {
        this.stopAll(sprite);
        this._play(sprite, 'jump', true);
    }

    playPunch(sprite, onComplete) {
        this._playOnce(sprite, 'punch', onComplete);
    }

    playKick(sprite, onComplete) {
        this._playOnce(sprite, 'kick', onComplete);
    }

    playSpecial(sprite, color, onComplete) {
        this.stopAll(sprite);

        sprite.setTint(color);
        this.scene.time.delayedCall(400, () => {
            if (sprite.active && !sprite.isHurt && !sprite.isDead) {
                sprite.clearTint();
            }
        });

        if (!this._play(sprite, 'special')) {
            if (onComplete) onComplete();
            this.playIdle(sprite);
            return;
        }

        sprite.once('animationcomplete', () => {
            if (onComplete) onComplete();
            if (!sprite.isDead) {
                this.playIdle(sprite);
            }
        });
    }

    playHurt(sprite, onComplete) {
        this.stopAll(sprite);

        sprite.setTint(0xff0000);
        this._play(sprite, 'hurt');

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
            },
        });
    }

    playDeath(sprite, onComplete) {
        this.stopAll(sprite);
        sprite.setTint(0xff0000);
        this._play(sprite, 'death');

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

    playVictory(sprite) {
        this.stopAll(sprite);
        this._play(sprite, 'victory', true);

        this.scene.tweens.add({
            targets: sprite,
            y: sprite.y - 30,
            duration: 300,
            yoyo: true,
            repeat: 2,
            ease: 'Bounce.easeOut',
        });
    }

    playInvincible(sprite, duration) {
        sprite._blinkTween = this.scene.tweens.add({
            targets: sprite,
            alpha: 0.3,
            duration: 80,
            yoyo: true,
            repeat: Math.floor(duration / 160),
            onComplete: () => {
                sprite.alpha = 1;
                if (!sprite.isDead) {
                    sprite.clearTint();
                }
            },
        });
    }

    /**
     * Detener animaciones/tweens que pueden alterar el estado visual base.
     */
    stopAll(sprite) {
        if (sprite.anims) {
            sprite.anims.stop();
        }
    
        const tweenKeys = ['_hurtTween', '_blinkTween', '_deathTween', '_victoryTween'];
    
        tweenKeys.forEach(key => {
            if (sprite[key]) {
                sprite[key].stop();
                sprite[key] = null;
            }
        });
    
        sprite.angle = 0;
        sprite.scaleX = sprite.baseScaleX || sprite.scaleX;
        sprite.scaleY = sprite.baseScaleY || sprite.scaleY;
    
        if (!sprite.isDead) {
            if (typeof sprite.clearTint === 'function') {
                sprite.clearTint();
            }
        
            sprite.alpha = 1;
            sprite.visible = true;
        }
    }
}
