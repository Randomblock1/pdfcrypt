import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { readFile } from 'fs/promises';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        tailwindcss(),
        sveltekit(),
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
            },
            kit: {
                adapterFallback: '404.html'
            }
        })
    ]
});
