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

const onTask1Message = async (taskMessage: TaskMessage1) => {
  const { taskId, squishId, taskType, image, maxDimension, tileOptions } = taskMessage
  
  const { tileTransforms, stages } = await createResizeMetadata({ image, maxDimension, tileOptions })
  
  const taskResult: TaskResult1 = {
    taskId,
    squishId,
    taskType,
    output: { tileTransforms, stages },
  }

  const tiles = tileTransforms.map(tileTransform => tileTransform.tile)

  self.postMessage(taskResult, tiles)
}

function onTask2Message(taskMessage: TaskMessage2) {
  const { taskId, squishId, taskType, tileTransform } = taskMessage

  tileTransform.tile = transformTile(tileTransform).buffer

  const taskResult: TaskResult2 = {
    taskId,
    squishId,
    taskType,
    output: { tileTransform },
  }

  self.postMessage(taskResult, [tileTransform.tile])
}

self.onmessage = async (event: MessageEvent<TaskMessage>) => {
  try {
    switch (event.data.taskType) {
      case TaskType.CreateResizeMetadata: return onTask1Message(event.data as TaskMessage1)
      case TaskType.TransformTile: return onTask2Message(event.data as TaskMessage2)
    }
  } catch (error) {
    self.postMessage({
      taskId: event.data.taskId,
      squishId: event.data.squishId,
      taskType: event.data.taskType,
      error: error as Error
    })
  }
}
