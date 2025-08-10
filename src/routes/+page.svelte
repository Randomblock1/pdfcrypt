<script lang="ts">
    import createModule from '@neslinesli93/qpdf-wasm';
    import wasmUrl from '@neslinesli93/qpdf-wasm/dist/qpdf.wasm?url';
    import { onMount } from 'svelte';

    let files: FileList | undefined = $state();
    let userPassword = $state('');
    let ownerPassword: string = $state('');
    let advanced = $state(false);
    let qpdf: any = null;
    let isEncrypting = $state(false);

    onMount(async () => {
        // Initialize QPDF WASM module
        try {
            qpdf = await createModule({
                locateFile: () => wasmUrl,
                noInitialRun: true,
                preRun: [
                    (module: any) => {
                        if (module.FS) {
                            try {
                                module.FS.mkdir('/input');
                                module.FS.mkdir('/output');
                            } catch (e) {
                                console.warn('Error creating directories:', e);
                            }
                        }
                    }
                ]
            });
            console.log('QPDF WASM module initialized successfully');
        } catch (error) {
            console.error('Failed to initialize QPDF WASM module:', error);
        }

        // file handler receiver
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

    let permissions: Permissions = $state({
        printing: 'highResolution',
        modifying: true,
        copying: true,
        annotating: true,
        fillingForms: true,
        contentAccessibility: true,
        documentAssembly: true
    });

    let formValid = $derived(
        (userPassword.length > 0 || ownerPassword.length > 0) &&
            files &&
            files?.length > 0 &&
            (advanced ? ownerPassword : true) &&
            qpdf !== null &&
            !isEncrypting
    );

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
        if (!files) return;
        isEncrypting = true;
        
        // Give the UI a chance to update and show the loading state
        // before starting the blocking encryption process
        await new Promise(resolve => setTimeout(resolve, 0));
        
        try {
            for (let i = 0; i < files.length; i++) {
                const item = files.item(i);
                if (item) {
                    await encrypt(item);
                }
            }
        } finally {
            isEncrypting = false;
        }
    }

    async function encrypt(item: File) {
        if (!qpdf) {
            alert('QPDF module not yet initialized. Please wait a moment and try again.');
            return;
        }

        try {
            // Allow UI to breathe between file encryptions
            await new Promise(resolve => setTimeout(resolve, 10));
            
            const existingPdfBytes = await item.arrayBuffer();
            const uint8Array = new Uint8Array(existingPdfBytes);

            // Generate unique filenames to avoid conflicts
            const timestamp = Date.now();
            const inputPath = `/input/input_${timestamp}.pdf`;
            const outputPath = `/output/output_${timestamp}.pdf`;

            // Write input file to virtual file system
            qpdf.FS.writeFile(inputPath, uint8Array);

            // Build QPDF command arguments
            const args = [inputPath, '--encrypt'];

            // Fix for QPDF security requirement: when using 256-bit encryption,
            // if user password is set but owner password is empty, set owner password
            // to user password to avoid the "insecure" error
            let effectiveUserPassword = userPassword;
            let effectiveOwnerPassword = ownerPassword;
            if (userPassword && !ownerPassword) {
                effectiveOwnerPassword = userPassword;
            }

            // Add passwords if provided
            if (effectiveUserPassword) {
                args.push(`--user-password=${effectiveUserPassword}`);
            }
            if (effectiveOwnerPassword) {
                args.push(`--owner-password=${effectiveOwnerPassword}`);
            }

            // Use 256-bit encryption for security
            args.push('--bits=256');

            // Map permissions to QPDF options
            if (advanced) {
                // Printing permission
                if (permissions.printing === 'highResolution' || permissions.printing === true) {
                    args.push('--print=full');
                } else if (permissions.printing === 'lowResolution') {
                    args.push('--print=low');
                } else {
                    args.push('--print=none');
                }

                // Modify permission - map to QPDF's modify levels
                if (permissions.modifying) {
                    args.push('--modify=all');
                } else {
                    args.push('--modify=none');
                }

                // Other permissions
                args.push(`--extract=${permissions.copying ? 'y' : 'n'}`);
                args.push(`--annotate=${permissions.annotating ? 'y' : 'n'}`);
                args.push(`--form=${permissions.fillingForms ? 'y' : 'n'}`);
                args.push(`--accessibility=${permissions.contentAccessibility ? 'y' : 'n'}`);
                args.push(`--assemble=${permissions.documentAssembly ? 'y' : 'n'}`);
            } else {
                // Default permissions when not in advanced mode (allow everything)
                args.push('--print=full');
                args.push('--modify=all');
                args.push('--extract=y');
                args.push('--annotate=y');
                args.push('--form=y');
                args.push('--accessibility=y');
                args.push('--assemble=y');
            }

            // End encryption options and specify output file
            args.push('--');
            args.push(outputPath);

            // Execute QPDF encryption
            const exitCode = qpdf.callMain(args);

            if (exitCode !== 0) {
                alert('Error encrypting PDF. Exit code: ' + exitCode);
                return;
            }

            // Read the encrypted output file
            const outputFile = qpdf.FS.readFile(outputPath);

            // Clean up virtual file system
            try {
                qpdf.FS.unlink(inputPath);
                qpdf.FS.unlink(outputPath);
            } catch (cleanupError) {
                console.warn('Error cleaning up files:', cleanupError);
            }

            // Download the encrypted PDF
            download(outputFile, 'pdfcrypt-' + item.name, 'application/pdf');
        } catch (error) {
            console.error('Encryption error:', error);
            alert('Error encrypting PDF: ' + error);
        }
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
                <span class="fa-solid fa-info-circle fa-sm mr-1" style="color: steelblue"></span>
                Setting only a user password will require the password to view the file, and enable all
                permissions. For security with 256-bit encryption, the owner password will be automatically
                set to match the user password.
            </p>
            {#if advanced && !ownerPassword}
                <div class="alert alert-error my-2">
                    <span class="fa-solid fa-circle-exclamation"></span>
                    You must set an owner password for advanced permissions to work.
                </div>
            {/if}
            <button class="btn {isEncrypting ? 'btn-disabled' : 'btn-primary'} my-4" disabled={!formValid} onclick={handleFiles}>
                {#if isEncrypting}
                    Encrypting...
                {:else}
                    Encrypt
                {/if}
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
                    <span class="fa-solid fa-info-circle fa-sm" style="color: steelblue"></span>
                    Setting an owner password will allow you to prevent whoever enters the user password
                    from performing cetain actions, like editing or signing. The owner password will
                    still have full permissions. If you only set the owner password, the user permissions
                    still apply, and you can enter the owner password to enable all permissions.
                </p>
                <p class="my-2">
                    <span
                        class="fa-solid fa-triangle-exclamation fa-fade fa-sm"
                        style="color: orange;"></span>
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
