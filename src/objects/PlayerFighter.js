/**
 * ============================================
 * PlayerFighter.js - Luchador controlado por humano
 * ============================================
 * Extiende Fighter para agregar control por InputManager.
 * Lee el estado de los controles cada frame y ejecuta
 * las acciones correspondientes.
 */

import Fighter from './Fighter.js';

export default class PlayerFighter extends Fighter {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {string} texture
     * @param {object} characterData
     * @param {InputManager} inputManager
     * @param {boolean} facingRight
     */
    constructor(scene, x, y, texture, characterData, inputManager, facingRight = true) {
        super(scene, x, y, texture, characterData, facingRight);
        this.inputManager = inputManager;
    }

    /**
     * Update del jugador - lee inputs y ejecuta acciones
     * Se llama cada frame desde la escena
     */
    update() {
        if (this.isDead) return;
        
        // Leer movimiento horizontal
        const horizontal = this.inputManager.getHorizontal();
        this.move(horizontal);
        
        // Salto
        if (this.inputManager.isJump()) {
            this.jump();
        }
        
        // Ataques (solo si no está atacando ya)
        if (!this.isAttacking && !this.isHurt) {
            if (this.inputManager.isPunch()) {
                this.punch();
            } else if (this.inputManager.isKick()) {
                this.kick();
            } else if (this.inputManager.isSpecial()) {
                this.special();
            }
        }
    }

    /**
     * Destruir y limpiar
     */
    destroy() {
        this.inputManager = null;
        super.destroy();
    }
}
