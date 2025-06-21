import { BYTES_PER_PIXEL, WORKER_FILE_NAME, ResizedImage, ResizeStage, TileOptions, TileTransform, TaskType } from '../common'
import { placeTile } from './placeTile'

type TaskId = number

type TaskData1 = {
  image: Blob | ResizedImage
  maxDimension: number
  tileOptions: TileOptions
}

type TaskData2 = {
  tileTransform: TileTransform
}

type TaskResult = {
  taskId: TaskId
  squishId: TaskId
  taskType: TaskType
  error?: Error
}

export type TaskResult1 = TaskResult & {
  output: {
    from: ArrayBufferLike
    fromWidth: number
    fromHeight: number
    tileTransforms: TileTransform[]
    stages: ResizeStage[]
  }
}

export type TaskResult2 = TaskResult & {
  output: {
    tileTransform: TileTransform
  }
}

type PendingTask = {
  id: TaskId
  squishId: TaskId
}

type PendingTask1 = PendingTask & {
  data: TaskData1
}

type PendingTask2 = PendingTask & {
  data: TaskData2
}

export type TaskMessage = {
  taskId: TaskId
  squishId: TaskId
  taskType: TaskType
}

export type TaskMessage1 = TaskMessage & TaskData1
export type TaskMessage2 = TaskMessage & TaskData2

type SquishContext = {
  maxDimension: TaskData1['maxDimension']
  tileOptions: TaskData1['tileOptions']
  from: Uint8ClampedArray | null
  fromWidth: number
  fromHeight: number
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

class WorkerPool {
  #workerToTaskId: Map<Worker, number | null>
  #workerToTimeoutId: Map<Worker, number>
  #taskIdToWorker: Map<number, Worker>
  #taskIdToTask: Map<number, PendingTask>

  constructor() {
    this.#workerToTaskId = new Map()
    this.#workerToTimeoutId = new Map()
    this.#taskIdToWorker = new Map()
    this.#taskIdToTask = new Map()
  }

  get count() {
    return this.#workerToTaskId.size
  }

  #clearWorkerTimeout(worker: Worker) {
    clearTimeout(this.#workerToTimeoutId.get(worker))
  }

  #assignTask(
    worker: Worker,
    task: PendingTask,
    taskMessage: TaskMessage,
    transfer: Transferable[],
  ) {
    this.#workerToTaskId.set(worker, task.id)
    this.#taskIdToWorker.set(task.id, worker)
    this.#taskIdToTask.set(task.id, task)
    worker.postMessage(taskMessage, transfer)
    this.#clearWorkerTimeout(worker)
  }

  assignPriority1Task(worker: Worker, task: PendingTask1) {
    const taskMessage: TaskMessage1 = {
      taskId: task.id,
      squishId: task.squishId,
      taskType: TaskType.CreateResizeMetadata,
      image: task.data.image,
      maxDimension: task.data.maxDimension,
      tileOptions: task.data.tileOptions,
    }

    this.#assignTask(worker, task, taskMessage, [])
  }

  assignPriority2Task(worker: Worker, task: PendingTask2) {
    const taskMessage: TaskMessage2 = {
      taskId: task.id,
      squishId: task.squishId,
      taskType: TaskType.TransformTile,
      tileTransform: task.data.tileTransform,
    }

    this.#assignTask(worker, task, taskMessage, [taskMessage.tileTransform.tile])
  }

  setWorkerTimeout(worker: Worker, duration: number) {
    const id = setTimeout(() => {
      const taskId = this.#workerToTaskId.get(worker)
      if (taskId) this.#taskIdToWorker.delete(taskId)
      if (taskId) this.#taskIdToTask.delete(taskId!)
      this.#workerToTimeoutId.delete(worker)
      this.#workerToTaskId.delete(worker)
      worker.terminate()
    }, duration)

    this.#workerToTimeoutId.set(worker, id)
  }

  addWorker(worker: Worker) {
    this.#workerToTaskId.set(worker, null)
  }

  getWorker(taskId: number) {
    return this.#taskIdToWorker.get(taskId)
  }

  getTask(taskId: number) {
    return this.#taskIdToTask.get(taskId)
  }

  getAvailableWorker() {
    for (const [worker, taskId] of this.#workerToTaskId.entries()) {
      if (taskId === null) return worker
    }

    return null
  }

  removeTask(taskId: number) {
    const worker = this.#taskIdToWorker.get(taskId)
    if (worker) this.#workerToTaskId.set(worker, null)
    this.#taskIdToWorker.delete(taskId)
    this.#taskIdToTask.delete(taskId)
  }
}

