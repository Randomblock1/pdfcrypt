export const fileListFromFileArray = (files: File[]) => {
    const reducer = (dataTransfer: DataTransfer, file: File) => {
        dataTransfer.items.add(file);
        return dataTransfer;
    };

    return files.reduce(reducer, new DataTransfer()).files;
};

export async function convertFileHandlesToFileList(fileHandles: FileSystemFileHandle[]) {
    const files = await Promise.all(
        fileHandles.map(async (fileHandle) => {
            return fileHandle.getFile();
        })
    );

    const fileList = fileListFromFileArray(files);
    return fileList;
}

export function download(data: Uint8Array, name: string, mimeType: string) {
    const a = document.createElement('a');
    const blob = new Blob([data] as BlobPart[], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = name;
    a.click();
    window.URL.revokeObjectURL(url);
}
