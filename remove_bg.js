import { Jimp } from 'jimp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imagesDir = path.join(__dirname, 'src', 'assets', 'images');

// Imágenes a procesar
const images = [
    'fighter2_boss.png',
];

/**
 * Distancia Manhattan entre dos colores RGB
 */
function colorDistance(r1, g1, b1, r2, g2, b2) {
    return Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
}

/**
 * Determinar si un píxel es "fondo" (blanco, casi-blanco o gris claro)
 */
function isBackgroundPixel(r, g, b) {
    // Blanco puro y casi-blanco (umbral alto)
    if (r > 235 && g > 235 && b > 235) return true;

    // Gris claro uniforme (los 3 canales muy similares y claros)
    const maxDiff = Math.max(Math.abs(r - g), Math.abs(r - b), Math.abs(g - b));
    if (maxDiff < 15 && r > 200 && g > 200 && b > 200) return true;

    // Gris medio claro (para checkered patterns)
    if (maxDiff < 10 && r > 180 && g > 180 && b > 180) return true;

    return false;
}

/**
 * Flood fill desde los bordes para eliminar fondo conectado
 * Esto es más preciso que eliminar todos los píxeles blancos
 */
function floodFillBackground(image) {
    const w = image.bitmap.width;
    const h = image.bitmap.height;
    const visited = new Uint8Array(w * h);
    const toRemove = new Uint8Array(w * h);
    const queue = [];

    // Threshold para considerar píxeles como "similares al fondo"
    const THRESHOLD = 45;

    // Muestrear color de fondo de las esquinas
    const cornerSamples = [
        { x: 0, y: 0 },
        { x: w - 1, y: 0 },
        { x: 0, y: h - 1 },
        { x: w - 1, y: h - 1 },
        { x: Math.floor(w / 2), y: 0 },
        { x: Math.floor(w / 2), y: h - 1 },
    ];

    const bgColors = [];
    for (const s of cornerSamples) {
        const idx = (s.y * w + s.x) * 4;
        const r = image.bitmap.data[idx];
        const g = image.bitmap.data[idx + 1];
        const b = image.bitmap.data[idx + 2];
        bgColors.push({ r, g, b });
    }

    // Función para verificar si un píxel es similar al fondo
    function isSimilarToBg(x, y) {
        const idx = (y * w + x) * 4;
        const r = image.bitmap.data[idx];
        const g = image.bitmap.data[idx + 1];
        const b = image.bitmap.data[idx + 2];
        const a = image.bitmap.data[idx + 3];

        if (a < 10) return true; // Ya transparente

        // Verificar contra colores de fondo muestreados
        for (const c of bgColors) {
            if (colorDistance(r, g, b, c.r, c.g, c.b) < THRESHOLD) {
                return true;
            }
        }

        // Blanco/casi-blanco puro
        if (isBackgroundPixel(r, g, b)) return true;

        return false;
    }

    // Sembrar desde todos los bordes
    for (let x = 0; x < w; x++) {
        if (isSimilarToBg(x, 0)) { queue.push(x * h + 0); visited[0 * w + x] = 1; }
        if (isSimilarToBg(x, h - 1)) { queue.push(x * h + (h - 1)); visited[(h - 1) * w + x] = 1; }
    }
    for (let y = 0; y < h; y++) {
        if (isSimilarToBg(0, y)) { queue.push(0 * h + y); visited[y * w + 0] = 1; }
        if (isSimilarToBg(w - 1, y)) { queue.push((w - 1) * h + y); visited[y * w + (w - 1)] = 1; }
    }

    // BFS
    while (queue.length > 0) {
        const encoded = queue.shift();
        const px = Math.floor(encoded / h);
        const py = encoded % h;

        toRemove[py * w + px] = 1;

        const neighbors = [
            [px - 1, py], [px + 1, py],
            [px, py - 1], [px, py + 1],
        ];

        for (const [nx, ny] of neighbors) {
            if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
            if (visited[ny * w + nx]) continue;
            visited[ny * w + nx] = 1;

            if (isSimilarToBg(nx, ny)) {
                queue.push(nx * h + ny);
            }
        }
    }

    // Aplicar transparencia
    let removedCount = 0;
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (toRemove[y * w + x]) {
                const idx = (y * w + x) * 4;
                image.bitmap.data[idx + 3] = 0;
                removedCount++;
            }
        }
    }

    // Segundo paso: suavizar bordes (anti-aliasing)
    // Los píxeles en el borde entre personaje y fondo pueden tener mezcla
    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
            const idx = (y * w + x) * 4;
            if (image.bitmap.data[idx + 3] === 0) continue;

            // Contar vecinos transparentes
            let transparentNeighbors = 0;
            const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            for (const [dx, dy] of dirs) {
                const nIdx = ((y + dy) * w + (x + dx)) * 4;
                if (image.bitmap.data[nIdx + 3] === 0) transparentNeighbors++;
            }

            // Si el píxel es muy claro y tiene vecinos transparentes, hacerlo semi-transparente
            const r = image.bitmap.data[idx];
            const g = image.bitmap.data[idx + 1];
            const b = image.bitmap.data[idx + 2];
            if (transparentNeighbors >= 2 && isBackgroundPixel(r, g, b)) {
                image.bitmap.data[idx + 3] = 0;
                removedCount++;
            }
        }
    }

    return removedCount;
}

async function removeBackground() {
    console.log('🎨 Iniciando remoción de fondos blancos...\n');

    for (const file of images) {
        const filePath = path.join(imagesDir, file);
        console.log(`📸 Procesando: ${file}`);

        try {
            const image = await Jimp.read(filePath);
            console.log(`   Tamaño: ${image.bitmap.width}x${image.bitmap.height}`);

            const removedCount = floodFillBackground(image);
            const totalPixels = image.bitmap.width * image.bitmap.height;
            const percent = ((removedCount / totalPixels) * 100).toFixed(1);

            console.log(`   ✅ Eliminados ${removedCount} píxeles de fondo (${percent}%)`);

            // Guardar con compresión
            await image.write(filePath);
            console.log(`   💾 Guardado: ${file}\n`);

        } catch (e) {
            console.error(`   ❌ Error procesando ${file}:`, e.message, '\n');
        }
    }

    console.log('✨ ¡Proceso completado!');
}

removeBackground();
