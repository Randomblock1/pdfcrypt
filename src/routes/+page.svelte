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

    $: formValid =
        (userPassword || ownerPassword) && files?.length > 0 && (advanced ? ownerPassword : true);

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

        // <= 1.3: 40-bit RC4
        // <= 1.5: 128-bit RC4
        // <= 1.7: 128-bit AES
        // == 1.7ext3: 256-bit AESV3
        // at least it's supposed to be, I think the software is bugged and ignores it
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
    <title>PDFCrypt - Encrypt PDF</title>
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
            <label class="label" for="userPassword">User Password</label>
            <input
                class="input input-bordered hover:bg-base-200 w-full"
                id="userPassword"
                type="password"
                bind:value={userPassword} />
            <p class="mt-2">
                <i class="fa-solid fa-info-circle fa-sm mr-1" style="color: steelblue" />Setting
                only a user password will require the password to view the file, and enable all
                permissions.
            </p>
            {#if advanced && !ownerPassword}
                <div class="alert alert-error my-2">
                    <i class="fa-solid fa-circle-exclamation" />
                    You must set an owner password for advanced permissions to work.
                </div>
            {/if}
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
                    <i class="fa-solid fa-info-circle fa-sm" style="color: steelblue" />
                    Setting an owner password will allow you to prevent whoever enters the user password
                    from performing cetain actions, like editing or signing. The owner password will
                    still have full permissions. If you only set the owner password, the user permissions
                    still apply, and you can enter the owner password to enable all permissions.
                </p>
                <p class="my-2">
                    <i
                        class="fa-solid fa-triangle-exclamation fa-fade fa-sm"
                        style="color: orange;" />
                    It is up to the PDF reader to enforce these security policies. Some do not.
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
                    <h3 class="text-lg">Printing</h3>
                    <select
                        class="select select-bordered select-primary ml-6"
                        bind:value={permissions.printing}>
                        <option value="highResolution">High Resolution</option>
                        <option value="lowResolution">Low Resolution</option>
                        <option value={false}>Disabled</option>
                    </select>
                </label>
                <p>
                    High Resolution vs Low Resolution: "Printing to a representation from which a
                    faithful digital copy of the PDF content could be generated. Disallowing such
                    printing may result in degradation of output quality." - PDF Specification.
                    Note: not all common PDF viewers follow resolution rules.
                </p>

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
