import { Filter, TileTransform } from '../common';
export declare function createTileTransforms(from: Uint8ClampedArray, fromWidth: number, fromHeight: number, toWidth: number, toHeight: number, initialSize: number, filterPadding: number, filter: Filter, unsharpAmount: number, unsharpRadius: number, unsharpThreshold: number): TileTransform[];
