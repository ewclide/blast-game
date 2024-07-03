import path from 'path';
import pluginCompression from 'vite-plugin-compression';
import { defineConfig } from 'vite';

const outDirPath = path.resolve(__dirname, 'dist');
const indexPath = path.resolve(__dirname, './index.html');
const compressFilter = /.(js|mjs|json|css|bin|html|png|jpg)$/i;

export default defineConfig({
    plugins: [
        pluginCompression({
            filter: compressFilter,
            algorithm: 'brotliCompress',
        }),
    ],
    build: {
        outDir: outDirPath,
        emptyOutDir: true,
        minify: true,
        rollupOptions: {
            input: indexPath,
        },
    },
});
