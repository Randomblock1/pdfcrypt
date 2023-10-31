<script lang="ts">
    import '../app.css';
    import '@fontsource-variable/comfortaa';

    import { pwaInfo } from 'virtual:pwa-info';
    import '@fortawesome/fontawesome-free/js/all.js';
    import { onMount } from 'svelte';

    $: webManifest = pwaInfo ? pwaInfo.webManifest.linkTag : '';

    export let isPwa = false;

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
        <h1 class="text-4xl rounded-lg p-2.5 bg-primary text-white">PDFCrypt</h1>
    </a>
    <ul
        class="menu menu-horizontal bg-base-200 rounded-box mx-4 w-full md:w-fit md:my-8 items-center justify-self-center">
        <li>
            <a href="/install">
                {#if isPwa}
                    Installed<i class="fa-solid fa-check" />
                {:else}
                    Install<i class="fa-solid fa-download" />
                {/if}
            </a>
        </li>
        <li>
            <a
                href="https://github.com/randomblock1/pdfcrypt"
                target="_blank"
                rel="noopener noreferrer">
                Source Code
                <i class="fa-solid fa-code" />
            </a>
        </li>
        <li><a href="/privacy">Privacy Policy<i class="fa-solid fa-eye-slash" /></a></li>
    </ul>
</div>

<main>
    <slot />
</main>

<footer style="text-align: center;" />

{#await import('$lib/ReloadPrompt.svelte') then { default: ReloadPrompt }}
    <ReloadPrompt />
{/await}

<style>
    h1 {
        font-family: 'Comfortaa Variable', sans-serif;
    }
</style>
