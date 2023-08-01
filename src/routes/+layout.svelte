<script>
    import '../app.css';
    import '@fontsource-variable/comfortaa';

    import { onMount } from 'svelte';
    import { pwaInfo } from 'virtual:pwa-info';

    onMount(async () => {
        if (pwaInfo) {
            const { registerSW } = await import('virtual:pwa-register');
            registerSW({
                immediate: true,
                onRegistered(r) {
                    // uncomment following code if you want check for updates
                    r &&
                        setInterval(() => {
                            console.log('Checking for sw update');
                            r.update();
                        }, 1000 * 60 * 60 * 24 * 7 /* 20s for testing purposes */);
                    console.log(`SW Registered: ${r}`);
                },
                onRegisterError(error) {
                    console.log('SW registration error', error);
                }
            });
        }
    });

    $: webManifest = pwaInfo ? pwaInfo.webManifest.linkTag : '';
</script>

<svelte:head>
    {@html webManifest}
</svelte:head>

<div class="flex items-center m-4">
    <img src="favicon.svg" alt="PDFCrypt" class="h-16 align-middle mx-4" />
    <h1 class="text-4xl rounded-lg p-2.5 bg-primary text-white">PDFCrypt</h1>
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
