<script lang="ts">
    import { PDFDocument } from 'pdf-lib-plus-encrypt';

    let files: FileList;
    let userPassword = '';
    let ownerPassword: string;
    let advanced = false;

    interface Permissions {
        printing: 'highResolution' | 'lowResolution' | boolean;
        modifying: boolean;
        copying: boolean;
        annotating: boolean;
        fillingForms: boolean;
        contentAccessibility: boolean;
        documentAssembly: boolean;
    }

    let permissions: Permissions = {
        printing: 'highResolution',
        modifying: false,
        copying: true,
        annotating: true,
        fillingForms: true,
        contentAccessibility: true,
        documentAssembly: true
    };

    let printingToggled = true;

    function togglePrinting(printingToggled: boolean) {
        if (printingToggled) {
            permissions.printing = 'highResolution';
        } else {
            permissions.printing = 'lowResolution';
        }
    }

    $: togglePrinting(printingToggled);
    $: formValid = userPassword !== '' && files?.length > 0;

    function download(data: Uint8Array, name: string, mimeType: string) {
        const a = document.createElement('a');
        const blob = new Blob([data], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = name;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    async function handleFiles() {
        for (let i = 0; i < files.length; i++) {
            const item = files.item(i);
            if (item) {
                await encrypt(item);
            }
        }
    }

    async function encrypt(item: File) {
        const existingPdfBytes = await item.arrayBuffer();

        let pdfDoc: PDFDocument;
        try {
            pdfDoc = await PDFDocument.load(existingPdfBytes);
        } catch (e) {
            alert(e);
            return;
        }

        await pdfDoc.encrypt({
            userPassword,
            ownerPassword,
            permissions
        });

        const pdfBytes = await pdfDoc.save();

        download(pdfBytes, 'pdfcrypt-' + item.name, 'application/pdf');
    }
</script>

<svelte:head>
    <title>PDFCrypt</title>
    <meta name="description" content="Encrypt PDF files securely and quickly in your browser" />
</svelte:head>

<div class="grid md:grid-cols-2">
    <div>
        <div class="tile m-4">
            <h2 class="text-2xl">Select an unencrypted PDF file to encrypt</h2>
            <p>
                This file is encrypted entirely in your browser. It's a progressive web app, so you
                can even install it and use it offline.
            </p>
        </div>
        <div class="tile m-4">
            <input
                class="file-input file-input-bordered file-input-primary hover:bg-base-200 w-full"
                type="file"
                bind:files
                accept="application/pdf"
            />
            <br />
            <label class="label" for="userPassword">User Password</label>
            <input
                class="input input-bordered hover:bg-base-200 w-full"
                type="password"
                bind:value={userPassword}
            />
            <br />
            <button
                class="btn btn-primary my-4"
                disabled={!formValid}
                on:click={handleFiles}>Encrypt</button
            >
        </div>
    </div>

    <div>
        <div class="tile m-4">
            <label class="label cursor-pointer max-w-fit">
                <h2 class="text-2xl">Advanced Permissions</h2>
                <input type="checkbox" class="toggle toggle-primary ml-6" bind:checked={advanced} />
            </label>
            {#if advanced === true}
                <label class="label" for="ownerPassword">Owner Password</label>
                <input
                    class="input input-bordered hover:bg-base-200 w-full my-2"
                    type="password"
                    bind:value={ownerPassword}
                />
                <p class="my-2">
                    By default, setting only a user password will require the password to view the
                    file. Setting an owner password will allow you to set advanced permissions, like
                    disallowing printing or signing, for the user.
                </p>

                <label class="label cursor-pointer max-w-fit">
                    <h3 class="text-lg">Annotating</h3>
                    <input
                        type="checkbox"
                        class="toggle toggle-primary ml-6"
                        bind:checked={permissions.annotating}
                    />
                </label>
                <p>Permission to add or modify text annotations</p>

                <label class="label cursor-pointer max-w-fit">
                    <h3 class="text-lg">Filling Forms</h3>
                    <input
                        type="checkbox"
                        class="toggle toggle-primary ml-6"
                        bind:checked={permissions.fillingForms}
                    />
                </label>
                <p>Fill in existing interactive form fields (including signature fields)</p>

                <label class="label cursor-pointer max-w-fit">
                    <h3 class="text-lg">Document Assembly</h3>
                    <input
                        type="checkbox"
                        class="toggle toggle-primary ml-6"
                        bind:checked={permissions.documentAssembly}
                    />
                </label>
                <p>
                    Assemble the document (insert, rotate or delete pages and create bookmarks or
                    thumbnail images)
                </p>

                <label class="label cursor-pointer max-w-fit">
                    <h3 class="text-lg">Modification</h3>
                    <input
                        type="checkbox"
                        class="toggle toggle-primary ml-6"
                        bind:checked={permissions.modifying}
                    />
                </label>
                <p>
                    Content modifications not covered by 'Annotating', 'Filling Forms' and 'Document
                    Assembly'
                </p>

                <label class="label cursor-pointer max-w-fit">
                    <h3 class="text-lg">Copying</h3>
                    <input
                        type="checkbox"
                        class="toggle toggle-primary ml-6"
                        bind:checked={permissions.copying}
                    />
                </label>
                <p>Copy or otherwise extract text and graphics from document</p>

                <label class="label cursor-pointer max-w-fit">
                    <h3 class="text-lg">High Resolution Printing</h3>
                    <input
                        type="checkbox"
                        class="toggle toggle-primary ml-6"
                        bind:checked={printingToggled}
                    />
                </label>
                <p>If unchecked, only low-resolution printing will be allowed.</p>

                <label class="label cursor-pointer max-w-fit">
                    <h3 class="text-lg">Content Accessibility</h3>
                    <input
                        type="checkbox"
                        class="toggle toggle-primary ml-6"
                        bind:checked={permissions.contentAccessibility}
                    />
                </label>
                <p>
                    Extract text and graphics (in support of accessibility to users with
                    disabilities or for other purposes)
                </p>
            {/if}
        </div>
    </div>
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
