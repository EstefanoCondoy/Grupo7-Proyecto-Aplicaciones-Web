/**
 * ============================================
 * Button.js - Botón reutilizable para menús
 * ============================================
 * Componente de botón con estados de hover/click,
 * animaciones de escala, efecto de brillo y sonido.
 * Funciona tanto con mouse como con touch.
 */

import { COLORS } from '../config/gameConfig.js';

export default class Button {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x - Posición X (centro)
     * @param {number} y - Posición Y (centro)
     * @param {string} text - Texto del botón
     * @param {function} callback - Función al hacer click
     * @param {object} options - Opciones adicionales
     */
    constructor(scene, x, y, text, callback, options = {}) {
        this.scene = scene;
        this.callback = callback;
        
        const {
            width = 280,
            height = 50,
            fontSize = '20px',
            bgColor = COLORS.PRIMARY,
            hoverColor = COLORS.SECONDARY,
            textColor = '#ffffff',
            depth = 50,
        } = options;
        
        // ==========================================
        // FONDO DEL BOTÓN
        // ==========================================
        this.bg = scene.add.graphics();
        this._drawBg(x, y, width, height, bgColor, 0.8);
        this.bg.setDepth(depth);
        
        // Zona interactiva
        this.hitArea = scene.add.rectangle(x, y, width, height)
            .setInteractive({ useHandCursor: true })
            .setDepth(depth + 2)
            .setAlpha(0.001); // Invisible pero clickeable
        
        // ==========================================
        // TEXTO
        // ==========================================
        this.text = scene.add.text(x, y, text, {
            fontFamily: 'Orbitron, monospace',
            fontSize: fontSize,
            color: textColor,
            fontStyle: 'bold',
        }).setOrigin(0.5).setDepth(depth + 1);
        
        // ==========================================
        // EFECTOS DE INTERACCIÓN
        // ==========================================
        this.bgColor = bgColor;
        this.hoverColor = hoverColor;
        this.btnX = x;
        this.btnY = y;
        this.btnWidth = width;
        this.btnHeight = height;
        
        // Hover
        this.hitArea.on('pointerover', () => {
            this._drawBg(x, y, width, height, hoverColor, 0.9);
            scene.tweens.add({
                targets: [this.text],
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 100,
                ease: 'Power2',
            });
            
            // Sonido de hover
            if (scene.audioManager) {
                scene.audioManager.playSFX('sfx_menu_hover');
            }
        });
        
        // Salir del hover
        this.hitArea.on('pointerout', () => {
            this._drawBg(x, y, width, height, bgColor, 0.8);
            scene.tweens.add({
                targets: [this.text],
                scaleX: 1,
                scaleY: 1,
                duration: 100,
            });
        });
        
        // Click
        this.hitArea.on('pointerdown', () => {
            this._drawBg(x, y, width, height, 0xffffff, 0.3);
            scene.tweens.add({
                targets: [this.text],
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 50,
                yoyo: true,
                onComplete: () => {
                    // Sonido de click
                    if (scene.audioManager) {
                        scene.audioManager.playSFX('sfx_menu_click');
                    }
                    if (this.callback) this.callback();
                },
            });
        });
    }

    /**
     * Dibujar el fondo del botón
     */
    _drawBg(x, y, w, h, color, alpha) {
        this.bg.clear();
        
        // Sombra
        this.bg.fillStyle(0x000000, 0.3);
        this.bg.fillRoundedRect(x - w/2 + 3, y - h/2 + 3, w, h, 10);
        
        // Fondo principal
        this.bg.fillStyle(color, alpha);
        this.bg.fillRoundedRect(x - w/2, y - h/2, w, h, 10);
        
        // Borde
        this.bg.lineStyle(2, 0xffffff, 0.3);
        this.bg.strokeRoundedRect(x - w/2, y - h/2, w, h, 10);
        
        // Brillo superior
        this.bg.fillStyle(0xffffff, 0.1);
        this.bg.fillRoundedRect(x - w/2 + 4, y - h/2 + 2, w - 8, h/3, { tl: 8, tr: 8, bl: 0, br: 0 });
    }

    /**
     * Establecer visibilidad
     */
    setVisible(visible) {
        this.bg.setVisible(visible);
        this.text.setVisible(visible);
        this.hitArea.setVisible(visible);
        return this;
    }

    /**
     * Destruir
     */
    destroy() {
        this.bg.destroy();
        this.text.destroy();
        this.hitArea.destroy();
    }
}
