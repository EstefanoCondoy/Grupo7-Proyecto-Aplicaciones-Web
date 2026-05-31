# Mortal Systems: EPN Edition

Proyecto final de Aplicaciones Web: videojuego 2D de pelea hecho con Phaser.js, JavaScript y Vite.

---

## Resumen

**Mortal Systems: EPN Edition** mantiene una estética cyberpunk/universitaria y enfrenta a estudiantes de software contra amenazas nacidas del código corrupto.

El juego incluye selección de personaje, combate 1 vs IA, HUD, audio, pausa, controles táctiles, persistencia en `localStorage`, proyectiles especiales y sistema de rondas al mejor de 3.

Durante la etapa final se realizaron mejoras de pulido en los recortes de los peleadores, alineación con el suelo, animaciones, poder especial, balance del boss y flujo de niveles más conciso.

---

## Personajes

| Personaje | Descripción | Ataques |
|---|---|---|
| El Programador | Estudiante con hoodie/laptop. Rápido y ágil. | Keyboard Smash, Compiler Kick, Stack Overflow |
| El Bug | Criatura virus nacida del código corrupto. Poderoso pero lento. | Null Pointer, Memory Leak, Segfault Blast |
| La Ingeniera | Estudiante full stack con bata. Equilibrada y técnica. | Book Throw, Debug Spin, Compile Error |
| Boss Final | Amenaza ransomware del sistema. Más resistente, agresivo y peligroso. | Ransom Punch, Firewall Kick, Ransomware Blast |

---

## Ejecución

### Requisitos

- Node.js 18+
- npm 9+

### Instalación y desarrollo

```bash
npm install
npm run dev
````

Por defecto, Vite sirve el juego en:

```bash
http://localhost:3000
```

### Build de producción

```bash
npm run build
npm run preview
```

---

## Controles

| Tecla     | Acción             |
| --------- | ------------------ |
| `A` / `D` | Movimiento lateral |
| `W`       | Saltar             |
| `J`       | Golpe rápido       |
| `K`       | Patada fuerte      |
| `L`       | Ataque especial    |
| `ESC`     | Pausar             |

En móviles o tablets se mantienen controles táctiles con D-pad virtual y botones de acción.

---

## Mecánicas Principales

El juego implementa:

* Movimiento lateral.
* Salto.
* Golpe rápido.
* Patada fuerte.
* Ataque especial.
* Proyectiles físicos.
* Colisiones con suelo.
* Hitboxes temporales.
* IA enemiga.
* Boss final.
* HUD de combate.
* Sistema de rondas al mejor de 3.
* Condición de victoria.
* Condición de derrota.
* Pausa.
* Game Over.
* Persistencia con `localStorage`.
* Audio, efectos y mute.

---

## Mejoras Implementadas

### Spritesheets por personaje

Los spritesheets fueron configurados desde `characterData.js`, permitiendo que cada personaje tenga su propia estructura visual, frames, animaciones, hitboxes y configuración física.

* El Programador usa spritesheet humano.
* La Ingeniera usa spritesheet humano.
* El Bug usa su spritesheet real.
* El Boss usa configuración propia de boss final.

### Recortes visuales corregidos

Se eliminaron recortes globales que podían cortar patadas, brazos o efectos.

Esto permite que los ataques se vean más completos y que las animaciones mantengan mejor presencia visual durante el combate.

### Alineación con el suelo

Los luchadores usan origen inferior `(0.5, 1)` y se crean/resetan sobre `PHYSICS.GROUND_Y`.

Esto evita que un personaje aparezca más elevado que otro durante idle, movimiento, ataques o reinicio de ronda.

### Tamaño visual y cuerpo físico

El tamaño visual y el cuerpo físico se configuran por personaje.

Esto permite separar:

* La imagen visible del luchador.
* El cuerpo físico usado para colisiones.
* Las hitboxes temporales de ataque.

### Hitboxes reales de combate

Los ataques `punch` y `kick` usan hitboxes temporales con Arcade Physics `overlap`.

Las hitboxes:

* Respetan la dirección del luchador.
* Tienen duración limitada.
* Usan cooldown para evitar daño repetido.
* Pueden mostrarse en desarrollo con `DEBUG_HITBOXES`.

### Ataques especiales con proyectiles

Los ataques especiales generan proyectiles físicos desde `Projectile.js`.

Los proyectiles:

* Viajan horizontalmente.
* Ignoran gravedad.
* Usan el color del personaje.
* Dañan solo al enemigo.
* Se destruyen al impactar.
* Se destruyen al salir de pantalla.

### Feedback visual corregido

El tinte rojo al recibir daño ahora funciona como retroalimentación temporal.

Después del impacto o del periodo de invulnerabilidad, el personaje vuelve a su estado visual normal.

### Boss mejorado

El boss fue reforzado para sentirse como una amenaza real dentro del juego.

Mejoras aplicadas:

* Más vida.
* Más daño.
* Mayor defensa.
* Mayor agresividad.
* Mayor frecuencia de ataques especiales.
* Menor comportamiento defensivo.
* Hitboxes más amplias.
* Mejor presencia visual en combate.

### Animaciones más estables

Se ajustó la limpieza de animaciones, tintes, alpha y estados del luchador para evitar congelamientos o estados visuales incorrectos al cambiar de ronda, recibir daño o finalizar una pelea.

### Niveles más concisos

La progresión de peleas fue ajustada para que el boss aparezca de forma más directa y el flujo del juego sea más claro para una demo académica.

---

## Estructura

```text
src/
|-- assets/
|-- config/
|-- managers/
|-- objects/
|-- physics/
|-- scenes/
|-- styles/
`-- ui/
```

