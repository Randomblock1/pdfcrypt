<script lang="ts">
    import { page } from '$app/state';

    $effect(() => {
        if (typeof gtag !== 'undefined') {
            gtag('config', 'G-0RFZS8YNB7', {
                page_title: document.title,
                page_path: page.url.pathname
            });
        }
    });
</script>

<svelte:head>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-0RFZS8YNB7">
    </script>
    <script>
        window.dataLayer = window.dataLayer || [];

        function gtag() {
            dataLayer.push(arguments);
        }

        gtag('js', new Date());
        gtag('config', 'G-0RFZS8YNB7');
    </script>
</svelte:head>
