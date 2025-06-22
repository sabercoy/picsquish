import {
  BYTES_PER_PIXEL,
  ResizeStage,
  TaskType,
  TaskId,
  TaskData1,
  TaskResult,
  TaskResult1,
  TaskResult2,
  PendingTask1,
  PendingTask2,
  TaskMessage1,
  TaskMessage2,
} from '../common'
import { placeTile } from './place-tile'
import { workerPool } from './worker-pool'

type SquishContext = {
  maxDimension: TaskData1['maxDimension']
  tileOptions: TaskData1['tileOptions']
  to: Uint8ClampedArray | null
  toWidth: number
  toHeight: number
  stages: ResizeStage[]
  remainingTileCount: number
  resolve: (output: ImageBitmap) => void
  reject: (error: Error) => void
}

const createId = (() => {
  let count = 0
  return () => ++count
})()

class TaskQueue {
  #squishContexts: Map<TaskId, SquishContext>
  #priority1TaskQueue: PendingTask1[]
  #priority2TaskQueue: PendingTask2[]

  constructor() {
    this.#squishContexts = new Map()
    this.#priority1TaskQueue = []
    this.#priority2TaskQueue = []
  }

  #assignPriority1Task(worker: Worker, task: PendingTask1) {
    const taskMessage: TaskMessage1 = {
      taskId: task.id,
      squishId: task.squishId,
      taskType: TaskType.CreateResizeMetadata,
      image: task.data.image,
      maxDimension: task.data.maxDimension,
      tileOptions: task.data.tileOptions,
    }

    workerPool.assignTask(worker, task, taskMessage, [])
  }

  #assignPriority2Task(worker: Worker, task: PendingTask2) {
    const taskMessage: TaskMessage2 = {
      taskId: task.id,
      squishId: task.squishId,
      taskType: TaskType.TransformTile,
      tileTransform: task.data.tileTransform,
    }

    workerPool.assignTask(worker, task, taskMessage, [taskMessage.tileTransform.tile])
  }

  #attemptAssignTask(worker: Worker) {
    const priority1Task = this.#priority1TaskQueue.shift()
    if (priority1Task) return this.#assignPriority1Task(worker, priority1Task)
    const priority2Task = this.#priority2TaskQueue.shift()
    if (priority2Task) return this.#assignPriority2Task(worker, priority2Task)
  }

  #processQueue() {
    const noTasks = this.#priority1TaskQueue.length === 0 && this.#priority2TaskQueue.length === 0
    if (noTasks) return workerPool.setTimeout()

    const availableWorkers = workerPool.getAvailableWorkers()
    for (const availableWorker of availableWorkers) {
      this.#attemptAssignTask(availableWorker)
    }
  }

  #onTask1Complete(squishContext: SquishContext, taskResult: TaskResult1) {
    const { squishId, output } = taskResult

    const toWidth = output.stages[0].toWidth
    const toHeight = output.stages[0].toHeight

    squishContext.to = new Uint8ClampedArray(toWidth * toHeight * BYTES_PER_PIXEL)
    squishContext.toWidth = toWidth
    squishContext.toHeight = toHeight
    squishContext.stages = output.stages
    squishContext.remainingTileCount = output.tileTransforms.length

    for (const tileTransform of output.tileTransforms) {
      this.#priority2TaskQueue.push({
        id: createId(),
        squishId,
        data: { tileTransform },
      })
    }
  }

  #onTask2Complete(squishContext: SquishContext, taskResult: TaskResult2) {
    const { squishId, output } = taskResult
    if (!squishContext.to) throw new Error('Picsquish error: squishContext.to not found')

    placeTile(squishContext.to, squishContext.toWidth, output.tileTransform)
    squishContext.remainingTileCount--

    if (squishContext.remainingTileCount) return undefined

    squishContext.stages.shift()

    if (squishContext.stages[0]) {
      this.#priority1TaskQueue.push({
        id: createId(),
        squishId,
        data: {
          image: {
            from: squishContext.to,
            fromWidth: squishContext.toWidth,
            fromHeight: squishContext.toHeight,
            stages: squishContext.stages,
          },
          maxDimension: squishContext.maxDimension,
          tileOptions: squishContext.tileOptions
        },
      })
    } else {
      const imageData = new ImageData(squishContext.to, squishContext.toWidth, squishContext.toHeight)
      createImageBitmap(imageData).then(imageBitmap => {
        this.#squishContexts.delete(squishId)
        squishContext.resolve(imageBitmap)
      })
    }
  }
  
  #onTaskComplete(event: MessageEvent<TaskResult>) {
    const squishContext = this.#squishContexts.get(event.data.squishId)
    if (!squishContext) throw new Error('Picsquish error: squishContext not found')
    if (event.data.error) squishContext.reject(event.data.error)

    switch (event.data.taskType) {
      case TaskType.CreateResizeMetadata:
        this.#onTask1Complete(squishContext, event.data as TaskResult1)
        break
      case TaskType.TransformTile:
        this.#onTask2Complete(squishContext, event.data as TaskResult2)
        break
    }

    workerPool.removeTask(event.data.taskId)
    this.#processQueue()
  }

  add(taskData: TaskData1, maxWorkerPoolSize: number, maxWorkerPoolIdleTime: number) {
    workerPool.prepare(
      (event: MessageEvent<TaskResult>) => this.#onTaskComplete(event),
      maxWorkerPoolSize,
      maxWorkerPoolIdleTime,
    )

    return new Promise<ImageBitmap>((resolve, reject) => {
      const taskId = createId()
      this.#squishContexts.set(taskId, {
        maxDimension: taskData.maxDimension,
        tileOptions: taskData.tileOptions,
        to: null,
        toWidth: 0,
        toHeight: 0,
        stages: [],
        remainingTileCount: Infinity,
        resolve,
        reject,
      })

      this.#priority1TaskQueue.push({
        id: taskId,
        squishId: taskId,
        data: taskData,
      })

      this.#processQueue()
    })
  }
}

export const taskQueue = new TaskQueue()