import { Jimp } from 'jimp';
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

function colorDistance(r1, g1, b1, r2, g2, b2) {
    return Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
}

async function removeBackground() {
    for (const file of images) {
        console.log('Processing:', file);
        const filePath = path.join(imagesDir, file);
        try {
            const image = await Jimp.read(filePath);
            
            // Sample colors from the top edge
            const bgColors = [];
            for (let x = 0; x < image.bitmap.width; x += 10) {
                const idx = image.getPixelIndex(x, 0);
                const r = image.bitmap.data[idx];
                const g = image.bitmap.data[idx+1];
                const b = image.bitmap.data[idx+2];
                bgColors.push({r, g, b});
            }
            
            image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
                const r = this.bitmap.data[idx + 0];
                const g = this.bitmap.data[idx + 1];
                const b = this.bitmap.data[idx + 2];
                
                // Check if this pixel is close to any background color
                let isBg = false;
                for (const c of bgColors) {
                    if (colorDistance(r, g, b, c.r, c.g, c.b) < 30) {
                        isBg = true;
                        break;
                    }
                }
                
                // Also remove general grayish checkers just in case
                const maxDiff = Math.max(Math.abs(r - g), Math.abs(r - b), Math.abs(g - b));
                if (maxDiff < 20 && r > 40) isBg = true;
                
                if (isBg) {
                    this.bitmap.data[idx + 3] = 0; // Alpha to 0
                }
            });
            
            image.write(filePath);
            console.log('Finished processing:', file);
        } catch (e) {
            console.error('Error processing', file, e);
        }
    }
}

removeBackground();
