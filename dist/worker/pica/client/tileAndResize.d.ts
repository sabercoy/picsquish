import { Filter } from '../../..';
export declare function tileAndResize(from: ImageBitmap | OffscreenCanvas, to: ImageBitmap | OffscreenCanvas, width: number, height: number, toWidth: number, toHeight: number, srcTileSize: number, destTileBorder: number, filter: Filter, unsharpAmount: number, unsharpRadius: number, unsharpThreshold: number): Promise<ImageBitmap | OffscreenCanvas>;
