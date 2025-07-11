import { InitialImage, ResizedImage, ResizeStage, TileOptions, TileTransform } from '../common';
type CreateResizeMetadataParams = {
    image: InitialImage | ResizedImage;
    dimensionLimits: number[];
    tileOptions: TileOptions;
};
type ResizeMetadata = {
    tileTransforms: TileTransform[];
    stages: ResizeStage[];
};
export declare function createResizeMetadata(params: CreateResizeMetadataParams): Promise<ResizeMetadata[]>;
export {};
