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
export declare function createResizeMetadata(blob: Blob, maxDimension: number, tileOptions: TileOptions): Promise<{
    from: SharedArrayBuffer;
    fromWidth: number;
    fromHeight: number;
    to: SharedArrayBuffer;
    tileTransforms: TileTransform[];
    stages: ResizeStage[];
}>;
