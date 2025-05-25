import { Filter, ResizeStage } from '../../..';
export declare function processStages(stages: ResizeStage[], original: ImageBitmap, srcTileSize: number, destTileBorder: number, filter: Filter, unsharpAmount: number, unsharpRadius: number, unsharpThreshold: number): Promise<OffscreenCanvas>;
