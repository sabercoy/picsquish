import { Filter, TileData } from '../../..';
export declare const processTile: (tileData: TileData, from: ImageBitmap | OffscreenCanvas, filter: Filter, unsharpAmount: number, unsharpRadius: number, unsharpThreshold: number, toContext: OffscreenCanvasRenderingContext2D) => void;
