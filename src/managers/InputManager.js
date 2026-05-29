/**
 * ============================================
 * InputManager.js - Gestión de controles
 * ============================================
 * Mapea los controles del teclado y proporciona una API
 * unificada para consultar el estado de las entradas.
 * Soporta Jugador 1 (WASD+JKL) y Jugador 2 (flechas+OPI).
 */

import Phaser from 'phaser';
import { CONTROLS } from '../config/gameConfig.js';

export default class InputManager {
    /**
     * @param {Phaser.Scene} scene - Escena activa
     * @param {number} playerNumber - 1 o 2
     */
    constructor(scene, playerNumber = 1) {
        this.scene = scene;
        this.playerNumber = playerNumber;
        this.keys = {};
        this.touchState = {
            left: false,
            right: false,
            jump: false,
            punch: false,
            kick: false,
            special: false,
        };
        
        this._setupKeyboard();
    }

    /**
     * Configurar mapeo de teclado según el jugador
     */
    _setupKeyboard() {
        const config = this.playerNumber === 1 ? CONTROLS.P1 : CONTROLS.P2;
        
        this.keys = {
            left: this.scene.input.keyboard.addKey(
                Phaser.Input.Keyboard.KeyCodes[config.LEFT]
            ),
            right: this.scene.input.keyboard.addKey(
                Phaser.Input.Keyboard.KeyCodes[config.RIGHT]
            ),
            jump: this.scene.input.keyboard.addKey(
                Phaser.Input.Keyboard.KeyCodes[config.JUMP]
            ),
            punch: this.scene.input.keyboard.addKey(
                Phaser.Input.Keyboard.KeyCodes[config.PUNCH]
            ),
            kick: this.scene.input.keyboard.addKey(
                Phaser.Input.Keyboard.KeyCodes[config.KICK]
            ),
            special: this.scene.input.keyboard.addKey(
                Phaser.Input.Keyboard.KeyCodes[config.SPECIAL]
            ),
        };
    }

    // ==========================================
    // API PÚBLICA - Consulta de estado
    // ==========================================

    /**
     * ¿Se está moviendo a la izquierda?
     * @returns {boolean}
     */
    isLeft() {
        return this.keys.left.isDown || this.touchState.left;
    }

    /**
     * ¿Se está moviendo a la derecha?
     * @returns {boolean}
     */
    isRight() {
        return this.keys.right.isDown || this.touchState.right;
    }

    /**
     * ¿Se presionó saltar? (JustDown para un solo salto)
     * @returns {boolean}
     */
    isJump() {
        return Phaser.Input.Keyboard.JustDown(this.keys.jump) || this.touchState.jump;
    }

    /**
     * ¿Se presionó golpe?
     * @returns {boolean}
     */
    isPunch() {
        return Phaser.Input.Keyboard.JustDown(this.keys.punch) || this.touchState.punch;
    }

    /**
     * ¿Se presionó patada?
     * @returns {boolean}
     */
    isKick() {
        return Phaser.Input.Keyboard.JustDown(this.keys.kick) || this.touchState.kick;
    }

    /**
     * ¿Se presionó especial?
     * @returns {boolean}
     */
    isSpecial() {
        return Phaser.Input.Keyboard.JustDown(this.keys.special) || this.touchState.special;
    }

    /**
     * Obtener la dirección horizontal (-1, 0, 1)
     * @returns {number}
     */
    getHorizontal() {
        if (this.isLeft()) return -1;
        if (this.isRight()) return 1;
        return 0;
    }

    // ==========================================
    // TOUCH CONTROLS INTEGRATION
    // ==========================================

    /**
     * Establecer estado de un control táctil
     * @param {string} control - Nombre del control
     * @param {boolean} state - Estado activo/inactivo
     */
    setTouchState(control, state) {
        if (this.touchState.hasOwnProperty(control)) {
            this.touchState[control] = state;
        }
    }

    /**
     * Resetear todos los estados táctiles
     */
    resetTouch() {
        Object.keys(this.touchState).forEach(key => {
            this.touchState[key] = false;
        });
    }

    /**
     * Destruir referencias
     */
    destroy() {
        this.keys = {};
        this.touchState = {};
    }
}
