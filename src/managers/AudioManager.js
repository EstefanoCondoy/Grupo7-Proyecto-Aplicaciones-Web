/**
 * ============================================
 * AudioManager.js - Gestión de audio del juego
 * ============================================
 * Maneja la reproducción de música de fondo y efectos
 * de sonido. Genera sonidos sintetizados con Web Audio API
 * directamente (sin depender del cache de Phaser).
 * Incluye toggle de mute con persistencia en localStorage.
 * 
 * MEJORAS v2: Música más larga (12s fight, 8s menu),
 * con melodía reconocible, más capas, SFX más contundentes.
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

        // === EFECTO: Golpe / Punch (más contundente) ===
        this.buffers['sfx_punch'] = this._generateBuffer(sr, 0.2, (i, len) => {
            const t = i / len;
            // Componente de impacto grave
            const impact = Math.sin(2 * Math.PI * 80 * Math.exp(-t * 12) * t) * Math.exp(-t * 10) * 0.6;
            // Noise burst corto
            const noise = (Math.random() * 2 - 1) * Math.exp(-t * 25) * 0.4;
            // Crunch medio
            const crunch = Math.sin(2 * Math.PI * 200 * t) * Math.exp(-t * 18) * 0.3;
            return Math.max(-1, Math.min(1, (impact + noise + crunch) * 0.8));
        });

        // === EFECTO: Patada / Kick (más potente y profunda) ===
        this.buffers['sfx_kick'] = this._generateBuffer(sr, 0.3, (i, len) => {
            const t = i / len;
            // Boom grave profundo
            const freq = 60 * Math.exp(-t * 6);
            const boom = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 6) * 0.5;
            // Whip/swoosh
            const swoosh = (Math.random() * 2 - 1) * Math.exp(-t * 10) * 0.3;
            // Mid crunch
            const mid = Math.sin(2 * Math.PI * 300 * Math.exp(-t * 8) * t) * Math.exp(-t * 12) * 0.3;
            return Math.max(-1, Math.min(1, (boom + swoosh + mid) * 0.8));
        });

        // === EFECTO: Especial (energía creciente + explosión) ===
        this.buffers['sfx_special'] = this._generateBuffer(sr, 0.5, (i, len) => {
            const t = i / len;
            // Sweep de frecuencia ascendente
            const freq1 = 150 + 800 * t * t;
            const sweep = Math.sin(2 * Math.PI * freq1 * t) * 0.3;
            // Armonico
            const harm = Math.sin(2 * Math.PI * freq1 * 1.5 * t) * 0.15;
            // Explosión al final
            const explosion = t > 0.7 ? (Math.random() * 2 - 1) * Math.exp(-(t - 0.7) * 15) * 0.4 : 0;
            // Envolvente
            const env = Math.sin(Math.PI * t) * (1 + (t > 0.7 ? 0.5 : 0));
            return Math.max(-1, Math.min(1, (sweep + harm + explosion) * env * 0.6));
        });

        // === EFECTO: Daño recibido (más doloroso) ===
        this.buffers['sfx_hurt'] = this._generateBuffer(sr, 0.25, (i, len) => {
            const t = i / len;
            const freq = 400 * Math.exp(-t * 6);
            const sine = Math.sin(2 * Math.PI * freq * t);
            const noise = (Math.random() * 2 - 1) * Math.exp(-t * 12) * 0.3;
            const env = Math.exp(-t * 7);
            return (sine * 0.4 + noise) * env * 0.6;
        });

        // === EFECTO: Victoria (fanfarria triunfal) ===
        this.buffers['sfx_victory'] = this._generateBuffer(sr, 0.8, (i, len) => {
            const t = i / len;
            // Secuencia de notas ascendente (C5, E5, G5, C6)
            const notes = [523.25, 659.25, 783.99, 1046.5];
            const noteDur = 1 / notes.length;
            const noteIdx = Math.min(Math.floor(t / noteDur), notes.length - 1);
            const noteT = (t - noteIdx * noteDur) / noteDur;
            const freq = notes[noteIdx];
            // Onda principal con armónico
            const main = Math.sin(2 * Math.PI * freq * t) * 0.3;
            const harm = Math.sin(2 * Math.PI * freq * 2 * t) * 0.1;
            const harm2 = Math.sin(2 * Math.PI * freq * 3 * t) * 0.05;
            // Envolvente por nota
            const noteEnv = Math.exp(-noteT * 3) * 0.8 + 0.2;
            // Envolvente global
            const globalEnv = t < 0.05 ? t / 0.05 : (t > 0.85 ? (1 - t) / 0.15 : 1);
            return (main + harm + harm2) * noteEnv * globalEnv * 0.7;
        });

        // === EFECTO: Derrota (sonido triste descendente) ===
        this.buffers['sfx_defeat'] = this._generateBuffer(sr, 0.6, (i, len) => {
            const t = i / len;
            // Notas descendentes (C4, Bb3, Ab3, G3)
            const notes = [261.63, 233.08, 207.65, 196.0];
            const noteDur = 1 / notes.length;
            const noteIdx = Math.min(Math.floor(t / noteDur), notes.length - 1);
            const freq = notes[noteIdx];
            const sine = Math.sin(2 * Math.PI * freq * t);
            const env = Math.exp(-t * 2.5) * 0.5;
            return sine * env;
        });

        // === EFECTO: Click de menú ===
        this.buffers['sfx_menu_click'] = this._generateBuffer(sr, 0.1, (i, len) => {
            const t = i / len;
            const sine = Math.sin(2 * Math.PI * 900 * t);
            const click = Math.sin(2 * Math.PI * 1200 * t) * 0.3;
            const env = Math.exp(-t * 35);
            return (sine + click) * env * 0.3;
        });

        // === EFECTO: Hover de menú ===
        this.buffers['sfx_menu_hover'] = this._generateBuffer(sr, 0.06, (i, len) => {
            const t = i / len;
            const sine = Math.sin(2 * Math.PI * 700 * t);
            const env = Math.exp(-t * 40);
            return sine * env * 0.2;
        });

        // === EFECTO: Round Start (anuncio épico) ===
        this.buffers['sfx_round_start'] = this._generateBuffer(sr, 0.5, (i, len) => {
            const t = i / len;
            // Nota grave + armónicos ascendentes
            const base = Math.sin(2 * Math.PI * 130.81 * t) * 0.3;
            const fifth = Math.sin(2 * Math.PI * 196 * t) * 0.2;
            const oct = Math.sin(2 * Math.PI * 261.63 * t) * 0.15;
            // Sweep ascendente
            const sweepFreq = 200 + 600 * t;
            const sweep = Math.sin(2 * Math.PI * sweepFreq * t) * 0.1 * t;
            // Envolvente
            const env = t < 0.1 ? t / 0.1 : Math.exp(-(t - 0.1) * 3);
            return (base + fifth + oct + sweep) * env * 0.7;
        });

        // === MÚSICA DE COMBATE (12 segundos, más elaborada) ===
        this.buffers['music_fight'] = this._generateFightMusic(sr);
        
        // === MÚSICA DE MENÚ (8 segundos, más atmosférica) ===
        this.buffers['music_menu'] = this._generateMenuMusic(sr);
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
     * Generar música de combate épica (12 segundos)
     * Estilo: Dark electronic / fight theme
     * Tempo: 140 BPM, Key: Am
     */
    _generateFightMusic(sampleRate) {
        const duration = 12;
        const length = Math.floor(sampleRate * duration);
        const buffer = this.ctx.createBuffer(2, length, sampleRate);
        const dataL = buffer.getChannelData(0);
        const dataR = buffer.getChannelData(1);
        const bpm = 140;
        const beatDuration = 60 / bpm;
        const beatSamples = Math.floor(sampleRate * beatDuration);
        const sixteenthSamples = Math.floor(beatSamples / 4);

        // Secuencia de notas del bajo (Am pentatónica)
        // 8 compases de 4/4 = 32 beats
        const bassPattern = [
            110, 110, 110, 110,     // Am
            110, 110, 130.81, 130.81, // Am -> C
            146.83, 146.83, 146.83, 146.83, // D
            130.81, 130.81, 110, 110,  // C -> Am
            110, 110, 110, 110,     // Am
            164.81, 164.81, 146.83, 146.83, // E -> D
            130.81, 130.81, 146.83, 146.83, // C -> D
            110, 110, 130.81, 110,  // Am -> C -> Am
        ];

        // Melodía (pentatónica de Am: A, C, D, E, G)
        const melodyPattern = [
            // Frase 1 (beats 0-7)
            440, 0, 523.25, 0, 440, 392, 0, 0,
            // Frase 2 (beats 8-15)
            523.25, 0, 587.33, 523.25, 440, 0, 392, 0,
            // Frase 3 (beats 16-23)
            587.33, 0, 659.25, 0, 587.33, 523.25, 0, 440,
            // Frase 4 (beats 24-31) - resolución
            523.25, 0, 440, 392, 440, 0, 0, 0,
        ];

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const globalBeat = Math.floor(i / beatSamples);
            const beatPos = (i % beatSamples) / beatSamples;
            const sixteenthPos = (i % sixteenthSamples) / sixteenthSamples;
            
            // ─── KICK DRUM (cuatro en el piso) ───
            const kick = Math.sin(2 * Math.PI * (180 * Math.exp(-beatPos * 12)) * beatPos)
                         * Math.exp(-beatPos * 7) * 0.28;
            
            // ─── SNARE (beats 2 y 4) ───
            let snare = 0;
            if (globalBeat % 2 === 1) {
                snare = (Math.random() * 2 - 1) * Math.exp(-beatPos * 12) * 0.15;
                // Tonal component
                snare += Math.sin(2 * Math.PI * 250 * beatPos) * Math.exp(-beatPos * 15) * 0.08;
            }
            
            // ─── HI-HAT (cada octavo) ───
            const eighthPos = (i % Math.floor(beatSamples / 2)) / Math.floor(beatSamples / 2);
            const hihat = (Math.random() * 2 - 1) * Math.exp(-eighthPos * 35) * 0.06;
            
            // ─── HI-HAT OPEN (cada 4to beat, offbeat) ───
            let hihatOpen = 0;
            if (globalBeat % 4 === 3) {
                const offbeatPos = beatPos > 0.5 ? (beatPos - 0.5) * 2 : -1;
                if (offbeatPos >= 0) {
                    hihatOpen = (Math.random() * 2 - 1) * Math.exp(-offbeatPos * 8) * 0.04;
                }
            }
            
            // ─── BASS SYNTH (grueso y profundo) ───
            const bassIdx = Math.min(globalBeat, bassPattern.length - 1) % bassPattern.length;
            const bassFreq = bassPattern[bassIdx];
            // Saw wave bass (suma de armónicos)
            let bass = 0;
            for (let h = 1; h <= 4; h++) {
                bass += Math.sin(2 * Math.PI * bassFreq * h * t) / h;
            }
            bass *= 0.12;
            // Envolvente del bajo (ataque rápido, sustain)
            const bassEnv = Math.min(1, beatPos * 20) * (1 - beatPos * 0.3);
            bass *= bassEnv;
            
            // ─── LEAD MELODY ───
            let melody = 0;
            const melodyIdx = Math.min(globalBeat, melodyPattern.length - 1) % melodyPattern.length;
            const melFreq = melodyPattern[melodyIdx];
            if (melFreq > 0) {
                // Square wave suave
                const sq = Math.sin(2 * Math.PI * melFreq * t) > 0 ? 1 : -1;
                const sin = Math.sin(2 * Math.PI * melFreq * t);
                melody = (sq * 0.3 + sin * 0.7) * 0.08;
                // Envolvente de nota
                const melEnv = Math.exp(-beatPos * 2) * 0.8 + 0.2;
                melody *= melEnv;
                // Vibrato sutil
                melody *= (1 + 0.02 * Math.sin(2 * Math.PI * 5 * t));
            }
            
            // ─── PAD ATMOSFÉRICO (acordes) ───
            // Acorde Am: A3, C4, E4
            const padPhase = Math.sin(2 * Math.PI * 0.25 * t); // LFO lento
            const padVol = 0.03 * (0.5 + 0.5 * padPhase);
            const pad = (
                Math.sin(2 * Math.PI * 220 * t) +
                Math.sin(2 * Math.PI * 261.63 * t) * 0.8 +
                Math.sin(2 * Math.PI * 329.63 * t) * 0.6
            ) * padVol;
            
            // ─── FILL DE BATERÍA (cada 8 beats) ───
            let fill = 0;
            if ((globalBeat % 8) >= 7) {
                // Fill rápido de sixteenths
                fill = (Math.random() * 2 - 1) * Math.exp(-sixteenthPos * 20) * 0.08;
            }

            // ─── MEZCLA FINAL ───
            const mixL = kick + snare + hihat + hihatOpen + bass + melody + pad + fill;
            const mixR = kick + snare + hihat * 0.7 + hihatOpen * 1.3 + bass + melody + pad * 1.1 + fill;
            
            dataL[i] = Math.max(-0.95, Math.min(0.95, mixL));
            dataR[i] = Math.max(-0.95, Math.min(0.95, mixR));
        }
        return buffer;
    }

    /**
     * Generar música de menú atmosférica (8 segundos)
     * Estilo: Ambient cyberpunk, más tranquilo
     */
    _generateMenuMusic(sampleRate) {
        const duration = 8;
        const length = Math.floor(sampleRate * duration);
        const buffer = this.ctx.createBuffer(2, length, sampleRate);
        const dataL = buffer.getChannelData(0);
        const dataR = buffer.getChannelData(1);

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            
            // ─── PAD PRINCIPAL (Am7) ───
            const lfo = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.15 * t);
            const padA = Math.sin(2 * Math.PI * 110 * t) * 0.08;
            const padC = Math.sin(2 * Math.PI * 130.81 * t) * 0.06;
            const padE = Math.sin(2 * Math.PI * 164.81 * t) * 0.05;
            const padG = Math.sin(2 * Math.PI * 196 * t) * 0.04;
            const pad = (padA + padC + padE + padG) * lfo;
            
            // ─── ARPEGIO LENTO ───
            const arpNotes = [220, 261.63, 329.63, 392, 329.63, 261.63];
            const arpSpeed = 1.5; // Nota cada 1.5 segundos
            const arpIdx = Math.floor(t / arpSpeed) % arpNotes.length;
            const arpT = (t % arpSpeed) / arpSpeed;
            const arpFreq = arpNotes[arpIdx];
            const arp = Math.sin(2 * Math.PI * arpFreq * t) * 0.06 
                      * Math.exp(-arpT * 2) * (0.5 + 0.5 * Math.sin(Math.PI * arpT * 0.5));
            
            // ─── SUB BASS LENTO ───
            const subBassNotes = [55, 55, 65.41, 55];
            const subIdx = Math.floor(t / 2) % subBassNotes.length;
            const subFreq = subBassNotes[subIdx];
            const subBass = Math.sin(2 * Math.PI * subFreq * t) * 0.1;
            
            // ─── SHIMMER / BRILLO ───
            const shimmer = (
                Math.sin(2 * Math.PI * 880 * t) * 0.01 +
                Math.sin(2 * Math.PI * 1108.73 * t) * 0.008 +
                Math.sin(2 * Math.PI * 1318.51 * t) * 0.006
            ) * (0.3 + 0.7 * Math.sin(2 * Math.PI * 0.2 * t + 1));
            
            // ─── MEZCLA ───
            const mixL = pad + arp + subBass + shimmer;
            const mixR = pad + arp * 0.8 + subBass + shimmer * 1.3;
            
            dataL[i] = Math.max(-0.95, Math.min(0.95, mixL));
            dataR[i] = Math.max(-0.95, Math.min(0.95, mixR));
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
     * @param {string} trackKey - Key del track ('music_fight' o 'music_menu')
     */
    playMusic(trackKey = 'music_fight') {
        if (this.muted || !this.ctx || !this.buffers[trackKey]) return;
        this.stopMusic(); // Detener si ya suena
        
        this._currentTrack = trackKey;
        
        try {
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            this.musicSource = this.ctx.createBufferSource();
            this.musicGain = this.ctx.createGain();
            this.musicSource.buffer = this.buffers[trackKey];
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
            this.playMusic(this._currentTrack || 'music_fight');
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
