import { TaskMessage1, TaskMessage2, TaskResult1, TaskResult2 } from '../common'
import { createResizeMetadata } from './create-resize-metadata'
import { transformTile } from './transform-tile'

export async function onTask1Message(taskMessage: TaskMessage1) {
  const { taskId, squishId, taskType, data } = taskMessage
  const { image, dimensionLimits, tileOptions } = data
  
  const output = await createResizeMetadata({ image, dimensionLimits, tileOptions })
  
  const taskResult: TaskResult1 = {
    taskId,
    squishId,
    taskType,
    output,
  }

  return taskResult
}

export function onTask2Message(taskMessage: TaskMessage2) {
  const { taskId, squishId, workspaceIndex, taskType, data } = taskMessage
  const { tileTransform } = data

  tileTransform.tile = transformTile(tileTransform).buffer

  const taskResult: TaskResult2 = {
    taskId,
    squishId,
    workspaceIndex,
    taskType,
    output: { tileTransform },
  }

  return taskResult
}
