import Jimp from 'jimp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imagesDir = path.join(__dirname, 'src', 'assets', 'images');
const images = [
    'fighter1_programmer.png',
    'fighter2_bug.png',
    'fighter3_student.png'
];

// Determine if a color is part of the checkered background (white/gray)
function isBackground(r, g, b) {
    // Backgrounds usually have r, g, b very close to each other (grayscale)
    // and are relatively light.
    const maxDiff = Math.max(Math.abs(r - g), Math.abs(r - b), Math.abs(g - b));
    return (maxDiff < 30 && r > 150 && g > 150 && b > 150);
}

async function processImages() {
    for (const filename of images) {
        const filePath = path.join(imagesDir, filename);
        console.log('Processing:', filename);
        try {
            const image = await Jimp.read(filePath);
            
            // The images look like a 4x2 grid of sprites. We just want the top-left one.
            const frameWidth = Math.floor(image.bitmap.width / 4);
            const frameHeight = Math.floor(image.bitmap.height / 2);
            
            // Crop to the first frame
            image.crop(0, 0, frameWidth, frameHeight);
            
            // Remove background
            image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
                const r = this.bitmap.data[idx + 0];
                const g = this.bitmap.data[idx + 1];
                const b = this.bitmap.data[idx + 2];
                
                if (isBackground(r, g, b)) {
                    this.bitmap.data[idx + 3] = 0; // Alpha to 0
                }
            });
            
            // Overwrite original
            await image.writeAsync(filePath);
            console.log('Successfully processed:', filename);
        } catch (err) {
            console.error('Error processing', filename, err);
        }
    }
}

processImages();
