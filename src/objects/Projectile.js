/**
 * ============================================
 * Projectile.js - Proyectiles de ataque especial
 * ============================================
 * Sprite físico para los ataques especiales a distancia.
 * Se crea cuando un luchador usa su ataque especial,
 * viaja en una dirección y se destruye al impactar o
 * salir de los límites de la pantalla.
 */

import Phaser from 'phaser';
import { GAME_WIDTH } from '../config/gameConfig.js';

export default class Projectile extends Phaser.Physics.Arcade.Sprite {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x - Posición X de origen
     * @param {number} y - Posición Y de origen
     * @param {number} direction - 1 (derecha) o -1 (izquierda)
     * @param {number} color - Color del proyectil
     * @param {number} damage - Daño que causa
     * @param {Fighter} owner - Luchador que lo disparó
     */
    constructor(scene, x, y, direction, color, damage, owner) {
        // Crear una textura dinámica para el proyectil
        const key = `projectile_${color}_${Date.now()}`;
        
        // Generar gráfico del proyectil
        const graphics = scene.add.graphics();
        graphics.fillStyle(color, 1);
        graphics.fillCircle(16, 16, 12);
        graphics.fillStyle(0xffffff, 0.6);
        graphics.fillCircle(14, 14, 6);
        graphics.generateTexture(key, 32, 32);
        graphics.destroy();
        
        super(scene, x, y, key);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.damage = damage;
        this.owner = owner;
        this.speed = 400;
        this.color = color;
        
        // Configurar física
        this.body.allowGravity = false;
        this.setVelocityX(direction * this.speed);
        this.setDepth(15);
        
        // Efecto de brillo
        this.setTint(color);
        
        // Tween de pulsación
        scene.tweens.add({
            targets: this,
            scaleX: 1.3,
            scaleY: 1.3,
            alpha: 0.7,
            duration: 200,
            yoyo: true,
            repeat: -1,
        });
        
        // Auto-destruir si sale de pantalla
        scene.time.delayedCall(3000, () => {
            this.destroy();
        });
    }

    /**
     * Verificar si está fuera de pantalla
     */
    update() {
        if (this.x < -50 || this.x > GAME_WIDTH + 50) {
            this.destroy();
        }
    }

    /**
     * Efecto de impacto al golpear
     */
    onHit() {
        // Crear partículas de impacto
        const particles = this.scene.add.particles(this.x, this.y, undefined, {
            speed: { min: 50, max: 150 },
            scale: { start: 0.3, end: 0 },
            lifespan: 300,
            quantity: 8,
            tint: this.color,
            emitting: false,
        });
        
        // Emitir partículas manualmente con gráfico
        for (let i = 0; i < 6; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 50 + Math.random() * 100;
            const px = this.scene.add.circle(
                this.x, this.y, 
                3 + Math.random() * 4, 
                this.color
            );
            px.setDepth(20);
            
            this.scene.tweens.add({
                targets: px,
                x: px.x + Math.cos(angle) * speed,
                y: px.y + Math.sin(angle) * speed,
                alpha: 0,
                scale: 0,
                duration: 300,
                onComplete: () => px.destroy(),
            });
        }
        
        this.destroy();
    }
}
