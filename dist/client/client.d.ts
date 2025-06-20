import { Options } from '..';
export declare class PicSquish {
    #private;
    constructor(globalOptions: Options);
    squish(blob: Blob, localOptions?: Options): Promise<ImageBitmap>;
}
