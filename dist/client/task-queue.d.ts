import { ResizeStage, TileOptions, TileTransform } from '..';
type TaskId = number;
export declare enum TaskType {
    CreateResizeMetadata = 0,
    TransformTile = 1,
    FinalizeImage = 2
}
type TaskData1 = {
    blob: Blob;
    maxDimension: number;
    tileOptions: TileOptions;
};
type TaskData2 = {
    tileTransform: TileTransform;
    from: SharedArrayBuffer;
    fromWidth: number;
    to: SharedArrayBuffer;
    toWidth: number;
};
type TaskResult = {
    taskId: TaskId;
    squishId: TaskId;
    taskType: TaskType;
    error?: Error;
};
export type TaskResult1 = TaskResult & {
    output: {
        from: SharedArrayBuffer;
        fromWidth: number;
        fromHeight: number;
        to: SharedArrayBuffer;
        tileTransforms: TileTransform[];
        stages: ResizeStage[];
    };
};
export type TaskResult2 = TaskResult;
export type TaskMessage = {
    taskId: TaskId;
    squishId: TaskId;
    taskType: TaskType;
};
export type TaskMessage1 = TaskMessage & TaskData1;
export type TaskMessage2 = TaskMessage & TaskData2;
export declare class TaskQueue {
    #private;
    constructor(maxWorkerPoolSize: number, maxWorkerIdleTime: number);
    add(taskData: TaskData1): Promise<ImageBitmap>;
}
export {};
