<svelte:head>
    <title>PDFCrypt - Installation</title>
    <script type="module" src="https://get.microsoft.com/badge/ms-store-badge.bundled.js"></script>
</svelte:head>

<div class="tile m-4">
    <h1 class="text-3xl rounded-lg p-2.5 bg-primary text-white mb-4 w-fit">Installation</h1>
    <p>
        This app is a progressive web app, which means it can be installed on your device like a
        native app. To install it, follow the instructions for your device below.
    </p>
</div>

<div class="grid md:grid-cols-2">
    <div>
        <div class="tile m-4 h-fit">
            <h2 class="text-2xl rounded-lg p-2.5 bg-primary text-white mb-4 w-fit">Windows</h2>
            <p>Good news! This app is available in the Microsoft Store.</p>
            <ms-store-badge
                class="my-2"
                productid="9PCHG45LJXZN"
                cid="installtab"
                theme="dark"
                language="en-US"
                animation="on"></ms-store-badge>
            <p>
                If you don't want to use the Microsoft Store, you can install it manually. Follow
                these instructions:
            </p>
            <ol>
                <li>- Open the app in Edge or Chrome.</li>
                <li>- Click the installation icon in the address bar.</li>
                <li>- Click "Install".</li>
            </ol>
        </div>

        <div class="tile m-4 h-fit">
            <h2 class="text-2xl rounded-lg p-2.5 bg-primary text-white mb-4 w-fit">Android</h2>
            <p>
                Chrome-based Android browsers have a little drawer appear at the bottom of the
                screen when you visit the app. Drag it upwards to show screenshots & the install
                button. Otherwise, follow these instructions:
            </p>
            <ol>
                <li>- Open the app in Chrome.</li>
                <li>- Tap the three dots in the top right corner.</li>
                <li>- Tap "Install App".</li>
                <li>- Tap "Install".</li>
            </ol>
        </div>
    </div>
    <div>
        <div class="tile m-4 h-fit">
            <h2 class="text-2xl rounded-lg p-2.5 bg-primary text-white mb-4 w-fit">iOS</h2>
            <ol>
                <li>- Open the app in Safari.</li>
                <li>- Tap the share button.</li>
                <li>- Tap "Add to Home Screen".</li>
                <li>- Tap "Add".</li>
            </ol>
        </div>

        <div class="tile m-4 h-fit">
            <h2 class="text-2xl rounded-lg p-2.5 bg-primary text-white mb-4 w-fit">MacOS</h2>
            <ol>
                <li>- Open the app in Edge or Chrome.</li>
                <li>- Click the installation icon in the address bar.</li>
                <li>- Click "Install".</li>
            </ol>
        </div>
    </div>

    <a href="/" class="mx-4"><button class="btn btn-primary text-white mb-4">Go Back</button></a>
</div>

<style>
    .tile {
        line-height: 1.6;
        padding: 1.5rem;
        border: hsl(var(--p)) solid 2px;
        border-radius: 10px;
        background: hsl(var(--b2));
    }
</style>
