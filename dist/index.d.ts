export type Options = {
    maxDimension: number;
    useMainThread?: boolean;
};
export declare function resize(blob: Blob, maxDimension: number): Promise<ImageBitmap>;
