import { Options } from '..';
export declare class PicSquish {
    #private;
    constructor(options: Options);
    squish(blob: Blob, options?: Options): Promise<ImageBitmap>;
}
