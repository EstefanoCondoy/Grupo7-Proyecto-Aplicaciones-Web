# Mortal Systems: EPN Edition

Proyecto final de Aplicaciones Web: videojuego 2D de pelea hecho con Phaser.js, JavaScript y Vite.

## Resumen

**Mortal Systems: EPN Edition** mantiene una estetica cyberpunk/universitaria y enfrenta a estudiantes de software contra amenazas nacidas del codigo corrupto. El juego incluye seleccion de personaje, combate 1 vs IA, HUD, audio, pausa, controles tactiles, persistencia en `localStorage` y sistema de rondas al mejor de 3.

## Personajes

| Personaje | Descripcion | Ataques |
| --- | --- | --- |
| El Programador | Estudiante con hoodie/laptop. Rapido y agil. | Keyboard Smash, Compiler Kick, Stack Overflow |
| El Bug | Criatura virus / boss. Poderoso pero lento. | Null Pointer, Memory Leak, Segfault Blast |
| La Ingeniera | Estudiante full stack con bata. Equilibrada. | Book Throw, Debug Spin, Compile Error |

## Ejecucion

Requisitos:

- Node.js 18+
- npm 9+

Instalacion y desarrollo:

```bash
npm install
npm run dev
```

Build de produccion:

```bash
npm run build
npm run preview
```

Por defecto Vite sirve el juego en `http://localhost:3000`.

## Controles

| Tecla | Accion |
| --- | --- |
| `A` / `D` | Movimiento lateral |
| `W` | Saltar |
| `J` | Golpe rapido |
| `K` | Patada fuerte |
| `L` | Ataque especial |
| `ESC` | Pausar |

En moviles o tablets se mantienen controles tactiles con D-pad virtual y botones de accion.

## Mejoras Implementadas

- Spritesheets configurados por personaje desde `characterData.js`.
- El Bug usa su spritesheet real `4x4` con frames `256x256`.
- Programador e Ingeniera usan spritesheets `4x2` con frames `256x512`.
- Los luchadores usan origen inferior (`0.5, 1`) y se crean/resetan sobre `PHYSICS.GROUND_Y`.
- Se elimino el crop global que podia cortar patadas, brazos o efectos.
- El tamano visual y cuerpo fisico se configuran por personaje.
- Punch y kick usan hitboxes temporales con Arcade Physics `overlap`.
- Las hitboxes respetan la direccion del luchador y tienen cooldown para evitar dano repetido.
- `DEBUG_HITBOXES` permite mostrar hitboxes durante desarrollo.
- Los ataques especiales generan proyectiles fisicos desde `Projectile.js`.
- Los proyectiles viajan horizontalmente, ignoran gravedad, usan el color del personaje, danan solo al enemigo y se destruyen al impactar o salir de pantalla.
- Se agrego `.gitignore` y `node_modules` se saco del tracking de Git.
- Se agrego `esbuild` como dependencia de desarrollo requerida por la version actual de Vite.

## Estructura

```text
src/
|-- config/
|-- scenes/
|-- objects/
|-- ui/
|-- managers/
|-- physics/
|-- assets/
`-- styles/
```

Archivos principales:

- `src/config/characterData.js`: stats, frames, visuales, animaciones e hitboxes por personaje.
- `src/config/gameConfig.js`: constantes globales, suelo, fisica, controles y `DEBUG_HITBOXES`.
- `src/scenes/BootScene.js`: carga de assets y spritesheets por personaje.
- `src/objects/Fighter.js`: movimiento, ataques y creacion de proyectiles.
- `src/physics/CollisionManager.js`: suelo, hitboxes, proyectiles e impactos.
- `src/objects/Projectile.js`: proyectil fisico para especiales.

## Requisitos De Rubrica Cubiertos

- Phaser Scene Manager para flujo completo: menu, seleccion, combate, pausa, game over y victoria.
- Arcade Physics para gravedad, suelo, cuerpos, hitboxes y proyectiles.
- Game Loop con actualizacion de luchadores, IA, HUD y colisiones.
- Sistema de rondas best of 3.
- IA con estados de aproximacion, ataque, retirada e idle.
- HUD con vida, ronda, tiempo, score y victorias por ronda.
- Audio, mute y configuracion persistida.
- Persistencia con `localStorage`.
- Controles de teclado y tactiles.
- Estructura modular con ES Modules y clases reutilizables.
- Limpieza del repositorio con `.gitignore` y dependencias fuera del tracking.

## Limitaciones Y Mejoras Futuras

- Los spritesheets actuales se conservan sin regenerar arte; si algun frame original ya trae contenido pegado al borde, se puede crear una version normalizada con margen transparente por frame.
- Las hitboxes son rectangulares para mantener compatibilidad simple con Arcade Physics.
- El juego mantiene IA local; no incluye multijugador en red.
- Futuras mejoras posibles: selector de dificultad, balance fino por personaje, mas feedback visual por proyectil y pruebas automatizadas de escenas.

## Autores

- Estefano Condoy
- Eddy Sangucho
- Cesar Zapata

Desarrollado para la asignatura Aplicaciones Web, EPN 2026.
