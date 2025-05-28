import { createResizeMetadata, TileTransform } from '..'
import { TaskMessage, TaskMessage1, TaskMessage2, TaskResult1, TaskResult2, TaskType } from '../client/task-queue'
import { transformTile } from './pica/worker/transformTile'
import { placeTransformedTile } from './pica/client/placeTransformedTile'
import { extractTile } from './pica/client/extractTile'

self.onmessage = async (event: MessageEvent<TaskMessage>) => {
  const { taskId, squishId, taskType } = event.data

  try {
    if (taskType === TaskType.CreateResizeMetadata) {
      const { blob, maxDimension, tileOptions } = event.data as TaskMessage1
      const result = await createResizeMetadata(blob, maxDimension, tileOptions)
      const taskResult: TaskResult1 = {
        taskId,
        squishId,
        taskType,
        output: {
          from: result.from,
          fromWidth: result.fromWidth,
          fromHeight: result.fromHeight,
          to: result.to,
          tileTransforms: result.tileTransforms,
          stages: result.stages,
        }
      }
      
      self.postMessage(taskResult)
    }

    if (taskType === TaskType.TransformTile) {
      const { tileTransform, from, fromWidth, to, toWidth } = event.data as TaskMessage2

      const tile = extractTile(from, fromWidth, tileTransform)
      const transformedTile = transformTile(tile, tileTransform)
      placeTransformedTile(to, toWidth, tileTransform, transformedTile)

      const taskResult: TaskResult2 = {
        taskId,
        squishId,
        taskType,
      }

      self.postMessage(taskResult)
    }
  } catch (error) {
    self.postMessage({ taskId, error: error as Error })
  }
}
