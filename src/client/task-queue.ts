import { Options } from './client'

const workerCode = '<WORKER_CODE>'
const workerBlob = new Blob([workerCode], { type: 'application/javascript' })

type TaskId = number

type TaskData = {
  blob: Blob
  options: Options
}

type PendingTask = {
  id: TaskId
  data: TaskData
  resolve: (resizedBlob: Blob) => void
  reject: (error: Error) => void
}

export type TaskMessage = TaskData & {
  taskId: TaskId
}

type TaskResult = {
  taskId: TaskId
  output: Blob
  error: Error
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

  clearWorkerTimeout(worker: Worker) {
    clearTimeout(this.#workerToTimeoutId.get(worker))
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

  assignTask(worker: Worker, task: PendingTask) {
    this.#workerToTaskId.set(worker, task.id)
    this.#taskIdToWorker.set(task.id, worker)
    this.#taskIdToTask.set(task.id, task)

    const taskMessage: TaskMessage = {
      taskId: task.id,
      blob: task.data.blob,
      options: task.data.options
    }

    worker.postMessage(taskMessage)
  }

  removeTask(taskId: number) {
    const worker = this.#taskIdToWorker.get(taskId)
    if (worker) this.#workerToTaskId.set(worker, null)
    this.#taskIdToWorker.delete(taskId)
    this.#taskIdToTask.delete(taskId)
  }
}

export class TaskQueue {
  #maxIdle: number
  #maxPoolSize: number
  #taskQueue: PendingTask[]
  #pool: WorkerPool

  constructor() {
    this.#maxIdle = 2000
    this.#maxPoolSize = Math.min(navigator.hardwareConcurrency || 1, 4)
    this.#taskQueue = []
    this.#pool = new WorkerPool()
  }

  #createWorker() {
    const worker = new Worker(URL.createObjectURL(workerBlob))

    worker.onmessage = (event: MessageEvent<TaskResult>) => {
      const { taskId, output, error } = event.data
      const finishedWorker = this.#pool.getWorker(taskId)
      const pendingTask = this.#pool.getTask(taskId)

      if (error) {
        if (pendingTask) pendingTask.reject(error)
      } else {
        if (pendingTask) pendingTask.resolve(output)
      }

      this.#pool.removeTask(taskId)
      if (finishedWorker) this.#pool.setWorkerTimeout(finishedWorker, this.#maxIdle)
      this.#processQueue()
    }

    worker.onerror = (error) => {
      // TODO
      console.log(error.message)
      console.log(error)
    }

    this.#pool.addWorker(worker)
  }

  #processQueue() {
    const availableWorker = this.#pool.getAvailableWorker()

    if (availableWorker) {
      const task = this.#taskQueue.shift()

      if (task) {
        this.#pool.assignTask(availableWorker, task)
        this.#pool.clearWorkerTimeout(availableWorker)
      }
    } else if (this.#pool.count < this.#maxPoolSize) {
      this.#createWorker()
      this.#processQueue()
    }
  }

  addTask(taskData: TaskData) {
    return new Promise<TaskResult['output']>((resolve, reject) => {
      this.#taskQueue.push({
        id: createId(),
        data: {
          blob: taskData.blob,
          options: taskData.options,
        },
        resolve,
        reject
      })

      this.#processQueue()
    })
  }
}