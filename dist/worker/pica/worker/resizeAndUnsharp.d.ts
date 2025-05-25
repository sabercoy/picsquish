import { Filter } from '../../..';
export declare function resizeAndUnsharp(filter: Filter, tile: Uint8ClampedArray<ArrayBufferLike>, tileWidth: number, tileHeight: number, tileToWidth: number, tileToHeight: number, tileScaleX: number, tileScaleY: number, tileOffsetX: number, tileOffsetY: number, unsharpAmount: number, unsharpRadius: number, unsharpThreshold: number): Uint8Array<ArrayBuffer>;
