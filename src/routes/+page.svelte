<script lang="ts">
    import { PDFDocument } from 'pdf-lib-plus-encrypt';
    import { onMount } from 'svelte';

    let files: FileList;
    let userPassword = '';
    let ownerPassword: string;
    let advanced = false;
    let isPwa = false;

    onMount(() => {
        if (
            window.matchMedia('(display-mode: standalone)').matches ||
            // @ts-ignore
            window.navigator.standalone ||
            document.referrer.includes('android-app://')
        ) {
            isPwa = true;
            console.log('Launched in standalone mode');
        }
        // file handler reciever
        if ('launchQueue' in window) {
            // @ts-ignore
            window.launchQueue.setConsumer((launchParams: { files: FileSystemFileHandle[] }) => {
                loadSharedFiles(launchParams.files);
            });
        } else {
            console.log('File Handling API is not supported!');
        }
    });

    export const fileListFromFileArray = (files: File[]) => {
        const reducer = (dataTransfer: DataTransfer, file: File) => {
            dataTransfer.items.add(file);
            return dataTransfer;
        };

        return files.reduce(reducer, new DataTransfer()).files;
    };

    async function convertFileHandlesToFileList(fileHandles: FileSystemFileHandle[]) {
        const files = await Promise.all(
            fileHandles.map(async (fileHandle) => {
                return fileHandle.getFile();
            })
        );

        const fileList = fileListFromFileArray(files);
        return fileList;
    }

    async function loadSharedFiles(handles: FileSystemFileHandle[]) {
        files = await convertFileHandlesToFileList(handles);
        (document.getElementById('fileInput') as HTMLInputElement).files = files;
    }

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
        modifying: true,
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
            <h2 class="text-2xl"><b>Select an unencrypted PDF file to encrypt</b></h2>
            <p class="mt-2">
                This file is encrypted entirely on your device. It doesn't touch another server,
                ever.
            </p>
        </div>
        <div class="tile m-4">
            <label class="label" for="fileInput">PDF(s) to Encrypt</label>
            <input
                class="file-input file-input-bordered file-input-primary hover:bg-base-200 w-full"
                type="file"
                bind:files
                id="fileInput"
                accept="application/pdf" />
            <br />
            <label class="label" for="userPassword">User Password</label>
            <input
                class="input input-bordered hover:bg-base-200 w-full"
                id="userPassword"
                type="password"
                bind:value={userPassword} />
            <br />
            <button class="btn btn-primary my-4" disabled={!formValid} on:click={handleFiles}>
                Encrypt
            </button>
        </div>
    </div>

    <div>
        <div class="tile m-4">
            <label class="label cursor-pointer max-w-fit">
                <h2 class="text-2xl"><b>Advanced Permissions</b></h2>
                <input type="checkbox" class="toggle toggle-primary ml-6" bind:checked={advanced} />
            </label>
            {#if advanced === true}
                <label class="label" for="ownerPassword">Owner Password</label>
                <input
                    class="input input-bordered hover:bg-base-200 w-full my-2"
                    type="password"
                    bind:value={ownerPassword} />
                <p class="my-2">
                    ℹ By default, setting only a user password will require the password to view the
                    file, and enable all permissions. Setting an owner password will allow you to
                    prevent whoever enters the user password from performing cetain actions, like
                    editing or signing.
                </p>
                <p class="my-2">
                    ⚠️ It is up to the PDF reader to enforce these security policies. Some do not.
                </p>

                <label class="label cursor-pointer max-w-fit">
                    <h3 class="text-lg">Annotating</h3>
                    <input
                        type="checkbox"
                        class="toggle toggle-primary ml-6"
                        bind:checked={permissions.annotating} />
                </label>
                <p>Permission to add or modify text annotations</p>

                <label class="label cursor-pointer max-w-fit">
                    <h3 class="text-lg">Filling Forms</h3>
                    <input
                        type="checkbox"
                        class="toggle toggle-primary ml-6"
                        bind:checked={permissions.fillingForms} />
                </label>
                <p>Fill in existing interactive form fields (including signature fields)</p>

                <label class="label cursor-pointer max-w-fit">
                    <h3 class="text-lg">Document Assembly</h3>
                    <input
                        type="checkbox"
                        class="toggle toggle-primary ml-6"
                        bind:checked={permissions.documentAssembly} />
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
                        bind:checked={permissions.modifying} />
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
                        bind:checked={permissions.copying} />
                </label>
                <p>Copy or otherwise extract text and graphics from document</p>

                <label class="label cursor-pointer max-w-fit">
                    <h3 class="text-lg">High Resolution Printing</h3>
                    <input
                        type="checkbox"
                        class="toggle toggle-primary ml-6"
                        bind:checked={printingToggled} />
                </label>
                <p>If unchecked, only low-resolution printing will be allowed.</p>

                <label class="label cursor-pointer max-w-fit">
                    <h3 class="text-lg">Content Accessibility</h3>
                    <input
                        type="checkbox"
                        class="toggle toggle-primary ml-6"
                        bind:checked={permissions.contentAccessibility} />
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
