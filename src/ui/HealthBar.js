/**
 * ============================================
 * HealthBar.js - Barra de vida dinámica
 * ============================================
 * Dibuja una barra de vida con borde, fondo y relleno.
 * El color cambia dinámicamente según el porcentaje de HP:
 * verde → amarillo → rojo. Incluye animación suave de
 * reducción con tweens.
 */

import { COLORS } from '../config/gameConfig.js';

export default class HealthBar {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     * @param {number} width - Ancho de la barra
     * @param {number} height - Alto de la barra
     * @param {boolean} flipped - Si la barra se llena desde la derecha
     * @param {string} name - Nombre del personaje
     * @param {number} tintColor - Color del personaje
     */
    constructor(scene, x, y, width, height, flipped = false, name = '', tintColor = 0xffffff) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.flipped = flipped;
        this.maxValue = 100;
        this.currentValue = 100;
        this.displayValue = 100; // Para animación suave
        this.tintColor = tintColor;
        
        // Crear contenedor gráfico
        this._createBar(name);
    }

    /**
     * Crear los elementos gráficos de la barra
     */
    _createBar(name) {
        // Fondo oscuro de la barra
        this.bgBar = this.scene.add.graphics();
        this.bgBar.setDepth(100);
        
        // Barra de "daño" (muestra el daño reciente en color diferente)
        this.damageBar = this.scene.add.graphics();
        this.damageBar.setDepth(101);
        
        // Barra de vida principal
        this.healthBar = this.scene.add.graphics();
        this.healthBar.setDepth(102);
        
        // Borde
        this.border = this.scene.add.graphics();
        this.border.setDepth(103);
        
        // Nombre del personaje
        if (name) {
            const nameX = this.flipped ? this.x + this.width : this.x;
            const align = this.flipped ? 'right' : 'left';
            
            this.nameText = this.scene.add.text(nameX, this.y - 22, name, {
                fontFamily: 'Orbitron, monospace',
                fontSize: '14px',
                color: '#ffffff',
                fontStyle: 'bold',
            }).setOrigin(this.flipped ? 1 : 0, 0).setDepth(103);
        }
        
        // Texto de HP
        this.hpText = this.scene.add.text(
            this.x + this.width / 2, 
            this.y + this.height / 2, 
            '100', 
            {
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: '12px',
                color: '#ffffff',
                fontStyle: 'bold',
            }
        ).setOrigin(0.5).setDepth(104);
        
        // Dibujar estado inicial
        this._drawBorder();
        this._drawBackground();
        this._drawHealth(1);
    }

    /**
     * Dibujar el borde de la barra
     */
    _drawBorder() {
        this.border.clear();
        this.border.lineStyle(2, 0xffffff, 0.8);
        this.border.strokeRoundedRect(
            this.x - 2, this.y - 2, 
            this.width + 4, this.height + 4, 
            4
        );
        
        // Brillo del color del personaje
        this.border.lineStyle(1, this.tintColor, 0.4);
        this.border.strokeRoundedRect(
            this.x - 3, this.y - 3, 
            this.width + 6, this.height + 6, 
            5
        );
    }

    /**
     * Dibujar el fondo de la barra
     */
    _drawBackground() {
        this.bgBar.clear();
        this.bgBar.fillStyle(COLORS.HEALTH_BG, 0.8);
        this.bgBar.fillRoundedRect(this.x, this.y, this.width, this.height, 3);
    }

    /**
     * Dibujar la barra de vida
     * @param {number} percent - 0 a 1
     */
    _drawHealth(percent) {
        this.healthBar.clear();
        
        if (percent <= 0) return;
        
        // Determinar color según porcentaje
        let color;
        if (percent > 0.6) {
            color = COLORS.HEALTH_HIGH;
        } else if (percent > 0.3) {
            color = COLORS.HEALTH_MID;
        } else {
            color = COLORS.HEALTH_LOW;
        }
        
        const barWidth = Math.max(0, this.width * percent);
        const barX = this.flipped ? this.x + (this.width - barWidth) : this.x;
        
        // Barra principal
        this.healthBar.fillStyle(color, 1);
        this.healthBar.fillRoundedRect(barX, this.y, barWidth, this.height, 3);
        
        // Brillo superior
        this.healthBar.fillStyle(0xffffff, 0.2);
        this.healthBar.fillRoundedRect(barX, this.y, barWidth, this.height / 3, 3);
    }

    /**
     * Dibujar la barra de daño (efecto de daño gradual)
     * @param {number} percent - 0 a 1
     */
    _drawDamage(percent) {
        this.damageBar.clear();
        
        if (percent <= 0) return;
        
        const barWidth = Math.max(0, this.width * percent);
        const barX = this.flipped ? this.x + (this.width - barWidth) : this.x;
        
        this.damageBar.fillStyle(0xff4444, 0.6);
        this.damageBar.fillRoundedRect(barX, this.y, barWidth, this.height, 3);
    }

    // ==========================================
    // API PÚBLICA
    // ==========================================

    /**
     * Establecer valor de la barra
     * @param {number} value - Valor actual
     * @param {number} maxValue - Valor máximo
     */
    setValue(value, maxValue) {
        this.maxValue = maxValue;
        const oldValue = this.currentValue;
        this.currentValue = Math.max(0, Math.min(value, maxValue));
        
        const percent = this.currentValue / this.maxValue;
        
        // Mostrar la barra de daño (valor anterior)
        const oldPercent = oldValue / this.maxValue;
        this._drawDamage(oldPercent);
        
        // Animar la barra de daño desapareciendo
        if (oldValue > this.currentValue) {
            this.scene.tweens.add({
                targets: { val: oldPercent },
                val: percent,
                duration: 600,
                ease: 'Power2',
                onUpdate: (tween) => {
                    this._drawDamage(tween.getValue());
                },
            });
        }
        
        // Actualizar barra de vida
        this._drawHealth(percent);
        
        // Actualizar texto
        this.hpText.setText(Math.ceil(this.currentValue).toString());
        
        // Efecto de flash si perdió vida
        if (this.currentValue < oldValue) {
            this.scene.tweens.add({
                targets: this.hpText,
                scaleX: 1.5,
                scaleY: 1.5,
                duration: 100,
                yoyo: true,
            });
        }
    }

    /**
     * Establecer la profundidad de todos los elementos
     * @param {number} depth
     */
    setDepth(depth) {
        this.bgBar.setDepth(depth);
        this.damageBar.setDepth(depth + 1);
        this.healthBar.setDepth(depth + 2);
        this.border.setDepth(depth + 3);
        if (this.nameText) this.nameText.setDepth(depth + 3);
        this.hpText.setDepth(depth + 4);
    }

    /**
     * Destruir todos los elementos
     */
    destroy() {
        this.bgBar.destroy();
        this.damageBar.destroy();
        this.healthBar.destroy();
        this.border.destroy();
        if (this.nameText) this.nameText.destroy();
        this.hpText.destroy();
    }
}
