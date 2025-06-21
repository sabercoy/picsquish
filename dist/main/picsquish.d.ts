import { Options } from '../common';
export declare class PicSquish {
    #private;
    constructor(globalOptions: Options);
    squish(blob: Blob, localOptions?: Options): Promise<ImageBitmap>;
}
