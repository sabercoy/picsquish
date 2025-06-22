import { InitialImage, SquishResult, TileOptions } from '../common';
type Options = {
    useMainThread?: boolean;
    maxWorkerPoolSize?: number;
    maxWorkerIdleTime?: number;
    tileSize?: TileOptions['initialSize'];
    filter?: TileOptions['filter'];
    unsharpAmount?: TileOptions['unsharpAmount'];
    unsharpRadius?: TileOptions['unsharpRadius'];
    unsharpThreshold?: TileOptions['unsharpThreshold'];
};
export declare function squish(image: InitialImage, maxDimension: number, options?: Options): Promise<SquishResult>;
export {};
