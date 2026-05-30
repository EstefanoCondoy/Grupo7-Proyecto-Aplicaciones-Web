# Mortal Systems: EPN Edition

> Proyecto Final de Primer Bimestre - Aplicaciones Web
> Desarrollo de Videojuegos con Phaser.js

**Autores:**
- Estéfano Condoy
- Eddy Sangucho
- César Zapata

**Docente:** Ing. Jaime Sayago-Heredia  
**Asignatura:** Aplicaciones Web  
**Tecnología Central:** Phaser.js + JavaScript + Vite

---

## 1. Tema y Arquetipo del Proyecto

**Mortal Systems: EPN Edition** es un videojuego original de pelea 2D, desarrollado íntegramente con tecnologías web modernas y el framework **Phaser.js**.

Inspirado en la vida universitaria y el desarrollo de software, el jugador selecciona un luchador representativo (Programador, Ingeniera) para enfrentarse a la máquina o a un temible jefe final.

El proyecto cumple con creces el arquetipo de juego **Plataforma 2D / Arcade**, implementando físicas, saltos, colisiones precisas, barra de vida dinámica y sistema de rondas continuas.

## 2. Personajes

| Personaje | Descripción | Movimiento Especial |
|-----------|-------------|---------------------|
| **El Programador** | Estudiante ágil con hoodie y laptop. | *Stack Overflow* |
| **El Bug (BOSS)** | Criatura virus gigante (1.6x) y devastadora. | *Segfault Blast* |
| **La Ingeniera** | Full Stack Dev con bata de laboratorio. Equilibrada. | *Compile Error* |

## 3. Guía de Ejecución

### Requisitos Previos

- Node.js 18+ instalado
- npm 9+

### Instalación y Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo con Vite
npm run dev
```

El juego estará disponible localmente en `http://localhost:3000`.

### Build de Producción

```bash
npm run build
npm run preview
```

## 4. Controles (Responsive Design)

El juego detecta automáticamente el dispositivo y habilita controles táctiles si el jugador ingresa desde un teléfono o tablet.

### Desktop (Teclado)

| Tecla | Acción |
|--------|--------|
| `A` / `D` | Movimiento lateral |
| `W` | Saltar |
| `J` | Golpe rápido (Punch) |
| `K` | Patada fuerte (Kick) |
| `L` | Ataque Especial (Special) |
| `ESC` | Pausar juego |

### Mobile (Touch Controls)

- D-pad virtual integrado en la parte inferior izquierda para el movimiento.
- Botones de acción en la parte inferior derecha para atacar y saltar.
- Pantallas totalmente adaptables (ScaleMode: FIT) para no deformar la imagen.

## 5. Arquitectura y Estructura Profesional

El proyecto sigue una estructura modular orientada a objetos (POO), separando las responsabilidades para máxima escalabilidad y reutilización de código:

```text
Proyecto/
├── index.html
├── package.json
├── vite.config.js
├── remove_bg.js
├── process_sprites.js
├── src/
│   ├── main.js
│   ├── config/
│   │   ├── gameConfig.js
│   │   └── characterData.js
│   ├── scenes/
│   │   ├── BootScene.js
│   │   ├── MenuScene.js
│   │   ├── CharacterSelectScene.js
│   │   ├── FightScene.js
│   │   ├── PauseScene.js
│   │   ├── GameOverScene.js
│   │   └── VictoryScene.js
│   ├── objects/
│   │   ├── Fighter.js
│   │   ├── PlayerFighter.js
│   │   ├── AIFighter.js
│   │   └── Projectile.js
│   ├── ui/
│   │   ├── HealthBar.js
│   │   ├── HUD.js
│   │   ├── TouchControls.js
│   │   └── Button.js
│   ├── managers/
│   │   ├── InputManager.js
│   │   ├── AudioManager.js
│   │   ├── StorageManager.js
│   │   └── AnimationManager.js
│   ├── physics/
│   │   └── CollisionManager.js
│   ├── assets/
│   │   ├── images/
│   │   └── audio/
│   └── styles/
│       └── index.css
```

## 6. Justificación de Requisitos Técnicos

El proyecto aprueba todos los criterios obligatorios detallados en la rúbrica:

- **Arquitectura Phaser:** Uso extensivo de Scene Manager para el flujo de pantallas, loader de imágenes/audio y Game Loop.
- **Física y Colisiones:** Uso de Arcade Physics para gravedad, bloqueos con el suelo y un gestor matemático (`CollisionManager`) para detección precisa de impactos.
- **Audio:** Manejo mediante `AudioManager`. Incluye música de fondo y efectos de sonido de interfaz y combate.
- **Persistencia:** Uso de `localStorage` mediante la clase `StorageManager` para guardar High Scores, progreso y configuración del audio.
- **Mecánicas Obligatorias:** Movimiento fluido, sistema de rondas (Best of 3), HUD dinámico y condición de victoria o derrota.
- **Rendimiento:** Optimizado para más de 45 FPS estables, con carga eficiente mediante spritesheets.
- **Código Limpio:** Programación en ES6 Modules, comentarios explicativos y herencia de clases (`Fighter` → `PlayerFighter` / `AIFighter`).

## 7. Bonus Implementados (+10%)

Se implementaron funcionalidades avanzadas que exceden los requisitos base:

### Inteligencia Artificial (IA Avanzada)

Se desarrolló una máquina de estados para el enemigo (`AIFighter.js`) que calcula distancias, toma decisiones probabilísticas (atacar, acercarse o alejarse) y maneja tiempos de reacción lógicos.

### Boss Final

"El Bug" está programado como un jefe final con un modificador de escala masivo (`1.6x`), mayor cantidad de vida y daño incrementado, brindando un reto significativo en la batalla final.

## Licencia

Desarrollado para el Proyecto Final de Aplicaciones Web.

Todos los derechos reservados - EPN 2026.
