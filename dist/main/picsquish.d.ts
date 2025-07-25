import { InitialImage, SquishResult, TileOptions } from '../common';
export type Options = {
    useMainThread?: boolean;
    maxWorkerPoolSize?: number;
    maxWorkerIdleTime?: number;
    tileSize?: TileOptions['initialSize'];
    filter?: TileOptions['filter'];
    unsharpAmount?: TileOptions['unsharpAmount'];
    unsharpRadius?: TileOptions['unsharpRadius'];
    unsharpThreshold?: TileOptions['unsharpThreshold'];
};
export declare function squish(image: InitialImage, dimensionLimits: number, options?: Options): Promise<SquishResult>;
export declare function squish(image: InitialImage, dimensionLimits: number[], options?: Options): Promise<SquishResult>[];
