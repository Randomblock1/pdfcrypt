import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://kit.svelte.dev/docs/integrations#preprocessors
    // for more information about preprocessors
    preprocess: vitePreprocess(),

    kit: {
        adapter: adapter({
            precompress: true
        }),
        paths: {
            base: process.argv.includes('dev') ? '' : process.env.BASE_PATH
        },
        csp: {
            mode: 'hash',
            directives: {
                'default-src': ['self'],
                'script-src': [
                    'self',
                    'wasm-unsafe-eval',
                    'https://www.googletagmanager.com',
                    'https://get.microsoft.com'
                ],
                'style-src': ['self', 'unsafe-inline'],
                'img-src': [
                    'self',
                    'data:',
                    'https://www.google-analytics.com',
                    'https://www.googletagmanager.com',
                    'https://get.microsoft.com',
                    'https://stats.g.doubleclick.net'
                ],
                'connect-src': [
                    'self',
                    'https://www.google-analytics.com',
                    'https://analytics.google.com',
                    'https://www.googletagmanager.com',
                    'https://get.microsoft.com',
                    'https://apps.microsoft.com',
                    'https://stats.g.doubleclick.net'
                ],
                'font-src': ['self'],
                'frame-src': ['self', 'https://get.microsoft.com'],
                'worker-src': ['self'],
                'manifest-src': ['self'],
                'object-src': ['none'],
                'base-uri': ['self']
            }
        }
    }
};

export default config;
