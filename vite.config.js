import { defineConfig } from 'vite';

export default defineConfig({
    // Servir assets estáticos desde src/assets
    publicDir: 'public',
    base: './',
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        // Optimización para el juego
        target: 'es2015',
        minify: 'terser',
        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ['phaser']
                }
            }
        }
    },
    server: {
        port: 3000,
        open: true
    }
});
