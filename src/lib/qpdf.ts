import createModule, { type QpdfInstance } from '@neslinesli93/qpdf-wasm';
import wasmUrl from '@neslinesli93/qpdf-wasm/dist/qpdf.wasm?url';

let qpdfPromise: Promise<QpdfInstance> | null = null;

export function getQpdf(): Promise<QpdfInstance> {
    if (!qpdfPromise) {
        qpdfPromise = createModule({
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
    }
    return qpdfPromise;
}

export type { QpdfInstance };
