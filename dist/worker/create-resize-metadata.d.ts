import { CreateResizeMetadataParams, ResizeStage } from '../common';
export declare function createResizeMetadata(params: CreateResizeMetadataParams): Promise<{
    from: ArrayBufferLike;
    fromWidth: number;
    fromHeight: number;
    tileTransforms: import("../common").TileTransform[];
    stages: ResizeStage[];
}>;
