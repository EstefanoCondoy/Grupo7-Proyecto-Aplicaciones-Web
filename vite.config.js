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
        minify: 'esbuild',
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules/phaser')) {
                        return 'phaser';
                    }
                }
            }
        }
    },
    server: {
        port: 3000,
        open: true
    }
});
