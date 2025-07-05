import { TaskMessage1, TaskMessage2, TaskResult1, TaskResult2 } from '../common'
import { createResizeMetadata } from './create-resize-metadata'
import { transformTile } from './transform-tile'

export async function onTask1Message(taskMessage: TaskMessage1): Promise<TaskResult1> {
  const { taskId, squishId, taskType, data } = taskMessage
  const { image, dimensionLimits, tileOptions } = data

  try {
    const output = await createResizeMetadata({ image, dimensionLimits, tileOptions })
    return { taskId, squishId, taskType, output }
  } catch (error) {
    return { taskId, squishId, taskType, output: error as Error }
  }
}

export function onTask2Message(taskMessage: TaskMessage2): TaskResult2 {
  const { taskId, squishId, workspaceIndex, taskType, data } = taskMessage
  const { tileTransform } = data

  try {
    tileTransform.tile = transformTile(tileTransform).buffer
    return { taskId, squishId, workspaceIndex, taskType, output: tileTransform }
  } catch (error) {
    return { taskId, squishId, workspaceIndex, taskType, output: error as Error }
  }
}
