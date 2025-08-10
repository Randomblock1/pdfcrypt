import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { readFile, copyFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

async function copyQpdfWasm() {
    const wasmDir = path.join(process.cwd(), 'static', 'wasm');
    if (!existsSync(wasmDir)) {
        await mkdir(wasmDir, { recursive: true });
    }
    
    const srcPath = path.join(process.cwd(), 'node_modules', '@neslinesli93', 'qpdf-wasm', 'dist', 'qpdf.wasm');
    const destPath = path.join(wasmDir, 'qpdf.wasm');
    
    try {
        await copyFile(srcPath, destPath);
        console.log('QPDF WASM file copied to static/wasm/');
    } catch (error) {
        console.error('Failed to copy QPDF WASM file:', error);
    }
}

export default {
    plugins: [
        sveltekit(),
        {
            name: 'copy-qpdf-wasm',
            async buildStart() {
                await copyQpdfWasm();
            }
        },
        SvelteKitPWA({
            manifest: JSON.parse(await readFile('./static/manifest.webmanifest', 'utf-8')),
            workbox: {
                globPatterns: ['client/**/*.{js,css,ico,png,svg,webp,woff,woff2}'],
                cleanupOutdatedCaches: true,
                skipWaiting: true
            },
            devOptions: {
                enabled: true,
                suppressWarnings: true
            }
        })
    ]
};
