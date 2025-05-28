import { Options } from '..';
export declare class PicSquish {
    #private;
    constructor(options: Options);
    squish(blob: Blob, localOptions?: Options): Promise<ImageBitmap | {
        from: SharedArrayBuffer;
        fromWidth: number;
        fromHeight: number;
        to: SharedArrayBuffer;
        tileTransforms: import("..").TileTransform[];
        stages: import("..").ResizeStage[];
    }>;
}
