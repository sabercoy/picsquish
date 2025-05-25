import { Filter, TileData } from '../../..';
export declare const resizeTile: (tileData: TileData, from: ImageBitmap | OffscreenCanvas, filter: Filter, unsharpAmount: number, unsharpRadius: number, unsharpThreshold: number) => Uint8Array<ArrayBuffer>;
