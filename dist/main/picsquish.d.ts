import { DimensionLimit, InitialImage, TileOptions } from '../common';
type Options = {
    maxWorkerPoolSize?: number;
    maxWorkerIdleTime?: number;
    tileSize?: TileOptions['initialSize'];
    filter?: TileOptions['filter'];
    unsharpAmount?: TileOptions['unsharpAmount'];
    unsharpRadius?: TileOptions['unsharpRadius'];
    unsharpThreshold?: TileOptions['unsharpThreshold'];
};
export declare function squish(image: InitialImage, dimensionLimits: DimensionLimit[], options?: Options): Promise<{
    raw: Uint8ClampedArray<ArrayBuffer>;
    width: number;
    height: number;
    toImageData(): ImageData;
    toImageBitmap(): Promise<ImageBitmap>;
    toCanvas(): HTMLCanvasElement;
    toBlob(type?: string): Promise<Blob>;
}>[];
export {};
