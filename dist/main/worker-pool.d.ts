import { TaskMessage, TaskResult, TaskId } from '../common';
declare class WorkerPool {
    #private;
    constructor();
    prepare(onmessage: (event: MessageEvent<TaskResult>) => void, maxSize: number, maxIdleTime: number): undefined;
    assignTask(worker: Worker, taskId: TaskId, taskMessage: TaskMessage, transfer: Transferable[]): void;
    setTimeout(): undefined;
    getAvailableWorkers(): Worker[];
    removeTask(taskId: number): void;
}
export declare const workerPool: WorkerPool;
export {};
