<script>
    import '../app.css';
    import '@fontsource-variable/comfortaa';

    import { pwaInfo } from 'virtual:pwa-info';

    $: webManifest = pwaInfo ? pwaInfo.webManifest.linkTag : '';
</script>

<svelte:head>
    {@html webManifest}
</svelte:head>

<div class="flex items-center m-4">
    <img src="favicon.svg" alt="PDFCrypt" class="h-16 align-middle mx-4" />
    <h1 class="text-4xl rounded-lg p-2.5 bg-primary text-white">PDFCrypt</h1>
    <a href="https://github.com/randomblock1/pdfcrypt">
        <img
            src="github.svg"
            alt="GitHub logo"
            class="h-8 m-4" />
    </a>
</div>

<main>
    <slot />
</main>

{#await import('$lib/ReloadPrompt.svelte') then { default: ReloadPrompt }}
    <ReloadPrompt />
{/await}

<style>
    h1 {
        font-family: 'Comfortaa Variable', sans-serif;
    }
</style>