---

## Archivos Principales

| Archivo                              | Función                                                                     |
| ------------------------------------ | --------------------------------------------------------------------------- |
| `src/config/characterData.js`        | Stats, frames, visuales, animaciones, proyectiles e hitboxes por personaje. |
| `src/config/gameConfig.js`           | Constantes globales, suelo, física, controles, campaña y `DEBUG_HITBOXES`.  |
| `src/scenes/BootScene.js`            | Carga de assets, fondos, retratos y spritesheets por personaje.             |
| `src/scenes/CharacterSelectScene.js` | Menú de selección de personajes con retratos, stats y placas visuales.      |
| `src/scenes/FightScene.js`           | Escena principal de combate, rondas, HUD, victoria y derrota.               |
| `src/objects/Fighter.js`             | Movimiento, saltos, ataques, daño, muerte, reset y proyectiles.             |
| `src/objects/PlayerFighter.js`       | Control del jugador mediante teclado o controles táctiles.                  |
| `src/objects/AIFighter.js`           | IA enemiga con estados de aproximación, ataque, retirada e idle.            |
| `src/objects/Projectile.js`          | Proyectiles físicos para ataques especiales.                                |
| `src/physics/CollisionManager.js`    | Suelo, colisiones, hitboxes, overlaps, proyectiles e impactos.              |
| `src/managers/AnimationManager.js`   | Animaciones por personaje y limpieza de estados visuales.                   |
| `src/ui/HUD.js`                      | Barras de vida, tiempo, score y rondas.                                     |
| `src/ui/TouchControls.js`            | Controles táctiles para dispositivos móviles.                               |

---

## Requisitos de Rúbrica Cubiertos

* Phaser Scene Manager para el flujo completo del juego.
* Loader de assets.
* Menú principal.
* Selección de personaje.
* Escena de combate.
* Pausa.
* Game Over.
* Pantalla de victoria.
* Reinicio de rondas.
* Movimiento.
* Saltos.
* Colisiones.
* Overlaps.
* Hitboxes.
* Proyectiles.
* Sistema de vida.
* Sistema de score.
* Sistema de rondas.
* Condición de victoria.
* Condición de derrota.
* IA enemiga.
* Boss final.
* HUD.
* Audio.
* Mute.
* Persistencia con `localStorage`.
* Controles de teclado.
* Controles táctiles.
* Diseño responsive mediante Scale Manager.
* Arquitectura modular.
* Clases reutilizables.
* Código organizado con ES Modules.
* Limpieza del repositorio con `.gitignore`.

---

## Bonus Implementados

### IA enemiga

El enemigo utiliza una máquina de estados para decidir si se acerca, ataca, retrocede o espera.

### Boss final

El boss representa una amenaza superior dentro del sistema corrupto. Tiene mayor vida, mayor daño, mejor defensa y un comportamiento más agresivo.

### Proyectiles especiales

Los ataques especiales usan proyectiles físicos, reforzando la mecánica arcade del combate.

### Controles táctiles

El juego puede utilizarse en dispositivos móviles o tablets mediante controles táctiles equivalentes.

---

## Limpieza del Repositorio

El proyecto excluye dependencias locales y archivos generados mediante `.gitignore`.

No deben subirse:

```text
node_modules/
dist/
.vite/
.DS_Store
.env
npm-debug.log*
```

Las dependencias deben instalarse con:

```bash
npm install
```

---

## Limitaciones y Mejoras Futuras

Aunque el juego se encuentra funcional y presentable, se identifican posibles mejoras futuras:

* Agregar más frames por animación.
* Crear spritesheets normalizados con más margen transparente por frame.
* Mejorar efectos de partículas en golpes y especiales.
* Añadir selector de dificultad.
* Mejorar el balance fino por personaje.
* Agregar más escenarios.
* Implementar multijugador local completo.
* Añadir leaderboard online.
* Agregar pruebas automatizadas de escenas.
* Mejorar la pantalla de instrucciones.

---

## Autores

* Estefano Condoy
* Eddy Sangucho
* Cesar Zapata

Desarrollado para la asignatura **Aplicaciones Web**, EPN 2026.

