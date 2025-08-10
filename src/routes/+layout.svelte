<script lang="ts">
    import '../app.css';
    import '@fontsource-variable/comfortaa';

    import { pwaInfo } from 'virtual:pwa-info';
    import '@fortawesome/fontawesome-free/js/all.js';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';

    let webManifest = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : '');
    let isHomePage = $derived($page.url.pathname === '/');

    interface Props {
        isPwa?: boolean;
        children?: import('svelte').Snippet;
    }

    let { isPwa = $bindable(false), children }: Props = $props();

    onMount(() => {
        if (
            window.matchMedia('(display-mode: standalone)').matches ||
            // @ts-ignore
            window.navigator.standalone ||
            document.referrer.includes('android-app://')
        ) {
            isPwa = true;
        }
    });
</script>

<svelte:head>
    {@html webManifest}
    <meta name="description" content="Encrypt PDF files securely and quickly in your browser" />
</svelte:head>

<div class="flex flex-wrap sm:flex-row">
    <a href="/" class="flex items-center m-4">
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
                href="/install"
                class="transition-colors"
                class:bg-primary={$page.url.pathname === '/install'}
                class:text-white={$page.url.pathname === '/install'}>
                {#if isPwa}
                    Installed<span class="fa-solid fa-check"></span>
                {:else}
                    Install<span class="fa-solid fa-download"></span>
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
                <span class="fa-solid fa-up-right-from-square"></span>
            </a>
        </li>
        <li>
            <a
                href="/privacy"
                class="transition-colors"
                class:bg-primary={$page.url.pathname === '/privacy'}
                class:text-white={$page.url.pathname === '/privacy'}>
                Privacy Policy<span class="fa-solid fa-eye-slash"></span>
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
