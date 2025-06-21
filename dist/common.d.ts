export declare const MAIN_FILE_NAME = "picsquish";
export declare const WORKER_FILE_NAME = "picsquish-worker";
export declare const DEMO_PATH = "demo";
export declare const FINAL_PATH = "dist";
export declare const BYTES_PER_PIXEL = 4;
export type Filter = 'box' | 'hamming' | 'lanczos2' | 'lanczos3' | 'mks2013';
export type TileOptions = {
    initialSize: number;
    filterPadding: number;
    filter: Filter;
    unsharpAmount: number;
    unsharpRadius: number;
    unsharpThreshold: number;
};
export type Options = {
    maxDimension: number;
    useMainThread?: boolean;
    maxWorkerPoolSize?: number;
    maxWorkerIdleTime?: number;
    tileSize?: TileOptions['initialSize'];
    filter?: TileOptions['filter'];
    unsharpAmount?: TileOptions['unsharpAmount'];
    unsharpRadius?: TileOptions['unsharpRadius'];
    unsharpThreshold?: TileOptions['unsharpThreshold'];
};
export type ResizeStage = {
    toWidth: number;
    toHeight: number;
};
export type TileTransform = {
    tile: ArrayBuffer;
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
    initialSize: number;
    filterPadding: number;
    filter: Filter;
    unsharpAmount: number;
    unsharpRadius: number;
    unsharpThreshold: number;
};
export type ResizedImage = {
    from: Uint8ClampedArray;
    fromWidth: number;
    fromHeight: number;
    stages: ResizeStage[];
};
export type CreateResizeMetadataParams = {
    image: Blob | ResizedImage;
    maxDimension: number;
    tileOptions: TileOptions;
};
export declare enum TaskType {
    CreateResizeMetadata = 0,
    TransformTile = 1,
    FinalizeImage = 2
}
