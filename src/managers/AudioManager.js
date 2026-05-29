/**
 * ============================================
 * AudioManager.js - Gestión de audio del juego
 * ============================================
 * Maneja la reproducción de música de fondo y efectos
 * de sonido. Genera sonidos sintetizados con Web Audio API
 * directamente (sin depender del cache de Phaser).
 * Incluye toggle de mute con persistencia en localStorage.
 */

import StorageManager from './StorageManager.js';

export default class AudioManager {
    /**
     * @param {Phaser.Scene} scene - Escena de Phaser activa
     */
    constructor(scene) {
        this.scene = scene;
        this.buffers = {};
        this.musicSource = null;
        this.musicGain = null;
        this.ctx = null;
        
        // Cargar configuración guardada
        const config = StorageManager.getAudioConfig();
        this.musicVolume = config.musicVolume;
        this.sfxVolume = config.sfxVolume;
        this.muted = config.muted;
    }

    /**
     * Inicializar todos los sonidos del juego
     * Genera sonidos sintéticos usando Web Audio API directamente
     */
    init() {
        try {
            // Obtener o crear AudioContext
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this._createAllSounds();
        } catch (e) {
            console.warn('Web Audio API no disponible:', e);
            this.ctx = null;
        }
    }

    /**
     * Crear todos los sonidos sintetizados
     */
    _createAllSounds() {
        if (!this.ctx) return;
        const sr = this.ctx.sampleRate;

        // === EFECTO: Golpe / Punch ===
        this.buffers['sfx_punch'] = this._generateBuffer(sr, 0.15, (i, len) => {
            const t = i / len;
            const noise = Math.random() * 2 - 1;
            const env = Math.exp(-t * 20);
            return noise * env * 0.6;
        });

        // === EFECTO: Patada / Kick ===
        this.buffers['sfx_kick'] = this._generateBuffer(sr, 0.2, (i, len) => {
            const t = i / len;
            const freq = 100 * Math.exp(-t * 8);
            const sine = Math.sin(2 * Math.PI * freq * t);
            const noise = (Math.random() * 2 - 1) * Math.exp(-t * 15);
            const env = Math.exp(-t * 10);
            return (sine * 0.5 + noise * 0.5) * env * 0.7;
        });

        // === EFECTO: Especial ===
        this.buffers['sfx_special'] = this._generateBuffer(sr, 0.4, (i, len) => {
            const t = i / len;
            const freq = 200 + 400 * t;
            const sine = Math.sin(2 * Math.PI * freq * t);
            const env = Math.sin(Math.PI * t);
            return sine * env * 0.5;
        });

        // === EFECTO: Daño recibido ===
        this.buffers['sfx_hurt'] = this._generateBuffer(sr, 0.2, (i, len) => {
            const t = i / len;
            const freq = 300 * Math.exp(-t * 5);
            const sine = Math.sin(2 * Math.PI * freq * t);
            const env = Math.exp(-t * 8);
            return sine * env * 0.5;
        });

        // === EFECTO: Victoria ===
        this.buffers['sfx_victory'] = this._generateBuffer(sr, 0.6, (i, len) => {
            const t = i / len;
            const notes = [523.25, 659.25, 783.99, 1046.5];
            const noteIdx = Math.floor(t * notes.length);
            const freq = notes[Math.min(noteIdx, notes.length - 1)];
            const sine = Math.sin(2 * Math.PI * freq * t);
            const env = Math.sin(Math.PI * t);
            return sine * env * 0.4;
        });

        // === EFECTO: Derrota ===
        this.buffers['sfx_defeat'] = this._generateBuffer(sr, 0.5, (i, len) => {
            const t = i / len;
            const freq = 400 * Math.exp(-t * 3);
            const sine = Math.sin(2 * Math.PI * freq * t);
            const env = Math.exp(-t * 4);
            return sine * env * 0.5;
        });

        // === EFECTO: Click de menú ===
        this.buffers['sfx_menu_click'] = this._generateBuffer(sr, 0.08, (i, len) => {
            const t = i / len;
            const sine = Math.sin(2 * Math.PI * 800 * t);
            const env = Math.exp(-t * 30);
            return sine * env * 0.3;
        });

        // === EFECTO: Hover de menú ===
        this.buffers['sfx_menu_hover'] = this._generateBuffer(sr, 0.05, (i, len) => {
            const t = i / len;
            const sine = Math.sin(2 * Math.PI * 600 * t);
            const env = Math.exp(-t * 40);
            return sine * env * 0.2;
        });

        // === EFECTO: Round Start ===
        this.buffers['sfx_round_start'] = this._generateBuffer(sr, 0.3, (i, len) => {
            const t = i / len;
            const freq = 200 + 600 * t;
            const sine = Math.sin(2 * Math.PI * freq * t);
            const env = Math.sin(Math.PI * t);
            return sine * env * 0.5;
        });

        // === MÚSICA DE FONDO ===
        this.buffers['music_fight'] = this._generateMusicBuffer(sr);
    }

