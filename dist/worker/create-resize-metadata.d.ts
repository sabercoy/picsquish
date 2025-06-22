import { InitialImage, ResizedImage, ResizeStage, TileOptions } from '../common';
type CreateResizeMetadataParams = {
    image: InitialImage | ResizedImage;
    maxDimension: number;
    tileOptions: TileOptions;
};
export declare function createResizeMetadata(params: CreateResizeMetadataParams): Promise<{
    tileTransforms: import("../common").TileTransform[];
    stages: ResizeStage[];
}>;
export {};
