# 🎮 Mortal Systems: EPN Edition

> Juego de pelea 2D con temática de desarrollo de software, construido con **Phaser.js** + **Vite** + **JavaScript**.

## 📖 Descripción

**Mortal Systems: EPN Edition** es un juego de pelea 2D donde los personajes representan arquetipos del mundo del desarrollo de software y la vida universitaria. El jugador elige su luchador y se enfrenta contra una IA en combates de "best of 3" rondas.

### Personajes Disponibles

| Personaje | Descripción | Especial |
|-----------|-------------|----------|
| 🧑‍💻 **El Programador** | Estudiante ágil con hoodie y laptop | Stack Overflow |
| 🐛 **El Bug** | Criatura virus poderosa pero lenta | Segfault Blast |
| 👩‍🔬 **La Ingeniera** | Estudiante equilibrada con bata de lab | Compile Error |

## 🚀 Ejecución Local

### Requisitos Previos
- Node.js 18+ instalado
- npm 9+

### Instalación
```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd Proyecto

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El juego se abrirá automáticamente en `http://localhost:3000`

### Build de Producción
```bash
npm run build
npm run preview
```

## 🎮 Controles

### Desktop (Teclado)
| Tecla | Acción |
|-------|--------|
| `A` / `D` | Mover izquierda / derecha |
| `W` | Saltar |
| `J` | Golpe rápido |
| `K` | Patada fuerte |
| `L` | Ataque especial |
| `ESC` | Pausar |

### Mobile (Táctil)
- **D-pad virtual** (izquierda) para movimiento y salto
- **Botones de ataque** (derecha) para golpe, patada y especial

## 🏗️ Estructura del Proyecto

```
Proyecto/
├── index.html                  # Plantilla HTML y configuración de viewport
├── package.json                # Dependencias (Phaser 4, Vite, Jimp)
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
│   │   └── AnimationManager.js # Animaciones reales con fotogramas (spritesheets)
│   ├── physics/
│   │   └── CollisionManager.js # Colisiones, overlaps y efectos
│   ├── assets/
│   │   ├── images/             # Spritesheets y fondos UI
│   │   └── audio/              # (Audio generado programáticamente)
│   └── styles/
│       └── index.css           # Estilos base
```

## ⚙️ Tecnologías

| Tecnología | Uso |
|-----------|-----|
| **Phaser.js 4** | Motor de juegos 2D |
| **Vite** | Bundler y servidor de desarrollo |
| **JavaScript ES6+** | Lenguaje principal |
| **Web Audio API** | Audio sintetizado |
| **localStorage** | Persistencia de datos |

## 🎯 Mecánicas Implementadas

- ✅ Movimiento horizontal + salto
- ✅ Sistema de ataques (golpe, patada, especial)
- ✅ Detección de colisiones y overlaps
- ✅ Barras de vida dinámicas con colores
- ✅ Sistema de rondas (Best of 3)
- ✅ Timer por ronda (99 segundos)
- ✅ Condición de victoria y derrota
- ✅ Sistema de puntaje
- ✅ IA con máquina de estados (BONUS)
- ✅ Menú principal con opciones
- ✅ Selección de personaje
- ✅ Pausa con overlay
- ✅ Persistencia (High Score, nivel, audio)
- ✅ Controles táctiles para móvil
- ✅ Responsive design (Scale FIT)
- ✅ Música de fondo + efectos de sonido
- ✅ Botón de mute
- ✅ Efectos visuales de impacto
- ✅ Screen shake al recibir daño

## 🏆 Features Bonus (+10%)

- ✅ **IA Avanzada**: Máquina de estados con comportamientos IDLE/APPROACH/ATTACK/RETREAT
- ✅ **Boss Final**: El Bug tiene stats mejorados (+25% daño, +15% HP)
- ✅ **Multiplayer Local**: Soporte para Jugador 2 (flechas + O/P/I)

## 📊 Rendimiento

- Target: 60 FPS
- Mínimo: 45 FPS
- Scale Mode: FIT (responsive)
- WebGL con fallback a Canvas

## 📝 Créditos

- **Desarrollo**: Estudiante EPN
- **Asignatura**: Aplicaciones Web
- **Docente**: Jaime Sayago-Heredia
- **Motor**: Phaser.js (phaser.io)
- **Bundler**: Vite (vite.dev)

## 📄 Licencia

Proyecto académico - EPN 2026