    /**
     * Generar un buffer de audio sintetizado
     */
    _generateBuffer(sampleRate, duration, generator) {
        const length = Math.floor(sampleRate * duration);
        const buffer = this.ctx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < length; i++) {
            data[i] = generator(i, length);
        }
        return buffer;
    }

    /**
     * Generar un loop de música electrónica
     */
    _generateMusicBuffer(sampleRate) {
        const duration = 4;
        const length = Math.floor(sampleRate * duration);
        const buffer = this.ctx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);
        const bpm = 140;
        const beatDuration = 60 / bpm;
        const beatSamples = Math.floor(sampleRate * beatDuration);

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const beatPos = (i % beatSamples) / beatSamples;
            
            // Bass drum
            const kick = Math.sin(2 * Math.PI * (150 * Math.exp(-beatPos * 10)) * beatPos)
                         * Math.exp(-beatPos * 8) * 0.3;
            
            // Hi-hat
            const halfBeat = (i % Math.floor(beatSamples / 2)) / Math.floor(beatSamples / 2);
            const hihat = (Math.random() * 2 - 1) * Math.exp(-halfBeat * 30) * 0.08;
            
            // Bass synth
            const noteIndex = Math.floor(t / beatDuration) % 8;
            const bassNotes = [110, 110, 146.83, 130.81, 110, 110, 164.81, 146.83];
            const bassFreq = bassNotes[noteIndex];
            const bass = Math.sin(2 * Math.PI * bassFreq * t) * 0.15;
            
            // Pad
            const pad = (Math.sin(2 * Math.PI * 220 * t) * 0.03 +
                         Math.sin(2 * Math.PI * 330 * t) * 0.02 +
                         Math.sin(2 * Math.PI * 440 * t) * 0.01) *
                        (0.5 + 0.5 * Math.sin(2 * Math.PI * 0.5 * t));
            
            data[i] = Math.max(-1, Math.min(1, kick + hihat + bass + pad));
        }
        return buffer;
    }

    // ==========================================
    // API PÚBLICA
    // ==========================================

    /**
     * Reproducir un efecto de sonido
     * @param {string} key - Nombre del sonido
     */
    playSFX(key) {
        if (this.muted || !this.ctx || !this.buffers[key]) return;
        try {
            // Reanudar contexto si está suspendido
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            const source = this.ctx.createBufferSource();
            const gain = this.ctx.createGain();
            source.buffer = this.buffers[key];
            gain.gain.value = this.sfxVolume;
            source.connect(gain);
            gain.connect(this.ctx.destination);
            source.start(0);
        } catch (e) {
            // Silenciar errores de audio
        }
    }

    /**
     * Iniciar música de fondo (loop)
     */
    playMusic() {
        if (this.muted || !this.ctx || !this.buffers['music_fight']) return;
        this.stopMusic(); // Detener si ya suena
        
        try {
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            this.musicSource = this.ctx.createBufferSource();
            this.musicGain = this.ctx.createGain();
            this.musicSource.buffer = this.buffers['music_fight'];
            this.musicSource.loop = true;
            this.musicGain.gain.value = this.musicVolume;
            this.musicSource.connect(this.musicGain);
            this.musicGain.connect(this.ctx.destination);
            this.musicSource.start(0);
        } catch (e) {
            // Silenciar errores
        }
    }

    /**
     * Detener música de fondo
     */
    stopMusic() {
        try {
            if (this.musicSource) {
                this.musicSource.stop();
                this.musicSource.disconnect();
                this.musicSource = null;
            }
        } catch (e) {
            this.musicSource = null;
        }
    }

    /**
     * Toggle mute/unmute
     * @returns {boolean} Nuevo estado de mute
     */
    toggleMute() {
        this.muted = !this.muted;
        
        if (this.muted) {
            this.stopMusic();
        } else {
            this.playMusic();
        }
        
        StorageManager.saveAudioConfig({
            musicVolume: this.musicVolume,
            sfxVolume: this.sfxVolume,
            muted: this.muted,
        });
        
        return this.muted;
    }

    /**
     * Verificar si está muteado
     * @returns {boolean}
     */
    isMuted() {
        return this.muted;
    }

    /**
     * Ajustar volumen de música
     */
    setMusicVolume(vol) {
        this.musicVolume = vol;
        if (this.musicGain) {
            this.musicGain.gain.value = vol;
        }
        StorageManager.saveAudioConfig({
            musicVolume: vol,
            sfxVolume: this.sfxVolume,
            muted: this.muted,
        });
    }

    /**
     * Ajustar volumen de efectos
     */
    setSFXVolume(vol) {
        this.sfxVolume = vol;
        StorageManager.saveAudioConfig({
            musicVolume: this.musicVolume,
            sfxVolume: vol,
            muted: this.muted,
        });
    }

    /**
     * Destruir (limpieza)
     */
    destroy() {
        this.stopMusic();
        this.buffers = {};
    }
}
