import { TileTransform } from '../common';
export declare function extractTile(from: Uint8ClampedArray, fromWidth: number, tileTransform: Omit<TileTransform, 'tile'>): Uint8ClampedArray<ArrayBuffer>;
