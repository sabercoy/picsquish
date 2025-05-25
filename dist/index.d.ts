export type Filter = 'box' | 'hamming' | 'lanczos2' | 'lanczos3' | 'mks2013';
export type Options = {
    maxDimension: number;
    useMainThread?: boolean;
    maxWorkerPoolSize?: number;
    maxWorkerIdleTime?: number;
    tileSize?: number;
    unsharpAmount?: number;
    unsharpRadius?: number;
    unsharpThreshold?: number;
    filter?: Filter;
};
export type TileData = {
    toX: number;
    toY: number;
    toWidth: number;
    toHeight: number;
    toInnerX: number;
    toInnerY: number;
    toInnerWidth: number;
    toInnerHeight: number;
    offsetX: number;
    offsetY: number;
    scaleX: number;
    scaleY: number;
    x: number;
    y: number;
    width: number;
    height: number;
};
export type ResizeStage = {
    toWidth: number;
    toHeight: number;
};
export declare function resize(blob: Blob, options: Options): Promise<ImageBitmap>;
