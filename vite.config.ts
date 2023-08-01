import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
    plugins: [
        sveltekit(),
        SvelteKitPWA({
            manifest: {
                name: 'PDFCrypt',
                short_name: 'PDFCrypt',
                description: 'Encrypt PDF files securely and quickly',
                start_url: '.',
                display: 'standalone',
                id: '/',
                theme_color: '#1d232a',
                icons: [
                    {
                        src: '/manifest-icon-192.maskable.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any'
                    },
                    {
                        src: '/manifest-icon-192.maskable.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'maskable'
                    },
                    {
                        src: '/manifest-icon-512.maskable.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any'
                    },
                    {
                        src: '/manifest-icon-512.maskable.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable'
                    },
                    {
                        src: '/maskable_icon.png',
                        sizes: '1024x1024',
                        type: 'image/png',
                        purpose: 'maskable'
                    }
                ]
            },

            devOptions: {
                enabled: true
            }
        })
    ],
    test: {
        include: ['src/**/*.{test,spec}.{js,ts}']
    }
});
