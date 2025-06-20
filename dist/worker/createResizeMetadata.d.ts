import { CreateResizeMetadataParams, ResizeStage } from '..';
export declare function createResizeMetadata(params: CreateResizeMetadataParams): Promise<{
    from: ArrayBufferLike;
    fromWidth: number;
    fromHeight: number;
    tileTransforms: import("..").TileTransform[];
    stages: ResizeStage[];
}>;
