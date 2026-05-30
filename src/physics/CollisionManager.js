/**
 * ============================================
 * CollisionManager.js - Gestión de colisiones
 * ============================================
 * Configura y maneja todas las colisiones del juego:
 * - Luchadores vs suelo (collider)
 * - Luchador vs luchador (overlap para detección de golpes)
 * - Detección de hitbox de ataque activa
 * - Cooldown de impactos para evitar daño repetido
 */

import Phaser from 'phaser';
import { FIGHTER } from '../config/gameConfig.js';

export default class CollisionManager {
    /**
     * @param {Phaser.Scene} scene
     */
    constructor(scene) {
        this.scene = scene;
        this.ground = null;
        this.hitCooldowns = new Map(); // Evitar hits repetidos
    }

    /**
     * Crear el suelo invisible para la física
     * @param {number} y - Posición Y del suelo
     * @returns {Phaser.Physics.Arcade.StaticGroup}
     */
    createGround(y) {
        // Crear un grupo estático para el suelo
        this.ground = this.scene.physics.add.staticGroup();
        
        // Crear una plataforma invisible como suelo
        const platform = this.scene.add.rectangle(512, y, 1024, 20, 0x000000, 0);
        this.ground.add(platform);
        platform.body.updateFromGameObject();
        
        return this.ground;
    }

    /**
     * Configurar colisión entre un luchador y el suelo
     * @param {Fighter} fighter
     */
    addGroundCollider(fighter) {
        if (!this.ground) return;
        this.scene.physics.add.collider(fighter, this.ground);
    }

    /**
     * Update manual para chequear golpes sin usar overlap de físicas,
     * ya que los colliders impiden que los cuerpos se intersecten.
     */
    update() {
        if (!this.scene.player1 || !this.scene.player2) return;
        
        this._checkManualHit(this.scene.player1, this.scene.player2);
        this._checkManualHit(this.scene.player2, this.scene.player1);
    }

    /**
     * Verificar si un ataque conecta basado en la distancia
     */
    _checkManualHit(attacker, defender) {
        // Verificar que el atacante está atacando
        if (!attacker.isAttacking || !attacker.currentAttack) return;
        
        // Verificar que el defensor puede recibir daño
        if (defender.isInvincible || defender.isDead) return;
        
        // Verificar cooldown de hits (evitar múltiples hits del mismo ataque)
        const hitKey = `${attacker.fighterName}_${attacker.currentAttack}_${Date.now() >> 8}`;
        if (this.hitCooldowns.has(hitKey)) return;
        
        // Distancia real entre centros
        const distance = Phaser.Math.Distance.Between(attacker.x, attacker.y, defender.x, defender.y);
        const range = attacker.getAttackRange();
        
        // Verificar que el atacante esté mirando hacia el defensor
        const isFacingDefender = attacker.facingRight ? (defender.x > attacker.x) : (defender.x < attacker.x);
        
        if (distance <= range && isFacingDefender) {
            // ¡GOLPE CONECTADO!
            const damage = attacker.getAttackDamage();
            
            // Registrar cooldown
            this.hitCooldowns.set(hitKey, true);
            this.scene.time.delayedCall(500, () => {
                this.hitCooldowns.delete(hitKey);
            });
            
            // Crear efecto visual de impacto
            this._createHitEffect(defender.x, defender.y - 20, attacker.currentAttack);
            
            // Aplicar daño a través del método de FightScene
            this.scene._onHit(attacker, defender, damage);
        }
    }

    /**
     * Crear efecto visual de impacto
     * @param {number} x
     * @param {number} y
     * @param {string} attackType
     */
    _createHitEffect(x, y, attackType) {
        // Color según tipo de ataque
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
        
        // Texto de impacto
        const hitText = this.scene.add.text(x, y, text, {
            fontFamily: 'Orbitron, monospace',
            fontSize: '24px',
            color: `#${color.toString(16).padStart(6, '0')}`,
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5).setDepth(150);
        
        // Animación del texto
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
        
        // Partículas de impacto (círculos)
        for (let i = 0; i < 5; i++) {
            const particle = this.scene.add.circle(
                x, y, 
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
        
        // Flash en pantalla para hits especiales
        if (attackType === 'special') {
            const flash = this.scene.add.rectangle(
                512, 288, 1024, 576, 0xffffff, 0.3
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
     * Limpiar cooldowns
     */
    clearCooldowns() {
        this.hitCooldowns.clear();
    }

    /**
     * Destruir
     */
    destroy() {
        this.hitCooldowns.clear();
        this.ground = null;
    }
}
