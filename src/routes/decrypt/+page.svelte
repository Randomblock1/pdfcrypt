<script lang="ts">
    import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
    import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
    import createModule, { type QpdfInstance } from '@neslinesli93/qpdf-wasm';
    import wasmUrl from '@neslinesli93/qpdf-wasm/dist/qpdf.wasm?url';

    import { onMount } from 'svelte';
    import { fileListFromFileArray, convertFileHandlesToFileList, download } from '$lib/file-utils';

    let files: FileList | undefined = $state();
    let password = $state('');
    let qpdf: QpdfInstance | null = $state(null);
    let isDecrypting = $state(false);

    onMount(async () => {
        // Initialize QPDF WASM module
        try {
            qpdf = await createModule({
                locateFile: () => wasmUrl,
                // @ts-expect-error missing from types
                noInitialRun: true,
                preRun: [
                    (module: QpdfInstance) => {
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
            // @ts-expect-error will never be undefined in this block
            window.launchQueue.setConsumer((launchParams: { files: FileSystemFileHandle[] }) => {
                loadSharedFiles(launchParams.files);
            });
        } else {
            console.log('File Handling API is not supported!');
        }
    });

    async function loadSharedFiles(handles: FileSystemFileHandle[]) {
        files = await convertFileHandlesToFileList(handles);
        (document.getElementById('fileInput') as HTMLInputElement).files = files;
    }

    let formValid = $derived(
        password.length > 0 && files && files?.length > 0 && qpdf !== null && !isDecrypting
    );

    async function handleFiles() {
        if (!files) return;
        isDecrypting = true;

        // Give the UI a chance to update and show the loading state
        // before starting the blocking decryption process
        await new Promise((resolve) => setTimeout(resolve, 0));

        try {
            for (let i = 0; i < files.length; i++) {
                const item = files.item(i);
                if (item) {
                    await decrypt(item);
                }
            }
        } finally {
            isDecrypting = false;
        }
    }

    async function decrypt(item: File) {
        if (!qpdf) {
            alert('QPDF module not yet initialized. Please wait a moment and try again.');
            return;
        }

        try {
            // Allow UI to breathe between file decryptions
            await new Promise((resolve) => setTimeout(resolve, 10));

            const existingPdfBytes = await item.arrayBuffer();
            const uint8Array = new Uint8Array(existingPdfBytes);

            // Generate unique filenames to avoid conflicts
            const timestamp = Date.now();
            const inputPath = `/input/input_${timestamp}.pdf`;
            const outputPath = `/output/output_${timestamp}.pdf`;

            // Write input file to virtual file system
            // @ts-expect-error writeFile exists
            qpdf.FS.writeFile(inputPath, uint8Array);

            // Build QPDF command arguments
            const args = [inputPath];

            // Add password for decryption
            args.push(`--password=${password}`);

            // Use --decrypt flag to remove encryption
            args.push('--decrypt');

            // Specify output file
            args.push(outputPath);

            // Execute QPDF decryption
            const exitCode = qpdf.callMain(args);

            if (exitCode !== 0) {
                alert(
                    'Error decrypting PDF. Check if the password is correct. Exit code: ' + exitCode
                );
                return;
            }

            // Read the decrypted output file
            const outputFile = qpdf.FS.readFile(outputPath);

            // Clean up virtual file system
            try {
                // @ts-expect-error unlink exists
                qpdf.FS.unlink(inputPath);
                // @ts-expect-error unlink exists
                qpdf.FS.unlink(outputPath);
            } catch (cleanupError) {
                console.warn('Error cleaning up files:', cleanupError);
            }

            // Download the decrypted PDF
            download(outputFile, 'decrypted-' + item.name, 'application/pdf');
        } catch (error) {
            console.error('Decryption error:', error);
            alert('Error decrypting PDF: ' + error);
        }
    }
</script>

<svelte:head>
    <title>PDFCrypt - Decrypt PDF</title>
</svelte:head>

<div class="grid md:grid-cols-2">
    <div>
        <div class="tile m-4">
            <h2 class="text-2xl"><b>Select an encrypted PDF file to decrypt</b></h2>
            <p class="mt-2">
                This file is decrypted entirely on your device. It doesn't touch another server,
                ever.
            </p>
        </div>
        <div class="tile m-4">
            <label class="label" for="fileInput">PDF(s) to Decrypt</label>
            <input
                class="file-input file-input-bordered file-input-primary hover:bg-base-200 w-full"
                type="file"
                bind:files
                id="fileInput"
                accept="application/pdf" />
            <label class="label" for="password">Password</label>
            <input
                class="input input-bordered hover:bg-base-200 w-full"
                id="password"
                type="password"
                bind:value={password} />
            <p class="mt-2">
                <FontAwesomeIcon
                    icon={faInfoCircle}
                    size="sm"
                    style="color:steelblue"
                    class="mr-1" />
                Enter the password that was used to encrypt this PDF. This can be either the user password
                or owner password.
            </p>
            <button
                class="btn {isDecrypting ? 'btn-disabled' : 'btn-primary'} my-4"
                disabled={!formValid}
                onclick={handleFiles}>
                {#if isDecrypting}
                    Decrypting...
                {:else}
                    Decrypt
                {/if}
            </button>
        </div>
    </div>

    <div>
        <div class="tile m-4">
            <h2 class="text-2xl"><b>How It Works</b></h2>
            <p class="mt-2">
                This tool removes password protection from PDF files that you have the password for.
                The decryption happens entirely in your browser using WebAssembly.
            </p>
            <p class="mt-4">
                <b>Important:</b> You must have the correct password to decrypt the PDF. If you don't
                know the password, this tool cannot help you recover it.
            </p>
            <p class="mt-4">
                After decryption, your PDF will be downloaded without any password protection. You
                can then view, edit, or print it without restrictions.
            </p>
        </div>
    </div>
</div>
