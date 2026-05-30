/**
 * ============================================
 * CharacterSelectScene.js - Selección de personaje
 * ============================================
 * Permite al jugador elegir entre 3 personajes.
 * Muestra preview con animación idle, stats visuales,
 * y nombre/descripción de cada personaje.
 */

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, SCENES } from '../config/gameConfig.js';
import { CHARACTERS } from '../config/characterData.js';
import Button from '../ui/Button.js';
import AudioManager from '../managers/AudioManager.js';

export default class CharacterSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.CHARACTER_SELECT });
    }

    create() {
        this.selectedIndex = 0;
        this.characterPreviews = [];
        this.statBars = [];
        
        // Audio
        this.audioManager = new AudioManager(this);
        this.audioManager.init();
        
        // ==========================================
        // FONDO
        // ==========================================
        const bg = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'character_select_bg');
        bg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
        bg.setAlpha(0.7);
        
        const overlay = this.add.rectangle(
            GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.3
        );
        
        // ==========================================
        // TÍTULO
        // ==========================================
        this.add.text(GAME_WIDTH / 2, 35, 'SELECCIONA TU LUCHADOR', {
            fontFamily: 'Orbitron, monospace',
            fontSize: '24px',
            color: COLORS.TEXT_CYAN,
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3,
        }).setOrigin(0.5);
        
        // ==========================================
        // TARJETAS DE PERSONAJES
        // ==========================================
        const cardWidth = 220;
        const cardHeight = 340;
        const spacing = 40;
        const totalWidth = CHARACTERS.length * cardWidth + (CHARACTERS.length - 1) * spacing;
        const startX = (GAME_WIDTH - totalWidth) / 2 + cardWidth / 2;
        
        CHARACTERS.forEach((charData, index) => {
            const x = startX + index * (cardWidth + spacing);
            const y = GAME_HEIGHT / 2 + 20;
            
            this._createCharacterCard(x, y, cardWidth, cardHeight, charData, index);
        });
        
        // ==========================================
        // DESCRIPCIÓN DEL PERSONAJE SELECCIONADO
        // ==========================================
        this.descText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 60, '', {
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '15px',
            color: '#bbbbbb',
            align: 'center',
            wordWrap: { width: 500 },
        }).setOrigin(0.5);
        
        // ==========================================
        // BOTONES
        // ==========================================
        new Button(this, GAME_WIDTH / 2 - 160, GAME_HEIGHT - 25, '← VOLVER', () => {
            this.scene.start(SCENES.MENU);
        }, { width: 180, height: 38, fontSize: '14px', bgColor: 0x2d3436 });
        
        // Seleccionar el primero por defecto
        this._selectCharacter(0);
        
        // Fade in
        this.cameras.main.fadeIn(400, 0, 0, 0);
    }

    /**
     * Crear una tarjeta de personaje
     */
    _createCharacterCard(x, y, w, h, charData, index) {
        // Fondo de la tarjeta
        const cardBg = this.add.graphics();
        cardBg.fillStyle(0x1a1a3e, 0.85);
        cardBg.fillRoundedRect(x - w/2, y - h/2, w, h, 12);
        cardBg.lineStyle(2, 0x333366, 0.6);
        cardBg.strokeRoundedRect(x - w/2, y - h/2, w, h, 12);
        
        // Almacenar referencia del fondo para el efecto de selección
        this.characterPreviews.push({ bg: cardBg, x, y, w, h, charData });
        
        // Fondo blanco sólido detrás de la imagen (como pidió el usuario)
        const whiteBg = this.add.graphics();
        whiteBg.fillStyle(0xffffff, 1);
        whiteBg.fillRoundedRect(x - 70, y - 130, 140, 160, 8); // Coincide con el tamaño de 140x160 de la imagen
        
        // Imagen del personaje (retrato limpio de presentación)
        const charImg = this.add.image(x, y - 50, charData.portraitKey || charData.imageKey);
        charImg.setDisplaySize(140, 160);
        
        // Animación idle (respiración)
        this.tweens.add({
            targets: charImg,
            scaleY: charImg.scaleY * 0.97,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
        
        // Nombre
        this.add.text(x, y + 15, charData.name, {
            fontFamily: 'Orbitron, monospace',
            fontSize: '14px',
            color: '#ffffff',
            fontStyle: 'bold',
        }).setOrigin(0.5);
        
        // Subtítulo
        this.add.text(x, y + 35, charData.subtitle, {
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '12px',
            color: `#${charData.tint.toString(16).padStart(6, '0')}`,
        }).setOrigin(0.5);
        
        // Stats bars
        const statsStartY = y + 58;
        const statNames = ['SPD', 'PWR', 'DEF', 'SPE'];
        const statKeys = ['speed', 'power', 'defense', 'special'];
        const statColors = [0x00e5ff, 0xff3366, 0x00ff88, 0xffd700];
        
        statKeys.forEach((key, i) => {
            const statY = statsStartY + i * 18;
            const value = charData.statsDisplay[key];
            
            // Label
            this.add.text(x - 85, statY, statNames[i], {
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: '11px',
                color: '#888888',
            });
            
            // Bar background
            const barG = this.add.graphics();
            barG.fillStyle(0x333333, 0.5);
            barG.fillRoundedRect(x - 55, statY + 2, 130, 8, 3);
            
            // Bar fill
            barG.fillStyle(statColors[i], 0.8);
            barG.fillRoundedRect(x - 55, statY + 2, 130 * (value / 100), 8, 3);
        });
        
        // Zona interactiva para seleccionar
        const hitZone = this.add.rectangle(x, y, w, h).setInteractive({ useHandCursor: true }).setAlpha(0.001);
        
        hitZone.on('pointerdown', () => {
            this._selectCharacter(index);
            this.audioManager.playSFX('sfx_menu_click');
        });
        
        hitZone.on('pointerover', () => {
            if (this.selectedIndex !== index) {
                cardBg.clear();
                cardBg.fillStyle(0x2a2a5e, 0.9);
                cardBg.fillRoundedRect(x - w/2, y - h/2, w, h, 12);
                cardBg.lineStyle(2, 0x555588, 0.8);
                cardBg.strokeRoundedRect(x - w/2, y - h/2, w, h, 12);
            }
        });
        
        hitZone.on('pointerout', () => {
            if (this.selectedIndex !== index) {
                cardBg.clear();
                cardBg.fillStyle(0x1a1a3e, 0.85);
                cardBg.fillRoundedRect(x - w/2, y - h/2, w, h, 12);
                cardBg.lineStyle(2, 0x333366, 0.6);
                cardBg.strokeRoundedRect(x - w/2, y - h/2, w, h, 12);
            }
        });
    }

    /**
     * Seleccionar un personaje
     */
    _selectCharacter(index) {
        this.selectedIndex = index;
        const charData = CHARACTERS[index];
        
        // Actualizar descripción
        this.descText.setText(charData.description);
        
        // Actualizar bordes de todas las tarjetas
        this.characterPreviews.forEach((preview, i) => {
            const { bg, x, y, w, h, glow } = preview;
            bg.clear();
            
            if (i === index) {
                // Seleccionado: borde brillante
                bg.fillStyle(0x2a2a6e, 0.95);
                bg.fillRoundedRect(x - w/2, y - h/2, w, h, 12);
                bg.lineStyle(3, charData.tint, 1);
                bg.strokeRoundedRect(x - w/2, y - h/2, w, h, 12);
                // Glow exterior
                bg.lineStyle(2, charData.tint, 0.3);
                bg.strokeRoundedRect(x - w/2 - 3, y - h/2 - 3, w + 6, h + 6, 14);
            } else {
                // No seleccionado
                bg.fillStyle(0x1a1a3e, 0.85);
                bg.fillRoundedRect(x - w/2, y - h/2, w, h, 12);
                bg.lineStyle(2, 0x333366, 0.6);
                bg.strokeRoundedRect(x - w/2, y - h/2, w, h, 12);
            }
        });
        
        // Destruir botón de confirmar anterior si existe
        if (this.confirmBtn) this.confirmBtn.destroy();
        
        // Botón confirmar
        this.confirmBtn = new Button(this, GAME_WIDTH / 2 + 160, GAME_HEIGHT - 25, '⚔ PELEAR', () => {
            this.cameras.main.fadeOut(400, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start(SCENES.FIGHT, { 
                    playerCharacter: charData.id 
                });
            });
        }, { 
            width: 180, height: 38, fontSize: '14px', 
            bgColor: charData.tint 
        });
    }
}
