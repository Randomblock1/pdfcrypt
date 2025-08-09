<script lang="ts">
    import '../app.css';
    import '@fontsource-variable/comfortaa';

    import { pwaInfo } from 'virtual:pwa-info';
    import '@fortawesome/fontawesome-free/js/all.js';
    import { onMount } from 'svelte';

    let webManifest = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : '');

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

<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
    <a href="/" class="flex items-center gap-4">
        <img src="favicon.svg" alt="PDFCrypt" class="h-16" />
        <h1 class="text-4xl rounded-lg p-2.5 bg-primary text-white">PDFCrypt</h1>
    </a>
    <nav class="menu menu-horizontal bg-base-200 rounded-box w-full sm:w-fit flex justify-center">
        <li>
            <a href="/install" class="flex items-center gap-2">
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
                class="flex items-center gap-2">
                Source Code
                <span class="fa-solid fa-code"></span>
            </a>
        </li>
        <li>
            <a href="/privacy" class="flex items-center gap-2"
                >Privacy Policy<span class="fa-solid fa-eye-slash"></span></a>
        </li>
    </nav>
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
