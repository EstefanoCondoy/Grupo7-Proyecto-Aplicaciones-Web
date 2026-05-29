/**
 * ============================================
 * StorageManager.js - Persistencia con localStorage
 * ============================================
 * Gestiona el guardado y carga de datos del juego
 * usando localStorage: high scores, niveles,
 * configuración de audio y progreso general.
 */

import { STORAGE_KEYS, AUDIO } from '../config/gameConfig.js';

export default class StorageManager {
    
    /**
     * Verificar si localStorage está disponible
     * @returns {boolean}
     */
    static isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('localStorage no disponible:', e);
            return false;
        }
    }

    // ==========================================
    // HIGH SCORE
    // ==========================================

    /**
     * Guardar high score si es mayor al actual
     * @param {number} score - Puntaje a guardar
     * @returns {boolean} true si es nuevo record
     */
    static saveHighScore(score) {
        if (!this.isAvailable()) return false;
        const current = this.getHighScore();
        if (score > current) {
            localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, JSON.stringify(score));
            return true;
        }
        return false;
    }

    /**
     * Obtener el high score guardado
     * @returns {number} High score o 0
     */
    static getHighScore() {
        if (!this.isAvailable()) return 0;
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.HIGH_SCORE);
            return saved ? JSON.parse(saved) : 0;
        } catch {
            return 0;
        }
    }

    // ==========================================
    // NIVEL
    // ==========================================

    /**
     * Guardar nivel alcanzado
     * @param {number} level - Nivel a guardar
     */
    static saveLevel(level) {
        if (!this.isAvailable()) return;
        localStorage.setItem(STORAGE_KEYS.LEVEL, JSON.stringify(level));
    }

    /**
     * Obtener nivel guardado
     * @returns {number} Nivel o 1
     */
    static getLevel() {
        if (!this.isAvailable()) return 1;
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.LEVEL);
            return saved ? JSON.parse(saved) : 1;
        } catch {
            return 1;
        }
    }

    // ==========================================
    // CONFIGURACIÓN DE AUDIO
    // ==========================================

    /**
     * Guardar configuración de audio
     * @param {object} config - { musicVolume, sfxVolume, muted }
     */
    static saveAudioConfig(config) {
        if (!this.isAvailable()) return;
        localStorage.setItem(STORAGE_KEYS.AUDIO_CONFIG, JSON.stringify(config));
    }

    /**
     * Obtener configuración de audio
     * @returns {object} Configuración de audio
     */
    static getAudioConfig() {
        if (!this.isAvailable()) {
            return {
                musicVolume: AUDIO.MUSIC_VOLUME,
                sfxVolume: AUDIO.SFX_VOLUME,
                muted: false,
            };
        }
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.AUDIO_CONFIG);
            return saved ? JSON.parse(saved) : {
                musicVolume: AUDIO.MUSIC_VOLUME,
                sfxVolume: AUDIO.SFX_VOLUME,
                muted: false,
            };
        } catch {
            return {
                musicVolume: AUDIO.MUSIC_VOLUME,
                sfxVolume: AUDIO.SFX_VOLUME,
                muted: false,
            };
        }
    }

    // ==========================================
    // PROGRESO GENERAL
    // ==========================================

    /**
     * Guardar progreso del juego
     * @param {object} data - Datos de progreso
     */
    static saveProgress(data) {
        if (!this.isAvailable()) return;
        const current = this.getProgress();
        const merged = { ...current, ...data };
        localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(merged));
    }

    /**
     * Obtener progreso del juego
     * @returns {object} Datos de progreso
     */
    static getProgress() {
        if (!this.isAvailable()) {
            return { winsTotal: 0, roundsPlayed: 0, lastCharacter: null };
        }
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.PROGRESS);
            return saved ? JSON.parse(saved) : {
                winsTotal: 0,
                roundsPlayed: 0,
                lastCharacter: null,
            };
        } catch {
            return { winsTotal: 0, roundsPlayed: 0, lastCharacter: null };
        }
    }

    /**
     * Limpiar todos los datos guardados
     */
    static clearAll() {
        if (!this.isAvailable()) return;
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    }
}
