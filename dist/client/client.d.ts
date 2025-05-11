export type Options = {
    maxDimension: number;
    useMainThread?: boolean;
};
export declare class PicSquish {
    #private;
    constructor(options: Options);
    squish(blob: Blob, options?: Options): Promise<any>;
}
