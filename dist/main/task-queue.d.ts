import { ResizedImage, ResizeStage, TileOptions, TileTransform, TaskType } from '../common';
type TaskId = number;
type TaskData1 = {
    image: Blob | ResizedImage;
    maxDimension: number;
    tileOptions: TileOptions;
};
type TaskData2 = {
    tileTransform: TileTransform;
};
type TaskResult = {
    taskId: TaskId;
    squishId: TaskId;
    taskType: TaskType;
    error?: Error;
};
export type TaskResult1 = TaskResult & {
    output: {
        from: ArrayBufferLike;
        fromWidth: number;
        fromHeight: number;
        tileTransforms: TileTransform[];
        stages: ResizeStage[];
    };
};
export type TaskResult2 = TaskResult & {
    output: {
        tileTransform: TileTransform;
    };
};
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
