import { TaskMessage } from '../client/task-queue'
import { resize } from '..'

self.onmessage = async (event: MessageEvent<TaskMessage>) => {
  const { taskId, blob, options } = event.data

  try {
    const resizedImageBitmap = await resize(blob, options.maxDimension)
    self.postMessage({ taskId, output: resizedImageBitmap }, [resizedImageBitmap])
  } catch (error) {
    self.postMessage({ taskId, error: error as Error })
  }
}
