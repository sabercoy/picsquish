import { Filter } from '../../..';
export declare function tileAndResize(from: ImageBitmap | OffscreenCanvas, to: OffscreenCanvas, srcTileSize: number, destTileBorder: number, filter: Filter, unsharpAmount: number, unsharpRadius: number, unsharpThreshold: number): Promise<void>;