export class TaskQueue {
  #maxIdleTime: number
  #maxPoolSize: number
  #squishContexts: Map<TaskId, SquishContext>
  #priority1TaskQueue: PendingTask1[]
  #priority2TaskQueue: PendingTask2[]
  #workerPool: WorkerPool

  constructor(
    maxWorkerPoolSize: number,
    maxWorkerIdleTime: number,
  ) {
    this.#maxPoolSize = maxWorkerPoolSize
    this.#maxIdleTime = maxWorkerIdleTime
    this.#squishContexts = new Map()
    this.#priority1TaskQueue = []
    this.#priority2TaskQueue = []
    this.#workerPool = new WorkerPool()
  }

  #createWorker() {
    const worker = new Worker(new URL(`./${WORKER_FILE_NAME}.js`, import.meta.url))

    worker.onmessage = (event: MessageEvent<TaskResult>) => {
      const squishContext = this.#squishContexts.get(event.data.squishId)
      if (!squishContext) throw new Error('SquishContext not found')
      if (event.data.error) squishContext.reject(event.data.error)

      if (event.data.taskType === TaskType.CreateResizeMetadata) {
        const { squishId, output } = event.data as TaskResult1

        const toWidth = output.stages[0].toWidth
        const toHeight = output.stages[0].toHeight

        squishContext.from = new Uint8ClampedArray(output.from)
        squishContext.fromWidth = output.fromWidth
        squishContext.fromHeight = output.fromHeight
        squishContext.to = new Uint8ClampedArray(toWidth * toHeight * BYTES_PER_PIXEL)
        squishContext.toWidth = toWidth
        squishContext.toHeight = toHeight
        squishContext.stages = output.stages
        squishContext.remainingTileCount = output.tileTransforms.length

        for (const tileTransform of output.tileTransforms) {
          this.#priority2TaskQueue.push({
            id: createId(),
            squishId,
            data: {
              tileTransform,
            },
          })
          this.#processQueue()
        }
      }

      if (event.data.taskType === TaskType.TransformTile) {
        const { taskId, squishId, output } = event.data as TaskResult2
        if (!squishContext.to) throw new Error('SquishContext to not found')

        placeTile(squishContext.to, squishContext.toWidth, output.tileTransform)
        squishContext.remainingTileCount--

        if (!squishContext.remainingTileCount) {
          squishContext.stages.shift()
          if (squishContext.stages[0]) {
            this.#priority1TaskQueue.push({
              id: taskId,
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
              this.#squishContexts.delete(event.data.squishId)
              squishContext.resolve(imageBitmap)
            })
          }
        }
      }

      const finishedWorker = this.#workerPool.getWorker(event.data.taskId)
      if (finishedWorker) this.#workerPool.setWorkerTimeout(finishedWorker, this.#maxIdleTime)
      this.#workerPool.removeTask(event.data.taskId)
      this.#processQueue()
    }

    this.#workerPool.addWorker(worker)
  }

  #processQueue() {
    const availableWorker = this.#workerPool.getAvailableWorker()

    if (availableWorker) {
      const priority1Task = this.#priority1TaskQueue.shift()
      if (priority1Task) return this.#workerPool.assignPriority1Task(availableWorker, priority1Task)

      const priority2Task = this.#priority2TaskQueue.shift()
      if (priority2Task) return this.#workerPool.assignPriority2Task(availableWorker, priority2Task)
    } else if (this.#workerPool.count < this.#maxPoolSize) {
      this.#createWorker()
      this.#processQueue()
    }
  }

  add(taskData: TaskData1) {
    return new Promise<ImageBitmap>((resolve, reject) => {
      const taskId = createId()
      this.#squishContexts.set(taskId, {
        maxDimension: taskData.maxDimension,
        tileOptions: taskData.tileOptions,
        from: null,
        fromWidth: 0,
        fromHeight: 0,
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
