import { TaskData1, SquishResult } from '../common';
declare class TaskQueue {
    #private;
    constructor();
    add(taskData: TaskData1, maxWorkerPoolSize: number, maxWorkerPoolIdleTime: number, useMainThread: boolean): Promise<SquishResult>[];
}
export declare const taskQueue: TaskQueue;
export {};
