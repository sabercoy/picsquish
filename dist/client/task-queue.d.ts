import { Options } from './client';
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
    constructor();
    addTask(taskData: TaskData): Promise<Blob>;
}
export {};
