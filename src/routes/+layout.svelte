<script>
    import '../app.css';
    import '@fontsource-variable/comfortaa';

    import { pwaInfo } from 'virtual:pwa-info';
    // font awesome
    import '@fortawesome/fontawesome-free';

    $: webManifest = pwaInfo ? pwaInfo.webManifest.linkTag : '';
</script>

<svelte:head>
    <link
        rel="stylesheet"
        href="http://cdn.jsdelivr.net/gh/duyplus/fontawesome-pro/css/all.min.css" />
    {@html webManifest}
</svelte:head>

<div class="flex flex-wrap sm:flex-row">
    <a href="/" class="flex items-center m-4">
        <img src="favicon.svg" alt="PDFCrypt" class="h-16 align-middle mx-4" />
        <h1 class="text-4xl rounded-lg p-2.5 bg-primary text-white">PDFCrypt</h1>
    </a>
    <ul class="menu menu-horizontal bg-base-200 rounded-box mx-4 w-full md:w-fit md:my-8  items-center justify-self-center">
        <li><a href="/install">Install</a></li>
        <li>
            <a
                href="https://github.com/randomblock1/pdfcrypt"
                target="_blank"
                rel="noopener noreferrer">
                Source Code
                <i class="fa-solid fa-arrow-up-right-from-square" />
            </a>
        </li>
        <li><a href="/privacy">Privacy Policy</a></li>
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
