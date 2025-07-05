import { TaskMessage1, TaskMessage2, TaskResult1, TaskResult2 } from '../common';
export declare function onTask1Message(taskMessage: TaskMessage1): Promise<TaskResult1>;
export declare function onTask2Message(taskMessage: TaskMessage2): TaskResult2;
