export declare const BYTES_PER_PIXEL = 4;
export declare class SquishResult {
    raw: Uint8ClampedArray<ArrayBuffer>;
    width: number;
    height: number;
    constructor(raw: Uint8ClampedArray<ArrayBuffer>, width: number, height: number);
    toImageData(): ImageData;
    toImageBitmap(): Promise<ImageBitmap>;
    toCanvas(): HTMLCanvasElement;
    toBlob(type?: string): Promise<Blob>;
}
export type InitialImage = Blob | ImageBitmap;
export type Filter = 'box' | 'hamming' | 'lanczos2' | 'lanczos3' | 'mks2013';
export type TileOptions = {
    initialSize: number;
    filterPadding: number;
    filter: Filter;
    unsharpAmount: number;
    unsharpRadius: number;
    unsharpThreshold: number;
};
export type ResizeStage = {
    toWidth: number;
    toHeight: number;
};
export type TileTransform = {
    tile: ArrayBuffer;
    toX: number;
    toY: number;
    toWidth: number;
    toHeight: number;
    toInnerX: number;
    toInnerY: number;
    toInnerWidth: number;
    toInnerHeight: number;
    offsetX: number;
    offsetY: number;
    scaleX: number;
    scaleY: number;
    x: number;
    y: number;
    width: number;
    height: number;
    initialSize: number;
    filterPadding: number;
    filter: Filter;
    unsharpAmount: number;
    unsharpRadius: number;
    unsharpThreshold: number;
};
export type ResizedImage = {
    from: Uint8ClampedArray;
    fromWidth: number;
    fromHeight: number;
    stages: ResizeStage[];
};
export declare enum TaskType {
    CreateResizeMetadata = 0,
    TransformTile = 1
}
export type TaskId = number;
export type TaskData1 = {
    image: InitialImage | ResizedImage;
    maxDimension: number;
    tileOptions: TileOptions;
};
type TaskData2 = {
    tileTransform: TileTransform;
};
export type TaskMessage = {
    taskId: TaskId;
    squishId: TaskId;
    taskType: TaskType;
};
export type TaskMessage1 = TaskMessage & TaskData1;
export type TaskMessage2 = TaskMessage & TaskData2;
export type PendingTask = {
    id: TaskId;
    squishId: TaskId;
};
export type PendingTask1 = PendingTask & {
    data: TaskData1;
};
export type PendingTask2 = PendingTask & {
    data: TaskData2;
};
export type TaskResult = {
    taskId: TaskId;
    squishId: TaskId;
    taskType: TaskType;
    error?: Error;
};
export type TaskResult1 = TaskResult & {
    output: {
        tileTransforms: TileTransform[];
        stages: ResizeStage[];
    };
};
export type TaskResult2 = TaskResult & {
    output: {
        tileTransform: TileTransform;
    };
};
export {};
