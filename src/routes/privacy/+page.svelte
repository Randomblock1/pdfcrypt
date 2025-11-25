<script>
    import { resolve } from '$app/paths';
</script>

<svelte:head>
    <title>PDFCrypt - Privacy Policy</title>
</svelte:head>

<div class="m-4 tile">
    <h1 class="text-3xl rounded-lg p-2.5 bg-primary text-white mb-4 w-fit">Privacy Policy</h1>
    <ol>
        <li>
            - This app does not collect, transmit, distribute or sell any sensitive data, period.
            All the PDFs and passwords never leave your device. All processing happens on-device.
        </li>
        <li>
            - To help me understand how people use this site and to make it better, this app uses
            Google Analytics. This tool uses cookies to collect anonymous data, such as which pages
            you visit and how long you stay. No personally identifiable information is collected. If
            you prefer not to be tracked, you can adjust your browser settings to disable cookies or
            use a browser extension to block tracking.
        </li>
        <li>
            - Cloudflare and GitHub are used to host the website. They may collect some data
            including IP addresses and device information for the purpose of serving a website. This
            also happens when installing from an app store, because it is a progressive web app and
            it uses the website to update itself.
        </li>
    </ol>
</div>

<a href={resolve('/')} class="mx-4"
    ><button class="btn btn-primary text-white my-4">Go Back</button></a>

<style>
    .tile {
        line-height: 1.6;
        padding: 1.5rem;
        border: hsl(var(--p)) solid 2px;
        border-radius: 10px;
        background: hsl(var(--b2));
    }
</style>
