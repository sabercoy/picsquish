import { TaskType, TaskMessage, TaskMessage1, TaskMessage2 } from '../common'
import { onTask1Message, onTask2Message } from './on-task-message'

self.onmessage = async (event: MessageEvent<TaskMessage>) => {
  switch (event.data.taskType) {
    case TaskType.CreateResizeMetadata: {
      const taskMessage = event.data as TaskMessage1
      try {
        const taskResult = await onTask1Message(taskMessage)
        const tiles = taskResult.output.flatMap(resizeMetadata => resizeMetadata.tileTransforms.map(t => t.tile))
        return self.postMessage(taskResult, tiles)
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
        const taskResult = onTask2Message(taskMessage)
        const tile = taskResult.output.tileTransform.tile
        return self.postMessage(taskResult, [tile])
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
