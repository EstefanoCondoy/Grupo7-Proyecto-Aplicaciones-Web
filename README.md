# 🎮 Mortal Systems: EPN Edition
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

## 📖 1. Tema y Arquetipo del Proyecto

**Mortal Systems: EPN Edition** es un videojuego original de pelea 2D, desarrollado íntegramente con tecnologías web modernas y el framework **Phaser.js**. 
Inspirado en la vida universitaria y el desarrollo de software, el jugador selecciona un luchador representativo (Programador, Ingeniera) para enfrentarse a la máquina o a un temible jefe final.

El proyecto cumple con creces el arquetipo de juego **Plataforma 2D / Arcade**, implementando físicas, saltos, colisiones precisas, barra de vida dinámica y sistema de rondas continuas.

## 👥 2. Personajes

| Personaje | Descripción | Movimiento Especial |
|-----------|-------------|---------------------|
| 🧑‍💻 **El Programador** | Estudiante ágil con hoodie y laptop. | *Stack Overflow* |
| 🐛 **El Bug (BOSS)** | Criatura virus gigante (1.6x) y devastadora. | *Segfault Blast* |
| 👩‍🔬 **La Ingeniera** | Full Stack Dev con bata de lab. Equilibrada. | *Compile Error* |

## 🚀 3. Guía de Ejecución

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

## 🎮 4. Controles (Responsive Design)

El juego detecta automáticamente el dispositivo y habilita controles táctiles si el jugador ingresa desde un teléfono o tablet.

### Desktop (Teclado)
| Tecla | Acción |
|-------|--------|
| `A` / `D` | Movimiento lateral |
| `W` | Saltar |
| `J` | Golpe rápido (Punch) |
| `K` | Patada fuerte (Kick) |
| `L` | Ataque Especial (Special) |
| `ESC` | Pausar juego |

### Mobile (Touch Controls)
- **D-pad virtual** integrado en la parte inferior izquierda para el movimiento.
- **Botones de acción** en la parte inferior derecha para atacar y saltar.
- Pantallas totalmente adaptables (ScaleMode: FIT) para no deformar la imagen.

## 🏗️ 5. Arquitectura y Estructura Profesional

El proyecto sigue una estructura modular orientada a objetos (POO), separando las responsabilidades para máxima escalabilidad y reutilización de código:

```text
Proyecto/
├── index.html                  # Plantilla HTML y configuración de viewport
├── package.json                # Dependencias (Phaser, Vite, Jimp)
├── vite.config.js              # Configuración del bundler Vite
├── remove_bg.js                # Script Node.js para eliminar fondos (transparencia)
├── process_sprites.js          # Script Node.js adicional para sprites
├── src/
│   ├── main.js                 # Punto de entrada - Configuración de Phaser
│   ├── config/
│   │   ├── gameConfig.js       # Constantes globales del juego
│   │   └── characterData.js    # Datos de cada personaje
│   ├── scenes/
│   │   ├── BootScene.js        # Carga de assets (imágenes y spritesheets)
│   │   ├── MenuScene.js        # Menú principal
│   │   ├── CharacterSelectScene.js # Selección de personaje
│   │   ├── FightScene.js       # Escena principal de combate
│   │   ├── PauseScene.js       # Overlay de pausa
│   │   ├── GameOverScene.js    # Pantalla de derrota
│   │   └── VictoryScene.js     # Pantalla de victoria
│   ├── objects/
│   │   ├── Fighter.js          # Clase base del luchador
│   │   ├── PlayerFighter.js    # Luchador controlado por humano
│   │   ├── AIFighter.js        # Luchador con IA (BONUS)
│   │   └── Projectile.js       # Proyectiles de ataques especiales
│   ├── ui/
│   │   ├── HealthBar.js        # Barra de vida dinámica
│   │   ├── HUD.js              # HUD completo del combate
│   │   ├── TouchControls.js    # Controles táctiles para móvil
│   │   └── Button.js           # Botón reutilizable para menús
│   ├── managers/
│   │   ├── InputManager.js     # Gestión de controles teclado/touch
│   │   ├── AudioManager.js     # Música y efectos vía Web Audio API
│   │   ├── StorageManager.js   # Persistencia con localStorage
│   │   └── AnimationManager.js # Animaciones reales con fotogramas
│   ├── physics/
│   │   └── CollisionManager.js # Colisiones, overlaps y detección de impactos
│   ├── assets/
│   │   ├── images/             # Spritesheets y fondos UI
│   │   └── audio/              # Audio generado
│   └── styles/
│       └── index.css           # Estilos base
```

## 🛠️ 6. Justificación de Requisitos Técnicos

El proyecto aprueba todos los criterios obligatorios detallados en la rúbrica:

✅ **Arquitectura Phaser:** Uso extensivo de *Scene Manager* para el flujo de pantallas, loader de imágenes/audio y Game Loop.  
✅ **Física y Colisiones:** Uso de `Arcade Physics` para gravedad, bloqueos con el suelo y un gestor matemático (`CollisionManager`) para detección precisa de impactos.  
✅ **Audio:** Manejo mediante `AudioManager`. Incluye música de fondo y SFX de interfaz/combate.  
✅ **Persistencia:** Uso de `localStorage` mediante la clase `StorageManager` para guardar High Scores, progreso y la configuración del audio (mute).  
✅ **Mecánicas Obligatorias:** Movimiento fluido, sistema de rondas (Best of 3), HUD dinámico, condición de victoria/derrota.  
✅ **Rendimiento:** Optimizado para +45 FPS estables, con carga eficiente a través de Spritesheets (en lugar de imágenes separadas).  
✅ **Código Limpio:** Programación en ES6 Modules, comentarios explicativos y herencia de clases (`Fighter` -> `PlayerFighter` / `AIFighter`).  

## 🏆 7. Bonus Implementados (+10%)

Se implementaron funcionalidades avanzadas que exceden los requisitos base y aplican para el puntaje Bonus:

1. **Inteligencia Artificial (IA Avanzada):** Se desarrolló una máquina de estados para el enemigo (`AIFighter.js`) que calcula distancias, toma decisiones probabilísticas (atacar, acercarse, alejarse) y maneja tiempos de reacción lógicos.
2. **Boss Final:** "El Bug" está programado como un jefe final con un modificador de escala masivo (`1.6x`), más puntos de vida, y un daño brutal, brindando un reto mayor en la batalla final.

## 📄 Licencia
Desarrollado para el Proyecto Final de Aplicaciones Web. Todos los derechos reservados - EPN 2026.
