import { DimensionLimit, ResizedImage, ResizeStage, TileOptions, TileTransform } from '../common';
type CreateResizeMetadataParams = {
    image: Blob | ResizedImage;
    dimensionLimits: DimensionLimit[];
    tileOptions: TileOptions;
};
type ResizeMetadata = {
    tileTransforms: TileTransform[];
    stages: ResizeStage[];
};
export declare function createResizeMetadata(params: CreateResizeMetadataParams): Promise<ResizeMetadata[]>;
export {};
