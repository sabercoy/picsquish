import { TaskType, TaskMessage, TaskMessage1, TaskMessage2 } from '../common'
import { onTask1Message, onTask2Message } from './on-task-message'

self.onmessage = async (event: MessageEvent<TaskMessage>) => {
  switch (event.data.taskType) {
    case TaskType.CreateResizeMetadata: {
      const taskMessage = event.data as TaskMessage1
      const taskResult = await onTask1Message(taskMessage)
      const tiles = taskResult.output instanceof Error ? [] : taskResult.output.flatMap(m => m.tileTransforms.map(t => t.tile))
      return self.postMessage(taskResult, tiles)
    }
    case TaskType.TransformTile: {
      const taskMessage = event.data as TaskMessage2
      const taskResult = onTask2Message(taskMessage)
      const tiles = taskResult.output instanceof Error ? [] : [taskResult.output.tile]
      return self.postMessage(taskResult, tiles)
    }
  }
}
