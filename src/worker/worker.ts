import {
  TaskType,
  TaskMessage,
  TaskMessage1,
  TaskMessage2,
  TaskResult1,
  TaskResult2,
} from '../common'
import { createResizeMetadata } from './create-resize-metadata'
import { transformTile } from './transform-tile'

async function onTask1Message(taskMessage: TaskMessage1) {
  const { taskId, squishId, taskType, data } = taskMessage
  const { image, dimensionLimits, tileOptions } = data
  
  const output = await createResizeMetadata({ image, dimensionLimits, tileOptions })
  
  const taskResult: TaskResult1 = {
    taskId,
    squishId,
    taskType,
    output,
  }

  const tiles = output.flatMap(resizeMetadata => resizeMetadata.tileTransforms.map(tileTransform => tileTransform.tile))

  self.postMessage(taskResult, tiles)
}

function onTask2Message(taskMessage: TaskMessage2) {
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

  self.postMessage(taskResult, [tileTransform.tile])
}

self.onmessage = async (event: MessageEvent<TaskMessage>) => {
  switch (event.data.taskType) {
    case TaskType.CreateResizeMetadata: {
      const taskMessage = event.data as TaskMessage1
      try {
        return await onTask1Message(taskMessage)
      } catch (error) {
        return self.postMessage({
          taskId: taskMessage.taskId,
          squishId: taskMessage.squishId,
          taskType: taskMessage.taskType,
          error: error as Error
        })
      }
    }
    case TaskType.TransformTile: {
      const taskMessage = event.data as TaskMessage2
      try {
        return onTask2Message(taskMessage)
      } catch (error) {
        return self.postMessage({
          taskId: taskMessage.taskId,
          squishId: taskMessage.squishId,
          workspaceIndex: taskMessage.workspaceIndex,
          taskType: taskMessage.taskType,
          error: error as Error
        })
      }
    }
  }
}
