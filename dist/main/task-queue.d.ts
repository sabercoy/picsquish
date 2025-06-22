import { TaskData1 } from '../common';
declare class TaskQueue {
    #private;
    constructor();
    add(taskData: TaskData1, maxWorkerPoolSize: number, maxWorkerPoolIdleTime: number): Promise<ImageBitmap>;
}
export declare const taskQueue: TaskQueue;
export {};
