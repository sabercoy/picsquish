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
};
export type PicaBaseOptions = {
    width: number;
    height: number;
    toWidth: number;
    toHeight: number;
    destTileBorder: number;
};
export type PicaOptions = PicaBaseOptions & Required<Pick<Options, 'unsharpAmount' | 'unsharpRadius' | 'unsharpThreshold'>> & {
    filter: Filter;
};
export type PicaTileOptions = {
    width: number;
    height: number;
    toWidth: number;
    toHeight: number;
    scaleX: number;
    scaleY: number;
    offsetX: number;
    offsetY: number;
    filter: Filter;
    unsharpAmount: number;
    unsharpRadius: number;
    unsharpThreshold: number;
    src?: Uint8ClampedArray<ArrayBufferLike>;
    dest?: Uint8Array;
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
export type StageEnv = {
    srcCtx: OffscreenCanvasRenderingContext2D | null;
    srcImageBitmap: ImageBitmap | null;
    isImageBitmapReused: boolean;
    toCtx: OffscreenCanvasRenderingContext2D | null;
};
export type ResizeStage = {
    toWidth: number;
    toHeight: number;
};
export declare function resize(blob: Blob, options: Options): Promise<ImageBitmap>;
