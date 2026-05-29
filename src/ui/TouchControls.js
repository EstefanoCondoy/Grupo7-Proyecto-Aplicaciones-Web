/**
 * ============================================
 * TouchControls.js - Controles táctiles para móvil
 * ============================================
 * Crea un D-pad virtual en el lado izquierdo y botones
 * de ataque en el lado derecho. Solo se muestra en
 * dispositivos táctiles. Se integra con InputManager
 * a través de setTouchState().
 */

import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/gameConfig.js';

export default class TouchControls {
    /**
     * @param {Phaser.Scene} scene
     * @param {import('../managers/InputManager.js').default} inputManager
     */
    constructor(scene, inputManager) {
        this.scene = scene;
        this.inputManager = inputManager;
        this.buttons = [];
        this.visible = false;
        
        // Detectar si es dispositivo táctil
        this.isTouchDevice = this._detectTouch();
        
        if (this.isTouchDevice) {
            this._createControls();
            this.visible = true;
        }
    }

    /**
     * Detectar dispositivo táctil
     */
    _detectTouch() {
        return ('ontouchstart' in window) || 
               (navigator.maxTouchPoints > 0) ||
               (window.innerWidth <= 1024);
    }

    /**
     * Crear todos los controles táctiles
     */
    _createControls() {
        const padding = 20;
        const btnSize = 52;
        const dpadY = GAME_HEIGHT - 90;
        const dpadX = 80;
        const attackY = GAME_HEIGHT - 90;
        const attackX = GAME_WIDTH - 80;
        
        // ==========================================
        // D-PAD (Izquierda)
        // ==========================================
        
        // Fondo del D-pad
        const dpadBg = this.scene.add.circle(dpadX, dpadY, 70, 0x000000, 0.3);
        dpadBg.setDepth(200);
        this.buttons.push(dpadBg);
        
        // Botón Izquierda
        this._createTouchButton(
            dpadX - 45, dpadY, btnSize, btnSize,
            '◀', 'left', COLORS.SECONDARY
        );
        
        // Botón Derecha
        this._createTouchButton(
            dpadX + 45, dpadY, btnSize, btnSize,
            '▶', 'right', COLORS.SECONDARY
        );
        
        // Botón Salto (Arriba)
        this._createTouchButton(
            dpadX, dpadY - 50, btnSize, btnSize,
            '▲', 'jump', COLORS.SECONDARY
        );
        
        // ==========================================
        // BOTONES DE ATAQUE (Derecha)
        // ==========================================
        
        // Golpe (superior)
        this._createTouchButton(
            attackX - 35, attackY - 30, 55, 55,
            '👊', 'punch', 0xff6b35, 'Golpe'
        );
        
        // Patada (inferior derecho)
        this._createTouchButton(
            attackX + 35, attackY - 30, 55, 55,
            '🦶', 'kick', 0xff3366, 'Patada'
        );
        
        // Especial (centro abajo)
        this._createTouchButton(
            attackX, attackY + 30, 60, 60,
            '⚡', 'special', 0xffd700, 'Especial'
        );
    }

    /**
     * Crear un botón táctil individual
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     * @param {string} label
     * @param {string} action
     * @param {number} color
     * @param {string} text - Texto adicional
     */
    _createTouchButton(x, y, w, h, label, action, color, text = '') {
        // Fondo del botón
        const bg = this.scene.add.circle(x, y, w / 2, color, 0.3);
        bg.setStrokeStyle(2, color, 0.6);
        bg.setDepth(201);
        bg.setInteractive();
        
        // Icono
        const icon = this.scene.add.text(x, y - (text ? 5 : 0), label, {
            fontSize: '22px',
        }).setOrigin(0.5).setDepth(202);
        
        // Texto descriptivo
        let textObj = null;
        if (text) {
            textObj = this.scene.add.text(x, y + 15, text, {
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: '10px',
                color: '#ffffff',
            }).setOrigin(0.5).setDepth(202);
            this.buttons.push(textObj);
        }
        
        // Eventos táctiles
        bg.on('pointerdown', () => {
            this.inputManager.setTouchState(action, true);
            bg.setFillStyle(color, 0.6);
            bg.setScale(0.9);
        });
        
        bg.on('pointerup', () => {
            this.inputManager.setTouchState(action, false);
            bg.setFillStyle(color, 0.3);
            bg.setScale(1);
        });
        
        bg.on('pointerout', () => {
            this.inputManager.setTouchState(action, false);
            bg.setFillStyle(color, 0.3);
            bg.setScale(1);
        });
        
        this.buttons.push(bg, icon);
    }

    /**
     * Mostrar/ocultar controles
     * @param {boolean} visible
     */
    setVisible(visible) {
        this.visible = visible;
        this.buttons.forEach(btn => btn.setVisible(visible));
    }

    /**
     * Destruir controles
     */
    destroy() {
        this.buttons.forEach(btn => btn.destroy());
        this.buttons = [];
    }
}
