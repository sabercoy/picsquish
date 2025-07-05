import { TaskData1 } from '../common';
declare class SquishResult {
    raw: Uint8ClampedArray<ArrayBuffer>;
    width: number;
    height: number;
    constructor(raw: Uint8ClampedArray<ArrayBuffer>, width: number, height: number);
    toImageData(): ImageData;
    toImageBitmap(): Promise<ImageBitmap>;
    toCanvas(): HTMLCanvasElement;
    toBlob(type?: string): Promise<Blob>;
}
declare class TaskQueue {
    #private;
    constructor();
    add(taskData: TaskData1, maxWorkerPoolSize: number, maxWorkerPoolIdleTime: number, useMainThread: boolean): Promise<SquishResult>[];
}
export declare const taskQueue: TaskQueue;
export {};
