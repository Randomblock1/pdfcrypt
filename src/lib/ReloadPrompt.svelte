<script lang="ts">
    import { useRegisterSW } from 'virtual:pwa-register/svelte';
    const { needRefresh, updateServiceWorker, offlineReady } = useRegisterSW({
        onRegistered(r) {
            // uncomment following code if you want check for updates
            // r && setInterval(() => {
            //    console.log('Checking for sw update')
            //    r.update()
            // }, 1000 * 60 * 60 * 24 /* 1 day */)
            console.log(`SW Registered: ${r}`);
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
        }
    });
    const close = () => {
        offlineReady.set(false);
        needRefresh.set(false);
    };
    $: toast = $offlineReady || $needRefresh;
</script>

{#if toast}
    <div class="pwa-toast border border-neutral roudned-md shadow-md bg-base-200 shadow-primary text-left p-3 m-4 right-0 bottom-0 z-20 fixed" role="alert">
        <div class="mb-2">
            {#if $offlineReady}
                <span> App ready to work offline </span>
            {:else}
                <span> New content available, click on reload button to update. </span>
            {/if}
        </div>
        {#if $needRefresh}
            <button class="border border-base-content rounded-md mr-1.5 px-3 py-1 hover:bg-primary-focus" on:click={() => updateServiceWorker(true)}> Reload </button>
        {/if}
        <button class="border border-base-content rounded-md mr-1.5 px-3 py-1 hover:bg-primary-focus" on:click={close}> Close </button>
    </div>
{/if}
