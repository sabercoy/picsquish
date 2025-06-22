import { TileTransform } from '../common';
export declare function extractTile(from: ImageBitmap | Uint8ClampedArray, fromWidth: number, tileTransform: Omit<TileTransform, 'tile'>): ArrayBuffer;
