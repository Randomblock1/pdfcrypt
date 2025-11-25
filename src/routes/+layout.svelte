<script lang="ts">
    import '../app.css';
    import '@fortawesome/fontawesome-svg-core/styles.css';

    import '@fontsource-variable/comfortaa';
    import { pwaInfo } from 'virtual:pwa-info';
    import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
    import {
        faCheck,
        faDownload,
        faUpRightFromSquare,
        faEyeSlash
    } from '@fortawesome/free-solid-svg-icons';
    import { config as fontawesomeConfig } from '@fortawesome/fontawesome-svg-core';

    fontawesomeConfig.autoAddCss = false;

    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import Analytics from '$lib/Analytics.svelte';
    import { resolve } from '$app/paths';

    let webManifest = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : '');
    let isHomePage = $derived(page.url.pathname === '/');

    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();
    let isPwa = $state(false);

    onMount(() => {
        if (
            window.matchMedia('(display-mode: standalone)').matches ||
            // @ts-expect-error iOS specific check
            window.navigator.standalone ||
            document.referrer.includes('android-app://')
        ) {
            isPwa = true;
        }
    });
</script>

<svelte:head>
    <!-- eslint-disable-next-line -->
    {@html webManifest}
    <meta name="description" content="Encrypt PDF files securely and quickly in your browser" />
</svelte:head>

<Analytics />

<div class="flex flex-wrap sm:flex-row">
    <a href={resolve('/')} class="flex items-center m-4">
        <img src="favicon.svg" alt="PDFCrypt" class="h-16 align-middle mx-4" />
        <h1
            class="text-4xl rounded-lg p-2.5 border-2 {isHomePage
                ? 'bg-primary text-white border-transparent'
                : 'border-primary text-primary bg-transparent'}">
            PDFCrypt
        </h1>
    </a>
    <ul
        class="menu menu-horizontal bg-base-200 rounded-box mx-4 w-full md:w-fit md:my-8 items-center justify-self-center gap-2">
        <li>
            <a
                href={resolve('/install')}
                class="transition-colors"
                class:bg-primary={page.url.pathname === '/install'}
                class:text-white={page.url.pathname === '/install'}>
                {#if isPwa}
                    Installed<FontAwesomeIcon icon={faCheck} />
                {:else}
                    Install<FontAwesomeIcon icon={faDownload} />
                {/if}
            </a>
        </li>
        <li>
            <a
                href="https://github.com/randomblock1/pdfcrypt"
                target="_blank"
                rel="noopener noreferrer"
                class="transition-colors">
                Source Code
                <FontAwesomeIcon icon={faUpRightFromSquare} />
            </a>
        </li>
        <li>
            <a
                href={resolve('/privacy')}
                class="transition-colors"
                class:bg-primary={page.url.pathname === '/privacy'}
                class:text-white={page.url.pathname === '/privacy'}>
                Privacy Policy<FontAwesomeIcon icon={faEyeSlash} />
            </a>
        </li>
    </ul>
</div>

<main>
    {@render children?.()}
</main>

<footer style="text-align: center;"></footer>

{#await import('$lib/ReloadPrompt.svelte') then { default: ReloadPrompt }}
    <ReloadPrompt />
{/await}

<style>
    h1 {
        font-family: 'Comfortaa Variable', sans-serif;
    }
</style>
