<script lang="ts">
    import { useRegisterSW } from 'virtual:pwa-register/svelte';
    const { needRefresh, offlineReady, updateServiceWorker } = useRegisterSW({
        onRegistered(r) {
            // uncomment following code if you want check for updates
            r &&
                setInterval(() => {
                    console.log('Checking for sw update');
                    r.update();
                }, 1000 * 60 * 60 * 24 /* 1 day */);
            console.log(`SW Registered: ${r}`);
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
        }
    });
    function close() {
        offlineReady.set(false);
        needRefresh.set(false);
    }
    function refresh() {
        updateServiceWorker(true);
    }
</script>

{#if $offlineReady || $needRefresh}
    <div
        class="pwa-toast border border-neutral rounded-md shadow-md bg-base-200 shadow-primary text-left p-3 m-4 right-0 bottom-0 z-20 fixed"
        role="alert">
        <div class="mb-2">
            {#if $offlineReady}
                <span>App ready to work offline.</span>
            {:else if $needRefresh}
                <span>New content available, click on reload button to update.</span>
            {:else}
                <span>If you can see this, the toast works.</span>
            {/if}
        </div>
        {#if $needRefresh}
            <button
                class="border border-base-content rounded-md mr-1.5 px-3 py-1 hover:bg-primary-focus"
                on:click={refresh}>
                Reload
            </button>
        {/if}
        <button
            class="border border-base-content rounded-md mr-1.5 px-3 py-1 hover:bg-primary-focus"
            on:click={close}>
            Close
        </button>
    </div>
{/if}
