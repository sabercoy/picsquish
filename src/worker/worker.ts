import { createResizeMetadata } from './createResizeMetadata'
import { TaskMessage, TaskMessage1, TaskMessage2, TaskResult1, TaskResult2, TaskType } from '../client/task-queue'
import { transformTile } from './transformTile'

self.onmessage = async (event: MessageEvent<TaskMessage>) => {
  const { taskId, squishId, taskType } = event.data

  try {
    if (taskType === TaskType.CreateResizeMetadata) {
      const { image, maxDimension, tileOptions } = event.data as TaskMessage1
      const result = await createResizeMetadata({ image, maxDimension, tileOptions })
      
      const taskResult: TaskResult1 = {
        taskId,
        squishId,
        taskType,
        output: {
          from: result.from,
          fromWidth: result.fromWidth,
          fromHeight: result.fromHeight,
          tileTransforms: result.tileTransforms,
          stages: result.stages,
        }
      }

      const tiles = result.tileTransforms.map(tileTransform => tileTransform.tile)

      self.postMessage(taskResult, [result.from, ...tiles])
    }

    if (taskType === TaskType.TransformTile) {
      const { tileTransform } = event.data as TaskMessage2

      tileTransform.tile = transformTile(tileTransform).buffer

      const taskResult: TaskResult2 = {
        taskId,
        squishId,
        taskType,
        output: { tileTransform },
      }

      self.postMessage(taskResult, [tileTransform.tile])
    }
  } catch (error) {
    self.postMessage({ taskId, squishId, taskType, error: error as Error })
  }
}
