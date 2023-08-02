import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { readFile } from 'fs/promises';

export default {
    plugins: [
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
            }
        })
    ]
};
