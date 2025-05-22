import { Options } from '..';
type TaskId = number;
type TaskData = {
    blob: Blob;
    options: Options;
};
export type TaskMessage = TaskData & {
    taskId: TaskId;
};
export declare class TaskQueue {
    #private;
    constructor(maxWorkerPoolSize: number, maxWorkerIdleTime: number);
    addTask(taskData: TaskData): Promise<ImageBitmap>;
}
export {};
