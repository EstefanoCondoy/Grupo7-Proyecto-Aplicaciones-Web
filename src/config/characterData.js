/**
 * ============================================
 * characterData.js - Datos de cada personaje
 * ============================================
 * Define los stats, descripciones y colores de cada
 * personaje seleccionable en el juego.
 */

/**
 * Array de datos de personajes disponibles.
 * Cada personaje tiene stats únicos que afectan el combate.
 */
export const CHARACTERS = [
    {
        id: 'programmer',
        name: 'El Programador',
        subtitle: 'Backend Developer',
        description: 'Un estudiante con su hoodie y laptop. Rápido y ágil.',
        imageKey: 'fighter1_programmer',
        
        // Color del personaje para efectos y UI
        tint: 0x6c5ce7,       // Púrpura
        glowColor: 0x6c5ce7,
        
        // Stats (0-100 escala para display, modificadores reales abajo)
        statsDisplay: {
            speed: 80,
            power: 60,
            defense: 50,
            special: 75,
        },
        
        // Modificadores reales aplicados sobre las constantes base
        speedMod: 1.1,         // 10% más rápido
        damageMod: 0.9,        // 10% menos daño
        hpMod: 1.0,            // HP normal
        jumpMod: 1.05,         // Salto ligeramente mejor
        scaleMod: 1.5,         // Más grande porque el sprite está dibujado pequeño
        
        // Nombres de ataques para UI
        attacks: {
            punch: 'Keyboard Smash',
            kick: 'Compiler Kick',
            special: 'Stack Overflow',
        },
        
        // Color del proyectil especial
        specialColor: 0x6c5ce7,
    },
    {
        id: 'bug',
        name: 'El Bug',
        subtitle: 'Runtime Error',
        description: 'Una criatura virus nacida de código corrupto. Poderoso pero lento.',
        imageKey: 'fighter2_bug',
        
        tint: 0xff3838,        // Rojo
        glowColor: 0xff3838,
        
        statsDisplay: {
            speed: 50,
            power: 90,
            defense: 70,
            special: 85,
        },
        
        speedMod: 0.85,        // 15% más lento
        damageMod: 1.25,       // 25% más daño
        hpMod: 1.15,           // 15% más HP
        jumpMod: 0.9,          // Salto peor
        scaleMod: 1.5,         // Escala ajustada
        
        attacks: {
            punch: 'Null Pointer',
            kick: 'Memory Leak',
            special: 'Segfault Blast',
        },
        
        specialColor: 0xff3838,
    },
    {
        id: 'engineer',
        name: 'La Ingeniera',
        subtitle: 'Full Stack Dev',
        description: 'Estudiante con bata de laboratorio. Equilibrada y técnica.',
        imageKey: 'fighter3_student',
        
        tint: 0x00cec9,        // Cyan/Teal
        glowColor: 0x00cec9,
        
        statsDisplay: {
            speed: 70,
            power: 70,
            defense: 65,
            special: 80,
        },
        
        speedMod: 1.0,         // Velocidad normal
        damageMod: 1.05,       // 5% más daño
        hpMod: 1.05,           // 5% más HP
        jumpMod: 1.0,          // Salto normal
        scaleMod: 1.2,         // Escala base (se ve bien, pero un poco más grande según petición)
        
        attacks: {
            punch: 'Book Throw',
            kick: 'Debug Spin',
            special: 'Compile Error',
        },
        
        specialColor: 0x00cec9,
    },
];

/**
 * Buscar un personaje por su ID
 * @param {string} id - ID del personaje
 * @returns {object} Datos del personaje
 */
export function getCharacterById(id) {
    return CHARACTERS.find(c => c.id === id) || CHARACTERS[0];
}
